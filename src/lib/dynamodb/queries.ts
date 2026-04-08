import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client";
import {
	ALL_STAGES,
	ENABLED_STAGES,
	getTableArn,
	INDEXES,
	type Stage,
} from "./config";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type DDBRecord = Record<string, unknown>;
type StageRecord = DDBRecord & { _stage: Stage };

export interface TimeRange {
	from?: string; // ISO 8601
	to?: string; // ISO 8601
}

export interface PaginationOptions {
	limit?: number;
	startKey?: Record<string, unknown>;
}

export interface PaginatedResult {
	items: StageRecord[];
	lastEvaluatedKey?: Record<string, unknown>;
}

export interface QueryFilters {
	type?: string;
	step?: string;
	organization?: string;
	dateFrom?: string;
	dateTo?: string;
	stage?: Stage;
	limit?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tagItems(items: DDBRecord[], stage: Stage): StageRecord[] {
	return items.map((item) => ({ ...item, _stage: stage }));
}

function sortByStartedAtDesc(items: StageRecord[]): StageRecord[] {
	return items.sort((a, b) =>
		String(b.startedAt ?? "").localeCompare(String(a.startedAt ?? "")),
	);
}

function appendTimeRange(
	keyCondition: string,
	names: Record<string, string>,
	values: Record<string, unknown>,
	range?: TimeRange,
): string {
	if (!range) return keyCondition;
	const { from, to } = range;
	if (from && to) {
		names["#started"] = "startedAt";
		values[":from"] = from;
		values[":to"] = to;
		return `${keyCondition} AND #started BETWEEN :from AND :to`;
	}
	if (from) {
		names["#started"] = "startedAt";
		values[":from"] = from;
		return `${keyCondition} AND #started >= :from`;
	}
	if (to) {
		names["#started"] = "startedAt";
		values[":to"] = to;
		return `${keyCondition} AND #started <= :to`;
	}
	return keyCondition;
}

async function execQuery(
	params: QueryCommandInput,
): Promise<{ items: DDBRecord[]; lastEvaluatedKey?: Record<string, unknown> }> {
	const result = await docClient.send(new QueryCommand(params));
	return {
		items: (result.Items as DDBRecord[]) ?? [],
		lastEvaluatedKey: result.LastEvaluatedKey as
			| Record<string, unknown>
			| undefined,
	};
}

// ---------------------------------------------------------------------------
// 1. Get Single Record by ID
// ---------------------------------------------------------------------------

export async function getRequestById(
	requestId: string,
	stage: Stage,
): Promise<StageRecord | null> {
	const result = await docClient.send(
		new GetCommand({
			TableName: getTableArn(stage),
			Key: { requestId },
		}),
	);
	return result.Item ? { ...(result.Item as DDBRecord), _stage: stage } : null;
}

export async function findRequestById(
	requestId: string,
	stages: Stage[] = ENABLED_STAGES,
): Promise<StageRecord | null> {
	const results = await Promise.all(
		stages.map((stage) => getRequestById(requestId, stage)),
	);
	return results.find((r) => r !== null) ?? null;
}

export async function findRequestByIdAllStages(
	requestId: string,
): Promise<StageRecord | null> {
	return findRequestById(requestId, ALL_STAGES);
}

// ---------------------------------------------------------------------------
// 2. Query by Type
// ---------------------------------------------------------------------------

export async function queryByType(
	type: string,
	stage: Stage,
	options?: { timeRange?: TimeRange; pagination?: PaginationOptions },
): Promise<PaginatedResult> {
	const names: Record<string, string> = { "#type": "type" };
	const values: Record<string, unknown> = { ":type": type };
	let keyCondition = "#type = :type";
	keyCondition = appendTimeRange(
		keyCondition,
		names,
		values,
		options?.timeRange,
	);

	const { items, lastEvaluatedKey } = await execQuery({
		TableName: getTableArn(stage),
		IndexName: INDEXES.type,
		KeyConditionExpression: keyCondition,
		ExpressionAttributeNames: names,
		ExpressionAttributeValues: values,
		ScanIndexForward: false,
		Limit: options?.pagination?.limit ?? 100,
		...(options?.pagination?.startKey && {
			ExclusiveStartKey: options.pagination.startKey,
		}),
	});

	return { items: tagItems(items, stage), lastEvaluatedKey };
}

// ---------------------------------------------------------------------------
// 3. Query by Organization
// ---------------------------------------------------------------------------

export async function queryByOrganization(
	organization: string,
	stage: Stage,
	options?: { timeRange?: TimeRange; pagination?: PaginationOptions },
): Promise<PaginatedResult> {
	const names: Record<string, string> = { "#org": "organization" };
	const values: Record<string, unknown> = { ":org": organization };
	let keyCondition = "#org = :org";
	keyCondition = appendTimeRange(
		keyCondition,
		names,
		values,
		options?.timeRange,
	);

	const { items, lastEvaluatedKey } = await execQuery({
		TableName: getTableArn(stage),
		IndexName: INDEXES.organization,
		KeyConditionExpression: keyCondition,
		ExpressionAttributeNames: names,
		ExpressionAttributeValues: values,
		ScanIndexForward: false,
		Limit: options?.pagination?.limit ?? 100,
		...(options?.pagination?.startKey && {
			ExclusiveStartKey: options.pagination.startKey,
		}),
	});

	return { items: tagItems(items, stage), lastEvaluatedKey };
}

// ---------------------------------------------------------------------------
// 4. Query by Step
// ---------------------------------------------------------------------------

export async function queryByStep(
	step: string,
	stage: Stage,
	options?: { timeRange?: TimeRange; pagination?: PaginationOptions },
): Promise<PaginatedResult> {
	const names: Record<string, string> = { "#step": "step" };
	const values: Record<string, unknown> = { ":step": step };
	let keyCondition = "#step = :step";
	keyCondition = appendTimeRange(
		keyCondition,
		names,
		values,
		options?.timeRange,
	);

	const { items, lastEvaluatedKey } = await execQuery({
		TableName: getTableArn(stage),
		IndexName: INDEXES.step,
		KeyConditionExpression: keyCondition,
		ExpressionAttributeNames: names,
		ExpressionAttributeValues: values,
		ScanIndexForward: false,
		Limit: options?.pagination?.limit ?? 100,
		...(options?.pagination?.startKey && {
			ExclusiveStartKey: options.pagination.startKey,
		}),
	});

	return { items: tagItems(items, stage), lastEvaluatedKey };
}

// ---------------------------------------------------------------------------
// 5. Query with Time Range (uses type-index as the primary driver)
// ---------------------------------------------------------------------------

export async function queryByTypeWithTimeRange(
	type: string,
	from: string,
	to: string,
	stage: Stage,
	pagination?: PaginationOptions,
): Promise<PaginatedResult> {
	return queryByType(type, stage, {
		timeRange: { from, to },
		pagination,
	});
}

// ---------------------------------------------------------------------------
// 6. Combined Filters — picks the best GSI, remaining go to FilterExpression
//    Index priority: type > organization > step
// ---------------------------------------------------------------------------

export interface CombinedFilters {
	type?: string;
	organization?: string;
	step?: string;
	timeRange?: TimeRange;
	countryCode?: string;
	automated?: boolean;
	deploymentStage?: string;
	pagination?: PaginationOptions;
}

export async function queryWithFilters(
	filters: CombinedFilters,
	stage: Stage,
): Promise<PaginatedResult> {
	const names: Record<string, string> = {};
	const values: Record<string, unknown> = {};
	const filterParts: string[] = [];

	let indexName: string;
	let keyCondition: string;

	// Pick the best GSI
	if (filters.type) {
		indexName = INDEXES.type;
		names["#type"] = "type";
		values[":type"] = filters.type;
		keyCondition = "#type = :type";
		// organization and step become filters
		if (filters.organization) {
			names["#org"] = "organization";
			values[":org"] = filters.organization;
			filterParts.push("#org = :org");
		}
		if (filters.step) {
			names["#step"] = "step";
			values[":step"] = filters.step;
			filterParts.push("#step = :step");
		}
	} else if (filters.organization) {
		indexName = INDEXES.organization;
		names["#org"] = "organization";
		values[":org"] = filters.organization;
		keyCondition = "#org = :org";
		if (filters.step) {
			names["#step"] = "step";
			values[":step"] = filters.step;
			filterParts.push("#step = :step");
		}
	} else if (filters.step) {
		indexName = INDEXES.step;
		names["#step"] = "step";
		values[":step"] = filters.step;
		keyCondition = "#step = :step";
	} else {
		// No GSI key — query every step in parallel (Scan is not allowed cross-account)
		addExtraFilters(filters, names, values, filterParts);
		return queryAllSteps(stage, {
			timeRange: filters.timeRange,
			filterExpression: filterParts,
			names,
			values,
			pagination: filters.pagination,
		});
	}

	// Append time range to key condition
	keyCondition = appendTimeRange(
		keyCondition,
		names,
		values,
		filters.timeRange,
	);

	// Extra non-key filters
	addExtraFilters(filters, names, values, filterParts);

	const params: QueryCommandInput = {
		TableName: getTableArn(stage),
		IndexName: indexName,
		KeyConditionExpression: keyCondition,
		ExpressionAttributeNames: names,
		ExpressionAttributeValues: values,
		ScanIndexForward: false,
		Limit: filters.pagination?.limit ?? 100,
		...(filters.pagination?.startKey && {
			ExclusiveStartKey: filters.pagination.startKey,
		}),
	};

	if (filterParts.length > 0) {
		params.FilterExpression = filterParts.join(" AND ");
	}

	const result = await execQuery(params);
	return {
		items: tagItems(result.items, stage),
		lastEvaluatedKey: result.lastEvaluatedKey,
	};
}

function addExtraFilters(
	filters: CombinedFilters,
	names: Record<string, string>,
	values: Record<string, unknown>,
	parts: string[],
): void {
	if (filters.countryCode) {
		names["#cc"] = "countryCode";
		values[":cc"] = filters.countryCode;
		parts.push("#cc = :cc");
	}
	if (filters.automated !== undefined) {
		names["#auto"] = "automated";
		values[":auto"] = filters.automated;
		parts.push("#auto = :auto");
	}
	if (filters.deploymentStage) {
		names["#ds"] = "deploymentStage";
		values[":ds"] = filters.deploymentStage;
		parts.push("#ds = :ds");
	}
}

// ---------------------------------------------------------------------------
// Query all steps (replaces Scan — Scan is not allowed cross-account)
// ---------------------------------------------------------------------------

import { STEP_ORDER } from "@/lib/types";

/**
 * When no GSI partition key filter is available, query the step-index for
 * every known step value in parallel. This replaces Scan which is not
 * permitted by the cross-account resource-based policy.
 */
export async function queryAllSteps(
	stage: Stage,
	options?: {
		timeRange?: TimeRange;
		filterExpression?: string[];
		names?: Record<string, string>;
		values?: Record<string, unknown>;
		pagination?: PaginationOptions;
	},
): Promise<PaginatedResult> {
	const limit = options?.pagination?.limit ?? 100;

	const results = await Promise.all(
		STEP_ORDER.map(async (step) => {
			const names: Record<string, string> = {
				"#step": "step",
				...(options?.names ?? {}),
			};
			const values: Record<string, unknown> = {
				":step": step,
				...(options?.values ?? {}),
			};

			let keyCondition = "#step = :step";
			keyCondition = appendTimeRange(keyCondition, names, values, options?.timeRange);

			const params: QueryCommandInput = {
				TableName: getTableArn(stage),
				IndexName: INDEXES.step,
				KeyConditionExpression: keyCondition,
				ExpressionAttributeNames: names,
				ExpressionAttributeValues: values,
				ScanIndexForward: false,
				Limit: limit,
			};

			const filterParts = [...(options?.filterExpression ?? [])];
			if (filterParts.length > 0) {
				params.FilterExpression = filterParts.join(" AND ");
			}

			const result = await execQuery(params);
			return result.items;
		}),
	);

	const allItems = sortByStartedAtDesc(
		tagItems(results.flat(), stage),
	).slice(0, limit);

	return { items: allItems };
}

// ---------------------------------------------------------------------------
// 7. Query Across Stages
// ---------------------------------------------------------------------------

export async function queryAllStages(
	params: Omit<QueryCommandInput, "TableName">,
	stages: Stage[] = ENABLED_STAGES,
): Promise<StageRecord[]> {
	const results = await Promise.all(
		stages.map(async (stage) => {
			const result = await execQuery({
				...params,
				TableName: getTableArn(stage),
			});
			return tagItems(result.items, stage);
		}),
	);
	return sortByStartedAtDesc(results.flat());
}

export async function queryByTypeAllStages(
	type: string,
	options?: { timeRange?: TimeRange; limit?: number },
	stages: Stage[] = ENABLED_STAGES,
): Promise<StageRecord[]> {
	const results = await Promise.all(
		stages.map((stage) =>
			queryByType(type, stage, {
				timeRange: options?.timeRange,
				pagination: { limit: options?.limit },
			}),
		),
	);
	return sortByStartedAtDesc(results.flatMap((r) => r.items));
}

export async function queryByOrganizationAllStages(
	organization: string,
	options?: { timeRange?: TimeRange; limit?: number },
	stages: Stage[] = ENABLED_STAGES,
): Promise<StageRecord[]> {
	const results = await Promise.all(
		stages.map((stage) =>
			queryByOrganization(organization, stage, {
				timeRange: options?.timeRange,
				pagination: { limit: options?.limit },
			}),
		),
	);
	return sortByStartedAtDesc(results.flatMap((r) => r.items));
}

export async function queryByStepAllStages(
	step: string,
	options?: { timeRange?: TimeRange; limit?: number },
	stages: Stage[] = ENABLED_STAGES,
): Promise<StageRecord[]> {
	const results = await Promise.all(
		stages.map((stage) =>
			queryByStep(step, stage, {
				timeRange: options?.timeRange,
				pagination: { limit: options?.limit },
			}),
		),
	);
	return sortByStartedAtDesc(results.flatMap((r) => r.items));
}

export async function queryWithFiltersAllStages(
	filters: CombinedFilters,
	stages: Stage[] = ENABLED_STAGES,
): Promise<StageRecord[]> {
	const settled = await Promise.allSettled(
		stages.map((stage) => queryWithFilters(filters, stage)),
	);

	const items: StageRecord[] = [];
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
		console.error(`Stage query failed for ${stage}:`, message);
	});

	if (items.length === 0 && failures.length > 0) {
		throw new Error(`All stage queries failed (${failures.join(" | ")})`);
	}

	return sortByStartedAtDesc(items);
}

