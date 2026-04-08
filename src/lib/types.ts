export interface RequestError {
	step: string;
	message: string;
	stack?: string;
}

export interface RequestItem {
	requestId: string;
	type: string;
	step: Step;
	organization: string;
	deploymentStage: string;
	environment: string;
	automated: boolean;
	startedAt: string;
	duration?: number;
	countryCode?: string;
	companyId?: string;
	companyName?: string;
	documentType?: string;
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
	| "search"
	| "manual"
	| "retrieved"
	| "processing"
	| "ready"
	| "delivered";

export const STEP_ORDER: Step[] = [
	"initiated",
	"search",
	"manual",
	"retrieved",
	"processing",
	"ready",
	"delivered",
];

export interface RequestFilters {
	type?: string;
	step?: string;
	organization?: string;
	countryCode?: string;
	dateFrom?: string;
	dateTo?: string;
	stage?: string;
}
