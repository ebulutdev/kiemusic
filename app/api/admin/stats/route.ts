import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin";
import { errorResponse } from "@/lib/auth";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getConfig } from "@/lib/data/config";
import { getKieTask, getKieBalance } from "@/lib/kie";
import { updateTask } from "@/lib/data/tasks";
import type { TaskDoc } from "@/lib/data/schema";

// Admin analizi: GET /api/admin/stats?days=30
// Gelir  = harcanan uygulama kredisi (iade edilmeyen) × economics.usdPerCredit
// Maliyet = servis kredisi (gerçek: recordInfo.creditsConsumed, yoksa işlem başına tahmin) × economics.kieUsdPerCredit
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const BACKFILL_MAX = 15; // istek başına gerçek servis kredisi çekilecek en fazla görev
const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (ms: number) => dayFmt.format(ms); // YYYY-MM-DD

type Econ = { usdPerCredit: number; kieUsdPerCredit: number; kieCreditsEstimate: Record<string, number> };
type Agg = {
  tasks: number; completed: number; failed: number; credits: number; refunded: number;
  kieCredits: number; estimated: number; revenue: number; cost: number; profit: number;
};
const empty = (): Agg => ({ tasks: 0, completed: 0, failed: 0, credits: 0, refunded: 0, kieCredits: 0, estimated: 0, revenue: 0, cost: 0, profit: 0 });

type Row = TaskDoc & { at: number };
const opOf = (t: TaskDoc) => (t.taskType === "remove-vocals" && t.params?.stemType === "split_stem" ? "split-stem" : t.taskType);

/** Görevin servis kredisi: gerçek değer; yoksa tamamlananlar için tahmin (başarısızlar iade varsayılır). */
function kieOf(t: TaskDoc, econ: Econ): { credits: number; estimated: boolean } {
  if (typeof t.kieCredits === "number") return { credits: t.kieCredits, estimated: false };
  if (t.status === "FAILED") return { credits: 0, estimated: false };
  return { credits: econ.kieCreditsEstimate[opOf(t)] ?? 0, estimated: true };
}
function add(a: Agg, t: TaskDoc, econ: Econ) {
  a.tasks++;
  if (t.status === "COMPLETED") a.completed++;
  if (t.status === "FAILED") a.failed++;
  const charged = t.refunded ? 0 : t.cost || 0;
  a.credits += charged;
  if (t.refunded) a.refunded += t.cost || 0;
  const k = kieOf(t, econ);
  a.kieCredits += k.credits;
  if (k.estimated) a.estimated++;
  const rev = charged * econ.usdPerCredit, cost = k.credits * econ.kieUsdPerCredit;
  a.revenue += rev;
  a.cost += cost;
  a.profit += rev - cost;
}
const withMargin = (a: Agg) => ({ ...a, margin: a.revenue > 0 ? a.profit / a.revenue : null });

async function listAllUsers() {
  const out: { uid: string; email?: string; name?: string; anon: boolean; providers: string[]; created: number; seen: number }[] = [];
  let token: string | undefined;
  for (let page = 0; page < 20; page++) { // en fazla 20 000 kullanıcı
    const r = await adminAuth().listUsers(1000, token);
    for (const u of r.users) {
      const providers = u.providerData.map((p) => p.providerId);
      out.push({
        uid: u.uid, email: u.email, name: u.displayName, anon: providers.length === 0, providers,
        created: Date.parse(u.metadata.creationTime) || 0,
        seen: Date.parse(u.metadata.lastRefreshTime || u.metadata.lastSignInTime) || 0,
      });
    }
    token = r.pageToken;
    if (!token) break;
  }
  return out;
}

