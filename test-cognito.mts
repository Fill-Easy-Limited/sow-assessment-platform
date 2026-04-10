import {
  CognitoIdentityProviderClient,
  paginateListUsers,
} from "@aws-sdk/client-cognito-identity-provider";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

const COGNITO_REGION = "us-east-1";
const USER_POOL_ID = "us-east-1_X0finc49k";
const CROSS_ACCOUNT_ROLE_ARN =
  "arn:aws:iam::428532357506:role/CognitoUserPoolAccessRole";

async function getCognitoClient(
  direct: boolean = false
): Promise<CognitoIdentityProviderClient> {
  if (direct) {
    return new CognitoIdentityProviderClient({ region: COGNITO_REGION });
  }

  const sts = new STSClient({ region: COGNITO_REGION, profile: "prod-main" });
  const { Credentials } = await sts.send(
    new AssumeRoleCommand({
      RoleArn: CROSS_ACCOUNT_ROLE_ARN,
      RoleSessionName: "org-account-map",
      DurationSeconds: 900,
    })
  );
  if (!Credentials?.AccessKeyId || !Credentials.SecretAccessKey)
    throw new Error("Failed to assume cross-account role");

  return new CognitoIdentityProviderClient({
    region: COGNITO_REGION,
    credentials: {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    },
  });
}

async function getOrgAccountMap(
  env: string = "prod",
  direct: boolean = false
): Promise<Record<string, string>> {
  const client = await getCognitoClient(direct);
  const map: Record<string, string> = {};

  const paginator = paginateListUsers(
    { client },
    { UserPoolId: USER_POOL_ID }
  );

  for await (const page of paginator) {
    if (!page.Users) continue;
    for (const user of page.Users) {
      const attrs: Record<string, string> = {};
      for (const { Name, Value } of user.Attributes ?? []) {
        if (Name && Value) attrs[Name] = Value;
      }

      if (attrs["custom:env"] !== env.toLowerCase()) continue;

      const org = attrs["custom:organization"];
      const accountId = attrs["custom:accountid"];
      if (org && accountId) {
        map[org] = accountId;
      }
    }
  }

  return map;
}

// Run it — get all envs, collect all users in one pass
const isLocal = true;

async function getAllMappings(direct: boolean) {
  const client = await getCognitoClient(direct);
  const envMap: Record<string, Record<string, string>> = {};

  const paginator = paginateListUsers(
    { client },
    { UserPoolId: USER_POOL_ID }
  );

  for await (const page of paginator) {
    if (!page.Users) continue;
    for (const user of page.Users) {
      const attrs: Record<string, string> = {};
      for (const { Name, Value } of user.Attributes ?? []) {
        if (Name && Value) attrs[Name] = Value;
      }
      const env = attrs["custom:env"];
      const org = attrs["custom:organization"];
      const accountId = attrs["custom:accountid"];
      if (env && org && accountId) {
        if (!envMap[env]) envMap[env] = {};
        envMap[env][org] = accountId;
      }
    }
  }
  return envMap;
}

const all = await getAllMappings(isLocal);
for (const [env, map] of Object.entries(all).sort()) {
  console.log(`\n=== ${env} === (${Object.keys(map).length} orgs)`);
  console.log(JSON.stringify(map, null, 2));
}
