/**
 * Configuration for LRA (Land Registry Access) Lambdas
 */
import { LAMBDA_REGION } from "./cra-config";

/**
 * Get the ARN for the LraResolve Lambda from an explicit sub-account ID.
 * Used by tracker records that carry `accountId`.
 */
export function getLraResolveLambdaArnByAccount(accountId: string): string {
	return `arn:aws:lambda:${LAMBDA_REGION}:${accountId}:function:LraResolve`;
}

/**
 * Interface for the LraResolve Lambda payload.
 */
export interface LraResolveEventPayload {
	requestId: string;
	prn: string;
}

/**
 * Validation for LRA resolve event payload.
 * Both requestId and prn are required.
 */
export function validateLraResolvePayload(
	payload: unknown,
): payload is LraResolveEventPayload {
	if (typeof payload !== "object" || payload === null) {
		return false;
	}

	const p = payload as Record<string, unknown>;

	if (typeof p.requestId !== "string" || !p.requestId.trim()) {
		return false;
	}

	if (typeof p.prn !== "string" || !p.prn.trim()) {
		return false;
	}

	return true;
}
