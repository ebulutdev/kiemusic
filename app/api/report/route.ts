import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireUser, errorResponse } from "@/lib/auth";
import { reportSchema } from "@/lib/validation";
import { adminDb } from "@/lib/firebaseAdmin";
import { getTask } from "@/lib/data/tasks";
import { path, type ReportDoc } from "@/lib/data/schema";

export const runtime = "nodejs";

// Uygulama içi içerik şikâyeti (Google Play AI-Generated Content + Apple UGC kuralları).
// reports/{uid_task_audio} — aynı kullanıcı aynı parçayı bir kez bildirir (tekrar → üzerine yazar).
// İnceleme: Firebase Console > Firestore > reports (status: open → reviewed | removed)
const safe = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 120) || "na";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const parsed = reportSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    // Parçanın kanıtı istemciden değil görev kaydından alınır
    const task = d.taskId ? await getTask(d.taskId) : null;
    const result = task?.results?.find((r) => !d.audioId || r.id === d.audioId) ?? task?.results?.[0];
    const snapshot = result
      ? {
          ...(result.audio_url ? { audio_url: result.audio_url } : {}),
          ...(result.image_url ? { image_url: result.image_url } : {}),
          ...(result.title ? { title: String(result.title) } : {}),
          ...(result.prompt ? { prompt: String(result.prompt).slice(0, 5000) } : {}),
        }
      : null;

    const id = [user.uid, d.taskId, d.audioId].map((x) => safe(x || "")).join("_");
    const doc: ReportDoc = {
      reporterUid: user.uid,
      taskId: d.taskId ?? null,
      audioId: d.audioId ?? null,
      title: d.title ?? null,
      reason: d.reason,
      note: d.note || null,
      status: "open",
      ownerUid: task?.userId ?? null,
      taskType: task?.taskType ?? null,
      snapshot,
      createdAt: FieldValue.serverTimestamp(),
    };
    await adminDb().doc(path.report(id)).set(doc);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return errorResponse(error, "REPORT_ERROR");
  }
}
