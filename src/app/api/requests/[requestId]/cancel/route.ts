import type { NextRequest } from "next/server";
import { cancelRequest, ENABLED_STAGES, type Stage } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	const { requestId } = await params;
	if (!requestId || typeof requestId !== "string") {
		return Response.json({ error: "Missing or invalid requestId" }, { status: 400 });
	}

	try {
		let body: Record<string, unknown> = {};
		try {
			body = await request.json();
		} catch {
			body = {};
		}

		const stageParam =
			(body.stage as string | undefined) ??
			request.nextUrl.searchParams.get("stage") ??
			"prod";

		if (!ENABLED_STAGES.includes(stageParam as Stage)) {
			return Response.json(
				{ error: `Invalid stage. Allowed: ${ENABLED_STAGES.join(", ")}` },
				{ status: 400 },
			);
		}

		const stage = stageParam as Stage;
		const result = await cancelRequest(requestId, stage);

		if (result.success) {
			return Response.json(
				{
					success: true,
					message: `Request cancelled (was '${result.previousStep}')`,
					previousStep: result.previousStep,
					requestId,
					stage,
				},
				{ status: 200 },
			);
		}

		const status = result.error?.includes("cannot be cancelled") ? 409
			: result.error?.includes("not found") ? 404
			: 500;

		return Response.json(
			{
				success: false,
				error: result.error,
				requestId,
				stage,
			},
			{ status },
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return Response.json({ error: message }, { status: 500 });
	}
}
