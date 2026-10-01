import { NextResponse } from "next/server";
import crypto from "crypto";
import { personaSchema } from "@/lib/validation";
import { createKieTask } from "@/lib/kie";
import { requireUser, errorResponse } from "@/lib/auth";
import { savePersona } from "@/lib/data/users";
import { createTask, getTask, updateTask } from "@/lib/data/tasks";
import { extraResult } from "@/lib/results";

// ai-music-api/generate-persona — zorunlu: task_id, audio_id, name, description
// Kaynak tamamlanmış olmalı; her audio_id yalnız bir kez persona olabilir (409).
// persona_id gelince users/{uid}.personas[id] güncellenir (lib/data/extras.ts).
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const parsed = personaSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Geçersiz istek", details: parsed.error.flatten() }, { status: 400 });
    }
    const { id: clientId, taskId, audioId, name, description, style, seed, vocalStart, vocalEnd } = parsed.data;

    const src = await getTask(taskId);
    if (!src || src.userId !== user.uid) return NextResponse.json({ success: false, error: "Kaynak parça bulunamadı" }, { status: 404 });
    if (src.status !== "COMPLETED") return NextResponse.json({ success: false, error: "Parça henüz tamamlanmadı" }, { status: 409 });

    const id = clientId || crypto.randomUUID();
    const kie = await createKieTask("persona", {
      task_id: taskId,
      audio_id: audioId,
      name,
      description: description || `${name} vokal karakteri`,
      ...(style ? { style } : {}),
      ...(vocalStart !== undefined && vocalEnd !== undefined ? { vocal_start: vocalStart, vocal_end: vocalEnd } : {}),
    });

    await createTask({ providerTaskId: kie.taskId, userId: user.uid, taskType: "persona", cost: 0, params: { recordKey: id, name, taskId, audioId } });
    const direct = extraResult(kie.raw?.data); // bazı yanıtlarda persona_id doğrudan gelir
    if (direct?.personaId) await updateTask(kie.taskId, { status: "COMPLETED", extra: direct });
    await savePersona(user.uid, id, {
      name, description: description || null, providerTaskId: kie.taskId, sourceTaskId: taskId, sourceAudioId: audioId, seed,
      personaId: (direct?.personaId as string) ?? null, status: direct?.personaId ? "ready" : "pending",
    });

    return NextResponse.json({ success: true, persona: { id, name, providerTaskId: kie.taskId, personaId: direct?.personaId ?? null } });
  } catch (error) {
    return errorResponse(error, "PERSONA_ERROR");
  }
}
