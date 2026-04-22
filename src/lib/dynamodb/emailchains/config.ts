/**
 * Stage-to-account mapping for the globalSES email chains DynamoDB table.
 *
 * Table name is the same across every stage (no stage suffix) and lives in
 * `us-east-1` — different region from `RequestTracking` which is in
 * `ap-east-1`. A separate DynamoDB client is used because of that.
 */

import { STAGE_ACCOUNTS, type Stage } from "../config";

export { type Stage } from "../config";

export const EMAILCHAINS_TABLE_NAME = "globalSES-emailchains";
export const EMAILCHAINS_TABLE_REGION = "us-east-1";

/**
 * Stages where the globalSES-emailchains table has been deployed and a
 * cross-account resource policy grants prod-core read access.
 */
export const EMAILCHAINS_ENABLED_STAGES: Stage[] = ["prod", "staging", "dev"];

export function getEmailChainsTableArn(stage: Stage): string {
	const account = STAGE_ACCOUNTS[stage];
	return `arn:aws:dynamodb:${EMAILCHAINS_TABLE_REGION}:${account}:table/${EMAILCHAINS_TABLE_NAME}`;
}

/** GSI on the emailchains table. */
export const EMAILCHAINS_INDEXES = {
	statusUpdatedAt: "status-updatedAt-index",
} as const;
