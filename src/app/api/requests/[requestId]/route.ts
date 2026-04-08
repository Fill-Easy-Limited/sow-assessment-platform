import type { NextRequest } from "next/server";
import { findRequestById } from "@/lib/dynamodb";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> },
) {
	const { requestId } = await params;

	try {
		const item = await findRequestById(requestId);

		if (!item) {
			return Response.json({ error: "Request not found" }, { status: 404 });
		}

		return Response.json(item);
	} catch (error) {
		console.error("Failed to get request:", error);
		return Response.json({ error: "Failed to get request" }, { status: 500 });
	}
}
