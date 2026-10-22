import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminMessaging } from "./firebaseAdmin";
import { getConfig, getCost } from "./data/config";
import { path, type NotifyGroup, type TaskDoc, type UserDoc, type UserPush } from "./data/schema";
// Şablonlar derlemede gömülür (Firestore config/app'te notify.templates yoksa bunlar kullanılır)
import seedConfig from "../public/config/app.json";

/*
 * Anlık bildirimler — FCM (Firebase Cloud Messaging) → iOS APNs / Android.
 *  · config/app notify.enabled=false iken hiçbir şey gönderilmez (özellik bayrağı).
 *  · Gruplar: studio (üretim; her saatte) · account (kredi/abonelik; sessiz saatte yalnız gelen kutusuna) ·
 *    marketing (kampanya; yalnız açık izinle, sessiz saat + günlük/haftalık sınır).
 *  · Cihaz anahtarları users/{uid}.push.tokens altında token özetiyle tutulur (en fazla 5); geçersizler gönderimde silinir.
 *  · Metinler config/app notify.templates[dil][tür] — kullanıcının dili yoksa tr.
 */

const MAX_DEVICES = 5;
const INBOX = 20;
const LANGS = ["tr", "en", "de", "pt", "ja"];
const SOUND = "cookfire_ready"; // iOS: cookfire_ready.wav (paket) · Android: res/raw/cookfire_ready.wav + "studio" kanalı
const HOUR = 3600;
const DAY = 86_400_000;

// urgent: APNs öncelik 10 / Android high (hemen) · diğerleri öncelik 5 / normal (pil dostu, cihaz uygun anda teslim eder)
// ttlSec: telefon kapalı / çekmiyorsa APNs ve FCM bu süre boyunca saklar, açılınca teslim eder; süresi geçen hatırlatma hiç gelmez
type Def = { group: NotifyGroup; sound?: boolean; urgent?: boolean; ttlSec: number };
export const NOTIFY_TYPES: Record<string, Def> = {
  song_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  cover_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  mashup_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  extend_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  vocals_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  stems_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  voice_ready: { group: "studio", sound: true, urgent: true, ttlSec: 24 * HOUR },
  job_failed: { group: "studio", urgent: true, ttlSec: 24 * HOUR },
  pay_failed: { group: "account", urgent: true, ttlSec: 72 * HOUR },
  credit_low: { group: "account", ttlSec: 24 * HOUR },
  sub_renewed: { group: "account", ttlSec: 24 * HOUR },
  credits_reset: { group: "account", ttlSec: 6 * HOUR },
  unplayed: { group: "studio", ttlSec: 6 * HOUR },
  gift_reminder: { group: "marketing", ttlSec: 6 * HOUR }, // tanıtım niteliğinde → yalnız açık izinle (Apple 4.5.4)
  comeback3: { group: "marketing", ttlSec: 6 * HOUR },
  comeback7: { group: "marketing", ttlSec: 6 * HOUR },
  announce: { group: "marketing", ttlSec: 12 * HOUR },
};
// Zamanlanmış hatırlatmalar (/api/cron/notify): ortak sınır (günde 1, haftada 2) + açılmayan sayacı
export const REMINDER_TYPES = new Set(["unplayed", "credits_reset", "gift_reminder", "comeback3", "comeback7"]);

// Görev türü → bildirim türü (ses üretmeyen yardımcı görevler bildirim göndermez)
const TASK_NOTIFY: Partial<Record<TaskDoc["taskType"], string>> = {
  generate: "song_ready",
  "replace-section": "song_ready",
  cover: "cover_ready",
  mashup: "mashup_ready",
  extend: "extend_ready",
  "upload-extend": "extend_ready",
  "add-vocals": "vocals_ready",
  "remove-vocals": "stems_ready",
  voice: "voice_ready",
};

export const tokenKey = (token: string) => createHash("sha256").update(token).digest("hex").slice(0, 16);
const userRef = (uid: string) => adminDb().doc(path.user(uid));

