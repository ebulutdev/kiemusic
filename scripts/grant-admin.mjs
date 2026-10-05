// Yönetici yetkisi: npm run admin:grant -- e-posta@adresi        (vermek)
//                   npm run admin:grant -- e-posta@adresi --revoke (geri almak)
// Hesap önce uygulamada bu e-postayla (Google / Apple / e-posta) giriş yapmış olmalı.
// Yetki Firebase kimliğine "admin: true" özel yetkisi (custom claim) olarak yazılır; /admin ve /api/admin/* bunu ister.
import { readFileSync, existsSync } from "fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [email, flag] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error("Kullanım: npm run admin:grant -- e-posta@adresi [--revoke]");
  process.exit(1);
}
const env = Object.fromEntries(
  (existsSync(".env") ? readFileSync(".env", "utf8") : "").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]])
);
const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || env.FIREBASE_SERVICE_ACCOUNT || "").trim();
if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT tanımlı değil (.env)");
const sa = JSON.parse(raw.startsWith("{") ? raw : readFileSync(raw, "utf8"));
const auth = getAuth(initializeApp({ credential: cert(sa) }));

const user = await auth.getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`✗ ${email} ile kayıtlı hesap yok. Önce uygulamada bu e-postayla giriş yap.`);
  process.exit(1);
}
const revoke = flag === "--revoke";
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: !revoke });
if (revoke) await auth.revokeRefreshTokens(user.uid); // açık oturumlar yetkiyi hemen kaybetsin
console.log(`✓ ${email} (${user.uid}) → admin: ${!revoke}`);
console.log(revoke ? "  Oturumları kapatıldı." : "  /admin sayfasını yenile (gerekirse çıkış yapıp tekrar gir).");
process.exit(0);
