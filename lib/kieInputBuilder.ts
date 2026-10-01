import type { GenerateMusicInput, AudioTaskInput } from "./validation";

// KIE Suno input nesneleri — docs.kie.ai/suno-api/* ile birebir.
// Ortak kurallar: instrumental:true ise lyrics/prompt/vocal_gender/audio_weight gönderilmez;
// lyrics (≤5000) prompt'a göre önceliklidir. input.model = Suno sürümü (V6 / V6_MINI / V6_WILD).
type KieInput = Record<string, unknown>;

function clean(obj: KieInput): KieInput {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

/** style_weight / weirdness_constraint / variety (+ vokalliyse audio_weight) */
function tuning(d: { styleWeight?: number; weirdnessConstraint?: number; audioWeight?: number; variety?: number }, vocal: boolean): KieInput {
  return {
    style_weight: d.styleWeight,
    weirdness_constraint: d.weirdnessConstraint,
    variety: d.variety,
    audio_weight: vocal ? d.audioWeight : undefined,
  };
}

/** Vokal alanları — yalnız vokalli üretimde */
function vocals(d: { lyrics?: string; prompt?: string; vocalGender?: string }, vocal: boolean): KieInput {
  if (!vocal) return {};
  return { lyrics: d.lyrics || undefined, prompt: d.lyrics ? undefined : d.prompt || undefined, vocal_gender: d.vocalGender };
}

function persona(d: { personaId?: string; personaModel?: string }): KieInput {
  return d.personaId ? { persona_id: d.personaId, persona_model: d.personaModel || "style_persona" } : {};
}

// ── Generate ──────────────────────────────────────────────
export function buildGenerateInput(data: GenerateMusicInput): KieInput {
  const base: KieInput = { custom_mode: data.customMode, instrumental: data.instrumental, model: data.model };
  if (!data.customMode) {
    // Non-custom: duration ve ayar kaydırıcıları yasak
    return clean({ ...base, prompt: data.prompt, lyrics: data.lyrics, style: data.style });
  }
  const vocal = !data.instrumental;
  return clean({
    ...base,
    title: data.title,
    style: data.style,
    negative_tags: data.negativeTags,
    duration: data.duration,
    ...vocals(data, vocal),
    ...tuning(data, vocal),
    ...persona(data),
  });
}

// ── Upload & Cover (ai-music-api/upload-and-cover-audio) ──
export function buildCoverInput(d: AudioTaskInput): KieInput {
  const vocal = !d.instrumental;
  return clean({
    upload_url: d.uploadUrl,
    instrumental: d.instrumental,
    model: d.model,
    title: d.title?.slice(0, 80),
    style: d.style,
    negative_tags: d.negativeTags,
    duration: d.duration, // yoksa KIE 20 sn üretir
    ...vocals(d, vocal),
    ...tuning(d, vocal),
    ...persona(d),
  });
}

// ── Extend (ai-music-api/extend) — üretilmiş parça ────────
export function buildExtendInput(d: AudioTaskInput): KieInput {
  const vocal = !d.instrumental;
  return clean({
    audio_id: d.audioId,
    model: d.model, // kaynak parçanın sürümüyle aynı olmalı
    continue_at: d.continueAt,
    instrumental: d.instrumental,
    title: d.title?.slice(0, 100),
    style: d.style,
    negative_tags: d.negativeTags,
    ...vocals(d, vocal),
    ...tuning(d, vocal),
    ...persona(d),
  });
}

// ── Upload & Extend (ai-music-api/upload-and-extend-audio) ─
export function buildUploadExtendInput(d: AudioTaskInput): KieInput {
  const vocal = !d.instrumental;
  return clean({
    upload_url: d.uploadUrl,
    model: d.model,
    instrumental: d.instrumental,
    continue_at: d.continueAt,
    title: d.title?.slice(0, 100),
    style: d.style,
    negative_tags: d.negativeTags,
    ...vocals(d, vocal),
    ...tuning(d, vocal),
    ...persona(d),
  });
}

// ── Add Vocals (ai-music-api/add-vocals) ──────────────────
// Zorunlu: upload_url, title, style, negative_tags (≤200)
export const DEFAULT_NEGATIVE = "low quality, distortion, noise";
export function buildAddVocalsInput(d: AudioTaskInput): KieInput {
  return clean({
    upload_url: d.uploadUrl,
    model: d.model,
    title: (d.title || "Vokal").slice(0, 80),
    style: d.style,
    negative_tags: (d.negativeTags || DEFAULT_NEGATIVE).slice(0, 200),
    ...vocals(d, true),
    ...tuning(d, true),
  });
}

// ── Separate vocals / stems (ai-music-api/separate-vocals) ─
// Üretilmiş parça: task_id + audio_id zorunlu
export function buildStemInput(d: AudioTaskInput): KieInput {
  return clean({ task_id: d.taskId, audio_id: d.audioId, type: d.stemType ?? "separate_vocal" });
}

// ── Replace Section (ai-music-api/replace-section) ────────
// Zorunlu: prompt (yeni bölüm sözleri), tags (stil), title, infill_start_s, infill_end_s, full_lyrics
// task_id+audio_id ile gönderildiğinde input.model GÖNDERİLMEZ.
export function buildReplaceSectionInput(d: AudioTaskInput): KieInput {
  const r2 = (n?: number) => (n === undefined ? undefined : Math.round(n * 100) / 100);
  return clean({
    task_id: d.taskId,
    audio_id: d.audioId,
    prompt: d.prompt,
    tags: d.style,
    title: d.title?.slice(0, 80),
    infill_start_s: r2(d.infillStartS),
    infill_end_s: r2(d.infillEndS),
    full_lyrics: d.fullLyrics,
    negative_tags: d.negativeTags,
    vocal_gender: d.vocalGender,
    ...tuning(d, true),
  });
}
