"use client";

import { useState } from "react";
import Dashboard from "@/components/dashboard";
import EnvSwitcher from "@/components/env-switcher";
import type { Stage } from "@/lib/dynamodb/config";
import { Button } from "@/components/ui/button";

export default function Home() {
	const [stage, setStage] = useState<Stage>("prod");
	const [cognitoResult, setCognitoResult] = useState<string | null>(null);
	const [cognitoLoading, setCognitoLoading] = useState(false);

	const testCognito = async () => {
		setCognitoLoading(true);
		setCognitoResult(null);
		try {
			const res = await fetch("/api/test-cognito");
			const json = await res.json();
			setCognitoResult(JSON.stringify(json, null, 2));
		} catch (err) {
			setCognitoResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setCognitoLoading(false);
		}
	};

	return (
		<main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 sm:px-10">
			<div className="mb-8 flex items-start justify-between">
				<div>
					<div className="flex items-center gap-3 mb-1">
						<div className="h-8 w-1 rounded-full bg-primary" />
						<h1 className="text-2xl font-semibold tracking-tight">
							Request Dashboard
						</h1>
					</div>
					<p className="text-sm text-muted-foreground ml-[1.75rem]">
						Monitor and manage incoming requests
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={testCognito}
						disabled={cognitoLoading}
					>
						{cognitoLoading ? "Loading..." : "Test Cognito"}
					</Button>
					<EnvSwitcher value={stage} onChange={setStage} />
				</div>
			</div>

			{cognitoResult && (
				<pre className="mb-6 rounded-lg border bg-muted/50 p-4 text-xs overflow-auto max-h-64">
					{cognitoResult}
				</pre>
			)}

			<Dashboard stage={stage} />
		</main>
	);
}
