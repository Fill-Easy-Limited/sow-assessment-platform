import type { NextRequest } from "next/server";
import { getAccountIdForOrg } from "@/lib/aws/cognito";
import type { InvokeRetrievalEventPayload } from "@/lib/aws/cra-config";
import {
	invokeCraRetrievalSync,
	invokeLraRetrievalSync,
} from "@/lib/aws/invoke-retrieval";
import { ENABLED_STAGES, getRequestById, type Stage } from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

/**
 * POST /api/requests/[requestId]/invoke-retrieval
 *
 * Invokes the CraInvokeRetrieval or LraInvokeRetrieval Lambda depending on the
 * request type. Used both to "resolve" a search-stalled request (with identifiers)
 * and to "retry" a manual-state request (with no identifiers).
 *
 * CRA body: { companyId?, companyName?, documentType?, documentId?, stage? }
 * LRA body: { prn?, stage? }
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

		// --- LRA ---
		if (isLra) {
			const { prn } = body;
			const prnTrimmed =
				typeof prn === "string" && prn.trim() ? prn.trim() : undefined;

			const result = await invokeLraRetrievalSync(
				{ requestId, ...(prnTrimmed ? { prn: prnTrimmed } : {}) },
				accountId,
			);

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
					error: result.error || "Failed to invoke LRA retrieval",
					requestId,
					stage,
					targetAccountId: accountId,
				},
				{ status: 500 },
			);
		}

		// --- CRA ---
		const { companyId, companyName, documentType, documentId } = body;
		const payload: InvokeRetrievalEventPayload = { requestId };
		if (companyId) payload.companyId = String(companyId);
		if (companyName) payload.companyName = String(companyName);
		if (documentType) payload.documentType = String(documentType);
		if (documentId) payload.documentId = String(documentId);

		const result = await invokeCraRetrievalSync(payload, stage, accountId);

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
				error: result.error || "Failed to invoke retrieval",
				requestId,
				stage,
				targetAccountId: accountId,
			},
			{ status: 500 },
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`InvokeRetrieval failed for ${requestId}:`, errorMessage);

		return Response.json(
			{ error: errorMessage || "Failed to invoke retrieval" },
			{ status: 500 },
		);
	}
}
