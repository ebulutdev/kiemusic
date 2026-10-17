import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "cookfire",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
}
