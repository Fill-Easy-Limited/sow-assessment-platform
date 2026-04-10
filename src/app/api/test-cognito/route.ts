import { NextResponse } from "next/server";
import {
	CognitoIdentityProviderClient,
	paginateListUsers,
} from "@aws-sdk/client-cognito-identity-provider";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

const COGNITO_REGION = "us-east-1";
const USER_POOL_ID = "us-east-1_X0finc49k";
const CROSS_ACCOUNT_ROLE_ARN =
	"arn:aws:iam::428532357506:role/CognitoUserPoolAccessRole";

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

export async function GET() {
	try {
		const client = await getCognitoClient();
		const envMap: Record<string, Record<string, string>> = {};

		const paginator = paginateListUsers(
			{ client },
			{ UserPoolId: USER_POOL_ID },
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

		return NextResponse.json({ success: true, data: envMap });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}
