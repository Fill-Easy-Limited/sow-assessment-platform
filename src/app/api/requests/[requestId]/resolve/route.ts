import type { NextRequest } from "next/server";
import { getAccountIdForOrg } from "@/lib/aws/cognito";
import type { ResolveEventPayload } from "@/lib/aws/cra-config";
import { invokeResolveSync, invokeLraResolveSync } from "@/lib/aws/resolve-request";
import { ENABLED_STAGES, getRequestById, type Stage } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

/**
 * POST /api/requests/[requestId]/resolve
 *
 * Invokes the CraResolve or LraResolve Lambda depending on the request type.
 *
 * CRA body: { companyId?, companyName?, documentType?, documentId?, stage? }
 * LRA body: { prn, stage? }
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	const { requestId } = await params;

	if (!requestId || typeof requestId !== "string") {
		return Response.json(
			{ error: "Missing or invalid requestId" },
			{ status: 400 },
		);
	}

	const isLra = requestId.startsWith("LR_");

	try {
		let body: Record<string, unknown> = {};
		try {
			body = await request.json();
		} catch {
			return Response.json(
				{ error: "Invalid request body JSON" },
				{ status: 400 },
			);
		}

		let stage: Stage = "prod";
		const stageParam =
			body.stage || request.nextUrl.searchParams.get("stage") || "prod";

		if (!ENABLED_STAGES.includes(stageParam as Stage)) {
			return Response.json(
				{ error: `Invalid stage. Allowed: ${ENABLED_STAGES.join(", ")}` },
				{ status: 400 },
			);
		}
		stage = stageParam as Stage;

		// Look up the request record to get accountId / organization
		const requestItem = await getRequestById(requestId, stage);
		if (!requestItem) {
			return Response.json(
				{ error: `Request not found in ${stage}` },
				{ status: 404 },
			);
		}

		let accountId =
			typeof requestItem.accountId === "string" && requestItem.accountId.trim()
				? requestItem.accountId.trim()
				: undefined;

		if (!accountId && requestItem.organization) {
			accountId = await getAccountIdForOrg(
				String(requestItem.organization),
				stage,
			);
		}

		if (!accountId) {
			return Response.json(
				{
					error: `Could not determine account ID for organization '${String(requestItem.organization)}' in ${stage}. The organization may not be registered in Cognito.`,
					requestId,
					stage,
				},
				{ status: 400 },
			);
		}

		// --- LRA resolve ---
		if (isLra) {
			const { prn } = body;
			if (!prn || typeof prn !== "string" || !String(prn).trim()) {
				return Response.json(
					{ error: "PRN is required for LRA resolve" },
					{ status: 400 },
				);
			}

			const result = await invokeLraResolveSync(
				{ requestId, prn: String(prn).trim() },
				accountId,
			);

			if (result.success) {
				return Response.json(
					{ success: true, message: result.message, requestId, stage, targetAccountId: accountId },
					{ status: 200 },
				);
			}
			if (result.status === 409) {
				return Response.json(
					{ success: false, error: result.error, requestId, stage, targetAccountId: accountId },
					{ status: 409 },
				);
			}
			return Response.json(
				{ success: false, error: result.error || "Failed to resolve LRA request", requestId, stage, targetAccountId: accountId },
				{ status: 500 },
			);
		}

		// --- CRA resolve ---
		const { companyId, companyName, documentType, documentId } = body;
		if (!companyId && !companyName && !documentId) {
			return Response.json(
				{ error: "At least one of companyId, companyName, or documentId must be provided" },
				{ status: 400 },
			);
		}

		const payload: ResolveEventPayload = { requestId };
		if (companyId) payload.companyId = String(companyId);
		if (companyName) payload.companyName = String(companyName);
		if (documentType) payload.documentType = String(documentType);
		if (documentId) payload.documentId = String(documentId);

		const result = await invokeResolveSync(payload, stage, accountId);

		if (result.success) {
			return Response.json(
				{ success: true, message: result.message, requestId, stage, targetAccountId: accountId },
				{ status: 200 },
			);
		}
		if (result.status === 409) {
			return Response.json(
				{ success: false, error: result.error, requestId, stage, targetAccountId: accountId },
				{ status: 409 },
			);
		}
		return Response.json(
			{ success: false, error: result.error || "Failed to resolve request", requestId, stage, targetAccountId: accountId },
			{ status: 500 },
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`Resolve request failed for ${requestId}:`, errorMessage);

		return Response.json(
			{ error: errorMessage || "Failed to resolve request" },
			{ status: 500 },
		);
	}
}
