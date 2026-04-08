import type { RequestFilters, RequestItem } from "./types";

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
		throw new Error(`API error: ${res.status} ${res.statusText}`);
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
			if (value) params.set(key, value);
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
 * Upload a file directly to a presigned S3 URL.
 *
 * Most CRA manual-step uploads provide an `uploadUrl` in the tracker record.
 * This helper performs the actual PUT to that URL.
 */
export async function uploadFileToPresignedUrl(
	uploadUrl: string,
	file: File,
): Promise<UploadToUrlResult> {
	if (!uploadUrl) {
		throw new Error("uploadUrl is required");
	}

	const headers: Record<string, string> = {};
	if (file.type) {
		headers["Content-Type"] = file.type;
	}

	const res = await fetch(uploadUrl, {
		method: "PUT",
		headers,
		body: file,
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(
			`Upload to S3 failed: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`,
		);
	}

	return {
		success: true,
		status: res.status,
		etag: res.headers.get("etag") ?? undefined,
		url: uploadUrl,
	};
}

/**
 * Fetch request details, validate upload preconditions, then upload to request.uploadUrl.
 *
 * This is the high-level helper intended for CRA manual flow:
 * 1) find the request record
 * 2) ensure it's in `manual` step
 * 3) upload to the presigned URL
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

export async function uploadFile(file: File): Promise<{ url: string }> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch(`${API_URL}/api/upload`, {
		method: "POST",
		body: formData,
	});
	if (!res.ok) {
		throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
	}
	return res.json();
}
