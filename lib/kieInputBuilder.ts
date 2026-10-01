import type { GenerateMusicInput, AudioTaskInput } from "./validation";

type KieInput = Record<string, unknown>;

function clean(obj: KieInput): KieInput {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

// ── Generate ──────────────────────────────────────────────
export function buildGenerateInput(data: GenerateMusicInput): KieInput {
  const input: KieInput = {
    custom_mode: data.customMode,
    instrumental: data.instrumental,
    model: data.model,
  };

  if (data.customMode) {
    if (data.title)        input.title         = data.title;
    if (data.prompt)       input.prompt        = data.prompt;
    if (data.lyrics)       input.lyrics        = data.lyrics;
    if (data.style)        input.style         = data.style;
    if (data.negativeTags) input.negative_tags = data.negativeTags;
    if (data.duration)     input.duration      = data.duration;

    // Vokalli modda vokal kontrollerini ekle
    if (!data.instrumental) {
      if (data.vocalGender)          input.vocal_gender         = data.vocalGender;
      if (data.styleWeight !== undefined)        input.style_weight         = data.styleWeight;
      if (data.weirdnessConstraint !== undefined)input.weirdness_constraint = data.weirdnessConstraint;
      if (data.audioWeight !== undefined)        input.audio_weight         = data.audioWeight;
      if (data.variety !== undefined)            input.variety              = data.variety;
    }
    // Instrumental modda vokal alanları gönderilmez (KIE docs)
  } else {
    // Non-custom mode: yalnızca temel alanlar
    if (data.prompt) input.prompt = data.prompt;
    if (data.lyrics) input.lyrics = data.lyrics;
    if (data.style)  input.style  = data.style;
  }

  return clean(input);
}

// ── Cover ─────────────────────────────────────────────────
export function buildCoverInput(data: AudioTaskInput): KieInput {
  const input: KieInput = {
    upload_url:   data.uploadUrl,
    model:        data.model,
    custom_mode:  true,
    instrumental: data.instrumental,
  };
  if (data.title)        input.title         = data.title;
  if (data.style)        input.style         = data.style;
  if (data.negativeTags) input.negative_tags = data.negativeTags;

  if (!data.instrumental) {
    if (data.lyrics)                          input.lyrics               = data.lyrics;
    if (data.vocalGender)                     input.vocal_gender         = data.vocalGender;
    if (data.styleWeight !== undefined)       input.style_weight         = data.styleWeight;
    if (data.weirdnessConstraint !== undefined) input.weirdness_constraint = data.weirdnessConstraint;
    if (data.audioWeight !== undefined)       input.audio_weight         = data.audioWeight;
    if (data.variety !== undefined)           input.variety              = data.variety;
  }
  return clean(input);
}

// ── Extend ────────────────────────────────────────────────
export function buildExtendInput(data: AudioTaskInput): KieInput {
  const input: KieInput = {
    audio_id:    data.audioId,
    model:       data.model,
  };
  if (data.continueAt !== undefined) input.continue_at    = data.continueAt;
  if (data.prompt)                   input.prompt         = data.prompt;
  if (data.style)                    input.style          = data.style;
  if (data.title)                    input.title          = data.title;
  if (data.negativeTags)             input.negative_tags  = data.negativeTags;
  if (data.vocalGender)              input.vocal_gender   = data.vocalGender;
  if (data.styleWeight !== undefined)       input.style_weight         = data.styleWeight;
  if (data.weirdnessConstraint !== undefined) input.weirdness_constraint = data.weirdnessConstraint;
  if (data.audioWeight !== undefined)       input.audio_weight         = data.audioWeight;
  if (data.variety !== undefined)           input.variety              = data.variety;
  return clean(input);
}

// ── Add Vocals ────────────────────────────────────────────
export function buildAddVocalsInput(data: AudioTaskInput): KieInput {
  const input: KieInput = {
    upload_url: data.uploadUrl,
    model:      data.model,
  };
  if (data.prompt)       input.prompt         = data.prompt;
  if (data.style)        input.style          = data.style;
  if (data.title)        input.title          = data.title;
  if (data.lyrics)       input.lyrics         = data.lyrics;
  if (data.vocalGender)  input.vocal_gender   = data.vocalGender;
  if (data.styleWeight !== undefined)       input.style_weight         = data.styleWeight;
  if (data.weirdnessConstraint !== undefined) input.weirdness_constraint = data.weirdnessConstraint;
  if (data.audioWeight !== undefined)       input.audio_weight         = data.audioWeight;
  if (data.variety !== undefined)           input.variety              = data.variety;
  return clean(input);
}

// ── Remove Vocals / Stem ──────────────────────────────────
export function buildStemInput(data: AudioTaskInput): KieInput {
  return clean({
    audio_id: data.audioId,
    type:     data.stemType ?? "separate_vocal",
  });
}

// ── Replace Section ───────────────────────────────────────
export function buildReplaceSectionInput(data: AudioTaskInput): KieInput {
  return clean({
    task_id:        data.taskId,
    audio_id:       data.audioId,
    prompt:         data.prompt,
    tags:           data.style,
    title:          data.title,
    infill_start_s: data.infillStartS,
    infill_end_s:   data.infillEndS,
    lyrics:         data.lyrics,
    negative_tags:  data.negativeTags,
    vocal_gender:   data.vocalGender,
    style_weight:         data.styleWeight,
    weirdness_constraint: data.weirdnessConstraint,
    audio_weight:         data.audioWeight,
    variety:              data.variety,
  });
}

// ── Upload & Extend ───────────────────────────────────────
export function buildUploadExtendInput(data: AudioTaskInput): KieInput {
  const input: KieInput = {
    upload_url:   data.uploadUrl,
    model:        data.model,
    custom_mode:  true,
    instrumental: data.instrumental,
  };
  if (data.title)        input.title         = data.title;
  if (data.style)        input.style         = data.style;
  if (data.prompt)       input.prompt        = data.prompt;
  if (data.negativeTags) input.negative_tags = data.negativeTags;
  if (data.continueAt !== undefined) input.continue_at = data.continueAt;
  if (!data.instrumental) {
    if (data.lyrics)      input.lyrics       = data.lyrics;
    if (data.vocalGender) input.vocal_gender = data.vocalGender;
  }
  return clean(input);
}
