// ── KIE API Client ────────────────────────────────────────
// API key YALNIZCA bu dosyada ve sunucu tarafında kullanılır.
// Frontend'e asla gönderilmez.

const KIE_BASE = "https://api.kie.ai";

export type KieCallbackResult = {
  id?: string;
  audio_url?: string;
  stream_audio_url?: string;
  image_url?: string;
  prompt?: string;
  model_name?: string;
  title?: string;
  duration?: number;
  tags?: string;
  source_audio_url?: string;
};

export type KieCallback = {
  code?: number;
  msg?: string;
  data?: {
    callbackType?: string;
    task_id?: string;
    data?: KieCallbackResult[];
  };
};

// ── Ortak istek ───────────────────────────────────────────
async function kiePost(path: string, body: unknown) {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY tanımlanmamış.");

  const res = await fetch(`${KIE_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.msg || `KIE HTTP ${res.status}`);
  if (data.code !== 200) throw new Error(data?.msg || "KIE hata döndü.");
  return data;
}

async function kieGet(path: string) {
  const key = process.env.KIE_API_KEY;
  if (!key) throw new Error("KIE_API_KEY tanımlanmamış.");

  const res = await fetch(`${KIE_BASE}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.msg || `KIE HTTP ${res.status}`);
  return data;
}

function extractTaskId(data: { data?: { taskId?: string; task_id?: string } }) {
  const id = data?.data?.taskId ?? data?.data?.task_id;
  if (!id) throw new Error("KIE response içinde taskId bulunamadı.");
  return id as string;
}

function getCallbackUrl() {
  const url = process.env.APP_URL;
  if (!url) throw new Error("APP_URL tanımlanmamış.");
  return `${url}/api/callback`;
}

// ── Görev oluşturma (POST /api/v1/jobs/createTask) ────────
// İşlem → KIE model kimliği (docs.kie.ai/suno-api/*)
export const KIE_MODEL = {
  generate: "ai-music-api/generate",
  cover: "ai-music-api/upload-and-cover-audio",
  extend: "ai-music-api/extend",
  "upload-extend": "ai-music-api/upload-and-extend-audio",
  "add-vocals": "ai-music-api/add-vocals",
  "remove-vocals": "ai-music-api/separate-vocals",
  "replace-section": "ai-music-api/replace-section",
  persona: "ai-music-api/generate-persona",
  "voice-phrase": "ai-music-api/validation-phrase",
  voice: "ai-music-api/create-voice",
} as const;
export type KieOp = keyof typeof KIE_MODEL;

export async function createKieTask(op: KieOp, input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", { model: KIE_MODEL[op], callBackUrl: getCallbackUrl(), input });
  return { taskId: extractTaskId(data), raw: data };
}
export const createMusicTask = (input: Record<string, unknown>) => createKieTask("generate", input);

// ── 9. Task Durumu Sorgula ────────────────────────────────
export async function getKieTask(taskId: string) {
  return kieGet(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
}

/** Hesaptaki kalan servis kredisi (admin paneli). Bilinmiyorsa null. */
export async function getKieBalance(): Promise<number | null> {
  try {
    const d = await kieGet("/api/v1/chat/credit");
    const v = typeof d?.data === "number" ? d.data : Number(d?.data?.credits ?? d?.data?.balance);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

// ── 10. Müzik Task Detayı (eski endpoint) ─────────────────
export async function getMusicTaskDetail(taskId: string) {
  return kieGet(`/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`);
}

// ── 10b. Zaman damgalı sözler (karaoke senkronu) ──────────
// KIE: ai-music-api/timeStamped-lyrics → aligned_words[{word,start_s,end_s,success}]
// Yanıt genelde senkron gelir; taskId dönerse recordInfo ile beklenir.
// Instrumental parçalarda söz verisi dönmez.
export type AlignedWord = { w: string; s: number; e: number; ok: boolean };

function pickAligned(v: any): AlignedWord[] | null {
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { return null; } }
  if (!v || typeof v !== "object") return null;
  const arr = v.aligned_words ?? v.alignedWords
    ?? v.resultObject?.aligned_words ?? v.resultObject?.alignedWords
    ?? v.data?.aligned_words ?? v.data?.alignedWords;
  if (!Array.isArray(arr)) return null;
  return arr
    .map((x: any) => ({
      w: String(x.word ?? ""),
      s: Number(x.start_s ?? x.startS),
      e: Number(x.end_s ?? x.endS),
      ok: x.success !== false,
    }))
    .filter((x) => x.w && isFinite(x.s) && isFinite(x.e));
}

export async function getTimestampedLyrics(taskId: string, audioId: string): Promise<AlignedWord[]> {
  try {
    const data = await kiePost("/api/v1/jobs/createTask", {
      model: "ai-music-api/timeStamped-lyrics",
      input: { task_id: taskId, audio_id: audioId },
    });
    const direct = pickAligned(data?.data);
    if (direct) return direct;

    const jobId = data?.data?.taskId ?? data?.data?.task_id;
    if (jobId) {
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const rec = await getKieTask(jobId);
        const state = rec?.data?.state;
        if (state === "fail") throw new Error(rec?.data?.failMsg || "Söz senkronu başarısız");
        const found = pickAligned(rec?.data?.resultJson);
        if (found) return found;
        if (state === "success") break;
      }
    }
  } catch (err) {
    console.warn("TIMESTAMPED_LYRICS_JOBS_FAILED", err);
  }
  // Eski uç nokta (camelCase) — yedek
  const legacy = await kiePost("/api/v1/generate/get-timestamped-lyrics", { taskId, audioId });
  const words = pickAligned(legacy?.data);
  if (!words) throw new Error("KIE söz zamanlaması döndürmedi.");
  return words;
}
