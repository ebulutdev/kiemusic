import { NextResponse } from "next/server";
import { requireUser, errorResponse } from "@/lib/auth";
import { saveUpload } from "@/lib/data/storage";

export const runtime = "nodejs";

// Telefon kaydı / yüklenen ses → Firebase Storage (uploads/{uid}/...) → KIE'nin indirebileceği kalıcı URL
const MAX = 30 * 1024 * 1024; // Cloud Run (App Hosting) istek gövdesi sınırı 32 MB
const OK_EXT = ["mp3", "m4a", "wav", "aac", "webm", "ogg", "mp4", "caf", "flac"];

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const fd = await req.formData();
    const file = fd.get("file");
    if (!(file instanceof File)) return NextResponse.json({ success: false, error: "Dosya yok" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ success: false, error: "En fazla 30 MB" }, { status: 413 });

    let ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!OK_EXT.includes(ext)) ext = file.type.includes("mp4") || file.type.includes("m4a") ? "m4a" : file.type.includes("webm") ? "webm" : "mp3";

    const url = await saveUpload(user.uid, Buffer.from(await file.arrayBuffer()), ext, file.type || "audio/mpeg");
    return NextResponse.json({ success: true, url });
  } catch (error) {
    return errorResponse(error, "UPLOAD_ERROR");
  }
}
