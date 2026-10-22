import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { errorResponse } from "@/lib/auth";
import { adminDb, adminMessaging } from "@/lib/firebaseAdmin";
import { COL, path, type UserDoc } from "@/lib/data/schema";
import { sendToUser } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const BATCH = 10;

const Body = z.object({
  mode: z.enum(["preview", "test", "send"]),
  lang: z.enum(["all", "tr", "en", "de", "pt", "ja"]).default("all"),
  plan: z.enum(["all", "sub", "free"]).default("all"),
  activity: z.enum(["all", "active7", "active30", "inactive7"]).default("all"),
  title: z.string().trim().max(80).optional(),
  titleB: z.string().trim().max(80).optional(),
  body: z.string().trim().max(240).optional(),
});

function matches(d: Partial<UserDoc>, now: number, f: z.infer<typeof Body>): boolean {
  if (d.guest || d.unverified) return false;
  if (d.push?.prefs?.marketing !== true) return false; // Apple 4.5.4: yalnız açık kampanya izni olanlar
  if (f.lang !== "all" && (d.push?.lang || "tr") !== f.lang) return false;
  const isSub = !!(d.plan && !d.plan.endedAt && d.plan.expiresAt > now);
  if (f.plan === "sub" && !isSub) return false;
  if (f.plan === "free" && isSub) return false;
  const seen = d.lastSeen || 0;
  if (f.activity === "active7" && (!seen || now - seen > 7 * DAY)) return false;
  if (f.activity === "active30" && (!seen || now - seen > 30 * DAY)) return false;
  if (f.activity === "inactive7" && (!seen || now - seen < 7 * DAY)) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const raw = await request.json().catch(() => ({}));
    const p = Body.safeParse(raw);
    if (!p.success) return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
    const f = p.data;
    const now = Date.now();
    const db = adminDb();

    if (f.mode === "test") {
      if (!f.title || !f.body) return NextResponse.json({ success: false, error: "Başlık ve metin gerekli" }, { status: 400 });
      const snap = await db.doc(path.user(admin.uid)).get();
      const u = (snap.data() || {}) as Partial<UserDoc>;
      const tokens = Object.values(u.push?.tokens || {}).map((t) => t.token);
      const entry = { type: "announce", title: f.title, body: f.body, at: now };
      await db.doc(path.user(admin.uid)).set({
        push: { inbox: [entry, ...(u.push?.inbox || [])].slice(0, 20), unread: Math.min(99, (u.push?.unread || 0) + 1) },
      }, { merge: true });
      let sent = 0;
      if (tokens.length) {
        const res = await adminMessaging().sendEachForMulticast({
          tokens,
          notification: { title: f.title, body: f.body },
          data: { kind: "announce" },
          apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default", "thread-id": "marketing" } } },
          android: { priority: "high", notification: { channelId: "marketing", sound: "default" } },
        });
        sent = res.successCount;
      }
      return NextResponse.json({ success: true, sent, inbox: true });
    }

    const snap = await db.collection(COL.users)
      .where("push.hasToken", "==", true)
      .select("guest", "unverified", "lastSeen", "plan", "push.lang", "push.prefs")
      .limit(2000)
      .get();

    const targets = snap.docs.filter((doc) => matches(doc.data() as Partial<UserDoc>, now, f));
    if (f.mode === "preview") {
      return NextResponse.json({ success: true, totalWithToken: snap.size, eligible: targets.length });
    }

    if (!f.title || !f.body) return NextResponse.json({ success: false, error: "Başlık ve metin gerekli" }, { status: 400 });
    const hasB = !!f.titleB;
    let sent = 0, sentA = 0, sentB = 0;

    for (let i = 0; i < targets.length; i += BATCH) {
      await Promise.allSettled(targets.slice(i, i + BATCH).map(async (doc) => {
        const useB = hasB && createHash("sha256").update("ab:" + doc.id).digest()[0] >= 128;
        const chosenTitle = useB ? f.titleB! : f.title!;
        const r = await sendToUser(doc.id, "announce", { title: chosenTitle, text: f.body! });
        if (r.sent > 0) {
          sent++;
          if (useB) sentB++; else sentA++;
        }
      }));
    }

    return NextResponse.json({ success: true, eligible: targets.length, sent, sentA, sentB });
  } catch (error) {
    return errorResponse(error, "ADMIN_NOTIFY_ERROR");
  }
}
