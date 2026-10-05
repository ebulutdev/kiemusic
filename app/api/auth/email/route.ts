import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebaseAdmin";
import { errorResponse, HttpError } from "@/lib/auth";

// Şifre sıfırlama öncesi kontrol: e-posta bir hesaba bağlı mı, şifreli mi (Google/Apple hesabının şifresi yoktur).
// Firebase sıfırlama isteği her durumda "gönderildi" der → kullanıcı e-posta gelmeyince nedenini bilemez.
// Toplu tarama olmasın diye IP başına dakikada 10 istek.
export const runtime = "nodejs";
const HITS = new Map<string, number[]>();

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
    const now = Date.now(), recent = (HITS.get(ip) || []).filter((t) => now - t < 60_000);
    if (recent.length >= 10) throw new HttpError(429, "Çok fazla deneme. Biraz bekleyip tekrar dene.");
    HITS.set(ip, [...recent, now]);
    if (HITS.size > 5000) HITS.clear();

    const p = z.object({ email: z.string().trim().email().max(200) }).safeParse(await request.json().catch(() => ({})));
    if (!p.success) throw new HttpError(400, "Geçerli bir e-posta adresi gir.");
    const user = await adminAuth().getUserByEmail(p.data.email).catch(() => null);
    const providers = user ? user.providerData.map((x) => x.providerId) : [];
    return NextResponse.json({ success: true, exists: !!user, password: providers.includes("password"), providers });
  } catch (error) {
    return errorResponse(error, "AUTH_EMAIL_ERROR");
  }
}
