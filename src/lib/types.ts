export interface RequestError {
	step: string;
	message: string;
	stack?: string;
}

export interface RequestItem {
	requestId: string;
	type: string;
	step: Step;
	accountId?: string;
	organization: string;
	deploymentStage: string;
	environment: string;
	automated: boolean;
	startedAt: string;
	/**
	 * ISO 8601 timestamp updated on every state change. Prefer this over
	 * `startedAt` for "last updated" displays. Optional for backwards
	 * compatibility with records created before the field was added.
	 */
	lastModified?: string;
	duration?: number;
	countryCode?: string;
	companyId?: string;
	companyName?: string;
	documentId?: string;
	documentType?: string;
	/** Year of the requested document (CRA only). Always a string. */
	documentYear?: string;
	/** Auto-generated one-line human summary; primary display label when present. */
	requestDetails?: string;
	address?: string;
	prn?: string;
	dryRun?: boolean;
	error?: RequestError;
	debugUrl?: string;
	uploadUrl?: string;
	ttl: number;
	/** Injected by the query layer — which stage the record came from. */
	_stage?: string;
}

export type Step =
	| "initiated"
	| "rejected"
	| "search"
	| "manual"
	| "cancelled"
	| "retrieved"
	| "processing"
	| "ready"
	| "delivered";

export const STEP_ORDER: Step[] = [
	"initiated",
	"rejected",
	"search",
	"manual",
	"cancelled",
	"retrieved",
	"processing",
	"ready",
	"delivered",
];

export interface RequestFilters {
	step?: Step | "failed";
	organization?: string;
	countryCode?: string;
	dateFrom?: string;
	dateTo?: string;
	stage?: string;
	hideDryRuns?: boolean;
}
