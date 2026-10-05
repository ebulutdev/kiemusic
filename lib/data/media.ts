// ── Ses kaynağı doğrulama ─────────────────────────────────
// KIE'ye gönderilen her ses URL'si kullanıcıya ait olmalı:
//   1) kendi ürettiği parça  → sourceTaskId görevinin sonuçlarında bu URL var (onay gerekmez)
//   2) kendi yüklediği kayıt → Storage uploads/{uid}/… (hak onayı zorunlu: rightsConfirmed)
//   3) kendi medya kopyası   → Storage media/{uid}/…
//   4) keşfet müziği         → Storage explore/… (yalnız admin yükler: app/api/admin/explore)
// Bunların dışındaki adresler (internetteki herhangi bir şarkı) reddedilir.
import { adminBucket } from "../firebaseAdmin";
import { HttpError } from "../auth";
import { getTask } from "./tasks";
import { storagePath } from "./schema";

export type MediaKind = "upload" | "media" | "generated" | "explore";

/** Firebase Storage indirme URL'sinden nesne yolunu çıkarır (bizim kovamız değilse null). */
function storageObject(url: URL): string | null {
  if (url.hostname !== "firebasestorage.googleapis.com") return null;
  const m = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
  if (!m) return null;
  let bucket = "";
  try { bucket = adminBucket().name; } catch { return null; }
  if (decodeURIComponent(m[1]) !== bucket) return null;
  return decodeURIComponent(m[2]);
}

export async function classifyMedia(rawUrl: string, uid: string, sourceTaskId?: string): Promise<MediaKind> {
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new HttpError(400, "Geçersiz ses adresi."); }
  if (url.protocol !== "https:") throw new HttpError(400, "Geçersiz ses adresi.");

  const obj = storageObject(url);
  if (obj?.startsWith(storagePath.upload(uid, ""))) return "upload";
  if (obj?.startsWith(`media/${uid}/`)) return "media";
  if (obj?.startsWith(storagePath.explore(""))) return "explore";

  if (sourceTaskId) {
    const task = await getTask(sourceTaskId);
    if (task && task.userId === uid) {
      const known = new Set<string>();
      for (const r of task.results || []) {
        for (const v of [r.audio_url, r.stream_audio_url, r.source_audio_url, r.vocal_url, r.instrumental_url]) if (typeof v === "string" && v) known.add(v);
      }
      if (known.has(rawUrl)) return "generated";
    }
  }
  throw new HttpError(403, "Bu ses kaynağı kullanılamaz. Kendi kaydını yükle ya da kütüphanendeki bir parçayı seç.");
}

/** Yüklenen kayıtlarda hak onayı (telif) zorunlu. */
export async function assertUsableMedia(rawUrl: string, uid: string, opts: { sourceTaskId?: string; rightsConfirmed?: boolean }) {
  const kind = await classifyMedia(rawUrl, uid, opts.sourceTaskId);
  if (kind === "upload" && opts.rightsConfirmed !== true)
    throw new HttpError(400, "Kaydın haklarına sahip olduğunu onaylaman gerekiyor.");
  return kind;
}

/** Ses klonu: kayıt yalnız kullanıcının kendi yüklemesi olabilir. */
export async function assertOwnUpload(rawUrl: string, uid: string) {
  const kind = await classifyMedia(rawUrl, uid);
  if (kind !== "upload") throw new HttpError(403, "Ses klonu için kendi kaydını kullanmalısın.");
}
