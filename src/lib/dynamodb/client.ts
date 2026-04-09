import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { TABLE_REGION } from "./config";

/**
 * Singleton DynamoDB Document Client for ap-east-1.
 *
 * Locally: uses the `prod-core` SSO profile (account 794038241155).
 * Deployed: uses the Lambda execution role.
 *
 * The Prod Core account has cross-account read access to all stage
 * tables via resource-based policies, so a single client suffices.
 */
// In cloud runtimes (Amplify/Lambda), rely on the default credential chain.
// Only force SSO profile credentials during local development.
const isLocal = process.env.NODE_ENV === "development";

const ddbClient = new DynamoDBClient({
	region: TABLE_REGION,
	...(isLocal && { profile: "prod-core" }),
});

export const docClient = DynamoDBDocumentClient.from(ddbClient, {
	marshallOptions: { removeUndefinedValues: true },
});
