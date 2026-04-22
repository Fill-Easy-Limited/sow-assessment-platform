import type { NextRequest } from "next/server";
import {
	EMAILCHAINS_ENABLED_STAGES,
	findEmailChainById,
	getEmailChain,
	type Stage,
} from "@/lib/dynamodb/emailchains";

export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ chainId: string }> },
) {
	const { chainId: rawChainId } = await params;
	// Defensive: `@` in a Next.js dynamic route segment may arrive URL-encoded
	// (`%40`). Decode once so the DynamoDB partition-key lookup matches the
	// literal Message-ID stored on the item.
	let chainId = rawChainId;
	try {
		chainId = decodeURIComponent(rawChainId);
	} catch {
		// keep raw if malformed
	}
	const stageParam = request.nextUrl.searchParams.get("stage") || undefined;

	if (stageParam && !EMAILCHAINS_ENABLED_STAGES.includes(stageParam as Stage)) {
		return Response.json(
			{
				error: `Invalid stage. Allowed: ${EMAILCHAINS_ENABLED_STAGES.join(", ")}`,
			},
			{ status: 400 },
		);
	}

	try {
		const item = stageParam
			? await getEmailChain(chainId, stageParam as Stage)
			: await findEmailChainById(chainId);

		if (!item) {
			console.warn("Email chain not found", {
				chainId,
				chainIdLength: chainId.length,
				stage: stageParam ?? "(all enabled)",
			});
			return Response.json(
				{
					error: "Email chain not found",
					chainId,
					stage: stageParam ?? null,
					searched: stageParam ? [stageParam] : EMAILCHAINS_ENABLED_STAGES,
				},
				{ status: 404 },
			);
		}

		return Response.json(item);
	} catch (error) {
		console.error("Failed to get email chain:", error);
		return Response.json(
			{ error: "Failed to get email chain" },
			{ status: 500 },
		);
	}
}
