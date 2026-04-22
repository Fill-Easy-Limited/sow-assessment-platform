"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { use, useState } from "react";
import ChainStatusBadge from "@/components/chain-status-badge";
import NavTabs from "@/components/nav-tabs";
import RequestDetail from "@/components/request-detail";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getEmailChainById, getRequestById } from "@/lib/api";
import type {
	EmailChainRawRow,
	EmailChainRequestRef,
	RequestItem,
} from "@/lib/types";

interface PageProps {
	params: Promise<{ chainId: string }>;
	searchParams: Promise<{ stage?: string }>;
}

function formatTs(ts: number | undefined): string {
	if (!ts) return "—";
	return format(new Date(ts), "yyyy-MM-dd HH:mm:ss");
}

function RequestRow({
	r,
	onSelect,
}: {
	r: EmailChainRequestRef;
	onSelect: (requestId: string) => void;
}) {
	return (
		<TableRow
			className="cursor-pointer hover:bg-accent/50"
			onClick={() => onSelect(r.requestId)}
		>
			<TableCell className="font-mono text-[11px]">
				<button
					type="button"
					className="text-blue-600 hover:underline"
					onClick={(e) => {
						e.stopPropagation();
						onSelect(r.requestId);
					}}
				>
					{r.requestId}
				</button>
			</TableCell>
			<TableCell className="text-sm">{r.type}</TableCell>
			<TableCell className="text-sm">{r.requestDetails ?? r.name ?? "—"}</TableCell>
			<TableCell className="text-sm">{r.countryCode ?? "—"}</TableCell>
			<TableCell className="text-sm">{r.documentType ?? "—"}</TableCell>
		</TableRow>
	);
}

