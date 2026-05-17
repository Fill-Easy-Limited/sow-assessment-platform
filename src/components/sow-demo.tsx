"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	CheckCircle2Icon,
	AlertTriangleIcon,
	XCircleIcon,
	LoaderIcon,
	UserIcon,
	BuildingIcon,
	ShieldAlertIcon,
	ArrowRightIcon,
	ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOW_CASES, type SowReport, type SowDataSource, type SowWealthItem } from "@/lib/sow-mock-data";

type Phase = "select" | "generating" | "done";

export default function SowDemo() {
	const [phase, setPhase] = useState<Phase>("select");
	const [selectedCase, setSelectedCase] = useState<SowReport | null>(null);
	const [completedSources, setCompletedSources] = useState<SowDataSource[]>([]);
	const [currentSourceIndex, setCurrentSourceIndex] = useState(-1);
	const [elapsedMs, setElapsedMs] = useState(0);
	const cancelRef = useRef(false);
	const reportRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>();

	const reset = () => {
		cancelRef.current = true;
		if (timerRef.current) clearInterval(timerRef.current);
		setPhase("select");
		setSelectedCase(null);
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
	};

	const startCase = useCallback((report: SowReport) => {
		cancelRef.current = false;
		setSelectedCase(report);
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
		setPhase("generating");
	}, []);

	useEffect(() => {
		if (phase !== "generating" || !selectedCase) return;
		const sources = selectedCase.dataSources;
		const startedAt = Date.now();

		timerRef.current = setInterval(() => {
			setElapsedMs(Date.now() - startedAt);
		}, 100);

		(async () => {
			for (let i = 0; i < sources.length; i++) {
				if (cancelRef.current) return;
				setCurrentSourceIndex(i);
				await new Promise((r) => setTimeout(r, sources[i].delayMs));
				if (cancelRef.current) return;
				setCompletedSources((prev) => [...prev, sources[i]]);
			}
			await new Promise((r) => setTimeout(r, 600));
			if (cancelRef.current) return;
			if (timerRef.current) clearInterval(timerRef.current);
			setPhase("done");
			setTimeout(() => {
				reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		})();

		return () => {
			cancelRef.current = true;
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [phase, selectedCase]);

	return (
		<div className="space-y-6">
			{phase === "select" && <CaseSelector onSelect={startCase} />}
			{phase === "generating" && selectedCase && (
				<GeneratingView
					report={selectedCase}
					completedSources={completedSources}
					currentSourceIndex={currentSourceIndex}
					elapsedMs={elapsedMs}
					onCancel={reset}
				/>
			)}
			{phase === "done" && selectedCase && (
				<div ref={reportRef}>
					<ReportView report={selectedCase} onReset={reset} />
				</div>
			)}
		</div>
	);
}

function CaseSelector({ onSelect }: { onSelect: (r: SowReport) => void }) {
	return (
		<div className="space-y-5">
			<div>
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
					Select a case
				</p>
				<p className="text-sm text-muted-foreground">
					Choose a subject profile to generate a Source of Wealth assessment.
					The system will query government registries, financial databases, and
					corporate records to assemble a verified evidence chain.
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{SOW_CASES.map((report) => (
					<CaseCard key={report.profile.id} report={report} onSelect={onSelect} />
				))}
			</div>
		</div>
	);
}

function CaseCard({
	report,
	onSelect,
}: {
	report: SowReport;
	onSelect: (r: SowReport) => void;
}) {
	const p = report.profile;
	const isHigh = p.riskRating === "High";
	return (
		<button
			onClick={() => onSelect(report)}
			className="text-left rounded-xl border border-border bg-muted/20 p-5 hover:bg-muted/40 hover:border-border/80 transition-all group"
		>
			<div className="flex items-start justify-between mb-3">
				<div className="flex items-center gap-3">
					<div className={`h-10 w-10 rounded-full flex items-center justify-center ${isHigh ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
						<UserIcon className={`size-5 ${isHigh ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`} />
					</div>
					<div>
						<div className="font-semibold text-base">{p.name}</div>
						<div className="text-sm text-muted-foreground">{p.nameEn}</div>
					</div>
				</div>
				<RiskBadge rating={p.riskRating} />
			</div>
			<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
				<div>
					<span className="text-muted-foreground">Age: </span>
					<span>{p.age}, {p.gender}</span>
				</div>
				<div>
					<span className="text-muted-foreground">City: </span>
					<span>{p.city}</span>
				</div>
				<div className="col-span-2">
					<span className="text-muted-foreground">Occupation: </span>
					<span>{p.occupation}</span>
				</div>
			</div>
			<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
				{p.profileSummary}
			</p>
			<div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-primary group-hover:gap-2.5 transition-all">
				Generate SOW Report
				<ArrowRightIcon className="size-3.5" />
			</div>
		</button>
	);
}

function GeneratingView({
	report,
	completedSources,
	currentSourceIndex,
	elapsedMs,
	onCancel,
}: {
	report: SowReport;
	completedSources: SowDataSource[];
	currentSourceIndex: number;
	elapsedMs: number;
	onCancel: () => void;
}) {
	const sources = report.dataSources;
	const progress = completedSources.length / sources.length;
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-semibold">
						Generating SOW report for {report.profile.name}
					</h3>
					<p className="text-sm text-muted-foreground">
						{report.profile.nameEn} · querying {sources.length} data sources
					</p>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-xs text-muted-foreground tabular-nums">
						{(elapsedMs / 1000).toFixed(1)}s
					</span>
					<Button variant="outline" size="sm" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</div>

			<div className="h-1.5 rounded-full bg-muted overflow-hidden">
				<div
					className="h-full bg-primary rounded-full transition-all duration-300"
					style={{ width: `${progress * 100}%` }}
				/>
			</div>

			<div className="rounded-xl border border-border overflow-hidden">
				{sources.map((source, i) => {
					const completed = completedSources.find((s) => s.id === source.id);
					const isCurrent = i === currentSourceIndex && !completed;
					const isPending = i > currentSourceIndex;
					return (
						<div
							key={source.id}
							className={`flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 border-border transition-colors ${
								isCurrent ? "bg-primary/5" : completed ? "bg-muted/20" : "bg-transparent"
							}`}
						>
							<div className="w-5 flex justify-center shrink-0">
								{isCurrent ? (
									<LoaderIcon className="size-4 text-primary animate-spin" />
								) : completed ? (
									<SourceStatusIcon status={completed.status} />
								) : (
									<div className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-muted-foreground/30" : "bg-muted-foreground"}`} />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className={`text-sm ${isPending ? "text-muted-foreground/50" : ""}`}>
									{source.name}
								</div>
								<div className="text-[11px] text-muted-foreground">
									{source.provider}
								</div>
							</div>
							<div className="shrink-0">
								{isCurrent ? (
									<span className="text-xs text-primary font-medium">Querying...</span>
								) : completed ? (
									<SourceStatusBadge status={completed.status} label={completed.statusLabel} />
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ReportView({
	report,
	onReset,
}: {
	report: SowReport;
	onReset: () => void;
}) {
	const p = report.profile;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						SOW Assessment Complete
					</p>
					<h3 className="text-lg font-semibold mt-0.5">
						{p.name} ({p.nameEn})
					</h3>
				</div>
				<Button variant="outline" onClick={onReset}>
					New Assessment
				</Button>
			</div>

			<ProfileCard profile={p} />
			<RiskAssessment profile={p} />
			<WealthBreakdown
				items={report.wealthBreakdown}
				totalWealth={report.totalEstimatedWealthRMB}
				totalIncome={report.totalEstimatedAnnualIncomeRMB}
			/>
			<DataSourceFindings sources={report.dataSources} />
			<NarrativeSection narrative={report.narrative} />
			<MockPdfViewer name={p.name} nameEn={p.nameEn} riskRating={p.riskRating} />
		</div>
	);
}

function ProfileCard({ profile: p }: { profile: SowReport["profile"] }) {
	return (
		<div className="rounded-xl border border-border bg-muted/20 p-5">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
						<UserIcon className="size-6 text-muted-foreground" />
					</div>
					<div>
						<div className="text-lg font-semibold">{p.name}</div>
						<div className="text-sm text-muted-foreground">{p.nameEn}</div>
					</div>
				</div>
				<RiskBadge rating={p.riskRating} size="lg" />
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
				<InfoField label="Date of Birth" value={p.dateOfBirth} />
				<InfoField label="Gender / Age" value={`${p.gender}, ${p.age}`} />
				<InfoField label="ID Number" value={p.idNumber} mono />
				<InfoField label="Nationality" value={p.nationality} />
				<InfoField label="Occupation" value={p.occupation} />
				<InfoField label="Employer" value={p.employer} />
				<InfoField label="City" value={p.city} />
			</div>
		</div>
	);
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div>
			<div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
			<div className={`mt-0.5 ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</div>
		</div>
	);
}

function RiskAssessment({ profile: p }: { profile: SowReport["profile"] }) {
	const isHigh = p.riskRating === "High";
	return (
		<div
			className={`rounded-xl border p-5 ${
				isHigh
					? "border-red-500/30 bg-red-500/5"
					: "border-emerald-500/30 bg-emerald-500/5"
			}`}
		>
			<div className="flex items-center gap-3 mb-3">
				<ShieldAlertIcon
					className={`size-5 ${
						isHigh ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
					}`}
				/>
				<span className="font-semibold">
					Risk Assessment: {p.riskRating}
				</span>
			</div>
			<ul className="space-y-1.5">
				{p.riskReasoningPoints.map((point, i) => (
					<li key={i} className="flex items-start gap-2 text-sm">
						<span
							className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
								isHigh ? "bg-red-500" : "bg-emerald-500"
							}`}
						/>
						{point}
					</li>
				))}
			</ul>
		</div>
	);
}

function WealthBreakdown({
	items,
	totalWealth,
	totalIncome,
}: {
	items: SowWealthItem[];
	totalWealth: number;
	totalIncome: number;
}) {
	return (
		<div className="space-y-3">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				Wealth Breakdown
			</p>
			<div className="grid grid-cols-2 gap-3">
				<div className="rounded-lg border border-border bg-muted/20 p-3">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Total Estimated Wealth
					</div>
					<div className="text-xl font-semibold mt-0.5 tabular-nums">
						¥{formatRMB(totalWealth)}
					</div>
				</div>
				<div className="rounded-lg border border-border bg-muted/20 p-3">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Est. Annual Income
					</div>
					<div className="text-xl font-semibold mt-0.5 tabular-nums">
						¥{formatRMB(totalIncome)}
					</div>
				</div>
			</div>
			<div className="rounded-xl border border-border overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-muted/40 text-muted-foreground">
						<tr>
							<th className="text-left px-4 py-2 font-medium">Category</th>
							<th className="text-right px-4 py-2 font-medium w-32">Annual (¥)</th>
							<th className="text-right px-4 py-2 font-medium w-32">Total Value (¥)</th>
							<th className="text-center px-4 py-2 font-medium w-24">Confidence</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{items.map((item, i) => (
							<WealthRow key={i} item={item} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function WealthRow({ item }: { item: SowWealthItem }) {
	const [open, setOpen] = useState(false);
	const confColor = {
		High: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
		Low: "bg-red-500/15 text-red-700 dark:text-red-400",
	}[item.confidence];

	return (
		<>
			<tr
				className="hover:bg-muted/20 cursor-pointer transition-colors"
				onClick={() => setOpen((v) => !v)}
			>
				<td className="px-4 py-2.5 font-medium">
					<div className="flex items-center gap-1.5">
						<ChevronDownIcon
							className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
						/>
						{item.category}
					</div>
				</td>
				<td className="px-4 py-2.5 text-right tabular-nums font-mono text-xs">
					{item.estimatedAnnualRMB ? formatRMB(item.estimatedAnnualRMB) : "—"}
				</td>
				<td className="px-4 py-2.5 text-right tabular-nums font-mono text-xs">
					{item.estimatedTotalRMB !== null ? formatRMB(item.estimatedTotalRMB) : "—"}
				</td>
				<td className="px-4 py-2.5 text-center">
					<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${confColor}`}>
						{item.confidence}
					</span>
				</td>
			</tr>
			{open && (
				<tr>
					<td colSpan={4} className="px-4 py-3 bg-muted/10">
						<p className="text-xs text-muted-foreground leading-relaxed pl-5">
							{item.description}
						</p>
					</td>
				</tr>
			)}
		</>
	);
}

function DataSourceFindings({ sources }: { sources: SowDataSource[] }) {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const toggle = (id: string) =>
		setExpandedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});

	const categories = ["Identity", "Banking", "Risk", "Corporate", "Income", "Tax"] as const;
	const grouped = categories
		.map((cat) => ({
			category: cat,
			items: sources.filter((s) => s.category === cat),
		}))
		.filter((g) => g.items.length > 0);

	return (
		<div className="space-y-3">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				Data Source Findings — {sources.length} sources queried
			</p>
			<div className="space-y-3">
				{grouped.map((group) => (
					<div key={group.category} className="rounded-xl border border-border overflow-hidden">
						<div className="px-4 py-2 bg-muted/30 border-b border-border">
							<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{group.category}
							</span>
						</div>
						<div className="divide-y divide-border">
							{group.items.map((source) => {
								const isOpen = expandedIds.has(source.id);
								return (
									<div key={source.id}>
										<button
											onClick={() => toggle(source.id)}
											className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/20 transition-colors"
										>
											<SourceStatusIcon status={source.status} />
											<div className="flex-1 min-w-0">
												<div className="text-sm">{source.name}</div>
												<div className="text-[11px] text-muted-foreground">
													{source.provider}
												</div>
											</div>
											<SourceStatusBadge status={source.status} label={source.statusLabel} />
											<ChevronDownIcon
												className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
											/>
										</button>
										{isOpen && (
											<div className="px-4 pb-3 pl-12">
												<p className="text-xs text-muted-foreground leading-relaxed">
													{source.findings}
												</p>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function NarrativeSection({ narrative }: { narrative: string }) {
	return (
		<div className="space-y-3">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				SOW Narrative — AI-Generated Summary
			</p>
			<div className="rounded-xl border border-border bg-muted/20 p-5">
				{narrative.split("\n\n").map((para, i) => (
					<p key={i} className="text-sm leading-relaxed mb-3 last:mb-0">
						{para}
					</p>
				))}
			</div>
		</div>
	);
}

function MockPdfViewer({
	name,
	nameEn,
	riskRating,
}: {
	name: string;
	nameEn: string;
	riskRating: "Low" | "High";
}) {
	return (
		<div className="space-y-3">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				Generated PDF Report
			</p>
			<div className="rounded-xl border border-border overflow-hidden">
				<div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
					<span className="text-sm font-medium">
						SOW_Report_{nameEn.replace(/\s+/g, "_")}_2026.pdf
					</span>
					<span className="text-xs text-muted-foreground">
						Sample · not a live document
					</span>
				</div>
				<div className="relative bg-white p-8 min-h-[600px]">
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
						<span className="text-[80px] font-bold text-gray-100 -rotate-45 tracking-[0.3em]">
							SAMPLE
						</span>
					</div>
					<div className="relative space-y-6 text-gray-800">
						<div className="border-b-2 border-gray-800 pb-4">
							<div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">
								Confidential
							</div>
							<h2 className="text-xl font-bold">Source of Wealth Assessment Report</h2>
							<div className="text-sm text-gray-600 mt-1">
								Subject: {name} ({nameEn})
							</div>
							<div className="text-sm text-gray-600">
								Generated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 text-xs">
							<div>
								<div className="font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Risk Rating
								</div>
								<div
									className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
										riskRating === "High"
											? "bg-red-100 text-red-800"
											: "bg-green-100 text-green-800"
									}`}
								>
									{riskRating.toUpperCase()}
								</div>
							</div>
							<div>
								<div className="font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Assessment Type
								</div>
								<div>Enhanced Due Diligence — Source of Wealth</div>
							</div>
						</div>

						<div className="text-xs space-y-3 text-gray-600">
							<div>
								<div className="font-semibold text-gray-800 mb-1">1. Executive Summary</div>
								<div className="h-3 bg-gray-100 rounded w-full mb-1" />
								<div className="h-3 bg-gray-100 rounded w-11/12 mb-1" />
								<div className="h-3 bg-gray-100 rounded w-4/5" />
							</div>
							<div>
								<div className="font-semibold text-gray-800 mb-1">2. Data Sources Consulted</div>
								<div className="h-3 bg-gray-100 rounded w-full mb-1" />
								<div className="h-3 bg-gray-100 rounded w-10/12" />
							</div>
							<div>
								<div className="font-semibold text-gray-800 mb-1">3. Wealth Breakdown</div>
								<div className="h-3 bg-gray-100 rounded w-full mb-1" />
								<div className="h-3 bg-gray-100 rounded w-9/12 mb-1" />
								<div className="h-3 bg-gray-100 rounded w-11/12" />
							</div>
							<div>
								<div className="font-semibold text-gray-800 mb-1">4. Risk Assessment & Recommendations</div>
								<div className="h-3 bg-gray-100 rounded w-full mb-1" />
								<div className="h-3 bg-gray-100 rounded w-7/12" />
							</div>
						</div>

						<div className="border-t border-gray-200 pt-3 text-[10px] text-gray-400">
							This report was generated using verified data from government registries and
							regulated financial databases. All data sources are cited in Section 2. This
							document is for internal compliance use only.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function SourceStatusIcon({ status }: { status: SowDataSource["status"] }) {
	switch (status) {
		case "confirmed":
		case "clear":
			return <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />;
		case "found":
			return <CheckCircle2Icon className="size-4 text-sky-600 dark:text-sky-400" />;
		case "flagged":
			return <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />;
		case "discrepancy":
			return <XCircleIcon className="size-4 text-red-600 dark:text-red-400" />;
	}
}

function SourceStatusBadge({ status, label }: { status: SowDataSource["status"]; label: string }) {
	const color = {
		confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		clear: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		found: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
		flagged: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
		discrepancy: "bg-red-500/15 text-red-700 dark:text-red-400",
	}[status];
	return (
		<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 whitespace-nowrap ${color}`}>
			{label}
		</span>
	);
}

function RiskBadge({ rating, size = "sm" }: { rating: "Low" | "High"; size?: "sm" | "lg" }) {
	const color =
		rating === "High"
			? "bg-red-500/15 text-red-700 dark:text-red-400"
			: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
	const sizeClass = size === "lg" ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5";
	return (
		<span className={`font-semibold rounded ${color} ${sizeClass}`}>
			{rating} Risk
		</span>
	);
}

function formatRMB(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
	return n.toLocaleString();
}
