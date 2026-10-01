import { NextResponse } from "next/server";
import { requireUser, errorResponse } from "@/lib/auth";
import { ensureUser } from "@/lib/data/users";

// İlk açılışta kullanıcı belgesini başlangıç kredisiyle oluşturur (users/{uid}).
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const credits = await ensureUser(user.uid);
    return NextResponse.json({ success: true, uid: user.uid, credits });
  } catch (error) {
    return errorResponse(error, "ME_ERROR");
  }
}