function RequestSection({
	title,
	items,
	onSelect,
}: {
	title: string;
	items: EmailChainRequestRef[] | undefined;
	onSelect: (requestId: string) => void;
}) {
	if (!items || items.length === 0) return null;
	return (
		<div className="space-y-2">
			<h3 className="text-sm font-semibold text-foreground">
				{title}{" "}
				<span className="text-muted-foreground font-normal">
					({items.length})
				</span>
			</h3>
			<div className="rounded-lg border border-border/60 bg-white overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							<TableHead className="text-[10px] uppercase tracking-wider w-[180px]">
								Request ID
							</TableHead>
							<TableHead className="text-[10px] uppercase tracking-wider w-[70px]">
								Type
							</TableHead>
							<TableHead className="text-[10px] uppercase tracking-wider">
								Details
							</TableHead>
							<TableHead className="text-[10px] uppercase tracking-wider w-[80px]">
								Country
							</TableHead>
							<TableHead className="text-[10px] uppercase tracking-wider w-[120px]">
								Doc Type
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((r) => (
							<RequestRow key={r.requestId} r={r} onSelect={onSelect} />
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export default function ChainDetailPage({ params, searchParams }: PageProps) {
	const { chainId: rawChainId } = use(params);
	const { stage } = use(searchParams);
	// Next.js App Router hands `params` values back URL-encoded (e.g. `@` as
	// `%40`). Decode before querying so the partition-key lookup matches.
	const chainId = (() => {
		try {
			return decodeURIComponent(rawChainId);
		} catch {
			return rawChainId;
		}
	})();

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["emailchain", chainId, stage ?? ""],
		queryFn: () => getEmailChainById(chainId, stage),
		retry: 1,
	});

	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
		null,
	);

	const {
		data: selectedRequest,
		isLoading: isRequestLoading,
		isError: isRequestError,
		error: requestError,
		refetch: refetchSelectedRequest,
	} = useQuery<RequestItem | null>({
		queryKey: ["request-by-id", selectedRequestId],
		queryFn: () =>
			selectedRequestId
				? getRequestById(selectedRequestId)
				: Promise.resolve(null),
		enabled: !!selectedRequestId,
	});

	const handleRequestUpdated = async () => {
		await refetchSelectedRequest();
	};

	return (
		<main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 sm:px-10">
			<NavTabs active="chains" />
			<div className="mb-6">
				<Link
					href="/chains"
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					← All chains
				</Link>
			</div>

			{isLoading && <div className="text-muted-foreground">Loading...</div>}

			{isError && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					Failed to load chain:{" "}
					{error instanceof Error ? error.message : String(error)}
				</div>
			)}

			{data && (
				<div className="space-y-6">
					<div>
						<div className="flex flex-wrap items-center gap-3 mb-2">
							<ChainStatusBadge status={data.status} />
							<span className="text-xs text-muted-foreground">
								{data._stage ?? stage ?? "—"}
							</span>
						</div>
						<h1 className="text-xl font-semibold tracking-tight break-words">
							{data.subject ?? "(no subject)"}
						</h1>
						<p className="font-mono text-[11px] text-muted-foreground mt-1 break-all">
							{data.chainId}
						</p>
					</div>

					<div className="rounded-xl border border-border/60 bg-white shadow-sm p-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
						<Field label="From" value={data.from} />
						<Field
							label="To"
							value={data.to?.length ? data.to.join(", ") : undefined}
						/>
						<Field
							label="Cc"
							value={data.cc?.length ? data.cc.join(", ") : undefined}
						/>
						<Field label="Emails" value={String(data.emailCount ?? data.rawRows?.length ?? 0)} />
						<Field label="Created at" value={formatTs(data.createdAt)} />
						<Field label="Updated at" value={formatTs(data.updatedAt)} />
						<Field label="Last email at" value={formatTs(data.lastEmailAt)} />
						<Field
							label="Expires at"
							value={
								data.expiresAt
									? format(new Date(data.expiresAt * 1000), "yyyy-MM-dd HH:mm:ss")
									: "—"
							}
						/>
					</div>

					<Separator />

					<RequestSection
						title="Completed requests"
						items={data.completedRequests}
						onSelect={setSelectedRequestId}
					/>
					<RequestSection
						title="Processing requests"
						items={data.processingRequests}
						onSelect={setSelectedRequestId}
					/>
					<RequestSection
						title="Needs clarification"
						items={data.needClarificationRequests}
						onSelect={setSelectedRequestId}
					/>

					{data.rawRows && data.rawRows.length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-semibold">
								Raw rows{" "}
								<span className="text-muted-foreground font-normal">
									({data.rawRows.length})
								</span>
							</h3>
							<div className="rounded-lg border border-border/60 bg-white overflow-hidden">
								<RawRowsTable rows={data.rawRows} />
							</div>
						</div>
					)}
				</div>
			)}

			<RequestDetail
				item={selectedRequest ?? null}
				open={!!selectedRequestId && !!selectedRequest}
				onClose={() => setSelectedRequestId(null)}
				onRequestUpdated={handleRequestUpdated}
			/>

			{selectedRequestId && isRequestLoading && (
				<div className="fixed bottom-4 right-4 rounded-lg border border-border/60 bg-white px-4 py-2 text-sm shadow-md">
					Loading request {selectedRequestId}...
				</div>
			)}
			{selectedRequestId && isRequestError && (
				<div className="fixed bottom-4 right-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-md">
					Failed to load {selectedRequestId}:{" "}
					{requestError instanceof Error
						? requestError.message
						: String(requestError)}
					<button
						type="button"
						className="ml-3 underline"
						onClick={() => setSelectedRequestId(null)}
					>
						dismiss
					</button>
				</div>
			)}
		</main>
	);
}

function RawRowsTable({ rows }: { rows: EmailChainRawRow[] }) {
	const columns = Array.from(
		rows.reduce((set, row) => {
			Object.keys(row).forEach((k) => set.add(k));
			return set;
		}, new Set<string>()),
	);
	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40 hover:bg-muted/40">
						{columns.map((c) => (
							<TableHead
								key={c}
								className="text-[10px] uppercase tracking-wider"
							>
								{c}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row, idx) => (
						<TableRow key={idx}>
							{columns.map((c) => {
								const val = row[c];
								const display =
									val === null || val === undefined
										? "—"
										: typeof val === "object"
											? JSON.stringify(val)
											: String(val);
								return (
									<TableCell
										key={c}
										className="text-[11px] align-top max-w-[280px] truncate"
										title={display}
									>
										{display}
									</TableCell>
								);
							})}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function Field({ label, value }: { label: string; value?: string }) {
	return (
		<div>
			<span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
				{label}
			</span>
			<div className="mt-0.5 font-medium break-words leading-5">
				{value ?? "—"}
			</div>
		</div>
	);
}
