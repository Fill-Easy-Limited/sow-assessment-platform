import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { EMAILCHAINS_TABLE_REGION } from "./config";

/**
 * Singleton DynamoDB Document Client for the globalSES-emailchains table in
 * `us-east-1`. Separate from the ap-east-1 RequestTracking client because
 * the region differs.
 *
 * Locally: uses `prod-core` SSO profile.
 * Deployed: uses the default credential chain (Lambda execution role).
 */
const isLocal = process.env.NODE_ENV === "development";

const emailChainsDdbClient = new DynamoDBClient({
	region: EMAILCHAINS_TABLE_REGION,
	...(isLocal && { profile: "prod-core" }),
});

export const emailChainsDocClient = DynamoDBDocumentClient.from(
	emailChainsDdbClient,
	{
		marshallOptions: { removeUndefinedValues: true },
	},
);
