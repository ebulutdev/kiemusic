import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, errorResponse } from "@/lib/auth";
import { ensureUser } from "@/lib/data/users";
import { adminDb } from "@/lib/firebaseAdmin";
import { path } from "@/lib/data/schema";
import { registerDevice, removeDevice, setPrefs, setLocale, markRead, markOpened } from "@/lib/push";

// Bildirim cihazı / tercihleri (isteğe bağlı): { token, platform, lang, tz } kaydet · { remove: token } sil · { prefs }
const Push = z.object({
  token: z.string().min(20).max(4096).optional(),
  platform: z.enum(["ios", "android"]).optional(),
  lang: z.string().max(5).optional(),
  tz: z.string().max(64).optional(),
  remove: z.string().min(20).max(4096).optional(),
  prefs: z.object({ studio: z.boolean().optional(), account: z.boolean().optional(), marketing: z.boolean().optional() }).optional(),
  read: z.boolean().optional(), // bildirimler görüldü → rozet sayacı sıfır
  opened: z.string().max(32).optional(), // dokunulan bildirimin türü (ölçüm)
  source: z.enum(["push", "inbox"]).optional(), // telefondaki bildirim mi, uygulama içi gelen kutusu mu
});

// Kullanıcı belgesini hazırlar (uygulama her açılışta 1 kez): misafirin kredisi 0; hesabın ilk dönemi başlangıç
// hediyesiyle açılır, dönem bitince bakiye sıfırlanır / aboneliğe göre yenilenir (users/{uid}).
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const accepted = typeof body?.terms === "string" ? body.terms.slice(0, 40) : undefined;
    const state = await ensureUser(user.uid, user.anon, user.verified, accepted, user.giftId);
    if (!user.anon) {
      const p = Push.safeParse(body?.push ?? {});
      if (p.success) {
        const d = p.data;
        if (d.remove) await removeDevice(user.uid, d.remove);
        if (d.token && d.platform) await registerDevice(user.uid, { token: d.token, platform: d.platform, lang: d.lang, tz: d.tz });
        else if (d.lang || d.tz) await setLocale(user.uid, d.lang, d.tz); // izin vermemiş kullanıcının gelen kutusu da kendi dilinde
        if (d.prefs) await setPrefs(user.uid, d.prefs);
        if (d.opened) await markOpened(user.uid, d.opened, d.source || "push");
        if (d.read) await markRead(user.uid);
      }
      // Son görülme (geri kazanım hatırlatmaları) + kullanıcı uygulamayı kendisi açtı → açılmayan hatırlatma sayacı sıfır
      await adminDb().doc(path.user(user.uid)).set({ lastSeen: Date.now(), push: { log: { unopened: 0 } } }, { merge: true }).catch(() => {});
    }
    return NextResponse.json({ success: true, uid: user.uid, ...state });
  } catch (error) {
    return errorResponse(error, "ME_ERROR");
  }
}
