import { NextResponse } from "next/server";
import crypto from "crypto";
import { voiceSchema, VOICE_CONSENT_VERSION } from "@/lib/validation";
import { assertOwnUpload } from "@/lib/data/media";
import { createKieTask } from "@/lib/kie";
import { requireAccount, errorResponse } from "@/lib/auth";
import { saveVoice } from "@/lib/data/users";
import { createTask, getTask } from "@/lib/data/tasks";

// Ses klonu 2. adım — ai-music-api/create-voice
// task_id: 1. adımın (validation-phrase) görevi · verify_url: kullanıcının cümleyi okuduğu kayıt.
// voiceId gelince users/{uid}.voices[id] güncellenir (lib/data/extras.ts); üretimde persona_id + voice_persona.
export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const parsed = voiceSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const phrase = await getTask(d.validationTaskId);
    if (!phrase || phrase.userId !== user.uid || phrase.taskType !== "voice-phrase")
      return NextResponse.json({ success: false, error: "Doğrulama adımı bulunamadı" }, { status: 404 });
    await assertOwnUpload(d.verifyUrl, user.uid);
    const consent = { at: new Date().toISOString(), version: VOICE_CONSENT_VERSION };

    const id = d.id || crypto.randomUUID();
    const kie = await createKieTask("voice", {
      task_id: d.validationTaskId,
      verify_url: d.verifyUrl,
      voice_name: d.voiceName,
      ...(d.description ? { description: d.description } : {}),
      ...(d.style ? { style: d.style } : {}),
      singer_skill_level: d.singerSkillLevel,
    });
    await createTask({ providerTaskId: kie.taskId, userId: user.uid, taskType: "voice", cost: 0, params: { recordKey: id, voiceName: d.voiceName, consent } });
    await saveVoice(user.uid, id, { name: d.voiceName, description: d.description || null, style: d.style || null, skillLevel: d.singerSkillLevel, providerTaskId: kie.taskId, status: "pending", voiceId: null, consentAt: consent.at });

    return NextResponse.json({ success: true, voice: { id, name: d.voiceName }, task: { id: kie.taskId, providerTaskId: kie.taskId, status: "QUEUED" } });
  } catch (error) {
    return errorResponse(error, "VOICE_ERROR");
  }
}
