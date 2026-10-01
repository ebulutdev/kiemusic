import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { personaSchema } from "@/lib/validation";
import { createPersonaTask } from "@/lib/kie";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = personaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Validation hatası", details: parsed.error.flatten() }, { status: 400 });
    }
    const { taskId, audioId, name, description } = parsed.data;
    const kie = await createPersonaTask({ task_id: taskId, audio_id: audioId, name, description });

    const persona = await db.persona.create({
      data: { name, description: description || null, sourceTaskId: taskId, sourceAudioId: audioId },
    });

    return NextResponse.json({ success: true, persona: { id: persona.id, name, providerTaskId: kie.taskId } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Hata." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const personas = await db.persona.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, personas });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Liste alınamadı." }, { status: 500 });
  }
}
