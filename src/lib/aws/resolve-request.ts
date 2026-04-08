import { InvokeCommand } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./lambda-client";
import {
	type ResolveEventPayload,
	getCraResolveLambdaArnByAccount,
	getCraResolveLambdaArn,
	validateResolvePayload,
} from "./cra-config";
import type { Stage } from "@/lib/dynamodb/config";

/**
 * Response from invoking CraResolve Lambda
 */
export interface ResolveResponse {
	success: boolean;
	status?: number;
	message?: string;
	error?: string;
}

/**
 * Invokes the CraResolve Lambda in cross-account to submit a company identifier
 * and resume a request stuck in the `search` step.
 *
 * @param payload - The resolve event containing requestId and at least one identifier
 * @param stage - The stage/environment (prod, staging, dev, etc.)
 * @returns Promise<ResolveResponse>
 *
 * @throws Error if payload is invalid or if the Lambda invocation fails
 */
export async function invokeResolve(
	payload: ResolveEventPayload,
	stage: Stage,
	accountId?: string,
): Promise<ResolveResponse> {
	// Validate payload
	if (!validateResolvePayload(payload)) {
		throw new Error(
			"Invalid payload: requestId is required and at least one of companyId or companyName must be provided",
		);
	}

	const functionArn = accountId
		? getCraResolveLambdaArnByAccount(accountId)
		: getCraResolveLambdaArn(stage);

	try {
		const command = new InvokeCommand({
			FunctionName: functionArn,
			InvocationType: "Event", // Async invocation - fire and forget
			Payload: Buffer.from(JSON.stringify(payload)),
		});

		const response = await lambdaClient.send(command);

		// Event invocation (async) always returns StatusCode 202 if queued successfully
		if (response.StatusCode === 202) {
			return {
				success: true,
				status: 202,
				message: "Resolve invoked successfully",
			};
		}

		// Unexpected status code
		return {
			success: false,
			status: response.StatusCode,
			error: `Unexpected Lambda response status: ${response.StatusCode}`,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		console.error(
			`Failed to invoke CraResolve Lambda in ${stage}${accountId ? ` (account ${accountId})` : ""}:`,
			errorMessage,
		);

		throw new Error(
			`Failed to invoke resolve lambda: ${errorMessage}`,
		);
	}
}

/**
 * Invokes CraResolve with RequestResponse type to get immediate feedback.
 * Used when you need to know if the resolution succeeded or if it's already claimed.
 *
 * @param payload - The resolve event
 * @param stage - The stage/environment
 * @returns Promise<ResolveResponse>
 */
export async function invokeResolveSync(
	payload: ResolveEventPayload,
	stage: Stage,
	accountId?: string,
): Promise<ResolveResponse> {
	if (!validateResolvePayload(payload)) {
		throw new Error(
			"Invalid payload: requestId is required and at least one of companyId or companyName must be provided",
		);
	}

	const functionArn = accountId
		? getCraResolveLambdaArnByAccount(accountId)
		: getCraResolveLambdaArn(stage);

	try {
		const command = new InvokeCommand({
			FunctionName: functionArn,
			InvocationType: "RequestResponse", // Synchronous invocation
			Payload: Buffer.from(JSON.stringify(payload)),
		});

		const response = await lambdaClient.send(command);

		// Parse the Lambda response
		let lambdaResult: unknown;
		if (response.Payload) {
			const payloadString =
				typeof response.Payload === "string"
					? response.Payload
					: new TextDecoder().decode(response.Payload as Uint8Array);
			lambdaResult = JSON.parse(payloadString);
		}

		// Check Lambda function errors
		if (response.FunctionError) {
			console.error(
				`CraResolve Lambda returned function error:`,
				lambdaResult,
			);
			return {
				success: false,
				error: `Lambda execution error: ${JSON.stringify(lambdaResult)}`,
			};
		}

		// 200: Retrieval invoked successfully
		if (response.StatusCode === 200) {
			return {
				success: true,
				status: 200,
				message: "Retrieval invoked successfully",
			};
		}

		// 409: Request is not in search step (already resolved or claimed)
		if (response.StatusCode === 409) {
			return {
				success: false,
				status: 409,
				error: "Request is not in search step - already resolved or claimed by another invocation",
			};
		}

		// Other status codes
		return {
			success: false,
			status: response.StatusCode,
			error: lambdaResult ? JSON.stringify(lambdaResult) : `HTTP ${response.StatusCode}`,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		console.error(
			`Failed to invoke CraResolve Lambda in ${stage}${accountId ? ` (account ${accountId})` : ""}:`,
			errorMessage,
		);

		throw new Error(`Failed to invoke resolve lambda: ${errorMessage}`);
	}
}