function templates() {
  return getConfig().then((c) => ({
    enabled: !!c.notify?.enabled,
    cfg: c.notify,
    tpl: c.notify?.templates || (seedConfig as { notify?: { templates?: Record<string, Record<string, { title: string; body: string }>> } }).notify?.templates || {},
  }));
}

export function localHour(tz?: string, now = Date.now()): number {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz || "Europe/Istanbul" }).format(new Date(now))) % 24;
  } catch {
    return (new Date(now).getUTCHours() + 3) % 24;
  }
}
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/**
 * Gönderim kararı (saf fonksiyon — test edilir):
 *  skip  : tercih kapalı (kampanya yalnız açık izinle) ya da kampanya sınırı doldu → hiç kaydedilmez
 *  quiet : hesap/kampanya bildirimi sessiz saatte → yalnız gelen kutusuna düşer, telefona gitmez
 *  push  : telefona gönderilir (cihaz varsa)
 */
export function decideSend(group: NotifyGroup, push: UserPush, cfg: { quietHours?: [number, number]; caps?: { day: number; week: number } } | undefined, now: number, hour: number): "skip" | "quiet" | "push" {
  const prefs = push.prefs || {};
  if (group === "marketing" ? prefs.marketing !== true : prefs[group] === false) return "skip";
  if (group === "marketing") {
    const caps = cfg?.caps || { day: 1, week: 3 };
    const sent = (push.log?.marketingAt || []).filter((x) => now - x < 7 * 864e5);
    if (sent.filter((x) => now - x < 864e5).length >= caps.day || sent.length >= caps.week) return "skip";
  }
  const [qs, qe] = cfg?.quietHours || [11, 21];
  if (group !== "studio" && !(hour >= qs && hour < qe)) return "quiet";
  return "push";
}

/**
 * Kullanıcıya bildirim gönderir. Dönen değer: gönderilen cihaz sayısı ya da atlama nedeni.
 * data: uygulamaya giden yük (taskId, kind) — dokununca ilgili şarkı açılır.
 */
