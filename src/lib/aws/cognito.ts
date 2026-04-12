import {
	CognitoIdentityProviderClient,
	paginateListUsers,
} from "@aws-sdk/client-cognito-identity-provider";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import type { Stage } from "@/lib/dynamodb/config";

const COGNITO_REGION = "us-east-1";
const USER_POOL_ID = "us-east-1_X0finc49k";
const CROSS_ACCOUNT_ROLE_ARN =
	"arn:aws:iam::428532357506:role/CognitoUserPoolAccessRole";

/** Map dashboard stage names to Cognito custom:env values. */
const STAGE_TO_ENV: Record<string, string> = {
	prod: "prod",
	staging: "staging",
	dev: "dev",
};

/** Cache: env → (org → accountId). Populated once per cold start. */
const cache = new Map<string, Record<string, string>>();

async function getCognitoClient(): Promise<CognitoIdentityProviderClient> {
	const isLocal = process.env.NODE_ENV === "development";

	if (isLocal) {
		return new CognitoIdentityProviderClient({ region: COGNITO_REGION });
	}

	const sts = new STSClient({ region: COGNITO_REGION });
	const { Credentials } = await sts.send(
		new AssumeRoleCommand({
			RoleArn: CROSS_ACCOUNT_ROLE_ARN,
			RoleSessionName: "org-account-map",
			DurationSeconds: 900,
		}),
	);
	if (!Credentials?.AccessKeyId || !Credentials.SecretAccessKey)
		throw new Error("Failed to assume cross-account role for Cognito");

	return new CognitoIdentityProviderClient({
		region: COGNITO_REGION,
		credentials: {
			accessKeyId: Credentials.AccessKeyId,
			secretAccessKey: Credentials.SecretAccessKey,
			sessionToken: Credentials.SessionToken,
		},
	});
}

/**
 * Fetch all org → accountId mappings for a given environment from Cognito.
 * Results are cached in-memory per cold start.
 */
async function getOrgAccountMap(env: string): Promise<Record<string, string>> {
	const cached = cache.get(env);
	if (cached) return cached;

	const client = await getCognitoClient();
	const map: Record<string, string> = {};

	const paginator = paginateListUsers({ client }, { UserPoolId: USER_POOL_ID });

	// Single pass: collect all envs to fill cache
	const allEnvs = new Map<string, Record<string, string>>();

	for await (const page of paginator) {
		if (!page.Users) continue;
		for (const user of page.Users) {
			const attrs: Record<string, string> = {};
			for (const { Name, Value } of user.Attributes ?? []) {
				if (Name && Value) attrs[Name] = Value;
			}
			const userEnv = attrs["custom:env"];
			const org = attrs["custom:organization"];
			const accountId = attrs["custom:accountid"];
			if (userEnv && org && accountId) {
				if (!allEnvs.has(userEnv)) allEnvs.set(userEnv, {});
				const envMap = allEnvs.get(userEnv);
				if (envMap) envMap[org] = accountId;
			}
		}
	}

	// Cache all envs from this single pass
	for (const [e, m] of allEnvs) {
		cache.set(e, m);
	}

	return cache.get(env) ?? map;
}

/**
 * Look up the accountId for a given organization and stage.
 * Uses Cognito user pool attributes as the source of truth.
 */
export async function getAccountIdForOrg(
	organization: string,
	stage: Stage,
): Promise<string | undefined> {
	const env = STAGE_TO_ENV[stage];
	if (!env) return undefined;

	const map = await getOrgAccountMap(env);
	return map[organization.toLowerCase()] ?? map[organization];
}
