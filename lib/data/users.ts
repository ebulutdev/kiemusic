import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";
import { COL, path, type AppConfig, type CreditPeriod, type UserDoc, type UserPlan, type PersonaDoc, type VoiceDoc } from "./schema";
import { getConfig } from "./config";

export class InsufficientCredits extends Error {
  constructor() { super("Kredi yetersiz."); }
}
// Başlangıç hediyesi ve harcama yalnız Apple / Google ile bağlı hesaba (uydurma e-postalarla kredi toplanamasın)
export class TrustedLoginRequired extends Error {
  constructor() { super("Kredi kullanmak için Apple ya da Google ile giriş yap."); }
}
// Koşullar / Gizlilik'in güncel sürümü kabul edilmeden kredi harcanamaz (yeni hesap, eski hesap ve sürüm değişimi için ortak kural)
export class TermsRequired extends Error {
  constructor() { super("Güncel Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmeniz gerekmektedir."); }
}
// Ücretsiz uçların (persona, ses klonu) kötüye kullanımına karşı günlük sınır
export class QuotaExceeded extends Error {
  constructor() { super("Bugünlük sınıra ulaştın, yarın tekrar dene."); }
}

const DAY = 86_400_000;
const now = () => FieldValue.serverTimestamp();
const userRef = (uid: string) => adminDb().doc(path.user(uid));
type Doc = Partial<UserDoc>;

/**
 * Aylık kredi dönemi (saf fonksiyon). Değişiklik gerekmiyorsa null.
 *  · İlk dönem: yeni hesap (daha önce başlangıç hediyesi almadıysa: giftClaimed=false) ömür boyu 1 kez başlangıç hediyesini alır.
 *  · Dönem bitti: aktif abonelik → bakiye plan kredisine sıfırlanır, dönem mağazanın yenileme tarihinde biter;
 *    abonelik yok → bakiye 0'a (freeMonthly=0) düşer ve ücretsiz hesaplara bir daha aylık kredi verilmez.
 */
export function settlePeriod(d: Doc, p: AppConfig["pricing"], t = Date.now(), giftClaimed = false): { credits: number; period: CreditPeriod } | null {
  const span = (p.periodDays || 30) * DAY;
  if (!d.period) {
    const start = giftClaimed ? 0 : p.startCredits;
    const credits = typeof d.credits !== "number" || d.guest || d.unverified ? start : d.credits;
    return { credits, period: { start: t, end: t + span, grant: Math.max(credits, start) } };
  }
  if (t < d.period.end) return null;
  const plan = d.plan && d.plan.expiresAt > t ? d.plan : null;
  if (!plan && (p.freeMonthly || 0) === 0 && d.credits === 0) return null;
  const credits = plan ? plan.credits : p.freeMonthly || 0;
  return { credits, period: { start: t, end: plan ? plan.expiresAt : t + span, grant: credits } };
}

export interface CreditState { credits: number; period: CreditPeriod | null; plan: UserPlan | null }

/**
 * Kullanıcı belgesini hazırlar, kredi durumunu döner (uygulama her açılışta 1 kez çağırır → dönem sıfırlaması burada).
 *  · Misafir (anonim): kredi her zaman 0 (guest: true işaretlenir).
 *  · Hesap: settlePeriod — Apple ID / Google kimliği başına ömür boyu yalnız 1 kez başlangıç hediyesi (iap/gift_<sha256>).
 */
export async function ensureUser(uid: string, anon = false, verified = true, acceptedTerms?: string, giftId?: string): Promise<CreditState & { termsOk: boolean }> {
  const { pricing, legal } = await getConfig();
  return adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const snap = await tx.get(ref);
    const d = (snap.data() || {}) as Doc;
    const created = snap.exists ? {} : { createdAt: now() };
    if (anon) {
      if (d.credits !== 0 || !d.guest) tx.set(ref, { credits: 0, guest: true, updatedAt: now(), ...created }, { merge: true });
      return { credits: 0, period: null, plan: null, termsOk: false };
    }
    // Apple / Google ile bağlı olmayan hesap: ilk dönem (hediye) başlamaz, kredi 0
    if (!verified && !d.period) {
      if (d.credits !== 0 || !d.unverified) tx.set(ref, { credits: 0, unverified: true, guest: FieldValue.delete(), updatedAt: now(), ...created }, { merge: true });
      return { credits: 0, period: null, plan: null, termsOk: false };
    }
    let giftClaimed = false;
    const giftRef = !d.period && giftId ? adminDb().collection(COL.iap).doc(giftId) : null;
    if (giftRef) {
      const gSnap = await tx.get(giftRef);
      giftClaimed = gSnap.exists;
    }
    const patch = settlePeriod(d, pricing, Date.now(), giftClaimed);
    if (giftRef && !giftClaimed) tx.set(giftRef, { store: "gift", at: Date.now() });
    // Kabul kaydı: istemci yalnız kullanıcı kutuyu işaretleyince / "Kabul ediyorum"a basınca sürümü gönderir; sunucu SÜRÜMÜ güncel yayınla karşılaştırıp
    // kanıt olarak yazar (users/{uid}.terms). Eski kabul (başka sürüm) güncel sayılmaz.
    const cur = legal?.version ?? null;
    const accept = cur && acceptedTerms === cur && d.terms?.version !== cur ? { terms: { version: cur, at: now(), prev: d.terms?.version ?? null } } : {};
    if (patch || accept.terms) tx.set(ref, { ...(patch || {}), ...accept, guest: FieldValue.delete(), unverified: FieldValue.delete(), updatedAt: now(), ...created }, { merge: true });
    return { credits: patch ? patch.credits : d.credits ?? 0, period: patch ? patch.period : d.period ?? null, plan: d.plan ?? null, termsOk: !cur || !!accept.terms || d.terms?.version === cur };
  });
}

/** Krediyi atomik düşer (1 okuma + 1 yazma); dönem bittiyse önce sıfırlar. Yetersizse InsufficientCredits. */
export async function chargeCredits(uid: string, amount: number, verified = true) {
  if (amount <= 0) return;
  const { pricing, legal } = await getConfig();
  await adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const d = ((await tx.get(ref)).data() || {}) as Doc;
    if (legal?.version && d.terms?.version !== legal.version) throw new TermsRequired();
    // Yalnız hesaplar harcar (requireAccount) → misafirken kalan guest işareti hesabın ilk dönemini başlatır
    if (!verified && !d.period) throw new TrustedLoginRequired(); // Apple / Google ile bağlı olmayan hesap harcayamaz
    const patch = settlePeriod(d, pricing, Date.now(), true);
    const credits = patch ? patch.credits : d.credits ?? 0;
    if (credits < amount) throw new InsufficientCredits();
    const clear = { ...(d.guest ? { guest: FieldValue.delete() } : {}), ...(d.unverified ? { unverified: FieldValue.delete() } : {}) };
    tx.set(ref, { ...patch, ...clear, credits: credits - amount, updatedAt: now() }, { merge: true });
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

/** Günlük kota: users/{uid}.quota.{key} = { day, n } (ek koleksiyon yok). Sınır config/app limits.{key}; tanımsızsa sınır yok. */
export async function takeQuota(uid: string, key: string) {
  const max = (await getConfig()).limits?.[key];
  if (!max) return;
  const day = new Date().toISOString().slice(0, 10);
  await adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const q = (((await tx.get(ref)).data() || {}) as Doc).quota?.[key];
    const n = q && q.day === day ? q.n : 0;
    if (n >= max) throw new QuotaExceeded();
    tx.set(ref, { quota: { [key]: { day, n: n + 1 } } }, { merge: true });
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
