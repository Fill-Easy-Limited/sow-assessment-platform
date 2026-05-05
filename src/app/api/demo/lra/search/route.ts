import "server-only";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

const SEARCH_TIMEOUT_MS = 25_000;

const lambda = new LambdaClient({ region: "us-east-1", requestHandler: { requestTimeout: 26_000 } });

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const started = Date.now();
	try {
		console.log("[lra-search] invoke", JSON.stringify(body));

		const lambdaResult = await Promise.race([
			lambda.send(
				new InvokeCommand({
					FunctionName: "globalSESLraLookup",
					Payload: Buffer.from(JSON.stringify(body)),
				}),
			),
			new Promise<null>((resolve) => setTimeout(() => resolve(null), SEARCH_TIMEOUT_MS)),
		]);

		const latencyMs = Date.now() - started;

		if (lambdaResult === null) {
			console.log("[lra-search] timed out after", SEARCH_TIMEOUT_MS + "ms — returning empty candidates");
			return Response.json({ status: 200, ok: true, latencyMs, data: { candidates: [] } });
		}

		const raw = Buffer.from(lambdaResult.Payload!).toString();
		console.log("[lra-search] response", latencyMs + "ms", lambdaResult.FunctionError ?? "ok", raw);
		let data: unknown = raw;
		try {
			data = raw ? JSON.parse(raw) : null;
		} catch { /* leave as raw string */ }

		const ok = !lambdaResult.FunctionError;
		return Response.json({ status: ok ? 200 : 500, ok, latencyMs, data });
	} catch (e) {
		return Response.json(
			{ error: e instanceof Error ? e.message : String(e) },
			{ status: 502 },
		);
	}
}
