/**
 * Test script: check if prod-core account can write (update) to DynamoDB
 * tables in each organization's account.
 *
 * Uses a dry-run approach: reads a record, then does a conditional update
 * that sets step to its current value (no actual change). This verifies
 * write permission without modifying data.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	QueryCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_REGION = "ap-east-1";
const TABLE_NAME = "RequestTracking";

// Org → AccountId from Cognito (prod env)
const ORG_ACCOUNTS: Record<string, string> = {
	pru: "340752801550",
	fecs: "420026262327",
	syfe: "476380149366",
	nova: "381491870531",
	noregon: "842013538393",
	welab: "123599504484",
	rdt: "874834750434",
	aereve: "364453382697",
	ifingate: "814023042889",
	nou: "954976287242",
	demos: "401448503051",
	moneygo: "500501923599",
	regtank: "899771210977",
	choc: "492205017918",
	hkust: "794997534213",
	"self-service": "993315327950",
	canary: "935312849114",
	jumpc: "544793910458",
	sherlock: "897913033858",
	ubs: "899455914458",
};

// Stage accounts (from config.ts)
const STAGE_ACCOUNTS: Record<string, string> = {
	prod: "794038241155",
	staging: "905418146905",
};

const ddbClient = new DynamoDBClient({
	region: TABLE_REGION,
	profile: "prod-core",
});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
	marshallOptions: { removeUndefinedValues: true },
});

function getTableArn(accountId: string): string {
	return `arn:aws:dynamodb:${TABLE_REGION}:${accountId}:table/${TABLE_NAME}`;
}

async function testWriteAccess(label: string, accountId: string) {
	const tableArn = getTableArn(accountId);

	// 1. Try to find any record in this table
	try {
		const query = await docClient.send(
			new QueryCommand({
				TableName: tableArn,
				IndexName: "step-index",
				KeyConditionExpression: "#step = :step",
				ExpressionAttributeNames: { "#step": "step" },
				ExpressionAttributeValues: { ":step": "delivered" },
				Limit: 1,
			}),
		);

		const item = query.Items?.[0];
		if (!item) {
			// Try another step
			const query2 = await docClient.send(
				new QueryCommand({
					TableName: tableArn,
					IndexName: "step-index",
					KeyConditionExpression: "#step = :step",
					ExpressionAttributeNames: { "#step": "step" },
					ExpressionAttributeValues: { ":step": "initiated" },
					Limit: 1,
				}),
			);
			if (!query2.Items?.[0]) {
				console.log(`  ⚠️  ${label} (${accountId}): No records found to test write`);
				return;
			}
		}

		const requestId = (item ?? (await findAnyRecord(tableArn)))?.requestId;
		if (!requestId) {
			console.log(`  ⚠️  ${label} (${accountId}): No records found`);
			return;
		}

		// 2. Try a no-op conditional update (set step to its current value)
		const currentStep = (item ?? {}).step as string;
		await docClient.send(
			new UpdateCommand({
				TableName: tableArn,
				Key: { requestId },
				UpdateExpression: "SET #step = :step",
				ConditionExpression: "#step = :step",
				ExpressionAttributeNames: { "#step": "step" },
				ExpressionAttributeValues: { ":step": currentStep },
			}),
		);

		console.log(`  ✅ ${label} (${accountId}): WRITE OK (tested on ${requestId})`);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("ConditionalCheckFailedException")) {
			console.log(`  ✅ ${label} (${accountId}): WRITE OK (conditional check)`);
		} else if (msg.includes("AccessDeniedException") || msg.includes("not authorized")) {
			console.log(`  ❌ ${label} (${accountId}): ACCESS DENIED — ${msg}`);
		} else {
			console.log(`  ❓ ${label} (${accountId}): ${msg}`);
		}
	}
}

async function findAnyRecord(tableArn: string) {
	for (const step of ["delivered", "ready", "processing", "initiated", "search", "manual"]) {
		const q = await docClient.send(
			new QueryCommand({
				TableName: tableArn,
				IndexName: "step-index",
				KeyConditionExpression: "#step = :step",
				ExpressionAttributeNames: { "#step": "step" },
				ExpressionAttributeValues: { ":step": step },
				Limit: 1,
			}),
		);
		if (q.Items?.[0]) return q.Items[0];
	}
	return null;
}

// ---- Run ----
console.log("Testing DynamoDB write access from prod-core...\n");

console.log("=== Stage tables ===");
for (const [stage, accountId] of Object.entries(STAGE_ACCOUNTS)) {
	await testWriteAccess(`stage:${stage}`, accountId);
}

console.log("\n=== Organization tables (prod) ===");
for (const [org, accountId] of Object.entries(ORG_ACCOUNTS)) {
	await testWriteAccess(`org:${org}`, accountId);
}

console.log("\nDone.");
