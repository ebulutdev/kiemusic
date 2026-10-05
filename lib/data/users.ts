import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";
import { path, type AppConfig, type CreditPeriod, type UserDoc, type UserPlan, type PersonaDoc, type VoiceDoc } from "./schema";
import { getConfig } from "./config";

export class InsufficientCredits extends Error {
  constructor() { super("Kredi yetersiz."); }
}

const DAY = 86_400_000;
const now = () => FieldValue.serverTimestamp();
const userRef = (uid: string) => adminDb().doc(path.user(uid));
type Doc = Partial<UserDoc>;

/**
 * Aylık kredi dönemi (saf fonksiyon). Değişiklik gerekmiyorsa null.
 *  · İlk dönem: yeni hesap (ya da misafirken 0'da tutulan) başlangıç hediyesini alır; eski hesabın bakiyesi korunur.
 *  · Dönem bitti: aktif abonelik → bakiye plan kredisine sıfırlanır, dönem mağazanın yenileme tarihinde biter;
 *    abonelik yok → bakiye freeMonthly'ye (varsayılan 0) sıfırlanır. Kullanılmayan kredi devretmez.
 */
export function settlePeriod(d: Doc, p: AppConfig["pricing"], t = Date.now()): { credits: number; period: CreditPeriod } | null {
  const span = (p.periodDays || 30) * DAY;
  if (!d.period) {
    const credits = typeof d.credits !== "number" || d.guest ? p.startCredits : d.credits;
    return { credits, period: { start: t, end: t + span, grant: Math.max(credits, p.startCredits) } };
  }
  if (t < d.period.end) return null;
  const plan = d.plan && d.plan.expiresAt > t ? d.plan : null;
  const credits = plan ? plan.credits : p.freeMonthly || 0;
  return { credits, period: { start: t, end: plan ? plan.expiresAt : t + span, grant: credits } };
}

export interface CreditState { credits: number; period: CreditPeriod | null; plan: UserPlan | null }

/**
 * Kullanıcı belgesini hazırlar, kredi durumunu döner (uygulama her açılışta 1 kez çağırır → dönem sıfırlaması burada).
 *  · Misafir (anonim): kredi her zaman 0 (guest: true işaretlenir).
 *  · Hesap: settlePeriod — ilk dönem hediyesi / dönem sonu sıfırlama.
 */
export async function ensureUser(uid: string, anon = false): Promise<CreditState> {
  const { pricing, legal } = await getConfig();
  return adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const snap = await tx.get(ref);
    const d = (snap.data() || {}) as Doc;
    const created = snap.exists ? {} : { createdAt: now() };
    if (anon) {
      if (d.credits !== 0 || !d.guest) tx.set(ref, { credits: 0, guest: true, updatedAt: now(), ...created }, { merge: true });
      return { credits: 0, period: null, plan: null };
    }
    const patch = settlePeriod(d, pricing);
    // İlk dönem = hesabın açıldığı an: giriş ekranında kabul edilen yasal metin sürümü kanıt olarak saklanır
    const terms = !d.period && !d.terms ? { terms: { version: legal?.version ?? null, at: now() } } : {};
    if (patch) tx.set(ref, { ...patch, ...terms, guest: FieldValue.delete(), updatedAt: now(), ...created }, { merge: true });
    return { credits: patch ? patch.credits : d.credits ?? 0, period: patch ? patch.period : d.period ?? null, plan: d.plan ?? null };
  });
}

/** Krediyi atomik düşer (1 okuma + 1 yazma); dönem bittiyse önce sıfırlar. Yetersizse InsufficientCredits. */
export async function chargeCredits(uid: string, amount: number) {
  if (amount <= 0) return;
  const pricing = (await getConfig()).pricing;
  await adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const d = ((await tx.get(ref)).data() || {}) as Doc;
    // Yalnız hesaplar harcar (requireAccount) → misafirken kalan guest işareti hesabın ilk dönemini başlatır
    const patch = settlePeriod(d, pricing);
    const credits = patch ? patch.credits : d.credits ?? 0;
    if (credits < amount) throw new InsufficientCredits();
    tx.set(ref, { ...patch, ...(d.guest ? { guest: FieldValue.delete() } : {}), credits: credits - amount, updatedAt: now() }, { merge: true });
  });
}

/**
 * Abonelik başladı / yenilendi / plan değişti — mağaza makbuzu SUNUCUDA doğrulandıktan sonra çağrılır.
 * Bakiye plan kredisine sıfırlanır (eski bakiye devretmez), dönem mağazanın yenileme tarihinde biter.
 * Aynı işlem (tx) ve tarih ikinci kez gelirse yok sayılır → bildirim tekrarı krediyi yeniden doldurmaz.
 */
export async function startPlan(uid: string, planId: string, expiresAt: number, store: UserPlan["store"], txId?: string) {
  const plan = (await getConfig()).pricing.plans?.find((x) => x.id === planId);
  if (!plan) throw new Error(`Plan tanımlı değil: ${planId}`);
  await adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const cur = ((await tx.get(ref)).data() || {}) as Doc;
    if (cur.plan && cur.plan.id === planId && cur.plan.expiresAt === expiresAt && cur.plan.tx === txId) return;
    tx.set(ref, {
      credits: plan.credits,
      plan: { id: plan.id, credits: plan.credits, expiresAt, store, tx: txId },
      period: { start: Date.now(), end: expiresAt, grant: plan.credits },
      updatedAt: now(),
    }, { merge: true });
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
