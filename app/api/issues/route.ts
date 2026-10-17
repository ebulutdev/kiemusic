import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, errorResponse } from "@/lib/auth";
import { addIssue } from "@/lib/data/issues";
import { takeQuota } from "@/lib/data/users";

// Kullanıcının "Bildir" düğmesi (ör. "Sistem yoğun" penceresi) → issues koleksiyonu → admin › Bildirimler
const schema = z.object({
  kind: z.enum(["busy", "other"]).default("busy"),
  op: z.string().trim().max(40).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
    await takeQuota(user.uid, "issue"); // günlük sınır (config/app limits.issue)
    await addIssue({ ...parsed.data, uid: user.uid, source: "user" });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "ISSUE_ERROR");
  }
}
