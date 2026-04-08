/**
 * Configuration for CRA (Company Registry Access) Lambdas
 */
import { STAGE_ACCOUNTS, type Stage } from "@/lib/dynamodb/config";

export const LAMBDA_REGION = "ap-east-1";

/**
 * Get the ARN for the CraResolve Lambda in a given stage/account.
 * The Lambda is deployed in each client sub-account as part of CraStack.
 */
export function getCraResolveLambdaArn(stage: Stage): string {
	const account = STAGE_ACCOUNTS[stage];
	return `arn:aws:lambda:${LAMBDA_REGION}:${account}:function:CraResolve`;
}

/**
 * Get the ARN for the CraResolve Lambda from an explicit sub-account ID.
 * Used by tracker records that carry `accountId`.
 */
export function getCraResolveLambdaArnByAccount(accountId: string): string {
	return `arn:aws:lambda:${LAMBDA_REGION}:${accountId}:function:CraResolve`;
}

export function getCraCancelLambdaArn(stage: Stage): string {
	const account = STAGE_ACCOUNTS[stage];
	return `arn:aws:lambda:${LAMBDA_REGION}:${account}:function:CraCancel`;
}

export function getCraCancelLambdaArnByAccount(accountId: string): string {
	return `arn:aws:lambda:${LAMBDA_REGION}:${accountId}:function:CraCancel`;
}

/**
 * Interface for the CraResolve Lambda payload.
 * Mirrors the ResolveEvent interface used by the Lambda.
 */
export interface ResolveEventPayload {
	requestId: string; // Required
	companyId?: string;
	companyName?: string;
	documentType?: string;
	documentId?: string;
}

/**
 * Validation for resolve event payload.
 * requestId is always required. At least one of companyId, companyName, or documentId must be provided.
 */
export function validateResolvePayload(payload: unknown): payload is ResolveEventPayload {
	if (typeof payload !== "object" || payload === null) {
		return false;
	}

	const p = payload as Record<string, unknown>;

	// requestId is always required
	if (typeof p.requestId !== "string" || !p.requestId.trim()) {
		return false;
	}

	// At least one of companyId, companyName, or documentId must be provided
	const hasCompanyId = typeof p.companyId === "string" && p.companyId.trim();
	const hasCompanyName = typeof p.companyName === "string" && p.companyName.trim();
	const hasDocumentId = typeof p.documentId === "string" && p.documentId.trim();

	if (!hasCompanyId && !hasCompanyName && !hasDocumentId) {
		return false;
	}

	return true;
}
