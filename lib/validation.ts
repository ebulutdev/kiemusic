import { z } from "zod";

const MODEL = z.enum(["V6", "V6_MINI", "V6_WILD"]).default("V6");
const opt = (s: z.ZodString) => s.optional().or(z.literal(""));
// Persona / ses klonu: persona_id + persona_model (style_persona | voice_persona)
const personaFields = {
  personaId:    z.string().max(128).optional(),
  personaModel: z.enum(["style_persona", "voice_persona"]).optional(),
};

// ── Generate Music ────────────────────────────────────────
export const generateMusicSchema = z
  .object({
    customMode:           z.boolean().default(true),
    instrumental:         z.boolean().default(false),
    model:                MODEL,
    title:                opt(z.string().trim().max(80)),
    prompt:               opt(z.string().max(3000)),
    lyrics:               opt(z.string().max(5000)),
    style:                opt(z.string().max(1000)),
    negativeTags:         opt(z.string().max(1000)),
    vocalGender:          z.enum(["m", "f"]).optional(),
    styleWeight:          z.number().min(0).max(1).optional(),
    weirdnessConstraint:  z.number().min(0).max(1).optional(),
    audioWeight:          z.number().min(0).max(1).optional(),
    variety:              z.number().int().min(0).max(4).optional(),
    duration:             z.number().int().min(10).max(360).optional(),
    ...personaFields,
  })
  .superRefine((data, ctx) => {
    if (!data.customMode) {
      // KIE: non-custom modda style veya lyrics zorunlu (prompt tek başına yetmez)
      if (!data.style && !data.lyrics) ctx.addIssue({ code: "custom", message: "Basit modda stil veya söz gerekli.", path: ["style"] });
      return;
    }
    if (!data.title) ctx.addIssue({ code: "custom", message: "Başlık gerekli.", path: ["title"] });
    if (data.instrumental) {
      if (!data.style && !data.negativeTags) ctx.addIssue({ code: "custom", message: "Beat için stil gerekli.", path: ["style"] });
    } else {
      if (!data.lyrics && !data.prompt) ctx.addIssue({ code: "custom", message: "Vokalli üretimde söz gerekli.", path: ["lyrics"] });
      if (!data.style && !data.lyrics && !data.negativeTags) ctx.addIssue({ code: "custom", message: "Stil gerekli.", path: ["style"] });
    }
  });

export type GenerateMusicInput = z.infer<typeof generateMusicSchema>;

// ── Ses kaynaklı işlemler ─────────────────────────────────
export const audioTaskSchema = z
  .object({
    taskType:           z.enum(["cover", "extend", "upload-extend", "add-vocals", "remove-vocals", "replace-section"]),
    uploadUrl:          z.string().url("Geçerli bir URL giriniz").optional(),
    audioId:            z.string().optional(),
    taskId:             z.string().optional(),
    model:              MODEL,
    title:              z.string().max(100).optional(),
    style:              z.string().max(1000).optional(),
    lyrics:             z.string().max(5000).optional(),
    prompt:             z.string().max(5000).optional(),
    fullLyrics:         z.string().max(5000).optional(),  // replace-section: düzenlenmiş tüm sözler
    negativeTags:       z.string().max(1000).optional(),
    vocalGender:        z.enum(["m", "f"]).optional(),
    instrumental:       z.boolean().default(false),
    styleWeight:        z.number().min(0).max(1).optional(),
    weirdnessConstraint:z.number().min(0).max(1).optional(),
    audioWeight:        z.number().min(0).max(1).optional(),
    variety:            z.number().int().min(0).max(4).optional(),
    duration:           z.number().int().min(10).max(360).optional(), // cover çıktı süresi
    continueAt:         z.number().positive().optional(),             // extend
    infillStartS:       z.number().min(0).optional(),                 // replace-section
    infillEndS:         z.number().min(0).optional(),
    stemType:           z.enum(["separate_vocal", "split_stem"]).optional(),
    sourceTaskId:       z.string().max(128).optional(),               // uploadUrl kütüphanedeki bir parçaysa: o parçanın görevi
    rightsConfirmed:    z.boolean().optional(),                       // yüklenen kayıt: "haklarına sahibim" onayı
    ...personaFields,
  })
  .superRefine((d, ctx) => {
    const need = (ok: unknown, path: string, message: string) => { if (!ok) ctx.addIssue({ code: "custom", path: [path], message }); };
    switch (d.taskType) {
      case "cover":
      case "upload-extend":
        need(d.uploadUrl, "uploadUrl", "Ses dosyası gerekli.");
        break;
      case "add-vocals":
        need(d.uploadUrl, "uploadUrl", "Ses dosyası gerekli.");
        need(d.style, "style", "Stil gerekli.");
        need(d.lyrics || d.prompt, "lyrics", "Sözler gerekli.");
        break;
      case "extend":
        need(d.audioId, "audioId", "Kaynak parça gerekli.");
        break;
      case "remove-vocals":
        need(d.taskId && d.audioId, "audioId", "Kaynak parça gerekli.");
        break;
      case "replace-section": {
        need(d.taskId && d.audioId, "audioId", "Kaynak parça gerekli.");
        need(d.prompt, "prompt", "Yeni bölümün sözleri gerekli.");
        need(d.fullLyrics, "fullLyrics", "Şarkının tüm sözleri gerekli.");
        need(d.style, "style", "Stil gerekli.");
        need(d.title, "title", "Başlık gerekli.");
        const a = d.infillStartS ?? 0, b = d.infillEndS ?? 0;
        need(b - a >= 10, "infillEndS", "Bölüm en az 10 saniye olmalı.");
        break;
      }
    }
  });

