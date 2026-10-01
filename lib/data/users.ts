import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";
import { path, type UserDoc, type PersonaDoc, type VoiceDoc } from "./schema";
import { getStartCredits } from "./config";

export class InsufficientCredits extends Error {
  constructor() { super("Kredi yetersiz."); }
}

const now = () => FieldValue.serverTimestamp();
const userRef = (uid: string) => adminDb().doc(path.user(uid));
const creditsOf = (snap: DocumentSnapshot): number | undefined => {
  const c = snap.exists ? (snap.data() as UserDoc).credits : undefined;
  return typeof c === "number" ? c : undefined;
};

/** Kredi alanı yoksa başlangıç kredisiyle oluşturur; mevcut krediyi döner (1 okuma, gerekirse 1 yazma). */
export async function ensureUser(uid: string): Promise<number> {
  const start = await getStartCredits();
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const c = creditsOf(snap);
    if (c !== undefined) return c;
    tx.set(userRef(uid), { credits: start, createdAt: now(), updatedAt: now() }, { merge: true });
    return start;
  });
}

/** Krediyi atomik düşer (1 okuma + 1 yazma). Yetersizse InsufficientCredits. */
export async function chargeCredits(uid: string, amount: number) {
  if (amount <= 0) return;
  const start = await getStartCredits();
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(userRef(uid));
    const credits = creditsOf(snap) ?? start;
    if (credits < amount) throw new InsufficientCredits();
    tx.set(userRef(uid), { credits: credits - amount, updatedAt: now() }, { merge: true });
  });
}

/** Kredi iadesi — okuma gerektirmez (atomik increment). */
export async function refundCredits(uid: string, amount: number) {
  if (!uid || amount <= 0) return;
  await userRef(uid).set({ credits: FieldValue.increment(amount), updatedAt: now() }, { merge: true });
}

/** Persona / ses: users/{uid} belgesindeki haritaya tek alan yazımı (okuma yok). */
export async function savePersona(uid: string, id: string, data: PersonaDoc) {
  await userRef(uid).set({ personas: { [id]: data }, updatedAt: now() }, { merge: true });
}

export async function saveVoice(uid: string, id: string, data: VoiceDoc) {
  await userRef(uid).set({ voices: { [id]: data }, updatedAt: now() }, { merge: true });
}
