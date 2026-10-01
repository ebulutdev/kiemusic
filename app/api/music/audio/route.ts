import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audioTaskSchema } from "@/lib/validation";
import {
  createCoverTask, createExtendTask, createUploadExtendTask, createAddVocalsTask,
  createSeparateVocalsTask, createReplaceSectionTask,
} from "@/lib/kie";
import {
  buildCoverInput, buildExtendInput, buildUploadExtendInput, buildAddVocalsInput,
  buildStemInput, buildReplaceSectionInput,
} from "@/lib/kieInputBuilder";

// Hangi işlem hangi kaynağı ister
const NEEDS_URL = ["cover", "upload-extend", "add-vocals"];
const NEEDS_AUDIO_ID = ["extend", "remove-vocals", "replace-section"];

export async function POST(request: Request) {
  try {
    const parsed = audioTaskSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    if (NEEDS_URL.includes(data.taskType) && !data.uploadUrl)
      return NextResponse.json({ success: false, error: "Ses dosyası adresi gerekli" }, { status: 400 });
    if (NEEDS_AUDIO_ID.includes(data.taskType) && !data.audioId)
      return NextResponse.json({ success: false, error: "Kaynak parça kimliği gerekli" }, { status: 400 });
    if (data.taskType === "replace-section") {
      if (!data.taskId) return NextResponse.json({ success: false, error: "Kaynak görev kimliği gerekli" }, { status: 400 });
      const a = data.infillStartS ?? 0, b = data.infillEndS ?? 0;
      if (b - a < 10) return NextResponse.json({ success: false, error: "Bölüm en az 10 saniye olmalı" }, { status: 400 });
    }

    let kie: { taskId: string };
    switch (data.taskType) {
      case "cover":           kie = await createCoverTask(buildCoverInput(data)); break;
      case "extend":          kie = await createExtendTask(buildExtendInput(data)); break;
      case "upload-extend":   kie = await createUploadExtendTask(buildUploadExtendInput(data)); break;
      case "add-vocals":      kie = await createAddVocalsTask(buildAddVocalsInput(data)); break;
      case "remove-vocals":   kie = await createSeparateVocalsTask(buildStemInput(data)); break;
      case "replace-section": kie = await createReplaceSectionTask(buildReplaceSectionInput(data)); break;
    }

    const task = await db.musicTask.create({
      data: {
        providerTaskId: kie.taskId,
        taskType:       data.taskType,
        status:         "QUEUED",
        customMode:     true,
        instrumental:   data.instrumental,
        model:          data.model,
        title:          data.title || null,
        style:          data.style || null,
        lyrics:         data.lyrics || null,
        negativeTags:   data.negativeTags || null,
        vocalGender:    data.vocalGender || null,
        sourceAudioUrl: data.uploadUrl || null,
        sourceAudioId:  data.audioId || null,
        continueAt:     data.continueAt ?? null,
        infillStartS:   data.infillStartS ?? null,
        infillEndS:     data.infillEndS ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      task: { id: task.id, providerTaskId: task.providerTaskId, status: task.status, taskType: data.taskType },
    });
  } catch (error) {
    console.error("AUDIO_TASK_ERROR", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Beklenmeyen hata" },
      { status: 500 }
    );
  }
}