export async function sendToUser(uid: string, type: string, vars: Record<string, string | number> = {}, data: Record<string, string> = {}) {
  const def = NOTIFY_TYPES[type];
  if (!def) return { sent: 0, skipped: "type" };
  const { enabled, cfg, tpl } = await templates();
  if (!enabled) return { sent: 0, skipped: "disabled" };

  const snap = await userRef(uid).get();
  if (!snap.exists) return { sent: 0, skipped: "no-user" }; // silinmiş hesap: belgeyi yeniden açma
  const push: UserPush = (snap.data() as UserDoc | undefined)?.push || {};
  const now = Date.now();
  const decision = decideSend(def.group, push, cfg, now, localHour(push.tz));
  if (decision === "skip") return { sent: 0, skipped: "pref-or-cap" };

  const lang = LANGS.includes(push.lang || "") ? push.lang! : "tr";
  const t = tpl[lang]?.[type] || tpl.tr?.[type];
  if (!t) return { sent: 0, skipped: "template" };
  const v = { ...vars, title: String(vars.title ?? "").trim() || tpl[lang]?._untitled?.title || tpl.tr?._untitled?.title || "" };
  const title = fill(t.title, v), body = fill(t.body, v);

  // Gelen kutusu (son 20) + okunmamış sayacı (uygulama simgesi rozeti; uygulama açılınca /api/me read ile sıfırlanır)
  const unread = Math.min(99, (push.unread || 0) + 1);
  const entry = { type, title, body, ...(data.taskId ? { taskId: data.taskId } : {}), at: now };
  const patch: Record<string, unknown> = { "push.inbox": [entry, ...(push.inbox || [])].slice(0, INBOX), "push.unread": unread };
  if (def.group === "marketing" && decision === "push") {
    patch["push.log.marketingAt"] = [...(push.log?.marketingAt || []).filter((x) => now - x < 7 * DAY), now];
  }

  const entries = Object.entries(push.tokens || {});
  if (decision === "quiet" || !entries.length) {
    await userRef(uid).update(patch);
    return { sent: 0, skipped: decision === "quiet" ? "quiet" : "no-device" };
  }

  // thread-id: bildirim merkezinde gruba göre toplanır · collapse-id: aynı görev / aynı tür hatırlatma üst üste yazılır
  const collapseId = (data.taskId || type).slice(0, 64);
  const res = await adminMessaging().sendEachForMulticast({
    tokens: entries.map(([, d]) => d.token),
    notification: { title, body },
    data: { kind: type, ...data },
    apns: {
      headers: {
        "apns-priority": def.urgent ? "10" : "5",
        "apns-collapse-id": collapseId,
        "apns-expiration": String(Math.floor(now / 1000) + def.ttlSec),
      },
      payload: {
        aps: {
          sound: def.sound ? `${SOUND}.wav` : "default",
          badge: unread,
          "thread-id": def.group,
          ...(def.group === "studio" && type !== "unplayed" && type !== "voice_ready" ? { category: type === "job_failed" ? "STUDIO_FAILED" : "STUDIO_READY" } : {}),
        },
      },
    },
    android: {
      priority: def.urgent ? "high" : "normal",
      ttl: def.ttlSec * 1000,
      collapseKey: collapseId,
      notification: { channelId: def.group, icon: "ic_stat_cookfire", color: "#FF7A2F", sound: def.sound ? SOUND : "default", notificationCount: unread, tag: collapseId },
    },
  });

  let dead = 0;
  res.responses.forEach((r, i) => {
    const code = r.error?.code || "";
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
      patch[`push.tokens.${entries[i][0]}`] = FieldValue.delete();
      dead++;
    }
  });
  if (dead && dead >= entries.length) patch["push.hasToken"] = false;

  // Hatırlatma: ortak sınır kaydı + açılmayan sayacı (kullanıcı son hatırlatmadan sonra uygulamayı açtıysa 0'dan başlar;
  // 3. açılmayanda 30 gün mola başlar ve sayaç sıfırlanır → mola bitince hatırlatmalar yeniden başlayabilir)
  if (res.successCount > 0 && REMINDER_TYPES.has(type)) {
    const prev = (push.log?.remindAt || []).filter((x) => now - x < 7 * DAY);
    patch["push.log.remindAt"] = [...prev, now];
    const lastRemind = prev.length ? Math.max(...prev) : 0;
    const seen = (snap.data() as UserDoc | undefined)?.lastSeen || 0;
    const next = (lastRemind && seen > lastRemind ? 0 : push.log?.unopened || 0) + 1;
    if (next >= 3) { patch["push.log.unopened"] = 0; patch["push.log.cooldownUntil"] = now + 30 * DAY; }
    else patch["push.log.unopened"] = next;
  }
  await userRef(uid).update(patch);
  if (res.successCount > 0) await recordPushStat("sent", type, now);
  return { sent: res.successCount };
}

/**
 * Görev tamamlandı / başarısız bildirimi — webhook ve yedek sorgu aynı yoldan geçer (lib/data/tasks.ts).
 * tasks/{id}.notified transaction ile işaretlenir → aynı görev için tek bildirim. Hata kullanıcı akışını bozmaz.
 */
