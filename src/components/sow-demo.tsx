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
	ChevronRightIcon,
	DownloadIcon,
	BellRingIcon,
	CalendarIcon,
	ActivityIcon,
	GaugeIcon,
	CheckIcon,
	ShieldCheckIcon,
	LandmarkIcon,
	BanknoteIcon,
	FileTextIcon,
	ClockIcon,
	HashIcon,
	ArrowUpRightIcon,
	CalendarClockIcon,
	SearchIcon,
	PlusIcon,
	FolderOpenIcon,
	InfoIcon,
	EyeIcon,
	RefreshCwIcon,
	NetworkIcon,
	TrendingUpIcon,
	RadarIcon,
	ScanIcon,
	DatabaseIcon,
	ShieldIcon,
	ExternalLinkIcon,
	GlobeIcon,
	BriefcaseIcon,
	MapPinIcon,
	BadgePercentIcon,
	BookOpenIcon,
	LinkIcon,
	ChevronUpIcon,
	SparklesIcon,
	BarChart3Icon,
	CircleDotIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	HNW_CASES,
	HNW_MONITORING,
	HNW_NOTIFICATIONS,
	PEP_SCREENING,
	CATEGORY_LABELS,
	CATEGORY_COLORS,
	formatUSD,
	type HnwReport,
	type HnwMonitoringEntry,
	type HnwNotification,
	type HnwProfile,
	type CareerPhase,
	type CategoryBreakdown,
	type WealthClaim,
	type SourceCitation,
	type WealthCategory,
	type KeyParameter,
	type DataSourceDef,
	type CompanyNode,
	type PepScreeningEntry,
} from "@/lib/sow-mock-data";

/* ═══════════════════════════════════════════════════════════════
   State & Types
   ═══════════════════════════════════════════════════════════════ */

type Phase = "dashboard" | "profile" | "select" | "generating" | "report";

