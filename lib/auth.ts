import { NextResponse } from "next/server";
import { adminAuth, FirebaseNotConfigured } from "./firebaseAdmin";
import { InsufficientCredits } from "./data/users";

// İşlem maliyetleri: config/app.pricing (lib/data/config.ts)

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export type User = { uid: string; anon: boolean };

/** İstekteki Firebase ID token'ını doğrular (Authorization: Bearer <idToken>). */
export async function requireUser(req: Request): Promise<User> {
  const auth = adminAuth();
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw new HttpError(401, "Oturum gerekli.");
  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch {
    throw new HttpError(401, "Oturum geçersiz, uygulamayı yeniden açın.");
  }
  return { uid: decoded.uid, anon: decoded.firebase?.sign_in_provider === "anonymous" };
}

/** Kredi harcayan / yükleme yapan işlemler: misafir (anonim) hesap kullanamaz. */
export const ACCOUNT_REQUIRED = "Kredi kullanmak için hesap oluştur ya da giriş yap.";
export async function requireAccount(req: Request): Promise<User> {
  const u = await requireUser(req);
  if (u.anon) throw new HttpError(403, ACCOUNT_REQUIRED);
  return u;
}

/** İstemciye giden mesaj: altyapı/sağlayıcı adları ve iç ayrıntılar kullanıcıya gösterilmez. */
export function publicMessage(msg: string | null | undefined, fallback = "İşlem şu an yapılamadı. Biraz sonra tekrar dene."): string {
  const m = (msg || "").trim();
  if (!m || /kie|suno|api[_ ]?key|callback|http \d{3}|taskid|tanımlanmamış|undefined|null|econn|fetch failed/i.test(m)) return fallback;
  return m;
}

export function errorResponse(error: unknown, tag: string) {
  const json = (status: number, msg: string) => NextResponse.json({ success: false, error: msg }, { status });
  if (error instanceof HttpError) return json(error.status, error.message);
  if (error instanceof InsufficientCredits) return json(402, error.message);
  if (error instanceof FirebaseNotConfigured) return json(503, error.message);
  console.error(tag, error);
  return json(500, publicMessage(error instanceof Error ? error.message : ""));
}
