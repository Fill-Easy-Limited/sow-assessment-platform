import "server-only";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_PREFIXES = [
	"kyc/",
	"cra/",
	"lra/",
	"iamsmart/",
	"sgid/",
	"sino-connect/",
	"uaepass/",
	"core/billing",
];

function getCredentials() {
	const baseUrl = process.env.DEMO_BASE_URL?.replace(/\/$/, "");
	const clientId = process.env.DEMO_CLIENT_ID;
	const clientSecret = process.env.DEMO_CLIENT_SECRET;
	return { baseUrl, clientId, clientSecret };
}

function authHeaders(clientId: string, clientSecret: string) {
	return {
		"Content-Type": "application/json",
		Accept: "application/json",
		"x-client-id": clientId,
		"x-client-secret": clientSecret,
	};
}

async function wrapUpstream(upstream: Response, started: number) {
	const latencyMs = Date.now() - started;
	const text = await upstream.text();
	let data: unknown = text;
	try {
		data = text ? JSON.parse(text) : null;
	} catch {
		// leave as raw text
	}
	return Response.json({ status: upstream.status, ok: upstream.ok, latencyMs, data });
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const slug = (await params).slug;
	const path = slug.join("/");

	if (!ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
		return Response.json({ error: "Forbidden path" }, { status: 403 });
	}

	const { baseUrl, clientId, clientSecret } = getCredentials();
	if (!baseUrl || !clientId || !clientSecret) {
		return Response.json({ error: "DEMO_BASE_URL / DEMO_CLIENT_ID / DEMO_CLIENT_SECRET must be set" }, { status: 500 });
	}

	const qs = request.nextUrl.search;
	const upstreamUrl = `${baseUrl}/${path}${qs}`;
	const started = Date.now();

	const upstream = await fetch(upstreamUrl, {
		method: "GET",
		headers: authHeaders(clientId, clientSecret),
		cache: "no-store",
	});

	return wrapUpstream(upstream, started);
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const slug = (await params).slug;
	const path = slug.join("/");

	if (!ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
		return Response.json({ error: "Forbidden path" }, { status: 403 });
	}

	const { baseUrl, clientId, clientSecret } = getCredentials();
	if (!baseUrl || !clientId || !clientSecret) {
		return Response.json({ error: "DEMO_BASE_URL / DEMO_CLIENT_ID / DEMO_CLIENT_SECRET must be set" }, { status: 500 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const upstreamUrl = `${baseUrl}/${path}`;
	const started = Date.now();

	const upstream = await fetch(upstreamUrl, {
		method: "POST",
		headers: authHeaders(clientId, clientSecret),
		body: JSON.stringify(body ?? {}),
		cache: "no-store",
	});

	return wrapUpstream(upstream, started);
}
