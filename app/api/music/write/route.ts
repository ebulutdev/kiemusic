import { NextResponse } from "next/server";
import { z } from "zod";
import { createKieTask, getKieTask } from "@/lib/kie";
import { requireAccount, errorResponse, HttpError } from "@/lib/auth";
import { getCost } from "@/lib/data/config";
import { chargeCredits } from "@/lib/data/users";
import { createTask, failTask, updateTask } from "@/lib/data/tasks";

export const maxDuration = 60;

// Yapay zekâ söz yazımı (ai-music-api/generate-lyrics): konu → 2-3 söz taslağı. Ücretli (pricing.costs.lyrics, varsayılan 1 kredi):
// kredi sunucuda düşer; yazım başarısız olursa failTask krediyi bir kez iade eder.
// Girdi: prompt ≤ 200 karakter (konu / stil / ruh hali). Sonuç: resultJson.resultObject.lyricsData[{text,title,status}]
const schema = z.object({
  prompt: z.string().trim().min(2).max(160),
  lang: z.enum(["tr", "en", "de", "pt", "ja"]).default("tr"),
});
const LANG = { tr: "Turkish", en: "English", de: "German", pt: "Portuguese", ja: "Japanese" } as const;

type Draft = { title: string; text: string };
function drafts(raw: unknown): Draft[] {
  let v: any = raw;
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { return []; } }
  const arr = v?.resultObject?.lyricsData ?? v?.lyricsData ?? v?.data?.lyricsData ?? v?.data;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x: any) => x && typeof x.text === "string" && x.text.trim() && (!x.status || x.status === "complete"))
    .map((x: any) => ({ title: String(x.title || "").slice(0, 80), text: String(x.text).trim().slice(0, 5000) }));
}

export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Geçersiz istek" }, { status: 400 });
    const { prompt, lang } = parsed.data;

    const cost = await getCost("lyrics");
    await chargeCredits(user.uid, cost, user.verified);

    let taskId = "";
    try {
      taskId = (await createKieTask("lyrics", { prompt: `${prompt}. Write the lyrics in ${LANG[lang]}.`.slice(0, 200) })).taskId;
    } catch (err) {
      // görev kaydı henüz yok: krediyi doğrudan iade et
      const { refundCredits } = await import("@/lib/data/users");
      await refundCredits(user.uid, cost);
      throw err;
    }
    await createTask({ providerTaskId: taskId, userId: user.uid, taskType: "lyrics", cost, params: { prompt, lang } });

    // Sonuç birkaç saniyede gelir: en çok ~45 sn bekle
    for (let i = 0; i < 22; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      let rec: any;
      try { rec = (await getKieTask(taskId))?.data; } catch (err) { await failTask(taskId, "BUSY", "Söz yazımı yanıt vermedi"); throw err; } // iade + sistem yoğun
      if (rec?.state === "fail") { await failTask(taskId, String(rec.failCode ?? ""), rec.failMsg || "Söz yazılamadı"); break; }
      const found = drafts(rec?.resultJson);
      if (found.length) {
        const used = Number(rec.creditsConsumed); // gerçek servis tüketimi → admin kâr analizi
        await updateTask(taskId, { status: "COMPLETED", results: [{ title: found[0].title, prompt: found[0].text }], ...(Number.isFinite(used) ? { kieCredits: used } : {}) });
        return NextResponse.json({ success: true, cost, lyrics: found });
      }
      if (rec?.state === "success") { await failTask(taskId, "", "Söz bulunamadı"); break; }
    }
    // zaman aşımı ya da boş sonuç: iade (failTask yalnız bir kez iade eder, tamamlanmış görevi bozmaz)
    await failTask(taskId, "TIMEOUT", "Söz yazılamadı");
    throw new HttpError(504, "Sözler şu an yazılamadı. Kredin iade edildi, tekrar dene.");
  } catch (error) {
    return errorResponse(error, "LYRICS_WRITE_ERROR");
  }
}
