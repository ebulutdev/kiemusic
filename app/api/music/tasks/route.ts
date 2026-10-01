import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tasks = await db.musicTask.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, providerTaskId: true, taskType: true, status: true,
        callbackType: true, instrumental: true, model: true, title: true,
        style: true, resultsJson: true, createdAt: true, completedAt: true,
        errorMessage: true,
      },
    });

    const list = tasks.map((t: (typeof tasks)[number]) => {
      let results: unknown[] = [];
      if (t.resultsJson) {
        try { results = JSON.parse(t.resultsJson); } catch { results = []; }
      }
      return { ...t, resultsJson: undefined, results };
    });

    return NextResponse.json({ success: true, tasks: list });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Liste alınamadı." },
      { status: 500 }
    );
  }
}
