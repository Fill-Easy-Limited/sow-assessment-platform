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
	/**
	 * Message-ID of the originating email chain, when the request was created
	 * from an inbound email. Links to the `globalSES-emailchains` table
	 * (partition key `chainId`). Absent on older records / non-email origins.
	 */
	emailChainId?: string;
	/** Raw RFC 5322 Message-ID (angle-bracketed) of the inbound email. */
	emailMessageId?: string;
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

// ---------------------------------------------------------------------------
// Email chains (globalSES-emailchains table, us-east-1)
// ---------------------------------------------------------------------------

/**
 * A single email row inside an email chain. The shape is defined upstream
 * by the globalSES email ingestion service; only fields the dashboard reads
 * are listed here explicitly.
 */
export type EmailChainRawRow = Record<string, unknown>;

/** Cross-reference from an email chain to a request record. */
export interface EmailChainRequestRef {
	requestId: string;
	type: "cra" | "lra";
	name?: string;
	requestDetails?: string;
	companyId?: string;
	documentType?: string;
	countryCode?: string;
}

export type EmailChainStatus = "active" | "completed" | (string & {});

export interface EmailChain {
	/** Partition key — Message-ID of the first email in the chain. */
	chainId: string;
	subject?: string;
	from?: string;
	to?: string[];
	cc?: string[];
	status: EmailChainStatus;
	/** epoch ms */
	createdAt?: number;
	/** epoch ms — GSI sort key */
	updatedAt?: number;
	/** epoch ms */
	lastEmailAt?: number;
	/** epoch seconds (TTL) */
	expiresAt?: number;
	emailCount?: number;
	rawRows?: EmailChainRawRow[];
	completedRequests?: EmailChainRequestRef[];
	processingRequests?: EmailChainRequestRef[];
	needClarificationRequests?: EmailChainRequestRef[];
	/** Injected by the query layer — which stage the record came from. */
	_stage?: string;
}

export interface EmailChainFilters {
	stage?: string;
	status?: string;
	dateFrom?: string; // ISO date (YYYY-MM-DD) — compared against updatedAt
	dateTo?: string;
	limit?: number;
}
