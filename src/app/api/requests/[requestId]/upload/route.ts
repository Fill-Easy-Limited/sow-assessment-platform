import type { NextRequest } from "next/server";
import {
	ENABLED_STAGES,
	findRequestById,
	getRequestById,
	type Stage,
} from "@/lib/dynamodb";

export const dynamic = "force-dynamic";

/**
 * POST /api/requests/[requestId]/upload
 *
 * Uploads a file to the request's presigned S3 uploadUrl.
 * This runs server-side to avoid browser CORS failures.
 *
 * Query params:
 * - stage?: Stage
 *
 * FormData:
 * - file: File (required)
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	const { requestId } = await params;

	if (!requestId) {
		return Response.json({ error: "Missing requestId" }, { status: 400 });
	}

	try {
		const stageParam = request.nextUrl.searchParams.get("stage") || undefined;
		if (stageParam && !ENABLED_STAGES.includes(stageParam as Stage)) {
			return Response.json(
				{ error: `Invalid stage. Allowed: ${ENABLED_STAGES.join(", ")}` },
				{ status: 400 },
			);
		}

		const formData = await request.formData();
		const file = formData.get("file");
		if (!(file instanceof File)) {
			return Response.json(
				{ error: "Missing file in multipart form data" },
				{ status: 400 },
			);
		}

		const item = stageParam
			? await getRequestById(requestId, stageParam as Stage)
			: await findRequestById(requestId);

		if (!item) {
			return Response.json({ error: "Request not found" }, { status: 404 });
		}

		if (item.step !== "manual") {
			return Response.json(
				{
					error: `Request ${requestId} is in step '${String(item.step)}', expected 'manual'`,
				},
				{ status: 400 },
			);
		}

		const uploadUrl =
			typeof item.uploadUrl === "string" ? item.uploadUrl : undefined;
		if (!uploadUrl) {
			return Response.json(
				{ error: `Request ${requestId} does not include uploadUrl` },
				{ status: 400 },
			);
		}

		const body = Buffer.from(await file.arrayBuffer());
		const headers: Record<string, string> = {};
		if (file.type) {
			headers["Content-Type"] = file.type;
		}

		const s3Res = await fetch(uploadUrl, {
			method: "PUT",
			headers,
			body,
		});

		if (!s3Res.ok) {
			const errorText = await s3Res.text().catch(() => "");
			return Response.json(
				{
					error: `S3 upload failed: ${s3Res.status} ${s3Res.statusText}${errorText ? ` - ${errorText}` : ""}`,
				},
				{ status: 502 },
			);
		}

		return Response.json({
			success: true,
			status: s3Res.status,
			etag: s3Res.headers.get("etag") ?? undefined,
			url: uploadUrl,
			requestId,
			stage: stageParam ?? item._stage ?? item.deploymentStage,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Upload failed for ${requestId}:`, message);
		return Response.json({ error: message }, { status: 500 });
	}
}
