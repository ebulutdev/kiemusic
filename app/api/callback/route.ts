import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyKieWebhook } from "@/lib/webhook";
import type { KieCallback } from "@/lib/kie";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody) as KieCallback;
    const taskId = body.data?.task_id;

    if (!taskId) {
      return NextResponse.json({ success: false, error: "task_id eksik" });
    }

    // HMAC doğrulama (production'da zorunlu)
    const webhookSecret = process.env.KIE_WEBHOOK_HMAC_KEY;
    if (webhookSecret) {
      const timestamp = request.headers.get("X-Webhook-Timestamp");
      const signature = request.headers.get("X-Webhook-Signature");

      if (!timestamp || !signature) {
        return NextResponse.json({ success: false, error: "Webhook imzası eksik" }, { status: 401 });
      }

      const valid = verifyKieWebhook(taskId, timestamp, signature);
      if (!valid) {
        return NextResponse.json({ success: false, error: "Geçersiz webhook imzası" }, { status: 401 });
      }
    }

    const task = await db.musicTask.findUnique({ where: { providerTaskId: taskId } });

    // Task bizde yoksa 200 dön — webhook fırtınasını engelle
    if (!task) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const callbackType = body.data?.callbackType;
    const results = body.data?.data ?? [];

    // Hata callback
    if (callbackType === "error" || body.code === 500) {
      await db.musicTask.update({
        where: { id: task.id },
        data: {
          status: "FAILED",
          callbackType: callbackType ?? "error",
          errorCode: String(body.code ?? "UNKNOWN"),
          errorMessage: body.msg ?? "KIE generation failed.",
        },
      });
      return NextResponse.json({ success: true });
    }

    // Durum haritası
    const statusMap: Record<string, string> = {
      text:     "TEXT_READY",
      first:    "FIRST_READY",
      complete: "COMPLETED",
    };

    const newStatus = callbackType ? (statusMap[callbackType] ?? task.status) : task.status;

    await db.musicTask.update({
      where: { id: task.id },
      data: {
        status:       newStatus,
        callbackType: callbackType ?? null,
        resultsJson:  results.length > 0 ? JSON.stringify(results) : task.resultsJson,
        completedAt:  callbackType === "complete" ? new Date() : undefined,
      },
    });

    // KIE callback'e hızlı 200 dönmek şart (15sn içinde)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CALLBACK_ERROR", error);
    // Hata olsa bile 200 — retry fırtınasını engelle
    return NextResponse.json({ success: true });
  }
}
