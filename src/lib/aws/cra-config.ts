/**
 * Configuration for CRA (Company Registry Access) Lambdas
 */
import { STAGE_ACCOUNTS, type Stage } from "@/lib/dynamodb/config";

export const LAMBDA_REGION = "ap-east-1";

/**
 * Get the ARN for the CraInvokeRetrieval Lambda in a given stage/account.
 * The Lambda is deployed in each client sub-account as part of CraStack.
 */
export function getCraInvokeRetrievalLambdaArn(stage: Stage): string {
	const account = STAGE_ACCOUNTS[stage];
	return `arn:aws:lambda:${LAMBDA_REGION}:${account}:function:CraInvokeRetrieval`;
}

/**
 * Get the ARN for the CraInvokeRetrieval Lambda from an explicit sub-account ID.
 * Used by tracker records that carry `accountId`.
 */
export function getCraInvokeRetrievalLambdaArnByAccount(
	accountId: string,
): string {
	return `arn:aws:lambda:${LAMBDA_REGION}:${accountId}:function:CraInvokeRetrieval`;
}

/**
 * Interface for the CraInvokeRetrieval Lambda payload.
 * Mirrors the InvokeRetrievalEvent interface used by the Lambda.
 * All identifier fields are optional — when all omitted, the Lambda treats the call
 * as a retry (valid for requests in the `manual` step).
 */
export interface InvokeRetrievalEventPayload {
	requestId: string;
	companyId?: string;
	companyName?: string;
	documentType?: string;
	documentId?: string;
}

/**
 * Validates that requestId is present. Identifier fields are optional.
 */
export function validateInvokeRetrievalPayload(
	payload: unknown,
): payload is InvokeRetrievalEventPayload {
	if (typeof payload !== "object" || payload === null) return false;
	const p = payload as Record<string, unknown>;
	return typeof p.requestId === "string" && !!p.requestId.trim();
}
