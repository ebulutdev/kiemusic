import { readFileSync } from "fs";
import { join } from "path";
import { adminDb } from "../firebaseAdmin";
import { path, type AppConfig } from "./schema";

// config/app tek belge; sunucu 60 sn bellekte tutar → istek başına okuma yok.
// Firestore'da yoksa / okunamazsa public/config/app.json (seed kaynağı) kullanılır.
const TTL = 60_000;
let cached: { at: number; value: AppConfig } | null = null;
let fallback: AppConfig | null = null;

function fileConfig(): AppConfig {
  return (fallback ??= JSON.parse(readFileSync(join(process.cwd(), "public", "config", "app.json"), "utf8")));
}

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

export async function getCost(taskType: string): Promise<number> {
  const c = (await getConfig()).pricing.costs[taskType];
  if (typeof c !== "number") throw new Error(`Fiyat tanımlı değil: ${taskType}`);
  return c;
}

export async function getStartCredits(): Promise<number> {
  return (await getConfig()).pricing.startCredits;
}
