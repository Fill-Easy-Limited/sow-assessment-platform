export { docClient } from "./client";

export {
	ALL_STAGES,
	ENABLED_STAGES,
	getTableArn,
	INDEXES,
	STAGE_ACCOUNTS,
	type Stage,
	TABLE_NAME,
	TABLE_REGION,
} from "./config";

export {
	// Types
	type CombinedFilters,
	findRequestById,
	findRequestByIdAllStages,
	// By ID
	getRequestById,
	type PaginatedResult,
	type PaginationOptions,
	type QueryFilters,
	// Cross-stage variants
	queryAllStages,
	queryByOrganization,
	queryByOrganizationAllStages,
	queryByStep,
	queryByStepAllStages,
	// By single GSI key
	queryByType,
	queryByTypeAllStages,
	queryByTypeWithTimeRange,
	// Dashboard route helper
	queryRequests,
	// Combined filters (smart GSI selection)
	queryWithFilters,
	queryWithFiltersAllStages,
	// All-steps fallback (replaces Scan for cross-account)
	queryAllSteps,
	type TimeRange,
} from "./queries";