export async function notifyTask(providerTaskId: string, outcome: "done" | "failed") {
  try {
    const { enabled } = await templates();
    if (!enabled) return; // bayrak kapalıyken görev işaretlenmez → sonradan açılınca etkilenmez
    const db = adminDb();
    const r = db.doc(path.task(providerTaskId));
    const t = await db.runTransaction(async (tx) => {
      const s = await tx.get(r);
      const d = s.data() as TaskDoc | undefined;
      if (!d || d.notified) return null;
      if (outcome === "done" && d.status !== "COMPLETED") return null;
      if (outcome === "failed" && d.status !== "FAILED") return null;
      tx.update(r, { notified: true });
      return d;
    });
    if (!t) return;
    const kind = outcome === "failed" ? "job_failed" : TASK_NOTIFY[t.taskType];
    if (!kind) return;
    const title = String(t.params?.title || t.results?.[0]?.title || "").slice(0, 60);
    const credits = outcome === "failed" && t.refunded ? t.cost : 0;
    // Son tamamlanan şarkı → "dinlemedin" / "geri dön" hatırlatmaları (ses klonu şarkı değil)
    if (outcome === "done" && kind !== "voice_ready") {
      await adminDb().doc(path.user(t.userId)).update({ "push.log.lastReady": { taskId: providerTaskId, title, at: Date.now() } }).catch(() => {});
    }
    await sendToUser(t.userId, kind, { ...(title ? { title } : {}), credits }, { taskId: providerTaskId });
  } catch (err) {
    console.error("PUSH_TASK_ERROR", err);
  }
}

/**
 * Kredi azaldı: kalan bakiye bir şarkı üretimine yetmiyorsa, kredi dönemi başına BİR kez (push.log.lowCreditPeriod = period.start).
 * Kredi düşümünden sonra çağrılır; hata akışı bozmaz. Bayrak kapalıyken işaret konmaz (açılınca ilk düşüşte gider).
 */
export async function notifyLowCredit(uid: string, left: number) {
  try {
    const cost = await getCost("generate");
    if (left >= cost) return;
    const d = (await userRef(uid).get()).data() as UserDoc | undefined;
    const periodStart = d?.period?.start ?? 0;
    if (!d || d.push?.log?.lowCreditPeriod === periodStart) return;
    const r = await sendToUser(uid, "credit_low", { credits: left });
    if (r.skipped !== "disabled") await userRef(uid).update({ "push.log.lowCreditPeriod": periodStart });
  } catch (err) {
    console.error("PUSH_LOWCREDIT_ERROR", err);
  }
}

/** Bildirimler görüldü (uygulama açıldı / bildirim kutusu açıldı): rozet sayacı sıfırlanır. */
export async function markRead(uid: string) {
  await userRef(uid).update({ "push.unread": 0 }).catch(() => {});
}

/** Cihazı kaydeder (en fazla 5; fazlası en eskisinden silinir) + dil / saat dilimi. /api/me çağırır. */
export async function registerDevice(uid: string, d: { token: string; platform: "ios" | "android"; lang?: string; tz?: string }) {
  const snap = await userRef(uid).get();
  const tokens = { ...((snap.data() as UserDoc | undefined)?.push?.tokens || {}) };
  const key = tokenKey(d.token);
  const patch: Record<string, unknown> = { [`push.tokens.${key}`]: { token: d.token, platform: d.platform, updatedAt: Date.now() }, "push.hasToken": true };
  delete tokens[key];
  Object.entries(tokens)
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(MAX_DEVICES - 1)
    .forEach(([k]) => { patch[`push.tokens.${k}`] = FieldValue.delete(); });
  if (d.lang && LANGS.includes(d.lang)) patch["push.lang"] = d.lang;
  if (d.tz) patch["push.tz"] = d.tz;
  await userRef(uid).set({}, { merge: true });
  await userRef(uid).update(patch);
}

/** Çıkış / hesap değişimi: bu cihazın anahtarını sil. */
export async function removeDevice(uid: string, token: string) {
  const k = tokenKey(token);
  const tokens = { ...((await userRef(uid).get().catch(() => null))?.data() as UserDoc | undefined)?.push?.tokens };
  delete tokens[k];
  await userRef(uid).update({ [`push.tokens.${k}`]: FieldValue.delete(), "push.hasToken": Object.keys(tokens).length > 0 }).catch(() => {});
}

