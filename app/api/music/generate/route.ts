import { NextResponse } from "next/server";
import { generateMusicSchema } from "@/lib/validation";
import { createMusicTask } from "@/lib/kie";
import { buildGenerateInput } from "@/lib/kieInputBuilder";
import { requireAccount, errorResponse } from "@/lib/auth";
import { getCost } from "@/lib/data/config";
import { chargeCredits, refundCredits } from "@/lib/data/users";
import { createTask } from "@/lib/data/tasks";

export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const parsed = generateMusicSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation hatası", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cost = await getCost("generate");
    await chargeCredits(user.uid, cost);

    let providerTaskId: string;
    try {
      providerTaskId = (await createMusicTask(buildGenerateInput(data))).taskId;
    } catch (err) {
      await refundCredits(user.uid, cost);
      throw err;
    }

    const task = await createTask({ providerTaskId, userId: user.uid, taskType: "generate", cost, params: data });

    return NextResponse.json({
      success: true,
      task: { id: providerTaskId, providerTaskId, status: task.status },
    });
  } catch (error) {
    return errorResponse(error, "GENERATE_ERROR");
  }
}
