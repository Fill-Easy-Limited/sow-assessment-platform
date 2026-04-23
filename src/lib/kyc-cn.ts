import "server-only";

export type KycCnEndpoint = "identity" | "mobile" | "risk";

const ALLOWED: ReadonlySet<KycCnEndpoint> = new Set([
	"identity",
	"mobile",
	"risk",
]);

export function isKycCnEndpoint(value: string): value is KycCnEndpoint {
	return ALLOWED.has(value as KycCnEndpoint);
}

export interface KycCnResult {
	status: number;
	ok: boolean;
	latencyMs: number;
	data: unknown;
}

export async function callKycCn(
	endpoint: KycCnEndpoint,
	body: unknown,
): Promise<KycCnResult> {
	const baseUrl = process.env.KYC_CN_BASE_URL;
	const clientId = process.env.KYC_CN_CLIENT_ID;
	const clientSecret = process.env.KYC_CN_CLIENT_SECRET;

	if (!baseUrl || !clientId || !clientSecret) {
		throw new Error(
			"KYC_CN_BASE_URL / KYC_CN_CLIENT_ID / KYC_CN_CLIENT_SECRET must be set",
		);
	}

	const url = `${baseUrl.replace(/\/$/, "")}/kyc/cn/${endpoint}`;
	const started = Date.now();

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			"x-client-id": clientId,
			"x-client-secret": clientSecret,
		},
		body: JSON.stringify(body ?? {}),
		cache: "no-store",
	});

	const latencyMs = Date.now() - started;
	const text = await response.text();
	let data: unknown = text;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		// leave as raw text
	}

	return {
		status: response.status,
		ok: response.ok,
		latencyMs,
		data,
	};
}
