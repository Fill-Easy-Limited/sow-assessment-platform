import { LambdaClient } from "@aws-sdk/client-lambda";

/**
 * Singleton Lambda Client for ap-east-1.
 *
 * Locally: uses the `prod-core` SSO profile (account 794038241155).
 * Deployed: uses the Lambda execution role.
 */
// In cloud runtimes (Amplify/Lambda), rely on the default credential chain.
// Only force SSO profile credentials during local development.
const isLocal = process.env.NODE_ENV === "development";

export const lambdaClient = new LambdaClient({
	region: "ap-east-1",
	...(isLocal && { profile: "prod-core" }),
});
