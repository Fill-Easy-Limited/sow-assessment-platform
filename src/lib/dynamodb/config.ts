/**
 * Stage-to-account mapping for RequestTracking DynamoDB tables.
 * Each stage has its own table in a separate AWS account.
 */

export const TABLE_NAME = "RequestTracking";
export const TABLE_REGION = "ap-east-1";

export const STAGE_ACCOUNTS = {
	infradev: "470957634129",
	infrastaging: "979237820619",
	dev: "654654513614",
	staging: "905418146905",
	prod: "794038241155",
} as const;

export type Stage = keyof typeof STAGE_ACCOUNTS;

export const ALL_STAGES = Object.keys(STAGE_ACCOUNTS) as Stage[];

/** For the initial testing phase, only query prod and staging. */
export const ENABLED_STAGES: Stage[] = ["prod", "staging", "dev"];

export function getTableArn(stage: Stage): string {
	const account = STAGE_ACCOUNTS[stage];
	return `arn:aws:dynamodb:${TABLE_REGION}:${account}:table/${TABLE_NAME}`;
}

/** GSI names available on every RequestTracking table. */
export const INDEXES = {
	type: "type-index",
	organization: "organization-index",
	step: "step-index",
} as const;
