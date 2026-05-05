import "server-only";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const lambda = new LambdaClient({ region: "us-east-1" });

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const started = Date.now();
	try {
		const response = await lambda.send(
			new InvokeCommand({
				FunctionName: "globalSESLraLookup",
				Payload: Buffer.from(JSON.stringify(body)),
			}),
		);

		const latencyMs = Date.now() - started;
		const raw = Buffer.from(response.Payload!).toString();
		let data: unknown = raw;
		try {
			data = raw ? JSON.parse(raw) : null;
		} catch { /* leave as raw string */ }

		const ok = !response.FunctionError;
		return Response.json({ status: ok ? 200 : 500, ok, latencyMs, data });
	} catch (e) {
		return Response.json(
			{ error: e instanceof Error ? e.message : String(e) },
			{ status: 502 },
		);
	}
}
