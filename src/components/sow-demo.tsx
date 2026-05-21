"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	CameraIcon,
	ClipboardListIcon,
	UploadIcon,
	FileCheckIcon,
	FileWarningIcon,
	FileXIcon,
	ArrowLeftRightIcon,
	FilePlusIcon,
	MessageSquareIcon,
	SendIcon,
	XIcon,
	Trash2Icon,
	BotIcon,
	ZapIcon,
	RotateCwIcon,
	AlertCircleIcon,
	CpuIcon,
	MailIcon,
	CopyIcon,
	CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
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
	type SourceScreenshot,
	type SourceAuditTrail,
	type CompanySearchTemplate,
	type ClientDocument,
	type CrossReference,
	type DocumentUploadSlot,
	type ChatMessage,
	type ChatReminder,
	type CaseAttentionArea,
	type CorroborationScores,
	type AgentVerification,
	type CorroborationGrade,
	type GradeConfig,
	type FourEyeCheck,
	type PersonalRelationship,
	GRADE_CONFIGS,
	getCorroborationGrade,
	CHATBOT_ATTENTION_AREAS,
	CHATBOT_REMINDERS,
	CHATBOT_INITIAL_MESSAGES,
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
	const avgConfidence = Math.round(monitoring.reduce((sum, m) => sum + m.overallConfidence, 0) / monitoring.length);
	const avgGrade = getCorroborationGrade(avgConfidence);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-heading font-semibold tracking-tight">HNW Wealth Intelligence</h2>
					<p className="text-sm text-muted-foreground mt-0.5">Source of Wealth monitoring and assessment for high net worth individuals · Powered by <span className="text-primary font-semibold">Fill Easy</span></p>
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
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Compliance Summary</p>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
					<div>
						<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Avg. Grade</div>
						<div className="mt-0.5 flex items-center gap-2">
							<GradeBadge grade={avgGrade.grade} confidence={avgConfidence} />
						</div>
					</div>
					<div>
						<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Profiles Verified</div>
						<div className="mt-0.5 font-heading font-semibold">5 / {profilesMonitored}</div>
					</div>
					<div>
						<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Data Sources</div>
						<div className="mt-0.5 font-heading font-semibold">20 per subject</div>
					</div>
					<div>
						<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Coverage</div>
						<div className="mt-0.5 font-heading font-semibold text-emerald-700">Multi-jurisdictional</div>
						<div className="mt-1 text-[10px] text-primary/70 font-medium">via Fill Easy 80+ registries</div>
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
						<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Notifications</p>
						{unreadCount > 0 && (
							<span className="text-[11px] font-bold rounded-full px-1.5 py-0.5 bg-red-500 text-white min-w-[18px] text-center">{unreadCount}</span>
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
				<p className="text-xs text-muted-foreground/60 text-right tracking-wide">
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
				<span className="text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
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
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">HNW Monitoring</p>
					<span className="text-[11px] font-bold rounded-full px-1.5 py-0.5 bg-primary/15 text-primary min-w-[18px] text-center">
						{entries.length} active
					</span>
				</div>
				<div className="flex items-center gap-2 text-xs">
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
							<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Grade</th>
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
									{entry.nameCn && <div className="text-xs text-muted-foreground/60">{entry.nameCn}</div>}
								</td>
								<td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{entry.industry}</td>
								<td className="px-4 py-3 text-right hidden sm:table-cell">
									<span className="font-mono text-xs font-medium">{formatUSD(entry.estimatedNetWorthUSD)}</span>
								</td>
								<td className="px-4 py-3 text-center">
									<RiskBadge rating={entry.riskRating} />
								</td>
								<td className="px-4 py-3 text-center">
									<GradeBadge grade={entry.corroborationGrade} confidence={entry.overallConfidence} />
								</td>
								<td className="px-4 py-3 text-center hidden sm:table-cell">
									<span className="text-xs text-muted-foreground">{entry.lastScreened}</span>
								</td>
								<td className="px-4 py-3 text-center">
									{entry.openAlerts > 0 ? (
										<span className="text-xs font-bold rounded-full px-2 py-0.5 bg-red-500/15 text-red-700">{entry.openAlerts}</span>
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
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">PEP / Sanctions / Watchlist Screening</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">PEP Hits</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${totalPep > 0 ? "text-amber-600" : "text-emerald-600"}`}>{totalPep}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Sanctions Hits</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${totalSanctions > 0 ? "text-red-600" : "text-emerald-600"}`}>{totalSanctions}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Adverse Media</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${totalAdverse > 0 ? "text-amber-600" : "text-emerald-600"}`}>{totalAdverse}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Flagged</div>
					<div className={`text-2xl font-heading font-bold mt-1 tabular-nums ${flaggedCount > 0 ? "text-red-600" : "text-emerald-600"}`}>{flaggedCount}</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3 shadow-sm">
					<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Review Req.</div>
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
										{entry.subjectNameCn && <div className="text-xs text-muted-foreground/60">{entry.subjectNameCn}</div>}
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
										<span className={`text-xs font-semibold rounded-md border px-1.5 py-0.5 whitespace-nowrap ${statusColor[entry.overallStatus]}`}>{entry.overallStatus}</span>
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
						<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Subject Profile</p>
					</div>
					<div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Est. Net Worth</div>
							<div className="mt-0.5 font-heading font-bold text-lg">{formatUSD(entry.estimatedNetWorthUSD)}</div>
						</div>
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Risk Rating</div>
							<div className={`mt-0.5 font-heading font-bold text-lg ${entry.riskRating === "High" ? "text-red-600" : entry.riskRating === "Medium" ? "text-amber-600" : "text-emerald-600"}`}>{entry.riskRating}</div>
						</div>
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Industry</div>
							<div className="mt-0.5">{entry.industry}</div>
						</div>
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Screening Freq.</div>
							<div className="mt-0.5 font-heading font-semibold text-primary">{entry.screeningFrequency}</div>
						</div>
					</div>
				</div>

				{/* Monitoring Config */}
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
					<div className="flex items-center gap-2">
						<RadarIcon className="size-4 text-primary" />
						<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Monitoring Configuration</p>
					</div>
					<div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Last Screened</div>
							<div className="mt-0.5">{entry.lastScreened}</div>
						</div>
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Frequency</div>
							<div className="mt-0.5 font-heading font-semibold">{entry.screeningFrequency}</div>
						</div>
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Open Alerts</div>
							<div className={`mt-0.5 font-heading font-bold ${entry.openAlerts > 0 ? "text-red-600" : "text-emerald-600"}`}>{entry.openAlerts}</div>
						</div>
						<div>
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Status</div>
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
						<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Screening Results</p>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">PEP Hits</div>
							<div className={`text-xl font-heading font-bold mt-1 ${screening.pepHits > 0 ? "text-amber-600" : "text-emerald-600"}`}>{screening.pepHits}</div>
						</div>
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Sanctions</div>
							<div className={`text-xl font-heading font-bold mt-1 ${screening.sanctionsHits > 0 ? "text-red-600" : "text-emerald-600"}`}>{screening.sanctionsHits}</div>
						</div>
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Adverse Media</div>
							<div className={`text-xl font-heading font-bold mt-1 ${screening.adverseMedia > 0 ? "text-amber-600" : "text-emerald-600"}`}>{screening.adverseMedia}</div>
						</div>
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3">
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">Lists Checked</div>
							<div className="text-xl font-heading font-bold mt-1">{screening.listsChecked.length}</div>
						</div>
					</div>
					{screening.pepDetails && (
						<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
							<div className="text-[11px] font-heading text-amber-700 uppercase tracking-widest mb-1">PEP Details</div>
							<p className="text-sm text-amber-900/80 leading-relaxed">{screening.pepDetails}</p>
						</div>
					)}
					{screening.adverseMediaDetails && (
						<div className="rounded-xl border border-border/60 bg-muted/20 p-4">
							<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest mb-1">Adverse Media Details</div>
							<p className="text-sm text-muted-foreground leading-relaxed">{screening.adverseMediaDetails}</p>
						</div>
					)}
				</div>
			)}

			{/* Related notifications */}
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<BellRingIcon className="size-4 text-amber-500" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Recent Activity</p>
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
						<span className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</span>
						{!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
					</div>
					<p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{n.detail}</p>
					<div className="flex items-center gap-2 mt-1.5">
						<span className="text-[11px] text-muted-foreground/50">{n.time}</span>
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
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-1">
						Select Subject for Assessment
					</p>
					<p className="text-sm text-muted-foreground">
						Choose a high net worth individual to run a comprehensive Source of Wealth assessment with career-traced wealth analysis, powered by Fill Easy multi-registry intelligence.
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
									<GradeBadge grade={report.corroborationGrade} confidence={report.overallConfidence} />
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
									<div className="text-[11px] text-muted-foreground uppercase tracking-widest">Net Worth</div>
									<div className="font-heading font-bold text-sm">{formatUSD(p.estimatedNetWorthUSD)}</div>
								</div>
								<div className="rounded-lg bg-muted/60 px-2.5 py-1">
									<div className="text-[11px] text-muted-foreground uppercase tracking-widest">Confidence</div>
									<div className="font-heading font-bold text-sm">{report.overallConfidence}%</div>
								</div>
								<div className="rounded-lg bg-muted/60 px-2.5 py-1">
									<div className="text-[11px] text-muted-foreground uppercase tracking-widest">Risk Score</div>
									<div className="font-heading font-bold text-sm">{p.riskScore}/100</div>
								</div>
							</div>

							<p className="text-sm text-muted-foreground/70 leading-relaxed">
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
						Querying {sources.length} international data sources across multiple jurisdictions via <span className="text-primary font-semibold">Fill Easy</span> APIs
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
								<div className="text-sm text-muted-foreground">{source.provider}</div>
							</div>
							<div className="shrink-0">
								{isCurrent ? (
									<span className="text-xs text-primary font-heading font-medium">Querying...</span>
								) : isCompleted ? (
									<span className="text-xs font-semibold rounded-md border px-1.5 py-0.5 bg-emerald-500/15 text-emerald-700 border-emerald-500/20">
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
	const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Wealth Intelligence Report
					</p>
					<h3 className="text-xl font-heading font-semibold mt-0.5 tracking-tight">
						{p.name} {p.nameCn && `(${p.nameCn})`}
					</h3>
					<p className="text-xs text-muted-foreground mt-1">
						Generated by <span className="text-primary font-semibold">Fill Easy</span> Wealth Intelligence Engine · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<DownloadReportButton report={report} />
					<Button variant="outline" onClick={onReset} className="font-heading">New Assessment</Button>
				</div>
			</div>

			<HnwProfileCard profile={p} grade={report.corroborationGrade} confidence={report.overallConfidence} />
			<FourEyeCheckSection check={report.fourEyeCheck} />
			<CorroborationRiskScore profile={p} scores={report.corroborationScores} grade={report.corroborationGrade} />
			<KeyParameters params={report.keyParameters} />
			<CareerTimeline phases={report.careerTimeline} />
			<WealthAccumulationChart phases={report.careerTimeline} />
			<WealthDonutChart wealthByCategory={report.wealthByCategory} totalWealth={report.totalEstimatedWealthUSD} overallConfidence={report.overallConfidence} />
			<CareerPhaseCards phases={report.careerTimeline} onSourceClick={setSelectedSource} />
			<PersonalRelationshipsSection relationships={report.personalRelationships} profileName={p.name} />
			<CompanyNetworkGraph nodes={report.companyNodes} profileName={p.name} />
			<NarrativeSection narrative={report.narrative} report={report} />
			<CrossLLMValidationSection report={report} />
			<SourceCitationsAggregate phases={report.careerTimeline} onSourceClick={setSelectedSource} />
			<ClientDocumentsSection documents={report.clientDocuments} />
			<CrossReferenceTable crossRefs={report.crossReferences} />
			<DocumentUploadSlotsSection slots={report.uploadSlots} />
			{/* Fill Easy Data Sources Banner */}
			<div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
							<ShieldCheckIcon className="size-6 text-primary" />
						</div>
						<div>
							<div className="font-heading font-semibold text-sm">Powered by Fill Easy API Suite</div>
							<p className="text-xs text-muted-foreground mt-0.5">Corporate registries, government verification, and cross-border intelligence across 80+ jurisdictions</p>
						</div>
					</div>
					<div className="hidden sm:flex items-center gap-4">
						<div className="text-center">
							<div className="text-xs font-heading font-bold text-primary">CorpVerify</div>
							<div className="text-[10px] text-muted-foreground">Company Registry</div>
						</div>
						<div className="h-8 w-px bg-border" />
						<div className="text-center">
							<div className="text-xs font-heading font-bold text-primary">GovVerify</div>
							<div className="text-[10px] text-muted-foreground">Identity & IDV</div>
						</div>
						<div className="h-8 w-px bg-border" />
						<div className="text-center">
							<div className="text-xs font-heading font-bold text-primary">China Cross-Border</div>
							<div className="text-[10px] text-muted-foreground">SAMR · MPS · Judicial</div>
						</div>
					</div>
				</div>
			</div>
			<FollowUpActions riskRating={p.riskRating} />
			<AgentVerifySection verification={report.agentVerification} corroborationScores={report.corroborationScores} />

			{/* Source Detail Modal */}
			<SourceDetailModal source={selectedSource} onClose={() => setSelectedSource(null)} />

			{/* Compliance Chatbot */}
			<ComplianceChatbot profileId={p.id} profileName={p.name} riskRating={p.riskRating} report={report} />
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   Report Sub-Components
   ═══════════════════════════════════════════════════════════════ */

/* ─── HNW Profile Card ─── */

function HnwProfileCard({ profile: p, grade, confidence }: { profile: HnwProfile; grade?: CorroborationGrade; confidence?: number }) {
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
				<div className="flex items-center gap-2">
					{grade && <GradeBadge grade={grade} confidence={confidence} size="lg" />}
					<RiskBadge rating={p.riskRating} size="lg" />
				</div>
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
			<div className="text-[11px] font-heading text-muted-foreground uppercase tracking-widest">{label}</div>
			<div className={`mt-0.5 ${mono ? "font-mono text-xs tracking-wide" : "text-sm"}`}>{value}</div>
		</div>
	);
}

/* ─── 4-Eye Check ─── */

function FourEyeCheckSection({ check }: { check: FourEyeCheck }) {
	const steps = ["drafted", "reviewed", "approved", "released"] as const;
	const stepLabels = { drafted: "Drafted", reviewed: "Reviewed", approved: "Approved", released: "Released" };
	const currentIdx = steps.indexOf(check.status);

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
					<ShieldCheckIcon className="size-4 text-primary" />
				</div>
				<div>
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">4-Eye Check</p>
				</div>
			</div>

			{/* Status pipeline */}
			<div className="flex items-center justify-between mb-6 px-2">
				{steps.map((step, idx) => {
					const isCompleted = idx <= currentIdx;
					const isCurrent = idx === currentIdx;
					return (
						<div key={step} className="flex items-center flex-1">
							<div className="flex flex-col items-center gap-1.5">
								<div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
									isCompleted ? (isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-primary/80 text-primary-foreground") : "bg-muted border-2 border-border text-muted-foreground"
								}`}>
									{isCompleted && !isCurrent ? <CheckIcon className="size-4" /> : idx + 1}
								</div>
								<span className={`text-[10px] font-heading font-semibold uppercase tracking-wider ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
									{stepLabels[step]}
								</span>
							</div>
							{idx < steps.length - 1 && (
								<div className={`flex-1 h-0.5 mx-2 rounded-full ${idx < currentIdx ? "bg-primary/60" : "bg-border"}`} />
							)}
						</div>
					);
				})}
			</div>

			{/* Analyst & Reviewer cards */}
			<div className="grid grid-cols-2 gap-4 mb-5">
				<div className="rounded-xl border border-border bg-muted/30 p-4">
					<div className="flex items-center gap-2 mb-2">
						<UserIcon className="size-4 text-primary" />
						<span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-muted-foreground">Analyst</span>
					</div>
					<div className="font-heading font-semibold text-sm">{check.analyst.name}</div>
					<div className="text-xs text-muted-foreground mt-0.5">{check.analyst.role}</div>
					<div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
						<ClockIcon className="size-3" />{check.analyst.timestamp}
					</div>
				</div>
				<div className="rounded-xl border border-border bg-muted/30 p-4">
					<div className="flex items-center gap-2 mb-2">
						<ShieldCheckIcon className="size-4 text-primary" />
						<span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-muted-foreground">Reviewer</span>
					</div>
					{check.reviewer ? (
						<>
							<div className="font-heading font-semibold text-sm">{check.reviewer.name}</div>
							<div className="text-xs text-muted-foreground mt-0.5">{check.reviewer.role}</div>
							<div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
								<ClockIcon className="size-3" />{check.reviewer.timestamp}
							</div>
						</>
					) : (
						<div className="text-sm text-muted-foreground italic">Pending reviewer assignment</div>
					)}
				</div>
			</div>

			{/* Sign-off history */}
			{check.signOffHistory.length > 0 && (
				<div>
					<p className="text-[10px] font-heading font-semibold uppercase tracking-widest text-muted-foreground mb-3">Sign-off History</p>
					<div className="space-y-2">
						{check.signOffHistory.map((entry, idx) => (
							<div key={idx} className="flex items-start gap-3 text-xs">
								<div className="mt-1 h-2 w-2 rounded-full bg-primary/60 shrink-0" />
								<div className="flex-1">
									<span className="font-semibold">{entry.action}</span>
									<span className="text-muted-foreground"> by {entry.by} &middot; {entry.at}</span>
									{entry.comment && <p className="text-muted-foreground mt-0.5 italic">&ldquo;{entry.comment}&rdquo;</p>}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/* ─── Risk Score Gauge ─── */

function CorroborationRiskScore({ profile: p, scores, grade }: { profile: HnwProfile; scores: CorroborationScores; grade: CorroborationGrade }) {
	const score = p.riskScore;
	const angle = (score / 100) * 180;
	const color = score >= 60 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#10b981";
	const riskLabel = score >= 60 ? "High" : score >= 40 ? "Medium" : "Low";
	const bgColor = score >= 60 ? "from-red-500/5 to-red-500/[0.02]" : score >= 40 ? "from-amber-500/5 to-amber-500/[0.02]" : "from-emerald-500/5 to-emerald-500/[0.02]";

	const subScoreColor = (v: number) => v >= 60 ? "#ef4444" : v >= 40 ? "#f59e0b" : "#10b981";
	const subScoreBg = (v: number) => v >= 60 ? "bg-red-500" : v >= 40 ? "bg-amber-500" : "bg-emerald-500";
	const subScoreLabel = (v: number) => v >= 60 ? "High Risk" : v >= 40 ? "Moderate" : "Low Risk";

	const pillars = [
		{ key: "consistency", label: "Consistency", value: scores.consistency, desc: "Career-to-wealth trajectory alignment" },
		{ key: "correctness", label: "Correctness", value: scores.correctness, desc: "Factual accuracy of data points" },
		{ key: "completeness", label: "Completeness", value: scores.completeness, desc: "Coverage of material wealth sources" },
	];

	return (
		<div className={`rounded-2xl border border-border bg-gradient-to-br ${bgColor} p-6 shadow-sm`}>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<GaugeIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Corroboration Risk Score</p>
					<GradeBadge grade={grade} size="sm" />
				</div>
				<span className="text-[9px] font-heading font-medium text-muted-foreground/70 tracking-wide">MAS Notice 626 §6.18–6.22</span>
			</div>
			<div className="flex items-start gap-8">
				<div className="shrink-0">
					<svg width="160" height="100" viewBox="0 0 160 100">
						<defs>
							<linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
								<stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
								<stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
							</linearGradient>
						</defs>
						<path d="M 15 75 A 65 65 0 0 1 145 75" fill="none" stroke="url(#gaugeTrack)" strokeWidth="10" strokeLinecap="round" />
						<path
							d="M 15 75 A 65 65 0 0 1 145 75"
							fill="none"
							stroke={color}
							strokeWidth="10"
							strokeLinecap="round"
							strokeDasharray={`${(angle / 180) * 204} 204`}
						/>
						<text x="80" y="68" textAnchor="middle" className="font-heading" style={{ fontSize: "28px", fontWeight: 700, fill: color }}>{score}</text>
						<text x="80" y="84" textAnchor="middle" style={{ fontSize: "12px", fill: "#9ca3af" }}>/ 100</text>
						<text x="8" y="96" textAnchor="start" style={{ fontSize: "10px", fontWeight: 600, fill: "#10b981" }}>LOW</text>
						<text x="152" y="96" textAnchor="end" style={{ fontSize: "10px", fontWeight: 600, fill: "#ef4444" }}>HIGH</text>
					</svg>
				</div>
				<div className="flex-1 space-y-3">
					<div className="text-sm font-heading font-semibold" style={{ color }}>
						{riskLabel} Corroboration Risk — {score >= 60 ? "Enhanced Due Diligence Required" : score >= 40 ? "Heightened Monitoring Recommended" : "Standard Onboarding Eligible"}
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{p.profileSummary}
					</p>
					{/* 3C Pillar Bars */}
					<div className="space-y-2 pt-2 border-t border-border/50">
						<p className="text-[10px] font-heading font-semibold text-muted-foreground/70 uppercase tracking-widest">MAS 3C Framework — Consistency, Correctness &amp; Completeness</p>
						{pillars.map((pillar) => (
							<div key={pillar.key} className="flex items-center gap-3">
								<div className="w-24 text-[11px] font-heading font-medium text-muted-foreground">{pillar.label}</div>
								<div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
									<div className={`h-full rounded-full transition-all ${subScoreBg(pillar.value)}`} style={{ width: `${pillar.value}%` }} />
								</div>
								<div className="w-8 text-right text-[11px] font-heading font-bold" style={{ color: subScoreColor(pillar.value) }}>{pillar.value}</div>
								<div className="w-16 text-[9px] font-heading text-muted-foreground/60">{subScoreLabel(pillar.value)}</div>
							</div>
						))}
					</div>
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
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Key Risk Parameters</p>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{params.map((param, i) => (
					<div key={i} className={`rounded-xl border p-3.5 ${statusStyle[param.status]}`}>
						<div className="flex items-center gap-1.5 mb-1.5">
							<div className={`h-1.5 w-1.5 rounded-full ${dotStyle[param.status]}`} />
							<span className="text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">{param.label}</span>
						</div>
						<div className="text-sm font-heading font-semibold">{param.value}</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Career Timeline (horizontal SVG) ─── */

function CareerTimeline({ phases }: { phases: CareerPhase[] }) {
	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<BriefcaseIcon className="size-4 text-muted-foreground" />
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Career Timeline</p>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
				{phases.map((phase, i) => {
					const wealthColor = phase.phaseWealthUSD < 0 ? "text-red-600" : phase.phaseWealthUSD > 1_000_000_000 ? "text-teal-600" : phase.phaseWealthUSD > 1_000_000 ? "text-cyan-600" : "text-muted-foreground";
					return (
						<div key={phase.id} className="relative rounded-xl border border-border bg-muted/20 p-3 text-center">
							{/* Step number */}
							<div className="mx-auto h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-heading font-bold mb-2 shadow-sm shadow-primary/20">
								{i + 1}
							</div>
							{/* Year range */}
							<div className="text-[11px] text-muted-foreground mb-1">{phase.startYear}–{phase.endYear ?? "Now"}</div>
							{/* Title */}
							<div className="text-xs font-heading font-semibold leading-tight mb-1">{phase.title}</div>
							{/* Wealth */}
							<div className={`text-xs font-heading font-bold tabular-nums ${wealthColor}`}>{formatUSD(phase.cumulativeWealthUSD)}</div>
							{/* Location */}
							<div className="text-[10px] text-muted-foreground/70 mt-1 leading-tight">{phase.location}</div>
							{/* Connector arrow */}
							{i < phases.length - 1 && (
								<div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-border z-10">
									<ChevronRightIcon className="size-4" />
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Wealth Accumulation Chart (stacked bar) ─── */

function WealthAccumulationChart({ phases }: { phases: CareerPhase[] }) {
	const categories: WealthCategory[] = ["income", "companies", "investments", "alternatives", "crypto"];
	const maxWealth = Math.max(...phases.map((p) => p.cumulativeWealthUSD), 1);

	const svgWidth = 700;
	const svgHeight = 330;
	const marginLeft = 70;
	const marginRight = 20;
	const marginTop = 20;
	const marginBottom = 110;
	const chartWidth = svgWidth - marginLeft - marginRight;
	const chartHeight = svgHeight - marginTop - marginBottom;
	const barWidth = Math.min(60, (chartWidth / phases.length) * 0.7);
	const barSpacing = chartWidth / phases.length;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-2">
				<BarChart3Icon className="size-4 text-muted-foreground" />
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Accumulation by Career Phase</p>
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-3 mb-4">
				{categories.map((cat) => (
					<div key={cat} className="flex items-center gap-1.5">
						<div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
						<span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
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
								<text x={marginLeft - 8} y={y + 4} textAnchor="end" style={{ fontSize: "11px", fill: "#9ca3af" }}>
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

								{/* Phase label — rotated to prevent overlap */}
								<text
									x={barX + barWidth / 2}
									y={marginTop + chartHeight + 12}
									textAnchor="end"
									className="font-heading"
									style={{ fontSize: "10px", fontWeight: 600, fill: "#374151" }}
									transform={`rotate(-35, ${barX + barWidth / 2}, ${marginTop + chartHeight + 12})`}
								>
									{phase.title}
								</text>
								<text
									x={barX + barWidth / 2}
									y={marginTop + chartHeight + 26}
									textAnchor="end"
									style={{ fontSize: "9px", fill: "#9ca3af" }}
									transform={`rotate(-35, ${barX + barWidth / 2}, ${marginTop + chartHeight + 26})`}
								>
									{phase.startYear}–{phase.endYear ?? "Now"}
								</text>

								{/* Value on top */}
								<text
									x={barX + barWidth / 2}
									y={marginTop + chartHeight - yOffset - 4}
									textAnchor="middle"
									style={{ fontSize: "10px", fontWeight: 600, fill: "#374151" }}
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
		const percentage = total > 0 ? (item.totalUSD / total) * 100 : 0;
		const startAngle = cumulativeAngle;
		const sweep = (percentage / 100) * 360;
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
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Composition</p>
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
						<text x="70" y="82" textAnchor="middle" style={{ fontSize: "11px", fill: "#9ca3af" }}>
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
									<span className="text-sm font-heading font-medium">{CATEGORY_LABELS[seg.category]}</span>
									<span className="text-sm font-heading font-bold tabular-nums ml-2">{formatUSD(seg.totalUSD)}</span>
								</div>
								<div className="flex items-center gap-2 mt-0.5">
									<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
										<div className="h-full rounded-full" style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }} />
									</div>
									<span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{seg.percentage.toFixed(1)}%</span>
									<span className="text-xs text-muted-foreground tabular-nums w-12 text-right">{seg.avgConfidence}% conf</span>
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

function CareerPhaseCards({ phases, onSourceClick }: { phases: CareerPhase[]; onSourceClick?: (src: SourceCitation) => void }) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<BookOpenIcon className="size-4 text-muted-foreground" />
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Career Phase Detail</p>
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
									<div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
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
											<div className="text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-2">Key Events</div>
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
													<WealthClaimRow key={claim.id} claim={claim} onSourceClick={onSourceClick} />
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

function WealthClaimRow({ claim, onSourceClick }: { claim: WealthClaim; onSourceClick?: (src: SourceCitation) => void }) {
	return (
		<div className="rounded-lg border border-border/40 bg-card p-3 space-y-1.5">
			<div className="flex items-start justify-between gap-2">
				<p className="text-xs text-foreground leading-relaxed flex-1">{claim.description}</p>
				<span className="text-xs font-heading font-bold tabular-nums shrink-0 text-right">{formatUSD(claim.estimatedValueUSD)}</span>
			</div>
			<div className="flex items-center gap-3">
				<ConfidenceBar value={claim.confidence} />
				{claim.savingRate !== undefined && (
					<span className="text-[10px] font-heading font-medium px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 shrink-0">
						{claim.savingRate}% saving rate
					</span>
				)}
				<div className="flex items-center gap-1.5 flex-wrap">
					{claim.sources.map((src) => (
						<SourceBadge key={src.id} source={src} onClick={onSourceClick} />
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
			<span className="text-xs font-heading font-semibold tabular-nums" style={{ color }}>{value}%</span>
		</div>
	);
}

/* ─── Source Badge ─── */

const SOURCE_TYPE_COLORS: Record<string, string> = {
	filing: "bg-blue-500/15 text-blue-700 border-blue-500/20",
	news: "bg-purple-500/15 text-purple-700 border-purple-500/20",
	registry: "bg-teal-500/15 text-teal-700 border-teal-500/20",
	"market-data": "bg-cyan-500/15 text-cyan-700 border-cyan-500/20",
	"public-record": "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
	estimate: "bg-amber-500/15 text-amber-700 border-amber-500/20",
};
const SOURCE_TYPE_ICONS: Record<string, typeof FileTextIcon> = {
	filing: FileTextIcon,
	news: ExternalLinkIcon,
	registry: BuildingIcon,
	"market-data": TrendingUpIcon,
	"public-record": ShieldCheckIcon,
	estimate: SparklesIcon,
};
const SOURCE_TYPE_LABELS: Record<string, string> = {
	filing: "Regulatory Filing",
	news: "News Report",
	registry: "Corporate Registry",
	"market-data": "Market Data",
	"public-record": "Public Record",
	estimate: "Estimate / Analysis",
};

function SourceBadge({ source, onClick }: { source: SourceCitation; onClick?: (src: SourceCitation) => void }) {
	const Icon = SOURCE_TYPE_ICONS[source.type] ?? FileTextIcon;
	const colorClass = SOURCE_TYPE_COLORS[source.type] ?? SOURCE_TYPE_COLORS.estimate;

	return (
		<button
			type="button"
			onClick={(e) => { e.stopPropagation(); onClick?.(source); }}
			className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-md border px-1.5 py-0.5 cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-current/20 transition-all ${colorClass}`}
			title={`${source.label} — click for details`}
		>
			<Icon className="size-2.5" />
			{source.label}
		</button>
	);
}

