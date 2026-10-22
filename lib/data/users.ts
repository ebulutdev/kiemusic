import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";
import { COL, path, type AppConfig, type CreditPeriod, type UserDoc, type UserPlan, type PersonaDoc, type VoiceDoc } from "./schema";
import { getConfig } from "./config";
import { notifyLowCredit, sendToUser } from "../push";

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
 *  · Dönem bitti, aktif abonelik → plan kredisi + devredilen (satın alınmamış) bakiye; dönem mağazanın yenileme tarihinde biter.
 *  · Dönem bitti, abonelik sona ermiş → satın alınan kredi silinir, yalnız devredilen bakiye (plan.carry) kalır.
 *  · Hiç abone olmamış hesap → hediye / ücretsiz kredi SÜRESİZ kalır (kullanılana kadar); freeMonthly>0 ise en az o kadar.
 */
export function settlePeriod(d: Doc, p: AppConfig["pricing"], t = Date.now(), giftClaimed = false): { credits: number; period: CreditPeriod } | null {
  const span = (p.periodDays || 30) * DAY;
  if (!d.period) {
    const start = giftClaimed ? 0 : p.startCredits;
    const credits = typeof d.credits !== "number" || d.guest || d.unverified ? start : d.credits;
    return { credits, period: { start: t, end: t + span, grant: Math.max(credits, start) } };
  }
  if (t < d.period.end) return null;
  const bal = Math.max(0, d.credits ?? 0), free = p.freeMonthly || 0;
  const plan = d.plan && d.plan.expiresAt > t ? d.plan : null;
  if (plan) {
    const credits = plan.credits + Math.min(bal, plan.carry ?? 0);
    return { credits, period: { start: t, end: plan.expiresAt, grant: credits } };
  }
  if (d.plan) { // abonelik bitti: satın alınan kredi gider, devredilen kalır
    const credits = Math.max(Math.min(bal, d.plan.carry ?? 0), free);
    if (credits === bal) return null; // değişiklik yok
    return { credits, period: { start: t, end: t + span, grant: credits } };
  }
  if (free <= bal) return null; // hiç abone olmamış: bakiye olduğu gibi kalır
  return { credits: free, period: { start: t, end: t + span, grant: free } };
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
  const left = await adminDb().runTransaction(async (tx) => {
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
    return credits - amount;
  });
  await notifyLowCredit(uid, left); // bakiye bir üretime yetmiyorsa dönem başına 1 kez "kredi azaldı" (hata akışı bozmaz)
}

/**
 * Abonelik başladı / yenilendi / plan değişti — mağaza makbuzu SUNUCUDA doğrulandıktan sonra çağrılır
 * (uygulamanın gönderdiği makbuz ya da Apple sunucu bildirimi; ikisi de buradan geçer).
 *  · Yenileme (aynı plan, dönem bitti): satın alınan kredi sıfırlanır → plan kredisi + devredilen bakiye (carry).
 *  · Yeni abonelik / plan değişikliği: bakiye korunur, plan kredisi ÜSTÜNE eklenir (satın alma bakiyeyi asla düşürmez).
 *    carry = o anki satın alınmamış bakiye (aktif plandan geçişte yalnız önceki carry kadarı) → plan bitince / iade olunca kalan.
 * Dönem mağazanın yenileme tarihinde biter. Aynı işlem (tx) ve tarih ikinci kez gelirse yok sayılır → tekrar krediyi yeniden doldurmaz.
 */
export async function startPlan(uid: string, planId: string, expiresAt: number, store: UserPlan["store"], txId?: string, otid?: string) {
  const { pricing } = await getConfig();
  const plan = pricing.plans?.find((x) => x.id === planId);
  if (!plan) throw new Error(`Plan tanımlı değil: ${planId}`);
  const renewed = await adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const cur = ((await tx.get(ref)).data() || {}) as Doc;
    if (cur.plan && cur.plan.id === planId && cur.plan.expiresAt === expiresAt && cur.plan.tx === txId) return null;
    const t = Date.now();
    const active = !!(cur.plan && !cur.plan.endedAt && cur.plan.expiresAt > t - 60_000);
    const renewal = !!(active && cur.plan!.id === planId && cur.period && t >= cur.period.end - 60_000);
    const settled = settlePeriod(cur, pricing, t, true);
    const balance = Math.max(0, settled ? settled.credits : cur.credits ?? 0);
    const carry = active ? Math.min(balance, cur.plan!.carry ?? 0) : balance;
    const credits = plan.credits + (renewal ? carry : balance);
    tx.set(ref, {
      credits,
      plan: { id: plan.id, credits: plan.credits, expiresAt, store, ...(txId ? { tx: txId } : {}), ...(otid ? { otid } : {}), carry, autoRenew: true, billingIssue: false },
      period: { start: t, end: expiresAt, grant: credits },
      updatedAt: now(),
    }, { merge: true });
    return renewal ? credits : null;
  });
  // Yenileme: "kredin yüklendi" bildirimi (ilk satın almada kullanıcı zaten uygulamada → bildirim yok)
  if (renewed != null) await sendToUser(uid, "sub_renewed", { credits: renewed }).catch((e) => console.error("PUSH_RENEW_ERROR", e));
}

/**
 * Abonelik sona erdi (süre doldu / iade / iptal edildi) — mağaza sunucu bildiriminden.
 * Satın alınan kredi silinir, yalnız devredilen bakiye (carry) kalır. txId verilirse yalnız o işlem güncel plansa uygulanır
 * (eski bir döneme ait iade, yenilenmiş güncel planı bozmaz).
 */
export async function endPlan(uid: string, reason: string, txId?: string) {
  await adminDb().runTransaction(async (tx) => {
    const ref = userRef(uid);
    const cur = ((await tx.get(ref)).data() || {}) as Doc;
    if (!cur.plan || cur.plan.endedAt) return;
    if (txId && cur.plan.tx && cur.plan.tx !== txId) return;
    const t = Date.now();
    const credits = Math.min(Math.max(0, cur.credits ?? 0), cur.plan.carry ?? 0);
    tx.set(ref, {
      credits,
      plan: { ...cur.plan, expiresAt: Math.min(cur.plan.expiresAt, t), endedAt: t, endReason: reason, autoRenew: false },
      period: { start: t, end: t + 30 * DAY, grant: credits },
      updatedAt: now(),
    }, { merge: true });
  });
}

/** Abonelik durum bayrakları (otomatik yenileme açık/kapalı, ödeme sorunu) — kredi değişmez. */
export async function setPlanFlags(uid: string, flags: Partial<Pick<UserPlan, "autoRenew" | "billingIssue">>) {
  const patch: Record<string, unknown> = { updatedAt: now() };
  for (const [k, v] of Object.entries(flags)) if (typeof v === "boolean") patch[`plan.${k}`] = v;
  await userRef(uid).update(patch).catch(() => {});
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
