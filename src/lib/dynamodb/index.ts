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
	type CancelResult,
	// Types
	type CombinedFilters,
	// Cancel
	cancelRequest,
	findRequestById,
	findRequestByIdAllStages,
	// By ID
	getRequestById,
	type PaginatedResult,
	type PaginationOptions,
	type QueryFilters,
	// Cross-stage variants
	queryAllStages,
	// All-steps fallback (replaces Scan for cross-account)
	queryAllSteps,
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
	type TimeRange,
} from "./queries";
