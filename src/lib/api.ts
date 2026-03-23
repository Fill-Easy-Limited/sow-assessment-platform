import { RequestItem, RequestFilters } from "./types";

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
  filters?: RequestFilters
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

export async function updateRequestStatus(
  requestId: string,
  step: string
): Promise<RequestItem> {
  return request<RequestItem>(`/api/requests/${encodeURIComponent(requestId)}/status`, {
    method: "PUT",
    body: JSON.stringify({ step }),
  });
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
