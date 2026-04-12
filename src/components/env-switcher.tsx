"use client";

import { ENABLED_STAGES, type Stage } from "@/lib/dynamodb/config";

const STAGE_LABELS: Record<Stage, string> = {
	prod: "Prod",
	staging: "Staging",
	infradev: "Infradev",
	infrastaging: "Infrastaging",
	dev: "Dev",
};

const STAGE_COLORS: Record<string, string> = {
	prod: "bg-emerald-500",
	staging: "bg-amber-500",
	dev: "bg-blue-500",
};

interface EnvSwitcherProps {
	value: Stage;
	onChange: (stage: Stage) => void;
}

export default function EnvSwitcher({ value, onChange }: EnvSwitcherProps) {
	return (
		<div className="inline-flex items-center rounded-full border border-border/60 bg-white p-0.5 shadow-sm">
			{ENABLED_STAGES.map((stage) => (
				<button
					key={stage}
					type="button"
					onClick={() => onChange(stage)}
					className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
						value === stage
							? "bg-neutral-900 text-white shadow-sm"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<span
						className={`inline-block h-1.5 w-1.5 rounded-full ${STAGE_COLORS[stage] ?? "bg-gray-400"}`}
					/>
					{STAGE_LABELS[stage] ?? stage}
				</button>
			))}
		</div>
	);
}
