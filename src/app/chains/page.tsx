"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import NavTabs from "@/components/nav-tabs";
import { EMAILCHAINS_ENABLED_STAGES } from "@/lib/dynamodb/emailchains/config";

const EmailChainsDashboard = dynamic(
	() => import("@/components/email-chains-dashboard"),
	{ ssr: false },
);

const STAGE_COLORS: Record<string, string> = {
	prod: "bg-emerald-500",
	staging: "bg-amber-500",
	dev: "bg-blue-500",
};

export default function ChainsPage() {
	// Empty string = all enabled stages (fan-out).
	const [stage, setStage] = useState<string>("");

	return (
		<main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 sm:px-10">
			<NavTabs active="chains" />
			<div className="mb-8 flex items-start justify-between">
				<div>
					<div className="flex items-center gap-3 mb-1">
						<div className="h-8 w-1 rounded-full bg-primary" />
						<h1 className="text-2xl font-semibold tracking-tight">
							Email Chains
						</h1>
					</div>
					<p className="text-sm text-muted-foreground ml-[1.75rem]">
						Inbound email threads and the requests created from them
					</p>
				</div>
				<div className="inline-flex items-center rounded-full border border-border/60 bg-white p-0.5 shadow-sm">
					<button
						type="button"
						onClick={() => setStage("")}
						className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
							stage === ""
								? "bg-neutral-900 text-white shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						All
					</button>
					{EMAILCHAINS_ENABLED_STAGES.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => setStage(s)}
							className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
								stage === s
									? "bg-neutral-900 text-white shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<span
								className={`inline-block h-1.5 w-1.5 rounded-full ${STAGE_COLORS[s] ?? "bg-gray-400"}`}
							/>
							{s}
						</button>
					))}
				</div>
			</div>
			<EmailChainsDashboard stage={stage} />
		</main>
	);
}
