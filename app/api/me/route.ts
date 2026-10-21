import { NextResponse } from "next/server";
import { requireUser, errorResponse } from "@/lib/auth";
import { ensureUser } from "@/lib/data/users";

// Kullanıcı belgesini hazırlar (uygulama her açılışta 1 kez): misafirin kredisi 0; hesabın ilk dönemi başlangıç
// hediyesiyle açılır, dönem bitince bakiye sıfırlanır / aboneliğe göre yenilenir (users/{uid}).
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const accepted = typeof body?.terms === "string" ? body.terms.slice(0, 40) : undefined;
    const state = await ensureUser(user.uid, user.anon, user.verified, accepted, user.giftId);
    return NextResponse.json({ success: true, uid: user.uid, ...state });
  } catch (error) {
    return errorResponse(error, "ME_ERROR");
  }
}
