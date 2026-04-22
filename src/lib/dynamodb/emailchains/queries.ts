import type {
	QueryCommandInput,
	ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { GetCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { EmailChain } from "@/lib/types";
import { emailChainsDocClient } from "./client";
import {
	EMAILCHAINS_ENABLED_STAGES,
	EMAILCHAINS_INDEXES,
	getEmailChainsTableArn,
	type Stage,
} from "./config";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type DDBRecord = Record<string, unknown>;
type StageChain = EmailChain & { _stage: Stage };

export interface EmailChainPagination {
	limit?: number;
	startKey?: Record<string, unknown>;
}

export interface EmailChainPaginatedResult {
	items: StageChain[];
	lastEvaluatedKey?: Record<string, unknown>;
}

export interface EmailChainListOptions {
	status?: string;
	/** epoch ms (inclusive) */
	updatedFrom?: number;
	/** epoch ms (inclusive) */
	updatedTo?: number;
	pagination?: EmailChainPagination;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tagItems(items: DDBRecord[], stage: Stage): StageChain[] {
	return items.map((item) => ({
		...(item as unknown as EmailChain),
		_stage: stage,
	}));
}

function sortByUpdatedAtDesc(items: StageChain[]): StageChain[] {
	return items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

// ---------------------------------------------------------------------------
// 1. Get a single chain by chainId
// ---------------------------------------------------------------------------

export async function getEmailChain(
	chainId: string,
	stage: Stage,
): Promise<StageChain | null> {
	const result = await emailChainsDocClient.send(
		new GetCommand({
			TableName: getEmailChainsTableArn(stage),
			Key: { chainId },
		}),
	);
	if (!result.Item) return null;
	return { ...(result.Item as unknown as EmailChain), _stage: stage };
}

export async function findEmailChainById(
	chainId: string,
	stages: Stage[] = EMAILCHAINS_ENABLED_STAGES,
): Promise<StageChain | null> {
	const results = await Promise.all(
		stages.map((stage) => getEmailChain(chainId, stage)),
	);
	return results.find((r) => r !== null) ?? null;
}

// ---------------------------------------------------------------------------
// 2. List chains by status via status-updatedAt-index
// ---------------------------------------------------------------------------

export async function listEmailChainsByStatus(
	status: string,
	stage: Stage,
	options: EmailChainListOptions = {},
): Promise<EmailChainPaginatedResult> {
	const names: Record<string, string> = { "#status": "status" };
	const values: Record<string, unknown> = { ":status": status };
	let keyCondition = "#status = :status";

	if (options.updatedFrom !== undefined && options.updatedTo !== undefined) {
		names["#updated"] = "updatedAt";
		values[":from"] = options.updatedFrom;
		values[":to"] = options.updatedTo;
		keyCondition += " AND #updated BETWEEN :from AND :to";
	} else if (options.updatedFrom !== undefined) {
		names["#updated"] = "updatedAt";
		values[":from"] = options.updatedFrom;
		keyCondition += " AND #updated >= :from";
	} else if (options.updatedTo !== undefined) {
		names["#updated"] = "updatedAt";
		values[":to"] = options.updatedTo;
		keyCondition += " AND #updated <= :to";
	}

	const params: QueryCommandInput = {
		TableName: getEmailChainsTableArn(stage),
		IndexName: EMAILCHAINS_INDEXES.statusUpdatedAt,
		KeyConditionExpression: keyCondition,
		ExpressionAttributeNames: names,
		ExpressionAttributeValues: values,
		ScanIndexForward: false,
		Limit: options.pagination?.limit ?? 100,
		...(options.pagination?.startKey && {
			ExclusiveStartKey: options.pagination.startKey,
		}),
	};

	const result = await emailChainsDocClient.send(new QueryCommand(params));
	return {
		items: tagItems((result.Items as DDBRecord[]) ?? [], stage),
		lastEvaluatedKey: result.LastEvaluatedKey as
			| Record<string, unknown>
			| undefined,
	};
}

// ---------------------------------------------------------------------------
// 3. Scan all chains (optionally filtered by updatedAt range)
//
// Scan is explicitly allowed on the globalSES-emailchains resource policy —
// unlike the RequestTracking table where Scan is forbidden.
// ---------------------------------------------------------------------------

export async function listEmailChains(
	stage: Stage,
	options: EmailChainListOptions = {},
): Promise<EmailChainPaginatedResult> {
	const names: Record<string, string> = {};
	const values: Record<string, unknown> = {};
	const filterParts: string[] = [];

	if (options.status) {
		names["#status"] = "status";
		values[":status"] = options.status;
		filterParts.push("#status = :status");
	}
	if (options.updatedFrom !== undefined) {
		names["#updated"] = "updatedAt";
		values[":from"] = options.updatedFrom;
		filterParts.push("#updated >= :from");
	}
	if (options.updatedTo !== undefined) {
		names["#updated"] = "updatedAt";
		values[":to"] = options.updatedTo;
		filterParts.push("#updated <= :to");
	}

	const params: ScanCommandInput = {
		TableName: getEmailChainsTableArn(stage),
		Limit: options.pagination?.limit ?? 100,
		...(options.pagination?.startKey && {
			ExclusiveStartKey: options.pagination.startKey,
		}),
	};

	if (filterParts.length > 0) {
		params.FilterExpression = filterParts.join(" AND ");
		params.ExpressionAttributeNames = names;
		params.ExpressionAttributeValues = values;
	}

	const result = await emailChainsDocClient.send(new ScanCommand(params));
	return {
		items: sortByUpdatedAtDesc(
			tagItems((result.Items as DDBRecord[]) ?? [], stage),
		),
		lastEvaluatedKey: result.LastEvaluatedKey as
			| Record<string, unknown>
			| undefined,
	};
}

// ---------------------------------------------------------------------------
// 4. Fan-out list across enabled stages
// ---------------------------------------------------------------------------

export async function listEmailChainsAllStages(
	options: EmailChainListOptions = {},
	stages: Stage[] = EMAILCHAINS_ENABLED_STAGES,
): Promise<StageChain[]> {
	const settled = await Promise.allSettled(
		stages.map((stage) =>
			options.status
				? listEmailChainsByStatus(options.status, stage, options)
				: listEmailChains(stage, options),
		),
	);

	const items: StageChain[] = [];
	const failures: string[] = [];
	settled.forEach((result, index) => {
		const stage = stages[index];
		if (result.status === "fulfilled") {
			items.push(...result.value.items);
			return;
		}
		const message =
			result.reason instanceof Error
				? result.reason.message
				: String(result.reason);
		failures.push(`${stage}: ${message}`);
		console.error(`Email chain stage query failed for ${stage}:`, message);
	});

	if (items.length === 0 && failures.length > 0) {
		throw new Error(`All email-chain stage queries failed (${failures.join(" | ")})`);
	}

	return sortByUpdatedAtDesc(items);
}
