"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	CheckCircle2Icon,
	AlertTriangleIcon,
	XCircleIcon,
	LoaderIcon,
	UserIcon,
	ShieldAlertIcon,
	ArrowRightIcon,
	ChevronDownIcon,
	DownloadIcon,
	BellRingIcon,
	CalendarIcon,
	ActivityIcon,
	GaugeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	SOW_CASES,
	type SowReport,
	type SowDataSource,
	type SowWealthItem,
	type ScreeningAlert,
} from "@/lib/sow-mock-data";

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
			className="text-left rounded-xl border border-border bg-card p-5 hover:bg-accent/50 hover:border-primary/30 transition-all group shadow-sm"
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

			<div className="rounded-xl border border-border overflow-hidden shadow-sm">
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
	const isHigh = p.riskRating === "High";

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						SOW Assessment Complete
					</p>
					<h3 className="text-lg font-semibold mt-0.5">
						{p.name} ({p.nameEn})
					</h3>
				</div>
				<div className="flex items-center gap-2">
					<DownloadReportButton report={report} />
					<Button variant="outline" onClick={onReset}>
						New Assessment
					</Button>
				</div>
			</div>

			<ProfileCard profile={p} />

			{/* Key Parameters */}
			<KeyParameters
				params={report.keyParameters}
				riskRating={p.riskRating}
			/>

			<RiskAssessment profile={p} />

			<WealthBreakdown
				items={report.wealthBreakdown}
				totalWealth={report.totalEstimatedWealthRMB}
				totalIncome={report.totalEstimatedAnnualIncomeRMB}
			/>

			<DataSourceFindings sources={report.dataSources} />

			<NarrativeSection narrative={report.narrative} />

			{/* Perpetual Screening */}
			<PerpetualScreening
				alerts={report.screeningAlerts}
				nextReviewDate={report.nextReviewDate}
				riskRating={p.riskRating}
			/>
		</div>
	);
}

