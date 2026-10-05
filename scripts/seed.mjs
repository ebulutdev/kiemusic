// Veritabanı kurulumu: npm run db:seed
//   1. public/config/app.json → Firestore config/app (tek belge: fiyat + katalog + KIE)
//   2. firestore.rules ve storage.rules → Firebase'e yayınla
// Kimlik: .env içindeki FIREBASE_SERVICE_ACCOUNT (dosya yolu ya da JSON)
import { readFileSync, existsSync } from "fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getSecurityRules } from "firebase-admin/security-rules";
import { getStorage } from "firebase-admin/storage";

const env = Object.fromEntries(
  (existsSync(".env") ? readFileSync(".env", "utf8") : "").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)).filter(Boolean).map((m) => [m[1], m[2]])
);
const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || env.FIREBASE_SERVICE_ACCOUNT || "").trim();
if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT tanımlı değil (.env)");
const sa = JSON.parse(raw.startsWith("{") ? raw : readFileSync(raw, "utf8"));
const bucket = process.env.FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || `${sa.project_id}.firebasestorage.app`;
const app = initializeApp({ credential: cert(sa), storageBucket: bucket });

const config = JSON.parse(readFileSync("public/config/app.json", "utf8"));
// Admin panelinde düzenlenen alanlar korunur: birim fiyatlar (economics) ve keşfet kutusu
// ayarları (müzik, etiket, prompt, davranış) — kutu adına göre eşlenir.
const ref = getFirestore(app).doc("config/app");
const live = (await ref.get()).data();
if (live?.economics) config.economics = live.economics;
const kept = new Map((live?.catalog?.genres || []).map((g) => [g.name, g]));
config.catalog.genres = config.catalog.genres.map((g) => {
  const o = kept.get(g.name);
  if (!o) return g;
  const out = { ...g, style: o.style || g.style };
  for (const k of ["label", "prompt", "action", "preview"]) if (o[k] !== undefined && o[k] !== null) out[k] = o[k];
  return out;
});
await ref.set({ ...config, updatedAt: FieldValue.serverTimestamp() });
console.log(`✓ config/app yazıldı (v${config.version}, admin ayarları korundu)`);

const rules = getSecurityRules(app);
await rules.releaseFirestoreRulesetFromSource(readFileSync("firestore.rules", "utf8"));
console.log("✓ firestore.rules yayınlandı");

try {
  const [exists] = await getStorage(app).bucket().exists();
  if (!exists) throw new Error("kova yok");
  await rules.releaseStorageRulesetFromSource(readFileSync("storage.rules", "utf8"), bucket);
  console.log("✓ storage.rules yayınlandı");
  // Tarayıcı sesleri Web Audio ile çalabilsin (keşfet geçişleri, dalga formu): indirme adresleri zaten
  // jetonla korunuyor; CORS yalnız okumaya (GET/HEAD) izin verir, yazma kurallarını değiştirmez.
  await getStorage(app).bucket().setCorsConfiguration([{
    origin: ["*"], method: ["GET", "HEAD"], maxAgeSeconds: 3600,
    responseHeader: ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"],
  }]);
  console.log("✓ Storage CORS (yalnız okuma) ayarlandı");
} catch (e) {
  console.log(`– storage.rules atlandı (Storage açık değil: ${e.message})`);
}
process.exit(0);
