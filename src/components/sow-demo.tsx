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
	MessageSquareIcon,
	ArrowUpRightIcon,
	PauseCircleIcon,
	CalendarClockIcon,
	CircleCheckBigIcon,
	SearchIcon,
	PlusIcon,
	FolderOpenIcon,
	UploadIcon,
	InfoIcon,
	EyeIcon,
	FileCheckIcon,
	ExternalLinkIcon,
	RefreshCwIcon,
	SquareCheckIcon,
	NetworkIcon,
	TrendingUpIcon,
	FileBadgeIcon,
	ClipboardListIcon,
	StickyNoteIcon,
	WrenchIcon,
	CircleAlertIcon,
	UserCheckIcon,
	HistoryIcon,
	BadgeCheckIcon,
	TargetIcon,
	ListTodoIcon,
} from "lucide-react";
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
	SOW_CASES,
	DASHBOARD_ISSUES,
	type SowReport,
	type SowDataSource,
	type SowWealthItem,
	type ScreeningAlert,
	type DocumentEvidence,
	type AuditTrailEntry,
	type RemediationItem,
	type DashboardIssue,
} from "@/lib/sow-mock-data";

type Phase = "dashboard" | "intake" | "consent" | "sources" | "generating" | "report";

const STEPS = [
	{ key: "intake", label: "New Case" },
	{ key: "consent", label: "Consent" },
	{ key: "sources", label: "Data Sources" },
	{ key: "generating", label: "Assessment" },
	{ key: "report", label: "Report" },
] as const;

const SOURCE_PURPOSES: Record<string, string> = {
	"kyc-2fv": "Verify full name and ID number against the national population registry",
	"kyc-4fv": "Extended verification with ID card issue and expiry dates",
	"mobile-attr": "Check mobile registration — carrier, location, and tenure",
	"bank-3fv": "Confirm bank account ownership via name, ID, and card number",
	adverse: "Screen for criminal records, financial defaults, and adverse history",
	fraud: "Assess fraud risk from multi-platform borrowing patterns",
	litigation: "Search civil and criminal court records for litigation history",
	commercial: "Identify all commercial interests and shareholdings",
	"kyb-a": "Company verification — primary business association",
	"kyb-b": "Company verification — secondary business association",
	"kyb-c": "Company verification — tertiary business association",
	income: "Estimate annual income from social insurance contributions",
	tax: "Verify individual income tax filings for consistency",
};

const CATEGORY_META: Record<string, { description: string; Icon: typeof UserIcon; authority: string; legalBasis: string; dataType: string }> = {
	Identity: {
		description: "Cross-reference subject identity against the Ministry of Public Security population registry and telecom operator records.",
		Icon: ShieldCheckIcon,
		authority: "Ministry of Public Security (MPS)",
		legalBasis: "PRC Resident Identity Card Law, Article 3 — MPS maintains the national population information database. Identity verification is conducted through the National Citizen Identity Information Center (NCIIC).",
		dataType: "Full name, gender, date of birth, ID card number, issue/expiry dates. Mobile number attribution via telecom carrier registration records.",
	},
	Banking: {
		description: "Verify bank account ownership through the UnionPay interbank settlement network.",
		Icon: LandmarkIcon,
		authority: "China UnionPay / People's Bank of China (PBOC)",
		legalBasis: "PBOC Anti-Money Laundering Law (2006) and Measures for the Administration of Financial Institutions' Customer Identification. Bank account verification via the UnionPay interbank network cross-checks cardholder name, ID number, and bank card number.",
		dataType: "Bank card number, cardholder name, associated ID number. Returns match/mismatch status and bank issuer details.",
	},
	Risk: {
		description: "Screen for criminal records, civil litigation, financial fraud indicators, and adverse media mentions.",
		Icon: ShieldAlertIcon,
		authority: "People's Bank of China (PBOC) Credit Reference Center / Supreme People's Court",
		legalBasis: "PBOC credit reporting regulations and the Supreme People's Court judicial transparency platform (China Judgements Online). Adverse history checks reference the PBOC personal credit information database. Litigation records are sourced from the national court case database.",
		dataType: "Criminal records, civil judgments, enforcement records, financial default history, multi-platform borrowing patterns, and blacklist/sanctions screening results.",
	},
	Corporate: {
		description: "Search SAMR business registries for commercial interests and run full KYB verification reports on associated entities.",
		Icon: BuildingIcon,
		authority: "State Administration for Market Regulation (SAMR)",
		legalBasis: "PRC Company Law and SAMR National Enterprise Credit Information Publicity System. Commercial interest searches identify all companies where the subject serves as a legal representative, shareholder, or director. KYB reports include registration details, capital structure, and filing history.",
		dataType: "Company name, registration number, legal representative, shareholders, registered capital, establishment date, business scope, annual filing status, and regulatory penalties.",
	},
	Income: {
		description: "Estimate annual income bracket from MOHRSS social insurance contribution records.",
		Icon: BanknoteIcon,
		authority: "Ministry of Human Resources and Social Security (MOHRSS)",
		legalBasis: "PRC Social Insurance Law, Article 4 — employers must register employees and report contribution base amounts. Social insurance contributions (pension, medical, unemployment) are calculated as a percentage of salary, making contribution records a reliable proxy for declared income level.",
		dataType: "Monthly contribution base amount, employer name, contribution period, and derived annual income estimate. Data reflects the declared salary used for social insurance calculation.",
	},
	Tax: {
		description: "Verify individual income tax filings through the State Taxation Administration and check for year-over-year discrepancies.",
		Icon: FileTextIcon,
		authority: "State Taxation Administration (STA)",
		legalBasis: "PRC Individual Income Tax Law (2018 revision). Tax filing verification checks whether reported income is consistent with other data sources. Year-over-year comparison identifies unusual fluctuations that may indicate unreported income or tax evasion.",
		dataType: "Annual taxable income, tax paid, filing status, year-over-year income trends, and consistency flags against social insurance and employment records.",
	},
};

interface DashboardNotification {
	id: string;
	type: "review-due" | "alert" | "update" | "completed";
	title: string;
	detail: string;
	time: string;
	caseRef: string;
	read: boolean;
}

interface ExistingCase {
	caseRef: string;
	name: string;
	nameEn: string;
	riskRating: "Low" | "High";
	status: "Complete" | "Under Review" | "Pending EDD";
	createdDate: string;
	nextReview: string;
	alertCount: number;
}

const MOCK_EXISTING_CASES: ExistingCase[] = [
	{ caseRef: "SOW-2025-1203-412", name: "王建国", nameEn: "Wang Jianguo", riskRating: "Low", status: "Complete", createdDate: "03 Dec 2025", nextReview: "03 Dec 2026", alertCount: 0 },
	{ caseRef: "SOW-2025-0918-087", name: "张丽华", nameEn: "Zhang Lihua", riskRating: "High", status: "Under Review", createdDate: "18 Sep 2025", nextReview: "18 Mar 2026", alertCount: 3 },
	{ caseRef: "SOW-2026-0210-553", name: "李明辉", nameEn: "Li Minghui", riskRating: "Low", status: "Complete", createdDate: "10 Feb 2026", nextReview: "10 Feb 2027", alertCount: 1 },
	{ caseRef: "SOW-2026-0402-291", name: "赵薇薇", nameEn: "Zhao Weiwei", riskRating: "High", status: "Pending EDD", createdDate: "02 Apr 2026", nextReview: "02 Oct 2026", alertCount: 5 },
	{ caseRef: "SOW-2026-0315-744", name: "黄晓明", nameEn: "Huang Xiaoming", riskRating: "Low", status: "Complete", createdDate: "15 Mar 2026", nextReview: "15 Mar 2027", alertCount: 0 },
	{ caseRef: "SOW-2026-0428-195", name: "林婉琪", nameEn: "Lin Wanqi", riskRating: "High", status: "Under Review", createdDate: "28 Apr 2026", nextReview: "28 Oct 2026", alertCount: 2 },
	{ caseRef: "SOW-2026-0503-631", name: "周志强", nameEn: "Zhou Zhiqiang", riskRating: "Low", status: "Complete", createdDate: "03 May 2026", nextReview: "03 May 2027", alertCount: 0 },
];

const MOCK_NOTIFICATIONS: DashboardNotification[] = [
	{ id: "n1", type: "alert", title: "New adverse media hit — 张丽华", detail: "Reuters article mentions subject in connection with a regulatory investigation in Guangdong Province.", time: "2 hours ago", caseRef: "SOW-2025-0918-087", read: false },
	{ id: "n2", type: "review-due", title: "Periodic review due — 王建国", detail: "Annual SOW review is scheduled for 03 Dec 2026. Re-run assessment to update data sources.", time: "1 day ago", caseRef: "SOW-2025-1203-412", read: false },
	{ id: "n3", type: "update", title: "Corporate filing update — 李明辉", detail: "SAMR registry shows new company registration: Hangzhou Minghui Consulting Co. Subject listed as legal representative.", time: "3 days ago", caseRef: "SOW-2026-0210-553", read: true },
	{ id: "n4", type: "completed", title: "EDD interview scheduled — 赵薇薇", detail: "Enhanced due diligence interview confirmed for 20 May 2026, 14:00 CST. Documents pending.", time: "5 days ago", caseRef: "SOW-2026-0402-291", read: true },
	{ id: "n5", type: "alert", title: "Tax discrepancy detected — 赵薇薇", detail: "Year-over-year income variance of 340% detected in latest STA filing. Flagged for manual review.", time: "1 week ago", caseRef: "SOW-2026-0402-291", read: true },
	{ id: "n6", type: "alert", title: "Sanctions list match — 林婉琪", detail: "Possible partial match on OFAC SDN list for associated entity Shenzhen Hengda Import Co. Manual verification required.", time: "1 week ago", caseRef: "SOW-2026-0428-195", read: true },
	{ id: "n7", type: "update", title: "Annual review completed — 黄晓明", detail: "All 11 data sources re-queried. No material changes from prior assessment. Risk rating unchanged at Low.", time: "2 weeks ago", caseRef: "SOW-2026-0315-744", read: true },
	{ id: "n8", type: "review-due", title: "90-day check due — 林婉琪", detail: "High-risk case requires 90-day interim review per enhanced monitoring policy. 6 data sources scheduled for re-query.", time: "2 weeks ago", caseRef: "SOW-2026-0428-195", read: true },
];

function generateCaseRef(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const seq = String(Math.floor(Math.random() * 900) + 100);
	return `SOW-${d.getFullYear()}-${pad(d.getMonth() + 1)}${pad(d.getDate())}-${seq}`;
}

