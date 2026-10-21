import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminMessaging } from "./firebaseAdmin";
import { getConfig } from "./data/config";
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

type Def = { group: NotifyGroup; sound?: boolean };
export const NOTIFY_TYPES: Record<string, Def> = {
  song_ready: { group: "studio", sound: true },
  cover_ready: { group: "studio", sound: true },
  mashup_ready: { group: "studio", sound: true },
  extend_ready: { group: "studio", sound: true },
  vocals_ready: { group: "studio", sound: true },
  stems_ready: { group: "studio", sound: true },
  voice_ready: { group: "studio", sound: true },
  job_failed: { group: "studio" },
  credit_low: { group: "account" },
  sub_renewed: { group: "account" },
  pay_failed: { group: "account" },
  gift_reminder: { group: "account" },
  unplayed: { group: "marketing" },
  comeback3: { group: "marketing" },
  comeback7: { group: "marketing" },
  announce: { group: "marketing" },
};

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

function localHour(tz?: string): number {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: tz || "Europe/Istanbul" }).format(new Date())) % 24;
  } catch {
    return new Date().getUTCHours() + 3;
  }
}
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

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
  const push: UserPush = (snap.data() as UserDoc | undefined)?.push || {};
  const prefs = push.prefs || {};
  if (def.group === "marketing" ? prefs.marketing !== true : prefs[def.group] === false) return { sent: 0, skipped: "pref" };

  const lang = LANGS.includes(push.lang || "") ? push.lang! : "tr";
  const t = tpl[lang]?.[type] || tpl.tr?.[type];
  if (!t) return { sent: 0, skipped: "template" };
  const v = { title: vars.title || tpl[lang]?._untitled?.title || "", ...vars };
  const title = fill(t.title, v), body = fill(t.body, v);

  const now = Date.now();
  const entry = { type, title, body, ...(data.taskId ? { taskId: data.taskId } : {}), at: now };
  const patch: Record<string, unknown> = { "push.inbox": [entry, ...(push.inbox || [])].slice(0, INBOX) };

  // Sessiz saat: üretim bildirimi her saatte gider (kullanıcı bekliyor); diğerleri yalnız gelen kutusuna düşer
  const [qs, qe] = cfg?.quietHours || [11, 21];
  const h = localHour(push.tz);
  const quiet = def.group !== "studio" && !(h >= qs && h < qe);

  // Kampanya sınırı: günde / haftada en fazla N
  if (def.group === "marketing") {
    const caps = cfg?.caps || { day: 1, week: 3 };
    const sent = (push.log?.marketingAt || []).filter((x) => now - x < 7 * 864e5);
    if (sent.filter((x) => now - x < 864e5).length >= caps.day || sent.length >= caps.week) return { sent: 0, skipped: "cap" };
    if (!quiet) patch["push.log.marketingAt"] = [...sent, now];
  }

  const entries = Object.entries(push.tokens || {});
  if (quiet || !entries.length) {
    await userRef(uid).update(patch);
    return { sent: 0, skipped: quiet ? "quiet" : "no-device" };
  }

  const res = await adminMessaging().sendEachForMulticast({
    tokens: entries.map(([, d]) => d.token),
    notification: { title, body },
    data: { kind: type, ...data },
    apns: {
      headers: { "apns-priority": "10", ...(data.taskId ? { "apns-collapse-id": data.taskId.slice(0, 64) } : {}) },
      payload: { aps: { sound: def.sound ? `${SOUND}.wav` : "default", "thread-id": data.taskId || def.group } },
    },
    android: {
      priority: "high",
      ...(data.taskId ? { collapseKey: data.taskId.slice(0, 64) } : {}),
      notification: { channelId: def.group, sound: def.sound ? SOUND : "default", ...(data.taskId ? { tag: data.taskId } : {}) },
    },
  });

  res.responses.forEach((r, i) => {
    const code = r.error?.code || "";
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
      patch[`push.tokens.${entries[i][0]}`] = FieldValue.delete();
    }
  });
  await userRef(uid).update(patch);
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
    await sendToUser(t.userId, kind, { ...(title ? { title } : {}), credits }, { taskId: providerTaskId });
  } catch (err) {
    console.error("PUSH_TASK_ERROR", err);
  }
}

/** Cihazı kaydeder (en fazla 5; fazlası en eskisinden silinir) + dil / saat dilimi. /api/me çağırır. */
export async function registerDevice(uid: string, d: { token: string; platform: "ios" | "android"; lang?: string; tz?: string }) {
  const snap = await userRef(uid).get();
  const tokens = { ...((snap.data() as UserDoc | undefined)?.push?.tokens || {}) };
  const key = tokenKey(d.token);
  const patch: Record<string, unknown> = { [`push.tokens.${key}`]: { token: d.token, platform: d.platform, updatedAt: Date.now() } };
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
  await userRef(uid).update({ [`push.tokens.${tokenKey(token)}`]: FieldValue.delete() }).catch(() => {});
}

/** Profil › Bildirimler tercihleri */
export async function setPrefs(uid: string, prefs: Partial<Record<NotifyGroup, boolean>>) {
  const patch: Record<string, unknown> = {};
  for (const g of ["studio", "account", "marketing"] as NotifyGroup[]) if (typeof prefs[g] === "boolean") patch[`push.prefs.${g}`] = prefs[g];
  if (Object.keys(patch).length) await userRef(uid).update(patch);
}
