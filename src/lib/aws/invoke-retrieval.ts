import { InvokeCommand } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./lambda-client";
import {
	type InvokeRetrievalEventPayload,
	getCraInvokeRetrievalLambdaArnByAccount,
	getCraInvokeRetrievalLambdaArn,
	validateInvokeRetrievalPayload,
} from "./cra-config";
import {
	type LraInvokeRetrievalEventPayload,
	getLraInvokeRetrievalLambdaArnByAccount,
	validateLraInvokeRetrievalPayload,
} from "./lra-config";
import type { Stage } from "@/lib/dynamodb/config";

/**
 * Response from invoking CraInvokeRetrieval / LraInvokeRetrieval Lambdas.
 */
export interface InvokeRetrievalResponse {
	success: boolean;
	status?: number;
	message?: string;
	error?: string;
}

/**
 * Invokes the CraInvokeRetrieval Lambda async (fire-and-forget) to re-run retrieval.
 */
export async function invokeCraRetrieval(
	payload: InvokeRetrievalEventPayload,
	stage: Stage,
	accountId?: string,
): Promise<InvokeRetrievalResponse> {
	if (!validateInvokeRetrievalPayload(payload)) {
		throw new Error("Invalid payload: requestId is required");
	}

	const functionArn = accountId
		? getCraInvokeRetrievalLambdaArnByAccount(accountId)
		: getCraInvokeRetrievalLambdaArn(stage);

	try {
		const command = new InvokeCommand({
			FunctionName: functionArn,
			InvocationType: "Event",
			Payload: Buffer.from(JSON.stringify(payload)),
		});

		const response = await lambdaClient.send(command);

		if (response.StatusCode === 202) {
			return {
				success: true,
				status: 202,
				message: "Retrieval invoked successfully",
			};
		}

		return {
			success: false,
			status: response.StatusCode,
			error: `Unexpected Lambda response status: ${response.StatusCode}`,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			`Failed to invoke CraInvokeRetrieval Lambda in ${stage}${accountId ? ` (account ${accountId})` : ""}:`,
			errorMessage,
		);
		throw new Error(`Failed to invoke retrieval lambda: ${errorMessage}`);
	}
}

/**
 * Invokes CraInvokeRetrieval synchronously to get immediate feedback.
 */
export async function invokeCraRetrievalSync(
	payload: InvokeRetrievalEventPayload,
	stage: Stage,
	accountId?: string,
): Promise<InvokeRetrievalResponse> {
	if (!validateInvokeRetrievalPayload(payload)) {
		throw new Error("Invalid payload: requestId is required");
	}

	const functionArn = accountId
		? getCraInvokeRetrievalLambdaArnByAccount(accountId)
		: getCraInvokeRetrievalLambdaArn(stage);

	try {
		const command = new InvokeCommand({
			FunctionName: functionArn,
			InvocationType: "RequestResponse",
			Payload: Buffer.from(JSON.stringify(payload)),
		});

		const response = await lambdaClient.send(command);

		let lambdaResult: unknown;
		if (response.Payload) {
			const payloadString =
				typeof response.Payload === "string"
					? response.Payload
					: new TextDecoder().decode(response.Payload as Uint8Array);
			lambdaResult = JSON.parse(payloadString);
		}

		if (response.FunctionError) {
			console.error(
				`CraInvokeRetrieval Lambda returned function error:`,
				lambdaResult,
			);
			return {
				success: false,
				error: `Lambda execution error: ${JSON.stringify(lambdaResult)}`,
			};
		}

		// Sync invoke returns HTTP 200 whenever the function runs; the business status
		// is in the Lambda's returned payload.
		const result = (lambdaResult ?? {}) as {
			statusCode?: number;
			message?: string;
		};
		const statusCode = result.statusCode ?? response.StatusCode;

		if (statusCode === 200) {
			return {
				success: true,
				status: 200,
				message: result.message ?? "Retrieval invoked successfully",
			};
		}

		if (statusCode === 409) {
			return {
				success: false,
				status: 409,
				error: result.message ?? "Request is not in search or manual step",
			};
		}

		return {
			success: false,
			status: statusCode,
			error:
				result.message ??
				(lambdaResult ? JSON.stringify(lambdaResult) : `HTTP ${statusCode}`),
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			`Failed to invoke CraInvokeRetrieval Lambda in ${stage}${accountId ? ` (account ${accountId})` : ""}:`,
			errorMessage,
		);
		throw new Error(`Failed to invoke retrieval lambda: ${errorMessage}`);
	}
}

/**
 * Invokes LraInvokeRetrieval synchronously.
 */
export async function invokeLraRetrievalSync(
	payload: LraInvokeRetrievalEventPayload,
	accountId: string,
): Promise<InvokeRetrievalResponse> {
	if (!validateLraInvokeRetrievalPayload(payload)) {
		throw new Error("Invalid payload: requestId is required");
	}

	const functionArn = getLraInvokeRetrievalLambdaArnByAccount(accountId);

	try {
		const command = new InvokeCommand({
			FunctionName: functionArn,
			InvocationType: "RequestResponse",
			Payload: Buffer.from(JSON.stringify(payload)),
		});

		const response = await lambdaClient.send(command);

		let lambdaResult: unknown;
		if (response.Payload) {
			const payloadString =
				typeof response.Payload === "string"
					? response.Payload
					: new TextDecoder().decode(response.Payload as Uint8Array);
			lambdaResult = JSON.parse(payloadString);
		}

		if (response.FunctionError) {
			console.error(
				`LraInvokeRetrieval Lambda returned function error:`,
				lambdaResult,
			);
			return {
				success: false,
				error: `Lambda execution error: ${JSON.stringify(lambdaResult)}`,
			};
		}

		const result = (lambdaResult ?? {}) as {
			statusCode?: number;
			message?: string;
		};
		const statusCode = result.statusCode ?? response.StatusCode;

		if (statusCode === 200) {
			return {
				success: true,
				status: 200,
				message: result.message ?? "LRA retrieval invoked successfully",
			};
		}

		if (statusCode === 409) {
			return {
				success: false,
				status: 409,
				error: result.message ?? "Request is not in search or manual step",
			};
		}

		return {
			success: false,
			status: statusCode,
			error:
				result.message ??
				(lambdaResult ? JSON.stringify(lambdaResult) : `HTTP ${statusCode}`),
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			`Failed to invoke LraInvokeRetrieval Lambda (account ${accountId}):`,
			errorMessage,
		);
		throw new Error(`Failed to invoke LRA retrieval lambda: ${errorMessage}`);
	}
}
