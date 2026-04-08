import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-providers";
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
const isLocal =
	process.env.NODE_ENV === "development" ||
	!process.env.AWS_LAMBDA_FUNCTION_NAME;

const ddbClient = new DynamoDBClient({
	region: TABLE_REGION,
	...(isLocal && { credentials: fromSSO({ profile: "prod-core" }) }),
});

export const docClient = DynamoDBDocumentClient.from(ddbClient, {
	marshallOptions: { removeUndefinedValues: true },
});
