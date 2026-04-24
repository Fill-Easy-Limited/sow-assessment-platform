/**
 * Client-side API utilities for invoking retrieval / cancelling requests.
 * These functions call the backend API routes.
 */

export interface InvokeRetrievalOptions {
	stage?: string;
}

export interface CancelRequestOptions {
	stage?: string;
}

export interface InvokeRetrievalInput {
	companyId?: string;
	companyName?: string;
	documentId?: string;
	documentType?: string;
}

export interface LraInvokeRetrievalInput {
	prn: string;
}

export interface InvokeRetrievalResult {
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
 * Invokes retrieval for a CRA request. Used both to "resolve" a search-stalled
 * request (with identifiers) and to "retry" a manual-state request (no input).
 * Calls POST /api/requests/[requestId]/invoke-retrieval
 */
export async function invokeRetrieval(
	requestId: string,
	input: InvokeRetrievalInput,
	options?: InvokeRetrievalOptions,
): Promise<InvokeRetrievalResult> {
	if (!requestId) {
		return { success: false, error: "requestId is required" };
	}

	const url = new URL(
		`/api/requests/${requestId}/invoke-retrieval`,
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
			headers: { "Content-Type": "application/json" },
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

		if (response.status === 409) {
			return {
				success: false,
				error: data.error || "Request is not in search or manual step",
			};
		}

		return {
			success: false,
			error: data.error || `HTTP ${response.status}: ${response.statusText}`,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { success: false, error: `Failed to reach API: ${message}` };
	}
}

/**
 * Retries a request stuck in the `manual` step by re-invoking its retrieval Lambda
 * with the token already stored in S3. Hits the same endpoint as `invokeRetrieval`
 * but accepts optional identifier overrides (CRA: companyId/documentId/etc., LRA: prn).
 * The server endpoint accepts both CRA and LRA field shapes and picks the right one
 * based on the `requestId` prefix.
 */
export interface RetryRequestInput {
	// CRA fields
	companyId?: string;
	companyName?: string;
	documentId?: string;
	documentType?: string;
	// LRA fields
	prn?: string;
}

export async function retryRequest(
	requestId: string,
	input?: RetryRequestInput,
	options?: InvokeRetrievalOptions,
): Promise<InvokeRetrievalResult> {
	if (!requestId) {
		return { success: false, error: "requestId is required" };
	}

	const url = new URL(
		`/api/requests/${requestId}/invoke-retrieval`,
		typeof window !== "undefined"
			? window.location.origin
			: "http://localhost:3000",
	);

	if (options?.stage) {
		url.searchParams.set("stage", options.stage);
	}

	const body: Record<string, string | undefined> = {
		stage: options?.stage,
	};
	if (input?.companyId?.trim()) body.companyId = input.companyId.trim();
	if (input?.companyName?.trim()) body.companyName = input.companyName.trim();
	if (input?.documentId?.trim()) body.documentId = input.documentId.trim();
	if (input?.documentType?.trim()) body.documentType = input.documentType.trim();
	if (input?.prn?.trim()) body.prn = input.prn.trim();

	try {
		const response = await fetch(url.toString(), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
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

		if (response.status === 409) {
			return {
				success: false,
				error: data.error || "Request is not in search or manual step",
			};
		}

		return {
			success: false,
			error: data.error || `HTTP ${response.status}: ${response.statusText}`,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { success: false, error: `Failed to reach API: ${message}` };
	}
}

export async function cancelRequest(
	requestId: string,
	options?: CancelRequestOptions,
): Promise<CancelRequestResult> {
	if (!requestId) {
		return { success: false, error: "requestId is required" };
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
			headers: { "Content-Type": "application/json" },
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
		return { success: false, error: `Failed to reach API: ${message}` };
	}
}

/**
 * Invokes retrieval for an LRA request. Used both to "resolve" a search-stalled
 * request (with PRN) and to "retry" a manual-state request (no input).
 * Calls POST /api/requests/[requestId]/invoke-retrieval with { prn? }
 */
export async function invokeLraRetrieval(
	requestId: string,
	input: LraInvokeRetrievalInput,
	options?: InvokeRetrievalOptions,
): Promise<InvokeRetrievalResult> {
	if (!requestId) {
		return { success: false, error: "requestId is required" };
	}
	if (!input.prn?.trim()) {
		return { success: false, error: "PRN is required" };
	}

	const url = new URL(
		`/api/requests/${requestId}/invoke-retrieval`,
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
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				prn: input.prn.trim(),
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

		if (response.status === 409) {
			return {
				success: false,
				error: data.error || "Request is not in search or manual step",
			};
		}

		return {
			success: false,
			error: data.error || `HTTP ${response.status}: ${response.statusText}`,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { success: false, error: `Failed to reach API: ${message}` };
	}
}
