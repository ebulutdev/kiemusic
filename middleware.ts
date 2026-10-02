import { NextResponse, type NextRequest } from "next/server";

// Mobil uygulama (Capacitor) arayüzü cihazdan yüklenir → API istekleri farklı kaynaktan (origin) gelir.
//   iOS:     capacitor://localhost      Android: https://localhost
// Yalnız bu kaynaklara izin verilir; web sürümü zaten aynı sunucudan çalışır (CORS gerekmez).
// Kimlik: Authorization: Bearer <Firebase ID token> (çerez yok → credentials gerekmez).
const ALLOWED = new Set([
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost", "http://localhost:3000"]),
  ...(process.env.CORS_EXTRA_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
]);

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const ok = ALLOWED.has(origin);

  if (req.method === "OPTIONS") {
    return ok ? new NextResponse(null, { status: 204, headers: corsHeaders(origin) }) : new NextResponse(null, { status: 403 });
  }
  const res = NextResponse.next();
  if (ok) for (const [k, v] of Object.entries(corsHeaders(origin))) res.headers.set(k, v);
  return res;
}

export const config = { matcher: "/api/:path*" };
