"use client";

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

const TYPES = ["hk-retrieval", "cn-novanansha", "sg-retrieval"];
const COUNTRIES = ["HK", "SG", "MY", "AU", "CN"];

interface FilterBarProps {
	filters: RequestFilters;
	onChange: (filters: RequestFilters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
	const update = (patch: Partial<RequestFilters>) =>
		onChange({ ...filters, ...patch });

	const clear = () =>
		onChange({
			type: undefined,
			step: undefined,
			organization: undefined,
			countryCode: undefined,
			dateFrom: undefined,
			dateTo: undefined,
		});

	return (
		<div className="rounded-xl border border-border/60 bg-white shadow-sm p-5">
			<div className="flex flex-wrap items-end gap-4">
				{/* Type */}
				<div className="space-y-1.5">
					<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Type
					</label>
					<Select
						value={filters.type ?? "all"}
						onValueChange={(v) =>
							update({ type: !v || v === "all" ? undefined : v })
						}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="All types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All types</SelectItem>
							{TYPES.map((t) => (
								<SelectItem key={t} value={t}>
									{t}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Step */}
				<div className="space-y-1.5">
					<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Status
					</label>
					<Select
						value={filters.step ?? "all"}
						onValueChange={(v) =>
							update({ step: !v || v === "all" ? undefined : v })
						}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
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
					<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Country
					</label>
					<Select
						value={filters.countryCode ?? "all"}
						onValueChange={(v) =>
							update({ countryCode: !v || v === "all" ? undefined : v })
						}
					>
						<SelectTrigger className="w-[120px]">
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

				{/* Date From */}
				<div className="space-y-1.5">
					<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						From
					</label>
					<Input
						type="date"
						className="w-[150px]"
						value={filters.dateFrom ?? ""}
						onChange={(e) => update({ dateFrom: e.target.value || undefined })}
					/>
				</div>

				{/* Date To */}
				<div className="space-y-1.5">
					<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						To
					</label>
					<Input
						type="date"
						className="w-[150px]"
						value={filters.dateTo ?? ""}
						onChange={(e) => update({ dateTo: e.target.value || undefined })}
					/>
				</div>

				{/* Organization (free text) */}
				<div className="space-y-1.5">
					<label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						Organization
					</label>
					<Input
						placeholder="e.g. canary"
						className="w-[140px]"
						value={filters.organization ?? ""}
						onChange={(e) =>
							update({ organization: e.target.value || undefined })
						}
					/>
				</div>

				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground hover:text-foreground hover:bg-accent"
					onClick={clear}
				>
					Clear filters
				</Button>
			</div>
		</div>
	);
}
