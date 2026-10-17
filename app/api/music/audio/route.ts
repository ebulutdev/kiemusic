import { NextResponse } from "next/server";
import { audioTaskSchema, type AudioTaskInput } from "@/lib/validation";
import { createKieTask } from "@/lib/kie";
import {
  buildCoverInput, buildMashupInput, buildExtendInput, buildUploadExtendInput, buildAddVocalsInput,
  buildStemInput, buildReplaceSectionInput,
} from "@/lib/kieInputBuilder";
import { requireAccount, errorResponse, HttpError } from "@/lib/auth";
import { getConfig, getCost } from "@/lib/data/config";
import { chargeCredits, refundCredits } from "@/lib/data/users";
import { createTask, getTask } from "@/lib/data/tasks";
import { assertUsableMedia } from "@/lib/data/media";

// İşlem → KIE input oluşturucu (zorunlu alan kontrolü: lib/validation.ts)
const BUILD: Record<AudioTaskInput["taskType"], (d: AudioTaskInput) => Record<string, unknown>> = {
  cover: buildCoverInput,
  mashup: buildMashupInput,
  extend: buildExtendInput,
  "upload-extend": buildUploadExtendInput,
  "add-vocals": buildAddVocalsInput,
  "remove-vocals": buildStemInput,
  "replace-section": buildReplaceSectionInput,
};

export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const parsed = audioTaskSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Kaynak parçayla çalışan işlemler (uzat, stem, bölüm değiştir): parça bu kullanıcının görevine ait olmalı
    const src = data.taskId ? await getTask(data.taskId) : null;
    if (data.taskId && (!src || src.userId !== user.uid || (data.audioId && !(src.results || []).some((r) => r.id === data.audioId))))
      throw new HttpError(404, "Kaynak parça bulunamadı.");

    // Stem: belge task_id + audio_id yolunu yalnız Generate / Extend görevlerinin parçaları için tanımlar;
    // diğer sonuçlarda (cover, mashup, vokal ekle, sesten uzat) parçanın ses adresi audio_url olarak gider
    if (data.taskType === "remove-vocals" && src && !data.uploadUrl) {
      if (!["generate", "extend"].includes(src.taskType)) {
        const r = (src.results || []).find((x) => x.id === data.audioId);
        if (r?.audio_url) Object.assign(data, { uploadUrl: r.audio_url, sourceTaskId: data.taskId });
      }
    }

    // Ses kaynağı kullanıcıya ait olmalı; yüklenen kayıtta hak (telif) onayı zorunlu
    let mediaKind: string | undefined;
    if (data.uploadUrl) {
      mediaKind = await assertUsableMedia(data.uploadUrl, user.uid, { sourceTaskId: data.sourceTaskId, rightsConfirmed: data.rightsConfirmed });
    }

    // Mashup (Analiz): sabit stil metni (config/app catalog.mashup.style) her isteğin başına eklenir; kullanıcı stili ardından gelir
    if (data.taskType === "mashup") {
      const mx = (await getConfig()).catalog.mashup;
      data.style = [mx?.style, data.style].filter(Boolean).join(", ").slice(0, 1000) || "mashup";
      data.duration ??= mx?.duration;
    }

    // Çoklu stem ayırma KIE'de daha pahalı → ayrı fiyat anahtarı
    const cost = await getCost(data.taskType === "remove-vocals" && data.stemType === "split_stem" ? "split-stem" : data.taskType, data.model);
    await chargeCredits(user.uid, cost, user.verified);
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
      cost,
      task: { id: providerTaskId, providerTaskId, status: "QUEUED", taskType: data.taskType },
    });
  } catch (error) {
    return errorResponse(error, "AUDIO_TASK_ERROR");
  }
}