export default function SowDemo() {
	const [phase, setPhase] = useState<Phase>("dashboard");
	const [selectedCase, setSelectedCase] = useState<SowReport | null>(null);
	const [caseRef, setCaseRef] = useState("");
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [completedSources, setCompletedSources] = useState<SowDataSource[]>([]);
	const [currentSourceIndex, setCurrentSourceIndex] = useState(-1);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [confirmedActions, setConfirmedActions] = useState<Set<string>>(new Set());
	const [consentChecks, setConsentChecks] = useState({ dataProcessing: false, clientAuth: false, regulatoryDisclosure: false });
	const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
	const cancelRef = useRef(false);
	const reportRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

	const reset = () => {
		cancelRef.current = true;
		if (timerRef.current) clearInterval(timerRef.current);
		setPhase("dashboard");
		setSelectedCase(null);
		setCaseRef("");
		setFormData({});
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
		setConfirmedActions(new Set());
		setConsentChecks({ dataProcessing: false, clientAuth: false, regulatoryDisclosure: false });
		setUploadedFiles([]);
	};

	const selectDemoCase = (report: SowReport) => {
		setSelectedCase(report);
		const p = report.profile;
		setFormData({
			nameCn: p.name,
			nameEn: p.nameEn,
			dob: p.dateOfBirth,
			gender: p.gender,
			idType: "Chinese Resident Identity Card",
			idNumber: p.idNumber,
			nationality: p.nationality,
			occupation: p.occupation,
			employer: p.employer,
			city: p.city,
			purpose: p.riskRating === "High" ? "Investment" : "Private Banking",
			volume: p.riskRating === "High" ? "¥20M – ¥100M" : "¥5M – ¥20M",
		});
	};

	const createCase = () => {
		if (!selectedCase) return;
		setCaseRef(generateCaseRef());
		setPhase("consent");
	};

	const proceedFromConsent = () => {
		setPhase("sources");
	};

	const beginAssessment = () => {
		cancelRef.current = false;
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
		setPhase("generating");
	};

	const confirmAction = (id: string) => {
		setConfirmedActions((prev) => new Set(prev).add(id));
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
		return <Dashboard onNewCase={() => setPhase("intake")} />;
	}

	return (
		<div className="space-y-6">
			<StepIndicator current={phase} />

			{phase === "intake" && (
				<CaseIntake
					selectedCase={selectedCase}
					formData={formData}
					onSelectCase={selectDemoCase}
					onUpdateField={(k, v) => setFormData((prev) => ({ ...prev, [k]: v }))}
					onCreateCase={createCase}
					onBack={() => setPhase("dashboard")}
				/>
			)}

			{phase === "consent" && selectedCase && (
				<ConsentPhase
					report={selectedCase}
					caseRef={caseRef}
					consentChecks={consentChecks}
					uploadedFiles={uploadedFiles}
					onToggleConsent={(key) => setConsentChecks((prev) => ({ ...prev, [key]: !prev[key] }))}
					onUploadFile={(name) => setUploadedFiles((prev) => [...prev, name])}
					onProceed={proceedFromConsent}
					onBack={() => setPhase("intake")}
				/>
			)}

			{phase === "sources" && selectedCase && (
				<DataSourceOverview
					report={selectedCase}
					caseRef={caseRef}
					onBegin={beginAssessment}
					onBack={() => setPhase("consent")}
				/>
			)}

			{phase === "generating" && selectedCase && (
				<>
					<CaseBanner caseRef={caseRef} report={selectedCase} status="In Progress" />
					<GeneratingView
						report={selectedCase}
						completedSources={completedSources}
						currentSourceIndex={currentSourceIndex}
						elapsedMs={elapsedMs}
						onCancel={reset}
					/>
				</>
			)}

			{phase === "report" && selectedCase && (
				<div ref={reportRef}>
					<CaseBanner caseRef={caseRef} report={selectedCase} status="Complete" />
					<ReportView
						report={selectedCase}
						caseRef={caseRef}
						confirmedActions={confirmedActions}
						onConfirmAction={confirmAction}
						onReset={reset}
					/>
				</div>
			)}
		</div>
	);
}

/* ─── Dashboard ─── */

