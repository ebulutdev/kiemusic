import { NextResponse } from "next/server";
import { verifyKieWebhook } from "@/lib/webhook";
import { getTask, setResults, failTask, updateTask } from "@/lib/data/tasks";
import { normalizeResults, stemResults, extraResult } from "@/lib/results";
import type { TaskStatus } from "@/lib/data/schema";
import { applyExtra } from "@/lib/data/extras";

export const runtime = "nodejs";

// Müzik: callbackType text → first → complete | error
// Stem ayırma: callbackType yok, data.vocal_removal_info | vocal_separation_info
// Persona / ses: data.taskId (camelCase), persona_id / validateInfo / voiceId
// Hata kodları: 400 telifli söz, 413 eşleşen eser, 501 başarısız, 531 başarısız (kredi iade)
const STATUS: Record<string, TaskStatus> = { text: "TEXT_READY", first: "FIRST_READY", complete: "COMPLETED" };
const FAIL_CODES = new Set([400, 408, 413, 500, 501, 531]);

export async function POST(request: Request) {
  try {
    const body = JSON.parse(await request.text());
    const d = body?.data ?? {};
    const taskId: string | undefined = d.task_id ?? d.taskId;
    if (!taskId) return NextResponse.json({ success: false, error: "task_id eksik" });

    // HMAC doğrulama (production'da zorunlu)
    if (process.env.KIE_WEBHOOK_HMAC_KEY) {
      const timestamp = request.headers.get("X-Webhook-Timestamp");
      const signature = request.headers.get("X-Webhook-Signature");
      if (!timestamp || !signature)
        return NextResponse.json({ success: false, error: "Webhook imzası eksik" }, { status: 401 });
      if (!verifyKieWebhook(taskId, timestamp, signature))
        return NextResponse.json({ success: false, error: "Geçersiz webhook imzası" }, { status: 401 });
    }

    // Belge id = KIE taskId → sorgusuz tek okuma
    const task = await getTask(taskId);
    if (!task) return NextResponse.json({ success: true, ignored: true }); // webhook fırtınasını engelle
    if (task.status === "COMPLETED" || task.status === "FAILED") return NextResponse.json({ success: true });

    const callbackType: string | undefined = d.callbackType;
    if (callbackType === "error" || FAIL_CODES.has(Number(body.code))) {
      await failTask(taskId, String(body.code ?? "UNKNOWN"), body.msg ?? "KIE işlemi başarısız.");
      return NextResponse.json({ success: true });
    }

    if (["persona", "voice-phrase", "voice"].includes(task.taskType)) {
      const extra = extraResult(d);
      if (extra && /fail/.test(String(extra.status))) {
        await failTask(taskId, "", String(extra.error || "İşlem başarısız"));
        await applyExtra(task, true);
      } else if (extra) {
        const done = !!(extra.personaId || extra.phrase || extra.voiceId);
        await updateTask(taskId, { extra, status: done ? "COMPLETED" : task.status });
        if (done) await applyExtra({ ...task, extra });
      }
      return NextResponse.json({ success: true });
    }

    if (task.taskType === "remove-vocals") {
      const stems = stemResults(d);
      if (stems.length) await setResults(taskId, "COMPLETED", stems, "complete");
      else await failTask(taskId, String(body.code ?? ""), body.msg ?? "Stem ayırma başarısız.");
      return NextResponse.json({ success: true });
    }

    const status = (callbackType && STATUS[callbackType]) || task.status;
    await setResults(taskId, status, normalizeResults(d.data ?? []), callbackType);
    // Medya kopyalama burada yapılmaz (15 sn sınırı) — ilk durum sorgusunda yapılır.
    return NextResponse.json({ success: true }); // KIE 15 sn içinde 200 bekler
  } catch (error) {
    console.error("CALLBACK_ERROR", error);
    return NextResponse.json({ success: true }); // retry fırtınasını engelle
  }
}
