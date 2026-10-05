import { NextResponse } from "next/server";
import { getKieTask, getMusicTaskDetail } from "@/lib/kie";
import { requireUser, errorResponse, publicMessage } from "@/lib/auth";
import { getTask, setResults, failTask, updateTask } from "@/lib/data/tasks";
import { mirrorIfNeeded } from "@/lib/data/mirror";
import { applyExtra } from "@/lib/data/extras";
import { normalizeResults, stemResults, extraResult } from "@/lib/results";
import type { TaskDoc, TaskResult, TaskStatus } from "@/lib/data/schema";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

// Ses üretmeyen işlemler: sonuç TaskDoc.extra'da (persona_id, doğrulama cümlesi, voiceId)
const EXTRA_TYPES = new Set(["persona", "voice-phrase", "voice"]);
const DETAIL_STAGE: Record<string, TaskStatus> = { PENDING: "QUEUED", TEXT_SUCCESS: "TEXT_READY", FIRST_SUCCESS: "FIRST_READY", SUCCESS: "COMPLETED" };
const DETAIL_FAIL = new Set(["CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "SENSITIVE_WORD_ERROR"]); // CALLBACK_EXCEPTION üretim hatası değil
const LAST = new Map<string, number>(); // görev → son servis sorgusu (sunucu örneği başına)
const RANK: Record<string, number> = { QUEUED: 0, TEXT_READY: 1, FIRST_READY: 2, COMPLETED: 3, FAILED: 4 };
const sig = (r: TaskResult[]) => r.map((x) => `${x.id}|${x.stem}|${x.audio_url}|${x.stream_audio_url}|${x.image_url}`).join(",");

/** Callback gelmediyse (ör. localhost) durumu KIE'den sor; yalnız değişiklik varsa yaz. */
async function refresh(task: TaskDoc): Promise<TaskDoc> {
  const kie = await getKieTask(task.providerTaskId);
  const d = kie?.data ?? {};
  const state = d.state as string | undefined;
  // Kâr analizi: servisin bu görev için gerçekten düştüğü kredi (yalnız değişince yazılır)
  const used = Number(d.creditsConsumed);
  if (Number.isFinite(used) && used > 0 && used !== task.kieCredits) {
    await updateTask(task.providerTaskId, { kieCredits: used });
    task = { ...task, kieCredits: used };
  }

  const fail = async (code: string, msg: string): Promise<TaskDoc> => {
    await failTask(task.providerTaskId, code, msg);
    if (EXTRA_TYPES.has(task.taskType)) await applyExtra(task, true);
    return { ...task, status: "FAILED", errorMessage: msg };
  };
  if (state === "fail") return fail(String(d.failCode ?? ""), d.failMsg || "İşlem başarısız");

  if (EXTRA_TYPES.has(task.taskType)) {
    const extra = extraResult(d.resultJson);
    if (extra && /fail/.test(String(extra.status))) return fail("", String(extra.error || "İşlem başarısız"));
    const ready = task.taskType === "voice-phrase" ? !!extra?.phrase : task.taskType === "voice" ? !!extra?.voiceId : !!extra?.personaId;
    const next: TaskStatus = ready ? "COMPLETED" : task.status;
    if (next !== task.status || (extra && JSON.stringify(extra) !== JSON.stringify(task.extra))) {
      await updateTask(task.providerTaskId, { status: next, ...(extra ? { extra } : {}) });
    }
    const out = { ...task, status: next, extra: extra ?? task.extra };
    if (next === "COMPLETED" && task.status !== "COMPLETED") await applyExtra(out);
    return out;
  }

  // Aşama: müzik görevlerinde ayrıntı uç noktası gerçek aşamayı verir (PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS)
  // ve ara sonuçları (kapak, başlık, sözler, akış adresi) erkenden döndürür. Yüzde bilgisi yok; istemci aşama + süreden ilerler.
  let found = task.taskType === "remove-vocals" ? stemResults(d.resultJson) : normalizeResults(d.resultJson);
  let detail: string | undefined;
  if (task.taskType !== "remove-vocals" && state !== "success") {
    try {
      const old = await getMusicTaskDetail(task.providerTaskId);
      detail = old?.data?.status;
      const partial = normalizeResults(old?.data?.response ?? old?.data);
      if (partial.length) found = partial;
    } catch {}
  }
  if (detail && DETAIL_FAIL.has(detail)) return fail(detail, detail === "SENSITIVE_WORD_ERROR" ? "İçerik kurallara takıldı; sözleri ya da stili değiştirip tekrar dene." : "Üretim başarısız oldu.");
  const hasAudio = found.some((r) => r.audio_url || r.stream_audio_url);
  const seen: TaskStatus = state === "success" ? "COMPLETED"
    : (detail && DETAIL_STAGE[detail]) || (hasAudio ? "FIRST_READY" : state === "generating" ? "TEXT_READY" : task.status);
  const next: TaskStatus = RANK[seen] >= RANK[task.status] ? (seen === "COMPLETED" && !hasAudio && state !== "success" ? "FIRST_READY" : seen) : task.status;
  if (next !== task.status || (found.length && sig(found) !== sig(task.results))) {
    await setResults(task.providerTaskId, next, found);
    return { ...task, status: next, results: found.length ? found : task.results };
  }
  return task;
}

export async function GET(request: Request, context: Context) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    let task = await getTask(id);
    if (!task || task.userId !== user.uid)
      return NextResponse.json({ success: false, error: "Görev bulunamadı" }, { status: 404 });

    // Üretim servisine aynı görev için en fazla 3 sn'de bir sorulur (birden çok sekme/cihaz → hız sınırı 429 olmasın)
    if (task.status !== "COMPLETED" && task.status !== "FAILED" && Date.now() - (LAST.get(id) ?? 0) > 3000) {
      LAST.set(id, Date.now());
      if (LAST.size > 2000) LAST.clear();
      try { task = await refresh(task); } catch (err) { console.error("FALLBACK_POLL_ERROR", err); }
    }
    task = await mirrorIfNeeded(task);

    return NextResponse.json({
      success: true,
      task: {
        id: task.providerTaskId,
        providerTaskId: task.providerTaskId,
        taskType: task.taskType,
        status: task.status,
        model: task.params?.model,
        title: task.params?.title,
        results: task.results,
        extra: task.extra ?? null,
        error: task.errorMessage ? { code: task.errorCode, message: publicMessage(task.errorMessage, "Üretim başarısız oldu.") } : null,
      },
    });
  } catch (error) {
    return errorResponse(error, "TASK_GET_ERROR");
  }
}
