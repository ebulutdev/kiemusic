import { NextResponse } from "next/server";
import { z } from "zod";
import { getTimestampedLyrics } from "@/lib/kie";
import { requireUser, errorResponse } from "@/lib/auth";
import { getTask } from "@/lib/data/tasks";
import { adminDb } from "@/lib/firebaseAdmin";
import { path } from "@/lib/data/schema";

// Şarkı sözlerini sesle kelime kelime eşlemek için KIE zaman damgalı sözler.
// Sonuç tasks/{taskId}/lyrics/{audioId} altında önbelleğe alınır → KIE'ye tekrar istek atılmaz.
const schema = z.object({
  taskId:         z.string().optional(),
  providerTaskId: z.string().optional(),
  audioId:        z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "audioId ve taskId gerekli" }, { status: 400 });
    }
    const { audioId } = parsed.data;
    const providerTaskId = parsed.data.providerTaskId || parsed.data.taskId;
    const task = providerTaskId ? await getTask(providerTaskId) : null;
    if (!task || task.userId !== user.uid) {
      return NextResponse.json({ success: false, error: "Görev bulunamadı" }, { status: 404 });
    }

    const cache = adminDb().doc(path.lyrics(task.providerTaskId, audioId));
    const hit = await cache.get();
    if (hit.exists) return NextResponse.json({ success: true, words: hit.get("words"), cached: true });

    const words = await getTimestampedLyrics(task.providerTaskId, audioId);
    if (words.length) await cache.set({ words, createdAt: new Date() });
    return NextResponse.json({ success: true, words });
  } catch (error) {
    return errorResponse(error, "LYRICS_SYNC_ERROR");
  }
}
