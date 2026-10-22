import { NextResponse } from "next/server";
import { requireAccount, errorResponse, HttpError } from "@/lib/auth";
import { verifyAppleJws, accountToken, IOS_BUNDLE_ID, type AppleTransaction } from "@/lib/appleStore";
import { getConfig } from "@/lib/data/config";
import { startPlan } from "@/lib/data/users";
import { adminDb } from "@/lib/firebaseAdmin";
import { COL } from "@/lib/data/schema";

export const runtime = "nodejs";

// App Store aboneliği → plan kredisi. İstemci (native.js) satın alma / geri yükleme / açılışta StoreKit 2 imzalı işlemleri gönderir.
// Sunucu: Apple imzasını doğrular, paket kimliği + ürün + süre + hesap bağını kontrol eder, en geç biten etkin aboneliği startPlan ile uygular.
// Aynı abonelik (originalTransactionId) yalnız bir hesaba bağlanır: iap/{originalTransactionId} = { uid } (yalnız sunucu).
export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const body = await request.json().catch(() => ({}));
    const list: unknown[] = Array.isArray(body?.jws) ? body.jws.slice(0, 20) : body?.jws ? [body.jws] : [];
    if (!list.length) throw new HttpError(400, "Makbuz yok");
    const plans = new Set(((await getConfig()).pricing.plans || []).map((p) => p.id));
    const token = accountToken(user.uid), now = Date.now();
    const valid: AppleTransaction[] = [];
    for (const j of list) {
      let t: AppleTransaction;
      try { t = verifyAppleJws(String(j)); } catch { continue; }
      if (t.bundleId !== IOS_BUNDLE_ID || !plans.has(t.productId) || t.revocationDate) continue;
      if (!t.expiresDate || t.expiresDate <= now) continue;
      if (t.appAccountToken && t.appAccountToken !== token) continue; // başka hesapla satın alınmış
      valid.push(t);
    }
    if (!valid.length) return NextResponse.json({ success: true, active: false });
    const t = valid.sort((a, b) => (b.expiresDate || 0) - (a.expiresDate || 0))[0];

    // Aboneliği hesaba bağla (ilk bağlayan hesap sahibidir)
    const ref = adminDb().collection(COL.iap).doc(t.originalTransactionId);
    await adminDb().runTransaction(async (tx) => {
      const cur = (await tx.get(ref)).data();
      if (cur && cur.uid !== user.uid) throw new HttpError(409, "Bu abonelik başka bir CookFire hesabına bağlı.");
      if (!cur) tx.set(ref, { uid: user.uid, store: "apple", productId: t.productId, env: t.environment || null, at: now });
    });
    await startPlan(user.uid, t.productId, t.expiresDate!, "apple", t.transactionId, t.originalTransactionId);
    return NextResponse.json({ success: true, active: true, plan: t.productId, expiresAt: t.expiresDate });
  } catch (error) {
    return errorResponse(error, "BILLING_APPLE_ERROR");
  }
}

// İstemcinin StoreKit'e vereceği hesap bağı (appAccountToken)
export async function GET(request: Request) {
  try {
    const user = await requireAccount(request);
    return NextResponse.json({ success: true, token: accountToken(user.uid) });
  } catch (error) {
    return errorResponse(error, "BILLING_TOKEN_ERROR");
  }
}
