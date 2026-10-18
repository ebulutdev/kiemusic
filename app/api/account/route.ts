import { NextResponse } from "next/server";
import { requireUser, errorResponse } from "@/lib/auth";
import { adminAuth, adminBucket, adminDb } from "@/lib/firebaseAdmin";
import { COL, path } from "@/lib/data/schema";

export const runtime = "nodejs";

// Hesabı sil (Apple 5.1.1(v): uygulama içinden silme). Kullanıcı belgesi + parçalar (users/{uid}/tracks), yüklenen sesler
// ve üretilen ses kopyaları (Storage uploads/{uid}, media/{uid}), abonelik bağı (iap) ve Firebase kimliği silinir.
// Görev kayıtları (tasks: hak onayı / ses klonu onayı) yasal saklama süresi için kalır; kullanıcıyla eşleşen kimlik kalmaz.
// Mağaza aboneliği Apple / Google'da ayrıca iptal edilmelidir (arayüz kullanıcıya söyler).
export async function DELETE(request: Request) {
  try {
    const user = await requireUser(request);
    const db = adminDb();
    await db.recursiveDelete(db.doc(path.user(user.uid)));
    const iap = await db.collection(COL.iap).where("uid", "==", user.uid).get();
    await Promise.all(iap.docs.map((d) => d.ref.delete()));
    const bucket = adminBucket();
    await Promise.all([`uploads/${user.uid}/`, `media/${user.uid}/`].map((prefix) => bucket.deleteFiles({ prefix }).catch(() => {})));
    await adminAuth().deleteUser(user.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "ACCOUNT_DELETE_ERROR");
  }
}
