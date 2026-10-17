import { NextResponse } from "next/server";
import { z } from "zod";
import { getTimestampedLyrics } from "@/lib/kie";
import { requireUser, errorResponse } from "@/lib/auth";
import { getTask } from "@/lib/data/tasks";
import { syntheticTimings } from "@/lib/results";
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
    if (!task || task.userId !== user.uid || !(task.results || []).some((r) => r.id === audioId)) {
      return NextResponse.json({ success: false, error: "Görev bulunamadı" }, { status: 404 });
    }

    const dur = (task.results || []).find((r) => r.id === audioId)?.duration;
    const cache = adminDb().doc(path.lyrics(task.providerTaskId, audioId));
    const hit = await cache.get();
    if (hit.exists) {
      let words = hit.get("words") || [];
      if (syntheticTimings(words, dur)) words = []; // eskiden önbelleğe alınmış sahte zamanlama da kullanılmaz
      const at = hit.get("createdAt")?.toMillis?.() ?? 0;
      // Boş / başarısız sonuç da 1 gün önbellekte: aynı parça için servise tekrar tekrar gidilmez (ücretli olabilir)
      if (words.length || Date.now() - at < 86_400_000) return NextResponse.json({ success: true, words, cached: true });
    }

    let words: Awaited<ReturnType<typeof getTimestampedLyrics>> = [];
    try {
      words = await getTimestampedLyrics(task.providerTaskId, audioId);
    } catch (err) {
      await cache.set({ words: [], failed: true, createdAt: new Date() });
      throw err;
    }
    // Sahte (eşit aralıklı) zamanlama: kaydetme, kullanma — istemci yedek moda geçer
    if (syntheticTimings(words, dur)) {
      await cache.set({ words: [], failed: true, synthetic: true, createdAt: new Date() });
      return NextResponse.json({ success: true, words: [], synthetic: true });
    }
    await cache.set({ words, createdAt: new Date() });
    return NextResponse.json({ success: true, words });
  } catch (error) {
    return errorResponse(error, "LYRICS_SYNC_ERROR");
  }
}