function Dashboard({ onNewCase }: { onNewCase: () => void }) {
	const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
	const [lastRefresh, setLastRefresh] = useState(new Date());
	const unreadCount = notifications.filter((n) => !n.read).length;

	const markRead = (id: string) => {
		setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
	};

	const refresh = () => {
		setLastRefresh(new Date());
	};

	const casesByStatus = {
		total: MOCK_EXISTING_CASES.length,
		complete: MOCK_EXISTING_CASES.filter((c) => c.status === "Complete").length,
		review: MOCK_EXISTING_CASES.filter((c) => c.status === "Under Review").length,
		pending: MOCK_EXISTING_CASES.filter((c) => c.status === "Pending EDD").length,
	};

	const totalAlerts = MOCK_EXISTING_CASES.reduce((sum, c) => sum + c.alertCount, 0);
	const highRiskCount = MOCK_EXISTING_CASES.filter((c) => c.riskRating === "High").length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-heading font-semibold tracking-tight">Case Dashboard</h2>
					<p className="text-sm text-muted-foreground mt-0.5">Overview of active SOW assessments and monitoring alerts</p>
				</div>
				<Button onClick={onNewCase} className="gap-2 shadow-md shadow-primary/20 font-heading">
					<PlusIcon className="size-4" />
					New Case
				</Button>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<StatCard label="Total Cases" value={casesByStatus.total} icon={FolderOpenIcon} />
				<StatCard label="Completed" value={casesByStatus.complete} icon={CheckCircle2Icon} color="emerald" />
				<StatCard label="Under Review" value={casesByStatus.review + casesByStatus.pending} icon={EyeIcon} color="amber" />
				<StatCard label="Active Alerts" value={totalAlerts} icon={BellRingIcon} color="red" />
			</div>

			<div className="rounded-2xl border border-border bg-gradient-to-r from-muted/30 to-transparent p-5 shadow-sm">
				<div className="flex items-center gap-2 mb-3">
					<ShieldCheckIcon className="size-4 text-primary" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Compliance Summary</p>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Avg. Assessment Time</div>
						<div className="mt-0.5 font-heading font-semibold">28.4s</div>
					</div>
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">High Risk Rate</div>
						<div className="mt-0.5 font-heading font-semibold">{((highRiskCount / casesByStatus.total) * 100).toFixed(0)}%</div>
					</div>
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">Data Sources Active</div>
						<div className="mt-0.5 font-heading font-semibold">13 / 13</div>
					</div>
					<div>
						<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">SLA Compliance</div>
						<div className="mt-0.5 font-heading font-semibold text-emerald-700">100%</div>
					</div>
				</div>
			</div>

			{/* Issues Dashboard */}
			<IssuesDashboard issues={DASHBOARD_ISSUES} />

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
				<div className="lg:col-span-3 space-y-3">
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Active Cases
					</p>
					<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
						<table className="w-full text-sm">
							<thead className="bg-gradient-to-r from-muted/60 to-muted/30 text-muted-foreground">
								<tr>
									<th className="text-left px-4 py-3 font-medium text-xs tracking-wide">Case</th>
									<th className="text-left px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Subject</th>
									<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Risk</th>
									<th className="text-center px-4 py-3 font-medium text-xs tracking-wide">Status</th>
									<th className="text-center px-4 py-3 font-medium text-xs tracking-wide hidden sm:table-cell">Alerts</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/60">
								{MOCK_EXISTING_CASES.map((c) => (
									<tr key={c.caseRef} className="hover:bg-accent/30 transition-colors">
										<td className="px-4 py-3.5">
											<div className="font-mono text-[10px] text-muted-foreground tracking-wide">{c.caseRef}</div>
											<div className="font-medium sm:hidden mt-0.5">{c.name}</div>
										</td>
										<td className="px-4 py-3.5 hidden sm:table-cell">
											<div className="font-medium">{c.name}</div>
											<div className="text-xs text-muted-foreground">{c.nameEn}</div>
										</td>
										<td className="px-4 py-3.5 text-center">
											<RiskBadge rating={c.riskRating} />
										</td>
										<td className="px-4 py-3.5 text-center">
											<CaseStatusBadge status={c.status} />
										</td>
										<td className="px-4 py-3.5 text-center hidden sm:table-cell">
											{c.alertCount > 0 ? (
												<span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-red-500/15 text-red-700">{c.alertCount}</span>
											) : (
												<span className="text-xs text-muted-foreground/40">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="lg:col-span-2 space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
								Notifications
							</p>
							{unreadCount > 0 && (
								<span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-red-500 text-white min-w-[18px] text-center">{unreadCount}</span>
							)}
						</div>
						<button onClick={refresh} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted" title="Refresh">
							<RefreshCwIcon className="size-3.5" />
						</button>
					</div>
					<div className="rounded-2xl border border-border overflow-hidden shadow-sm divide-y divide-border/60 max-h-[400px] overflow-y-auto bg-card">
						{notifications.map((n) => (
							<NotificationRow key={n.id} notification={n} onRead={() => markRead(n.id)} />
						))}
					</div>
					<p className="text-[10px] text-muted-foreground/60 text-right tracking-wide">
						Last updated: {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · Auto-refreshes every 60s
					</p>
				</div>
			</div>
		</div>
	);
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof FolderOpenIcon; color?: string }) {
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

function CaseStatusBadge({ status }: { status: ExistingCase["status"] }) {
	const styles: Record<string, string> = {
		Complete: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
		"Under Review": "bg-amber-500/15 text-amber-700 border-amber-500/20",
		"Pending EDD": "bg-red-500/15 text-red-700 border-red-500/20",
	};
	return <span className={`text-[10px] font-semibold rounded-md border px-1.5 py-0.5 whitespace-nowrap ${styles[status]}`}>{status}</span>;
}

function NotificationRow({ notification: n, onRead }: { notification: DashboardNotification; onRead: () => void }) {
	const iconMap: Record<string, { Icon: typeof BellRingIcon; color: string }> = {
		alert: { Icon: AlertTriangleIcon, color: "text-red-500" },
		"review-due": { Icon: CalendarClockIcon, color: "text-amber-500" },
		update: { Icon: InfoIcon, color: "text-sky-500" },
		completed: { Icon: CheckCircle2Icon, color: "text-emerald-500" },
	};
	const { Icon, color } = iconMap[n.type] ?? iconMap.update;

	return (
		<button
			onClick={onRead}
			className={`w-full text-left px-4 py-3.5 hover:bg-accent/30 transition-colors ${!n.read ? "bg-primary/[0.03]" : ""}`}
		>
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
						<span className="font-mono text-[9px] text-muted-foreground/50 tracking-wide">{n.caseRef}</span>
						<span className="text-[9px] text-muted-foreground/30">·</span>
						<span className="text-[9px] text-muted-foreground/50">{n.time}</span>
					</div>
				</div>
			</div>
		</button>
	);
}

/* ─── Issues Dashboard ─── */

function IssuesDashboard({ issues }: { issues: DashboardIssue[] }) {
	const critical = issues.filter((i) => i.severity === "Critical").length;
	const high = issues.filter((i) => i.severity === "High").length;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<CircleAlertIcon className="size-4 text-red-500" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Open Issues
					</p>
					<span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-red-500 text-white min-w-[18px] text-center">
						{issues.length}
					</span>
				</div>
				<div className="flex items-center gap-2 text-[10px]">
					<span className="rounded-md border border-red-500/20 bg-red-500/10 text-red-700 px-1.5 py-0.5 font-semibold">
						{critical} Critical
					</span>
					<span className="rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-700 px-1.5 py-0.5 font-semibold">
						{high} High
					</span>
				</div>
			</div>
			<div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.03] to-transparent overflow-hidden shadow-sm">
				<div className="divide-y divide-border/50">
					{issues.map((issue) => {
						const sevColor: Record<string, string> = {
							Critical: "bg-red-500/15 text-red-700 border-red-500/20",
							High: "bg-amber-500/15 text-amber-700 border-amber-500/20",
							Medium: "bg-sky-500/15 text-sky-700 border-sky-500/20",
						};
						const typeIcon: Record<string, typeof AlertTriangleIcon> = {
							"Overdue Review": CalendarClockIcon,
							"Unresolved Alert": AlertTriangleIcon,
							"Missing Document": FileTextIcon,
							"EDD Pending": UserCheckIcon,
							"Remediation Overdue": ListTodoIcon,
							"Data Source Error": CircleAlertIcon,
						};
						const Icon = typeIcon[issue.type] ?? AlertTriangleIcon;
						return (
							<div key={issue.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-accent/20 transition-colors">
								<div className="mt-0.5">
									<Icon className={`size-4 ${issue.severity === "Critical" ? "text-red-500" : "text-amber-500"}`} />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-sm font-medium">{issue.subjectName}</span>
										<span className="font-mono text-[9px] text-muted-foreground/50 tracking-wide">{issue.caseRef}</span>
									</div>
									<p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{issue.description}</p>
									<div className="flex items-center gap-2 mt-1.5">
										<span className={`text-[9px] font-semibold rounded-md border px-1.5 py-0.5 ${sevColor[issue.severity]}`}>
											{issue.severity}
										</span>
										<span className="text-[9px] font-semibold rounded-md border border-border px-1.5 py-0.5 bg-muted/50 text-muted-foreground">
											{issue.type}
										</span>
										<span className="text-[10px] text-muted-foreground/60">
											{issue.daysPending}d pending · {issue.assignee}
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

/* ─── Step Indicator ─── */

function StepIndicator({ current }: { current: Phase }) {
	if (current === "dashboard") return null;
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

/* ─── Case Banner ─── */

function CaseBanner({
	caseRef,
	report,
	status,
}: {
	caseRef: string;
	report: SowReport;
	status: "In Progress" | "Complete";
}) {
	const p = report.profile;
	const statusColor =
		status === "Complete"
			? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
			: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-gradient-to-r from-muted/40 to-transparent px-5 py-3 text-sm mb-5 shadow-sm">
			<div className="flex items-center gap-1.5 text-muted-foreground">
				<HashIcon className="size-3.5" />
				<span className="font-mono text-xs tracking-wide">{caseRef}</span>
			</div>
			<span className="text-muted-foreground/30 hidden sm:inline">|</span>
			<span className="font-heading font-semibold">{p.name} ({p.nameEn})</span>
			<span className="text-muted-foreground/30 hidden sm:inline">|</span>
			<span className={`text-[10px] font-semibold rounded-md border px-2 py-0.5 ${statusColor}`}>
				{status}
			</span>
			<span className="text-muted-foreground/30 hidden sm:inline">|</span>
			<span className="text-xs text-muted-foreground">
				{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
			</span>
		</div>
	);
}

/* ─── Phase 1: Case Intake ─── */

function CaseIntake({
	selectedCase,
	formData,
	onSelectCase,
	onUpdateField,
	onCreateCase,
	onBack,
}: {
	selectedCase: SowReport | null;
	formData: Record<string, string>;
	onSelectCase: (r: SowReport) => void;
	onUpdateField: (key: string, value: string) => void;
	onCreateCase: () => void;
	onBack: () => void;
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-1">
						Select Demo Profile
					</p>
					<p className="text-sm text-muted-foreground">
						Choose a pre-built client profile to populate the intake form, or enter details manually.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={onBack} className="font-heading">Back to Dashboard</Button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{SOW_CASES.map((report) => {
					const p = report.profile;
					const isSelected = selectedCase?.profile.id === p.id;
					const isHigh = p.riskRating === "High";
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
									<div className={`h-11 w-11 rounded-xl flex items-center justify-center ${isHigh ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
										<UserIcon className={`size-5 ${isHigh ? "text-red-600" : "text-emerald-600"}`} />
									</div>
									<div>
										<div className="font-heading font-semibold">{p.name}</div>
										<div className="text-xs text-muted-foreground">{p.nameEn}</div>
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
							<div className="text-xs text-muted-foreground">
								{p.age}, {p.gender} · {p.occupation} · {p.city}
							</div>
							<p className="text-[11px] text-muted-foreground/70 mt-2 leading-relaxed line-clamp-2">
								{p.profileSummary}
							</p>
						</button>
					);
				})}
			</div>

			{selectedCase && (
				<div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
					<FormSection title="Client Information">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField label="Full Name (Chinese)" required value={formData.nameCn ?? ""} onChange={(v) => onUpdateField("nameCn", v)} />
							<FormField label="Full Name (English)" required value={formData.nameEn ?? ""} onChange={(v) => onUpdateField("nameEn", v)} />
							<FormField label="Date of Birth" required value={formData.dob ?? ""} onChange={(v) => onUpdateField("dob", v)} placeholder="YYYY-MM-DD" />
							<FormSelect
								label="Gender"
								required
								value={formData.gender ?? ""}
								onChange={(v) => onUpdateField("gender", v)}
								options={["Male", "Female"]}
							/>
							<FormSelect
								label="ID Type"
								required
								value={formData.idType ?? ""}
								onChange={(v) => onUpdateField("idType", v)}
								options={["Chinese Resident Identity Card", "Passport", "HK Identity Card"]}
							/>
							<FormField label="ID Number" required value={formData.idNumber ?? ""} onChange={(v) => onUpdateField("idNumber", v)} />
							<FormField label="Nationality" required value={formData.nationality ?? ""} onChange={(v) => onUpdateField("nationality", v)} />
						</div>
					</FormSection>

					<FormSection title="Employment & Residence">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField label="Occupation" required value={formData.occupation ?? ""} onChange={(v) => onUpdateField("occupation", v)} />
							<FormField label="Employer / Company" value={formData.employer ?? ""} onChange={(v) => onUpdateField("employer", v)} />
							<FormField label="City of Residence" required value={formData.city ?? ""} onChange={(v) => onUpdateField("city", v)} />
						</div>
					</FormSection>

					<FormSection title="Account Details">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormSelect
								label="Purpose of Relationship"
								value={formData.purpose ?? ""}
								onChange={(v) => onUpdateField("purpose", v)}
								options={["Private Banking", "Business Banking", "Investment", "Trading Account", "Wealth Management"]}
							/>
							<FormSelect
								label="Expected Annual Volume"
								value={formData.volume ?? ""}
								onChange={(v) => onUpdateField("volume", v)}
								options={["< ¥1M", "¥1M – ¥5M", "¥5M – ¥20M", "¥20M – ¥100M", "> ¥100M"]}
							/>
						</div>
					</FormSection>

					<Button onClick={onCreateCase} className="w-full gap-2 shadow-md shadow-primary/20 font-heading text-[15px]" size="lg">
						Create Case & Proceed
						<ArrowRightIcon className="size-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-3">
			<h4 className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">{title}</h4>
			{children}
		</div>
	);
}

function FormField({
	label, value, onChange, required, placeholder,
}: {
	label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string;
}) {
	return (
		<div className="space-y-1.5">
			<label className="text-sm font-medium font-heading">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</label>
			<Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-lg" />
		</div>
	);
}

function FormSelect({
	label, value, onChange, required, options,
}: {
	label: string; value: string; onChange: (v: string) => void; required?: boolean; options: string[];
}) {
	return (
		<div className="space-y-1.5">
			<label className="text-sm font-medium font-heading">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</label>
			<Select value={value} onValueChange={(v) => onChange(v ?? "")}>
				<SelectTrigger className="w-full rounded-lg">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem key={opt} value={opt}>{opt}</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

/* ─── Phase 2: Consent & Document Upload ─── */

function ConsentPhase({
	report, caseRef, consentChecks, uploadedFiles, onToggleConsent, onUploadFile, onProceed, onBack,
}: {
	report: SowReport; caseRef: string;
	consentChecks: { dataProcessing: boolean; clientAuth: boolean; regulatoryDisclosure: boolean };
	uploadedFiles: string[];
	onToggleConsent: (key: "dataProcessing" | "clientAuth" | "regulatoryDisclosure") => void;
	onUploadFile: (name: string) => void; onProceed: () => void; onBack: () => void;
}) {
	const allChecked = consentChecks.dataProcessing && consentChecks.clientAuth && consentChecks.regulatoryDisclosure;

	return (
		<div className="space-y-5">
			<CaseBanner caseRef={caseRef} report={report} status="In Progress" />

			<div>
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-1">
					Consent & Authorization
				</p>
				<p className="text-sm text-muted-foreground">
					Before querying government and financial data sources, the following consent confirmations and supporting documents are required.
					Under the PRC Personal Information Protection Law (PIPL), explicit informed consent must be obtained from the data subject
					prior to processing sensitive personal information including identity records, financial data, and corporate affiliations.
				</p>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
				<h4 className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Required Confirmations</h4>

				<ConsentCheckbox
					checked={consentChecks.dataProcessing}
					onChange={() => onToggleConsent("dataProcessing")}
					title="Data Processing Consent"
					description="I confirm that the client has been informed of and consents to the processing of their personal data for the purpose of Source of Wealth verification, in compliance with applicable data protection regulations including the PRC Personal Information Protection Law (PIPL)."
				/>
				<ConsentCheckbox
					checked={consentChecks.clientAuth}
					onChange={() => onToggleConsent("clientAuth")}
					title="Client Authorization"
					description="I confirm that a signed client authorization form has been obtained, granting permission to query government registries, financial databases, and third-party data providers for the purpose of enhanced due diligence."
				/>
				<ConsentCheckbox
					checked={consentChecks.regulatoryDisclosure}
					onChange={() => onToggleConsent("regulatoryDisclosure")}
					title="Regulatory Disclosure"
					description="I acknowledge that assessment results may be shared with regulatory authorities in accordance with applicable anti-money laundering legislation, and that the client has been informed of this obligation."
				/>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
				<h4 className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Supporting Documents</h4>
				<p className="text-xs text-muted-foreground">
					Upload signed consent forms and any supporting documentation. Accepted formats: PDF, JPG, PNG (max 10MB each).
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<UploadSlot label="Signed Consent Form" uploaded={uploadedFiles.includes("Signed Consent Form")} onUpload={() => onUploadFile("Signed Consent Form")} required />
					<UploadSlot label="Client ID Document" uploaded={uploadedFiles.includes("Client ID Document")} onUpload={() => onUploadFile("Client ID Document")} required />
					<UploadSlot label="Authorization Letter" uploaded={uploadedFiles.includes("Authorization Letter")} onUpload={() => onUploadFile("Authorization Letter")} />
					<UploadSlot label="Additional Evidence" uploaded={uploadedFiles.includes("Additional Evidence")} onUpload={() => onUploadFile("Additional Evidence")} />
				</div>
			</div>

			<div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-muted/40 to-transparent px-5 py-3.5 shadow-sm">
				<div className="flex items-center gap-2 text-sm">
					{allChecked ? (
						<>
							<CheckCircle2Icon className="size-4 text-emerald-600" />
							<span className="text-emerald-700 font-heading font-medium">All confirmations received</span>
						</>
					) : (
						<>
							<AlertTriangleIcon className="size-4 text-amber-600" />
							<span className="text-amber-700 font-heading font-medium">
								{3 - [consentChecks.dataProcessing, consentChecks.clientAuth, consentChecks.regulatoryDisclosure].filter(Boolean).length} confirmation{3 - [consentChecks.dataProcessing, consentChecks.clientAuth, consentChecks.regulatoryDisclosure].filter(Boolean).length !== 1 ? "s" : ""} remaining
							</span>
						</>
					)}
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onBack} className="font-heading">Back</Button>
					<Button size="sm" onClick={onProceed} disabled={!allChecked} className="gap-1.5 font-heading shadow-md shadow-primary/20">
						Proceed to Data Sources
						<ArrowRightIcon className="size-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}

function ConsentCheckbox({ checked, onChange, title, description }: { checked: boolean; onChange: () => void; title: string; description: string }) {
	return (
		<button onClick={onChange} className="w-full text-left flex items-start gap-3 group">
			<div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
				checked ? "bg-primary border-primary shadow-sm shadow-primary/30" : "border-border group-hover:border-primary/50"
			}`}>
				{checked && <CheckIcon className="size-3 text-primary-foreground" />}
			</div>
			<div>
				<div className="text-sm font-heading font-medium">{title}</div>
				<p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{description}</p>
			</div>
		</button>
	);
}

function UploadSlot({ label, uploaded, onUpload, required }: { label: string; uploaded: boolean; onUpload: () => void; required?: boolean }) {
	return (
		<button
			onClick={onUpload}
			disabled={uploaded}
			className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-all ${
				uploaded ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
			}`}
		>
			{uploaded ? (
				<FileCheckIcon className="size-5 text-emerald-600 shrink-0" />
			) : (
				<UploadIcon className="size-5 text-muted-foreground shrink-0" />
			)}
			<div className="text-left flex-1">
				<div className="text-sm font-heading font-medium flex items-center gap-1">
					{label}
					{required && !uploaded && <span className="text-destructive text-xs">*</span>}
				</div>
				<div className="text-[11px] text-muted-foreground">
					{uploaded ? "Uploaded successfully" : "Click to upload"}
				</div>
			</div>
		</button>
	);
}

/* ─── Phase 3: Data Source Overview ─── */

function DataSourceOverview({ report, caseRef, onBegin, onBack }: { report: SowReport; caseRef: string; onBegin: () => void; onBack: () => void }) {
	const [infoOpen, setInfoOpen] = useState<string | null>(null);
	const sources = report.dataSources;
	const categories = ["Identity", "Banking", "Risk", "Corporate", "Income", "Tax"] as const;
	const grouped = categories.map((cat) => ({ category: cat, items: sources.filter((s) => s.category === cat) })).filter((g) => g.items.length > 0);
	const totalDelay = sources.reduce((sum, s) => sum + s.delayMs, 0);

	return (
		<div className="space-y-5">
			<CaseBanner caseRef={caseRef} report={report} status="In Progress" />

			<div>
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-1">
					Data Sources to Query
				</p>
				<p className="text-sm text-muted-foreground">
					The following {sources.length} government and financial data sources will be queried to build the Source of Wealth assessment for {report.profile.name}. Click the <span className="inline-flex items-center"><InfoIcon className="size-3 mx-0.5 text-primary inline" /></span> icon on each category to learn more about the data source authority and legal basis.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{grouped.map((group) => {
					const meta = CATEGORY_META[group.category];
					const CatIcon = meta?.Icon ?? SearchIcon;
					const isInfoOpen = infoOpen === group.category;
					return (
						<div key={group.category} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
							<div className="p-5">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
											<CatIcon className="size-4 text-primary" />
										</div>
										<div>
											<h4 className="text-sm font-heading font-semibold">{group.category}</h4>
											<span className="text-[10px] text-muted-foreground">
												{group.items.length} check{group.items.length !== 1 ? "s" : ""}
											</span>
										</div>
									</div>
									<button
										onClick={() => setInfoOpen(isInfoOpen ? null : group.category)}
										className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
											isInfoOpen ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
										}`}
										title="Data source information"
									>
										<InfoIcon className="size-3.5" />
									</button>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed mb-3">
									{meta?.description}
								</p>
								<div className="space-y-2">
									{group.items.map((source) => (
										<div key={source.id} className="flex items-start gap-2">
											<CheckCircle2Icon className="size-3.5 text-primary mt-0.5 shrink-0" />
											<div>
												<div className="text-xs font-heading font-medium">{source.name}</div>
												<div className="text-[11px] text-muted-foreground">
													{SOURCE_PURPOSES[source.id] ?? source.provider}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{isInfoOpen && meta && (
								<div className="border-t border-border bg-gradient-to-b from-muted/30 to-muted/10 px-5 py-4 space-y-3">
									<div>
										<div className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Governing Authority</div>
										<p className="text-xs font-medium">{meta.authority}</p>
									</div>
									<div>
										<div className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Legal Basis</div>
										<p className="text-[11px] text-muted-foreground leading-relaxed">{meta.legalBasis}</p>
									</div>
									<div>
										<div className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Data Retrieved</div>
										<p className="text-[11px] text-muted-foreground leading-relaxed">{meta.dataType}</p>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-muted/40 to-transparent px-5 py-3.5 shadow-sm">
				<div className="flex items-center gap-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<SearchIcon className="size-3.5" />
						{sources.length} data sources
					</span>
					<span className="flex items-center gap-1.5">
						<ClockIcon className="size-3.5" />
						Est. ~{Math.round(totalDelay / 1000)}s
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onBack} className="font-heading">Back</Button>
					<Button size="sm" onClick={onBegin} className="gap-1.5 font-heading shadow-md shadow-primary/20">
						Begin Assessment
						<ArrowRightIcon className="size-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}

/* ─── Phase 4: Generating ─── */

function GeneratingView({ report, completedSources, currentSourceIndex, elapsedMs, onCancel }: {
	report: SowReport; completedSources: SowDataSource[]; currentSourceIndex: number; elapsedMs: number; onCancel: () => void;
}) {
	const sources = report.dataSources;
	const progress = completedSources.length / sources.length;
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-heading font-semibold">
						Running SOW assessment for {report.profile.name}
					</h3>
					<p className="text-sm text-muted-foreground">
						{report.profile.nameEn} · querying {sources.length} data sources
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
					const completed = completedSources.find((s) => s.id === source.id);
					const isCurrent = i === currentSourceIndex && !completed;
					const isPending = i > currentSourceIndex;
					return (
						<div
							key={source.id}
							className={`flex items-center gap-3 px-5 py-3 border-b last:border-b-0 border-border/50 transition-colors ${
								isCurrent ? "bg-primary/5" : completed ? "bg-muted/20" : "bg-transparent"
							}`}
						>
							<div className="w-5 flex justify-center shrink-0">
								{isCurrent ? (
									<LoaderIcon className="size-4 text-primary animate-spin" />
								) : completed ? (
									<SourceStatusIcon status={completed.status} />
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

/* ─── Phase 5: Report ─── */

function ReportView({ report, caseRef, confirmedActions, onConfirmAction, onReset }: {
	report: SowReport; caseRef: string; confirmedActions: Set<string>; onConfirmAction: (id: string) => void; onReset: () => void;
}) {
	const p = report.profile;

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						SOW Assessment Complete
					</p>
					<h3 className="text-xl font-heading font-semibold mt-0.5 tracking-tight">
						{p.name} ({p.nameEn})
					</h3>
				</div>
				<div className="flex items-center gap-2">
					<DownloadReportButton report={report} />
					<Button variant="outline" onClick={onReset} className="font-heading">New Case</Button>
				</div>
			</div>

			<ProfileCard profile={p} />
			<RiskScoreGauge profile={p} />
			<KeyParameters params={report.keyParameters} />
			<RiskAssessment profile={p} />
			<WealthDonutChart items={report.wealthBreakdown} totalWealth={report.totalEstimatedWealthRMB} totalIncome={report.totalEstimatedAnnualIncomeRMB} />
			<WealthBreakdown items={report.wealthBreakdown} totalWealth={report.totalEstimatedWealthRMB} totalIncome={report.totalEstimatedAnnualIncomeRMB} />
			<CompanyNetworkGraph report={report} />
			<DataSourceFindings sources={report.dataSources} />
			<NarrativeSection narrative={report.narrative} />
			<AssessmentMethodology />
			<RegulatoryContext riskRating={p.riskRating} />
			<DocumentEvidenceSection documents={report.documentEvidence} />
			<AuditTrailSection entries={report.auditTrail} />
			<AnalystNotes riskRating={p.riskRating} />
			<PerpetualScreening alerts={report.screeningAlerts} nextReviewDate={report.nextReviewDate} riskRating={p.riskRating} />
			<RemediationSection items={report.remediationItems} riskRating={p.riskRating} />
			<PerpetualKycSetup riskRating={p.riskRating} nextReviewDate={report.nextReviewDate} />
			<FollowUpActions riskRating={p.riskRating} confirmedActions={confirmedActions} onConfirm={onConfirmAction} />
		</div>
	);
}

/* ─── Report Sub-Components ─── */

function ProfileCard({ profile: p }: { profile: SowReport["profile"] }) {
	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-start justify-between mb-5">
				<div className="flex items-center gap-4">
					<div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
						<UserIcon className="size-7 text-primary" />
					</div>
					<div>
						<div className="text-xl font-heading font-semibold tracking-tight">{p.name}</div>
						<div className="text-sm text-muted-foreground">{p.nameEn}</div>
					</div>
				</div>
				<RiskBadge rating={p.riskRating} size="lg" />
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
			<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">{label}</div>
			<div className={`mt-0.5 ${mono ? "font-mono text-xs tracking-wide" : "text-sm"}`}>{value}</div>
		</div>
	);
}

/* ─── Risk Score Gauge ─── */

function RiskScoreGauge({ profile: p }: { profile: SowReport["profile"] }) {
	const isHigh = p.riskRating === "High";
	const score = isHigh ? 78 : 22;
	const angle = (score / 100) * 180;
	const color = isHigh ? "#ef4444" : "#10b981";
	const bgColor = isHigh ? "from-red-500/5 to-red-500/[0.02]" : "from-emerald-500/5 to-emerald-500/[0.02]";

	return (
		<div className={`rounded-2xl border border-border bg-gradient-to-br ${bgColor} p-6 shadow-sm`}>
			<div className="flex items-center gap-2 mb-4">
				<GaugeIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Composite Risk Score
				</p>
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
						<text x="145" y="88" textAnchor="end" style={{ fontSize: "8px", fill: "#ef4444" }}>HIGH</text>
					</svg>
				</div>
				<div className="flex-1 space-y-2">
					<div className="text-sm font-heading font-semibold" style={{ color }}>
						{isHigh ? "Elevated Risk — Enhanced Due Diligence Required" : "Low Risk — Standard Onboarding Eligible"}
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed">
						{isHigh
							? "Score reflects unexplained wealth gaps, active regulatory investigations, tax discrepancies, and ongoing litigation. EDD interview recommended before proceeding."
							: "All data sources return consistent results. Income sources are verifiable and proportionate to declared wealth. No adverse indicators detected."}
					</p>
				</div>
			</div>
		</div>
	);
}

/* ─── Wealth Donut Chart ─── */

function WealthDonutChart({ items, totalWealth, totalIncome }: { items: SowWealthItem[]; totalWealth: number; totalIncome: number }) {
	const colors = ["#0891b2", "#0e7490", "#155e75", "#164e63", "#1e3a5f", "#0f172a"];
	const valueItems = items.filter((i) => (i.estimatedTotalRMB ?? 0) > 0 || (i.estimatedAnnualRMB ?? 0) > 0);
	const total = valueItems.reduce((sum, i) => sum + (i.estimatedTotalRMB ?? (i.estimatedAnnualRMB ?? 0) * 10), 0);

	let cumulativeAngle = 0;
	const segments = valueItems.map((item, i) => {
		const value = item.estimatedTotalRMB ?? (item.estimatedAnnualRMB ?? 0) * 10;
		const percentage = total > 0 ? value / total : 0;
		const startAngle = cumulativeAngle;
		const sweep = percentage * 360;
		cumulativeAngle += sweep;
		return { ...item, percentage, startAngle, sweep, color: colors[i % colors.length] };
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
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Wealth Composition
				</p>
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
						<text x={cx} y={cy - 4} textAnchor="middle" className="font-heading" style={{ fontSize: "16px", fontWeight: 700, fill: "currentColor" }}>
							¥{formatRMB(totalWealth)}
						</text>
						<text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: "9px", fill: "#9ca3af" }}>
							Total Wealth
						</text>
					</svg>
				</div>
				<div className="flex-1 space-y-2">
					{segments.map((seg, i) => (
						<div key={i} className="flex items-center gap-2.5">
							<div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
							<span className="text-xs flex-1 truncate">{seg.category}</span>
							<span className="text-xs font-mono text-muted-foreground tabular-nums">{(seg.percentage * 100).toFixed(0)}%</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── Company Network Graph ─── */

function CompanyNetworkGraph({ report }: { report: SowReport }) {
	const p = report.profile;
	const isHigh = p.riskRating === "High";

	const companies = isHigh
		? [
			{ name: "Shanghai Yuwei\nConsulting", role: "100% Owner & Director", status: "active", x: 80, y: 20 },
			{ name: "Shanghai Meihe\nTrading", role: "60% Shareholder & Director", status: "investigation", x: 380, y: 20 },
			{ name: "Hangzhou Qianhe\nReal Estate", role: "Fmr. 40% Shareholder", status: "dissolved", x: 230, y: 220 },
		]
		: [
			{ name: "Shenzhen Yunchuang\nTechnology", role: "35% Shareholder & Director", status: "active", x: 80, y: 20 },
			{ name: "Guangdong Xinhe\nSoftware", role: "8% Shareholder", status: "active", x: 380, y: 20 },
		];

	const personX = 250;
	const personY = isHigh ? 130 : 130;

	const statusColor: Record<string, { fill: string; stroke: string; text: string; badge: string }> = {
		active: { fill: "#f0fdf4", stroke: "#86efac", text: "#166534", badge: "Active" },
		investigation: { fill: "#fef3c7", stroke: "#fcd34d", text: "#92400e", badge: "Under Investigation" },
		dissolved: { fill: "#fef2f2", stroke: "#fca5a5", text: "#991b1b", badge: "Dissolved" },
	};

	const svgH = isHigh ? 290 : 200;

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center gap-2 mb-5">
				<NetworkIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Related Entity Network
				</p>
			</div>
			<div className="overflow-x-auto">
				<svg width="500" height={svgH} viewBox={`0 0 500 ${svgH}`} className="w-full max-w-[500px] mx-auto">
					<defs>
						<filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="130%">
							<feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
						</filter>
					</defs>

					{companies.map((c, i) => {
						const midX = (personX + c.x + 60) / 2;
						const midY = (personY + c.y + 20) / 2;
						const sc = statusColor[c.status];
						return (
							<g key={i}>
								<line
									x1={personX} y1={personY}
									x2={c.x + 60} y2={c.y + 20}
									stroke={sc.stroke}
									strokeWidth="2"
									strokeDasharray={c.status === "dissolved" ? "6 4" : "none"}
									opacity="0.6"
								/>
								<rect
									x={midX - 45} y={midY - 8}
									width="90" height="16" rx="8"
									fill="white" stroke={sc.stroke} strokeWidth="1"
								/>
								<text x={midX} y={midY + 4} textAnchor="middle" style={{ fontSize: "7px", fill: "#6b7280" }}>
									{c.role}
								</text>
							</g>
						);
					})}

					{/* Person node */}
					<circle cx={personX} cy={personY} r="24" fill="white" stroke="#3b82f6" strokeWidth="2.5" filter="url(#nodeShadow)" />
					<circle cx={personX} cy={personY - 6} r="6" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
					<path d={`M ${personX - 10} ${personY + 10} Q ${personX} ${personY + 2} ${personX + 10} ${personY + 10}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
					<text x={personX} y={personY + 36} textAnchor="middle" className="font-heading" style={{ fontSize: "10px", fontWeight: 600, fill: "#1e40af" }}>
						{p.name}
					</text>
					<text x={personX} y={personY + 47} textAnchor="middle" style={{ fontSize: "8px", fill: "#6b7280" }}>
						{p.nameEn}
					</text>

					{companies.map((c, i) => {
						const sc = statusColor[c.status];
						const lines = c.name.split("\n");
						return (
							<g key={`node-${i}`}>
								<rect
									x={c.x} y={c.y}
									width="120" height="50" rx="10"
									fill={sc.fill} stroke={sc.stroke} strokeWidth="1.5"
									filter="url(#nodeShadow)"
								/>
								{lines.map((line, li) => (
									<text
										key={li}
										x={c.x + 60} y={c.y + 18 + li * 12}
										textAnchor="middle"
										style={{ fontSize: "9px", fontWeight: 600, fill: sc.text }}
									>
										{line}
									</text>
								))}
								<rect
									x={c.x + 20} y={c.y + 38}
									width="80" height="14" rx="7"
									fill={sc.stroke} opacity="0.3"
								/>
								<text
									x={c.x + 60} y={c.y + 48}
									textAnchor="middle"
									style={{ fontSize: "7px", fontWeight: 600, fill: sc.text }}
								>
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

function KeyParameters({ params }: { params: SowReport["keyParameters"] }) {
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
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Key Risk Parameters
				</p>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{params.map((param, i) => (
					<div key={i} className={`rounded-xl border p-3.5 ${statusStyle[param.status]}`}>
						<div className="flex items-center gap-1.5 mb-1.5">
							<div className={`h-1.5 w-1.5 rounded-full ${dotStyle[param.status]}`} />
							<span className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest truncate">
								{param.label}
							</span>
						</div>
						<div className="text-sm font-heading font-semibold truncate" title={param.value}>
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
		<div className={`rounded-2xl border p-6 shadow-sm ${isHigh ? "border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-500/[0.02]" : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02]"}`}>
			<div className="flex items-center gap-3 mb-4">
				<ShieldAlertIcon className={`size-5 ${isHigh ? "text-red-600" : "text-emerald-600"}`} />
				<span className="font-heading font-semibold text-base">Risk Assessment: {p.riskRating}</span>
			</div>
			<ul className="space-y-2">
				{p.riskReasoningPoints.map((point, i) => (
					<li key={i} className="flex items-start gap-2.5 text-sm">
						<span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${isHigh ? "bg-red-500" : "bg-emerald-500"}`} />
						{point}
					</li>
				))}
			</ul>
		</div>
	);
}

function WealthBreakdown({ items, totalWealth, totalIncome }: { items: SowWealthItem[]; totalWealth: number; totalIncome: number }) {
	return (
		<div className="space-y-3">
			<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Wealth Breakdown</p>
			<div className="grid grid-cols-2 gap-3">
				<div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm">
					<div className="text-[9px] uppercase tracking-widest text-muted-foreground font-heading">Total Estimated Wealth</div>
					<div className="text-3xl font-heading font-bold mt-1.5 tabular-nums tracking-tight">¥{formatRMB(totalWealth)}</div>
				</div>
				<div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm">
					<div className="text-[9px] uppercase tracking-widest text-muted-foreground font-heading">Est. Annual Income</div>
					<div className="text-3xl font-heading font-bold mt-1.5 tabular-nums tracking-tight">¥{formatRMB(totalIncome)}</div>
				</div>
			</div>
			<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-muted/60 to-muted/30 text-muted-foreground">
						<tr>
							<th className="text-left px-4 py-3 font-medium text-xs font-heading tracking-wide">Category</th>
							<th className="text-right px-4 py-3 font-medium text-xs font-heading tracking-wide w-32">Annual (¥)</th>
							<th className="text-right px-4 py-3 font-medium text-xs font-heading tracking-wide w-32">Total Value (¥)</th>
							<th className="text-center px-4 py-3 font-medium text-xs font-heading tracking-wide w-24">Confidence</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/60">
						{items.map((item, i) => <WealthRow key={i} item={item} />)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function WealthRow({ item }: { item: SowWealthItem }) {
	const [open, setOpen] = useState(false);
	const confColor = {
		High: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
		Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
		Low: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
	}[item.confidence];
	return (
		<>
			<tr className="hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => setOpen((v) => !v)}>
				<td className="px-4 py-3 font-medium">
					<div className="flex items-center gap-1.5">
						<ChevronDownIcon className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
						{item.category}
					</div>
				</td>
				<td className="px-4 py-3 text-right tabular-nums font-mono text-xs">{item.estimatedAnnualRMB ? formatRMB(item.estimatedAnnualRMB) : "—"}</td>
				<td className="px-4 py-3 text-right tabular-nums font-mono text-xs">{item.estimatedTotalRMB !== null ? formatRMB(item.estimatedTotalRMB) : "—"}</td>
				<td className="px-4 py-3 text-center">
					<span className={`text-[10px] font-semibold rounded-md border px-1.5 py-0.5 ${confColor}`}>{item.confidence}</span>
				</td>
			</tr>
			{open && (
				<tr><td colSpan={4} className="px-4 py-3 bg-muted/10"><p className="text-xs text-muted-foreground leading-relaxed pl-5">{item.description}</p></td></tr>
			)}
		</>
	);
}

function DataSourceFindings({ sources }: { sources: SowDataSource[] }) {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const toggle = (id: string) => setExpandedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
	const categories = ["Identity", "Banking", "Risk", "Corporate", "Income", "Tax"] as const;
	const grouped = categories.map((cat) => ({ category: cat, items: sources.filter((s) => s.category === cat) })).filter((g) => g.items.length > 0);

	return (
		<div className="space-y-3">
			<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
				Data Source Findings — {sources.length} sources queried
			</p>
			<div className="space-y-3">
				{grouped.map((group) => (
					<div key={group.category} className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
						<div className="px-5 py-2.5 bg-gradient-to-r from-muted/50 to-muted/20 border-b border-border/60">
							<span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-muted-foreground">{group.category}</span>
						</div>
						<div className="divide-y divide-border/50">
							{group.items.map((source) => {
								const isOpen = expandedIds.has(source.id);
								return (
									<div key={source.id}>
										<button onClick={() => toggle(source.id)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-accent/30 transition-colors">
											<SourceStatusIcon status={source.status} />
											<div className="flex-1 min-w-0">
												<div className="text-sm">{source.name}</div>
												<div className="text-[11px] text-muted-foreground">{source.provider}</div>
											</div>
											<SourceStatusBadge status={source.status} label={source.statusLabel} />
											<ChevronDownIcon className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
										</button>
										{isOpen && (
											<div className="px-5 pb-3 pl-12">
												<p className="text-xs text-muted-foreground leading-relaxed">{source.findings}</p>
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
			<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">SOW Narrative — AI-Generated Summary</p>
			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
				<div>
					{narrative.split("\n\n").map((para, i) => (
						<p key={i} className="text-sm leading-[1.8] mb-3 last:mb-0">{para}</p>
					))}
				</div>
				<div className="rounded-lg bg-muted/30 border border-border/60 px-4 py-3 flex items-start gap-2.5">
					<InfoIcon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
					<p className="text-[11px] text-muted-foreground leading-relaxed">
						This narrative was generated by an AI model synthesizing findings from {narrative.length > 2000 ? "13" : "11"} verified data sources.
						All factual claims are traceable to the source query results in Section 5 above. This summary is intended as an
						analytical aid for compliance officers and should not be used as a standalone decision document. Final risk determination
						must be made by a qualified compliance professional in accordance with institutional policies.
					</p>
				</div>
			</div>
		</div>
	);
}

function AssessmentMethodology() {
	const factors = [
		{ name: "Identity Consistency", weight: "15%", desc: "Cross-validation of identity documents, mobile attribution, and residence claims across government databases." },
		{ name: "Income Plausibility", weight: "20%", desc: "Comparison of declared income against social insurance contributions, tax filings, and employer verification." },
		{ name: "Wealth-to-Income Ratio", weight: "20%", desc: "Assessment of whether accumulated assets are proportionate to verified income trajectory over career span." },
		{ name: "Corporate Exposure", weight: "15%", desc: "Evaluation of associated entities including registration status, regulatory standing, and beneficial ownership structures." },
		{ name: "Litigation & Enforcement", weight: "10%", desc: "Review of civil and criminal court records, enforcement actions, and dishonest debtor listings." },
		{ name: "Financial Behaviour", weight: "10%", desc: "Analysis of multi-platform borrowing patterns, cross-provincial account activity, and fraud risk indicators." },
		{ name: "Tax Compliance", weight: "10%", desc: "Year-over-year consistency of tax filings and alignment with other declared income sources." },
	];

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<FileTextIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Assessment Methodology</p>
			</div>
			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
				<p className="text-xs text-muted-foreground leading-relaxed">
					The composite risk score is calculated using a weighted multi-factor model. Each factor is independently assessed against verified data from government and financial sources, then combined into an overall score from 0 (lowest risk) to 100 (highest risk). Scores above 60 trigger enhanced due diligence requirements.
				</p>
				<div className="rounded-xl border border-border overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-gradient-to-r from-muted/60 to-muted/30 text-muted-foreground">
							<tr>
								<th className="text-left px-4 py-2.5 font-medium text-xs font-heading tracking-wide">Factor</th>
								<th className="text-center px-4 py-2.5 font-medium text-xs font-heading tracking-wide w-20">Weight</th>
								<th className="text-left px-4 py-2.5 font-medium text-xs font-heading tracking-wide hidden sm:table-cell">Description</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/60">
							{factors.map((f) => (
								<tr key={f.name} className="hover:bg-accent/30 transition-colors">
									<td className="px-4 py-2.5 text-xs font-heading font-medium">{f.name}</td>
									<td className="px-4 py-2.5 text-xs font-mono text-center text-primary font-semibold">{f.weight}</td>
									<td className="px-4 py-2.5 text-[11px] text-muted-foreground hidden sm:table-cell">{f.desc}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function RegulatoryContext({ riskRating }: { riskRating: "Low" | "High" }) {
	const isHigh = riskRating === "High";
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<LandmarkIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Regulatory Context & Obligations</p>
			</div>
			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-2">
						<h5 className="text-xs font-heading font-semibold">Applicable Regulations</h5>
						<ul className="space-y-1.5 text-[11px] text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
								PRC Anti-Money Laundering Law (2006, amended 2025)
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
								PBOC Customer Due Diligence Measures for Financial Institutions
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
								FATF Recommendations 10, 11, 12 (CDD / Record Keeping / PEPs)
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
								PRC Personal Information Protection Law (PIPL) — data processing consent
							</li>
						</ul>
					</div>
					<div className="space-y-2">
						<h5 className="text-xs font-heading font-semibold">Required Actions</h5>
						<ul className="space-y-1.5 text-[11px] text-muted-foreground">
							{isHigh ? (
								<>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-red-500 shrink-0" />
										File Suspicious Transaction Report (STR) if funds cannot be explained within 30 days
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-red-500 shrink-0" />
										Conduct enhanced due diligence interview per PBOC Directive 2024-003
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
										Escalate to MLRO for independent review before account activation
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
										Set 6-month accelerated review cycle with automated monitoring
									</li>
								</>
							) : (
								<>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
										Standard CDD complete — no enhanced measures required
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
										Retain assessment records for minimum 5 years per AML regulations
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
										Schedule annual periodic review with automated data source refresh
									</li>
									<li className="flex items-start gap-2">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
										Maintain ongoing screening against sanctions and PEP databases
									</li>
								</>
							)}
						</ul>
					</div>
				</div>
				<div className="rounded-lg bg-muted/30 border border-border/60 px-4 py-3">
					<p className="text-[11px] text-muted-foreground leading-relaxed">
						<span className="font-heading font-semibold text-foreground">Data Retention: </span>
						All assessment data, source query results, and supporting documents will be retained for a minimum of 5 years from the date of the business relationship termination, in compliance with PRC AML record-keeping requirements. Data is stored in AES-256 encrypted format with audit trail logging.
					</p>
				</div>
			</div>
		</div>
	);
}

function PerpetualScreening({ alerts, nextReviewDate, riskRating }: { alerts: ScreeningAlert[]; nextReviewDate: string; riskRating: "Low" | "High" }) {
	const isHigh = riskRating === "High";
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<BellRingIcon className="size-4 text-muted-foreground" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Perpetual Screening & Ongoing Monitoring</p>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CalendarIcon className="size-3.5" />
					Next review: {nextReviewDate}
				</div>
			</div>
			<p className="text-xs text-muted-foreground leading-relaxed">
				Continuous monitoring is active for this subject across all original data sources. Alerts are generated automatically when
				changes are detected in court records, corporate registries, sanctions lists, adverse media, or tax filings. Monitoring
				frequency is adjusted based on risk rating: standard cases are checked monthly, high-risk cases are checked weekly.
			</p>
			<div className={`rounded-xl border p-4 flex items-center justify-between ${isHigh ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
				<div className="flex items-center gap-2.5">
					<ActivityIcon className={`size-4 ${isHigh ? "text-amber-600" : "text-emerald-600"}`} />
					<span className="text-sm font-heading font-medium">{isHigh ? "Active Monitoring — Weekly Scans" : "Active Monitoring — Monthly Scans"}</span>
				</div>
				<span className={`text-[10px] font-semibold rounded-md border px-2 py-0.5 ${isHigh ? "bg-amber-500/15 text-amber-700 border-amber-500/20" : "bg-emerald-500/15 text-emerald-700 border-emerald-500/20"}`}>
					{alerts.length} alert{alerts.length !== 1 ? "s" : ""}
				</span>
			</div>
			<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
				{alerts.map((alert, i) => <AlertRow key={i} alert={alert} isLast={i === alerts.length - 1} />)}
			</div>
		</div>
	);
}

function AlertRow({ alert, isLast }: { alert: ScreeningAlert; isLast: boolean }) {
	const [open, setOpen] = useState(false);
	const severityBadge = { Critical: "bg-red-500/15 text-red-700 border-red-500/20", Warning: "bg-amber-500/15 text-amber-700 border-amber-500/20", Info: "bg-sky-500/15 text-sky-700 border-sky-500/20" }[alert.severity];
	const severityDot = { Critical: "bg-red-500", Warning: "bg-amber-500", Info: "bg-sky-500" }[alert.severity];
	return (
		<div className={!isLast ? "border-b border-border/50" : ""}>
			<button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/30 transition-colors">
				<div className="flex flex-col items-center gap-1 shrink-0 w-16">
					<span className="text-[10px] text-muted-foreground font-mono tracking-wide">{alert.date}</span>
					<div className={`h-2 w-2 rounded-full ${severityDot}`} />
				</div>
				<div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{alert.title}</div></div>
				<div className="flex items-center gap-2 shrink-0">
					<span className="text-[10px] font-semibold rounded-md border border-border px-1.5 py-0.5 bg-muted/50 text-muted-foreground">{alert.type}</span>
					<span className={`text-[10px] font-semibold rounded-md border px-1.5 py-0.5 ${severityBadge}`}>{alert.severity}</span>
					<ChevronDownIcon className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
				</div>
			</button>
			{open && (
				<div className="px-5 pb-3 pl-[5.5rem]"><p className="text-xs text-muted-foreground leading-relaxed">{alert.detail}</p></div>
			)}
		</div>
	);
}

/* ─── Document Evidence ─── */

function DocumentEvidenceSection({ documents }: { documents: DocumentEvidence[] }) {
	const typeLabel: Record<string, string> = { consent: "Consent", identity: "Identity", financial: "Financial", corporate: "Corporate", correspondence: "Correspondence" };
	const typeColor: Record<string, string> = {
		consent: "bg-violet-500/15 text-violet-700 border-violet-500/20",
		identity: "bg-sky-500/15 text-sky-700 border-sky-500/20",
		financial: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
		corporate: "bg-amber-500/15 text-amber-700 border-amber-500/20",
		correspondence: "bg-slate-500/15 text-slate-700 border-slate-500/20",
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<FileBadgeIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Document Evidence — {documents.length} files
				</p>
			</div>
			<div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-muted/60 to-muted/30 text-muted-foreground">
						<tr>
							<th className="text-left px-4 py-2.5 font-medium text-xs font-heading tracking-wide">Document</th>
							<th className="text-center px-4 py-2.5 font-medium text-xs font-heading tracking-wide w-24">Type</th>
							<th className="text-center px-4 py-2.5 font-medium text-xs font-heading tracking-wide w-20 hidden sm:table-cell">Format</th>
							<th className="text-left px-4 py-2.5 font-medium text-xs font-heading tracking-wide hidden sm:table-cell">Uploaded By</th>
							<th className="text-center px-4 py-2.5 font-medium text-xs font-heading tracking-wide w-24">Verified</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/60">
						{documents.map((doc) => (
							<DocumentRow key={doc.id} doc={doc} typeLabel={typeLabel} typeColor={typeColor} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function DocumentRow({ doc, typeLabel, typeColor }: { doc: DocumentEvidence; typeLabel: Record<string, string>; typeColor: Record<string, string> }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<tr className="hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => setOpen((v) => !v)}>
				<td className="px-4 py-3">
					<div className="flex items-center gap-2">
						<FileTextIcon className="size-3.5 text-muted-foreground shrink-0" />
						<span className="text-xs font-medium truncate">{doc.name}</span>
					</div>
				</td>
				<td className="px-4 py-3 text-center">
					<span className={`text-[9px] font-semibold rounded-md border px-1.5 py-0.5 ${typeColor[doc.type]}`}>
						{typeLabel[doc.type]}
					</span>
				</td>
				<td className="px-4 py-3 text-center hidden sm:table-cell">
					<span className="text-[10px] font-mono text-muted-foreground">{doc.format}</span>
				</td>
				<td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{doc.uploadedBy}</td>
				<td className="px-4 py-3 text-center">
					{doc.verified ? (
						<BadgeCheckIcon className="size-4 text-emerald-600 mx-auto" />
					) : (
						<ClockIcon className="size-4 text-amber-500 mx-auto" />
					)}
				</td>
			</tr>
			{open && (
				<tr>
					<td colSpan={5} className="px-4 py-3 bg-muted/10">
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pl-5">
							<div>
								<span className="text-muted-foreground">Size:</span>{" "}
								<span className="font-medium">{doc.sizeKB < 1000 ? `${doc.sizeKB} KB` : `${(doc.sizeKB / 1024).toFixed(1)} MB`}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Uploaded:</span>{" "}
								<span className="font-medium">{doc.uploadedDate}</span>
							</div>
							{doc.verified && doc.verifiedBy && (
								<div>
									<span className="text-muted-foreground">Verified by:</span>{" "}
									<span className="font-medium">{doc.verifiedBy}</span>
								</div>
							)}
							{doc.verified && doc.verifiedDate && (
								<div>
									<span className="text-muted-foreground">Verified:</span>{" "}
									<span className="font-medium">{doc.verifiedDate}</span>
								</div>
							)}
						</div>
						{doc.notes && (
							<p className="text-[11px] text-muted-foreground mt-2 pl-5 leading-relaxed">{doc.notes}</p>
						)}
					</td>
				</tr>
			)}
		</>
	);
}

/* ─── Audit Trail ─── */

function AuditTrailSection({ entries }: { entries: AuditTrailEntry[] }) {
	const [showAll, setShowAll] = useState(false);
	const displayed = showAll ? entries : entries.slice(0, 6);

	const categoryIcon: Record<string, { Icon: typeof CheckIcon; color: string }> = {
		system: { Icon: HistoryIcon, color: "text-sky-500" },
		analyst: { Icon: UserCheckIcon, color: "text-violet-500" },
		approval: { Icon: BadgeCheckIcon, color: "text-emerald-500" },
		data: { Icon: SearchIcon, color: "text-cyan-500" },
		escalation: { Icon: ArrowUpRightIcon, color: "text-red-500" },
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<ClipboardListIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Audit Trail — {entries.length} events
				</p>
			</div>
			<div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
				<div className="divide-y divide-border/50">
					{displayed.map((entry) => {
						const cat = categoryIcon[entry.category] ?? categoryIcon.system;
						return (
							<div key={entry.id} className="flex items-start gap-3 px-5 py-3 hover:bg-accent/20 transition-colors">
								<div className="flex flex-col items-center gap-1 shrink-0 w-20 pt-0.5">
									<span className="text-[10px] font-mono text-muted-foreground tracking-wide">
										{entry.timestamp.split(" ")[1]?.slice(0, 5)}
									</span>
									<cat.Icon className={`size-3.5 ${cat.color}`} />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">{entry.action}</span>
									</div>
									<div className="flex items-center gap-2 mt-0.5">
										<span className="text-[11px] text-muted-foreground">{entry.actor}</span>
										<span className="text-[9px] text-muted-foreground/40">·</span>
										<span className="text-[10px] text-muted-foreground/60">{entry.actorRole}</span>
									</div>
									{entry.detail && (
										<p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">{entry.detail}</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
				{entries.length > 6 && (
					<button
						onClick={() => setShowAll((v) => !v)}
						className="w-full px-5 py-2.5 text-center text-xs font-heading font-medium text-primary hover:bg-primary/5 transition-colors border-t border-border/50"
					>
						{showAll ? "Show less" : `Show all ${entries.length} events`}
					</button>
				)}
			</div>
		</div>
	);
}

/* ─── Analyst Notes ─── */

function AnalystNotes({ riskRating }: { riskRating: "Low" | "High" }) {
	const isHigh = riskRating === "High";
	const [notes, setNotes] = useState(
		isHigh
			? "Client's email explanation for property source of funds (claims family gift) requires documentary corroboration. Requested gift deed and donor bank statement — no response as of 17 May 2026.\n\nMeihe Trading investigation: preliminary findings issued by Shanghai MSB. Company ordered to produce 3 years of financial records. Recommend monitoring for outcome before proceeding.\n\nPriority: clarify property SOF before EDD interview on 24 May 2026."
			: "Standard onboarding case. All data sources returned consistent results with no anomalies. Wealth profile is coherent and proportionate to career trajectory.\n\nNo further action required. Approved for standard onboarding."
	);
	const [saved, setSaved] = useState(true);

	const handleChange = (value: string) => {
		setNotes(value);
		setSaved(false);
	};

	const handleSave = () => {
		setSaved(true);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<StickyNoteIcon className="size-4 text-muted-foreground" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Analyst Notes & Manual Findings
					</p>
				</div>
				<div className="flex items-center gap-2">
					{!saved && <span className="text-[10px] text-amber-600 font-heading">Unsaved changes</span>}
					<Button
						variant="outline"
						size="sm"
						onClick={handleSave}
						disabled={saved}
						className="font-heading text-xs gap-1"
					>
						<CheckIcon className="size-3" />
						Save
					</Button>
				</div>
			</div>
			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<textarea
					value={notes}
					onChange={(e) => handleChange(e.target.value)}
					className="w-full min-h-[120px] bg-transparent text-sm leading-relaxed resize-y outline-none placeholder:text-muted-foreground/40"
					placeholder="Add analyst observations, manual findings, or notes for the case file..."
				/>
				<div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
					<span className="text-[10px] text-muted-foreground/50">
						Last edited: 17 May 2026, 15:00 by {isHigh ? "Senior Analyst Li" : "Analyst Wang"}
					</span>
					<span className="text-[10px] text-muted-foreground/50">
						{notes.length} characters
					</span>
				</div>
			</div>
		</div>
	);
}

/* ─── Remediation Section ─── */

function RemediationSection({ items, riskRating }: { items: RemediationItem[]; riskRating: "Low" | "High" }) {
	const priorityStyle: Record<string, string> = {
		Critical: "bg-red-500/15 text-red-700 border-red-500/20",
		High: "bg-amber-500/15 text-amber-700 border-amber-500/20",
		Medium: "bg-sky-500/15 text-sky-700 border-sky-500/20",
		Low: "bg-slate-500/15 text-slate-700 border-slate-500/20",
	};
	const statusStyle: Record<string, string> = {
		Open: "bg-red-500/15 text-red-700 border-red-500/20",
		"In Progress": "bg-amber-500/15 text-amber-700 border-amber-500/20",
		Resolved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
		Overdue: "bg-red-600/20 text-red-800 border-red-600/20",
	};

	const open = items.filter((i) => i.status !== "Resolved").length;
	const resolved = items.filter((i) => i.status === "Resolved").length;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<ListTodoIcon className="size-4 text-muted-foreground" />
					<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
						Remediation Tasks — {open} open, {resolved} resolved
					</p>
				</div>
			</div>
			<div className="space-y-2">
				{items.map((item) => (
					<div key={item.id} className={`rounded-xl border p-4 transition-all ${item.status === "Resolved" ? "border-border bg-muted/20 opacity-70" : "border-border bg-card shadow-sm"}`}>
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-3 flex-1 min-w-0">
								<div className="mt-0.5">
									{item.status === "Resolved" ? (
										<SquareCheckIcon className="size-4 text-emerald-600" />
									) : (
										<TargetIcon className={`size-4 ${item.priority === "Critical" ? "text-red-500" : "text-amber-500"}`} />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-heading font-medium">{item.title}</div>
									<p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{item.description}</p>
									<div className="flex items-center flex-wrap gap-2 mt-2">
										<span className={`text-[9px] font-semibold rounded-md border px-1.5 py-0.5 ${priorityStyle[item.priority]}`}>
											{item.priority}
										</span>
										<span className={`text-[9px] font-semibold rounded-md border px-1.5 py-0.5 ${statusStyle[item.status]}`}>
											{item.status}
										</span>
										<span className="text-[10px] text-muted-foreground/60">
											Assignee: {item.assignee}
										</span>
										<span className="text-[10px] text-muted-foreground/60">
											Due: {item.dueDate}
										</span>
										{item.resolvedDate && (
											<span className="text-[10px] text-emerald-600/80">
												Resolved: {item.resolvedDate}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Perpetual KYC Setup ─── */

function PerpetualKycSetup({ riskRating, nextReviewDate }: { riskRating: "Low" | "High"; nextReviewDate: string }) {
	const isHigh = riskRating === "High";

	const config = isHigh
		? {
			reviewCycle: "6 months",
			screeningFreq: "Weekly",
			dataSources: "All 13 sources",
			autoEscalation: "Enabled — auto-escalate Critical alerts to MLRO",
			sanctionsScreening: "Weekly (OFAC, EU, UN, PBOC)",
			adverseMedia: "Weekly scan (Dow Jones, Caixin, Reuters)",
			corporateRegistry: "Monthly SAMR registry refresh",
			taxCompliance: "Quarterly STA cross-check",
		}
		: {
			reviewCycle: "12 months",
			screeningFreq: "Monthly",
			dataSources: "11 core sources",
			autoEscalation: "Enabled — auto-escalate Critical alerts to Senior Analyst",
			sanctionsScreening: "Quarterly (OFAC, EU, UN, PBOC)",
			adverseMedia: "Monthly scan (Dow Jones, Caixin)",
			corporateRegistry: "Quarterly SAMR registry refresh",
			taxCompliance: "Annual STA cross-check",
		};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<WrenchIcon className="size-4 text-muted-foreground" />
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">
					Perpetual KYC Configuration
				</p>
			</div>
			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
				<p className="text-xs text-muted-foreground leading-relaxed">
					Automated perpetual KYC monitoring is configured for this subject. The system continuously monitors data sources
					for material changes and generates alerts for compliance review. Configuration is based on the subject&apos;s risk
					rating and can be adjusted by authorized analysts.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<KycConfigRow label="Review Cycle" value={config.reviewCycle} highlight={isHigh} />
					<KycConfigRow label="Next Scheduled Review" value={nextReviewDate} />
					<KycConfigRow label="Screening Frequency" value={config.screeningFreq} highlight={isHigh} />
					<KycConfigRow label="Data Sources Monitored" value={config.dataSources} />
					<KycConfigRow label="Sanctions Screening" value={config.sanctionsScreening} />
					<KycConfigRow label="Adverse Media Monitoring" value={config.adverseMedia} />
					<KycConfigRow label="Corporate Registry Refresh" value={config.corporateRegistry} />
					<KycConfigRow label="Tax Compliance Check" value={config.taxCompliance} />
				</div>

				<div className={`rounded-lg px-4 py-3 border ${isHigh ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
					<div className="flex items-center gap-2 mb-1">
						<ShieldCheckIcon className={`size-3.5 ${isHigh ? "text-amber-600" : "text-emerald-600"}`} />
						<span className="text-xs font-heading font-semibold">Auto-Escalation</span>
					</div>
					<p className="text-[11px] text-muted-foreground leading-relaxed">{config.autoEscalation}</p>
				</div>
			</div>
		</div>
	);
}

function KycConfigRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
	return (
		<div className="rounded-lg border border-border/60 bg-muted/10 px-3.5 py-2.5">
			<div className="text-[9px] font-heading text-muted-foreground uppercase tracking-widest">{label}</div>
			<div className={`text-sm font-heading font-medium mt-0.5 ${highlight ? "text-amber-700" : ""}`}>{value}</div>
		</div>
	);
}

/* ─── Follow-Up Actions ─── */

interface ActionDef { id: string; label: string; description: string; Icon: typeof CheckIcon; color: string; bgColor: string; }

const LOW_RISK_ACTIONS: ActionDef[] = [
	{ id: "approve", label: "Approve — Standard Onboarding", description: "Client meets all SOW requirements. Proceed with standard account opening and KYC clearance.", Icon: CircleCheckBigIcon, color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15" },
	{ id: "schedule-review", label: "Schedule Periodic Review — 12 Months", description: "Set standard annual review cycle. Client will be re-assessed on the next review date.", Icon: CalendarClockIcon, color: "text-sky-700 dark:text-sky-400", bgColor: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15" },
];

const HIGH_RISK_ACTIONS: ActionDef[] = [
	{ id: "request-edd", label: "Request EDD Interview", description: "Schedule an enhanced due diligence interview with the client to clarify source of funds for property acquisitions.", Icon: MessageSquareIcon, color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15" },
	{ id: "escalate-mlro", label: "Escalate to MLRO", description: "Refer case to the Money Laundering Reporting Officer for review of unexplained wealth gap and regulatory flags.", Icon: ArrowUpRightIcon, color: "text-red-700 dark:text-red-400", bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15" },
	{ id: "hold", label: "Place On Hold — Pending Review", description: "Suspend onboarding process pending resolution of outstanding regulatory investigation and litigation.", Icon: PauseCircleIcon, color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15" },
	{ id: "reject", label: "Reject Application", description: "Decline client onboarding based on unacceptable risk profile and unverifiable source of wealth.", Icon: XCircleIcon, color: "text-red-700 dark:text-red-400", bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15" },
	{ id: "schedule-review", label: "Schedule Enhanced Review — 6 Months", description: "Set accelerated review cycle due to elevated risk profile. Client will be re-assessed in 6 months.", Icon: CalendarClockIcon, color: "text-sky-700 dark:text-sky-400", bgColor: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15" },
];

function FollowUpActions({ riskRating, confirmedActions, onConfirm }: { riskRating: "Low" | "High"; confirmedActions: Set<string>; onConfirm: (id: string) => void }) {
	const actions = riskRating === "High" ? HIGH_RISK_ACTIONS : LOW_RISK_ACTIONS;
	return (
		<div className="space-y-4">
			<div>
				<p className="text-[10px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-1">Recommended Actions</p>
				<p className="text-sm text-muted-foreground">
					{riskRating === "High"
						? "This case requires immediate attention. Select the appropriate follow-up action based on the assessment findings."
						: "Assessment is clean. Proceed with standard onboarding workflow."}
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{actions.map((action) => {
					const isConfirmed = confirmedActions.has(action.id);
					return (
						<button
							key={action.id}
							onClick={() => onConfirm(action.id)}
							disabled={isConfirmed}
							className={`text-left rounded-2xl border p-5 transition-all ${
								isConfirmed ? "border-primary/30 bg-primary/5 opacity-80" : action.bgColor
							}`}
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<action.Icon className={`size-4 ${isConfirmed ? "text-primary" : action.color}`} />
									<span className="text-sm font-heading font-semibold">{action.label}</span>
								</div>
								{isConfirmed && (
									<span className="text-[10px] font-semibold rounded-md border border-primary/20 px-1.5 py-0.5 bg-primary/15 text-primary">Queued</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Download Report ─── */

function DownloadReportButton({ report }: { report: SowReport }) {
	const download = () => {
		const p = report.profile;
		const isHigh = p.riskRating === "High";
		const riskColor = isHigh ? "#dc2626" : "#16a34a";
		const riskBg = isHigh ? "#fef2f2" : "#f0fdf4";
		const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

		const paramRows = report.keyParameters.map((param) => {
			const color = param.status === "critical" ? "#dc2626" : param.status === "warning" ? "#d97706" : "#16a34a";
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${param.label}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:${color}">${param.value}</td></tr>`;
		}).join("");

		const wealthRows = report.wealthBreakdown.map((item) => {
			const confColor = item.confidence === "High" ? "#16a34a" : item.confidence === "Medium" ? "#d97706" : "#dc2626";
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${item.category}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${item.estimatedAnnualRMB ? "¥" + formatRMB(item.estimatedAnnualRMB) : "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${item.estimatedTotalRMB !== null ? "¥" + formatRMB(item.estimatedTotalRMB) : "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;color:${confColor};font-weight:600;">${item.confidence}</td></tr>`;
		}).join("");

		const sourceRows = report.dataSources.map((s) => {
			const c = s.status === "confirmed" || s.status === "clear" ? "#16a34a" : s.status === "found" ? "#0284c7" : s.status === "flagged" ? "#d97706" : "#dc2626";
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${s.name}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${s.provider}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${c};font-weight:600;">${s.statusLabel}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${s.findings}</td></tr>`;
		}).join("");

		const screeningRows = report.screeningAlerts.map((a) => {
			const c = a.severity === "Critical" ? "#dc2626" : a.severity === "Warning" ? "#d97706" : "#0284c7";
			return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;">${a.date}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${a.type}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${c};font-weight:600;">${a.severity}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${a.title}</td></tr>`;
		}).join("");

		const narrativeHtml = report.narrative.split("\n\n").map((para) => `<p style="margin:0 0 12px 0;font-size:13px;line-height:1.7;color:#374151;">${para}</p>`).join("");

		const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SOW Report — ${p.nameEn}</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap');@media print{body{margin:0}.page-break{page-break-before:always}}body{font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#1f2937;max-width:800px;margin:0 auto;padding:40px 32px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px 12px;background:#f3f4f6;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:2px solid #d1d5db;font-family:'Inter',sans-serif}h1{font-size:22px;margin:0;font-family:'Inter',sans-serif}h2{font-size:16px;margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #e5e7eb;color:#111827;text-transform:uppercase;letter-spacing:.04em;font-family:'Inter',sans-serif}</style></head><body>
<div style="border-bottom:3px solid #1e3a5f;padding-bottom:16px;margin-bottom:24px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#6b7280;margin-bottom:4px">Confidential — Enhanced Due Diligence</div><h1>Source of Wealth Assessment Report</h1><div style="font-size:13px;color:#6b7280;margin-top:6px">Subject: ${p.name} (${p.nameEn}) | Generated: ${now}</div></div>
<div style="display:flex;gap:16px;margin-bottom:24px"><div style="flex:1;padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Risk Rating</div><div style="font-size:18px;font-weight:700;color:${riskColor};margin-top:2px">${p.riskRating.toUpperCase()}</div></div><div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Total Estimated Wealth</div><div style="font-size:18px;font-weight:700;margin-top:2px">¥${formatRMB(report.totalEstimatedWealthRMB)}</div></div><div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Est. Annual Income</div><div style="font-size:18px;font-weight:700;margin-top:2px">¥${formatRMB(report.totalEstimatedAnnualIncomeRMB)}</div></div></div>
<h2>1. Subject Profile</h2><table><tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:140px">Full Name</td><td style="padding:4px 0;font-size:13px">${p.name} (${p.nameEn})</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Date of Birth</td><td style="padding:4px 0;font-size:13px">${p.dateOfBirth} (Age ${p.age})</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Gender</td><td style="padding:4px 0;font-size:13px">${p.gender}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">ID Number</td><td style="padding:4px 0;font-size:13px;font-family:'JetBrains Mono',monospace">${p.idNumber}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Nationality</td><td style="padding:4px 0;font-size:13px">${p.nationality}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Occupation</td><td style="padding:4px 0;font-size:13px">${p.occupation}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Employer</td><td style="padding:4px 0;font-size:13px">${p.employer}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Location</td><td style="padding:4px 0;font-size:13px">${p.city}</td></tr></table>
<h2>2. Key Risk Parameters</h2><table><tr><th>Parameter</th><th>Assessment</th></tr>${paramRows}</table>
<h2>3. Risk Assessment</h2><div style="padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33;margin-bottom:8px"><div style="font-weight:700;color:${riskColor};margin-bottom:8px">Overall Risk: ${p.riskRating}</div><ul style="margin:0;padding-left:20px">${p.riskReasoningPoints.map((pt) => `<li style="font-size:13px;margin-bottom:4px">${pt}</li>`).join("")}</ul></div>
<div class="page-break"></div>
<h2>4. Wealth Breakdown</h2><table><tr><th>Category</th><th style="text-align:right">Annual (¥)</th><th style="text-align:right">Total Value (¥)</th><th style="text-align:center">Confidence</th></tr>${wealthRows}</table>
<h2>5. Data Sources Consulted (${report.dataSources.length})</h2><table><tr><th>Source</th><th>Provider</th><th>Status</th><th>Findings</th></tr>${sourceRows}</table>
<div class="page-break"></div>
<h2>6. SOW Narrative</h2>${narrativeHtml}
<h2>7. Perpetual Screening (${report.screeningAlerts.length} Alerts)</h2><div style="font-size:12px;color:#6b7280;margin-bottom:8px">Next scheduled review: ${report.nextReviewDate}</div><table><tr><th>Date</th><th>Type</th><th>Severity</th><th>Alert</th></tr>${screeningRows}</table>
<div style="border-top:2px solid #e5e7eb;margin-top:32px;padding-top:16px;font-size:11px;color:#9ca3af">This report was generated using verified data from government registries and regulated financial databases. All data sources are cited in Section 5. This document is for internal compliance use only.<br><br>Generated: ${now} | Next Review: ${report.nextReviewDate}</div>
</body></html>`;

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
		<Button variant="outline" onClick={download} className="gap-1.5 font-heading">
			<DownloadIcon className="size-3.5" />
			Download Report
		</Button>
	);
}

/* ─── Shared UI Components ─── */

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
		confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
		clear: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
		found: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20",
		flagged: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
		discrepancy: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
	}[status];
	return <span className={`text-[10px] font-semibold rounded-md border px-1.5 py-0.5 whitespace-nowrap ${color}`}>{label}</span>;
}

function RiskBadge({ rating, size = "sm" }: { rating: "Low" | "High"; size?: "sm" | "lg" }) {
	const color = rating === "High" ? "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
	const sizeClass = size === "lg" ? "text-xs px-3 py-1" : "text-[10px] px-1.5 py-0.5";
	return <span className={`font-semibold rounded-md border ${color} ${sizeClass}`}>{rating} Risk</span>;
}

function formatRMB(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
	return n.toLocaleString();
}
