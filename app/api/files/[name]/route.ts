import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", wav: "audio/wav", aac: "audio/aac",
  webm: "audio/webm", ogg: "audio/ogg", caf: "audio/x-caf", flac: "audio/flac",
};

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  if (!/^[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(process.cwd(), "uploads", name));
    const ext = name.split(".").pop()!;
    return new Response(buf, {
      headers: { "Content-Type": TYPES[ext] || "application/octet-stream", "Content-Length": String(buf.length), "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
