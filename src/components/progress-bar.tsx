"use client";

import type { Step } from "@/lib/types";

const CONFIG: Record<
	Step,
	{ width: string; color: string; animate?: boolean }
> = {
	initiated: { width: "14%", color: "bg-primary/60" },
	search: { width: "20%", color: "bg-amber-400", animate: true },
	manual: { width: "30%", color: "bg-orange-400" },
	retrieved: { width: "50%", color: "bg-blue-400" },
	processing: { width: "65%", color: "bg-primary", animate: true },
	ready: { width: "85%", color: "bg-emerald-400" },
	delivered: { width: "100%", color: "bg-emerald-500" },
};

export default function ProgressBar({ step }: { step: string }) {
	const { width, color, animate } = CONFIG[step as Step] ?? CONFIG.initiated;

	return (
		<div className="flex items-center gap-2.5 min-w-[140px]">
			<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-700 ease-out ${color} ${animate ? "animate-pulse" : ""}`}
					style={{ width }}
				/>
			</div>
			<span className="text-[11px] text-muted-foreground capitalize whitespace-nowrap w-[72px]">
				{step}
			</span>
		</div>
	);
}
