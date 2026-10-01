import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { voiceSchema } from "@/lib/validation";
import { createVoiceTask } from "@/lib/kie";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = voiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation hatası", details: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const kie = await createVoiceTask({
      task_id:          d.validationTaskId,
      verify_url:       d.verifyUrl,
      voice_name:       d.voiceName,
      description:      d.description,
      style:            d.style,
      singer_skill_level: d.singerSkillLevel,
    });

    const voice = await db.voice.create({
      data: { name: d.voiceName, description: d.description || null, style: d.style || null, skillLevel: d.singerSkillLevel, verifyUrl: d.verifyUrl },
    });

    return NextResponse.json({ success: true, voice: { id: voice.id, name: d.voiceName, providerTaskId: kie.taskId } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Hata." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const voices = await db.voice.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, voices });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Liste alınamadı." }, { status: 500 });
  }
}
