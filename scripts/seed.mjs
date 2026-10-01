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
await getFirestore(app).doc("config/app").set({ ...config, updatedAt: FieldValue.serverTimestamp() });
console.log(`✓ config/app yazıldı (v${config.version})`);

const rules = getSecurityRules(app);
await rules.releaseFirestoreRulesetFromSource(readFileSync("firestore.rules", "utf8"));
console.log("✓ firestore.rules yayınlandı");

try {
  const [exists] = await getStorage(app).bucket().exists();
  if (!exists) throw new Error("kova yok");
  await rules.releaseStorageRulesetFromSource(readFileSync("storage.rules", "utf8"), bucket);
  console.log("✓ storage.rules yayınlandı");
} catch (e) {
  console.log(`– storage.rules atlandı (Storage açık değil: ${e.message})`);
}
process.exit(0);
