// ── Firestore + Storage şeması (tek doğruluk kaynağı) ─────
// Yol adları yalnız burada; istemci (public/fb.js) aynı adları kullanır. firestore.rules ile birlikte değiştirin.
//
// Okuma/yazma maliyeti için tasarım:
//   config/app                    AppConfig   — TEK belge: fiyat + katalog + KIE ayarları
//                                               (istemci 1 dinleyici, sunucu 60 sn bellek önbelleği)
//   users/{uid}                   UserDoc     — TEK belge: kredi + ayarlar + personalar + sesler
//                                               (istemci 1 dinleyici; kredi yalnız sunucu yazar)
//   users/{uid}/tracks/{id}       kütüphane   — parça başına belge; yalnız değişen parça yazılır
//   tasks/{kieTaskId}             TaskDoc     — yalnız sunucu; belge id = KIE taskId → sorgusuz okuma
//   tasks/{kieTaskId}/lyrics/{audioId}        — zaman damgalı söz önbelleği; parça açılınca 1 okuma
// Storage
//   uploads/{uid}/{file}          kullanıcı ses kayıtları (KIE'ye kaynak)
//   media/{uid}/{taskId}/{file}   üretilen ses/kapak kopyaları (KIE 14 günde siler)
//
// Seed: npm run db:seed  → public/config/app.json'ı config/app'e yazar, kuralları yayınlar.

export const COL = {
  users: "users",
  tracks: "tracks",
  tasks: "tasks",
  lyrics: "lyrics",
  config: "config",
} as const;

export const path = {
  config: "config/app",
  user:   (uid: string) => `${COL.users}/${uid}`,
  track:  (uid: string, id: string) => `${COL.users}/${uid}/${COL.tracks}/${id}`,
  task:   (taskId: string) => `${COL.tasks}/${taskId}`,
  lyrics: (taskId: string, audioId: string) => `${COL.tasks}/${taskId}/${COL.lyrics}/${audioId}`,
};

export const storagePath = {
  upload: (uid: string, file: string) => `uploads/${uid}/${file}`,
  media:  (uid: string, taskId: string, file: string) => `media/${uid}/${taskId}/${file}`,
};

// ── config/app ────────────────────────────────────────────
export interface AppConfig {
  version: number;
  pricing: { startCredits: number; costs: Record<string, number> };
  catalog: {
    styles: string[];
    ideas: string[];
    genres: { name: string; style: string }[];
    lyrics: string[];
    titles: string[];
    beatTags: string;
  };
  kie: {
    defaultModel: string;
    models: { id: string; label: string }[];
    limits: Record<string, number>;
    mediaRetentionDays: number;
    pollIntervalMs: number;
    pollTimeoutMin: number;
  };
}

// ── users/{uid} ───────────────────────────────────────────
export interface PersonaDoc {
  name: string;
  personaId?: string | null;          // KIE persona_id → üretimde persona_id + style_persona
  status?: "pending" | "ready" | "failed";
  description?: string | null;
  providerTaskId?: string | null;
  sourceTaskId?: string | null;
  sourceAudioId?: string | null;
  seed?: number;
}

export interface VoiceDoc {
  name: string;
  voiceId?: string | null;            // KIE voiceId → üretimde persona_id + voice_persona
  status?: "pending" | "ready" | "failed";
  description?: string | null;
  style?: string | null;
  skillLevel?: string | null;
  verifyUrl?: string | null;
  providerTaskId?: string | null;
  seed?: number;
}

export interface UserDoc {
  credits: number;
  settings?: { model?: string; theme?: string };
  personas?: Record<string, PersonaDoc>; // id → persona
  voices?: Record<string, VoiceDoc>;     // id → ses
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ── tasks/{kieTaskId} ─────────────────────────────────────
export type TaskStatus = "QUEUED" | "TEXT_READY" | "FIRST_READY" | "COMPLETED" | "FAILED";
export type TaskType = "generate" | "cover" | "extend" | "upload-extend" | "add-vocals" | "remove-vocals" | "replace-section" | "persona" | "voice-phrase" | "voice";
export type MirrorState = "none" | "running" | "done" | "failed";

export interface TaskResult {
  id?: string;
  audio_url?: string;
  stream_audio_url?: string;
  image_url?: string;
  vocal_url?: string;
  instrumental_url?: string;
  title?: string;
  duration?: number;
  tags?: string;
  prompt?: string;
  stem?: string; // stem ayırma: Vocals, Instrumental, Drums, Bass…
  [k: string]: unknown;
}

export interface TaskDoc {
  providerTaskId: string;
  userId: string;
  taskType: TaskType;
  status: TaskStatus;
  callbackType?: string | null;
  cost: number;
  refunded: boolean;
  params: Record<string, unknown>; // istekte gelen üretim parametreleri (boş alanlar atılır)
  results: TaskResult[];
  /** Ses olmayan sonuçlar: persona_id, validateInfo (doğrulama cümlesi), voiceId */
  extra?: Record<string, unknown>;
  mirror: MirrorState;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
  completedAt?: unknown;
}
