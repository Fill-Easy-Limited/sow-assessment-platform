"use client";

import { StepStatus } from "@/lib/types";

const CONFIG: Record<StepStatus, { width: string; color: string; animate?: boolean }> = {
  completed: { width: "100%", color: "bg-emerald-400" },
  failed: { width: "65%", color: "bg-red-400" },
  "in-progress": { width: "50%", color: "bg-primary", animate: true },
  pending: { width: "12%", color: "bg-primary/60" },
  cancelled: { width: "35%", color: "bg-gray-300" },
};

export default function ProgressBar({ step }: { step: string }) {
  const { width, color, animate } =
    CONFIG[step as StepStatus] ?? CONFIG.pending;

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
