import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { chain } from "@smithy/property-provider";
import { TABLE_REGION } from "./config";

/**
 * Singleton DynamoDB Document Client for ap-east-1.
 *
 * Locally: tries prod-core then prod-main SSO profile (account 794038241155).
 * Deployed: uses the Lambda execution role.
 *
 * The Prod Core account has cross-account read access to all stage
 * tables via resource-based policies, so a single client suffices.
 */
const isLocal = process.env.NODE_ENV === "development";

const ddbClient = new DynamoDBClient({
	region: TABLE_REGION,
	...(isLocal && {
		credentials: chain(fromIni({ profile: "prod-core" }), fromIni({ profile: "prod-main" })),
	}),
});

export const docClient = DynamoDBDocumentClient.from(ddbClient, {
	marshallOptions: { removeUndefinedValues: true },
});
