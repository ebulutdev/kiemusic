import { adminAuth } from "./firebaseAdmin";
import { HttpError } from "./auth";

// Yönetici: Firebase kimliğinde "admin: true" özel yetkisi (custom claim) olan hesap.
// Yetki verme: npm run admin:grant -- e-posta@adresi   (scripts/grant-admin.mjs)
// Yedek: ADMIN_UIDS ortam değişkeni (virgülle ayrılmış uid listesi).
export type Admin = { uid: string; email?: string };

export async function requireAdmin(req: Request): Promise<Admin> {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw new HttpError(401, "Oturum gerekli.");
  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(token, true); // iptal edilmiş oturumlar da reddedilir
  } catch {
    throw new HttpError(401, "Oturum geçersiz, yeniden giriş yap.");
  }
  const allow = (process.env.ADMIN_UIDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (decoded.admin !== true && !allow.includes(decoded.uid)) throw new HttpError(403, "Bu hesabın yönetici yetkisi yok.");
  return { uid: decoded.uid, email: decoded.email };
}
