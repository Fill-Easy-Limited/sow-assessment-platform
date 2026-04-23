import type { NextRequest } from "next/server";
import { callKycCn, isKycCnEndpoint } from "@/lib/kyc-cn";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ endpoint: string }> },
) {
	const { endpoint } = await params;

	if (!isKycCnEndpoint(endpoint)) {
		return Response.json(
			{ error: `Unknown endpoint: ${endpoint}` },
			{ status: 404 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	try {
		const result = await callKycCn(endpoint, body);
		return Response.json(result, { status: 200 });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("KYC CN proxy failed:", { endpoint, message });
		return Response.json(
			{ error: "Upstream call failed", details: message },
			{ status: 500 },
		);
	}
}
