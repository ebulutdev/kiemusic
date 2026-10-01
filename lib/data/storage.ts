import crypto from "crypto";
import { adminBucket } from "../firebaseAdmin";
import { storagePath, type TaskResult } from "./schema";

// Firebase indirme token'lı kalıcı URL (imzalama izni gerektirmez; KIE de indirebilir)
function publicUrl(bucket: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

export async function saveFile(objectPath: string, data: Buffer, contentType: string): Promise<string> {
  const bucket = adminBucket();
  const token = crypto.randomUUID();
  await bucket.file(objectPath).save(data, {
    resumable: false,
    contentType,
    metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { firebaseStorageDownloadTokens: token } },
  });
  return publicUrl(bucket.name, objectPath, token);
}

export async function saveUpload(uid: string, data: Buffer, ext: string, contentType: string) {
  return saveFile(storagePath.upload(uid, `${crypto.randomUUID()}.${ext}`), data, contentType);
}

async function mirrorUrl(url: string | undefined, uid: string, taskId: string, name: string): Promise<string | undefined> {
  if (!url || url.includes("firebasestorage.googleapis.com")) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`İndirilemedi (${res.status}): ${url}`);
  const type = res.headers.get("content-type") || "application/octet-stream";
  const ext = type.includes("png") ? "png" : type.includes("jpeg") || type.includes("jpg") ? "jpg" : type.includes("webp") ? "webp" : type.includes("wav") ? "wav" : "mp3";
  return saveFile(storagePath.media(uid, taskId, `${name}.${ext}`), Buffer.from(await res.arrayBuffer()), type);
}

/**
 * KIE sonuç dosyalarını (14 gün sonra silinir) Storage'a kopyalar.
 * Orijinal URL'ler `source_*` alanlarında korunur.
 */
export async function mirrorResults(uid: string, taskId: string, results: TaskResult[]): Promise<TaskResult[]> {
  return Promise.all(
    results.map(async (r, i) => {
      const key = String(r.id ?? i);
      const [audio, image, vocal, inst] = await Promise.all([
        mirrorUrl(r.audio_url, uid, taskId, `${key}`),
        mirrorUrl(r.image_url, uid, taskId, `${key}-cover`),
        mirrorUrl(r.vocal_url, uid, taskId, `${key}-vocal`),
        mirrorUrl(r.instrumental_url, uid, taskId, `${key}-instrumental`),
      ]);
      return {
        ...r,
        source_audio_url: r.audio_url,
        source_image_url: r.image_url,
        audio_url: audio,
        image_url: image,
        vocal_url: vocal,
        instrumental_url: inst,
      };
    })
  );
}
