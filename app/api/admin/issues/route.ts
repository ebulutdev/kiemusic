import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { errorResponse } from "@/lib/auth";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

// Admin › Bildirimler: kullanıcı bildirimleri + sistem uyarıları (issues) ve içerik şikâyetleri (reports)
//   GET  → { issues[], reports[] } son 100'er kayıt, yeni → eski
//   POST { col: "issues"|"reports", id, status: "open"|"reviewed" } → durum güncelle
export const runtime = "nodejs";
const ms = (t: any) => t?.toMillis?.() ?? null;

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const db = adminDb();
    const [is, rs] = await Promise.all([
      db.collection("issues").orderBy("createdAt", "desc").limit(100).get(),
      db.collection("reports").orderBy("createdAt", "desc").limit(100).get(),
    ]);
    // Bildiren kullanıcıların e-postaları (tek istekte)
    const uids = [...new Set([...is.docs.map((d) => d.get("uid")), ...rs.docs.map((d) => d.get("reporterUid"))].filter(Boolean))].slice(0, 100);
    const mail: Record<string, string> = {};
    if (uids.length) for (const u of (await adminAuth().getUsers(uids.map((uid) => ({ uid })))).users) mail[u.uid] = u.email || u.displayName || u.uid.slice(0, 6);
    return NextResponse.json({
      success: true,
      issues: is.docs.map((d) => ({ id: d.id, kind: d.get("kind"), op: d.get("op"), note: d.get("note"), source: d.get("source"), status: d.get("status"), at: ms(d.get("createdAt")), user: mail[d.get("uid")] || null })),
      reports: rs.docs.map((d) => ({ id: d.id, reason: d.get("reason"), title: d.get("title"), note: d.get("note"), status: d.get("status"), at: ms(d.get("createdAt")), user: mail[d.get("reporterUid")] || null })),
    });
  } catch (error) {
    return errorResponse(error, "ADMIN_ISSUES_ERROR");
  }
}

const upd = z.object({ col: z.enum(["issues", "reports"]), id: z.string().min(1).max(200), status: z.enum(["open", "reviewed"]) });
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const p = upd.safeParse(await request.json());
    if (!p.success) return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
    await adminDb().collection(p.data.col).doc(p.data.id).update({ status: p.data.status });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "ADMIN_ISSUES_ERROR");
  }
}
