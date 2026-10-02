import { NextResponse } from "next/server";
import { voicePhraseSchema } from "@/lib/validation";
import { createKieTask } from "@/lib/kie";
import { requireUser, errorResponse } from "@/lib/auth";
import { createTask } from "@/lib/data/tasks";
import { assertOwnUpload } from "@/lib/data/media";
import { VOICE_CONSENT_VERSION } from "@/lib/validation";

// Ses klonu 1. adım — ai-music-api/validation-phrase
// Kullanıcının ses kaydından KIE bir doğrulama cümlesi üretir (sonuç: extra.phrase).
// İstemci /api/music/tasks/{id} ile bekler; cümle gelince kullanıcı onu okuyup kaydeder (2. adım: /api/voice).
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const parsed = voicePhraseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    if (d.vocalEnd <= d.vocalStart) return NextResponse.json({ success: false, error: "Geçersiz ses aralığı" }, { status: 400 });
    await assertOwnUpload(d.voiceUrl, user.uid); // ses klonu yalnız kullanıcının kendi kaydından

    const kie = await createKieTask("voice-phrase", {
      voice_url: d.voiceUrl, vocal_start_s: d.vocalStart, vocal_end_s: d.vocalEnd, language: d.language,
    });
    await createTask({ providerTaskId: kie.taskId, userId: user.uid, taskType: "voice-phrase", cost: 0,
      params: { ...d, consent: { at: new Date().toISOString(), version: VOICE_CONSENT_VERSION } } });
    return NextResponse.json({ success: true, task: { id: kie.taskId, providerTaskId: kie.taskId, status: "QUEUED" } });
  } catch (error) {
    return errorResponse(error, "VOICE_PHRASE_ERROR");
  }
}
