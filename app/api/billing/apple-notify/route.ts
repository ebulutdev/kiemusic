import { NextResponse } from "next/server";
import { verifyAppleJws, verifyAppleSigned, IOS_BUNDLE_ID } from "@/lib/appleStore";
import { getConfig } from "@/lib/data/config";
import { startPlan, endPlan, setPlanFlags } from "@/lib/data/users";
import { adminDb } from "@/lib/firebaseAdmin";
import { COL } from "@/lib/data/schema";

export const runtime = "nodejs";

/*
 * App Store Server Notifications V2 — Apple abonelik olaylarını uygulama açılmadan doğrudan buraya gönderir.
 * App Store Connect › App Information › App Store Server Notifications (Production + Sandbox, Version 2):
 *   https://<APP_URL>/api/billing/apple-notify
 * Güvenlik: tüm yük Apple imzalı (x5c → Apple Root CA - G3); imzası tutmayan istek yok sayılır.
 * Hesap eşleşmesi iap/{originalTransactionId}.uid (ilk satın almada uygulama makbuzuyla bağlanır). Bağ yoksa olay kaydedilir;
 * kullanıcı uygulamayı açınca makbuz zaten /api/billing/apple ile uygulanır (iade edilmiş / süresi dolmuş işlem orada da reddedilir).
 * Aynı bildirim (notificationUUID) bir kez işlenir. Apple 200 dışı yanıtta yeniden dener → beklenmeyen hatada 500.
 */
export async function POST(request: Request) {
  let n: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const body = await request.json().catch(() => ({}));
    n = verifyAppleSigned(String(body?.signedPayload || ""));
  } catch {
    return NextResponse.json({ success: false }, { status: 400 }); // imzasız / bozuk: yeniden denemeye gerek yok
  }
  try {
    const type = String(n.notificationType || ""), subtype = String(n.subtype || "");
    const data = n.data || {};
    if (type === "TEST" || data.bundleId !== IOS_BUNDLE_ID || !data.signedTransactionInfo) return NextResponse.json({ success: true });

    const t = verifyAppleJws(String(data.signedTransactionInfo));
    if (t.bundleId !== IOS_BUNDLE_ID) return NextResponse.json({ success: true });
    let autoRenew: boolean | undefined;
    if (data.signedRenewalInfo) {
      try { autoRenew = Number(verifyAppleSigned(String(data.signedRenewalInfo)).autoRenewStatus) === 1; } catch { /* yenileme bilgisi isteğe bağlı */ }
    }

    // Tekrar kontrolü + hesap bağı (iap/{originalTransactionId}). Bildirim, işlem başarıyla bittikten SONRA "görüldü" işaretlenir
    // (hata olursa Apple yeniden dener; startPlan / endPlan zaten tekrara dayanıklı).
    const ref = adminDb().collection(COL.iap).doc(t.originalTransactionId);
    const uuid = String(n.notificationUUID || "");
    const cur = (await ref.get()).data() || {};
    const seen: string[] = Array.isArray(cur.notifs) ? cur.notifs : [];
    if (uuid && seen.includes(uuid)) return NextResponse.json({ success: true });
    const uid = (cur.uid as string) || "";
    const mark = () => ref.set({
      notifs: [...seen, uuid].filter(Boolean).slice(-30),
      last: { type, subtype, productId: t.productId, tx: t.transactionId, env: t.environment || null, at: Date.now() },
    }, { merge: true });
    if (!uid) { await mark(); return NextResponse.json({ success: true }); } // henüz hesaba bağlı değil: uygulama makbuzu uygular

    const plans = new Set(((await getConfig()).pricing.plans || []).map((p) => p.id));
    const now = Date.now();
    switch (type) {
      case "SUBSCRIBED": // ilk alım / yeniden abonelik
      case "DID_RENEW": // aylık yenileme (ödeme sorunu sonrası kurtarma dahil)
      case "OFFER_REDEEMED":
      case "RENEWAL_EXTENDED":
        if (plans.has(t.productId) && !t.revocationDate && (t.expiresDate || 0) > now) {
          await startPlan(uid, t.productId, t.expiresDate!, "apple", t.transactionId, t.originalTransactionId);
        }
        break;
      case "DID_CHANGE_RENEWAL_PREF": // UPGRADE hemen geçerli (yeni işlem); DOWNGRADE bir sonraki yenilemede
        if (subtype === "UPGRADE" && plans.has(t.productId) && !t.revocationDate && (t.expiresDate || 0) > now) {
          await startPlan(uid, t.productId, t.expiresDate!, "apple", t.transactionId, t.originalTransactionId);
        }
        break;
      case "DID_CHANGE_RENEWAL_STATUS": // kullanıcı otomatik yenilemeyi kapattı / açtı — plan dönem sonuna kadar sürer
        await setPlanFlags(uid, { autoRenew: subtype === "AUTO_RENEW_ENABLED" });
        break;
      case "DID_FAIL_TO_RENEW": // ödeme alınamadı (GRACE_PERIOD alt türünde erişim sürer)
        await setPlanFlags(uid, { billingIssue: true, ...(autoRenew === undefined ? {} : { autoRenew }) });
        break;
      case "EXPIRED":
      case "GRACE_PERIOD_EXPIRED":
        await endPlan(uid, type.toLowerCase());
        break;
      case "REFUND":
      case "REVOKE": // iade / aile paylaşımından çıkarıldı: yalnız o işlem güncel plansa
        await endPlan(uid, type.toLowerCase(), t.transactionId);
        break;
      default: // REFUND_DECLINED, PRICE_INCREASE, CONSUMPTION_REQUEST … yalnız kayıt
        break;
    }
    await mark();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("APPLE_NOTIFY_ERROR", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
