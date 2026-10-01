import { NextResponse } from "next/server";
import { adminAuth, FirebaseNotConfigured } from "./firebaseAdmin";
import { InsufficientCredits } from "./data/users";

// İşlem maliyetleri: config/app.pricing (lib/data/config.ts)

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export type User = { uid: string };

/** İstekteki Firebase ID token'ını doğrular (Authorization: Bearer <idToken>). */
export async function requireUser(req: Request): Promise<User> {
  const auth = adminAuth();
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw new HttpError(401, "Oturum gerekli.");
  try {
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    throw new HttpError(401, "Oturum geçersiz, uygulamayı yeniden açın.");
  }
}

export function errorResponse(error: unknown, tag: string) {
  const json = (status: number, msg: string) => NextResponse.json({ success: false, error: msg }, { status });
  if (error instanceof HttpError) return json(error.status, error.message);
  if (error instanceof InsufficientCredits) return json(402, error.message);
  if (error instanceof FirebaseNotConfigured) return json(503, error.message);
  console.error(tag, error);
  return json(500, error instanceof Error ? error.message : "Beklenmeyen hata");
}