/* ─── Company Network Graph (hierarchical tree) ─── */

const STATUS_STYLE: Record<string, { fill: string; stroke: string; text: string; badge: string }> = {
	active: { fill: "#f0fdf4", stroke: "#86efac", text: "#166534", badge: "Active" },
	ipo: { fill: "#eff6ff", stroke: "#93c5fd", text: "#1e40af", badge: "IPO" },
	exited: { fill: "#fefce8", stroke: "#fde047", text: "#854d0e", badge: "Exited" },
	restructured: { fill: "#fef3c7", stroke: "#fcd34d", text: "#92400e", badge: "Restructured" },
	delisted: { fill: "#fef2f2", stroke: "#fca5a5", text: "#991b1b", badge: "Delisted" },
	dissolved: { fill: "#f3f4f6", stroke: "#d1d5db", text: "#6b7280", badge: "Dissolved" },
	pending: { fill: "#f5f3ff", stroke: "#c4b5fd", text: "#5b21b6", badge: "Pending" },
};

const TYPE_ICON: Record<string, string> = {
	holding: "H", subsidiary: "S", fund: "F", trust: "T", foundation: "P",
	jv: "JV", token: "◆", investment: "→",
};

function EntityNodeCard({ node, depth, expanded, onToggle }: {
	node: CompanyNode; depth: number; expanded: Set<string>; onToggle: (key: string) => void;
}) {
	const sc = STATUS_STYLE[node.status] ?? STATUS_STYLE.active;
	const hasChildren = node.children && node.children.length > 0;
	const nodeKey = `${depth}-${node.name}`;
	const isOpen = expanded.has(nodeKey);
	const typeIcon = node.type ? TYPE_ICON[node.type] ?? "" : "";

	return (
		<div className={depth === 0 ? "" : "ml-5 border-l-2 border-border/50 pl-4"}>
			<button
				type="button"
				onClick={hasChildren ? () => onToggle(nodeKey) : undefined}
				className={`w-full text-left rounded-lg border px-3 py-2 mb-1.5 transition-all ${hasChildren ? "cursor-pointer hover:shadow-sm" : "cursor-default"}`}
				style={{ borderColor: sc.stroke, backgroundColor: sc.fill }}
			>
				<div className="flex items-center gap-2">
					{hasChildren && (
						<ChevronRightIcon className={`size-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: sc.text }} />
					)}
					{!hasChildren && <span className="w-3" />}
					{typeIcon && (
						<span className="text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: sc.stroke + "40", color: sc.text }}>
							{typeIcon}
						</span>
					)}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1.5">
							<span className="text-sm font-heading font-semibold" style={{ color: sc.text }}>{node.name}</span>
							<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: sc.stroke + "30", color: sc.text }}>{sc.badge}</span>
						</div>
						<div className="flex items-center gap-2 mt-0.5">
							<span className="text-[11px] text-muted-foreground">{node.role}</span>
							{node.ownership && <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{node.ownership}</span>}
							{node.valuation && <span className="text-[10px] font-medium shrink-0" style={{ color: sc.text }}>{node.valuation}</span>}
						</div>
						{node.jurisdiction && (
							<span className="text-[10px] text-muted-foreground/70">{node.jurisdiction}</span>
						)}
					</div>
					{hasChildren && (
						<span className="text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0" style={{ backgroundColor: sc.stroke + "30", color: sc.text }}>
							{node.children!.length}
						</span>
					)}
				</div>
			</button>
			{isOpen && node.children?.map((child, ci) => (
				<EntityNodeCard key={ci} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
			))}
		</div>
	);
}

/* ─── Personal & Family Network ─── */

function PersonalRelationshipsSection({ relationships, profileName }: { relationships: PersonalRelationship[]; profileName: string }) {
	const relationshipIcons: Record<string, typeof UserIcon> = {
		spouse: UserIcon, child: UserIcon, sibling: UserIcon, parent: UserIcon,
		associate: BriefcaseIcon, advisor: ShieldIcon, trustee: ShieldIcon, beneficiary: UserIcon,
	};
	const relationshipColors: Record<string, string> = {
		spouse: "bg-pink-500/10 text-pink-700 border-pink-500/20",
		child: "bg-sky-500/10 text-sky-700 border-sky-500/20",
		sibling: "bg-violet-500/10 text-violet-700 border-violet-500/20",
		parent: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
		associate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
		advisor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
		trustee: "bg-teal-500/10 text-teal-700 border-teal-500/20",
		beneficiary: "bg-orange-500/10 text-orange-700 border-orange-500/20",
	};

	if (!relationships || relationships.length === 0) return null;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
					<NetworkIcon className="size-4 text-primary" />
				</div>
				<div>
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Personal & Family Network</p>
					<p className="text-[10px] text-muted-foreground mt-0.5">{relationships.length} known connections for {profileName}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{relationships.map((rel) => {
					const Icon = relationshipIcons[rel.relationship] ?? UserIcon;
					const colorClass = relationshipColors[rel.relationship] ?? "bg-muted text-muted-foreground border-border";
					return (
						<div key={rel.id} className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
							<div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass.split(" ")[0]} border ${colorClass.split(" ")[2] ?? "border-border"}`}>
								<Icon className={`size-4 ${colorClass.split(" ")[1]}`} />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-heading font-semibold text-sm truncate">{rel.name}</span>
									<span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass}`}>
										{rel.relationship}
									</span>
								</div>
								{rel.notes && <p className="text-xs text-muted-foreground leading-relaxed">{rel.notes}</p>}
								{rel.linkedEntities && rel.linkedEntities.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{rel.linkedEntities.map((entity) => (
											<span key={entity} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 border border-primary/15 text-primary font-medium">
												{entity}
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Company Network ─── */

function CompanyNetworkGraph({ nodes, profileName }: { nodes: CompanyNode[]; profileName: string }) {
	const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

	const onToggle = useCallback((key: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);

	const expandAll = useCallback(() => {
		const keys = new Set<string>();
		const collect = (list: CompanyNode[], d: number) => {
			for (const n of list) {
				if (n.children?.length) {
					keys.add(`${d}-${n.name}`);
					collect(n.children, d + 1);
				}
			}
		};
		collect(nodes, 0);
		setExpanded(keys);
	}, [nodes]);

	const collapseAll = useCallback(() => setExpanded(new Set()), []);

	// Count total entities recursively
	const countAll = (list: CompanyNode[]): number => list.reduce((s, n) => s + 1 + (n.children ? countAll(n.children) : 0), 0);
	const totalEntities = countAll(nodes);
	const topLevel = nodes.length;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<NetworkIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Related Entity Network</p>
					<span className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{totalEntities} entities</span>
				</div>
				<div className="flex items-center gap-1">
					<button type="button" onClick={expandAll} className="text-[11px] text-primary font-medium hover:underline px-2 py-1">Expand all</button>
					<button type="button" onClick={collapseAll} className="text-[11px] text-muted-foreground font-medium hover:underline px-2 py-1">Collapse</button>
				</div>
			</div>
			{/* Person header */}
			<div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
				<div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-400 flex items-center justify-center">
					<UserIcon className="size-4 text-blue-600" />
				</div>
				<div>
					<p className="text-sm font-heading font-semibold text-foreground">{profileName}</p>
					<p className="text-xs text-muted-foreground">{topLevel} direct entities &middot; {totalEntities} total network nodes &middot; <span className="text-primary/70 font-medium">Fill Easy CorpVerify</span></p>
				</div>
			</div>
			{/* Type legend */}
			<div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
				{(Object.entries(STATUS_STYLE) as [string, typeof STATUS_STYLE.active][]).filter(([k]) => nodes.some(n => n.status === k || n.children?.some(c => c.status === k))).map(([k, v]) => (
					<span key={k} className="flex items-center gap-1 text-[10px]">
						<span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.stroke }} />
						<span style={{ color: v.text }}>{v.badge}</span>
					</span>
				))}
			</div>
			{/* Tree */}
			<div className="space-y-0.5 max-h-[600px] overflow-y-auto pr-1">
				{nodes.map((node, i) => (
					<EntityNodeCard key={i} node={node} depth={0} expanded={expanded} onToggle={onToggle} />
				))}
			</div>
		</div>
	);
}

/* ─── Narrative Section ─── */

function NarrativeSection({ narrative, report }: { narrative: string; report: HnwReport }) {
	const [expanded, setExpanded] = useState(false);
	const [aiNarrative, setAiNarrative] = useState<string | null>(null);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedModel, setSelectedModel] = useState("anthropic/claude-sonnet-4");
	const [usageInfo, setUsageInfo] = useState<{ promptTokens?: number; completionTokens?: number; model?: string } | null>(null);

	const activeNarrative = aiNarrative ?? narrative;
	const paragraphs = activeNarrative.split("\n\n").filter(Boolean);
	const preview = paragraphs.slice(0, 2);

	const MODELS = [
		{ id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
		{ id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
		{ id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
		{ id: "openai/gpt-4o", label: "GPT-4o" },
		{ id: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini" },
		{ id: "deepseek/deepseek-r1", label: "DeepSeek R1" },
	];

	const generateNarrative = async () => {
		setGenerating(true);
		setError(null);
		try {
			const p = report.profile;
			const res = await fetch("/api/generate-narrative", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					profileName: p.name,
					profileSummary: p.profileSummary,
					netWorth: report.totalEstimatedWealthUSD,
					riskRating: p.riskRating,
					riskScore: p.riskScore,
					overallConfidence: report.overallConfidence,
					corroborationScores: report.corroborationScores,
					careerPhases: report.careerTimeline.map((ph) => ({
						title: ph.title, startYear: ph.startYear, endYear: ph.endYear,
						organization: ph.organization, location: ph.location,
						cumulativeWealthUSD: ph.cumulativeWealthUSD, description: ph.description,
					})),
					wealthCategories: report.wealthByCategory.map((w) => ({
						category: w.category, totalUSD: w.totalUSD, percentage: w.percentage, avgConfidence: w.avgConfidence,
					})),
					keyRiskFactors: report.keyParameters.filter((kp) => kp.status !== "normal").map((kp) => `${kp.label}: ${kp.value}`).join("; "),
					model: selectedModel,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error || "Failed to generate narrative");
			} else {
				setAiNarrative(data.narrative);
				setUsageInfo({ promptTokens: data.usage?.promptTokens, completionTokens: data.usage?.completionTokens, model: data.model });
				setExpanded(true);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Network error");
		} finally {
			setGenerating(false);
		}
	};

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<FileTextIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Narrative</p>
					{aiNarrative && (
						<span className="text-[9px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">AI Generated</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{aiNarrative && (
						<button onClick={() => { setAiNarrative(null); setUsageInfo(null); }} className="text-[10px] text-muted-foreground hover:text-foreground font-heading font-medium flex items-center gap-1 transition-colors">
							<RotateCwIcon className="size-3" /> Revert
						</button>
					)}
					<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/40">
						<CpuIcon className="size-3 text-muted-foreground" />
						<select
							value={selectedModel}
							onChange={(e) => setSelectedModel(e.target.value)}
							className="text-[11px] bg-transparent focus:outline-none font-heading font-medium text-foreground cursor-pointer"
						>
							{MODELS.map((m) => (
								<option key={m.id} value={m.id}>{m.label}</option>
							))}
						</select>
					</div>
					<button
						onClick={generateNarrative}
						disabled={generating}
						className="text-xs font-heading font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-700 border border-purple-500/20 hover:from-purple-500/15 hover:to-violet-500/15 transition-all disabled:opacity-50"
					>
						{generating ? <LoaderIcon className="size-3 animate-spin" /> : <SparklesIcon className="size-3" />}
						{generating ? "Generating…" : aiNarrative ? "Rephrase with Model" : "Generate with AI"}
					</button>
				</div>
			</div>

			{error && (
				<div className="mb-4 p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-2">
					<AlertCircleIcon className="size-4 text-red-500 shrink-0 mt-0.5" />
					<p className="text-xs text-red-700">{error}</p>
				</div>
			)}

			<div className="space-y-3">
				{(expanded ? paragraphs : preview).map((para, i) => (
					<p key={i} className="text-sm text-muted-foreground leading-relaxed">
						{para.split(/(\[[^\]]+\]\([^)]+\))/).map((segment, j) => {
							const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
							if (linkMatch) {
								return <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{linkMatch[1]}</a>;
							}
							return <span key={j}>{segment}</span>;
						})}
					</p>
				))}
			</div>
			{paragraphs.length > 2 && (
				<button onClick={() => setExpanded(!expanded)} className="mt-3 text-xs text-primary font-heading font-medium flex items-center gap-1 hover:underline">
					{expanded ? "Show less" : `Show more (${paragraphs.length - 2} more paragraphs)`}
					<ChevronDownIcon className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
				</button>
			)}

			{usageInfo && (
				<div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-[10px] text-muted-foreground/60">
					<span className="flex items-center gap-1"><CpuIcon className="size-3" /> {usageInfo.model}</span>
					{usageInfo.promptTokens && <span>{usageInfo.promptTokens} prompt tokens</span>}
					{usageInfo.completionTokens && <span>{usageInfo.completionTokens} completion tokens</span>}
				</div>
			)}
		</div>
	);
}

/* ─── Cross-LLM Validation ─── */

type GapStatus = "agree" | "partial" | "disagree";

interface ModelFinding {
	model: string;
	icon: string;
	totalWealth: string;
	riskRating: string;
	keyFindings: string[];
}

interface GapAnalysisRow {
	area: string;
	status: GapStatus;
	detail: string;
}

interface FactualInferredRow {
	category: string;
	factualPct: number;
	inferredPct: number;
}

interface CrossValidationData {
	models: ModelFinding[];
	gapAnalysis: GapAnalysisRow[];
	factualVsInferred: FactualInferredRow[];
	consensusScore: number;
}

const CROSS_VALIDATION_MOCK: Record<string, CrossValidationData> = {
	"hnw-jack-ma": {
		models: [
			{
				model: "Claude Sonnet",
				icon: "C",
				totalWealth: "$22.8B",
				riskRating: "Medium-High",
				keyFindings: [
					"Ant Group stake valued at ~$8.1B post-restructuring",
					"Singapore family office managing $2.4B+",
					"Blue Pool Capital co-founder with $800M AUM",
				],
			},
			{
				model: "Gemini 2.5 Flash",
				icon: "G",
				totalWealth: "$25.1B",
				riskRating: "Medium",
				keyFindings: [
					"Ant Group stake valued higher at $10.2B",
					"Real estate portfolio across 4 jurisdictions",
					"Philanthropic commitments reduce liquid wealth by ~15%",
				],
			},
			{
				model: "GPT-4o",
				icon: "O",
				totalWealth: "$21.5B",
				riskRating: "Medium-High",
				keyFindings: [
					"Conservative Ant Group valuation at $7.8B",
					"Trust structures in Singapore and Cayman Islands",
					"Pre-IPO wealth accumulation timeline verified",
				],
			},
		],
		gapAnalysis: [
			{ area: "Ant Group Valuation", status: "partial", detail: "Range: $7.8B–$10.2B across models. Post-restructuring valuation methodology differs." },
			{ area: "Singapore Trust Structure", status: "disagree", detail: "Claude and GPT identify trust; Gemini finds no public record of trust entity." },
			{ area: "Real Estate Portfolio", status: "agree", detail: "All models corroborate multi-jurisdiction real estate holdings above $500M." },
			{ area: "Pre-IPO Wealth Origins", status: "agree", detail: "Consistent timeline of Alibaba founding through 2014 IPO across all models." },
			{ area: "Blue Pool Capital AUM", status: "partial", detail: "AUM estimates range $600M–$1.2B. Limited public disclosure on fund performance." },
		],
		factualVsInferred: [
			{ category: "Income", factualPct: 95, inferredPct: 5 },
			{ category: "Companies", factualPct: 78, inferredPct: 22 },
			{ category: "Investments", factualPct: 45, inferredPct: 55 },
			{ category: "Alternatives", factualPct: 30, inferredPct: 70 },
		],
		consensusScore: 72,
	},
	"hnw-yat-siu": {
		models: [
			{
				model: "Claude Sonnet",
				icon: "C",
				totalWealth: "$1.1B",
				riskRating: "High",
				keyFindings: [
					"Animoca Brands valued at $5.9B (2022 peak)",
					"SAND token holdings volatile, estimated $120M–$400M",
					"IBM acquisition of Outblaze division at undisclosed price",
				],
			},
			{
				model: "Gemini 2.5 Flash",
				icon: "G",
				totalWealth: "$680M",
				riskRating: "Very High",
				keyFindings: [
					"Post-crypto-winter Animoca revaluation at $2.2B",
					"NFT portfolio largely illiquid, marked at $45M",
					"ASX delisting reduced corporate governance transparency",
				],
			},
			{
				model: "GPT-4o",
				icon: "O",
				totalWealth: "$920M",
				riskRating: "High",
				keyFindings: [
					"Animoca valuation between peak and current at $3.8B",
					"Significant SAND token dilution since TGE",
					"Multiple Web3 investments with uncertain liquidity",
				],
			},
		],
		gapAnalysis: [
			{ area: "SAND Token Valuation", status: "disagree", detail: "Estimates range $120M–$400M. Token price volatility and vesting schedule assumptions differ." },
			{ area: "Animoca Private Valuation", status: "disagree", detail: "Range: $2.2B–$5.9B. No consensus on post-2022 fair value without public listing." },
			{ area: "IBM Acquisition Price", status: "agree", detail: "All models confirm IBM acquired Outblaze messaging division; exact price undisclosed." },
			{ area: "NFT Portfolio", status: "partial", detail: "Existence confirmed; valuation methodology for illiquid NFTs varies significantly." },
			{ area: "ASX Delisting Impact", status: "agree", detail: "All models note TelBio/Animoca ASX delisting reduced disclosure requirements." },
		],
		factualVsInferred: [
			{ category: "Income", factualPct: 85, inferredPct: 15 },
			{ category: "Companies", factualPct: 35, inferredPct: 65 },
			{ category: "Investments", factualPct: 20, inferredPct: 80 },
			{ category: "Crypto", factualPct: 15, inferredPct: 85 },
		],
		consensusScore: 48,
	},
	"hnw-donald-trump": {
		models: [
			{
				model: "Claude Sonnet",
				icon: "C",
				totalWealth: "$5.8B",
				riskRating: "Very High",
				keyFindings: [
					"DJT stake valued at ~$3.5B but extreme meme-stock volatility",
					"Real estate portfolio $2B (discounted from self-reports per NY AG fraud findings)",
					"$TRUMP meme coin not included — regulatory status unclear",
				],
			},
			{
				model: "Gemini 2.5 Flash",
				icon: "G",
				totalWealth: "$8.2B",
				riskRating: "High",
				keyFindings: [
					"Includes $TRUMP meme coin at $1.5B (80% supply via CIC Digital LLC)",
					"DJT stake at $4.2B using higher share price assumptions",
					"Golf course portfolio valued at $800M including international properties",
				],
			},
			{
				model: "GPT-4o",
				icon: "O",
				totalWealth: "$4.5B",
				riskRating: "Very High",
				keyFindings: [
					"Conservative DJT valuation — applies 40% illiquidity discount for insider shares",
					"Real estate deflated per NY AG findings — $1.6B after court adjustments",
					"Excludes crypto entirely — no regulatory framework for presidential meme coins",
				],
			},
		],
		gapAnalysis: [
			{ area: "DJT Stock Valuation", status: "disagree", detail: "Range: $2.1B-$4.2B across models. Insider lock-up discount, meme-stock volatility, and Truth Social revenue disconnect create fundamental valuation disagreement." },
			{ area: "$TRUMP Meme Coin", status: "disagree", detail: "Claude excludes entirely, Gemini includes at $1.5B, GPT-4o excludes. No regulatory framework exists for sitting president's crypto token. Beneficial ownership chain through LLCs unclear." },
			{ area: "Real Estate Portfolio", status: "partial", detail: "Range: $1.6B-$2.5B. NY AG fraud judgment found systematic overstatement. Models disagree on discount to apply. Mar-a-Lago valuation ($37M tax vs. $500M+ market) drives widest spread." },
			{ area: "Brand Licensing Value", status: "partial", detail: "All models confirm $400M+ historical licensing fees. Current ongoing value disputed — some projects removed Trump name post-2016. OGE ranges too broad for precise calculation." },
			{ area: "PEP Risk Classification", status: "agree", detail: "All models flag active PEP status (sitting president) as highest classification. Unanimous on mandatory enhanced due diligence requirement." },
		],
		factualVsInferred: [
			{ category: "Income", factualPct: 60, inferredPct: 40 },
			{ category: "Companies", factualPct: 45, inferredPct: 55 },
			{ category: "Alternatives", factualPct: 40, inferredPct: 60 },
			{ category: "Crypto", factualPct: 15, inferredPct: 85 },
		],
		consensusScore: 45,
	},
	"hnw-james-chen": {
		models: [
			{
				model: "Claude Sonnet",
				icon: "C",
				totalWealth: "$375M",
				riskRating: "Low",
				keyFindings: [
					"Goldman Sachs MD compensation verified at $18M over 10 years",
					"Meridian Capital PE carry well-documented via MAS/ACRA",
					"Conservative family office with no speculative assets",
				],
			},
			{
				model: "Gemini 2.5 Flash",
				icon: "G",
				totalWealth: "$390M",
				riskRating: "Low",
				keyFindings: [
					"Singapore real estate appreciation adds $25M to portfolio value",
					"Blue-chip equity portfolio independently verified via SGX data",
					"Clean PEP/sanctions screening across all jurisdictions",
				],
			},
			{
				model: "GPT-4o",
				icon: "O",
				totalWealth: "$370M",
				riskRating: "Low",
				keyFindings: [
					"Single-jurisdiction profile simplifies verification significantly",
					"IRAS filings cross-check perfectly with DBS bank statements",
					"No offshore structures or cross-border complexity identified",
				],
			},
		],
		gapAnalysis: [
			{ area: "Goldman Sachs Compensation", status: "agree", detail: "All models confirm $15-20M range for Goldman Sachs MD-level compensation in Singapore during the 1990s." },
			{ area: "Meridian Capital PE Returns", status: "agree", detail: "Fund performance (2.2-2.8x MOIC) and carried interest calculations consistent across all models." },
			{ area: "Singapore Real Estate", status: "agree", detail: "Property valuations confirmed via SLA/URA records. All models agree on current market values." },
			{ area: "Portfolio Composition", status: "agree", detail: "Conservative allocation (equities, bonds, PE, real estate) consistently described. No speculative assets found." },
			{ area: "Net Worth Estimate", status: "partial", detail: "Range $370M-$390M — narrow 5% variance reflecting minor differences in PE fund-of-funds mark-to-market." },
		],
		factualVsInferred: [
			{ category: "Income", factualPct: 95, inferredPct: 5 },
			{ category: "Companies", factualPct: 90, inferredPct: 10 },
			{ category: "Investments", factualPct: 85, inferredPct: 15 },
			{ category: "Alternatives", factualPct: 92, inferredPct: 8 },
		],
		consensusScore: 88,
	},
};

function CrossLLMValidationSection({ report }: { report: HnwReport }) {
	const [crossValidationRun, setCrossValidationRun] = useState(false);
	const [crossValidating, setCrossValidating] = useState(false);

	const profileId = report.profile.id;
	const data = CROSS_VALIDATION_MOCK[profileId] ?? CROSS_VALIDATION_MOCK["hnw-jack-ma"];

	const runCrossValidation = () => {
		setCrossValidating(true);
		setTimeout(() => {
			setCrossValidating(false);
			setCrossValidationRun(true);
		}, 2000);
	};

	const statusColor = (s: GapStatus) =>
		s === "agree" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
		s === "partial" ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
		"bg-red-500/10 text-red-700 border-red-500/20";

	const statusIcon = (s: GapStatus) =>
		s === "agree" ? <CheckCircle2Icon className="size-3" /> :
		s === "partial" ? <AlertTriangleIcon className="size-3" /> :
		<XCircleIcon className="size-3" />;

	const consensusColor = data.consensusScore >= 70 ? "#10b981" : data.consensusScore >= 50 ? "#f59e0b" : "#ef4444";

	/* Circular gauge for consensus */
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference - (data.consensusScore / 100) * circumference;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<RadarIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Cross-LLM Validation</p>
				</div>
				{!crossValidationRun && !crossValidating && (
					<button
						onClick={runCrossValidation}
						className="text-xs font-heading font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-500/20 hover:from-blue-500/15 hover:to-indigo-500/15 transition-all"
					>
						<RadarIcon className="size-3" /> Run Cross-Validation
					</button>
				)}
				{crossValidating && (
					<span className="text-xs font-heading font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/5 text-blue-600 border border-blue-500/20">
						<LoaderIcon className="size-3 animate-spin" /> Validating across 3 models…
					</span>
				)}
			</div>

			{/* Pre-validation CTA */}
			{!crossValidationRun && !crossValidating && (
				<div className="rounded-xl border border-dashed border-blue-500/30 bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.03] p-8 flex flex-col items-center text-center">
					<div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
						<RadarIcon className="size-6 text-blue-600" />
					</div>
					<h4 className="font-heading font-semibold text-sm mb-1">Compare AI Model Assessments</h4>
					<p className="text-xs text-muted-foreground max-w-md mb-5">
						Run parallel assessments across multiple LLMs to identify consensus, gaps, and areas where AI inference vs. factual corroboration differ
					</p>
					<button
						onClick={runCrossValidation}
						className="text-sm font-heading font-semibold flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 transition-all"
					>
						<RadarIcon className="size-4" /> Run Cross-Validation (3 Models)
					</button>
				</div>
			)}

			{/* Loading animation */}
			{crossValidating && (
				<div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-8 flex flex-col items-center text-center">
					<div className="flex items-center gap-6 mb-4">
						{["Claude Sonnet", "Gemini 2.5 Flash", "GPT-4o"].map((m, i) => (
							<div key={m} className="flex flex-col items-center gap-2">
								<div className={`h-10 w-10 rounded-lg border flex items-center justify-center text-xs font-heading font-bold ${i === 0 ? "bg-orange-500/10 border-orange-500/20 text-orange-700" : i === 1 ? "bg-blue-500/10 border-blue-500/20 text-blue-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"}`}>
									{m[0]}
								</div>
								<span className="text-[10px] text-muted-foreground">{m}</span>
								<LoaderIcon className="size-3 animate-spin text-muted-foreground" />
							</div>
						))}
					</div>
					<p className="text-xs text-muted-foreground">Running parallel assessments across 3 models…</p>
				</div>
			)}

			{/* Results */}
			{crossValidationRun && (
				<div className="space-y-6">
					{/* Model Comparison Panels */}
					<div>
						<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-3">Model Comparison</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{data.models.map((m, i) => (
								<div key={m.model} className={`rounded-xl border p-4 ${i === 0 ? "border-orange-500/20 bg-orange-500/[0.02]" : i === 1 ? "border-blue-500/20 bg-blue-500/[0.02]" : "border-emerald-500/20 bg-emerald-500/[0.02]"}`}>
									<div className="flex items-center gap-2 mb-3">
										<div className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-heading font-bold ${i === 0 ? "bg-orange-500/10 text-orange-700" : i === 1 ? "bg-blue-500/10 text-blue-700" : "bg-emerald-500/10 text-emerald-700"}`}>
											{m.icon}
										</div>
										<span className="text-xs font-heading font-semibold">{m.model}</span>
									</div>
									<div className="flex items-center gap-3 mb-3">
										<div>
											<span className="text-[9px] text-muted-foreground uppercase tracking-wide">Est. Wealth</span>
											<p className="text-sm font-heading font-bold">{m.totalWealth}</p>
										</div>
										<div className="h-8 w-px bg-border" />
										<div>
											<span className="text-[9px] text-muted-foreground uppercase tracking-wide">Risk</span>
											<p className="text-xs font-heading font-semibold">{m.riskRating}</p>
										</div>
									</div>
									<div className="space-y-1.5">
										{m.keyFindings.map((f, fi) => (
											<p key={fi} className="text-[11px] text-muted-foreground leading-snug flex items-start gap-1.5">
												<span className="text-muted-foreground/40 mt-0.5">•</span> {f}
											</p>
										))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Gap Analysis Table */}
					<div>
						<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-3">Gap Analysis</p>
						<div className="rounded-xl border border-border overflow-hidden">
							<table className="w-full text-xs">
								<thead>
									<tr className="border-b border-border bg-muted/30">
										<th className="text-left px-4 py-2.5 font-heading font-semibold text-muted-foreground">Area</th>
										<th className="text-left px-4 py-2.5 font-heading font-semibold text-muted-foreground">Status</th>
										<th className="text-left px-4 py-2.5 font-heading font-semibold text-muted-foreground">Detail</th>
									</tr>
								</thead>
								<tbody>
									{data.gapAnalysis.map((row, i) => (
										<tr key={row.area} className={i < data.gapAnalysis.length - 1 ? "border-b border-border/50" : ""}>
											<td className="px-4 py-3 font-heading font-medium whitespace-nowrap">{row.area}</td>
											<td className="px-4 py-3">
												<span className={`inline-flex items-center gap-1 text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full border ${statusColor(row.status)}`}>
													{statusIcon(row.status)} {row.status}
												</span>
											</td>
											<td className="px-4 py-3 text-muted-foreground leading-snug">{row.detail}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Factual vs Inferred + Consensus Score */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Factual vs Inferred Bars */}
						<div className="md:col-span-2">
							<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-3">Factual vs Inferred Breakdown</p>
							<div className="rounded-xl border border-border p-4 space-y-3">
								{data.factualVsInferred.map((row) => (
									<div key={row.category}>
										<div className="flex items-center justify-between mb-1">
											<span className="text-xs font-heading font-medium">{row.category}</span>
											<div className="flex items-center gap-3 text-[10px] text-muted-foreground">
												<span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" /> {row.factualPct}% factual</span>
												<span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber-500" /> {row.inferredPct}% inferred</span>
											</div>
										</div>
										<div className="h-5 rounded-md overflow-hidden flex bg-muted/30 border border-border/50">
											<div
												className="bg-emerald-500/80 flex items-center justify-center"
												style={{ width: `${row.factualPct}%` }}
											>
												{row.factualPct >= 20 && <span className="text-[9px] font-heading font-bold text-white">{row.factualPct}%</span>}
											</div>
											<div
												className="bg-amber-500/70 flex items-center justify-center"
												style={{ width: `${row.inferredPct}%` }}
											>
												{row.inferredPct >= 20 && <span className="text-[9px] font-heading font-bold text-white">{row.inferredPct}%</span>}
											</div>
										</div>
									</div>
								))}
								<div className="flex items-center gap-4 pt-2 border-t border-border/50">
									<span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/80" /> Factual Corroboration</span>
									<span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500/70" /> AI-Inferred Estimate</span>
								</div>
							</div>
						</div>

						{/* Consensus Score */}
						<div>
							<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-3">Consensus Score</p>
							<div className="rounded-xl border border-border p-4 flex flex-col items-center justify-center h-[calc(100%-28px)]">
								<svg width="100" height="100" viewBox="0 0 100 100" className="mb-2">
									<circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
									<circle
										cx="50" cy="50" r={radius}
										fill="none"
										stroke={consensusColor}
										strokeWidth="6"
										strokeLinecap="round"
										strokeDasharray={circumference}
										strokeDashoffset={dashOffset}
										transform="rotate(-90 50 50)"
										className="transition-all duration-1000"
									/>
									<text x="50" y="46" textAnchor="middle" className="fill-current text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
										{data.consensusScore}%
									</text>
									<text x="50" y="60" textAnchor="middle" className="fill-muted-foreground text-[8px]" style={{ fontFamily: "var(--font-heading)" }}>
										consensus
									</text>
								</svg>
								<p className="text-[10px] text-muted-foreground text-center leading-snug">
									{data.consensusScore >= 70 ? "High agreement across models. Findings are well-corroborated." :
									 data.consensusScore >= 50 ? "Moderate agreement. Some areas need additional verification." :
									 "Low consensus. Significant divergence between model assessments."}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

/* ─── Source Citations Aggregate ─── */

function SourceCitationsAggregate({ phases, onSourceClick }: { phases: CareerPhase[]; onSourceClick?: (src: SourceCitation) => void }) {
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

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<LinkIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Source Citations ({sources.length})
					</p>
				</div>
				<span className="text-[10px] text-primary/60 font-heading font-medium">Verified via Fill Easy API</span>
			</div>
			<div className="space-y-2">
				{sources.map((src, i) => (
					<button
						key={src.id}
						type="button"
						onClick={() => onSourceClick?.(src)}
						className="flex items-start gap-3 text-xs w-full text-left rounded-lg px-2 py-1.5 hover:bg-accent/30 transition-colors cursor-pointer group"
					>
						<span className="text-muted-foreground/40 font-mono tabular-nums shrink-0 w-5 text-right">{i + 1}.</span>
						<div className="flex-1 min-w-0">
							<span className="font-medium group-hover:text-primary transition-colors">{src.label}</span>
							{src.date && <span className="text-muted-foreground ml-2">({src.date})</span>}
							<span className={`ml-2 text-[11px] font-semibold rounded-md border px-1 py-0.5 ${SOURCE_TYPE_COLORS[src.type] ?? "bg-muted/50 text-muted-foreground border-border/60"}`}>
								{SOURCE_TYPE_LABELS[src.type] ?? src.type}
							</span>
							{src.url && (
								<span className="ml-2 text-primary inline-flex items-center gap-0.5">
									<ExternalLinkIcon className="size-2.5" />
									Link
								</span>
							)}
							{src.screenshot && <CameraIcon className="size-3 text-muted-foreground/50 ml-1.5 inline-block" />}
							{src.auditTrail && <ClockIcon className="size-3 text-muted-foreground/50 ml-1 inline-block" />}
							{src.companySearchTemplate && <SearchIcon className="size-3 text-muted-foreground/50 ml-1 inline-block" />}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}

/* ─── Source Detail Modal ─── */

function SourceDetailModal({ source, onClose }: { source: SourceCitation | null; onClose: () => void }) {
	if (!source) return null;

	const Icon = SOURCE_TYPE_ICONS[source.type] ?? FileTextIcon;
	const colorClass = SOURCE_TYPE_COLORS[source.type] ?? SOURCE_TYPE_COLORS.estimate;
	const typeLabel = SOURCE_TYPE_LABELS[source.type] ?? source.type;
	const s = source.screenshot;
	const a = source.auditTrail;
	const t = source.companySearchTemplate;

	const fmtTs = (iso: string) => {
		const d = new Date(iso);
		return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
	};

	return (
		<Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
			<DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2 mb-1">
						<span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-md border px-2 py-0.5 ${colorClass}`}>
							<Icon className="size-3" />
							{typeLabel}
						</span>
						{source.date && <span className="text-xs text-muted-foreground">{source.date}</span>}
					</div>
					<DialogTitle className="text-sm leading-snug">{source.label}</DialogTitle>
					{source.url && (
						<a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
							<ExternalLinkIcon className="size-3" />
							{source.url.length > 60 ? source.url.slice(0, 60) + "…" : source.url}
						</a>
					)}
				</DialogHeader>

				{/* Screenshot Placeholder */}
				{s && (
					<div className="rounded-lg border border-border overflow-hidden shadow-sm">
						{/* Browser chrome */}
						<div className="bg-[#e8eaed] px-3 py-2 flex items-center gap-2 border-b border-border/60">
							<div className="flex gap-1.5">
								<div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
								<div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
								<div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
							</div>
							<div className="flex-1 bg-white rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
								<div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.faviconColor }} />
								<span className="truncate">{s.domain}</span>
								<ShieldCheckIcon className="size-2.5 text-emerald-600 shrink-0 ml-auto" />
							</div>
						</div>
						{/* Page content mock */}
						<div className="bg-white p-4 min-h-[120px] relative">
							<div className="text-xs font-heading font-semibold text-foreground/80 mb-2 border-b border-border/40 pb-1.5">
								{s.pageTitle}
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{s.thumbnailDescription}
							</p>
							{/* Capture watermark */}
							<div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-muted-foreground/50 bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 border border-border/30">
								<CameraIcon className="size-2.5" />
								Captured: {fmtTs(s.capturedAt)}
							</div>
						</div>
					</div>
				)}

				{/* Audit Trail */}
				{a && (
					<div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
						<div className="flex items-center gap-1.5">
							<ClipboardListIcon className="size-3.5 text-muted-foreground" />
							<span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Audit Trail</span>
						</div>
						<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<GlobeIcon className="size-3 shrink-0" />
								First accessed
							</div>
							<div className="font-mono tabular-nums">{fmtTs(a.firstAccessed)}</div>
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<RefreshCwIcon className="size-3 shrink-0" />
								Last accessed
							</div>
							<div className="font-mono tabular-nums">{fmtTs(a.lastAccessed)}</div>
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<CameraIcon className="size-3 shrink-0" />
								Screenshot captured
							</div>
							<div className="font-mono tabular-nums">{fmtTs(a.screenshotCaptured)}</div>
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<ShieldCheckIcon className="size-3 shrink-0" />
								Verified by
							</div>
							<div>{a.verifiedBy}</div>
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<HashIcon className="size-3 shrink-0" />
								Access count
							</div>
							<div>{a.accessCount} request{a.accessCount !== 1 ? "s" : ""}</div>
						</div>
					</div>
				)}

				{/* Company Search Template */}
				{t && (
					<div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
						<div className="flex items-center gap-1.5">
							<SearchIcon className="size-3.5 text-muted-foreground" />
							<span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Company Search Template</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="font-heading font-semibold">{t.registryName}</span>
							<span className="text-muted-foreground">{t.jurisdiction}</span>
						</div>
						<div className="rounded-md border border-border bg-card p-3 space-y-2">
							<div className="text-xs text-muted-foreground font-medium mb-1">{t.searchType}</div>
							{t.searchFields.map((f, i) => (
								<div key={i} className="flex items-center gap-2">
									<label className="text-xs text-muted-foreground w-28 shrink-0">{f.label}</label>
									<div className="flex-1 text-sm font-mono bg-muted/40 border border-border/60 rounded px-2 py-1">{f.value}</div>
								</div>
							))}
							<div className="flex items-center gap-2 mt-2">
								<div className="bg-primary/10 text-primary text-xs font-heading font-semibold px-4 py-1.5 rounded-md border border-primary/20 opacity-60">
									Search Registry
								</div>
								{t.registryUrl && (
									<a href={t.registryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
										<ExternalLinkIcon className="size-2.5" />
										Open registry
									</a>
								)}
							</div>
						</div>
					</div>
				)}

				{/* No evidence fallback */}
				{!s && !a && !t && (
					<div className="rounded-lg border border-border/60 border-dashed bg-muted/10 p-4 text-center text-xs text-muted-foreground">
						<SparklesIcon className="size-5 mx-auto mb-1.5 text-muted-foreground/40" />
						Analyst estimate — no external source document available.<br />
						This figure is derived from industry benchmarks and public reporting.
					</div>
				)}

				<DialogFooter showCloseButton>
					{source.url && (
						<a href={source.url} target="_blank" rel="noopener noreferrer">
							<Button variant="default" size="sm" className="gap-1.5 font-heading">
								<ExternalLinkIcon className="size-3" />
								Open Source
							</Button>
						</a>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* ─── Client Documents Section ─── */

const DOC_STATUS_STYLES: Record<ClientDocument["status"], { icon: typeof FileCheckIcon; color: string; bg: string; label: string }> = {
	verified: { icon: FileCheckIcon, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Verified" },
	pending: { icon: ClockIcon, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Pending Review" },
	flagged: { icon: FileWarningIcon, color: "text-red-700 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Flagged" },
	expired: { icon: FileXIcon, color: "text-muted-foreground", bg: "bg-muted/50 border-border", label: "Expired" },
};

const DOC_TYPE_LABELS: Record<ClientDocument["type"], string> = {
	passport: "Passport / National ID",
	"bank-statement": "Bank Statement",
	"tax-return": "Tax Return",
	"share-certificate": "Share Certificate",
	"property-deed": "Property Deed",
	"trust-deed": "Trust Deed",
	"incorporation-cert": "Certificate of Incorporation",
	"annual-return": "Annual Return",
	"reference-letter": "Reference Letter",
	other: "Other Document",
};

function ClientDocumentsSection({ documents }: { documents: ClientDocument[] }) {
	const verified = documents.filter((d) => d.status === "verified").length;
	const total = documents.length;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-2">
					<FolderOpenIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Client-Submitted Documents</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground font-heading">{verified}/{total} verified</span>
					<div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
						<div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(verified / total) * 100}%` }} />
					</div>
				</div>
			</div>

			<div className="space-y-2.5">
				{documents.map((doc) => {
					const st = DOC_STATUS_STYLES[doc.status];
					const StatusIcon = st.icon;
					return (
						<div key={doc.id} className={`flex items-start gap-3 rounded-xl border p-3.5 ${st.bg}`}>
							<div className={`mt-0.5 ${st.color}`}>
								<FileTextIcon className="size-4" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-heading font-medium">{doc.label}</span>
									<span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${st.bg} ${st.color}`}>
										<StatusIcon className="size-2.5" />
										{st.label}
									</span>
								</div>
								<p className="text-sm text-muted-foreground mt-0.5">{doc.fileDescription}</p>
								<div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
									<span>Type: {DOC_TYPE_LABELS[doc.type]}</span>
									<span className="text-muted-foreground/30">|</span>
									<span>Submitted: {doc.submittedDate}</span>
									<span className="text-muted-foreground/30">|</span>
									<span>By: {doc.submittedBy}</span>
								</div>
								{doc.governmentAuthority && (
									<div className="flex items-center gap-1.5 mt-1.5">
										<LandmarkIcon className="size-3 text-sky-600" />
										<span className="text-xs font-semibold text-sky-700 dark:text-sky-400">Gov. Authority: {doc.governmentAuthority}</span>
									</div>
								)}
								{doc.verificationNotes && (
									<p className="text-xs text-muted-foreground/80 mt-1 italic">{doc.verificationNotes}</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Cross-Reference Table ─── */

const MATCH_STYLES: Record<CrossReference["match"], { color: string; bg: string; label: string; icon: typeof CheckCircle2Icon }> = {
	exact: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Exact Match", icon: CheckCircle2Icon },
	partial: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Partial Match", icon: AlertTriangleIcon },
	mismatch: { color: "text-red-700 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Mismatch", icon: XCircleIcon },
	"not-available": { color: "text-muted-foreground", bg: "bg-muted/50 border-border", label: "N/A", icon: InfoIcon },
};

function CrossReferenceTable({ crossRefs }: { crossRefs: CrossReference[] }) {
	const exactCount = crossRefs.filter((r) => r.match === "exact").length;
	const totalFields = crossRefs.length;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-2">
					<ArrowLeftRightIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Cross-Reference Verification</p>
				</div>
				<div className="flex items-center gap-3 text-xs text-muted-foreground font-heading">
					<span className="flex items-center gap-1"><CheckCircle2Icon className="size-3 text-emerald-500" />{exactCount} exact</span>
					<span className="flex items-center gap-1"><AlertTriangleIcon className="size-3 text-amber-500" />{crossRefs.filter((r) => r.match === "partial").length} partial</span>
					<span className="flex items-center gap-1"><XCircleIcon className="size-3 text-red-500" />{crossRefs.filter((r) => r.match === "mismatch").length} mismatch</span>
				</div>
			</div>

			{/* Overall match rate bar */}
			<div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-muted/30 border border-border">
				<div className="text-xs font-heading font-medium text-muted-foreground">Match Rate</div>
				<div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
					<div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(exactCount / totalFields) * 100}%` }} />
				</div>
				<div className="text-sm font-heading font-semibold">{Math.round((exactCount / totalFields) * 100)}%</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border">
							<th className="text-left py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Field</th>
							<th className="text-left py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Client Doc</th>
							<th className="text-left py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Client Value</th>
							<th className="text-left py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">External Source</th>
							<th className="text-left py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">External Value</th>
							<th className="text-center py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Status</th>
							<th className="text-center py-2 px-3 text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Confidence</th>
						</tr>
					</thead>
					<tbody>
						{crossRefs.map((ref) => {
							const ms = MATCH_STYLES[ref.match];
							const MatchIcon = ms.icon;
							return (
								<tr key={ref.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
									<td className="py-2.5 px-3">
										<div className="font-heading font-medium text-xs">{ref.field}</div>
										{ref.verifiedVia && (
											<div className="flex items-center gap-1 mt-0.5">
												<LandmarkIcon className="size-2.5 text-sky-600" />
												<span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">{ref.verifiedVia}</span>
											</div>
										)}
									</td>
									<td className="py-2.5 px-3 text-xs text-muted-foreground">{ref.clientDocLabel}</td>
									<td className="py-2.5 px-3 text-xs font-mono">{ref.clientValue}</td>
									<td className="py-2.5 px-3 text-xs text-muted-foreground">{ref.externalSourceLabel}</td>
									<td className="py-2.5 px-3 text-xs font-mono">{ref.externalValue}</td>
									<td className="py-2.5 px-3 text-center">
										<span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${ms.bg} ${ms.color}`}>
											<MatchIcon className="size-2.5" />
											{ms.label}
										</span>
									</td>
									<td className="py-2.5 px-3 text-center">
										<span className={`text-xs font-mono font-semibold ${ref.confidence >= 90 ? "text-emerald-600" : ref.confidence >= 60 ? "text-amber-600" : "text-red-600"}`}>
											{ref.confidence}%
										</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Notes section */}
			{crossRefs.some((r) => r.notes) && (
				<div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border/50">
					<p className="text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-2">Verification Notes</p>
					<div className="space-y-1">
						{crossRefs.filter((r) => r.notes).map((r) => (
							<p key={r.id} className="text-sm text-muted-foreground">
								<span className="font-medium text-foreground/80">{r.field}:</span> {r.notes}
							</p>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/* ─── Document Upload Slots ─── */

function DocumentUploadSlotsSection({ slots }: { slots: DocumentUploadSlot[] }) {
	const uploaded = slots.filter((s) => s.status === "uploaded").length;
	const pending = slots.filter((s) => s.status === "pending").length;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-2">
					<UploadIcon className="size-4 text-muted-foreground" />
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Document Upload</p>
				</div>
				<div className="flex items-center gap-3 text-xs text-muted-foreground font-heading">
					<span>{uploaded} uploaded</span>
					<span className="text-muted-foreground/30">|</span>
					<span>{pending} pending</span>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{slots.map((slot) => {
					const isUploaded = slot.status === "uploaded";
					const isPending = slot.status === "pending";
					return (
						<div
							key={slot.id}
							className={`relative rounded-xl border-2 border-dashed p-4 transition-all ${
								isUploaded
									? "border-emerald-500/30 bg-emerald-500/5"
									: isPending
									? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
									: "border-border bg-muted/10 hover:border-primary/30"
							}`}
						>
							<div className="flex items-start gap-3">
								<div className={`mt-0.5 p-1.5 rounded-lg ${isUploaded ? "bg-emerald-500/15" : isPending ? "bg-amber-500/15" : "bg-muted/50"}`}>
									{isUploaded ? (
										<FileCheckIcon className="size-4 text-emerald-600" />
									) : (
										<FilePlusIcon className="size-4 text-muted-foreground" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm font-heading font-medium">{slot.label}</span>
										{slot.required && !isUploaded && (
											<span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">Required</span>
										)}
										{!slot.required && (
											<span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-border">Optional</span>
										)}
									</div>
									<p className="text-sm text-muted-foreground mt-0.5">{slot.description}</p>
									{!isUploaded && (
										<button className="mt-2 inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-primary hover:text-primary/80 transition-colors">
											<UploadIcon className="size-3" />
											Upload Document
										</button>
									)}
									{isUploaded && (
										<div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 font-medium">
											<CheckCircle2Icon className="size-3" />
											Document uploaded
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
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
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Recommended Actions</p>
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

/* ─── Agent Verify Section ─── */

function AgentVerifySection({ verification: v, corroborationScores: cs }: { verification: AgentVerification; corroborationScores: CorroborationScores }) {
	const [expanded, setExpanded] = useState(false);
	const statusConfig = {
		verified: { label: "Verified", color: "text-emerald-700", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "✓" },
		"requires-review": { label: "Requires Review", color: "text-amber-700", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "⚠" },
		flagged: { label: "Flagged", color: "text-red-700", bg: "bg-red-500/10", border: "border-red-500/30", icon: "✗" },
	};
	const checkStatus = { pass: { color: "text-emerald-600", bg: "bg-emerald-500/10", icon: "✓", label: "Pass" }, warn: { color: "text-amber-600", bg: "bg-amber-500/10", icon: "⚠", label: "Warning" }, flag: { color: "text-red-600", bg: "bg-red-500/10", icon: "✗", label: "Flag" } };
	const categoryLabels = { consistency: "Consistency", correctness: "Correctness", completeness: "Completeness" };
	const categoryColors = { consistency: "bg-sky-500", correctness: "bg-violet-500", completeness: "bg-amber-500" };

	const sc = statusConfig[v.overallStatus];
	const passCount = v.checks.filter((c) => c.status === "pass").length;
	const warnCount = v.checks.filter((c) => c.status === "warn").length;
	const flagCount = v.checks.filter((c) => c.status === "flag").length;

	return (
		<div className={`rounded-2xl border ${sc.border} ${sc.bg} p-6 shadow-sm`}>
			{/* Header */}
			<div className="flex items-center justify-between mb-5">
				<div className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
						<BotIcon className="size-5 text-violet-600" />
					</div>
					<div>
						<div className="font-heading font-semibold text-sm flex items-center gap-2">
							{v.agentName}
							<span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${sc.bg} ${sc.border} ${sc.color}`}>
								{sc.icon} {sc.label}
							</span>
						</div>
						<p className="text-[11px] text-muted-foreground">Agent ID: {v.agentId} · Verified {new Date(v.timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
					</div>
				</div>
				<div className="hidden sm:flex items-center gap-3 text-xs font-heading">
					<span className="flex items-center gap-1 text-emerald-600"><CheckCircle2Icon className="size-3.5" /> {passCount} Pass</span>
					<span className="flex items-center gap-1 text-amber-600"><AlertTriangleIcon className="size-3.5" /> {warnCount} Warn</span>
					<span className="flex items-center gap-1 text-red-600"><XCircleIcon className="size-3.5" /> {flagCount} Flag</span>
				</div>
			</div>

			{/* Summary */}
			<div className="rounded-xl bg-background/50 border border-border/50 p-4 mb-4">
				<p className="text-sm text-foreground leading-relaxed">{v.summary}</p>
			</div>

			{/* MAS Reference */}
			<div className="rounded-lg bg-muted/30 px-3 py-2 mb-4 flex items-center gap-2">
				<BookOpenIcon className="size-3.5 text-muted-foreground shrink-0" />
				<p className="text-[10px] text-muted-foreground leading-snug">{cs.masReference}</p>
			</div>

			{/* Verification Checks */}
			<button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between mb-3 group">
				<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest">Verification Checks ({v.checks.length})</p>
				<ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
			</button>

			{expanded && (
				<div className="space-y-2 mb-5">
					{v.checks.map((check) => {
						const cs2 = checkStatus[check.status];
						return (
							<div key={check.id} className={`rounded-xl border border-border/50 bg-background/40 p-3`}>
								<div className="flex items-center gap-3 mb-1.5">
									<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cs2.bg} ${cs2.color}`}>{cs2.icon} {cs2.label}</span>
									<span className={`text-[9px] font-heading font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white ${categoryColors[check.category]}`}>{categoryLabels[check.category]}</span>
									<span className="text-xs font-heading font-medium">{check.label}</span>
								</div>
								<p className="text-[11px] text-muted-foreground leading-relaxed pl-1">{check.detail}</p>
							</div>
						);
					})}
				</div>
			)}

			{/* Recommendations */}
			{v.recommendations.length > 0 && (
				<div>
					<p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-3">Agent Recommendations</p>
					<div className="space-y-2">
						{v.recommendations.map((rec, i) => (
							<div key={i} className="flex items-start gap-2.5 rounded-lg bg-background/50 border border-border/50 px-3 py-2.5">
								<div className="flex items-center justify-center h-5 w-5 rounded-md bg-violet-500/15 text-violet-600 shrink-0 mt-0.5">
									<span className="text-[10px] font-heading font-bold">{i + 1}</span>
								</div>
								<p className="text-xs text-foreground leading-relaxed">{rec}</p>
							</div>
						))}
					</div>
				</div>
			)}
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
		const confColor = (v: number) => v >= 70 ? "#16a34a" : v >= 40 ? "#d97706" : "#dc2626";
		const statusColor = (s: string) => s === "critical" ? "#dc2626" : s === "warning" ? "#d97706" : "#16a34a";
		const matchLabel = (m: string) => m === "exact" ? "Exact Match" : m === "partial" ? "Partial Match" : m === "mismatch" ? "Mismatch" : "N/A";
		const matchColor = (m: string) => m === "exact" ? "#16a34a" : m === "partial" ? "#d97706" : m === "mismatch" ? "#dc2626" : "#6b7280";
		const docTypeLabels: Record<string, string> = { passport: "Passport / National ID", "bank-statement": "Bank Statement", "tax-return": "Tax Return", "share-certificate": "Share Certificate", "property-deed": "Property Deed", "trust-deed": "Trust Deed", "incorporation-cert": "Certificate of Incorporation", "annual-return": "Annual Return", "reference-letter": "Reference Letter", other: "Other Document" };
		const srcTypeLabels: Record<string, string> = { filing: "Regulatory Filing", news: "News Report", registry: "Corporate Registry", "market-data": "Market Data", "public-record": "Public Record", estimate: "Estimate / Analysis" };
		const td = (v: string, opts?: string) => `<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;${opts ?? ""}">${v}</td>`;

		/* ── Section 2: Key Risk Parameters ── */
		const paramRows = report.keyParameters.map((param) =>
			`<tr>${td(param.label)}${td(param.value, `font-weight:600;color:${statusColor(param.status)}`)}</tr>`
		).join("");

		/* ── Section 3: Wealth Composition ── */
		const wealthRows = report.wealthByCategory.filter((w) => w.totalUSD > 0).map((w) =>
			`<tr>${td(CATEGORY_LABELS[w.category])}${td(formatUSD(w.totalUSD), "text-align:right;font-family:monospace;")}${td(w.percentage.toFixed(1) + "%", "text-align:right;")}${td(w.avgConfidence + "%", `text-align:center;color:${confColor(w.avgConfidence)};font-weight:600;`)}</tr>`
		).join("");

		/* ── Section 4: Career Timeline ── */
		const timelineRows = report.careerTimeline.map((phase) =>
			`<tr>${td(phase.startYear + "–" + (phase.endYear ?? "Present"), "font-size:12px;")}${td(phase.title, "font-size:12px;font-weight:600;")}${td(phase.organization ?? "", "font-size:12px;")}${td(phase.location, "font-size:12px;")}${td(formatUSD(phase.cumulativeWealthUSD), "font-size:12px;text-align:right;font-family:monospace;")}</tr>`
		).join("");

		/* ── Section 5: Career Phase Detail with claims ── */
		const phaseDetailHtml = report.careerTimeline.map((phase, idx) => {
			const eventsHtml = phase.keyEvents.length > 0
				? `<div style="margin:8px 0"><div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Key Events</div>${phase.keyEvents.map((e) => `<div style="font-size:12px;margin:2px 0;padding-left:12px;border-left:2px solid #0891b2;">&#8226; ${e}</div>`).join("")}</div>`
				: "";
			const categoriesHtml = phase.categories.map((cat) => {
				const claimsHtml = cat.claims.map((claim) => {
					const srcList = claim.sources.map((s) => `<span style="display:inline-block;font-size:10px;padding:1px 6px;border-radius:4px;background:#f3f4f6;border:1px solid #e5e7eb;margin:1px 2px;">${s.label}${s.date ? ` (${s.date})` : ""}</span>`).join(" ");
					return `<div style="padding:6px 0;border-bottom:1px solid #f3f4f6;">
						<div style="display:flex;justify-content:space-between;align-items:center;">
							<span style="font-size:12px;flex:1;">${claim.description}</span>
							<span style="font-size:12px;font-family:monospace;font-weight:600;margin-left:12px;white-space:nowrap;">${formatUSD(claim.estimatedValueUSD)}</span>
						</div>
						<div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
							<div style="font-size:10px;color:#6b7280;">Confidence:</div>
							<div style="flex:0 0 100px;height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden;"><div style="height:100%;border-radius:3px;background:${confColor(claim.confidence)};width:${claim.confidence}%"></div></div>
							<span style="font-size:11px;font-weight:600;color:${confColor(claim.confidence)}">${claim.confidence}%</span>
							${claim.savingRate !== undefined ? `<span style="font-size:10px;padding:1px 6px;border-radius:4px;background:rgba(6,182,212,0.1);color:#0e7490;border:1px solid rgba(6,182,212,0.2);">${claim.savingRate}% saving rate</span>` : ""}
						</div>
						<div style="margin-top:4px;">${srcList}</div>
					</div>`;
				}).join("");
				return `<div style="margin:8px 0 12px;padding:10px 14px;border-radius:8px;border:1px solid #e5e7eb;background:#fafafa;">
					<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
						<div style="display:flex;align-items:center;gap:6px;">
							<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${CATEGORY_COLORS[cat.category]};"></span>
							<span style="font-size:12px;font-weight:600;">${CATEGORY_LABELS[cat.category]}</span>
						</div>
						<div style="font-size:12px;font-weight:700;">${formatUSD(cat.subtotalUSD)} <span style="font-weight:400;color:${confColor(cat.avgConfidence)};">(${cat.avgConfidence}% conf.)</span></div>
					</div>
					${claimsHtml}
				</div>`;
			}).join("");
			return `<div style="margin-bottom:20px;padding:16px;border:1px solid #d1d5db;border-radius:10px;background:white;">
				<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
					<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#0891b2;color:white;font-size:13px;font-weight:700;">${idx + 1}</span>
					<div>
						<span style="font-size:14px;font-weight:600;">${phase.title}</span>
						${phase.organization ? `<span style="font-size:12px;color:#6b7280;"> — ${phase.organization}</span>` : ""}
						<div style="font-size:11px;color:#6b7280;">${phase.startYear}–${phase.endYear ?? "Present"} · ${phase.location} · <span style="font-weight:600;color:#111;">${formatUSD(phase.cumulativeWealthUSD)} cumulative</span></div>
					</div>
				</div>
				<p style="font-size:12px;color:#4b5563;line-height:1.6;margin:8px 0;">${phase.description}</p>
				${eventsHtml}
				${categoriesHtml}
			</div>`;
		}).join("");

		/* ── Section 6: Entity Network (flatten tree) ── */
		const flattenNodes = (nodes: CompanyNode[], depth = 0): string => {
			return nodes.map((node) => {
				const indent = depth * 20;
				const statusColors: Record<string, string> = { active: "#16a34a", ipo: "#0891b2", exited: "#6b7280", restructured: "#d97706", delisted: "#dc2626", dissolved: "#9ca3af", pending: "#6366f1" };
				const sColor = statusColors[node.status] ?? "#6b7280";
				const row = `<div style="padding:6px 12px 6px ${12 + indent}px;border-bottom:1px solid #f3f4f6;font-size:12px;">
					<span style="font-weight:600;">${node.name}</span>
					<span style="display:inline-block;font-size:10px;padding:1px 6px;border-radius:4px;color:${sColor};border:1px solid ${sColor}33;background:${sColor}11;margin-left:6px;text-transform:capitalize;">${node.status}</span>
					<br/><span style="color:#6b7280;font-size:11px;">${node.role}${node.ownership ? ` · ${node.ownership}` : ""}${node.valuation ? ` · ${node.valuation}` : ""}${node.jurisdiction ? ` · ${node.jurisdiction}` : ""}</span>
				</div>`;
				const children = node.children ? flattenNodes(node.children, depth + 1) : "";
				return row + children;
			}).join("");
		};
		const entityHtml = flattenNodes(report.companyNodes);

		/* ── Section 7: Narrative ── */
		const narrativeHtml = report.narrative.split("\n\n").map((para) =>
			`<p style="margin:0 0 12px 0;font-size:13px;line-height:1.7;color:#374151;">${para.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;font-weight:500;">$1</a>')}</p>`
		).join("");

		/* ── Section 8: Source Citations ── */
		const allSources = new Map<string, SourceCitation>();
		for (const phase of report.careerTimeline) {
			for (const cat of phase.categories) {
				for (const claim of cat.claims) {
					for (const src of claim.sources) {
						allSources.set(src.id, src);
					}
				}
			}
		}
		const sourcesArr = Array.from(allSources.values());
		const sourceRows = sourcesArr.map((src, i) =>
			`<tr>${td((i + 1).toString(), "text-align:center;color:#6b7280;font-family:monospace;font-size:11px;")}${td(src.label, "font-weight:500;")}${td(srcTypeLabels[src.type] ?? src.type, "font-size:11px;")}${td(src.date ?? "—", "font-size:11px;color:#6b7280;")}${td(src.url ? `<a href="${src.url}" style="color:#0891b2;text-decoration:none;">Link</a>` : "—", "font-size:11px;text-align:center;")}</tr>`
		).join("");

		/* ── Section 9: Client Documents ── */
		const docStatusColor = (s: string) => s === "verified" ? "#16a34a" : s === "pending" ? "#d97706" : s === "flagged" ? "#dc2626" : "#6b7280";
		const docRows = report.clientDocuments.map((doc) =>
			`<tr>${td(doc.label, "font-weight:500;")}${td(docTypeLabels[doc.type] ?? doc.type, "font-size:11px;")}${td(`<span style="color:${docStatusColor(doc.status)};font-weight:600;text-transform:capitalize;">${doc.status}</span>`)}${td(doc.submittedDate, "font-size:11px;color:#6b7280;")}${td(doc.submittedBy, "font-size:11px;color:#6b7280;")}${td(doc.governmentAuthority ?? "—", "font-size:11px;color:#6b7280;")}</tr>`
		).join("");

		/* ── Section 10: Cross-Reference Verification ── */
		const exactCount = report.crossReferences.filter((r) => r.match === "exact").length;
		const matchRate = Math.round((exactCount / report.crossReferences.length) * 100);
		const crossRefRows = report.crossReferences.map((ref) =>
			`<tr>${td(ref.field, "font-weight:500;")}${td(ref.clientValue, "font-family:monospace;font-size:11px;")}${td(ref.clientDocLabel, "font-size:11px;color:#6b7280;")}${td(ref.externalValue, "font-family:monospace;font-size:11px;")}${td(ref.externalSourceLabel, "font-size:11px;color:#6b7280;")}${td(`<span style="color:${matchColor(ref.match)};font-weight:600;">${matchLabel(ref.match)}</span>`, "text-align:center;")}${td(`<span style="color:${confColor(ref.confidence)};font-weight:600;">${ref.confidence}%</span>`, "text-align:center;")}</tr>`
		).join("");
		const verificationNotes = report.crossReferences.filter((r) => r.notes).map((r) =>
			`<p style="font-size:12px;margin:4px 0;"><strong>${r.field}:</strong> ${r.notes}</p>`
		).join("");

		/* ── Section 11: PEP / Sanctions Screening ── */
		const scr = report.screeningResult;
		const scrStatusColor = scr.overallStatus === "Clear" ? "#16a34a" : scr.overallStatus === "Review Required" ? "#d97706" : "#dc2626";

		/* ── Section 12: Document Upload Status ── */
		const uploadedCount = report.uploadSlots.filter((s) => s.status === "uploaded").length;
		const pendingCount = report.uploadSlots.filter((s) => s.status === "pending").length;
		const uploadRows = report.uploadSlots.map((slot) => {
			const sColor = slot.status === "uploaded" ? "#16a34a" : slot.status === "pending" ? "#d97706" : "#6b7280";
			return `<tr>${td(slot.label, "font-weight:500;")}${td(slot.description, "font-size:11px;color:#6b7280;")}${td(slot.required ? "Required" : "Optional", "font-size:11px;text-align:center;")}${td(`<span style="color:${sColor};font-weight:600;text-transform:capitalize;">${slot.status}</span>`, "text-align:center;")}</tr>`;
		}).join("");

		/* ── Section 13: Recommended Actions ── */
		const actions = p.riskRating === "High"
			? [{ label: "Enhanced Due Diligence Review", desc: "Requires senior compliance officer review before onboarding" }, { label: "Verify Crypto Holdings On-chain", desc: "Cross-reference declared token holdings with blockchain explorer data" }, { label: "Set Weekly Monitoring", desc: "Enable weekly screening for price movements, adverse media, and regulatory changes" }]
			: p.riskRating === "Medium"
			? [{ label: "Set Monthly Monitoring", desc: "Enable monthly screening for adverse media and regulatory changes" }, { label: "Schedule Periodic Review", desc: "Set next review date per enhanced monitoring policy" }, { label: "Request Supporting Documents", desc: "Obtain additional documentation for lower-confidence wealth claims" }]
			: [{ label: "Approve for Onboarding", desc: "All checks passed — eligible for standard onboarding" }, { label: "Set Quarterly Monitoring", desc: "Enable quarterly screening per standard monitoring policy" }];
		const actionsHtml = actions.map((a) =>
			`<div style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:6px;"><div style="font-size:13px;font-weight:600;">&#9744; ${a.label}</div><div style="font-size:11px;color:#6b7280;margin-top:2px;">${a.desc}</div></div>`
		).join("");

		/* ══════════════ Assemble Full HTML ══════════════ */
		const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>HNW Wealth Report — ${p.name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap');
@media print{body{margin:0;padding:20px}.page-break{page-break-before:always}.no-print{display:none}}
body{font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#1f2937;max-width:900px;margin:0 auto;padding:40px 32px;font-size:13px;line-height:1.5}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:8px 12px;background:#f3f4f6;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:2px solid #d1d5db;font-family:'Inter',sans-serif}
h1{font-size:22px;margin:0;font-family:'Inter',sans-serif}
h2{font-size:16px;margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #e5e7eb;color:#111827;text-transform:uppercase;letter-spacing:.04em;font-family:'Inter',sans-serif}
h3{font-size:14px;margin:20px 0 8px;color:#1f2937;font-family:'Inter',sans-serif}
a{color:#0891b2}
</style></head><body>

<!-- Header -->
<div style="border-bottom:3px solid #1e3a5f;padding-bottom:16px;margin-bottom:24px">
	<div style="display:flex;justify-content:space-between;align-items:flex-start;">
		<div>
			<div style="font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#6b7280;margin-bottom:4px">Confidential — HNW Wealth Intelligence Report</div>
			<h1>Source of Wealth Assessment</h1>
			<div style="font-size:13px;color:#6b7280;margin-top:6px">Subject: <strong>${p.name}${p.nameCn ? ` (${p.nameCn})` : ""}</strong> | Generated: ${now}</div>
		</div>
		<div style="text-align:right;font-size:11px;color:#6b7280;">
			<div style="font-weight:700;color:#0891b2;font-size:12px;">Fill Easy</div>
			<div>Wealth Intelligence Engine</div>
			<div>CorpVerify · GovVerify · China Cross-Border</div>
		</div>
	</div>
</div>

<!-- Summary Cards -->
<div style="display:flex;gap:16px;margin-bottom:24px">
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280">Risk Rating</div>
		<div style="font-size:18px;font-weight:700;color:${riskColor};margin-top:2px">${p.riskRating} (${p.riskScore}/100)</div>
	</div>
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280">Est. Net Worth</div>
		<div style="font-size:18px;font-weight:700;margin-top:2px">${formatUSD(report.totalEstimatedWealthUSD)}</div>
	</div>
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280">Overall Confidence</div>
		<div style="font-size:18px;font-weight:700;margin-top:2px">${report.overallConfidence}%</div>
	</div>
	<div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6">
		<div style="font-size:10px;text-transform:uppercase;color:#6b7280">Sources Cited</div>
		<div style="font-size:18px;font-weight:700;margin-top:2px">${sourcesArr.length}</div>
	</div>
</div>

<!-- Corroboration Risk Score -->
<div style="margin-bottom:24px;padding:20px;border-radius:10px;border:1px solid #d1d5db;background:#f8fafc;">
	<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
		<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;">Corroboration Risk Score</div>
		<div style="font-size:10px;padding:2px 8px;border-radius:4px;background:#0891b215;color:#0891b2;font-weight:600;">MAS 3C Framework</div>
	</div>
	<div style="font-size:10px;color:#6b7280;margin-bottom:14px;">MAS Notice 626 §6.18–6.22 — Consistency, Correctness &amp; Completeness</div>
	<div style="display:flex;gap:16px;">
		<div style="flex:1;padding:10px 14px;border-radius:8px;background:white;border:1px solid #e5e7eb;">
			<div style="font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:.04em;">Consistency Risk</div>
			<div style="font-size:22px;font-weight:700;color:${report.corroborationScores.consistency >= 60 ? "#dc2626" : report.corroborationScores.consistency >= 40 ? "#d97706" : "#16a34a"};margin:4px 0 6px">${report.corroborationScores.consistency}/100</div>
			<div style="height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden;"><div style="height:100%;border-radius:3px;background:${report.corroborationScores.consistency >= 60 ? "#dc2626" : report.corroborationScores.consistency >= 40 ? "#d97706" : "#16a34a"};width:${report.corroborationScores.consistency}%"></div></div>
			<div style="font-size:10px;color:#6b7280;margin-top:4px;">Career-to-wealth trajectory alignment</div>
		</div>
		<div style="flex:1;padding:10px 14px;border-radius:8px;background:white;border:1px solid #e5e7eb;">
			<div style="font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:.04em;">Correctness Risk</div>
			<div style="font-size:22px;font-weight:700;color:${report.corroborationScores.correctness >= 60 ? "#dc2626" : report.corroborationScores.correctness >= 40 ? "#d97706" : "#16a34a"};margin:4px 0 6px">${report.corroborationScores.correctness}/100</div>
			<div style="height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden;"><div style="height:100%;border-radius:3px;background:${report.corroborationScores.correctness >= 60 ? "#dc2626" : report.corroborationScores.correctness >= 40 ? "#d97706" : "#16a34a"};width:${report.corroborationScores.correctness}%"></div></div>
			<div style="font-size:10px;color:#6b7280;margin-top:4px;">Factual accuracy of data points</div>
		</div>
		<div style="flex:1;padding:10px 14px;border-radius:8px;background:white;border:1px solid #e5e7eb;">
			<div style="font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:.04em;">Completeness Risk</div>
			<div style="font-size:22px;font-weight:700;color:${report.corroborationScores.completeness >= 60 ? "#dc2626" : report.corroborationScores.completeness >= 40 ? "#d97706" : "#16a34a"};margin:4px 0 6px">${report.corroborationScores.completeness}/100</div>
			<div style="height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden;"><div style="height:100%;border-radius:3px;background:${report.corroborationScores.completeness >= 60 ? "#dc2626" : report.corroborationScores.completeness >= 40 ? "#d97706" : "#16a34a"};width:${report.corroborationScores.completeness}%"></div></div>
			<div style="font-size:10px;color:#6b7280;margin-top:4px;">Material wealth source coverage</div>
		</div>
	</div>
</div>

<h2>1. Subject Profile</h2>
<table>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:160px">Full Name</td><td style="padding:4px 0;font-size:13px">${p.name}${p.nameCn ? ` (${p.nameCn})` : ""}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Date of Birth</td><td style="padding:4px 0;font-size:13px">${p.dateOfBirth} (Age ${p.age})</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Nationality</td><td style="padding:4px 0;font-size:13px">${p.nationality}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Residences</td><td style="padding:4px 0;font-size:13px">${p.residences.join(", ")}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Primary Industry</td><td style="padding:4px 0;font-size:13px">${p.primaryIndustry}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Net Worth Source</td><td style="padding:4px 0;font-size:13px">${p.netWorthSource}</td></tr>
</table>

<h2>2. Key Risk Parameters</h2>
<table><tr><th>Parameter</th><th>Assessment</th></tr>${paramRows}</table>

<h2>3. Wealth Composition</h2>
<table><tr><th>Category</th><th style="text-align:right">Value (USD)</th><th style="text-align:right">Allocation</th><th style="text-align:center">Confidence</th></tr>${wealthRows}</table>

<div class="page-break"></div>

<h2>4. Career Timeline</h2>
<table><tr><th>Period</th><th>Phase</th><th>Organization</th><th>Location</th><th style="text-align:right">Cumulative Wealth</th></tr>${timelineRows}</table>

<h2>5. Career Phase Detail — Wealth Claims &amp; Source Citations</h2>
${phaseDetailHtml}

<div class="page-break"></div>

<h2>6. Related Entity Network</h2>
<p style="font-size:12px;color:#6b7280;margin-bottom:8px;">${report.companyNodes.length} direct entities — verified via Fill Easy CorpVerify</p>
<div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">${entityHtml}</div>

<h2>7. Wealth Narrative</h2>
${narrativeHtml}

<div class="page-break"></div>

<h2>8. PEP / Sanctions Screening</h2>
<div style="padding:12px 16px;border-radius:8px;border:1px solid ${scrStatusColor}33;background:${scrStatusColor}08;margin-bottom:16px;">
	<div style="font-size:10px;text-transform:uppercase;color:#6b7280">Screening Status</div>
	<div style="font-size:16px;font-weight:700;color:${scrStatusColor};margin-top:2px">${scr.overallStatus}</div>
</div>
<table>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:180px">Subject</td><td style="padding:4px 0;font-size:13px">${scr.subjectName}${scr.subjectNameCn ? ` (${scr.subjectNameCn})` : ""}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Last Screened</td><td style="padding:4px 0;font-size:13px">${scr.lastScreened}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Lists Checked</td><td style="padding:4px 0;font-size:13px">${scr.listsChecked.join(", ")}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">PEP Hits</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:${scr.pepHits > 0 ? "#d97706" : "#16a34a"}">${scr.pepHits}${scr.pepDetails ? ` — ${scr.pepDetails}` : ""}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Sanctions Hits</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:${scr.sanctionsHits > 0 ? "#dc2626" : "#16a34a"}">${scr.sanctionsHits}</td></tr>
	<tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Adverse Media</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:${scr.adverseMedia > 0 ? "#d97706" : "#16a34a"}">${scr.adverseMedia}${scr.adverseMediaDetails ? ` — ${scr.adverseMediaDetails}` : ""}</td></tr>
</table>

<h2>9. Source Citations (${sourcesArr.length} total)</h2>
<table><tr><th style="text-align:center;width:30px">#</th><th>Source</th><th>Type</th><th>Date</th><th style="text-align:center">Link</th></tr>${sourceRows}</table>

<div class="page-break"></div>

<h2>10. Client-Submitted Documents</h2>
<p style="font-size:12px;color:#6b7280;margin-bottom:8px;">${report.clientDocuments.filter((d) => d.status === "verified").length} of ${report.clientDocuments.length} documents verified</p>
<table><tr><th>Document</th><th>Type</th><th>Status</th><th>Date</th><th>Submitted By</th><th>Gov. Authority</th></tr>${docRows}</table>

<h2>11. Cross-Reference Verification</h2>
<div style="padding:8px 14px;border-radius:8px;background:#f3f4f6;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
	<span style="font-size:12px;color:#6b7280;">Match Rate:</span>
	<div style="flex:1;height:8px;border-radius:4px;background:#e5e7eb;overflow:hidden;"><div style="height:100%;border-radius:4px;background:#16a34a;width:${matchRate}%"></div></div>
	<span style="font-size:13px;font-weight:700;">${matchRate}%</span>
	<span style="font-size:11px;color:#6b7280;">(${exactCount} exact / ${report.crossReferences.length} fields)</span>
</div>
<table><tr><th>Field</th><th>Client Value</th><th>Client Doc</th><th>External Value</th><th>External Source</th><th style="text-align:center">Status</th><th style="text-align:center">Conf.</th></tr>${crossRefRows}</table>
${verificationNotes ? `<div style="margin-top:12px;padding:10px 14px;border-radius:8px;background:#fafafa;border:1px solid #e5e7eb;"><div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Verification Notes</div>${verificationNotes}</div>` : ""}

<h2>12. Document Upload Status</h2>
<p style="font-size:12px;color:#6b7280;margin-bottom:8px;">${uploadedCount} uploaded · ${pendingCount} pending</p>
<table><tr><th>Document</th><th>Description</th><th style="text-align:center">Required</th><th style="text-align:center">Status</th></tr>${uploadRows}</table>

<h2>13. Recommended Actions</h2>
${actionsHtml}

<div class="page-break"></div>

<h2>14. Fill Easy Verification Agent</h2>
${(() => {
	const av = report.agentVerification;
	const avStatusColor = av.overallStatus === "verified" ? "#16a34a" : av.overallStatus === "flagged" ? "#dc2626" : "#d97706";
	const avStatusLabel = av.overallStatus === "verified" ? "VERIFIED" : av.overallStatus === "flagged" ? "FLAGGED" : "REQUIRES REVIEW";
	const avPassCount = av.checks.filter((c) => c.status === "pass").length;
	const avWarnCount = av.checks.filter((c) => c.status === "warn").length;
	const avFlagCount = av.checks.filter((c) => c.status === "flag").length;
	const checkStatusIcon = (s: string) => s === "pass" ? "&#10003;" : s === "warn" ? "&#9888;" : "&#10007;";
	const checkStatusColor = (s: string) => s === "pass" ? "#16a34a" : s === "warn" ? "#d97706" : "#dc2626";
	const catLabel = (c: string) => c === "consistency" ? "Consistency" : c === "correctness" ? "Correctness" : "Completeness";
	const checksHtml = av.checks.map((ch) =>
		`<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:center;"><span style="color:${checkStatusColor(ch.status)};font-weight:700;">${checkStatusIcon(ch.status)}</span></td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;"><span style="display:inline-block;font-size:9px;padding:1px 6px;border-radius:3px;background:#f3f4f6;border:1px solid #e5e7eb;margin-right:6px;text-transform:uppercase;letter-spacing:.04em;">${catLabel(ch.category)}</span>${ch.label}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${ch.detail}</td></tr>`
	).join("");
	const recsHtml = av.recommendations.map((r, i) =>
		`<div style="padding:6px 12px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:4px;font-size:12px;display:flex;gap:8px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#0891b215;color:#0891b2;font-size:10px;font-weight:700;flex-shrink:0;">${i + 1}</span><span>${r}</span></div>`
	).join("");
	return `<div style="padding:16px 20px;border-radius:10px;border:1px solid ${avStatusColor}33;background:${avStatusColor}08;margin-bottom:16px;">
		<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
			<div style="display:flex;align-items:center;gap:8px;">
				<div style="font-size:14px;font-weight:700;">Fill Easy Verification Agent</div>
				<span style="font-size:10px;padding:2px 8px;border-radius:4px;background:${avStatusColor}15;color:${avStatusColor};font-weight:700;text-transform:uppercase;letter-spacing:.06em;">${avStatusLabel}</span>
			</div>
			<div style="font-size:11px;color:#6b7280;">
				<span style="color:#16a34a;font-weight:600;">${avPassCount} Pass</span> · <span style="color:#d97706;font-weight:600;">${avWarnCount} Warn</span> · <span style="color:#dc2626;font-weight:600;">${avFlagCount} Flag</span>
			</div>
		</div>
		<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">Agent ID: ${av.agentId} · Verified ${av.timestamp}</div>
		<p style="font-size:12px;color:#374151;line-height:1.6;margin:8px 0;">${av.summary}</p>
		<div style="font-size:10px;color:#6b7280;margin-top:8px;padding:6px 10px;border-radius:6px;background:white;border:1px solid #e5e7eb;">${report.corroborationScores.masReference}</div>
	</div>
	<h3>Verification Checks (${av.checks.length})</h3>
	<table><tr><th style="text-align:center;width:40px">Status</th><th>Check</th><th>Detail</th></tr>${checksHtml}</table>
	<h3>Agent Recommendations</h3>
	${recsHtml}`;
})()}

<!-- Footer -->
<div style="border-top:3px solid #1e3a5f;margin-top:40px;padding-top:16px;">
	<div style="display:flex;justify-content:space-between;align-items:flex-start;">
		<div style="font-size:11px;color:#9ca3af;line-height:1.7;">
			This report was generated by the <strong style="color:#0891b2;">Fill Easy</strong> Wealth Intelligence Engine using verified data from international registries, regulatory filings, market data providers, and on-chain analysis across 80+ jurisdictions.<br>
			Data sourced via <strong style="color:#0891b2;">Fill Easy</strong> CorpVerify, GovVerify, and China Cross-Border APIs.<br>
			All source citations are included in the assessment. This document is <strong>CONFIDENTIAL</strong> and for internal compliance use only.
		</div>
		<div style="text-align:right;font-size:11px;color:#9ca3af;white-space:nowrap;margin-left:24px;">
			<div style="font-weight:700;color:#0891b2;">Fill Easy Limited</div>
			<div>Generated: ${now}</div>
			<div>&copy; ${new Date().getFullYear()}</div>
		</div>
	</div>
</div>

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
   Compliance Chatbot
   ═══════════════════════════════════════════════════════════════ */

function ComplianceChatbot({ profileId, profileName, riskRating, report }: { profileId: string; profileName: string; riskRating: "Low" | "Medium" | "High"; report: HnwReport }) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"chat" | "attention" | "reminders">("chat");
	const [messages, setMessages] = useState<ChatMessage[]>(CHATBOT_INITIAL_MESSAGES[profileId] ?? []);
	const [reminders, setReminders] = useState<ChatReminder[]>(CHATBOT_REMINDERS[profileId] ?? []);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const attentionAreas = CHATBOT_ATTENTION_AREAS[profileId] ?? [];

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isTyping]);

	/* Build context string for the LLM from the report data */
	const profileContext = useMemo(() => {
		const p = report.profile;
		const cs = report.corroborationScores;
		const phases = report.careerTimeline.map((ph) => `${ph.startYear}–${ph.endYear ?? "Present"}: ${ph.title} (${ph.organization ?? ""}, ${ph.location}) — ${formatUSD(ph.cumulativeWealthUSD)} cumulative`).join("\n");
		const wealth = report.wealthByCategory.map((w) => `${CATEGORY_LABELS[w.category]}: ${formatUSD(w.totalUSD)} (${w.percentage.toFixed(1)}%, ${w.avgConfidence}% confidence)`).join("\n");
		const riskParams = report.keyParameters.map((kp) => `${kp.label}: ${kp.value} (${kp.status})`).join("\n");
		return `Name: ${p.name}${p.nameCn ? ` (${p.nameCn})` : ""}
Net Worth: ${formatUSD(report.totalEstimatedWealthUSD)}
Risk Rating: ${p.riskRating} (${p.riskScore}/100)
Overall Confidence: ${report.overallConfidence}%
Corroboration Scores: Consistency ${cs.consistency}/100, Correctness ${cs.correctness}/100, Completeness ${cs.completeness}/100
Nationality: ${p.nationality} | Residences: ${p.residences.join(", ")}
Industry: ${p.primaryIndustry}

Career Phases:
${phases}

Wealth Composition:
${wealth}

Key Risk Parameters:
${riskParams}

Agent Verification Status: ${report.agentVerification.overallStatus}
Agent Summary: ${report.agentVerification.summary}`;
	}, [report]);

	const handleSend = async () => {
		if (!inputValue.trim() || isTyping) return;
		const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", text: inputValue, timestamp: "Just now" };
		const updatedMessages = [...messages, userMsg];
		setMessages(updatedMessages);
		setInputValue("");
		setIsTyping(true);

		try {
			const res = await fetch("/api/compliance-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
					profileName,
					profileContext,
				}),
			});
			const data = await res.json();
			const reply = res.ok ? data.reply : (data.error ?? "Failed to get response");
			const botMsg: ChatMessage = { id: `bot-${Date.now()}`, role: "assistant", text: reply, timestamp: "Just now" };
			setMessages((prev) => [...prev, botMsg]);
		} catch {
			const botMsg: ChatMessage = { id: `bot-${Date.now()}`, role: "assistant", text: "Network error — unable to reach the AI service. Please try again.", timestamp: "Just now" };
			setMessages((prev) => [...prev, botMsg]);
		} finally {
			setIsTyping(false);
		}
	};

	const toggleReminder = (id: string) => {
		setReminders((prev) => prev.map((r) => r.id === id ? { ...r, completed: !r.completed } : r));
	};

	const deleteReminder = (id: string) => {
		setReminders((prev) => prev.filter((r) => r.id !== id));
	};

	/* ─── Auto-draft email for reminders ─── */
	const [draftingId, setDraftingId] = useState<string | null>(null);
	const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({});
	const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleDraftEmail = async (reminder: ChatReminder) => {
		if (draftingId) return;
		setDraftingId(reminder.id);
		setExpandedDraft(reminder.id);
		try {
			const res = await fetch("/api/compliance-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [{ role: "user", text: `Draft a professional follow-up email for this compliance action item:\n\nAction: ${reminder.label}\nDue Date: ${reminder.dueDate}\nPriority: ${reminder.priority}\nSubject: ${profileName}\n\nWrite a concise, professional email that a compliance officer would send to the relevant party (client, regulator, or internal team) requesting the information or action described. Include:\n- Professional subject line (on its own line prefixed with "Subject: ")\n- Appropriate salutation\n- Clear request referencing the HNW assessment for ${profileName}\n- Specific deadline (${reminder.dueDate})\n- Professional sign-off as "Compliance Team, [Institution Name]"\n\nKeep it under 200 words. Do not use markdown formatting.` }],
					profileName,
					profileContext,
				}),
			});
			const data = await res.json();
			if (res.ok && data.reply) {
				setEmailDrafts((prev) => ({ ...prev, [reminder.id]: data.reply }));
			} else {
				setEmailDrafts((prev) => ({ ...prev, [reminder.id]: `Error: ${data.error ?? "Failed to generate email draft"}` }));
			}
		} catch {
			setEmailDrafts((prev) => ({ ...prev, [reminder.id]: "Network error — unable to reach the AI service." }));
		} finally {
			setDraftingId(null);
		}
	};

	const copyDraft = async (id: string) => {
		const draft = emailDrafts[id];
		if (!draft) return;
		try {
			await navigator.clipboard.writeText(draft);
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 2000);
		} catch { /* clipboard not available */ }
	};

	const severityStyle = {
		critical: { bg: "bg-red-500/10", border: "border-red-500/30", dot: "bg-red-500", text: "text-red-700", badge: "Critical" },
		warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500", text: "text-amber-700", badge: "Warning" },
		info: { bg: "bg-sky-500/10", border: "border-sky-500/30", dot: "bg-sky-500", text: "text-sky-700", badge: "Info" },
	};

	const priorityStyle = {
		high: "bg-red-500/15 text-red-700 border-red-500/20",
		medium: "bg-amber-500/15 text-amber-700 border-amber-500/20",
		low: "bg-sky-500/15 text-sky-700 border-sky-500/20",
	};

	const overdueCount = reminders.filter(r => !r.completed && new Date(r.dueDate) < new Date()).length;

	return (
		<>
			{/* Floating trigger button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-200"
			>
				{isOpen ? <XIcon className="size-6" /> : <MessageSquareIcon className="size-6" />}
				{!isOpen && (attentionAreas.length + overdueCount) > 0 && (
					<span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background ${overdueCount > 0 ? "bg-red-500 animate-pulse" : "bg-red-500"}`}>
						{attentionAreas.length + overdueCount}
					</span>
				)}
			</button>

			{/* Popup overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-40 flex items-center justify-center p-4">
					{/* Backdrop */}
					<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

					{/* Panel */}
					<div className="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "min(720px, 85vh)" }}>
						{/* Header */}
						<div className="bg-gradient-to-r from-primary/10 to-transparent px-5 py-4 border-b border-border shrink-0">
							<div className="flex items-center gap-3">
								<div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
									<SparklesIcon className="size-5 text-primary" />
								</div>
								<div>
									<div className="font-heading font-semibold text-sm">Compliance Assistant</div>
									<div className="text-xs text-muted-foreground">{profileName} — AI-Powered Case Analysis</div>
								</div>
								<span className="ml-auto text-[9px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">AI · Claude Sonnet</span>
								<button onClick={() => setIsOpen(false)} className="ml-2 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
									<XIcon className="size-4" />
								</button>
							</div>
							{/* Tabs */}
							<div className="flex gap-1 mt-3">
								{(["chat", "attention", "reminders"] as const).map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors ${
											activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
										}`}
									>
										{tab === "chat" ? "Chat" : tab === "attention" ? `Attention (${attentionAreas.length})` : `Reminders (${reminders.filter(r => !r.completed).length})`}
									</button>
								))}
							</div>
						</div>

						{/* Content */}
						<div className="overflow-y-auto flex-1">
							{activeTab === "chat" && (
								<div className="p-4 space-y-3">
									{messages.map((msg) => (
										<div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
												msg.role === "user"
													? "bg-primary text-primary-foreground rounded-br-sm"
													: "bg-muted/60 text-foreground rounded-bl-sm"
											}`}>
												<p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
												<p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>{msg.timestamp}</p>
											</div>
										</div>
									))}
									{isTyping && (
										<div className="flex justify-start">
											<div className="bg-muted/60 rounded-xl rounded-bl-sm px-4 py-3">
												<div className="flex items-center gap-1.5">
													<div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
													<div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
													<div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
												</div>
											</div>
										</div>
									)}
									<div ref={messagesEndRef} />
								</div>
							)}

							{activeTab === "attention" && (
								<div className="p-4 space-y-3">
									{attentionAreas.map((area) => {
										const s = severityStyle[area.severity];
										return (
											<div key={area.id} className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
												<div className="flex items-center gap-2 mb-2">
													<div className={`h-2 w-2 rounded-full ${s.dot}`} />
													<span className={`text-xs font-heading font-semibold ${s.text}`}>{s.badge}</span>
													<span className="text-xs text-muted-foreground ml-auto">{area.section}</span>
												</div>
												<div className="font-heading font-semibold text-sm mb-1">{area.title}</div>
												<p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
											</div>
										);
									})}
								</div>
							)}

							{activeTab === "reminders" && (
								<div className="p-4 space-y-2">
									{reminders.map((reminder) => {
										const isOverdue = !reminder.completed && new Date(reminder.dueDate) < new Date();
										return (
										<div key={reminder.id} className={`rounded-xl border transition-all ${isOverdue ? "border-red-500/30 bg-red-500/5" : "border-border"} ${reminder.completed ? "opacity-50" : ""}`}>
											<div className="flex items-start gap-3 p-3">
												<button
													onClick={() => toggleReminder(reminder.id)}
													className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
														reminder.completed ? "bg-emerald-500 border-emerald-500" : "border-border hover:border-primary/50"
													}`}
												>
													{reminder.completed && <CheckIcon className="size-3 text-white" />}
												</button>
												<div className="flex-1 min-w-0">
													<p className={`text-sm leading-snug ${reminder.completed ? "line-through text-muted-foreground" : ""}`}>{reminder.label}</p>
													<div className="flex items-center gap-2 mt-1.5">
														<span className={`text-xs font-semibold rounded-md border px-1.5 py-0.5 ${priorityStyle[reminder.priority]}`}>{reminder.priority}</span>
														<span className="text-xs text-muted-foreground flex items-center gap-1">
															<CalendarIcon className="size-3" />{reminder.dueDate}
														</span>
														{isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">OVERDUE</span>}
														{!reminder.completed && (
															<button
																onClick={() => emailDrafts[reminder.id] ? setExpandedDraft(expandedDraft === reminder.id ? null : reminder.id) : handleDraftEmail(reminder)}
																disabled={draftingId === reminder.id}
																className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
															>
																{draftingId === reminder.id ? (
																	<><LoaderIcon className="size-3 animate-spin" />Drafting...</>
																) : emailDrafts[reminder.id] ? (
																	<><MailIcon className="size-3" />{expandedDraft === reminder.id ? "Hide Email" : "View Email"}</>
																) : (
																	<><MailIcon className="size-3" />Draft Email</>
																)}
															</button>
														)}
													</div>
												</div>
												<button onClick={() => deleteReminder(reminder.id)} className="text-muted-foreground/40 hover:text-red-500 transition-colors p-1">
													<Trash2Icon className="size-3.5" />
												</button>
											</div>
											{/* Expanded email draft */}
											{expandedDraft === reminder.id && emailDrafts[reminder.id] && (
												<div className="mx-3 mb-3 rounded-lg bg-muted/40 border border-border/60 overflow-hidden">
													<div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border/40">
														<span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-muted-foreground">AI-Generated Email Draft</span>
														<button
															onClick={() => copyDraft(reminder.id)}
															className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
														>
															{copiedId === reminder.id ? <><CheckCheck className="size-3 text-emerald-500" />Copied</> : <><CopyIcon className="size-3" />Copy</>}
														</button>
													</div>
													<pre className="px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground/90 max-h-48 overflow-y-auto">{emailDrafts[reminder.id]}</pre>
												</div>
											)}
										</div>
									);
									})}
									{reminders.length === 0 && (
										<div className="text-center py-8 text-sm text-muted-foreground">No reminders set for this case.</div>
									)}
								</div>
							)}
						</div>

						{/* Input (only for chat tab) */}
						{activeTab === "chat" && (
							<div className="px-4 py-3 border-t border-border bg-muted/20 shrink-0">
								<div className="flex items-center gap-2">
									<input
										type="text"
										value={inputValue}
										onChange={(e) => setInputValue(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleSend()}
										placeholder="Ask about risks, entities, wealth claims..."
										disabled={isTyping}
										className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50"
									/>
									<button
										onClick={handleSend}
										disabled={!inputValue.trim() || isTyping}
										className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
									>
										<SendIcon className="size-4" />
									</button>
								</div>
								<div className="flex flex-wrap gap-1.5 mt-2">
									{["What are the next actions?", "Explain the risk score", "Summarise key risks"].map((q) => (
										<button
											key={q}
											onClick={() => { setInputValue(q); }}
											disabled={isTyping}
											className="text-xs px-2.5 py-1 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
										>
											{q}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
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
	const sizeClass = size === "lg" ? "text-xs px-3 py-1" : "text-xs px-1.5 py-0.5";
	return <span className={`font-semibold rounded-md border ${colors[rating]} ${sizeClass}`}>{rating} Risk</span>;
}

function GradeBadge({ grade, confidence, size = "sm" }: { grade: CorroborationGrade; confidence?: number; size?: "sm" | "lg" }) {
	const cfg = GRADE_CONFIGS.find(g => g.grade === grade) ?? GRADE_CONFIGS[GRADE_CONFIGS.length - 1];
	const sizeClass = size === "lg" ? "text-sm px-3 py-1.5 gap-2" : "text-xs px-2 py-0.5 gap-1.5";
	return (
		<span className={`inline-flex items-center font-heading font-bold rounded-lg border ${cfg.bgColor} ${cfg.borderColor} ${cfg.color} ${sizeClass}`}>
			<span className={size === "lg" ? "text-base" : "text-xs"}>{grade}</span>
			{confidence !== undefined && <span className="font-normal opacity-70 text-[10px]">{confidence}%</span>}
		</span>
	);
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
		<span className={`inline-flex items-center gap-1 text-xs font-semibold ${styles[status]}`}>
			<Icon className="size-3" />
			{status}
		</span>
	);
}
