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
//   reports/{uid_task_audio}      ReportDoc   — yalnız sunucu; uygulama içi içerik şikâyetleri (inceleme kuyruğu)
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
  reports: "reports",
} as const;

export const path = {
  config: "config/app",
  user:   (uid: string) => `${COL.users}/${uid}`,
  track:  (uid: string, id: string) => `${COL.users}/${uid}/${COL.tracks}/${id}`,
  task:   (taskId: string) => `${COL.tasks}/${taskId}`,
  lyrics: (taskId: string, audioId: string) => `${COL.tasks}/${taskId}/${COL.lyrics}/${audioId}`,
  report: (id: string) => `${COL.reports}/${id}`,
};

export const storagePath = {
  upload: (uid: string, file: string) => `uploads/${uid}/${file}`,
  media:  (uid: string, taskId: string, file: string) => `media/${uid}/${taskId}/${file}`,
  explore: (file: string) => `explore/${file}`, // keşfet kutusu müzikleri (yalnız admin)
};

export interface ExplorePreview { url: string; path: string; start: number; name?: string }

// ── config/app ────────────────────────────────────────────
// songs: yaklaşık şarkı sayısı (üretim 10 kredi = 2 şarkı)
export interface PlanConfig { id: string; name: string; credits: number; price: number; currency: string; songs: number; best?: boolean }

export interface AppConfig {
  version: number;
  // Krediler aylıktır: her dönem (periodDays) sonunda bakiye sıfırlanır; abonelik varsa plan kredisine yenilenir (devretmez).
  // startCredits: yeni hesaba ilk dönem hediyesi · freeMonthly: planı olmayana her dönem verilen kredi (0 = yok)
  // plans: aylık abonelikler (id = App Store / Play abonelik ürün kimliği)
  pricing: { startCredits: number; periodDays?: number; freeMonthly?: number; costs: Record<string, number>; modelCosts?: Record<string, Record<string, number>>; plans?: PlanConfig[] };
  // Yasal metinler: /terms ve /privacy (public/terms.html, privacy.html) · version: sayfalardaki sürüm (hesap açılışında kabul kaydı)
  // contact: sayfalarda görünen iletişim e-postası (boşsa yer tutucu metin)
  legal?: { version: string; terms: string; privacy: string; contact?: string };
  // Kâr analizi (admin paneli düzenler): uygulama kredisinin $ değeri, üretim servisi kredisinin $ maliyeti,
  // servis kredisi bilinmeyen görevler için işlem başına tahmini servis kredisi
  economics?: { usdPerCredit: number; kieUsdPerCredit: number; kieCreditsEstimate: Record<string, number> };
  catalog: {
    styles: string[];
    ideas: string[];
    // preview: ana sayfa keşfet kutusunda çalan müzik (admin yükler; Storage explore/…)
    // label: kutu altındaki yazı · prompt: ok'a basınca dolan metin · action: custom (bu tarzda üret) | cover (kutu müziğinin cover'ı)
    genres: { name: string; style: string; label?: string; prompt?: string; action?: "custom" | "cover"; preview?: ExplorePreview | null }[];
    exploreMax?: number;  // keşfette en fazla kaç farklı kutu (gerisi tekrar)
    previewSec?: number;  // kutu müziğinin döngü uzunluğu (sn)
    lyrics: string[];
    titles: string[];
    beatTags: string;
  };
  // Üretim motoru ayarları. models[].id sunucuya gider (V6…), label/note yalnız arayüzde görünür (Cook v1…)
  engine: {
    defaultModel: string;
    models: { id: string; label: string; note?: string }[];
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
  consentAt?: string | null;          // "bu ses bana ait" onayı (kalıcı kayıt: tasks/{id}.params.consent)
}

// Kredi dönemi (ms). grant: dönem başında verilen kredi (ilerleme çubuğu bunun içinden kalan bakiyeyi gösterir)
export interface CreditPeriod { start: number; end: number; grant: number }
// Aktif abonelik — yalnız sunucu yazar (mağaza makbuzu doğrulandıktan sonra). expiresAt: mağazanın yenileme tarihi (ms)
export interface UserPlan { id: string; credits: number; expiresAt: number; store?: "apple" | "google"; tx?: string }

export interface UserDoc {
  credits: number;
  period?: CreditPeriod;
  plan?: UserPlan | null;
  guest?: boolean;
  terms?: { version: string | null; at?: unknown }; // hesap açılışında kabul edilen Kullanım Koşulları / Gizlilik sürümü (yalnız sunucu yazar)
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
  kieCredits?: number; // üretim servisinin bu görev için gerçekten düştüğü kredi (recordInfo.creditsConsumed)
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

// ── reports/{id} — içerik şikâyeti (yalnız sunucu yazar; Console'dan incelenir) ──
export interface ReportDoc {
  reporterUid: string;
  taskId: string | null;
  audioId: string | null;
  title: string | null;
  reason: string;
  note: string | null;
  status: "open" | "reviewed" | "removed";
  ownerUid: string | null;            // parçanın sahibi (görevden)
  taskType: string | null;
  snapshot: { audio_url?: string; image_url?: string; title?: string; prompt?: string } | null;
  createdAt: unknown;
}
