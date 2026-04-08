import type { NextRequest } from "next/server";
import { invokeCancelSync } from "@/lib/aws/cancel-request";
import { ENABLED_STAGES, getRequestById, type Stage } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

const CANCELLABLE_STEPS = new Set(["initiated", "search", "manual"]);

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
		const requestItem = await getRequestById(requestId, stage);
		if (!requestItem) {
			return Response.json({ error: `Request not found in ${stage}` }, { status: 404 });
		}

		if (!CANCELLABLE_STEPS.has(String(requestItem.step))) {
			return Response.json(
				{
					success: false,
					error: `Request is in '${String(requestItem.step)}' and cannot be cancelled`,
					requestId,
					stage,
				},
				{ status: 409 },
			);
		}

		const accountId =
			typeof requestItem.accountId === "string" && requestItem.accountId.trim()
				? requestItem.accountId.trim()
				: undefined;

		const result = await invokeCancelSync({ requestId }, stage, accountId);

		if (result.success) {
			return Response.json(
				{
					success: true,
					message: result.message,
					previousStep: result.previousStep,
					requestId,
					stage,
					targetAccountId: accountId,
				},
				{ status: 200 },
			);
		}

		if (result.status === 409) {
			return Response.json(
				{
					success: false,
					error: result.error,
					requestId,
					stage,
					targetAccountId: accountId,
				},
				{ status: 409 },
			);
		}

		return Response.json(
			{
				success: false,
				error: result.error ?? "Failed to cancel request",
				requestId,
				stage,
				targetAccountId: accountId,
			},
			{ status: 500 },
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return Response.json({ error: message }, { status: 500 });
	}
}
