"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { RequestFilters } from "@/lib/types";
import { STEP_ORDER } from "@/lib/types";

const COUNTRIES = ["HK", "SG", "MY", "AU", "CN"];
const FAILED_STATUS = "failed";

interface FilterBarProps {
	filters: RequestFilters;
	onChange: (filters: RequestFilters) => void;
}

function countActiveFilters(f: RequestFilters): number {
	let n = 0;
	if (f.step) n++;
	if (f.organization) n++;
	if (f.countryCode) n++;
	if (f.dateFrom) n++;
	if (f.dateTo) n++;
	if (f.hideDryRuns === false) n++;
	if (f.hideDevRuns === false) n++;
	return n;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
	const update = (patch: Partial<RequestFilters>) =>
		onChange({ ...filters, ...patch });

	const clear = () =>
		onChange({
			step: undefined,
			organization: undefined,
			countryCode: undefined,
			dateFrom: undefined,
			dateTo: undefined,
			hideDryRuns: true,
			hideDevRuns: true,
			requestId: filters.requestId,
		});

	const activeCount = countActiveFilters(filters);

	return (
		<div className="rounded-xl border border-border/60 bg-white shadow-sm">
			<div className="flex flex-wrap items-end gap-x-3 gap-y-3 p-4">
				{/* Status */}
				<div className="space-y-1.5">
					<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Status
					</div>
					<Select
						value={filters.step ?? "all"}
						onValueChange={(v) => {
							const nextStep =
								!v || v === "all" ? undefined : (v as RequestFilters["step"]);
							update({ step: nextStep });
						}}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							<SelectItem value={FAILED_STATUS}>
								failed (search + manual)
							</SelectItem>
							{STEP_ORDER.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Country */}
				<div className="space-y-1.5">
					<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Country
					</div>
					<Select
						value={filters.countryCode ?? "all"}
						onValueChange={(v) =>
							update({ countryCode: !v || v === "all" ? undefined : v })
						}
					>
						<SelectTrigger className="w-[90px]">
							<SelectValue placeholder="All" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{COUNTRIES.map((c) => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Date range */}
				<div className="space-y-1.5">
					<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Date range
					</div>
					<div className="flex items-center gap-1">
						<Input
							type="date"
							className="w-[130px] px-2"
							value={filters.dateFrom ?? ""}
							onChange={(e) =>
								update({ dateFrom: e.target.value || undefined })
							}
						/>
						<span className="text-xs text-muted-foreground">→</span>
						<Input
							type="date"
							className="w-[130px] px-2"
							value={filters.dateTo ?? ""}
							onChange={(e) => update({ dateTo: e.target.value || undefined })}
						/>
					</div>
				</div>

				{/* Organization */}
				<div className="space-y-1.5">
					<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Organization
					</div>
					<Input
						placeholder="contains…"
						className="w-[140px]"
						value={filters.organization ?? ""}
						onChange={(e) =>
							update({ organization: e.target.value || undefined })
						}
					/>
				</div>

				<div className="ml-auto flex items-end gap-2">
					{activeCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-muted-foreground hover:text-foreground"
							onClick={clear}
						>
							<X className="h-3.5 w-3.5 mr-1" />
							Clear ({activeCount})
						</Button>
					)}
				</div>
			</div>

			{/* Secondary row: visibility toggles */}
			<div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/30 px-4 py-2.5">
				<div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
					<SlidersHorizontal className="h-3.5 w-3.5" />
					Show
				</div>
				<ToggleChip
					label="Dry runs"
					active={filters.hideDryRuns === false}
					onClick={() =>
						update({ hideDryRuns: filters.hideDryRuns === false })
					}
				/>
				<ToggleChip
					label="Dev runs (canary / dev)"
					active={filters.hideDevRuns === false}
					onClick={() =>
						update({ hideDevRuns: filters.hideDevRuns === false })
					}
				/>
			</div>
		</div>
	);
}

function ToggleChip({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors " +
				(active
					? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
					: "border-border/60 bg-white text-muted-foreground hover:bg-accent hover:text-foreground")
			}
			aria-pressed={active}
		>
			<span
				className={
					"inline-block h-1.5 w-1.5 rounded-full " +
					(active ? "bg-primary" : "bg-muted-foreground/40")
				}
			/>
			{label}
		</button>
	);
}
