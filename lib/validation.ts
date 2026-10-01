import { z } from "zod";

// ── Generate Music ────────────────────────────────────────
export const generateMusicSchema = z
  .object({
    customMode:           z.boolean().default(true),
    instrumental:         z.boolean().default(false),
    model:                z.enum(["V6", "V6_MINI", "V6_WILD"]).default("V6"),
    title:                z.string().trim().max(80).optional().or(z.literal("")),
    prompt:               z.string().max(5000).optional().or(z.literal("")),
    lyrics:               z.string().max(5000).optional().or(z.literal("")),
    style:                z.string().max(1000).optional().or(z.literal("")),
    negativeTags:         z.string().max(1000).optional().or(z.literal("")),
    vocalGender:          z.enum(["m", "f"]).optional(),
    styleWeight:          z.number().min(0).max(1).optional(),
    weirdnessConstraint:  z.number().min(0).max(1).optional(),
    audioWeight:          z.number().min(0).max(1).optional(),
    variety:              z.number().int().min(0).max(4).optional(),
    duration:             z.number().min(10).max(360).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.customMode) {
      if (!data.prompt && !data.style && !data.lyrics) {
        ctx.addIssue({
          code: "custom",
          message: "Non-custom modda prompt, style veya lyrics gerekli.",
          path: ["prompt"],
        });
      }
      return;
    }
    if (!data.title) {
      ctx.addIssue({ code: "custom", message: "Custom mode için title gerekli.", path: ["title"] });
    }
    if (!data.style && !data.lyrics && !data.prompt) {
      ctx.addIssue({ code: "custom", message: "Style, lyrics veya prompt gerekli.", path: ["style"] });
    }
    if (!data.instrumental && !data.lyrics && !data.prompt) {
      ctx.addIssue({ code: "custom", message: "Vokalli üretimde lyrics veya prompt gerekli.", path: ["lyrics"] });
    }
  });

export type GenerateMusicInput = z.infer<typeof generateMusicSchema>;

// ── Audio Cover / Extend / Add Vocals ────────────────────
export const audioTaskSchema = z.object({
  taskType:    z.enum(["cover", "extend", "upload-extend", "add-vocals", "remove-vocals", "replace-section"]),
  uploadUrl:   z.string().url("Geçerli bir URL giriniz").optional(),
  audioId:     z.string().optional(),
  taskId:      z.string().optional(),
  model:       z.enum(["V6", "V6_MINI", "V6_WILD"]).default("V6"),
  title:       z.string().max(80).optional(),
  style:       z.string().max(1000).optional(),
  lyrics:      z.string().max(5000).optional(),
  prompt:      z.string().max(5000).optional(),
  negativeTags:       z.string().max(1000).optional(),
  vocalGender:        z.enum(["m", "f"]).optional(),
  instrumental:       z.boolean().default(false),
  styleWeight:        z.number().min(0).max(1).optional(),
  weirdnessConstraint:z.number().min(0).max(1).optional(),
  audioWeight:        z.number().min(0).max(1).optional(),
  variety:            z.number().int().min(0).max(4).optional(),
  continueAt:         z.number().optional(),   // extend için
  infillStartS:       z.number().optional(),   // replace-section için
  infillEndS:         z.number().optional(),
  stemType:           z.enum(["separate_vocal", "split_stem", "split_stem_advanced"]).optional(),
});

export type AudioTaskInput = z.infer<typeof audioTaskSchema>;

// ── Persona ───────────────────────────────────────────────
export const personaSchema = z.object({
  taskId:      z.string(),
  audioId:     z.string(),
  name:        z.string().min(1).max(80),
  description: z.string().max(500).optional(),
});

// ── Voice ─────────────────────────────────────────────────
export const voiceSchema = z.object({
  validationTaskId: z.string(),
  verifyUrl:        z.string().url(),
  voiceName:        z.string().min(1).max(80),
  description:      z.string().max(500).optional(),
  style:            z.string().max(200).optional(),
  singerSkillLevel: z.enum(["beginner", "intermediate", "professional"]).default("professional"),
});
