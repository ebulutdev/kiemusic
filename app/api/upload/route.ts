import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

// Telefon kaydı / yüklenen ses → KIE'nin indirebileceği public URL
// Not: Sunucusuz ortamlarda (Vercel) disk kalıcı değildir; orada S3/R2/Supabase kullanın.
const DIR = path.join(process.cwd(), "uploads");
const MAX = 500 * 1024 * 1024;
const OK_EXT = ["mp3", "m4a", "wav", "aac", "webm", "ogg", "mp4", "caf", "flac"];

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const file = fd.get("file");
    if (!(file instanceof File)) return NextResponse.json({ success: false, error: "Dosya yok" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ success: false, error: "En fazla 500 MB" }, { status: 413 });

    let ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!OK_EXT.includes(ext)) ext = file.type.includes("mp4") || file.type.includes("m4a") ? "m4a" : file.type.includes("webm") ? "webm" : "mp3";

    const name = `${crypto.randomUUID()}.${ext}`;
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, name), Buffer.from(await file.arrayBuffer()));

    const base = (process.env.APP_URL || "").replace(/\/$/, "");
    return NextResponse.json({ success: true, url: `${base}/api/files/${name}` });
  } catch (e) {
    console.error("UPLOAD_ERROR", e);
    return NextResponse.json({ success: false, error: "Yükleme başarısız" }, { status: 500 });
  }
}
