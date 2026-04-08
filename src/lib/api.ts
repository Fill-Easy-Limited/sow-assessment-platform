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
