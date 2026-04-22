import type {
	EmailChain,
	EmailChainFilters,
	RequestFilters,
	RequestItem,
} from "./types";

/**
 * API client for the dashboard.
 * When running locally without NEXT_PUBLIC_API_URL, calls go to the
 * built-in Next.js API routes (/api/requests).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		...options,
	});
	if (!res.ok) {
		let detail = "";
		try {
			const body = (await res.clone().json()) as { error?: string };
			if (body?.error) detail = ` - ${body.error}`;
		} catch {
			// ignore body parse failures
		}
		throw new Error(`API error: ${res.status} ${res.statusText}${detail}`);
	}
	return res.json() as Promise<T>;
}

// ---------- Requests ----------

export async function getRequests(
	filters?: RequestFilters,
): Promise<RequestItem[]> {
	const params = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				params.set(key, String(value));
			}
		});
	}
	const query = params.toString();
	return request<RequestItem[]>(`/api/requests${query ? `?${query}` : ""}`);
}

export async function getRequestById(
	requestId: string,
): Promise<RequestItem | null> {
	return request<RequestItem | null>(
		`/api/requests/${encodeURIComponent(requestId)}`,
	);
}

// ---------- File Upload ----------

export interface UploadToUrlResult {
	success: boolean;
	status: number;
	etag?: string;
	url: string;
}

/**
 * Fetch request details, validate upload preconditions, then upload to request.uploadUrl.
 */
export async function uploadFileForRequest(
	requestId: string,
	file: File,
	stage?: string,
): Promise<UploadToUrlResult> {
	const formData = new FormData();
	formData.append("file", file);

	const params = new URLSearchParams();
	if (stage) {
		params.set("stage", stage);
	}

	const query = params.toString();
	const res = await fetch(
		`${API_URL}/api/requests/${encodeURIComponent(requestId)}/upload${query ? `?${query}` : ""}`,
		{
			method: "POST",
			body: formData,
		},
	);

	if (!res.ok) {
		let details = "";
		try {
			const body = (await res.json()) as { error?: string };
			details = body.error ? ` - ${body.error}` : "";
		} catch {
			// ignore body parse failures
		}
		throw new Error(`Upload failed: ${res.status} ${res.statusText}${details}`);
	}

	return res.json() as Promise<UploadToUrlResult>;
}

// ---------- Email Chains ----------

export interface EmailChainListResponse {
	items: EmailChain[];
	lastEvaluatedKey: string | null;
}

export async function getEmailChains(
	filters?: EmailChainFilters & { startKey?: string },
): Promise<EmailChainListResponse> {
	const params = new URLSearchParams();
	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				params.set(key, String(value));
			}
		});
	}
	const query = params.toString();
	return request<EmailChainListResponse>(
		`/api/emailchains${query ? `?${query}` : ""}`,
	);
}

export async function getEmailChainById(
	chainId: string,
	stage?: string,
): Promise<EmailChain | null> {
	const params = new URLSearchParams();
	if (stage) params.set("stage", stage);
	const query = params.toString();
	return request<EmailChain | null>(
		`/api/emailchains/${encodeURIComponent(chainId)}${query ? `?${query}` : ""}`,
	);
}
