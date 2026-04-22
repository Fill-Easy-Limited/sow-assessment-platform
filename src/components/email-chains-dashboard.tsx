"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getEmailChains } from "@/lib/api";
import { EMAILCHAINS_ENABLED_STAGES } from "@/lib/dynamodb/emailchains/config";
import type { EmailChain, EmailChainFilters } from "@/lib/types";
import ChainStatusBadge from "./chain-status-badge";

const KNOWN_STATUSES = ["active", "completed"];

function requestCount(c: EmailChain): number {
	return (
		(c.completedRequests?.length ?? 0) +
		(c.processingRequests?.length ?? 0) +
		(c.needClarificationRequests?.length ?? 0)
	);
}

interface EmailChainsDashboardProps {
	stage: string; // "" = all enabled stages
}

export default function EmailChainsDashboard({
	stage,
}: EmailChainsDashboardProps) {
	const router = useRouter();
	const [status, setStatus] = useState<string | undefined>(undefined);
	const [dateFrom, setDateFrom] = useState<string>("");
	const [dateTo, setDateTo] = useState<string>("");

	const activeFilters = useMemo<EmailChainFilters>(
		() => ({
			stage: stage || undefined,
			status,
			dateFrom: dateFrom || undefined,
			dateTo: dateTo || undefined,
			limit: 200,
		}),
		[stage, status, dateFrom, dateTo],
	);

	const { data, isLoading, isError, isFetching, refetch, error } = useQuery({
		queryKey: ["emailchains", activeFilters],
		queryFn: () => getEmailChains(activeFilters),
		retry: 1,
	});

	const items = data?.items ?? [];

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="rounded-xl border border-border/60 bg-white shadow-sm p-5">
				<div className="flex flex-wrap items-end gap-4">
					<div className="space-y-1.5">
						<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
							Status
						</div>
						<Select
							value={status ?? "all"}
							onValueChange={(v) =>
								setStatus(!v || v === "all" ? undefined : v)
							}
						>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								{KNOWN_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
							Updated from
						</div>
						<Input
							type="date"
							className="w-[150px]"
							value={dateFrom}
							onChange={(e) => setDateFrom(e.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
							Updated to
						</div>
						<Input
							type="date"
							className="w-[150px]"
							value={dateTo}
							onChange={(e) => setDateTo(e.target.value)}
						/>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setStatus(undefined);
							setDateFrom("");
							setDateTo("");
						}}
					>
						Clear filters
					</Button>
				</div>
			</div>

			<div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
					<div className="text-sm text-muted-foreground">
						{items.length > 0
							? `Showing ${items.length} chain${items.length === 1 ? "" : "s"}`
							: "No chains loaded"}
						{!stage && (
							<span className="ml-2 text-xs">
								(stages: {EMAILCHAINS_ENABLED_STAGES.join(", ")})
							</span>
						)}
					</div>
					<Button
						variant="outline"
						onClick={() => {
							void refetch();
						}}
						disabled={isFetching}
					>
						{isFetching ? "Refreshing..." : "Refresh"}
					</Button>
				</div>

				{isError && (
					<div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700">
						Failed to load email chains:{" "}
						{error instanceof Error ? error.message : String(error)}
					</div>
				)}

				<Table className="table-fixed">
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Subject
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[100px]">
								Status
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">
								From
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[60px] text-right">
								Emails
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[70px] text-right">
								Reqs
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[110px]">
								Updated
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">
								Stage
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-12 text-muted-foreground"
								>
									Loading...
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-12 text-muted-foreground"
								>
									No email chains found
								</TableCell>
							</TableRow>
						) : (
							items.map((c) => {
								const stageForRow = c._stage ?? stage ?? "";
								const href = `/chains/${encodeURIComponent(c.chainId)}${stageForRow ? `?stage=${stageForRow}` : ""}`;
								const reqCount = requestCount(c);
								return (
									<TableRow
										key={`${stageForRow}:${c.chainId}`}
										className="cursor-pointer transition-colors hover:bg-accent/50 border-border/40"
										onClick={() => router.push(href)}
									>
										<TableCell>
											<span className="text-sm text-foreground/90 font-medium block truncate">
												{c.subject ?? "—"}
											</span>
										</TableCell>
										<TableCell>
											<ChainStatusBadge status={c.status} />
										</TableCell>
										<TableCell className="text-xs text-foreground/70 truncate">
											{c.from ?? "—"}
										</TableCell>
										<TableCell className="text-xs text-foreground/70 text-right tabular-nums">
											{c.emailCount ?? c.rawRows?.length ?? 0}
										</TableCell>
										<TableCell className="text-xs text-foreground/70 text-right tabular-nums">
											{reqCount}
										</TableCell>
										<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
											{c.updatedAt
												? format(new Date(c.updatedAt), "MMM d, HH:mm")
												: "—"}
										</TableCell>
										<TableCell className="text-xs text-muted-foreground">
											{stageForRow || "—"}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
