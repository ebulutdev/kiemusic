import { requireUser, errorResponse, HttpError } from "@/lib/auth";
import { classifyMedia } from "@/lib/data/media";

export const runtime = "nodejs";

// Kullanıcının KENDİ sesini aynı kaynaktan (same-origin) verir → tarayıcı dalga formunu çizebilir.
// Firebase Storage / KIE adresleri tarayıcıya CORS izni vermediği için ses doğrudan çözümlenemiyor.
//   GET /api/media?u=<ses adresi>&t=<parçanın görev id'si>
// Yalnız kullanıcıya ait kaynaklar (lib/data/media.ts): uploads/{uid}, media/{uid} ya da kendi görev sonucu.
const MAX = 40 * 1024 * 1024;

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const q = new URL(request.url).searchParams;
    const url = q.get("u") || "";
    await classifyMedia(url, user.uid, q.get("t") || undefined);

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok || !res.body) throw new HttpError(502, "Ses indirilemedi.");
    const len = Number(res.headers.get("content-length") || 0);
    if (len > MAX) throw new HttpError(413, "Ses dosyası çok büyük.");

    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "audio/mpeg",
        ...(len ? { "Content-Length": String(len) } : {}),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return errorResponse(error, "MEDIA_ERROR");
  }
}
