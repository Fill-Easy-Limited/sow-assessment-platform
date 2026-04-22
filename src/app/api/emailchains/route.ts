import type { NextRequest } from "next/server";
import {
	EMAILCHAINS_ENABLED_STAGES,
	listEmailChains,
	listEmailChainsAllStages,
	listEmailChainsByStatus,
	type Stage,
} from "@/lib/dynamodb/emailchains";

export const dynamic = "force-dynamic";

function parseStartKey(raw: string | null): Record<string, unknown> | undefined {
	if (!raw) return undefined;
	try {
		const decoded = Buffer.from(raw, "base64").toString("utf8");
		return JSON.parse(decoded) as Record<string, unknown>;
	} catch {
		return undefined;
	}
}

function encodeStartKey(key: Record<string, unknown> | undefined): string | null {
	if (!key) return null;
	return Buffer.from(JSON.stringify(key), "utf8").toString("base64");
}

function parseDateToMs(value: string | null, endOfDay = false): number | undefined {
	if (!value) return undefined;
	const base = /^\d{4}-\d{2}-\d{2}$/.test(value)
		? `${value}T${endOfDay ? "23:59:59.999Z" : "00:00:00.000Z"}`
		: value;
	const ms = Date.parse(base);
	return Number.isNaN(ms) ? undefined : ms;
}

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;

	const stageParam = searchParams.get("stage") || undefined;
	const status = searchParams.get("status") || undefined;
	const dateFrom = searchParams.get("dateFrom");
	const dateTo = searchParams.get("dateTo");
	const limitParam = searchParams.get("limit");
	const startKeyParam = searchParams.get("startKey");

	if (stageParam && !EMAILCHAINS_ENABLED_STAGES.includes(stageParam as Stage)) {
		return Response.json(
			{
				error: `Invalid stage. Allowed: ${EMAILCHAINS_ENABLED_STAGES.join(", ")}`,
			},
			{ status: 400 },
		);
	}

	const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
	const updatedFrom = parseDateToMs(dateFrom, false);
	const updatedTo = parseDateToMs(dateTo, true);
	const startKey = parseStartKey(startKeyParam);

	try {
		if (!stageParam) {
			const items = await listEmailChainsAllStages({
				status,
				updatedFrom,
				updatedTo,
				pagination: { limit },
			});
			return Response.json({ items, lastEvaluatedKey: null });
		}

		const stage = stageParam as Stage;
		const result = status
			? await listEmailChainsByStatus(status, stage, {
					status,
					updatedFrom,
					updatedTo,
					pagination: { limit, startKey },
				})
			: await listEmailChains(stage, {
					updatedFrom,
					updatedTo,
					pagination: { limit, startKey },
				});

		return Response.json({
			items: result.items,
			lastEvaluatedKey: encodeStartKey(result.lastEvaluatedKey),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const code =
			error && typeof error === "object" && "name" in error
				? String((error as { name?: unknown }).name)
				: undefined;
		console.error("Failed to list email chains:", { code, message, error });
		return Response.json(
			{ error: "Failed to list email chains", code, details: message },
			{ status: 500 },
		);
	}
}
