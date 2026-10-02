import { NextResponse } from "next/server";
import { audioTaskSchema, type AudioTaskInput } from "@/lib/validation";
import { createKieTask } from "@/lib/kie";
import {
  buildCoverInput, buildExtendInput, buildUploadExtendInput, buildAddVocalsInput,
  buildStemInput, buildReplaceSectionInput,
} from "@/lib/kieInputBuilder";
import { requireUser, errorResponse } from "@/lib/auth";
import { getCost } from "@/lib/data/config";
import { chargeCredits, refundCredits } from "@/lib/data/users";
import { createTask } from "@/lib/data/tasks";
import { assertUsableMedia } from "@/lib/data/media";

// İşlem → KIE input oluşturucu (zorunlu alan kontrolü: lib/validation.ts)
const BUILD: Record<AudioTaskInput["taskType"], (d: AudioTaskInput) => Record<string, unknown>> = {
  cover: buildCoverInput,
  extend: buildExtendInput,
  "upload-extend": buildUploadExtendInput,
  "add-vocals": buildAddVocalsInput,
  "remove-vocals": buildStemInput,
  "replace-section": buildReplaceSectionInput,
};

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const parsed = audioTaskSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Ses kaynağı kullanıcıya ait olmalı; yüklenen kayıtta hak (telif) onayı zorunlu
    let mediaKind: string | undefined;
    if (data.uploadUrl) {
      mediaKind = await assertUsableMedia(data.uploadUrl, user.uid, { sourceTaskId: data.sourceTaskId, rightsConfirmed: data.rightsConfirmed });
    }

    // Çoklu stem ayırma KIE'de daha pahalı → ayrı fiyat anahtarı
    const cost = await getCost(data.taskType === "remove-vocals" && data.stemType === "split_stem" ? "split-stem" : data.taskType);
    await chargeCredits(user.uid, cost);
    let providerTaskId: string;
    try {
      providerTaskId = (await createKieTask(data.taskType, BUILD[data.taskType](data))).taskId;
    } catch (err) {
      await refundCredits(user.uid, cost);
      throw err;
    }

    await createTask({ providerTaskId, userId: user.uid, taskType: data.taskType, cost, params: { ...data, ...(mediaKind ? { mediaKind } : {}), ...(data.rightsConfirmed ? { rightsConfirmedAt: new Date().toISOString() } : {}) } });

    return NextResponse.json({
      success: true,
      task: { id: providerTaskId, providerTaskId, status: "QUEUED", taskType: data.taskType },
    });
  } catch (error) {
    return errorResponse(error, "AUDIO_TASK_ERROR");
  }
}
