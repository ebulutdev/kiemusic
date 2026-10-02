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
const sig = (r: TaskResult[]) => r.map((x) => `${x.id}|${x.stem}|${x.audio_url}|${x.stream_audio_url}|${x.image_url}`).join(",");

/** Callback gelmediyse (ör. localhost) durumu KIE'den sor; yalnız değişiklik varsa yaz. */
async function refresh(task: TaskDoc): Promise<TaskDoc> {
  const kie = await getKieTask(task.providerTaskId);
  const d = kie?.data ?? {};
  const state = d.state as string | undefined;

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

  let found = task.taskType === "remove-vocals" ? stemResults(d.resultJson) : normalizeResults(d.resultJson);
  if (!found.length && task.taskType !== "remove-vocals") {
    try { const old = await getMusicTaskDetail(task.providerTaskId); found = normalizeResults(old?.data?.response ?? old?.data); } catch {}
  }
  const next: TaskStatus = state === "success" ? "COMPLETED" : found.length ? "FIRST_READY" : state === "generating" ? "TEXT_READY" : task.status;
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

    if (task.status !== "COMPLETED" && task.status !== "FAILED") {
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
