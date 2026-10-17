import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";

// Bildirimler (issues/{id}): kullanıcının "Bildir" düğmesi + sistemin otomatik uyarıları (üretim servisinin kredisi bitti vb.).
// Yalnız sunucu yazar/okur; admin panelinde "Bildirimler" sekmesinde görünür. Durum: open → reviewed.
export const BUSY_MESSAGE = "Sistemde şu anda yoğunluk bulunmaktadır. Lütfen daha sonra tekrar deneyiniz.";

export async function addIssue(d: { kind: string; op?: string; note?: string; uid?: string | null; source: "user" | "system"; id?: string }) {
  const col = adminDb().collection("issues");
  const doc = d.id ? col.doc(d.id) : col.doc();
  await doc.set({
    kind: d.kind, op: d.op || null, note: (d.note || "").slice(0, 300) || null, uid: d.uid ?? null,
    source: d.source, status: "open", createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

/** Sağlayıcı kredisi / hız sınırı tükendi: saatte bir kez otomatik uyarı (admin görsün) */
export function alertProviderBusy(detail: string) {
  const hour = new Date().toISOString().slice(0, 13).replace(/\D/g, "");
  addIssue({ kind: "provider-credits", note: detail, source: "system", id: "auto-" + hour }).catch(() => {});
}
export const isBusyText = (m?: string | null) => /insufficient|credits?\b|quota|rate.?limit|too many requests|overload|temporarily/i.test(m || "");