/** Profil › Bildirimler tercihleri */
export async function setPrefs(uid: string, prefs: Partial<Record<NotifyGroup, boolean>>) {
  const patch: Record<string, unknown> = {};
  for (const g of ["studio", "account", "marketing"] as NotifyGroup[]) if (typeof prefs[g] === "boolean") patch[`push.prefs.${g}`] = prefs[g];
  if (Object.keys(patch).length) await userRef(uid).update(patch);
}

/** Cihaz anahtarı olmasa da dil / saat dilimi (gelen kutusu dili + yerel saat). /api/me her açılışta gönderir. */
export async function setLocale(uid: string, lang?: string, tz?: string) {
  const patch: Record<string, unknown> = {};
  if (lang && LANGS.includes(lang)) patch["push.lang"] = lang;
  if (tz) patch["push.tz"] = tz;
  if (Object.keys(patch).length) await userRef(uid).update(patch).catch(() => {});
}

// ── Ölçüm: config/stats (tek belge, istemci okuyamaz, indeks kapalı) · gün anahtarı İstanbul saatine göre YYYYMMDD
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" });
const statDay = (ms: number) => dayFmt.format(ms).replace(/-/g, "");
type StatBucket = "sent" | "opened" | "inboxOpened";

export async function recordPushStat(bucket: StatBucket, type: string, now = Date.now()) {
  if (!NOTIFY_TYPES[type]) return;
  await adminDb().doc(path.stats).set({
    push: { [bucket]: { [statDay(now)]: { [type]: FieldValue.increment(1) } }, totals: { [bucket]: { [type]: FieldValue.increment(1) } } },
    updatedAt: now,
  }, { merge: true }).catch(() => {});
}

/** config/stats içinde 90 günden eski gün anahtarlarını siler (belge şişmez). Zamanlanmış görev her çalışmada çağırır. */
export async function prunePushStats(now = Date.now()) {
  const snap = await adminDb().doc(path.stats).get().catch(() => null);
  const push = (snap?.data() as { push?: Partial<Record<StatBucket, Record<string, unknown>>> } | undefined)?.push;
  if (!push) return;
  const cutoff = statDay(now - 90 * DAY), patch: Record<string, unknown> = {};
  for (const b of ["sent", "opened", "inboxOpened"] as StatBucket[]) for (const k of Object.keys(push[b] || {})) if (k < cutoff) patch[`push.${b}.${k}`] = FieldValue.delete();
  if (Object.keys(patch).length) await adminDb().doc(path.stats).update(patch).catch(() => {});
}

/** Bildirim açıldı: telefondaki bildirime dokunuş (push) ile gelen kutusu dokunuşu (inbox) ayrı sayılır; rozete dokunmaz. */
export async function markOpened(uid: string, type: string, source: "push" | "inbox" = "push") {
  if (!NOTIFY_TYPES[type]) return;
  await recordPushStat(source === "inbox" ? "inboxOpened" : "opened", type);
  if (source === "push") await userRef(uid).update({ "push.log.unopened": 0 }).catch(() => {});
}

// ── Geri kazanım hatırlatmaları (/api/cron/notify) ─────────────────────────

/** Sabit %10 kontrol grubu: hatırlatma almaz (bildirimlerin geri dönüşe etkisini ölçmek için). */
export function isControlGroup(uid: string): boolean {
  return createHash("sha256").update("ctrl:" + uid).digest()[0] < 26; // 26/256 ≈ %10
}

const toMillis = (v: unknown): number =>
  typeof v === "number" ? v : v && typeof (v as { toMillis?: () => number }).toMillis === "function" ? (v as { toMillis: () => number }).toMillis() : 0;

export type ReminderPick = { type: "unplayed" | "credits_reset" | "gift_reminder" | "comeback3" | "comeback7"; vars?: Record<string, string | number>; data?: Record<string, string> };

