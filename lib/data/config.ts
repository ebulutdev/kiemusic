import { adminDb } from "../firebaseAdmin";
import { path, type AppConfig } from "./schema";
// Derleme anında sunucu koduna gömülür. fs ile okunmamalı: Next'in dosya izleyicisi o zaman
// public/config'i standalone çıktısına kopyalar, App Hosting de "public zaten var" deyip
// public'in geri kalanını (index.html, app.js…) atlar → canlıda ana sayfa 404 olur.
import seedConfig from "../../public/config/app.json";

// config/app tek belge; sunucu 60 sn bellekte tutar → istek başına okuma yok.
// Firestore'da yoksa / okunamazsa public/config/app.json (seed kaynağı) kullanılır.
const TTL = 60_000;
let cached: { at: number; value: AppConfig } | null = null;
const fileConfig = (): AppConfig => seedConfig as unknown as AppConfig;

export async function getConfig(): Promise<AppConfig> {
  if (cached && Date.now() - cached.at < TTL) return cached.value;
  let value = fileConfig();
  try {
    const snap = await adminDb().doc(path.config).get();
    if (snap.exists) value = snap.data() as AppConfig;
  } catch (err) {
    console.warn("CONFIG_READ_FALLBACK", err);
  }
  cached = { at: Date.now(), value };
  return value;
}

/** Admin değişikliğinden sonra bu sunucu örneğinin önbelleğini at (diğer örnekler en geç 60 sn'de günceller). */
export function invalidateConfig() { cached = null; }

/** config/app içindeki alanları günceller (iç içe anahtarlar: "economics", "catalog.genres" …). */
export async function patchConfig(fields: Record<string, unknown>) {
  await adminDb().doc(path.config).update({ ...fields, updatedAt: new Date() });
  invalidateConfig();
}

export async function getCost(taskType: string): Promise<number> {
  const c = (await getConfig()).pricing.costs[taskType];
  if (typeof c !== "number") throw new Error(`Fiyat tanımlı değil: ${taskType}`);
  return c;
}
