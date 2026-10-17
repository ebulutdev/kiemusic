import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { errorResponse } from "@/lib/auth";
import { getConfig, patchConfig } from "@/lib/data/config";

// Admin: kâr analizi birim fiyatları ve keşfet ayarları → config/app (istemci dinleyicisi anında alır)
const schema = z.object({
  economics: z.object({
    usdPerCredit: z.number().min(0).max(100),
    kieUsdPerCredit: z.number().min(0).max(100),
    kieCreditsEstimate: z.record(z.string(), z.number().min(0).max(10_000)).optional(),
  }).optional(),
  costs: z.record(z.string().regex(/^[a-z-]{2,30}$/), z.number().int().min(0).max(1000)).optional(),
  plans: z.array(z.object({ id: z.string().regex(/^[a-z0-9_]{2,40}$/), credits: z.number().int().min(1).max(100_000), price: z.number().int().min(1).max(1_000_000) })).max(8).optional(),
  custom: z.object({ min: z.number().int().min(1), max: z.number().int().min(1), step: z.number().int().min(1) }).refine((c) => c.max > c.min && c.step <= c.max - c.min).optional(),
  exploreMax: z.number().int().min(1).max(60).optional(),
  previewSec: z.number().int().min(5).max(120).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Geçersiz değer", details: parsed.error.flatten() }, { status: 400 });
    const d = parsed.data, fields: Record<string, unknown> = {};
    if (d.economics) {
      fields["economics.usdPerCredit"] = d.economics.usdPerCredit;
      fields["economics.kieUsdPerCredit"] = d.economics.kieUsdPerCredit;
      if (d.economics.kieCreditsEstimate) fields["economics.kieCreditsEstimate"] = d.economics.kieCreditsEstimate;
    }
    if (d.costs) for (const [k, v] of Object.entries(d.costs)) fields[`pricing.costs.${k}`] = v; // kullanıcıdan düşülen kredi (getCost)
    if (d.plans) { // yalnız kredi + fiyat değişir; ad, para birimi, etiket korunur
      const cur = (await getConfig()).pricing?.plans || [];
      fields["pricing.plans"] = cur.map((p) => { const n = d.plans!.find((x) => x.id === p.id); return n ? { ...p, credits: n.credits, price: n.price } : p; });
    }
    if (d.custom) fields["pricing.custom"] = d.custom;
    if (d.exploreMax !== undefined) fields["catalog.exploreMax"] = d.exploreMax;
    if (d.previewSec !== undefined) fields["catalog.previewSec"] = d.previewSec;
    if (!Object.keys(fields).length) return NextResponse.json({ success: false, error: "Değişiklik yok" }, { status: 400 });
    await patchConfig(fields);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "ADMIN_CONFIG_ERROR");
  }
}