function ProfileCard({ profile: p }: { profile: SowReport["profile"] }) {
	return (
		<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
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

function KeyParameters({
	params,
	riskRating,
}: {
	params: SowReport["keyParameters"];
	riskRating: "Low" | "High";
}) {
	const statusStyle = {
		normal: "border-emerald-500/20 bg-emerald-500/5",
		warning: "border-amber-500/20 bg-amber-500/5",
		critical: "border-red-500/20 bg-red-500/5",
	};
	const dotStyle = {
		normal: "bg-emerald-500",
		warning: "bg-amber-500",
		critical: "bg-red-500",
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<GaugeIcon className="size-4 text-muted-foreground" />
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
					Key Risk Parameters
				</p>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{params.map((param, i) => (
					<div
						key={i}
						className={`rounded-lg border p-3 ${statusStyle[param.status]}`}
					>
						<div className="flex items-center gap-1.5 mb-1">
							<div className={`h-1.5 w-1.5 rounded-full ${dotStyle[param.status]}`} />
							<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
								{param.label}
							</span>
						</div>
						<div className="text-sm font-semibold truncate" title={param.value}>
							{param.value}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function RiskAssessment({ profile: p }: { profile: SowReport["profile"] }) {
	const isHigh = p.riskRating === "High";
	return (
		<div
			className={`rounded-xl border p-5 shadow-sm ${
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
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Total Estimated Wealth
					</div>
					<div className="text-2xl font-bold mt-1 tabular-nums tracking-tight">
						¥{formatRMB(totalWealth)}
					</div>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Est. Annual Income
					</div>
					<div className="text-2xl font-bold mt-1 tabular-nums tracking-tight">
						¥{formatRMB(totalIncome)}
					</div>
				</div>
			</div>
			<div className="rounded-xl border border-border overflow-hidden shadow-sm">
				<table className="w-full text-sm">
					<thead className="bg-muted/40 text-muted-foreground">
						<tr>
							<th className="text-left px-4 py-2.5 font-medium">Category</th>
							<th className="text-right px-4 py-2.5 font-medium w-32">Annual (¥)</th>
							<th className="text-right px-4 py-2.5 font-medium w-32">Total Value (¥)</th>
							<th className="text-center px-4 py-2.5 font-medium w-24">Confidence</th>
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
					<div key={group.category} className="rounded-xl border border-border overflow-hidden shadow-sm">
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
			<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
				{narrative.split("\n\n").map((para, i) => (
					<p key={i} className="text-sm leading-relaxed mb-3 last:mb-0">
						{para}
					</p>
				))}
			</div>
		</div>
	);
}

function PerpetualScreening({
	alerts,
	nextReviewDate,
	riskRating,
}: {
	alerts: ScreeningAlert[];
	nextReviewDate: string;
	riskRating: "Low" | "High";
}) {
	const isHigh = riskRating === "High";

	const severityStyle = {
		Critical: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
		Warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
		Info: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
	};

	const severityDot = {
		Critical: "bg-red-500",
		Warning: "bg-amber-500",
		Info: "bg-sky-500",
	};

	const typeIcon = {
		Litigation: "scale",
		"Adverse Media": "newspaper",
		Sanctions: "ban",
		"Corporate Change": "building",
		Tax: "receipt",
		Regulatory: "shield",
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<BellRingIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Perpetual Screening & Ongoing Monitoring
					</p>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CalendarIcon className="size-3.5" />
					Next review: {nextReviewDate}
				</div>
			</div>

			{/* Monitoring status bar */}
			<div className={`rounded-lg border p-3 flex items-center justify-between ${
				isHigh ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"
			}`}>
				<div className="flex items-center gap-2">
					<ActivityIcon className={`size-4 ${isHigh ? "text-amber-600" : "text-emerald-600"}`} />
					<span className="text-sm font-medium">
						{isHigh ? "Active Monitoring — Elevated Alerts" : "Active Monitoring — Routine"}
					</span>
				</div>
				<span className={`text-xs font-semibold rounded px-2 py-0.5 ${
					isHigh ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
				}`}>
					{alerts.length} alert{alerts.length !== 1 ? "s" : ""}
				</span>
			</div>

			{/* Alert timeline */}
			<div className="rounded-xl border border-border overflow-hidden shadow-sm">
				{alerts.map((alert, i) => (
					<AlertRow key={i} alert={alert} isLast={i === alerts.length - 1} />
				))}
			</div>
		</div>
	);
}

function AlertRow({ alert, isLast }: { alert: ScreeningAlert; isLast: boolean }) {
	const [open, setOpen] = useState(false);

	const severityBadge = {
		Critical: "bg-red-500/15 text-red-700 dark:text-red-400",
		Warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
		Info: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
	}[alert.severity];

	const severityDot = {
		Critical: "bg-red-500",
		Warning: "bg-amber-500",
		Info: "bg-sky-500",
	}[alert.severity];

	const typeBadge = "bg-muted text-muted-foreground";

	return (
		<div className={!isLast ? "border-b border-border" : ""}>
			<button
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
			>
				<div className="flex flex-col items-center gap-1 shrink-0 w-16">
					<span className="text-[10px] text-muted-foreground font-mono">
						{alert.date}
					</span>
					<div className={`h-2 w-2 rounded-full ${severityDot}`} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-sm font-medium truncate">{alert.title}</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${typeBadge}`}>
						{alert.type}
					</span>
					<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${severityBadge}`}>
						{alert.severity}
					</span>
					<ChevronDownIcon
						className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
					/>
				</div>
			</button>
			{open && (
				<div className="px-4 pb-3 pl-[5.5rem]">
					<p className="text-xs text-muted-foreground leading-relaxed">
						{alert.detail}
					</p>
				</div>
			)}
		</div>
	);
}

function DownloadReportButton({ report }: { report: SowReport }) {
	const download = () => {
		const p = report.profile;
		const isHigh = p.riskRating === "High";
		const riskColor = isHigh ? "#dc2626" : "#16a34a";
		const riskBg = isHigh ? "#fef2f2" : "#f0fdf4";
		const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

		const paramRows = report.keyParameters
			.map((param) => {
				const color = param.status === "critical" ? "#dc2626" : param.status === "warning" ? "#d97706" : "#16a34a";
				return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${param.label}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:${color}">${param.value}</td></tr>`;
			})
			.join("");

		const wealthRows = report.wealthBreakdown
			.map((item) => {
				const confColor = item.confidence === "High" ? "#16a34a" : item.confidence === "Medium" ? "#d97706" : "#dc2626";
				return `<tr>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${item.category}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${item.estimatedAnnualRMB ? "¥" + formatRMB(item.estimatedAnnualRMB) : "—"}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${item.estimatedTotalRMB !== null ? "¥" + formatRMB(item.estimatedTotalRMB) : "—"}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;color:${confColor};font-weight:600;">${item.confidence}</td>
				</tr>`;
			})
			.join("");

		const sourceRows = report.dataSources
			.map((s) => {
				const statusColor = s.status === "confirmed" || s.status === "clear" ? "#16a34a" : s.status === "found" ? "#0284c7" : s.status === "flagged" ? "#d97706" : "#dc2626";
				return `<tr>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${s.name}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${s.provider}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${statusColor};font-weight:600;">${s.statusLabel}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${s.findings}</td>
				</tr>`;
			})
			.join("");

		const screeningRows = report.screeningAlerts
			.map((a) => {
				const sevColor = a.severity === "Critical" ? "#dc2626" : a.severity === "Warning" ? "#d97706" : "#0284c7";
				return `<tr>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;">${a.date}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${a.type}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${sevColor};font-weight:600;">${a.severity}</td>
					<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${a.title}</td>
				</tr>`;
			})
			.join("");

		const narrativeHtml = report.narrative
			.split("\n\n")
			.map((para) => `<p style="margin:0 0 12px 0;font-size:13px;line-height:1.7;color:#374151;">${para}</p>`)
			.join("");

		const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SOW Report — ${p.nameEn}</title>
<style>
	@media print { body { margin: 0; } .page-break { page-break-before: always; } }
	body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px 32px; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 8px 12px; background: #f3f4f6; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #d1d5db; }
	h1 { font-size: 22px; margin: 0; }
	h2 { font-size: 16px; margin: 32px 0 12px 0; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; color: #111827; text-transform: uppercase; letter-spacing: 0.04em; }
</style>
</head>
<body>
<div style="border-bottom:3px solid #1e3a5f;padding-bottom:16px;margin-bottom:24px;">
	<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;margin-bottom:4px;">Confidential — Enhanced Due Diligence</div>
	<h1>Source of Wealth Assessment Report</h1>
	<div style="font-size:13px;color:#6b7280;margin-top:6px;">Subject: ${p.name} (${p.nameEn}) &nbsp;|&nbsp; Generated: ${now}</div>
</div>

<div style="display:flex;gap:16px;margin-bottom:24px;">
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33;">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280;">Risk Rating</div>
		<div style="font-size:18px;font-weight:700;color:${riskColor};margin-top:2px;">${p.riskRating.toUpperCase()}</div>
	</div>
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6;">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280;">Total Estimated Wealth</div>
		<div style="font-size:18px;font-weight:700;margin-top:2px;">¥${formatRMB(report.totalEstimatedWealthRMB)}</div>
	</div>
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6;">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280;">Est. Annual Income</div>
		<div style="font-size:18px;font-weight:700;margin-top:2px;">¥${formatRMB(report.totalEstimatedAnnualIncomeRMB)}</div>
	</div>
</div>

<h2>1. Subject Profile</h2>
<table>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:140px;">Full Name</td><td style="padding:4px 0;font-size:13px;">${p.name} (${p.nameEn})</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Date of Birth</td><td style="padding:4px 0;font-size:13px;">${p.dateOfBirth} (Age ${p.age})</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Gender</td><td style="padding:4px 0;font-size:13px;">${p.gender}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">ID Number</td><td style="padding:4px 0;font-size:13px;font-family:monospace;">${p.idNumber}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Nationality</td><td style="padding:4px 0;font-size:13px;">${p.nationality}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Occupation</td><td style="padding:4px 0;font-size:13px;">${p.occupation}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Employer</td><td style="padding:4px 0;font-size:13px;">${p.employer}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;">Location</td><td style="padding:4px 0;font-size:13px;">${p.city}</td></tr>
</table>

<h2>2. Key Risk Parameters</h2>
<table>
	<tr><th>Parameter</th><th>Assessment</th></tr>
	${paramRows}
</table>

<h2>3. Risk Assessment</h2>
<div style="padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33;margin-bottom:8px;">
	<div style="font-weight:700;color:${riskColor};margin-bottom:8px;">Overall Risk: ${p.riskRating}</div>
	<ul style="margin:0;padding-left:20px;">
		${p.riskReasoningPoints.map((pt) => `<li style="font-size:13px;margin-bottom:4px;">${pt}</li>`).join("")}
	</ul>
</div>

<div class="page-break"></div>

<h2>4. Wealth Breakdown</h2>
<table>
	<tr><th>Category</th><th style="text-align:right;">Annual (¥)</th><th style="text-align:right;">Total Value (¥)</th><th style="text-align:center;">Confidence</th></tr>
	${wealthRows}
</table>

<h2>5. Data Sources Consulted (${report.dataSources.length})</h2>
<table>
	<tr><th>Source</th><th>Provider</th><th>Status</th><th>Findings</th></tr>
	${sourceRows}
</table>

<div class="page-break"></div>

<h2>6. SOW Narrative</h2>
${narrativeHtml}

<h2>7. Perpetual Screening (${report.screeningAlerts.length} Alerts)</h2>
<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Next scheduled review: ${report.nextReviewDate}</div>
<table>
	<tr><th>Date</th><th>Type</th><th>Severity</th><th>Alert</th></tr>
	${screeningRows}
</table>

<div style="border-top:2px solid #e5e7eb;margin-top:32px;padding-top:16px;font-size:11px;color:#9ca3af;">
	This report was generated using verified data from government registries and regulated financial databases.
	All data sources are cited in Section 5. This document is for internal compliance use only.
	<br/><br/>
	Generated: ${now} &nbsp;|&nbsp; Next Review: ${report.nextReviewDate}
</div>
</body>
</html>`;

		const blob = new Blob([html], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `SOW_Report_${p.nameEn.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<Button variant="outline" onClick={download} className="gap-1.5">
			<DownloadIcon className="size-3.5" />
			Download Report
		</Button>
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
	const sizeClass = size === "lg" ? "text-xs px-2.5 py-1" : "text-[10px] px-1.5 py-0.5";
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
