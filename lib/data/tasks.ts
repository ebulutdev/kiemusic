import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";
import { path, type TaskDoc, type TaskResult, type TaskStatus, type TaskType } from "./schema";
import { refundCredits } from "./users";

const now = () => FieldValue.serverTimestamp();
const ref = (id: string) => adminDb().doc(path.task(id));

/** undefined / null / "" alanları at — Firestore belgesini küçük tut */
function compact<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== "")) as Partial<T>;
}

export async function createTask(input: {
  providerTaskId: string;
  userId: string;
  taskType: TaskType;
  cost: number;
  params: Record<string, unknown>;
}): Promise<TaskDoc> {
  const doc: TaskDoc = {
    providerTaskId: input.providerTaskId,
    userId: input.userId,
    taskType: input.taskType,
    status: "QUEUED",
    cost: input.cost,
    refunded: false,
    params: compact(input.params),
    results: [],
    mirror: "none",
  };
  await ref(input.providerTaskId).set({ ...doc, createdAt: now(), updatedAt: now() });
  return doc;
}

export async function getTask(providerTaskId: string): Promise<TaskDoc | null> {
  const snap = await ref(providerTaskId).get();
  return snap.exists ? (snap.data() as TaskDoc) : null;
}

export async function updateTask(providerTaskId: string, patch: Partial<TaskDoc>) {
  const data: Record<string, unknown> = { ...patch, updatedAt: now() };
  if (patch.status === "COMPLETED") data.completedAt = now();
  await ref(providerTaskId).set(data, { merge: true });
}

export async function setResults(providerTaskId: string, status: TaskStatus, results: TaskResult[], callbackType?: string) {
  await updateTask(providerTaskId, { status, ...(results.length ? { results } : {}), ...(callbackType ? { callbackType } : {}) });
}

/** Görevi başarısız işaretler ve krediyi yalnız bir kez iade eder (transaction ile). */
export async function failTask(providerTaskId: string, code: string, message: string) {
  const db = adminDb();
  const r = ref(providerTaskId);
  const refund = await db.runTransaction(async (tx) => {
    const snap = await tx.get(r);
    if (!snap.exists) return null;
    const t = snap.data() as TaskDoc;
    const doRefund = !t.refunded && t.cost > 0;
    tx.update(r, { status: "FAILED", errorCode: code, errorMessage: message, refunded: t.refunded || doRefund, updatedAt: now() });
    return doRefund ? { uid: t.userId, cost: t.cost } : null;
  });
  if (refund) await refundCredits(refund.uid, refund.cost);
}

/** Medya kopyalama işini sahiplen — eşzamanlı isteklerde yalnız biri kopyalar. */
export async function claimMirror(providerTaskId: string): Promise<boolean> {
  const db = adminDb();
  const r = ref(providerTaskId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(r);
    const t = snap.data() as TaskDoc | undefined;
    if (!t || (t.mirror && t.mirror !== "none" && t.mirror !== "failed")) return false;
    tx.update(r, { mirror: "running" });
    return true;
  });
}