/** Gerçek servis kredisi bilinmeyen bitmiş görevlerden birkaçını servisten çek ve kaydet. */
async function backfill(rows: Row[]): Promise<number> {
  const todo = rows.filter((t) => t.kieCredits === undefined && t.status === "COMPLETED").slice(0, BACKFILL_MAX);
  let n = 0;
  await Promise.all(todo.map(async (t) => {
    try {
      const used = Number((await getKieTask(t.providerTaskId))?.data?.creditsConsumed);
      if (Number.isFinite(used) && used >= 0) { await updateTask(t.providerTaskId, { kieCredits: used }); t.kieCredits = used; n++; }
    } catch { /* servis kaydı yoksa tahmin kullanılır */ }
  }));
  return n;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get("days")) || 30));
    const now = Date.now(), since = now - days * DAY;
    const cfg = await getConfig();
    const econ: Econ = { usdPerCredit: 0.01, kieUsdPerCredit: 0.005, kieCreditsEstimate: {}, ...(cfg.economics || {}) };

    const [snap, users, credSnap, kieBalance] = await Promise.all([
      adminDb().collection("tasks").where("createdAt", ">=", Timestamp.fromMillis(since)).get(),
      listAllUsers(),
      adminDb().collection("users").select("credits").get(),
      getKieBalance(),
    ]);
    const rows: Row[] = snap.docs.map((d) => {
      const t = d.data() as TaskDoc;
      const c = t.createdAt as Timestamp | undefined;
      return { ...t, at: c?.toMillis?.() ?? now };
    });
    const backfilled = await backfill(rows);

    const credits = new Map(credSnap.docs.map((d) => [d.id, Number(d.get("credits") ?? 0)]));
    const userById = new Map(users.map((u) => [u.uid, u]));

    // ── toplamlar ve kırılımlar ──
    const totals = empty();
    const byOp = new Map<string, Agg>(), byModel = new Map<string, Agg>();
    const byUser = new Map<string, Agg & { lastAt: number }>();
    const daily = new Map<string, Agg & { users: Set<string> }>();
    const creators = { d1: new Set<string>(), d7: new Set<string>(), d30: new Set<string>() };

    for (const t of rows) {
      add(totals, t, econ);
      const op = opOf(t);
      if (!byOp.has(op)) byOp.set(op, empty());
      add(byOp.get(op)!, t, econ);
      const model = String(t.params?.model ?? "—");
      if (!byModel.has(model)) byModel.set(model, empty());
      add(byModel.get(model)!, t, econ);
      if (!byUser.has(t.userId)) byUser.set(t.userId, { ...empty(), lastAt: 0 });
      const u = byUser.get(t.userId)!;
      add(u, t, econ);
      u.lastAt = Math.max(u.lastAt, t.at);
      const k = dayKey(t.at);
      if (!daily.has(k)) daily.set(k, { ...empty(), users: new Set() });
      const dd = daily.get(k)!;
      add(dd, t, econ);
      dd.users.add(t.userId);
      if (t.at >= now - DAY) creators.d1.add(t.userId);
      if (t.at >= now - 7 * DAY) creators.d7.add(t.userId);
      if (t.at >= now - 30 * DAY) creators.d30.add(t.userId);
    }

    // gün serisi: boş günler de 0 olarak gelir (grafik boşluksuz)
    const days_: { day: string; tasks: number; credits: number; revenue: number; cost: number; profit: number; users: number }[] = [];
    for (let ms = since; ms <= now; ms += DAY) {
      const k = dayKey(ms);
      if (days_.length && days_[days_.length - 1].day === k) continue;
      const a = daily.get(k);
      days_.push({ day: k, tasks: a?.tasks ?? 0, credits: a?.credits ?? 0, revenue: a?.revenue ?? 0, cost: a?.cost ?? 0, profit: a?.profit ?? 0, users: a?.users.size ?? 0 });
    }

    const seenIn = (ms: number) => users.filter((u) => u.seen >= now - ms).length;
    const providers: Record<string, number> = {};
    for (const u of users) for (const p of u.anon ? ["anonymous"] : u.providers) providers[p] = (providers[p] || 0) + 1;
    const sortAgg = <T extends Agg>(m: Map<string, T>) => [...m.entries()].sort((a, b) => b[1].credits - a[1].credits || b[1].tasks - a[1].tasks);

    return NextResponse.json({
      success: true,
      period: { days, since, now },
      economics: econ,
      kieBalance,
      backfilled,
      users: {
        total: users.length,
        registered: users.filter((u) => !u.anon).length,
        anonymous: users.filter((u) => u.anon).length,
        providers,
        newInPeriod: users.filter((u) => u.created >= since).length,
        active: { d1: seenIn(DAY), d7: seenIn(7 * DAY), d30: seenIn(30 * DAY) },
        creators: { d1: creators.d1.size, d7: creators.d7.size, d30: creators.d30.size },
        creditsOutstanding: [...credits.values()].reduce((s, v) => s + v, 0),
      },
      totals: withMargin(totals),
      byOp: sortAgg(byOp).map(([key, a]) => ({ key, ...withMargin(a) })),
      byModel: sortAgg(byModel).map(([key, a]) => ({ key, ...withMargin(a) })),
      byUser: sortAgg(byUser).slice(0, 100).map(([uid, a]) => {
        const u = userById.get(uid);
        return { uid, email: u?.email ?? null, name: u?.name ?? null, anon: u?.anon ?? true, balance: credits.get(uid) ?? null, ...withMargin(a), lastAt: a.lastAt };
      }),
      daily: days_,
    });
  } catch (error) {
    return errorResponse(error, "ADMIN_STATS_ERROR");
  }
}
