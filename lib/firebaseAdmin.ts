// ── Firebase Admin (yalnız sunucu) ────────────────────────
// Kimlik bilgisi sırası:
//   1. FIREBASE_SERVICE_ACCOUNT  → servis hesabı JSON'u (tek satır) ya da JSON dosyasının yolu
//   2. GOOGLE_APPLICATION_CREDENTIALS → Google'ın standart değişkeni (dosya yolu)
// Storage kovası: FIREBASE_STORAGE_BUCKET (yoksa <projectId>.firebasestorage.app)
import { readFileSync } from "fs";
import { cert, getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let app: App | null | undefined;
let firestore: Firestore | undefined;

function loadServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  const json = raw.startsWith("{") ? raw : readFileSync(raw, "utf8");
  return JSON.parse(json);
}

export function firebaseApp(): App | null {
  if (app !== undefined) return app;
  try {
    if (getApps().length) return (app = getApps()[0]);
    const sa = loadServiceAccount();
    const projectId = sa?.project_id ?? process.env.FIREBASE_PROJECT_ID;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || (projectId ? `${projectId}.firebasestorage.app` : undefined);
    if (sa) app = initializeApp({ credential: cert(sa as any), storageBucket });
    // Google Cloud'da (App Hosting FIREBASE_CONFIG verir) çalışma zamanı hizmet hesabı yedek kimliktir
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG) app = initializeApp({ credential: applicationDefault(), storageBucket });
    else app = null;
  } catch (err) {
    console.error("FIREBASE_ADMIN_INIT_ERROR", err);
    app = null;
  }
  return app;
}

export class FirebaseNotConfigured extends Error {
  constructor() { super("Firebase yapılandırılmamış: .env içine FIREBASE_SERVICE_ACCOUNT ekleyin."); }
}

function need(): App {
  const a = firebaseApp();
  if (!a) throw new FirebaseNotConfigured();
  return a;
}

export const adminAuth = () => getAuth(need());
export const adminBucket = () => getStorage(need()).bucket();
// Firestore örneği uygulama başına tektir; Next her rota paketinde bu modülü ayrı yükleyebildiği için
// settings() yalnız bir kez çağrılmalı → işaret globalThis'te tutulur.
const G = globalThis as unknown as { __sfFirestoreReady?: boolean };
export function adminDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(need());
    if (!G.__sfFirestoreReady) {
      try { firestore.settings({ ignoreUndefinedProperties: true }); } catch { /* başka paket zaten ayarladı */ }
      G.__sfFirestoreReady = true;
    }
  }
  return firestore;
}
