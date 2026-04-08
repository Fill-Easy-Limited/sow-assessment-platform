"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getRequestById, getRequests } from "@/lib/api";
import type { Stage } from "@/lib/dynamodb/config";
import { MOCK_REQUESTS } from "@/lib/mock-data";
import type { RequestFilters, RequestItem } from "@/lib/types";
import FilterBar from "./filter-bar";
import ProgressBar from "./progress-bar";
import RequestDetail from "./request-detail";

interface DashboardProps {
	stage: Stage;
}

export default function Dashboard({ stage }: DashboardProps) {
	const [filters, setFilters] = useState<RequestFilters>({});
	const [selected, setSelected] = useState<RequestItem | null>(null);

	// Merge the top-level stage into filters for the query
	const activeFilters = useMemo(
		() => ({ ...filters, stage }),
		[filters, stage],
	);

	const {
		data: apiData,
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useQuery({
		queryKey: ["requests", activeFilters],
		queryFn: () => getRequests(activeFilters),
		retry: 1,
	});

	const handleRequestUpdated = async () => {
		await refetch();
		if (!selected) return;
		const refreshed = await getRequestById(selected.requestId);
		if (refreshed) {
			setSelected(refreshed);
		}
	};

	// Fall back to mock data if the API is unavailable (local dev without AWS creds)
	const useMock = isError || (!isLoading && !apiData);

	// Apply filters client-side for mock data
	const requests = useMemo(() => {
		const source = useMock ? MOCK_REQUESTS : (apiData ?? []);
		if (!useMock) return source; // server already filtered
		return source.filter((r) => {
			if (filters.type && r.type !== filters.type) return false;
			if (filters.step) {
				if (filters.step === "failed") {
					if (r.step !== "search" && r.step !== "manual") return false;
				} else if (r.step !== filters.step) {
					return false;
				}
			}
			if (
				filters.organization &&
				!r.organization
					.toLowerCase()
					.includes(filters.organization.toLowerCase())
			)
				return false;
			if (filters.countryCode && r.countryCode !== filters.countryCode)
				return false;
			if (filters.dateFrom && r.startedAt < filters.dateFrom) return false;
			if (filters.dateTo && r.startedAt > `${filters.dateTo}T23:59:59.999Z`)
				return false;
			return true;
		});
	}, [apiData, useMock, filters]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-end">
				<Button
					variant="outline"
					onClick={() => {
						void refetch();
					}}
					disabled={isFetching}
				>
					{isFetching ? "Refreshing..." : "Refresh Table"}
				</Button>
			</div>

			{/* Filters */}
			<FilterBar filters={filters} onChange={setFilters} />

			{/* Table */}
			<div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
				{useMock && (
					<div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700">
						Using mock data — DynamoDB not reachable
					</div>
				)}
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Request ID
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Company Name
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Country / Organization
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Date
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[220px]">
								Progress
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-12 text-muted-foreground"
								>
									Loading...
								</TableCell>
							</TableRow>
						) : requests.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-12 text-muted-foreground"
								>
									No requests found
								</TableCell>
							</TableRow>
						) : (
							requests.map((r) => (
								<TableRow
									key={r.requestId}
									className="cursor-pointer transition-colors hover:bg-accent/50 border-border/40"
									onClick={() => setSelected(r)}
								>
									<TableCell className="font-mono text-xs text-muted-foreground">
										{r.requestId}
									</TableCell>
									<TableCell>
										<span className="text-sm text-foreground/80">
											{r.companyName ?? "—"}
										</span>
									</TableCell>
									<TableCell>
										<span className="inline-flex items-center gap-1.5">
											<span className="text-xs font-semibold bg-primary/15 text-primary-foreground/80 px-1.5 py-0.5 rounded">
												{r.countryCode}
											</span>
											<span className="text-sm text-foreground/70">
												{r.organization}
											</span>
										</span>
									</TableCell>
									<TableCell className="text-sm text-muted-foreground">
										{format(new Date(r.startedAt), "MMM d, yyyy")}
									</TableCell>
									<TableCell>
										<ProgressBar step={r.step} />
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Detail modal */}
			<RequestDetail
				item={selected}
				open={!!selected}
				onClose={() => setSelected(null)}
				onRequestUpdated={handleRequestUpdated}
			/>
		</div>
	);
}
