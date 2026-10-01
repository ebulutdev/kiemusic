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

// ── 1. Müzik Üret ─────────────────────────────────────────
export async function createMusicTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/generate",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 2. Audio Cover ────────────────────────────────────────
export async function createCoverTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/upload-and-cover-audio",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 2b. Upload & Extend (yüklenen ses) ─────────────────
export async function createUploadExtendTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/upload-and-extend-audio",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 3. Extend ─────────────────────────────────────────────
export async function createExtendTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/extend",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 4. Add Vocals ─────────────────────────────────────────
export async function createAddVocalsTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/add-vocals",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 5. Vocal Separation / Stem Ayırma ────────────────────
export async function createSeparateVocalsTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/separate-vocals",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 6. Replace Section ────────────────────────────────────
export async function createReplaceSectionTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/replace-section",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 7. Persona Oluştur ────────────────────────────────────
export async function createPersonaTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/generate-persona",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 8. Custom Voice Oluştur ───────────────────────────────
export async function createVoiceTask(input: Record<string, unknown>) {
  const data = await kiePost("/api/v1/jobs/createTask", {
    model: "ai-music-api/create-voice",
    callBackUrl: getCallbackUrl(),
    input,
  });
  return { taskId: extractTaskId(data), raw: data };
}

// ── 9. Task Durumu Sorgula ────────────────────────────────
export async function getKieTask(taskId: string) {
  return kieGet(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
}

// ── 10. Müzik Task Detayı (eski endpoint) ─────────────────
export async function getMusicTaskDetail(taskId: string) {
  return kieGet(`/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`);
}

// ── 11. Download URL ──────────────────────────────────────
export async function getDownloadUrl(url: string) {
  const data = await kiePost("/api/v1/common/download-url", { url });
  return data?.data as string;
}