export type AudioTaskInput = z.infer<typeof audioTaskSchema>;

// ── Persona (ai-music-api/generate-persona) ───────────────
export const personaSchema = z.object({
  id:          z.string().max(64).optional(), // istemcideki kayıt id'si
  seed:        z.number().optional(),
  taskId:      z.string(),
  audioId:     z.string(),
  name:        z.string().trim().min(1).max(80),
  description: z.string().max(500).optional(),
  style:       z.string().max(1000).optional(),
  vocalStart:  z.number().min(0).optional(),
  vocalEnd:    z.number().min(0).optional(),
});

// Ses klonu izni: kullanıcı sesin kendisine ait olduğunu (ya da sahibinin açık iznini) onaylar
const CONSENT = z.literal(true, { errorMap: () => ({ message: "Sesin sana ait olduğunu onaylaman gerekiyor." }) });
export const VOICE_CONSENT_VERSION = "2026-10-voice-v2"; // v2: "doğacak sorumluluk bana aittir" eklendi

// ── Ses klonu: 1) doğrulama cümlesi (ai-music-api/validation-phrase) ──
export const voicePhraseSchema = z.object({
  consent:    CONSENT,
  voiceUrl:   z.string().url(),
  vocalStart: z.number().int().min(0),
  vocalEnd:   z.number().int().min(1),
  language:   z.enum(["en", "zh", "es", "fr", "pt", "de", "ja", "ko", "hi", "ru"]).default("en"),
});

// ── Ses klonu: 2) ses oluştur (ai-music-api/create-voice) ──
export const voiceSchema = z.object({
  consent:          CONSENT,
  id:               z.string().max(64).optional(),
  validationTaskId: z.string(),
  verifyUrl:        z.string().url(),
  voiceName:        z.string().trim().min(1).max(80),
  description:      z.string().max(500).optional(),
  style:            z.string().max(200).optional(),
  singerSkillLevel: z.enum(["beginner", "intermediate", "advanced", "professional"]).default("intermediate"),
});

// ── Şikâyet / içerik bildirimi ────────────────────────────
export const REPORT_REASONS = ["offensive", "copyright", "impersonation", "sexual", "other"] as const;
export const reportSchema = z.object({
  taskId:  z.string().trim().min(1).max(128).optional(),   // KIE görev id'si (parçanın providerTaskId'si)
  audioId: z.string().trim().max(128).optional(),
  title:   z.string().trim().max(120).optional(),
  reason:  z.enum(REPORT_REASONS),
  note:    z.string().trim().max(500).optional(),
});