// ---------------------------------------------------------------------------
// Dashboard query — used by the /api/requests route handler
// ---------------------------------------------------------------------------

export async function queryRequests(filters: QueryFilters) {
	const stages = filters.stage ? [filters.stage] : ENABLED_STAGES;
	const timeRange: TimeRange | undefined =
		filters.dateFrom || filters.dateTo
			? {
					from: filters.dateFrom,
					to: filters.dateTo ? `${filters.dateTo}T23:59:59.999Z` : undefined,
				}
			: undefined;

	// Virtual status: failed = search + manual
	if (filters.step === "failed") {
		const [searchItems, manualItems] = await Promise.all([
			queryWithFiltersAllStages(
				{
					type: filters.type,
					step: "search",
					organization: filters.organization,
					timeRange,
					pagination: { limit: filters.limit ?? 100 },
				},
				stages,
			),
			queryWithFiltersAllStages(
				{
					type: filters.type,
					step: "manual",
					organization: filters.organization,
					timeRange,
					pagination: { limit: filters.limit ?? 100 },
				},
				stages,
			),
		]);

		const deduped = new Map<string, StageRecord>();
		for (const item of [...searchItems, ...manualItems]) {
			const key = `${String(item._stage)}:${String(item.requestId)}`;
			if (!deduped.has(key)) {
				deduped.set(key, item);
			}
		}

		return sortByStartedAtDesc(Array.from(deduped.values())).slice(
			0,
			filters.limit ?? 100,
		);
	}

	return queryWithFiltersAllStages(
		{
			type: filters.type,
			step: filters.step,
			organization: filters.organization,
			timeRange,
			pagination: { limit: filters.limit ?? 100 },
		},
		stages,
	);
}
