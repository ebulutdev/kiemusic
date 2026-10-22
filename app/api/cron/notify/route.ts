import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { getConfig } from "@/lib/data/config";
import { settlePeriod } from "@/lib/data/users";
import { COL, type UserDoc } from "@/lib/data/schema";
import { localHour, pickReminder, prunePushStats, sendToUser } from "@/lib/push";

// Geri kazanım hatırlatmaları — Cloud Scheduler saatte bir çağırır (Authorization: Bearer CRON_SECRET).
// Karar lib/push.ts › pickReminder (kullanıcının yerel 18–20 saati, ortak sınır, mola, kontrol grubu).
// Aday: bildirim cihazı olan ve son 6 saat – 35 gün arasında görülen kullanıcılar, en yeni görülen önce
// (en değerli aday — şarkısı hazır ama dinlememiş — her zaman ilk taranır; 35 günden eski yoklukta gönderilecek hatırlatma kalmaz).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 500;  // çalışma başına üst sınır (istek süresi)
const BATCH = 10;   // eşzamanlı gönderim
const DAY = 86_400_000;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET || "";
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!secret || secret.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(secret), Buffer.from(token));
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const cfg = await getConfig();
    if (!cfg.notify?.enabled) return NextResponse.json({ success: true, skipped: "disabled" });
    const now = Date.now();
    const db = adminDb();
    const snap = await db.collection(COL.users)
      .where("push.hasToken", "==", true)
      .where("lastSeen", "<", now - 6 * 3600_000)
      .where("lastSeen", ">", now - 35 * DAY)
      .orderBy("lastSeen", "desc")
      .select("credits", "createdAt", "lastSeen", "period", "plan", "guest", "unverified", "push.tz", "push.prefs", "push.log")
      .limit(LIMIT)
      .get();

    const startCredits = cfg.pricing.startCredits ?? 12;
    let sent = 0;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += BATCH) {
      await Promise.allSettled(docs.slice(i, i + BATCH).map(async (doc) => {
        const d = doc.data() as Partial<UserDoc>;
        if (d.guest || d.unverified) return;
        // Kredi dönemi tembel işlenir (kullanıcı açınca): olması gereken bakiye burada hesaplanır
        const settled = d.period ? settlePeriod(d as UserDoc, cfg.pricing, now, true) : null;
        const pick = pickReminder(doc.id, d, startCredits, settled, now, localHour(d.push?.tz, now));
        if (!pick) return;
        // Hediye hatırlatması: lastReady yeni alan olduğundan eski kullanıcıda boş olabilir → geçmiş görev varsa hiç gönderme
        if (pick.type === "gift_reminder") {
          const had = await db.collection(COL.tasks).where("userId", "==", doc.id).limit(1).select().get();
          if (!had.empty) { await doc.ref.update({ "push.log.giftReminded": true }).catch(() => {}); return; }
        }
        const r = await sendToUser(doc.id, pick.type, pick.vars || {}, pick.data || {});
        if (!(r.sent > 0)) return;
        sent++;
        const log: Record<string, unknown> = {};
        if (pick.type === "unplayed") log["push.log.unplayedTaskId"] = pick.data?.taskId || "";
        if (pick.type === "credits_reset") log["push.log.resetPeriod"] = d.period?.end || now;
        if (pick.type === "gift_reminder") log["push.log.giftReminded"] = true;
        if (pick.type === "comeback3") log["push.log.comeback3At"] = now;
        if (pick.type === "comeback7") { log["push.log.comeback7At"] = now; log["push.log.cooldownUntil"] = now + 30 * DAY; }
        await doc.ref.update(log).catch(() => {});
      }));
    }
    await prunePushStats(now);
    return NextResponse.json({ success: true, checked: docs.length, sent });
  } catch (error) {
    console.error("CRON_NOTIFY_ERROR", error);
    return NextResponse.json({ success: false, error: "cron failed" }, { status: 500 });
  }
}
