import type { TaskDoc } from "./schema";
import { claimMirror, updateTask } from "./tasks";
import { mirrorResults } from "./storage";

/** Tamamlanan görevin medyasını Storage'a kopyalar (görev başına bir kez). */
export async function mirrorIfNeeded(task: TaskDoc): Promise<TaskDoc> {
  if (task.status !== "COMPLETED" || !task.results.length || task.mirror === "done") return task;
  if (!(await claimMirror(task.providerTaskId))) return task;
  try {
    const results = await mirrorResults(task.userId, task.providerTaskId, task.results);
    await updateTask(task.providerTaskId, { results, mirror: "done" });
    return { ...task, results, mirror: "done" };
  } catch (err) {
    console.error("MIRROR_ERROR", err);
    await updateTask(task.providerTaskId, { mirror: "failed" });
    return task;
  }
}
