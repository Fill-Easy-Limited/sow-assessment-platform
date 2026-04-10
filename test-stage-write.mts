/**
 * Test: can we update records directly in the stage tables (prod/staging)?
 * Finds a real record and does a no-op update (sets step to its current value).
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	QueryCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_REGION = "ap-east-1";
const TABLE_NAME = "RequestTracking";

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

async function findRecord(tableArn: string) {
	for (const step of ["initiated", "search", "manual", "delivered", "ready", "processing"]) {
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

for (const [stage, accountId] of Object.entries(STAGE_ACCOUNTS)) {
	const tableArn = getTableArn(accountId);
	console.log(`\n=== ${stage} (${accountId}) ===`);

	const record = await findRecord(tableArn);
	if (!record) {
		console.log("  No records found");
		continue;
	}

	const requestId = record.requestId as string;
	const currentStep = record.step as string;
	const org = record.organization as string;
	console.log(`  Found: ${requestId} | step=${currentStep} | org=${org}`);

	// Test 1: No-op update (set step to its current value)
	try {
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
		console.log(`  ✅ No-op UpdateItem succeeded`);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.log(`  ❌ No-op UpdateItem failed: ${msg}`);
	}

	// Test 2: Simulate cancel — conditional update step → "cancelled"
	// Only try on a cancellable step, and immediately revert
	if (["initiated", "search", "manual"].includes(currentStep)) {
		try {
			// Set to cancelled
			await docClient.send(
				new UpdateCommand({
					TableName: tableArn,
					Key: { requestId },
					UpdateExpression: "SET #step = :cancelled",
					ConditionExpression: "#step = :currentStep",
					ExpressionAttributeNames: { "#step": "step" },
					ExpressionAttributeValues: {
						":cancelled": "cancelled",
						":currentStep": currentStep,
					},
				}),
			);
			console.log(`  ✅ Cancel update succeeded (step: ${currentStep} → cancelled)`);

			// Revert back immediately
			await docClient.send(
				new UpdateCommand({
					TableName: tableArn,
					Key: { requestId },
					UpdateExpression: "SET #step = :original",
					ExpressionAttributeNames: { "#step": "step" },
					ExpressionAttributeValues: { ":original": currentStep },
				}),
			);
			console.log(`  ✅ Reverted back to ${currentStep}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log(`  ❌ Cancel simulation failed: ${msg}`);
		}
	} else {
		console.log(`  ⏭️  Skipping cancel simulation (step=${currentStep} not cancellable)`);
	}
}

console.log("\nDone.");