const STEPS = [
	{ key: "select", label: "Select Subject" },
	{ key: "generating", label: "Assessment" },
	{ key: "report", label: "Report" },
] as const;

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function SowDemo() {
	const [phase, setPhase] = useState<Phase>("dashboard");
	const [selectedCase, setSelectedCase] = useState<HnwReport | null>(null);
	const [completedSources, setCompletedSources] = useState<DataSourceDef[]>([]);
	const [currentSourceIndex, setCurrentSourceIndex] = useState(-1);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [selectedMonitoringId, setSelectedMonitoringId] = useState<string | null>(null);
	const cancelRef = useRef(false);
	const reportRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

	const reset = () => {
		cancelRef.current = true;
		if (timerRef.current) clearInterval(timerRef.current);
		setPhase("dashboard");
		setSelectedCase(null);
		setSelectedMonitoringId(null);
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
	};

	const selectSubject = (report: HnwReport) => {
		setSelectedCase(report);
	};

	const beginAssessment = () => {
		if (!selectedCase) return;
		cancelRef.current = false;
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
		setPhase("generating");
	};

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
			setPhase("report");
			setTimeout(() => {
				reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		})();

		return () => {
			cancelRef.current = true;
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [phase, selectedCase]);

	if (phase === "dashboard") {
		return (
			<Dashboard
				onNewAssessment={() => setPhase("select")}
				onSelectMonitoring={(id) => {
					setSelectedMonitoringId(id);
					setPhase("profile");
				}}
			/>
		);
	}

	if (phase === "profile" && selectedMonitoringId) {
		const entry = HNW_MONITORING.find((m) => m.id === selectedMonitoringId);
		if (!entry) return null;
		return <MonitoringProfile entry={entry} onBack={reset} />;
	}

	return (
		<div className="space-y-6">
			<StepIndicator current={phase} />

			{phase === "select" && (
				<PersonSelector
					selectedCase={selectedCase}
					onSelectCase={selectSubject}
					onBegin={beginAssessment}
					onBack={() => setPhase("dashboard")}
				/>
			)}

			{phase === "generating" && selectedCase && (
				<GeneratingView
					report={selectedCase}
					completedSources={completedSources}
					currentSourceIndex={currentSourceIndex}
					elapsedMs={elapsedMs}
					onCancel={reset}
				/>
			)}

			{phase === "report" && selectedCase && (
				<div ref={reportRef}>
					<ReportView report={selectedCase} onReset={reset} />
				</div>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Dashboard
   ═══════════════════════════════════════════════════════════════ */

function Dashboard({ onNewAssessment, onSelectMonitoring }: { onNewAssessment: () => void; onSelectMonitoring: (id: string) => void }) {
	const [notifications, setNotifications] = useState(HNW_NOTIFICATIONS);
	const [lastRefresh, setLastRefresh] = useState(new Date());
	const unreadCount = notifications.filter((n) => !n.read).length;

	const markRead = (id: string) => {
		setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
	};

	const monitoring = HNW_MONITORING;
	const profilesMonitored = monitoring.length;
	const underReview = monitoring.filter((m) => m.status === "Under Review" || m.status === "Flagged").length;
	const highRisk = monitoring.filter((m) => m.riskRating === "High").length;
	const totalAlerts = monitoring.reduce((sum, m) => sum + m.openAlerts, 0);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-heading font-semibold tracking-tight">HNW Wealth Intelligence</h2>
					<p className="text-sm text-muted-foreground mt-0.5">Source of Wealth monitoring and assessment for high net worth individuals</p>
				</div>
				<Button onClick={onNewAssessment} className="gap-2 shadow-md shadow-primary/20 font-heading">
					<PlusIcon className="size-4" />
					New Assessment
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<StatCard label="Profiles Monitored" value={profilesMonitored} icon={UserIcon} />
				<StatCard label="Under Review" value={underReview} icon={EyeIcon} color="amber" />
				<StatCard label="High Risk" value={highRisk} icon={ShieldAlertIcon} color="red" />
				<StatCard label="Open Alerts" value={totalAlerts} icon={BellRingIcon} color="red" />
			</div>

			{/* Compliance Summary */}
			<div className="rounded-2xl border border-border bg-gradient-to-r from-muted/30 to-transparent p-5 shadow-sm">
				<div className="flex items-center gap-2 mb-3">
					<ShieldCheckIcon className="size-4 text-primary" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Compliance Summary</p>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Avg. Confidence</div>
						<div className="mt-0.5 font-heading font-semibold">62%</div>
					</div>
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Profiles Verified</div>
						<div className="mt-0.5 font-heading font-semibold">5 / {profilesMonitored}</div>
					</div>
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Data Sources</div>
						<div className="mt-0.5 font-heading font-semibold">12 per subject</div>
					</div>
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Coverage</div>
						<div className="mt-0.5 font-heading font-semibold text-emerald-700">Multi-jurisdictional</div>
					</div>
				</div>
			</div>

			{/* HNW Monitoring Table */}
			<HnwMonitoringTable entries={monitoring} onSelect={onSelectMonitoring} />

			{/* PEP / Sanctions Screening */}
			<PepSanctionsSection entries={PEP_SCREENING} />

			{/* Notifications */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BellRingIcon className="size-4 text-amber-500" />
						<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Notifications</p>
						{unreadCount > 0 && (
							<span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-red-500 text-white min-w-[18px] text-center">{unreadCount}</span>
						)}
					</div>
					<button onClick={() => setLastRefresh(new Date())} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted" title="Refresh">
						<RefreshCwIcon className="size-3.5" />
					</button>
				</div>
				<div className="rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border/60 bg-card">
					{notifications.map((n) => (
						<HnwNotificationRow key={n.id} notification={n} onRead={() => markRead(n.id)} />
					))}
				</div>
				<p className="text-[10px] text-muted-foreground/60 text-right tracking-wide">
					Last updated: {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · Auto-refreshes every 60s
				</p>
			</div>
		</div>
	);
}

/* ─── Stat Card ─── */

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof UserIcon; color?: string }) {
	const colorMap: Record<string, string> = {
		emerald: "text-emerald-600 bg-emerald-500/10",
		amber: "text-amber-600 bg-amber-500/10",
		red: "text-red-600 bg-red-500/10",
	};
	const c = color ? colorMap[color] : "text-primary bg-primary/10";
	return (
		<div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-center justify-between mb-3">
				<span className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
				<div className={`h-8 w-8 rounded-xl flex items-center justify-center ${c}`}>
					<Icon className="size-4" />
				</div>
			</div>
			<div className="text-3xl font-heading font-bold tabular-nums tracking-tight">{value}</div>
		</div>
	);
}

/* ─── HNW Monitoring Table ─── */

function HnwMonitoringTable({ entries, onSelect }: { entries: HnwMonitoringEntry[]; onSelect: (id: string) => void }) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<RadarIcon className="size-4 text-primary" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">HNW Monitoring</p>
					<span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary min-w-[18px] text-center">
						{entries.length} active
					</span>
				</div>
				<div className="flex items-center gap-2 text-[10px]">
					<span className="rounded-md border border-border bg-muted/50 text-muted-foreground px-1.5 py-0.5 font-semibold flex items-center gap-1">
						<ScanIcon className="size-3" /> Last scan: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
					</span>
				</div>
			</div>

			<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-muted/60 to-muted/30 text-muted-foreground">
						<tr>
							<th className="text-left px-4 py-3 font-medium text-xs tracking-wide">Name</th>
							<th className="text-left px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Industry</th>
							<th className="text-right px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Net Worth</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Risk</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Last Screened</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Alerts</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Status</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/60">
						{entries.map((entry) => (
							<tr key={entry.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => onSelect(entry.id)}>
								<td className="px-4 py-3">
									<div className="font-medium text-primary">{entry.name}</div>
									{entry.nameCn && <div className="text-[10px] text-muted-foreground/60">{entry.nameCn}</div>}
								</td>
								<td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{entry.industry}</td>
								<td className="px-4 py-3 text-right hidden sm:table-cell">
									<span className="font-mono text-xs font-medium">{formatUSD(entry.estimatedNetWorthUSD)}</span>
								</td>
								<td className="px-4 py-3 text-center">
									<RiskBadge rating={entry.riskRating} />
								</td>
								<td className="px-4 py-3 text-center hidden sm:table-cell">
									<span className="text-xs text-muted-foreground">{entry.lastScreened}</span>
								</td>
								<td className="px-4 py-3 text-center">
									{entry.openAlerts > 0 ? (
										<span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-red-500/15 text-red-700">{entry.openAlerts}</span>
									) : (
										<span className="text-xs text-muted-foreground/40">—</span>
									)}
								</td>
								<td className="px-4 py-3 text-center hidden sm:table-cell">
									<MonitoringStatusBadge status={entry.status} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/* ─── PEP/Sanctions Section ─── */

function PepSanctionsSection({ entries }: { entries: PepScreeningEntry[] }) {
	const totalPep = entries.reduce((s, e) => s + e.pepHits, 0);
	const totalSanctions = entries.reduce((s, e) => s + e.sanctionsHits, 0);
	const totalAdverse = entries.reduce((s, e) => s + e.adverseMedia, 0);
	const flaggedCount = entries.filter((e) => e.overallStatus === "Flagged").length;
	const reviewCount = entries.filter((e) => e.overallStatus === "Review Required").length;

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<ShieldAlertIcon className="size-4 text-amber-500" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">PEP / Sanctions / Watchlist Screening</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">PEP Hits</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${totalPep > 0 ? "text-amber-600" : "text-emerald-600"}`}>{totalPep}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Sanctions Hits</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${totalSanctions > 0 ? "text-red-600" : "text-emerald-600"}`}>{totalSanctions}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Adverse Media</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${totalAdverse > 0 ? "text-amber-600" : "text-emerald-600"}`}>{totalAdverse}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Flagged</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${flaggedCount > 0 ? "text-red-600" : "text-emerald-600"}`}>{flaggedCount}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Review Req.</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${reviewCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>{reviewCount}</div>
				</div>
			</div>

			<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-muted/60 to-muted/30 text-muted-foreground">
						<tr>
							<th className="text-left px-4 py-3 font-medium text-xs tracking-wide">Subject</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Risk</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">PEP</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Sanctions</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Adverse Media</th>
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Status</th>
							<th className="text-left px-4 py-3 font-medium text-xs tracking-wide hidden lg:table-cell">Last Screened</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/60">
						{entries.map((entry, i) => {
							const statusColor: Record<string, string> = {
								Clear: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
								"Review Required": "bg-amber-500/15 text-amber-700 border-amber-500/20",
								Flagged: "bg-red-500/15 text-red-700 border-red-500/20",
							};
							return (
								<tr key={i} className="hover:bg-accent/20 transition-colors">
									<td className="px-4 py-3">
										<div className="font-medium">{entry.subjectName}</div>
										{entry.subjectNameCn && <div className="text-[10px] text-muted-foreground/60">{entry.subjectNameCn}</div>}
									</td>
									<td className="px-4 py-3 text-center"><RiskBadge rating={entry.riskRating} /></td>
									<td className="px-4 py-3 text-center hidden sm:table-cell">
										<span className={`font-heading font-bold ${entry.pepHits > 0 ? "text-amber-600" : "text-muted-foreground/40"}`}>{entry.pepHits}</span>
									</td>
									<td className="px-4 py-3 text-center hidden sm:table-cell">
										<span className={`font-heading font-bold ${entry.sanctionsHits > 0 ? "text-red-600" : "text-muted-foreground/40"}`}>{entry.sanctionsHits}</span>
									</td>
									<td className="px-4 py-3 text-center hidden sm:table-cell">
										<span className={`font-heading font-bold ${entry.adverseMedia > 0 ? "text-amber-600" : "text-muted-foreground/40"}`}>{entry.adverseMedia}</span>
									</td>
									<td className="px-4 py-3 text-center">
										<span className={`text-[10px] font-semibold rounded-md border px-1.5 py-0.5 whitespace-nowrap ${statusColor[entry.overallStatus]}`}>{entry.overallStatus}</span>
									</td>
									<td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{entry.lastScreened}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/* ─── Monitoring Profile ─── */

function MonitoringProfile({ entry, onBack }: { entry: HnwMonitoringEntry; onBack: () => void }) {
	const screening = PEP_SCREENING.find((p) => p.subjectName.includes(entry.name));

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted">
					<ArrowRightIcon className="size-4 rotate-180" />
				</button>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h2 className="text-xl font-heading font-semibold tracking-tight">{entry.name}</h2>
						{entry.nameCn && <span className="text-lg text-muted-foreground font-heading">{entry.nameCn}</span>}
						<RiskBadge rating={entry.riskRating} />
						<MonitoringStatusBadge status={entry.status} />
					</div>
					<p className="text-sm text-muted-foreground mt-0.5">{entry.industry}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				{/* Profile Info */}
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
					<div className="flex items-center gap-2">
						<UserIcon className="size-4 text-primary" />
						<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Subject Profile</p>
					</div>
					<div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Est. Net Worth</div>
							<div className="mt-0.5 font-heading font-bold text-lg">{formatUSD(entry.estimatedNetWorthUSD)}</div>
						</div>
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Risk Rating</div>
							<div className={`mt-0.5 font-heading font-bold text-lg ${entry.riskRating === "High" ? "text-red-600" : entry.riskRating === "Medium" ? "text-amber-600" : "text-emerald-600"}`}>{entry.riskRating}</div>
						</div>
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Industry</div>
							<div className="mt-0.5">{entry.industry}</div>
						</div>
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Screening Freq.</div>
							<div className="mt-0.5 font-heading font-semibold text-primary">{entry.screeningFrequency}</div>
						</div>
					</div>
				</div>

				{/* Monitoring Config */}
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
					<div className="flex items-center gap-2">
						<RadarIcon className="size-4 text-primary" />
						<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Monitoring Configuration</p>
					</div>
					<div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Last Screened</div>
							<div className="mt-0.5">{entry.lastScreened}</div>
						</div>
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Frequency</div>
							<div className="mt-0.5 font-heading font-semibold">{entry.screeningFrequency}</div>
						</div>
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Open Alerts</div>
							<div className={`mt-0.5 font-heading font-bold ${entry.openAlerts > 0 ? "text-red-600" : "text-emerald-600"}`}>{entry.openAlerts}</div>
						</div>
						<div>
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Status</div>
							<div className="mt-0.5"><MonitoringStatusBadge status={entry.status} /></div>
						</div>
					</div>
				</div>
			</div>

			{/* PEP Screening Details */}
			{screening && (
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
					<div className="flex items-center gap-2">
						<ShieldCheckIcon className="size-4 text-primary" />
						<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Screening Results</p>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">PEP Hits</div>
							<div className={`text-xl font-heading font-bold mt-1 ${screening.pepHits > 0 ? "text-amber-600" : "text-emerald-600"}`}>{screening.pepHits}</div>
						</div>
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Sanctions</div>
							<div className={`text-xl font-heading font-bold mt-1 ${screening.sanctionsHits > 0 ? "text-red-600" : "text-emerald-600"}`}>{screening.sanctionsHits}</div>
						</div>
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Adverse Media</div>
							<div className={`text-xl font-heading font-bold mt-1 ${screening.adverseMedia > 0 ? "text-amber-600" : "text-emerald-600"}`}>{screening.adverseMedia}</div>
						</div>
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Lists Checked</div>
							<div className="text-xl font-heading font-bold mt-1">{screening.listsChecked.length}</div>
						</div>
					</div>
					{screening.pepDetails && (
						<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
							<div className="text-[9px] font-heading text-amber-700 uppercase tracking-widest mb-1">PEP Details</div>
							<p className="text-sm text-amber-900/80 leading-relaxed">{screening.pepDetails}</p>
						</div>
					)}
					{screening.adverseMediaDetails && (
						<div className="rounded-xl border border-border/60 bg-muted/20 p-4">
							<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest mb-1">Adverse Media Details</div>
							<p className="text-sm text-muted-foreground leading-relaxed">{screening.adverseMediaDetails}</p>
						</div>
					)}
				</div>
			)}

			{/* Related notifications */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<BellRingIcon className="size-4 text-amber-500" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Recent Activity</p>
				</div>
				<div className="rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border/60 bg-card">
					{HNW_NOTIFICATIONS.filter((n) => n.subjectName === entry.name).map((n) => (
						<HnwNotificationRow key={n.id} notification={n} onRead={() => {}} />
					))}
					{HNW_NOTIFICATIONS.filter((n) => n.subjectName === entry.name).length === 0 && (
						<div className="p-6 text-center text-sm text-muted-foreground">No recent notifications for this subject.</div>
					)}
				</div>
			</div>
		</div>
	);
}

/* ─── Notification Row ─── */

function HnwNotificationRow({ notification: n, onRead }: { notification: HnwNotification; onRead: () => void }) {
	const iconMap: Record<string, { Icon: typeof BellRingIcon; color: string }> = {
		alert: { Icon: AlertTriangleIcon, color: "text-red-500" },
		"review-due": { Icon: CalendarClockIcon, color: "text-amber-500" },
		update: { Icon: InfoIcon, color: "text-sky-500" },
		completed: { Icon: CheckCircle2Icon, color: "text-emerald-500" },
	};
	const { Icon, color } = iconMap[n.type] ?? iconMap.update;

	return (
		<button onClick={onRead} className={`w-full text-left px-4 py-3.5 hover:bg-accent/30 transition-colors ${!n.read ? "bg-primary/[0.03]" : ""}`}>
			<div className="flex items-start gap-2.5">
				<div className={`mt-0.5 p-1 rounded-lg ${!n.read ? "bg-muted/80" : ""}`}>
					<Icon className={`size-3.5 shrink-0 ${color}`} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className={`text-sm font-medium truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</span>
						{!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
					</div>
					<p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.detail}</p>
					<div className="flex items-center gap-2 mt-1.5">
						<span className="text-[9px] text-muted-foreground/50">{n.time}</span>
					</div>
				</div>
			</div>
		</button>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Step Indicator
   ═══════════════════════════════════════════════════════════════ */

function StepIndicator({ current }: { current: Phase }) {
	if (current === "dashboard" || current === "profile") return null;
	const currentIdx = STEPS.findIndex((s) => s.key === current);
	return (
		<div className="flex items-center justify-center gap-0 py-3">
			{STEPS.map((step, i) => {
				const isComplete = i < currentIdx;
				const isCurrent = i === currentIdx;
				const isFuture = i > currentIdx;
				return (
					<div key={step.key} className="flex items-center">
						<div className="flex items-center gap-2">
							<div
								className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
									isComplete
										? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
										: isCurrent
											? "bg-primary text-primary-foreground ring-[3px] ring-primary/20 ring-offset-2 ring-offset-background shadow-md shadow-primary/25"
											: "bg-muted text-muted-foreground/60"
								}`}
							>
								{isComplete ? <CheckIcon className="size-3.5" /> : i + 1}
							</div>
							<span
								className={`text-sm font-heading font-medium hidden sm:inline ${
									isCurrent ? "text-foreground" : isFuture ? "text-muted-foreground/40" : "text-muted-foreground"
								}`}
							>
								{step.label}
							</span>
						</div>
						{i < STEPS.length - 1 && (
							<div className={`w-12 sm:w-20 h-[2px] mx-2 rounded-full ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
						)}
					</div>
				);
			})}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Person Selector
   ═══════════════════════════════════════════════════════════════ */

function PersonSelector({ selectedCase, onSelectCase, onBegin, onBack }: {
	selectedCase: HnwReport | null;
	onSelectCase: (r: HnwReport) => void;
	onBegin: () => void;
	onBack: () => void;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-1">
						Select Subject for Assessment
					</p>
					<p className="text-sm text-muted-foreground">
						Choose a high net worth individual to run a comprehensive Source of Wealth assessment with career-traced wealth analysis.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={onBack} className="font-heading">Back to Dashboard</Button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{HNW_CASES.map((report) => {
					const p = report.profile;
					const isSelected = selectedCase?.profile.id === p.id;
					const riskColors: Record<string, string> = {
						Low: "bg-emerald-500/10",
						Medium: "bg-amber-500/10",
						High: "bg-red-500/10",
					};
					const riskIconColors: Record<string, string> = {
						Low: "text-emerald-600",
						Medium: "text-amber-600",
						High: "text-red-600",
					};
					return (
						<button
							key={p.id}
							onClick={() => onSelectCase(report)}
							className={`text-left rounded-2xl border p-5 transition-all ${
								isSelected
									? "border-primary bg-primary/5 ring-2 ring-primary/15 shadow-md shadow-primary/10"
									: "border-border bg-card hover:border-primary/30 hover:bg-accent/30 hover:shadow-md"
							}`}
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div className={`h-11 w-11 rounded-xl flex items-center justify-center ${riskColors[p.riskRating]}`}>
										<UserIcon className={`size-5 ${riskIconColors[p.riskRating]}`} />
									</div>
									<div>
										<div className="font-heading font-semibold">{p.name}</div>
										{p.nameCn && <div className="text-xs text-muted-foreground">{p.nameCn}</div>}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<RiskBadge rating={p.riskRating} />
									{isSelected && (
										<div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30">
											<CheckIcon className="size-3 text-primary-foreground" />
										</div>
									)}
								</div>
							</div>

							<div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
								<span className="flex items-center gap-1"><MapPinIcon className="size-3" />{p.residences[0]}</span>
								<span className="flex items-center gap-1"><BriefcaseIcon className="size-3" />{p.primaryIndustry}</span>
							</div>

							<div className="flex items-center gap-3 mb-3">
								<div className="rounded-lg bg-muted/60 px-2.5 py-1">
									<div className="text-[9px] text-muted-foreground uppercase tracking-widest">Net Worth</div>
									<div className="font-heading font-bold text-sm">{formatUSD(p.estimatedNetWorthUSD)}</div>
								</div>
								<div className="rounded-lg bg-muted/60 px-2.5 py-1">
									<div className="text-[9px] text-muted-foreground uppercase tracking-widest">Confidence</div>
									<div className="font-heading font-bold text-sm">{report.overallConfidence}%</div>
								</div>
								<div className="rounded-lg bg-muted/60 px-2.5 py-1">
									<div className="text-[9px] text-muted-foreground uppercase tracking-widest">Risk Score</div>
									<div className="font-heading font-bold text-sm">{p.riskScore}/100</div>
								</div>
							</div>

							<p className="text-[11px] text-muted-foreground/70 leading-relaxed line-clamp-2">
								{p.profileSummary}
							</p>
						</button>
					);
				})}
			</div>

			{selectedCase && (
				<Button onClick={onBegin} className="w-full gap-2 shadow-md shadow-primary/20 font-heading text-[15px]" size="lg">
					Begin Assessment — {selectedCase.profile.name}
					<ArrowRightIcon className="size-4" />
				</Button>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Generating View
   ═══════════════════════════════════════════════════════════════ */

function GeneratingView({ report, completedSources, currentSourceIndex, elapsedMs, onCancel }: {
	report: HnwReport; completedSources: DataSourceDef[]; currentSourceIndex: number; elapsedMs: number; onCancel: () => void;
}) {
	const sources = report.dataSources;
	const progress = completedSources.length / sources.length;
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-heading font-semibold">
						Running wealth assessment for {report.profile.name}
					</h3>
					<p className="text-sm text-muted-foreground">
						Querying {sources.length} international data sources across multiple jurisdictions
					</p>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-xs text-muted-foreground tabular-nums font-mono">
						{(elapsedMs / 1000).toFixed(1)}s
					</span>
					<Button variant="outline" size="sm" onClick={onCancel} className="font-heading">Cancel</Button>
				</div>
			</div>

			<div className="h-2 rounded-full bg-muted overflow-hidden">
				<div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
			</div>

			<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
				{sources.map((source, i) => {
					const isCompleted = completedSources.some((s) => s.id === source.id);
					const isCurrent = i === currentSourceIndex && !isCompleted;
					const isPending = i > currentSourceIndex;
					return (
						<div
							key={source.id}
							className={`flex items-center gap-3 px-5 py-3 border-b last:border-b-0 border-border/50 transition-colors ${
								isCurrent ? "bg-primary/5" : isCompleted ? "bg-muted/20" : "bg-transparent"
							}`}
						>
							<div className="w-5 flex justify-center shrink-0">
								{isCurrent ? (
									<LoaderIcon className="size-4 text-primary animate-spin" />
								) : isCompleted ? (
									<CheckCircle2Icon className="size-4 text-emerald-600" />
								) : (
									<div className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-muted-foreground/20" : "bg-muted-foreground"}`} />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className={`text-sm ${isPending ? "text-muted-foreground/40" : ""}`}>{source.name}</div>
								<div className="text-[11px] text-muted-foreground">{source.provider}</div>
							</div>
							<div className="shrink-0">
								{isCurrent ? (
									<span className="text-xs text-primary font-heading font-medium">Querying...</span>
								) : isCompleted ? (
									<span className="text-[10px] font-semibold rounded-md border px-1.5 py-0.5 bg-emerald-500/15 text-emerald-700 border-emerald-500/20">
										{source.category}
									</span>
								) : null}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Report View
   ═══════════════════════════════════════════════════════════════ */

function ReportView({ report, onReset }: { report: HnwReport; onReset: () => void }) {
	const p = report.profile;

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Wealth Intelligence Report
					</p>
					<h3 className="text-xl font-heading font-semibold mt-0.5 tracking-tight">
						{p.name} {p.nameCn && `(${p.nameCn})`}
					</h3>
				</div>
				<div className="flex items-center gap-2">
					<DownloadReportButton report={report} />
					<Button variant="outline" onClick={onReset} className="font-heading">New Assessment</Button>
				</div>
			</div>

			<HnwProfileCard profile={p} />
			<RiskScoreGauge profile={p} />
			<KeyParameters params={report.keyParameters} />
			<CareerTimeline phases={report.careerTimeline} />
			<WealthAccumulationChart phases={report.careerTimeline} />
			<WealthDonutChart wealthByCategory={report.wealthByCategory} totalWealth={report.totalEstimatedWealthUSD} overallConfidence={report.overallConfidence} />
			<CareerPhaseCards phases={report.careerTimeline} />
			<CompanyNetworkGraph nodes={report.companyNodes} profileName={p.name} />
			<NarrativeSection narrative={report.narrative} />
			<SourceCitationsAggregate phases={report.careerTimeline} />
			<FollowUpActions riskRating={p.riskRating} />
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Report Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ─── HNW Profile Card ─── */

function HnwProfileCard({ profile: p }: { profile: HnwProfile }) {
	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-start justify-between mb-5">
				<div className="flex items-center gap-4">
					<div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
						<UserIcon className="size-7 text-primary" />
					</div>
					<div>
						<div className="text-xl font-heading font-semibold tracking-tight">{p.name}</div>
						{p.nameCn && <div className="text-sm text-muted-foreground">{p.nameCn}</div>}
					</div>
				</div>
				<RiskBadge rating={p.riskRating} size="lg" />
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
				<InfoField label="Date of Birth" value={p.dateOfBirth} />
				<InfoField label="Age" value={String(p.age)} />
				<InfoField label="Nationality" value={p.nationality} />
				<InfoField label="Primary Industry" value={p.primaryIndustry} />
				<InfoField label="Residences" value={p.residences.join(", ")} />
				<InfoField label="Est. Net Worth" value={formatUSD(p.estimatedNetWorthUSD)} mono />
				<InfoField label="Net Worth Source" value={p.netWorthSource} />
				<InfoField label="Risk Score" value={`${p.riskScore}/100`} />
			</div>
		</div>
	);
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div>
			<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">{label}</div>
			<div className={`mt-0.5 ${mono ? "font-mono text-xs tracking-wide" : "text-sm"}`}>{value}</div>
		</div>
	);
}

/* ─── Risk Score Gauge ─── */

function RiskScoreGauge({ profile: p }: { profile: HnwProfile }) {
	const score = p.riskScore;
	const angle = (score / 100) * 180;
	const color = score >= 60 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#10b981";
	const riskLabel = score >= 60 ? "High" : score >= 40 ? "Medium" : "Low";
	const bgColor = score >= 60 ? "from-red-500/5 to-red-500/[0.02]" : score >= 40 ? "from-amber-500/5 to-amber-500/[0.02]" : "from-emerald-500/5 to-emerald-500/[0.02]";

	return (
		<div className={`rounded-2xl border border-border bg-gradient-to-br ${bgColor} p-6 shadow-sm`}>
			<div className="flex items-center gap-2 mb-4">
				<GaugeIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Composite Risk Score</p>
			</div>
			<div className="flex items-center gap-8">
				<div className="shrink-0">
					<svg width="160" height="90" viewBox="0 0 160 90">
						<defs>
							<linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
								<stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
								<stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
							</linearGradient>
						</defs>
						<path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="url(#gaugeTrack)" strokeWidth="10" strokeLinecap="round" />
						<path
							d="M 15 80 A 65 65 0 0 1 145 80"
							fill="none"
							stroke={color}
							strokeWidth="10"
							strokeLinecap="round"
							strokeDasharray={`${(angle / 180) * 204} 204`}
						/>
						<text x="80" y="72" textAnchor="middle" className="font-heading" style={{ fontSize: "28px", fontWeight: 700, fill: color }}>{score}</text>
						<text x="80" y="88" textAnchor="middle" style={{ fontSize: "10px", fill: "#9ca3af" }}>/ 100</text>
						<text x="15" y="88" textAnchor="start" style={{ fontSize: "8px", fill: "#10b981" }}>LOW</text>
						<text x="80" y="88" textAnchor="middle" style={{ fontSize: "8px", fill: "#f59e0b" }}></text>
						<text x="145" y="88" textAnchor="end" style={{ fontSize: "8px", fill: "#ef4444" }}>HIGH</text>
					</svg>
				</div>
				<div className="flex-1 space-y-2">
					<div className="text-sm font-heading font-semibold" style={{ color }}>
						{riskLabel} Risk — {score >= 60 ? "Enhanced Due Diligence Required" : score >= 40 ? "Heightened Monitoring Recommended" : "Standard Onboarding Eligible"}
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{p.profileSummary}
					</p>
				</div>
			</div>
		</div>
	);
}

/* ─── Key Parameters ─── */

function KeyParameters({ params }: { params: KeyParameter[] }) {
	const statusStyle = {
		normal: "border-emerald-500/20 bg-emerald-500/5",
		warning: "border-amber-500/20 bg-amber-500/5",
		critical: "border-red-500/20 bg-red-500/5",
	};
	const dotStyle = { normal: "bg-emerald-500", warning: "bg-amber-500", critical: "bg-red-500" };
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<GaugeIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Key Risk Parameters</p>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{params.map((param, i) => (
					<div key={i} className={`rounded-xl border p-3.5 ${statusStyle[param.status]}`}>
						<div className="flex items-center gap-1.5 mb-1.5">
							<div className={`h-1.5 w-1.5 rounded-full ${dotStyle[param.status]}`} />
							<span className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest truncate">{param.label}</span>
						</div>
						<div className="text-sm font-heading font-semibold truncate" title={param.value}>{param.value}</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Career Timeline (horizontal SVG) ─── */

function CareerTimeline({ phases }: { phases: CareerPhase[] }) {
	const svgWidth = 700;
	const svgHeight = 160;
	const marginX = 40;
	const nodeY = 60;
	const nodeRadius = 16;
	const lineY = nodeY;
	const usableWidth = svgWidth - marginX * 2;
	const spacing = phases.length > 1 ? usableWidth / (phases.length - 1) : 0;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<BriefcaseIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Career Timeline</p>
			</div>
			<div className="overflow-x-auto">
				<svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[700px] mx-auto">
					{/* Connection line */}
					<line x1={marginX} y1={lineY} x2={marginX + (phases.length - 1) * spacing} y2={lineY} stroke="#e5e7eb" strokeWidth="2" />

					{phases.map((phase, i) => {
						const x = marginX + i * spacing;
						const wealthColor = phase.phaseWealthUSD < 0 ? "#ef4444" : phase.phaseWealthUSD > 1_000_000_000 ? "#0d9488" : phase.phaseWealthUSD > 1_000_000 ? "#0891b2" : "#6b7280";
						return (
							<g key={phase.id}>
								{/* Filled progress line */}
								{i > 0 && (
									<line
										x1={marginX + (i - 1) * spacing}
										y1={lineY}
										x2={x}
										y2={lineY}
										stroke="#3b82f6"
										strokeWidth="2"
									/>
								)}

								{/* Node */}
								<circle cx={x} cy={nodeY} r={nodeRadius} fill="white" stroke="#3b82f6" strokeWidth="2.5" />
								<text x={x} y={nodeY + 5} textAnchor="middle" className="font-heading" style={{ fontSize: "11px", fontWeight: 700, fill: "#3b82f6" }}>
									{i + 1}
								</text>

								{/* Year range */}
								<text x={x} y={nodeY - 24} textAnchor="middle" style={{ fontSize: "9px", fill: "#6b7280" }}>
									{phase.startYear}–{phase.endYear ?? "Now"}
								</text>

								{/* Title */}
								<text x={x} y={nodeY + 38} textAnchor="middle" className="font-heading" style={{ fontSize: "9px", fontWeight: 600, fill: "#1f2937" }}>
									{phase.title.length > 18 ? phase.title.slice(0, 18) + "..." : phase.title}
								</text>

								{/* Wealth at this phase */}
								<text x={x} y={nodeY + 52} textAnchor="middle" style={{ fontSize: "9px", fontWeight: 600, fill: wealthColor }}>
									{formatUSD(phase.cumulativeWealthUSD)}
								</text>

								{/* Location */}
								<text x={x} y={nodeY + 65} textAnchor="middle" style={{ fontSize: "7px", fill: "#9ca3af" }}>
									{phase.location.length > 20 ? phase.location.slice(0, 20) + "..." : phase.location}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
		</div>
	);
}

/* ─── Wealth Accumulation Chart (stacked bar) ─── */

function WealthAccumulationChart({ phases }: { phases: CareerPhase[] }) {
	const categories: WealthCategory[] = ["income", "companies", "investments", "alternatives", "crypto"];
	const maxWealth = Math.max(...phases.map((p) => p.cumulativeWealthUSD), 1);

	const svgWidth = 700;
	const svgHeight = 280;
	const marginLeft = 70;
	const marginRight = 20;
	const marginTop = 20;
	const marginBottom = 60;
	const chartWidth = svgWidth - marginLeft - marginRight;
	const chartHeight = svgHeight - marginTop - marginBottom;
	const barWidth = Math.min(60, (chartWidth / phases.length) * 0.7);
	const barSpacing = chartWidth / phases.length;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-2">
				<BarChart3Icon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Accumulation by Career Phase</p>
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-3 mb-4">
				{categories.map((cat) => (
					<div key={cat} className="flex items-center gap-1.5">
						<div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
						<span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
					</div>
				))}
			</div>

			<div className="overflow-x-auto">
				<svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[700px] mx-auto">
					{/* Y-axis labels */}
					{[0, 0.25, 0.5, 0.75, 1].map((frac) => {
						const y = marginTop + chartHeight * (1 - frac);
						const val = maxWealth * frac;
						return (
							<g key={frac}>
								<line x1={marginLeft} y1={y} x2={marginLeft + chartWidth} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 2" />
								<text x={marginLeft - 8} y={y + 4} textAnchor="end" style={{ fontSize: "9px", fill: "#9ca3af" }}>
									{formatUSD(val)}
								</text>
							</g>
						);
					})}

					{/* Bars */}
					{phases.map((phase, phaseIdx) => {
						const barX = marginLeft + phaseIdx * barSpacing + (barSpacing - barWidth) / 2;
						let yOffset = 0;

						// Get category totals from the last phase's wealth perspective (cumulative)
						const catTotals: Record<WealthCategory, number> = { income: 0, companies: 0, investments: 0, alternatives: 0, crypto: 0 };
						for (const cat of phase.categories) {
							catTotals[cat.category] += cat.subtotalUSD;
						}
						const phaseTotal = Object.values(catTotals).reduce((s, v) => s + v, 0);

						return (
							<g key={phase.id}>
								{categories.map((cat) => {
									const val = catTotals[cat];
									if (val <= 0) return null;
									const barHeight = (val / maxWealth) * chartHeight;
									const y = marginTop + chartHeight - yOffset - barHeight;
									yOffset += barHeight;
									return (
										<rect
											key={cat}
											x={barX}
											y={y}
											width={barWidth}
											height={barHeight}
											fill={CATEGORY_COLORS[cat]}
											rx="2"
											opacity="0.85"
										/>
									);
								})}

								{/* Phase label */}
								<text
									x={barX + barWidth / 2}
									y={marginTop + chartHeight + 16}
									textAnchor="middle"
									className="font-heading"
									style={{ fontSize: "8px", fontWeight: 600, fill: "#374151" }}
								>
									{phase.title.length > 12 ? phase.title.slice(0, 12) + "..." : phase.title}
								</text>
								<text
									x={barX + barWidth / 2}
									y={marginTop + chartHeight + 28}
									textAnchor="middle"
									style={{ fontSize: "7px", fill: "#9ca3af" }}
								>
									{phase.startYear}–{phase.endYear ?? "Now"}
								</text>

								{/* Value on top */}
								<text
									x={barX + barWidth / 2}
									y={marginTop + chartHeight - yOffset - 4}
									textAnchor="middle"
									style={{ fontSize: "8px", fontWeight: 600, fill: "#374151" }}
								>
									{formatUSD(phaseTotal)}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
		</div>
	);
}

/* ─── Wealth Donut Chart ─── */

function WealthDonutChart({ wealthByCategory, totalWealth, overallConfidence }: {
	wealthByCategory: { category: WealthCategory; totalUSD: number; percentage: number; avgConfidence: number }[];
	totalWealth: number;
	overallConfidence: number;
}) {
	const valueItems = wealthByCategory.filter((w) => w.totalUSD > 0);
	const total = valueItems.reduce((sum, w) => sum + w.totalUSD, 0);

	let cumulativeAngle = 0;
	const segments = valueItems.map((item) => {
		const percentage = total > 0 ? item.totalUSD / total : 0;
		const startAngle = cumulativeAngle;
		const sweep = percentage * 360;
		cumulativeAngle += sweep;
		return { ...item, percentage, startAngle, sweep, color: CATEGORY_COLORS[item.category] };
	});

	const r = 55;
	const cx = 70;
	const cy = 70;

	function arcPath(startDeg: number, sweepDeg: number) {
		const s = ((startDeg - 90) * Math.PI) / 180;
		const e = ((startDeg + sweepDeg - 90) * Math.PI) / 180;
		const x1 = cx + r * Math.cos(s);
		const y1 = cy + r * Math.sin(s);
		const x2 = cx + r * Math.cos(e);
		const y2 = cy + r * Math.sin(e);
		const large = sweepDeg > 180 ? 1 : 0;
		return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<TrendingUpIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Composition</p>
			</div>
			<div className="flex items-center gap-8">
				<div className="shrink-0">
					<svg width="140" height="140" viewBox="0 0 140 140">
						{segments.map((seg, i) => (
							<path
								key={i}
								d={arcPath(seg.startAngle, Math.max(seg.sweep - 2, 0.5))}
								fill="none"
								stroke={seg.color}
								strokeWidth="20"
								strokeLinecap="butt"
							/>
						))}
						<text x="70" y="66" textAnchor="middle" className="font-heading" style={{ fontSize: "16px", fontWeight: 700, fill: "currentColor" }}>
							{formatUSD(totalWealth)}
						</text>
						<text x="70" y="82" textAnchor="middle" style={{ fontSize: "9px", fill: "#9ca3af" }}>
							{overallConfidence}% confidence
						</text>
					</svg>
				</div>

				<div className="flex-1 space-y-2">
					{segments.map((seg) => (
						<div key={seg.category} className="flex items-center gap-3">
							<div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<span className="text-sm font-heading font-medium truncate">{CATEGORY_LABELS[seg.category]}</span>
									<span className="text-sm font-heading font-bold tabular-nums ml-2">{formatUSD(seg.totalUSD)}</span>
								</div>
								<div className="flex items-center gap-2 mt-0.5">
									<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
										<div className="h-full rounded-full" style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }} />
									</div>
									<span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{seg.percentage.toFixed(1)}%</span>
									<span className="text-[10px] text-muted-foreground tabular-nums w-12 text-right">{seg.avgConfidence}% conf</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── Career Phase Cards ─── */

function CareerPhaseCards({ phases }: { phases: CareerPhase[] }) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<BookOpenIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Career Phase Detail</p>
			</div>
			<div className="space-y-3">
				{phases.map((phase, idx) => {
					const isExpanded = expandedId === phase.id;
					return (
						<div key={phase.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
							<button
								onClick={() => setExpandedId(isExpanded ? null : phase.id)}
								className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-accent/20 transition-colors"
							>
								<div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
									<span className="text-sm font-heading font-bold text-primary">{idx + 1}</span>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="font-heading font-semibold">{phase.title}</span>
										{phase.organization && <span className="text-xs text-muted-foreground">— {phase.organization}</span>}
									</div>
									<div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
										<span>{phase.startYear}–{phase.endYear ?? "Present"}</span>
										<span>·</span>
										<span>{phase.location}</span>
										<span>·</span>
										<span className="font-heading font-semibold text-foreground">{formatUSD(phase.cumulativeWealthUSD)} cumulative</span>
									</div>
								</div>
								<ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
							</button>

							{isExpanded && (
								<div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
									<p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>

									{/* Key Events */}
									{phase.keyEvents.length > 0 && (
										<div>
											<div className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-2">Key Events</div>
											<div className="space-y-1">
												{phase.keyEvents.map((event, i) => (
													<div key={i} className="flex items-start gap-2 text-xs">
														<CircleDotIcon className="size-3 text-primary mt-0.5 shrink-0" />
														<span>{event}</span>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Wealth Claims by Category */}
									{phase.categories.map((cat) => (
										<div key={cat.category} className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[cat.category] }} />
													<span className="text-xs font-heading font-semibold">{CATEGORY_LABELS[cat.category]}</span>
												</div>
												<div className="flex items-center gap-3">
													<span className="text-xs font-heading font-bold">{formatUSD(cat.subtotalUSD)}</span>
													<ConfidenceBar value={cat.avgConfidence} />
												</div>
											</div>
											<div className="space-y-2 ml-4">
												{cat.claims.map((claim) => (
													<WealthClaimRow key={claim.id} claim={claim} />
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Wealth Claim Row ─── */

function WealthClaimRow({ claim }: { claim: WealthClaim }) {
	return (
		<div className="rounded-lg border border-border/40 bg-card p-3 space-y-1.5">
			<div className="flex items-start justify-between gap-2">
				<p className="text-xs text-foreground leading-relaxed flex-1">{claim.description}</p>
				<span className="text-xs font-heading font-bold tabular-nums shrink-0 text-right">{formatUSD(claim.estimatedValueUSD)}</span>
			</div>
			<div className="flex items-center gap-3">
				<ConfidenceBar value={claim.confidence} />
				<div className="flex items-center gap-1.5 flex-wrap">
					{claim.sources.map((src) => (
						<SourceBadge key={src.id} source={src} />
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── Confidence Bar ─── */

function ConfidenceBar({ value }: { value: number }) {
	const color = value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
	return (
		<div className="flex items-center gap-1.5 shrink-0">
			<div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
				<div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
			</div>
			<span className="text-[10px] font-heading font-semibold tabular-nums" style={{ color }}>{value}%</span>
		</div>
	);
}

/* ─── Source Badge ─── */

function SourceBadge({ source }: { source: SourceCitation }) {
	const typeColors: Record<string, string> = {
		filing: "bg-blue-500/15 text-blue-700 border-blue-500/20",
		news: "bg-purple-500/15 text-purple-700 border-purple-500/20",
		registry: "bg-teal-500/15 text-teal-700 border-teal-500/20",
		"market-data": "bg-cyan-500/15 text-cyan-700 border-cyan-500/20",
		"public-record": "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
		estimate: "bg-amber-500/15 text-amber-700 border-amber-500/20",
	};
	const typeIcons: Record<string, typeof FileTextIcon> = {
		filing: FileTextIcon,
		news: ExternalLinkIcon,
		registry: BuildingIcon,
		"market-data": TrendingUpIcon,
		"public-record": ShieldCheckIcon,
		estimate: SparklesIcon,
	};
	const Icon = typeIcons[source.type] ?? FileTextIcon;
	const colorClass = typeColors[source.type] ?? typeColors.estimate;

	return (
		<span className={`inline-flex items-center gap-1 text-[9px] font-semibold rounded-md border px-1.5 py-0.5 ${colorClass}`} title={source.label}>
			<Icon className="size-2.5" />
			{source.label.length > 30 ? source.label.slice(0, 30) + "..." : source.label}
		</span>
	);
}

/* ─── Company Network Graph ─── */

function CompanyNetworkGraph({ nodes, profileName }: { nodes: CompanyNode[]; profileName: string }) {
	const statusColor: Record<string, { fill: string; stroke: string; text: string; badge: string }> = {
		active: { fill: "#f0fdf4", stroke: "#86efac", text: "#166534", badge: "Active" },
		ipo: { fill: "#eff6ff", stroke: "#93c5fd", text: "#1e40af", badge: "IPO" },
		exited: { fill: "#fefce8", stroke: "#fde047", text: "#854d0e", badge: "Exited" },
		restructured: { fill: "#fef3c7", stroke: "#fcd34d", text: "#92400e", badge: "Restructured" },
		delisted: { fill: "#fef2f2", stroke: "#fca5a5", text: "#991b1b", badge: "Delisted" },
	};

	const personX = 250;
	const personY = nodes.length > 3 ? 140 : 100;
	const svgH = nodes.length > 3 ? 320 : 230;

	// Position nodes in a circle around the person
	const nodePositions = nodes.map((_, i) => {
		const angleStep = (2 * Math.PI) / nodes.length;
		const angle = angleStep * i - Math.PI / 2;
		const rx = 170;
		const ry = nodes.length > 3 ? 110 : 80;
		return {
			x: personX + rx * Math.cos(angle) - 60,
			y: personY + ry * Math.sin(angle) - 20,
		};
	});

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<NetworkIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Related Entity Network</p>
			</div>
			<div className="overflow-x-auto">
				<svg width="500" height={svgH} viewBox={`0 0 500 ${svgH}`} className="w-full max-w-[500px] mx-auto">
					<defs>
						<filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="130%">
							<feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
						</filter>
					</defs>

					{nodes.map((node, i) => {
						const pos = nodePositions[i];
						const sc = statusColor[node.status] ?? statusColor.active;
						const midX = (personX + pos.x + 60) / 2;
						const midY = (personY + pos.y + 20) / 2;

						return (
							<g key={i}>
								{/* Connection line */}
								<line
									x1={personX} y1={personY}
									x2={pos.x + 60} y2={pos.y + 20}
									stroke={sc.stroke}
									strokeWidth="2"
									strokeDasharray={node.status === "exited" || node.status === "delisted" ? "6 4" : "none"}
									opacity="0.6"
								/>
								{/* Role label on line */}
								<rect x={midX - 40} y={midY - 8} width="80" height="16" rx="8" fill="white" stroke={sc.stroke} strokeWidth="1" />
								<text x={midX} y={midY + 4} textAnchor="middle" style={{ fontSize: "6px", fill: "#6b7280" }}>
									{node.role.length > 25 ? node.role.slice(0, 25) + "..." : node.role}
								</text>
							</g>
						);
					})}

					{/* Person node */}
					<circle cx={personX} cy={personY} r="24" fill="white" stroke="#3b82f6" strokeWidth="2.5" filter="url(#nodeShadow)" />
					<circle cx={personX} cy={personY - 6} r="6" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
					<path d={`M ${personX - 10} ${personY + 10} Q ${personX} ${personY + 2} ${personX + 10} ${personY + 10}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
					<text x={personX} y={personY + 36} textAnchor="middle" className="font-heading" style={{ fontSize: "10px", fontWeight: 600, fill: "#1e40af" }}>
						{profileName}
					</text>

					{/* Company nodes */}
					{nodes.map((node, i) => {
						const pos = nodePositions[i];
						const sc = statusColor[node.status] ?? statusColor.active;
						const lines = node.name.split(/(?<=\s)/);
						const displayName = node.name.length > 22 ? node.name.slice(0, 22) + "..." : node.name;

						return (
							<g key={`node-${i}`}>
								<rect x={pos.x} y={pos.y} width="120" height="50" rx="10" fill={sc.fill} stroke={sc.stroke} strokeWidth="1.5" filter="url(#nodeShadow)" />
								<text x={pos.x + 60} y={pos.y + 20} textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: sc.text }}>
									{displayName}
								</text>
								{node.ownership && (
									<text x={pos.x + 60} y={pos.y + 31} textAnchor="middle" style={{ fontSize: "7px", fill: "#6b7280" }}>
										{node.ownership}
									</text>
								)}
								<rect x={pos.x + 20} y={pos.y + 37} width="80" height="14" rx="7" fill={sc.stroke} opacity="0.3" />
								<text x={pos.x + 60} y={pos.y + 47} textAnchor="middle" style={{ fontSize: "7px", fontWeight: 600, fill: sc.text }}>
									{sc.badge}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
		</div>
	);
}

/* ─── Narrative Section ─── */

function NarrativeSection({ narrative }: { narrative: string }) {
	const [expanded, setExpanded] = useState(false);
	const paragraphs = narrative.split("\n\n");
	const preview = paragraphs.slice(0, 2);

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<FileTextIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Narrative</p>
			</div>
			<div className="space-y-3">
				{(expanded ? paragraphs : preview).map((para, i) => (
					<p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
				))}
			</div>
			{paragraphs.length > 2 && (
				<button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs text-primary font-heading font-medium flex items-center gap-1 hover:underline">
					{expanded ? "Show less" : `Show more (${paragraphs.length - 2} more paragraphs)`}
					<ChevronDownIcon className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
				</button>
			)}
		</div>
	);
}

/* ─── Source Citations Aggregate ─── */

function SourceCitationsAggregate({ phases }: { phases: CareerPhase[] }) {
	const allSources = new Map<string, SourceCitation>();
	for (const phase of phases) {
		for (const cat of phase.categories) {
			for (const claim of cat.claims) {
				for (const src of claim.sources) {
					allSources.set(src.id, src);
				}
			}
		}
	}
	const sources = Array.from(allSources.values());

	const typeLabels: Record<string, string> = {
		filing: "Regulatory Filing",
		news: "News Report",
		registry: "Corporate Registry",
		"market-data": "Market Data",
		"public-record": "Public Record",
		estimate: "Estimate / Analysis",
	};

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<LinkIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Source Citations ({sources.length})
				</p>
			</div>
			<div className="space-y-2">
				{sources.map((src, i) => (
					<div key={src.id} className="flex items-start gap-3 text-xs">
						<span className="text-muted-foreground/40 font-mono tabular-nums shrink-0 w-5 text-right">{i + 1}.</span>
						<div className="flex-1 min-w-0">
							<span className="font-medium">{src.label}</span>
							{src.date && <span className="text-muted-foreground ml-2">({src.date})</span>}
							<span className="ml-2 text-[9px] font-semibold rounded-md border px-1 py-0.5 bg-muted/50 text-muted-foreground border-border/60">
								{typeLabels[src.type] ?? src.type}
							</span>
							{src.url && (
								<a href={src.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline inline-flex items-center gap-0.5">
									<ExternalLinkIcon className="size-2.5" />
									Link
								</a>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Follow-Up Actions ─── */

function FollowUpActions({ riskRating }: { riskRating: "Low" | "Medium" | "High" }) {
	const actions = riskRating === "High"
		? [
			{ id: "edd", label: "Enhanced Due Diligence Review", description: "Requires senior compliance officer review before onboarding" },
			{ id: "verify", label: "Verify Crypto Holdings On-chain", description: "Cross-reference declared token holdings with blockchain explorer data" },
			{ id: "monitor", label: "Set Weekly Monitoring", description: "Enable weekly screening for price movements, adverse media, and regulatory changes" },
		]
		: riskRating === "Medium"
		? [
			{ id: "monitor", label: "Set Monthly Monitoring", description: "Enable monthly screening for adverse media and regulatory changes" },
			{ id: "review", label: "Schedule Periodic Review", description: "Set next review date per enhanced monitoring policy" },
			{ id: "docs", label: "Request Supporting Documents", description: "Obtain additional documentation for lower-confidence wealth claims" },
		]
		: [
			{ id: "approve", label: "Approve for Onboarding", description: "All checks passed — eligible for standard onboarding" },
			{ id: "monitor", label: "Set Quarterly Monitoring", description: "Enable quarterly screening per standard monitoring policy" },
		];

	const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-4">
				<CheckCircle2Icon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Recommended Actions</p>
			</div>
			<div className="space-y-3">
				{actions.map((action) => {
					const done = confirmed.has(action.id);
					return (
						<div key={action.id} className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"}`}>
							<button
								onClick={() => setConfirmed((prev) => new Set(prev).add(action.id))}
								disabled={done}
								className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
									done ? "bg-emerald-500 border-emerald-500" : "border-border hover:border-primary/50"
								}`}
							>
								{done && <CheckIcon className="size-3.5 text-white" />}
							</button>
							<div>
								<div className={`text-sm font-heading font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{action.label}</div>
								<p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Download Report Button ─── */

function DownloadReportButton({ report }: { report: HnwReport }) {
	const download = () => {
		const p = report.profile;
		const riskColor = p.riskScore >= 60 ? "#dc2626" : p.riskScore >= 40 ? "#d97706" : "#16a34a";
		const riskBg = p.riskScore >= 60 ? "#fef2f2" : p.riskScore >= 40 ? "#fefce8" : "#f0fdf4";
		const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

		const paramRows = report.keyParameters.map((param) => {
			const color = param.status === "critical" ? "#dc2626" : param.status === "warning" ? "#d97706" : "#16a34a";
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${param.label}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:${color}">${param.value}</td></tr>`;
		}).join("");

		const wealthRows = report.wealthByCategory.filter((w) => w.totalUSD > 0).map((w) => {
			const confColor = w.avgConfidence >= 70 ? "#16a34a" : w.avgConfidence >= 40 ? "#d97706" : "#dc2626";
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${CATEGORY_LABELS[w.category]}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${formatUSD(w.totalUSD)}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;">${w.percentage.toFixed(1)}%</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;color:${confColor};font-weight:600;">${w.avgConfidence}%</td></tr>`;
		}).join("");

		const timelineRows = report.careerTimeline.map((phase) => {
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${phase.startYear}-${phase.endYear ?? "Present"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:600;">${phase.title}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${phase.organization ?? ""}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${phase.location}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;font-family:monospace;">${formatUSD(phase.cumulativeWealthUSD)}</td></tr>`;
		}).join("");

		const narrativeHtml = report.narrative.split("\n\n").map((para) => `<p style="margin:0 0 12px 0;font-size:13px;line-height:1.7;color:#374151;">${para}</p>`).join("");

		const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>HNW Wealth Report - ${p.name}</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap');@media print{body{margin:0}.page-break{page-break-before:always}}body{font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#1f2937;max-width:800px;margin:0 auto;padding:40px 32px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px 12px;background:#f3f4f6;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:2px solid #d1d5db;font-family:'Inter',sans-serif}h1{font-size:22px;margin:0;font-family:'Inter',sans-serif}h2{font-size:16px;margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #e5e7eb;color:#111827;text-transform:uppercase;letter-spacing:.04em;font-family:'Inter',sans-serif}</style></head><body>
<div style="border-bottom:3px solid #1e3a5f;padding-bottom:16px;margin-bottom:24px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#6b7280;margin-bottom:4px">Confidential — HNW Wealth Intelligence</div><h1>Source of Wealth Assessment Report</h1><div style="font-size:13px;color:#6b7280;margin-top:6px">Subject: ${p.name}${p.nameCn ? ` (${p.nameCn})` : ""} | Generated: ${now}</div></div>
<div style="display:flex;gap:16px;margin-bottom:24px"><div style="flex:1;padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Risk Rating</div><div style="font-size:18px;font-weight:700;color:${riskColor};margin-top:2px">${p.riskRating} (${p.riskScore}/100)</div></div><div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Est. Net Worth</div><div style="font-size:18px;font-weight:700;margin-top:2px">${formatUSD(report.totalEstimatedWealthUSD)}</div></div><div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Overall Confidence</div><div style="font-size:18px;font-weight:700;margin-top:2px">${report.overallConfidence}%</div></div></div>
<h2>1. Subject Profile</h2><table><tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:160px">Full Name</td><td style="padding:4px 0;font-size:13px">${p.name}${p.nameCn ? ` (${p.nameCn})` : ""}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Date of Birth</td><td style="padding:4px 0;font-size:13px">${p.dateOfBirth} (Age ${p.age})</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Nationality</td><td style="padding:4px 0;font-size:13px">${p.nationality}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Residences</td><td style="padding:4px 0;font-size:13px">${p.residences.join(", ")}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Primary Industry</td><td style="padding:4px 0;font-size:13px">${p.primaryIndustry}</td></tr></table>
<h2>2. Key Risk Parameters</h2><table><tr><th>Parameter</th><th>Assessment</th></tr>${paramRows}</table>
<h2>3. Wealth Composition</h2><table><tr><th>Category</th><th style="text-align:right">Value (USD)</th><th style="text-align:right">Allocation</th><th style="text-align:center">Confidence</th></tr>${wealthRows}</table>
<div class="page-break"></div>
<h2>4. Career Timeline</h2><table><tr><th>Period</th><th>Phase</th><th>Organization</th><th>Location</th><th style="text-align:right">Cumulative Wealth</th></tr>${timelineRows}</table>
<h2>5. Wealth Narrative</h2>${narrativeHtml}
<div style="border-top:2px solid #e5e7eb;margin-top:32px;padding-top:16px;font-size:11px;color:#9ca3af">This report was generated using verified data from international registries, regulatory filings, market data providers, and on-chain analysis. All source citations are included in the assessment. This document is for internal compliance use only.<br><br>Generated: ${now}</div>
</body></html>`;

		const blob = new Blob([html], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `HNW_Report_${p.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<Button variant="outline" onClick={download} className="gap-1.5 font-heading">
			<DownloadIcon className="size-3.5" />
			Download Report
		</Button>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Shared UI Components
   ═══════════════════════════════════════════════════════════════ */

function RiskBadge({ rating, size = "sm" }: { rating: "Low" | "Medium" | "High"; size?: "sm" | "lg" }) {
	const colors: Record<string, string> = {
		Low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
		Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
		High: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
	};
	const sizeClass = size === "lg" ? "text-xs px-3 py-1" : "text-[10px] px-1.5 py-0.5";
	return <span className={`font-semibold rounded-md border ${colors[rating]} ${sizeClass}`}>{rating} Risk</span>;
}

function MonitoringStatusBadge({ status }: { status: "Active" | "Under Review" | "Flagged" }) {
	const styles: Record<string, string> = {
		Active: "text-emerald-700",
		"Under Review": "text-amber-700",
		Flagged: "text-red-700",
	};
	const icons: Record<string, typeof ShieldIcon> = {
		Active: ShieldIcon,
		"Under Review": EyeIcon,
		Flagged: AlertTriangleIcon,
	};
	const Icon = icons[status] ?? ShieldIcon;
	return (
		<span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${styles[status]}`}>
			<Icon className="size-3" />
			{status}
		</span>
	);
}
