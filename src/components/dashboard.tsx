"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	Inbox,
	Loader2,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { getRequestById, getRequests } from "@/lib/api";
import type { Stage } from "@/lib/dynamodb/config";
import { MOCK_REQUESTS } from "@/lib/mock-data";
import { DEV_ORGANIZATIONS } from "@/lib/types";
import type { RequestFilters, RequestItem } from "@/lib/types";
import FilterBar from "./filter-bar";
import ProgressBar from "./progress-bar";
import RequestDetail from "./request-detail";

interface DashboardProps {
	stage: Stage;
}

export default function Dashboard({ stage }: DashboardProps) {
	const [filters, setFilters] = useState<RequestFilters>({
		hideDryRuns: true,
		hideDevRuns: true,
	});
	const [selected, setSelected] = useState<RequestItem | null>(null);
	const [pageSize, setPageSize] = useState<25 | 50>(25);
	const [page, setPage] = useState(1);
	const [pageInput, setPageInput] = useState("1");
	const [searchDraft, setSearchDraft] = useState(filters.requestId ?? "");

	const trimmedRequestId = filters.requestId?.trim() ?? "";
	const isLookupMode = trimmedRequestId.length > 0;

	// Keep draft in sync when filters are cleared externally.
	useEffect(() => {
		setSearchDraft(filters.requestId ?? "");
	}, [filters.requestId]);

	const submitSearch = () => {
		const next = searchDraft.trim() || undefined;
		if (next === filters.requestId) return;
		setFilters({ ...filters, requestId: next });
	};

	const clearSearch = () => {
		setSearchDraft("");
		if (filters.requestId) {
			setFilters({ ...filters, requestId: undefined });
		}
	};

	// Merge the top-level stage into filters for the query
	const activeFilters = useMemo(
		() => ({ ...filters, stage }),
		[filters, stage],
	);

	const listQuery = useQuery({
		queryKey: ["requests", activeFilters],
		queryFn: () => getRequests(activeFilters),
		retry: 1,
		enabled: !isLookupMode,
	});

	const lookupQuery = useQuery({
		queryKey: ["request-lookup", trimmedRequestId],
		queryFn: async () => {
			try {
				const item = await getRequestById(trimmedRequestId);
				return item ? [item] : [];
			} catch (err) {
				// 404 => treat as empty result, not an error
				if (err instanceof Error && /\b404\b/.test(err.message)) return [];
				throw err;
			}
		},
		retry: 1,
		enabled: isLookupMode,
	});

	const {
		data: apiData,
		isLoading,
		isError,
		isFetching,
		refetch,
	} = isLookupMode ? lookupQuery : listQuery;

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

	// Apply filters client-side for mock data and page the full result set in the UI.
	const requests = useMemo(() => {
		const source = useMock ? MOCK_REQUESTS : (apiData ?? []);
		const devOrgs = new Set(DEV_ORGANIZATIONS.map((o) => o.toLowerCase()));
		const hideDev = filters.hideDevRuns !== false;

		return source.filter((r) => {
			// Always applied: hide dev-run orgs (canary/dev) unless explicitly shown.
			// In lookup mode, never hide — the user asked for this specific record.
			if (!isLookupMode && hideDev) {
				if (devOrgs.has(r.organization?.toLowerCase?.() ?? "")) return false;
			}

			if (!useMock) return true; // server already applied the rest

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
			if (filters.hideDryRuns !== false && r.dryRun) return false;
			return true;
		});
	}, [apiData, useMock, filters, isLookupMode]);

	const totalPages =
		requests.length === 0 ? 0 : Math.ceil(requests.length / pageSize);
	const activePage = totalPages === 0 ? 0 : Math.min(page, totalPages);
	const pageStart = activePage > 0 ? (activePage - 1) * pageSize : 0;
	const pageEnd = Math.min(pageStart + pageSize, requests.length);
	const visibleRequests = useMemo(
		() => requests.slice(pageStart, pageEnd),
		[requests, pageStart, pageEnd],
	);
	const paginationResetKey = useMemo(
		() => JSON.stringify({ stage, pageSize, filters }),
		[filters, stage, pageSize],
	);

	useEffect(() => {
		setPage(1);
		setPageInput("1");
	}, [paginationResetKey]);

	useEffect(() => {
		if (totalPages === 0) {
			setPage(1);
			setPageInput("1");
			return;
		}
		if (page > totalPages) {
			setPage(totalPages);
			setPageInput(String(totalPages));
		}
	}, [page, totalPages]);

	const goToPage = (nextPage: number) => {
		if (totalPages === 0) return;
		const clamped = Math.min(Math.max(nextPage, 1), totalPages);
		setPage(clamped);
		setPageInput(String(clamped));
	};

	const applyPageInput = () => {
		const nextPage = Number.parseInt(pageInput, 10);
		if (Number.isNaN(nextPage)) {
			setPageInput(String(activePage || 1));
			return;
		}
		goToPage(nextPage);
	};

	return (
		<div className="space-y-6">
			{/* Filters */}
			<FilterBar filters={filters} onChange={setFilters} />

			{/* Table */}
			<div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
							{isFetching && (
								<Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
							)}
							<span>
								{requests.length > 0 ? (
									<>
										Showing{" "}
										<span className="font-medium text-foreground">
											{pageStart + 1}–{pageEnd}
										</span>{" "}
										of{" "}
										<span className="font-medium text-foreground">
											{requests.length}
										</span>{" "}
										requests
									</>
								) : isLoading ? (
									"Loading…"
								) : (
									"No requests loaded"
								)}
							</span>
						</div>
						<div className="relative w-[240px] max-w-full">
							<Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
							<Input
								className={`h-8 pl-7 pr-8 font-mono text-xs ${
									isLookupMode
										? "border-primary/40 bg-primary/5"
										: ""
								}`}
								placeholder="Find by request ID…"
								value={searchDraft}
								onChange={(e) => setSearchDraft(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										submitSearch();
									} else if (e.key === "Escape") {
										e.preventDefault();
										clearSearch();
									}
								}}
								onBlur={submitSearch}
							/>
							{(searchDraft || isLookupMode) && (
								<button
									type="button"
									onClick={clearSearch}
									className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
									aria-label="Clear search"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<div className="flex items-center gap-2 rounded-lg border border-border/60 bg-white px-2 py-1 shadow-sm">
							<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Rows
							</span>
							<Select
								value={String(pageSize)}
								onValueChange={(value) => setPageSize(value === "50" ? 50 : 25)}
							>
								<SelectTrigger className="w-[110px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="25">25</SelectItem>
									<SelectItem value="50">50</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-1 rounded-lg border border-border/60 bg-white px-1.5 py-1 shadow-sm">
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2"
								onClick={() => goToPage(activePage - 1)}
								disabled={activePage <= 1}
								aria-label="Previous page"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							{totalPages <= 12 ? (
								<Select
									value={String(activePage || 1)}
									onValueChange={(value) =>
										goToPage(Number.parseInt(value ?? "1", 10))
									}
								>
									<SelectTrigger className="w-[150px]">
										<SelectValue placeholder="Page" />
									</SelectTrigger>
									<SelectContent>
										{Array.from(
											{ length: totalPages },
											(_, index) => index + 1,
										).map((pageNumber) => (
											<SelectItem key={pageNumber} value={String(pageNumber)}>
												Page {pageNumber} of {totalPages}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<div className="flex items-center gap-2 px-1">
									<span className="text-sm text-muted-foreground">Page</span>
									<div className="flex items-center gap-1">
										<Input
											type="number"
											min={1}
											max={Math.max(totalPages, 1)}
											value={pageInput}
											onChange={(e) => setPageInput(e.target.value)}
											className="h-8 w-20"
										/>
										<span className="text-sm text-muted-foreground">
											of {totalPages}
										</span>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={applyPageInput}
										disabled={totalPages === 0}
									>
										Go
									</Button>
								</div>
							)}
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2"
								onClick={() => goToPage(activePage + 1)}
								disabled={totalPages === 0 || activePage >= totalPages}
								aria-label="Next page"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="h-9 gap-2"
							onClick={() => {
								void refetch();
							}}
							disabled={isFetching}
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
							/>
							{isFetching ? "Refreshing" : "Refresh"}
						</Button>
					</div>
				</div>

				{useMock && (
					<div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700">
						Using mock data — DynamoDB not reachable
					</div>
				)}
				<Table className="table-fixed">
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[150px]">
								Request ID
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Details
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[140px]">
								Country / Org
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[110px]">
								Date
							</TableHead>
							<TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[200px]">
								Progress
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-16 text-muted-foreground"
								>
									<div className="flex flex-col items-center gap-2">
										<Loader2 className="h-5 w-5 animate-spin text-primary" />
										<span className="text-sm">Loading requests…</span>
									</div>
								</TableCell>
							</TableRow>
						) : visibleRequests.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center py-16 text-muted-foreground"
								>
									<div className="flex flex-col items-center gap-2">
										<Inbox className="h-6 w-6 text-muted-foreground/60" />
										<span className="text-sm">
											{isLookupMode
												? "No request matches that ID"
												: "No requests match your filters"}
										</span>
									</div>
								</TableCell>
							</TableRow>
						) : (
							visibleRequests.map((r) => (
								<TableRow
									key={r.requestId}
									className="cursor-pointer transition-colors hover:bg-accent/50 border-border/40"
									onClick={() => setSelected(r)}
								>
									<TableCell className="font-mono text-[11px] text-muted-foreground">
										{r.requestId}
										{r.dryRun && (
											<span className="text-[9px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-300 px-1 py-0.5 rounded-full leading-none ml-1">
												dry
											</span>
										)}
									</TableCell>
									<TableCell>
										<span className="text-sm text-foreground/80 block truncate">
											{r.requestDetails ??
												(r.requestId.startsWith("LR_")
													? (r.address ?? r.prn ?? "—")
													: (r.companyName ?? "—"))}
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
									<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
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
