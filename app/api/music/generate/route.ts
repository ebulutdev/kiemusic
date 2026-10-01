import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateMusicSchema } from "@/lib/validation";
import { createMusicTask } from "@/lib/kie";
import { buildGenerateInput } from "@/lib/kieInputBuilder";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateMusicSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation hatası", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const input = buildGenerateInput(data);
    const kie = await createMusicTask(input);

    const task = await db.musicTask.create({
      data: {
        providerTaskId:      kie.taskId,
        taskType:            "generate",
        status:              "QUEUED",
        customMode:          data.customMode,
        instrumental:        data.instrumental,
        model:               data.model,
        title:               data.title || null,
        prompt:              data.prompt || null,
        lyrics:              data.lyrics || null,
        style:               data.style || null,
        negativeTags:        data.negativeTags || null,
        vocalGender:         data.vocalGender || null,
        styleWeight:         data.styleWeight ?? null,
        weirdnessConstraint: data.weirdnessConstraint ?? null,
        audioWeight:         data.audioWeight ?? null,
        variety:             data.variety ?? null,
        duration:            data.duration ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      task: { id: task.id, providerTaskId: task.providerTaskId, status: task.status },
    });
  } catch (error) {
    console.error("GENERATE_ERROR", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Beklenmeyen hata." },
      { status: 500 }
    );
  }
}
