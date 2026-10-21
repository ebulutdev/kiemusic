import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { adminAuth, FirebaseNotConfigured } from "./firebaseAdmin";
import { InsufficientCredits, TrustedLoginRequired, QuotaExceeded, TermsRequired } from "./data/users";
import { ProviderBusy, KieUserError } from "./kie";

// İşlem maliyetleri: config/app.pricing (lib/data/config.ts)

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// verified: Apple ya da Google ile bağlı hesap (sağlayıcı e-postayı doğrulamış olur) → başlangıç hediyesi için şart.
// giftId: Apple/Google benzersiz kimliğinin tek yönlü SHA-256 özeti → hesap silinip yeniden açılsa bile başlangıç hediyesi ömür boyu 1 kez verilir.
export type User = { uid: string; anon: boolean; verified: boolean; giftId: string };

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
  const provider = decoded.firebase?.sign_in_provider;
  const ids = decoded.firebase?.identities || {};
  const rawKey = ids["apple.com"]?.[0] ? `apple:${ids["apple.com"][0]}` : ids["google.com"]?.[0] ? `google:${ids["google.com"][0]}` : decoded.email ? `email:${decoded.email.toLowerCase()}` : `uid:${decoded.uid}`;
  const giftId = "gift_" + createHash("sha256").update(rawKey).digest("hex").slice(0, 40);
  return {
    uid: decoded.uid,
    anon: provider === "anonymous",
    verified: provider === "google.com" || provider === "apple.com" || !!(ids["apple.com"] || ids["google.com"]),
    giftId,
  };
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
  if (error instanceof TrustedLoginRequired) return json(403, error.message);
  if (error instanceof TermsRequired) return NextResponse.json({ success: false, error: error.message, terms: true }, { status: 403 });
  if (error instanceof QuotaExceeded) return json(429, error.message);
  if (error instanceof KieUserError) return json(422, error.message);
  if (error instanceof ProviderBusy) return NextResponse.json({ success: false, error: error.message, busy: true }, { status: 503 });
  if (error instanceof FirebaseNotConfigured) return json(503, error.message);
  console.error(tag, error);
  return json(500, publicMessage(error instanceof Error ? error.message : ""));
}
