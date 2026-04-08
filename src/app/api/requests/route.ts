import type { NextRequest } from "next/server";
import { ENABLED_STAGES, queryRequests, type Stage } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;

	const type = searchParams.get("type") || undefined;
	const step = searchParams.get("step") || undefined;
	const organization = searchParams.get("organization") || undefined;
	const dateFrom = searchParams.get("dateFrom") || undefined;
	const dateTo = searchParams.get("dateTo") || undefined;
	const stageParam = searchParams.get("stage") || undefined;

	// Validate stage if provided
	if (stageParam && !ENABLED_STAGES.includes(stageParam as Stage)) {
		return Response.json(
			{ error: `Invalid stage. Allowed: ${ENABLED_STAGES.join(", ")}` },
			{ status: 400 },
		);
	}

	try {
		const items = await queryRequests({
			type,
			step,
			organization,
			dateFrom,
			dateTo,
			stage: stageParam as Stage | undefined,
		});

		return Response.json(items);
	} catch (error) {
		console.error("Failed to query DynamoDB:", error);
		return Response.json(
			{ error: "Failed to query requests" },
			{ status: 500 },
		);
	}
}
