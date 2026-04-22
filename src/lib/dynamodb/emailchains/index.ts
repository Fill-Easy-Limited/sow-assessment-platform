export {
	EMAILCHAINS_ENABLED_STAGES,
	EMAILCHAINS_INDEXES,
	EMAILCHAINS_TABLE_NAME,
	EMAILCHAINS_TABLE_REGION,
	getEmailChainsTableArn,
	type Stage,
} from "./config";

export { emailChainsDocClient } from "./client";

export {
	findEmailChainById,
	getEmailChain,
	listEmailChains,
	listEmailChainsAllStages,
	listEmailChainsByStatus,
	type EmailChainListOptions,
	type EmailChainPaginatedResult,
	type EmailChainPagination,
} from "./queries";
