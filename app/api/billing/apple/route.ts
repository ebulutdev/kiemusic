import { NextResponse } from "next/server";
import { requireAccount, errorResponse, HttpError } from "@/lib/auth";
import { verifyAppleJws, accountToken, IOS_BUNDLE_ID, type AppleTransaction } from "@/lib/appleStore";
import { getConfig } from "@/lib/data/config";
import { startPlan, endPlan } from "@/lib/data/users";
import { adminDb } from "@/lib/firebaseAdmin";
import { COL, path, type UserDoc } from "@/lib/data/schema";

export const runtime = "nodejs";

// App Store aboneliği → plan kredisi. İstemci (native.js) satın alma / geri yükleme / açılışta StoreKit 2 imzalı işlemleri gönderir.
// Sunucu: Apple imzasını doğrular, paket kimliği + ürün + süre + hesap bağını kontrol eder, en geç biten etkin aboneliği startPlan ile uygular.
// Aynı abonelik (originalTransactionId) aynı anda yalnız bir hesaba bağlıdır: iap/{originalTransactionId} = { uid } (yalnız sunucu).
// Aynı Apple hesabıyla başka bir CookFire hesabında satın alma / geri yükleme yapılırsa abonelik o hesaba TAŞINIR
// (eski hesabın planı biter, yalnız devredilen bakiyesi kalır). Bu dönemin kredisi eski hesapta zaten verildiyse
// yeni hesaba yeniden plan kredisi eklenmez → taşıyarak kredi çoğaltılamaz; eski hesabın bu dönemden kalan satın alınmış kredisi
// aboneliğe eşlik eder (eski hesapta yalnız devredilen bakiye kalır). Silinmiş hesaba bağlıysa bağ doğrudan devralınır.
// intent: "purchase" | "restore" (kullanıcı eylemi → taşınır) · "sync" (açılıştaki otomatik bildirim → başka hesaba bağlıysa TAŞINMAZ).
// intent göndermeyen eski sürümler (1.0 build 4) eylem kabul edilir.
export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const body = await request.json().catch(() => ({}));
    const list: unknown[] = Array.isArray(body?.jws) ? body.jws.slice(0, 20) : body?.jws ? [body.jws] : [];
    if (!list.length) throw new HttpError(400, "Makbuz yok");
    const plans = new Set(((await getConfig()).pricing.plans || []).map((p) => p.id));
    const now = Date.now(), intent = typeof body?.intent === "string" ? body.intent : "";
    const valid: AppleTransaction[] = [];
    for (const j of list) {
      let t: AppleTransaction;
      try { t = verifyAppleJws(String(j)); } catch { continue; }
      if (t.bundleId !== IOS_BUNDLE_ID || !plans.has(t.productId) || t.revocationDate) continue;
      if (!t.expiresDate || t.expiresDate <= now) continue;
      valid.push(t);
    }
    if (!valid.length) return NextResponse.json({ success: true, active: false });
    const t = valid.sort((a, b) => (b.expiresDate || 0) - (a.expiresDate || 0))[0];

    // Aboneliği bu hesaba bağla; başka hesaba bağlıysa taşı
    const db = adminDb(), ref = db.collection(COL.iap).doc(t.originalTransactionId);
    // Açılış senkronu başka (var olan) bir hesaba bağlı aboneliği sessizce almaz
    if (intent === "sync") {
      const owner = ((await ref.get()).data() as { uid?: string } | undefined)?.uid;
      if (owner && owner !== user.uid && (await db.doc(path.user(owner)).get()).exists) {
        return NextResponse.json({ success: true, active: false, linked: true });
      }
    }
    const prev = await db.runTransaction(async (tx) => {
      const cur = (await tx.get(ref)).data() as { uid?: string } | undefined;
      if (cur?.uid === user.uid) return null;
      tx.set(ref, { uid: user.uid, store: "apple", productId: t.productId, env: t.environment || null, at: now, ...(cur?.uid ? { prev: cur.uid, movedAt: now } : {}) }, { merge: true });
      return cur?.uid || null;
    });
    let grant = true, moved = 0;
    if (prev) {
      const old = (await db.doc(path.user(prev)).get()).data() as UserDoc | undefined;
      if (old?.plan && !old.plan.endedAt) {
        grant = old.plan.tx !== t.transactionId; // bu dönemin kredisi eski hesapta verildi mi
        if (!grant) { const bal = Math.max(0, old.credits ?? 0); moved = bal - Math.min(bal, old.plan.carry ?? 0); } // kalan satın alınmış kredi
        await endPlan(prev, "transfer");
      }
    }
    await startPlan(user.uid, t.productId, t.expiresDate!, "apple", t.transactionId, t.originalTransactionId, grant, moved);
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
