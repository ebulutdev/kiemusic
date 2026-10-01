import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getKieTask, getMusicTaskDetail } from "@/lib/kie";

type Context = { params: Promise<{ id: string }> };
type Any = Record<string, any>;

// KIE farklı uç noktalarda snake_case / camelCase döndürebiliyor — tek biçime indir
function norm(r: Any): Any {
  if (typeof r === "string") return { audio_url: r };
  return {
    ...r,
    id: r.id ?? r.audioId ?? r.audio_id,
    audio_url: r.audio_url ?? r.audioUrl ?? r.source_audio_url ?? r.sourceAudioUrl,
    stream_audio_url: r.stream_audio_url ?? r.streamAudioUrl ?? r.source_stream_audio_url,
    image_url: r.image_url ?? r.imageUrl ?? r.source_image_url ?? r.sourceImageUrl,
    vocal_url: r.vocal_url ?? r.vocalUrl,
    instrumental_url: r.instrumental_url ?? r.instrumentalUrl,
    title: r.title,
    duration: r.duration,
    tags: r.tags,
  };
}

function parseResults(raw: unknown): Any[] {
  let v: any = raw;
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { return []; } }
  if (!v) return [];
  if (Array.isArray(v)) return v.map(norm);
  const arr = v.resultUrls ?? v.sunoData ?? v.data ?? v.response?.sunoData ?? v.response?.data;
  if (Array.isArray(arr)) return arr.map(norm);
  if (v.vocal_url || v.vocalUrl || v.instrumental_url || v.instrumentalUrl) return [norm(v)];
  return [];
}

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const task = await db.musicTask.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ success: false, error: "Görev bulunamadı" }, { status: 404 });

    let results = parseResults(task.resultsJson);

    // Callback gelmediyse (ör. localhost) KIE'den durumu kendimiz sor
    if (task.status !== "COMPLETED" && task.status !== "FAILED") {
      try {
        const kie = await getKieTask(task.providerTaskId);
        const state = kie?.data?.state as string | undefined;

        if (state === "fail") {
          await db.musicTask.update({
            where: { id: task.id },
            data: { status: "FAILED", errorCode: String(kie?.data?.failCode ?? ""), errorMessage: kie?.data?.failMsg ?? "Üretim başarısız" },
          });
          task.status = "FAILED"; task.errorMessage = kie?.data?.failMsg ?? "Üretim başarısız";
        } else {
          let found = parseResults(kie?.data?.resultJson);
          if (!found.length) {
            try { const d = await getMusicTaskDetail(task.providerTaskId); found = parseResults(d?.data?.response ?? d?.data); } catch {}
          }
          if (found.length) results = found;
          const next = state === "success" ? "COMPLETED" : found.length ? "FIRST_READY" : state === "generating" ? "TEXT_READY" : task.status;
          if (next !== task.status || found.length) {
            await db.musicTask.update({
              where: { id: task.id },
              data: { status: next, resultsJson: found.length ? JSON.stringify(found) : task.resultsJson, completedAt: next === "COMPLETED" ? new Date() : undefined },
            });
            task.status = next;
          }
        }
      } catch (err) {
        console.error("FALLBACK_POLL_ERROR", err);
      }
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        providerTaskId: task.providerTaskId,
        taskType: task.taskType,
        status: task.status,
        model: task.model,
        title: task.title,
        results,
        error: task.errorMessage ? { code: task.errorCode, message: task.errorMessage } : null,
      },
    });
  } catch (error) {
    console.error("TASK_GET_ERROR", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Görev okunamadı" }, { status: 500 });
  }
}
