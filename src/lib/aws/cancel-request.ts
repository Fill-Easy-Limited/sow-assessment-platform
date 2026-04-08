import { InvokeCommand } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./lambda-client";
import {
	getCraCancelLambdaArn,
	getCraCancelLambdaArnByAccount,
} from "./cra-config";
import type { Stage } from "@/lib/dynamodb/config";

export interface CancelEventPayload {
	requestId: string;
}

export interface CancelResponse {
	success: boolean;
	status?: number;
	message?: string;
	error?: string;
	previousStep?: string;
}

interface CancelLambdaResult {
	statusCode?: number;
	message?: string;
	previousStep?: string;
}

export async function invokeCancelSync(
	payload: CancelEventPayload,
	stage: Stage,
	accountId?: string,
): Promise<CancelResponse> {
	if (!payload.requestId?.trim()) {
		throw new Error("Invalid payload: requestId is required");
	}

	const functionArn = accountId
		? getCraCancelLambdaArnByAccount(accountId)
		: getCraCancelLambdaArn(stage);

	try {
		const command = new InvokeCommand({
			FunctionName: functionArn,
			InvocationType: "RequestResponse",
			Payload: Buffer.from(JSON.stringify({ requestId: payload.requestId })),
		});

		const response = await lambdaClient.send(command);

		let lambdaResult: CancelLambdaResult | null = null;
		if (response.Payload) {
			const payloadString =
				typeof response.Payload === "string"
					? response.Payload
					: new TextDecoder().decode(response.Payload as Uint8Array);
			try {
				lambdaResult = JSON.parse(payloadString) as CancelLambdaResult;
			} catch {
				lambdaResult = null;
			}
		}

		if (response.FunctionError) {
			return {
				success: false,
				error: `Lambda execution error: ${JSON.stringify(lambdaResult)}`,
			};
		}

		const status = lambdaResult?.statusCode ?? response.StatusCode;
		if (status === 200) {
			return {
				success: true,
				status: 200,
				message: lambdaResult?.message ?? "Request cancelled",
				previousStep: lambdaResult?.previousStep,
			};
		}

		if (status === 409) {
			return {
				success: false,
				status: 409,
				error: lambdaResult?.message ?? "Request is not in a cancellable step",
			};
		}

		return {
			success: false,
			status,
			error: lambdaResult?.message ?? "Failed to cancel request",
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to invoke cancel lambda: ${errorMessage}`);
	}
}
