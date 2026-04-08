import type { NextRequest } from "next/server";
import { invokeResolveSync } from "@/lib/aws/resolve-request";
import type { ResolveEventPayload } from "@/lib/aws/cra-config";
import { ENABLED_STAGES, type Stage } from "@/lib/dynamodb";
import { getRequestById } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

/**
 * POST /api/requests/[requestId]/resolve
 *
 * Invokes the CraResolve Lambda to submit a company identifier
 * and resume a request stuck in the `search` step.
 *
 * Request body:
 * {
 *   "companyId"?: string,     // Company registry number
 *   "companyName"?: string,   // Company name for name-based lookups
 *   "documentType"?: string,  // Override document type (e.g. "Annual Return")
 *   "documentId"?: string,    // For direct document ID lookups
 *   "stage"?: string          // Optional stage override (defaults to prod)
 * }
 *
 * At least one of companyId, companyName, or documentId must be provided.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	const { requestId } = await params;

	// Validate requestId
	if (!requestId || typeof requestId !== "string") {
		return Response.json(
			{ error: "Missing or invalid requestId" },
			{ status: 400 },
		);
	}

	try {
		// Parse request body
		let body: Record<string, unknown> = {};
		try {
			body = await request.json();
		} catch {
			return Response.json(
				{ error: "Invalid request body JSON" },
				{ status: 400 },
			);
		}

		// Extract stage from body or query params, default to prod
		let stage: Stage = "prod";
		const stageParam = body.stage ||
			request.nextUrl.searchParams.get("stage") || "prod";

		if (!ENABLED_STAGES.includes(stageParam as Stage)) {
			return Response.json(
				{
					error: `Invalid stage. Allowed: ${ENABLED_STAGES.join(", ")}`,
				},
				{ status: 400 },
			);
		}
		stage = stageParam as Stage;

		// Validate that at least one identifier is provided
		const { companyId, companyName, documentType, documentId } = body;
		if (!companyId && !companyName && !documentId) {
			return Response.json(
				{
					error:
						"At least one of companyId, companyName, or documentId must be provided",
				},
				{ status: 400 },
			);
		}

		// Build the resolve payload
		const payload: ResolveEventPayload = {
			requestId,
		};

		if (companyId) {
			payload.companyId = String(companyId);
		}
		if (companyName) {
			payload.companyName = String(companyName);
		}
		if (documentType) {
			payload.documentType = String(documentType);
		}
		if (documentId) {
			payload.documentId = String(documentId);
		}

		// Resolve should target the request's sub-account Lambda when accountId is present.
		const requestItem = await getRequestById(requestId, stage);
		if (!requestItem) {
			return Response.json(
				{ error: `Request not found in ${stage}` },
				{ status: 404 },
			);
		}

		const accountId =
			typeof requestItem.accountId === "string" && requestItem.accountId.trim()
				? requestItem.accountId.trim()
				: undefined;

		// Invoke the resolve Lambda (accountId-based when available; stage fallback for legacy records)
		const result = await invokeResolveSync(payload, stage, accountId);

		// Return appropriate response based on Lambda result
		if (result.success) {
			return Response.json(
				{
					success: true,
					message: result.message,
					requestId,
					stage,
					targetAccountId: accountId,
				},
				{ status: 200 },
			);
		}

		// 409: Already resolved or claimed
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

		// Other errors
		return Response.json(
			{
				success: false,
				error: result.error || "Failed to resolve request",
				requestId,
				stage,
				targetAccountId: accountId,
			},
			{ status: 500 },
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		console.error(`Resolve request failed for ${requestId}:`, errorMessage);

		return Response.json(
			{ error: errorMessage || "Failed to resolve request" },
			{ status: 500 },
		);
	}
}
