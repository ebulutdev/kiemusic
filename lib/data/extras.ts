import type { TaskDoc } from "./schema";
import { savePersona, saveVoice } from "./users";

/**
 * Persona / ses klonu görevi tamamlanınca (ya da başarısız olunca) kullanıcının
 * users/{uid}.personas | voices haritasındaki kaydı günceller. İstemci kullanıcı
 * belgesini zaten dinlediği için ek okuma gerekmez.
 */
export async function applyExtra(task: TaskDoc, failed = false) {
  const key = task.params?.recordKey as string | undefined;
  if (!key) return;
  const x = task.extra ?? {};
  if (task.taskType === "persona") {
    await savePersona(task.userId, key, failed
      ? { name: String(task.params.name ?? ""), status: "failed" }
      : { name: String(task.params.name ?? ""), personaId: (x.personaId as string) ?? null, status: x.personaId ? "ready" : "pending" });
  } else if (task.taskType === "voice") {
    await saveVoice(task.userId, key, failed
      ? { name: String(task.params.voiceName ?? ""), status: "failed" }
      : { name: String(task.params.voiceName ?? ""), voiceId: (x.voiceId as string) ?? null, status: x.voiceId ? "ready" : "pending" });
  }
}
