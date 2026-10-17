import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { errorResponse } from "@/lib/auth";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

// Admin › kullanıcı onay kayıtları: kabul ettiği koşul sürümü + verdiği hak / ses klonu onayları (tasks.params'tan)
//   GET ?uid=…  → { user, terms, consents[] } (en yeni üstte). Telif / şikâyet geldiğinde ilgili içeriğe verilen onay buradan bulunur.
export const runtime = "nodejs";
const iso = (t: any) => (typeof t === "string" ? t : t?.toDate?.().toISOString() ?? null);

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const uid = new URL(request.url).searchParams.get("uid") || "";
    if (!/^[A-Za-z0-9]{6,128}$/.test(uid)) return NextResponse.json({ success: false, error: "Geçersiz kullanıcı" }, { status: 400 });
    const [u, doc, tasks] = await Promise.all([
      adminAuth().getUser(uid).catch(() => null),
      adminDb().doc(`users/${uid}`).get(),
      adminDb().collection("tasks").where("userId", "==", uid).limit(400).get(),
    ]);
    type Consent = { kind: string; at: string; op: string; title: string | null; media?: string | null; version?: string | null; task: string };
    const consents = tasks.docs.flatMap((d): Consent[] => {
      const t = d.data(), p = t.params || {};
      if (p.rightsConfirmedAt) return [{ kind: "rights", at: p.rightsConfirmedAt, op: t.taskType, title: p.title || null, media: p.mediaKind || null, task: d.id }];
      if (p.consent?.at) return [{ kind: "voice", at: p.consent.at, op: t.taskType, title: p.voiceName || null, version: p.consent.version || null, task: d.id }];
      return [];
    }).sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const terms = doc.get("terms");
    return NextResponse.json({
      success: true,
      user: { uid, email: u?.email || null, name: u?.displayName || null, providers: u?.providerData.map((p) => p.providerId) || [], created: u?.metadata.creationTime || null },
      terms: terms ? { version: terms.version ?? null, at: iso(terms.at), prev: terms.prev ?? null } : null,
      consents,
    });
  } catch (error) {
    return errorResponse(error, "ADMIN_USER_ERROR");
  }
}
