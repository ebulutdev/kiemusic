import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { errorResponse, HttpError } from "@/lib/auth";
import { adminBucket, adminDb } from "@/lib/firebaseAdmin";
import { getConfig, invalidateConfig } from "@/lib/data/config";
import { saveFile } from "@/lib/data/storage";
import { path, storagePath, type AppConfig } from "@/lib/data/schema";

// Admin: ana sayfa keşfet kutuları (config/app → catalog.genres[i])
//   GET                         → kutular + ayarlar
//   POST application/json       → { index, name?, label?, style?, prompt?, action?, start?, removePreview? }
//   POST multipart/form-data    → index, start, file  (kutuya müzik yükle; eskisi silinir)
export const runtime = "nodejs";

type Genre = AppConfig["catalog"]["genres"][number];
const MAX = 30 * 1024 * 1024; // Cloud Run istek gövdesi sınırı 32 MB
const AUDIO = /^audio\/(mpeg|mp3|wav|x-wav|wave|mp4|m4a|x-m4a|aac|ogg|webm|flac|x-flac)$/;

const edit = z.object({
  index: z.number().int().min(0).max(200),
  name: z.string().trim().min(1).max(60).optional(),
  label: z.string().trim().max(60).optional(),
  style: z.string().trim().min(1).max(1000).optional(),
  prompt: z.string().trim().max(3000).optional(),
  action: z.enum(["custom", "cover"]).optional(),
  start: z.number().min(0).max(3600).optional(),
  removePreview: z.boolean().optional(),
});

/** catalog.genres üzerinde tek kutuyu atomik güncelle; eski ses nesnesinin yolunu döner. */
async function updateGenre(index: number, fn: (g: Genre) => Genre): Promise<{ genre: Genre; oldPath?: string }> {
  const ref = adminDb().doc(path.config);
  const out = await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const genres = [...((snap.data() as AppConfig | undefined)?.catalog?.genres ?? [])];
    if (!genres[index]) throw new HttpError(404, "Kutu bulunamadı.");
    const before = genres[index];
    genres[index] = fn({ ...before });
    tx.update(ref, { "catalog.genres": genres, updatedAt: new Date() });
    return { genre: genres[index], oldPath: before.preview?.path !== genres[index].preview?.path ? before.preview?.path : undefined };
  });
  invalidateConfig();
  return out;
}
const removeObject = async (p?: string) => { if (p?.startsWith(storagePath.explore(""))) await adminBucket().file(p).delete().catch(() => {}); };

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const c = (await getConfig()).catalog;
    return NextResponse.json({ success: true, genres: c.genres, exploreMax: c.exploreMax ?? 20, previewSec: c.previewSec ?? 30 });
  } catch (error) {
    return errorResponse(error, "ADMIN_EXPLORE_ERROR");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    // ── müzik yükleme ──
    if ((request.headers.get("content-type") || "").startsWith("multipart/form-data")) {
      const fd = await request.formData();
      const index = Number(fd.get("index")), start = Math.max(0, Number(fd.get("start")) || 0), file = fd.get("file");
      if (!Number.isInteger(index) || index < 0) throw new HttpError(400, "Geçersiz kutu.");
      if (!(file instanceof File)) throw new HttpError(400, "Dosya yok.");
      if (file.size > MAX) throw new HttpError(413, "Dosya en fazla 30 MB olabilir.");
      if (!AUDIO.test(file.type)) throw new HttpError(400, "Yalnız ses dosyası yüklenebilir.");
      const ext = (file.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "mp3";
      const objectPath = storagePath.explore(`${crypto.randomUUID()}.${ext}`);
      const url = await saveFile(objectPath, Buffer.from(await file.arrayBuffer()), file.type);
      const { genre, oldPath } = await updateGenre(index, (g) => ({ ...g, preview: { url, path: objectPath, start, name: file.name.slice(0, 120) } }));
      await removeObject(oldPath);
      return NextResponse.json({ success: true, genre });
    }

    // ── kutu ayarları ──
    const parsed = edit.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Geçersiz değer", details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data;
    const { genre, oldPath } = await updateGenre(d.index, (g) => {
      const n: Genre = { ...g };
      if (d.name !== undefined) n.name = d.name;
      if (d.label !== undefined) n.label = d.label || undefined;
      if (d.style !== undefined) n.style = d.style;
      if (d.prompt !== undefined) n.prompt = d.prompt || undefined;
      if (d.action !== undefined) n.action = d.action;
      if (d.removePreview) n.preview = null;
      else if (d.start !== undefined && n.preview) n.preview = { ...n.preview, start: d.start };
      return JSON.parse(JSON.stringify(n)); // undefined alanları at (Firestore)
    });
    await removeObject(oldPath);
    return NextResponse.json({ success: true, genre });
  } catch (error) {
    return errorResponse(error, "ADMIN_EXPLORE_ERROR");
  }
}
