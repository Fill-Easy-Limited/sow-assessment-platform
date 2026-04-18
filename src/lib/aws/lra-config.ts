/**
 * Configuration for LRA (Land Registry Access) Lambdas
 */
import { LAMBDA_REGION } from "./cra-config";

/**
 * Get the ARN for the LraInvokeRetrieval Lambda from an explicit sub-account ID.
 * Used by tracker records that carry `accountId`.
 */
export function getLraInvokeRetrievalLambdaArnByAccount(
	accountId: string,
): string {
	return `arn:aws:lambda:${LAMBDA_REGION}:${accountId}:function:LraInvokeRetrieval`;
}

/**
 * Interface for the LraInvokeRetrieval Lambda payload.
 * `prn` is optional — omitted on retry-from-manual (token already has it).
 */
export interface LraInvokeRetrievalEventPayload {
	requestId: string;
	prn?: string;
}

/**
 * Validates that requestId is present. `prn` is optional.
 */
export function validateLraInvokeRetrievalPayload(
	payload: unknown,
): payload is LraInvokeRetrievalEventPayload {
	if (typeof payload !== "object" || payload === null) return false;
	const p = payload as Record<string, unknown>;
	return typeof p.requestId === "string" && !!p.requestId.trim();
}
