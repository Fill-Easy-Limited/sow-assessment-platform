"use client";

import { useState } from "react";
import Dashboard from "@/components/dashboard";
import EnvSwitcher from "@/components/env-switcher";
import type { Stage } from "@/lib/dynamodb/config";

export default function Home() {
	const [stage, setStage] = useState<Stage>("prod");

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
				<EnvSwitcher value={stage} onChange={setStage} />
			</div>
			<Dashboard stage={stage} />
		</main>
	);
}