/**
 * Bu saatte bu kullanıcıya gidecek hatırlatmayı seçer (saf fonksiyon — test edilir). null: gönderme.
 *  · Yalnız kullanıcının yerel saati 18:00–20:00 · kontrol grubu ve 30 günlük molada olan hariç
 *  · Ortak sınır: günde en fazla 1, haftada en fazla 2 (remindAt)
 *  · Arka arkaya 2 açılmayan → bekleme süreleri ×2 (kullanıcı uygulamayı kendisi açtıysa sayaç 0 sayılır)
 * settled: zamanlanmış görevin settlePeriod ile hesapladığı olması gereken bakiye (kredi dönemi tembel işlenir).
 */
export function pickReminder(uid: string, d: Partial<UserDoc>, startCredits: number, settled: { credits: number } | null, now: number, hour: number): ReminderPick | null {
  if (hour < 18 || hour >= 20 || isControlGroup(uid)) return null;
  const push = d.push || {}, log = push.log || {}, prefs = push.prefs || {};
  if (log.cooldownUntil && now < log.cooldownUntil) return null;

  const reminds = (log.remindAt || []).filter((x) => now - x < 7 * DAY);
  if (reminds.some((x) => now - x < DAY) || reminds.length >= 2) return null;

  const seen = d.lastSeen || 0;
  const lastRemind = reminds.length ? Math.max(...reminds) : 0;
  const unopened = lastRemind && seen > lastRemind ? 0 : log.unopened || 0;
  if (unopened >= 3) return null;
  const mult = unopened === 2 ? 2 : 1;

  // 1) Şarkı hazır ama 6 saattir (×mult) uygulamaya girmemiş — görev başına 1 kez; 48 saatten eskiyse artık değil
  const lr = log.lastReady, lrTitle = lr?.title?.trim() || "";
  if (lr && lrTitle && prefs.studio !== false && seen < lr.at && now - lr.at >= 6 * 3600_000 * mult && now - lr.at < 48 * 3600_000 && log.unplayedTaskId !== lr.taskId) {
    return { type: "unplayed", vars: { title: lrTitle }, data: { taskId: lr.taskId } };
  }

  if (!seen || now - seen < DAY) return null; // son 24 saatte girene aşağıdakiler gitmez

  // 2) Aylık kredi yenilendi — abonede değil (onda sub_renewed var); yalnız bakiye gerçekten ARTIYORSA (ücretsiz aylık kredi).
  //    Abonelik bitince bakiye azalır → bildirim gitmez. pricing.freeMonthly 0 iken pasiftir.
  const activeSub = !!(d.plan && !d.plan.endedAt && d.plan.expiresAt > now);
  const end = d.period?.end || 0;
  if (!activeSub && end && now >= end && log.resetPeriod !== end && prefs.account !== false && settled && settled.credits > (d.credits ?? 0)) {
    return { type: "credits_reset", vars: { credits: settled.credits } };
  }

  if (prefs.marketing !== true) return null; // tanıtım niteliğindekiler yalnız açık izinle (Apple 4.5.4)

  // 3) Hediye kredisi duruyor, hiç şarkı yok (zamanlanmış görev ayrıca geçmiş görev sorgular) — ömür boyu 1 kez
  const created = toMillis(d.createdAt);
  if (!log.giftReminded && !lr && !d.plan && created && now - created >= DAY * mult && (d.credits ?? 0) >= startCredits) {
    return { type: "gift_reminder" };
  }

  // 4–5) Geri dön: aynı yokluk döneminde her biri en fazla 1 kez
  const away = now - seen, vars = lrTitle ? { title: lrTitle } : undefined;
  if (away >= 3 * DAY * mult && away < 7 * DAY * mult && (log.comeback3At || 0) < seen) return { type: "comeback3", ...(vars ? { vars } : {}) };
  if (away >= 7 * DAY * mult && (log.comeback7At || 0) < seen) return { type: "comeback7", ...(vars ? { vars } : {}) };
  return null;
}
