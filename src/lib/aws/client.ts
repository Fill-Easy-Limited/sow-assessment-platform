/**
 * Client-side API utilities for resolve requests.
 * These functions call the backend API routes.
 */

export interface ResolveRequestOptions {
	stage?: string;
}

export interface CancelRequestOptions {
	stage?: string;
}

export interface ResolveRequestInput {
	companyId?: string;
	companyName?: string;
	documentId?: string;
	documentType?: string;
}

export interface ResolveRequestResult {
	success: boolean;
	message?: string;
	error?: string;
	requestId?: string;
	stage?: string;
}

export interface CancelRequestResult {
	success: boolean;
	message?: string;
	error?: string;
	requestId?: string;
	stage?: string;
	previousStep?: string;
}

/**
 * Client-side function to resolve a request stuck in the `search` step.
 * Calls POST /api/requests/[requestId]/resolve
 *
 * @param requestId - The request ID to resolve
 * @param companyId - Optional company ID
 * @param companyName - Optional company name (at least one of companyId or companyName required)
 * @param options - Optional configuration (stage, etc.)
 * @returns Promise<ResolveRequestResult>
 */
export async function resolveRequest(
	requestId: string,
	input: ResolveRequestInput,
	options?: ResolveRequestOptions,
): Promise<ResolveRequestResult> {
	if (!requestId) {
		return {
			success: false,
			error: "requestId is required",
		};
	}

	if (!input.companyId && !input.companyName && !input.documentId) {
		return {
			success: false,
			error: "At least one of companyId, companyName, or documentId must be provided",
		};
	}

	const url = new URL(
		`/api/requests/${requestId}/resolve`,
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:3000",
	);

	if (options?.stage) {
		url.searchParams.set("stage", options.stage);
	}

	try {
		const response = await fetch(url.toString(), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				companyId: input.companyId,
				companyName: input.companyName,
				documentId: input.documentId,
				documentType: input.documentType,
				stage: options?.stage,
			}),
		});

		const data = await response.json();

		if (response.ok) {
			return {
				success: true,
				message: data.message,
				requestId: data.requestId,
				stage: data.stage,
			};
		}

		// Handle error responses from the API
		if (response.status === 409) {
			return {
				success: false,
				error: data.error || "Request is not in search step",
			};
		}

		return {
			success: false,
			error:
				data.error ||
				`HTTP ${response.status}: ${response.statusText}`,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : String(error);
		return {
			success: false,
			error: `Failed to reach API: ${message}`,
		};
	}
}

export async function cancelRequest(
	requestId: string,
	options?: CancelRequestOptions,
): Promise<CancelRequestResult> {
	if (!requestId) {
		return {
			success: false,
			error: "requestId is required",
		};
	}

	const url = new URL(
		`/api/requests/${requestId}/cancel`,
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:3000",
	);

	if (options?.stage) {
		url.searchParams.set("stage", options.stage);
	}

	try {
		const response = await fetch(url.toString(), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ stage: options?.stage }),
		});

		const data = await response.json();

		if (response.ok) {
			return {
				success: true,
				message: data.message,
				requestId: data.requestId,
				stage: data.stage,
				previousStep: data.previousStep,
			};
		}

		if (response.status === 409) {
			return {
				success: false,
				error: data.error || "Request cannot be cancelled",
			};
		}

		return {
			success: false,
			error: data.error || `HTTP ${response.status}: ${response.statusText}`,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			success: false,
			error: `Failed to reach API: ${message}`,
		};
	}
}
