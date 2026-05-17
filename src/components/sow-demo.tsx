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
	type SowReport,
	type SowDataSource,
	type SowWealthItem,
	type ScreeningAlert,
} from "@/lib/sow-mock-data";

type Phase = "intake" | "sources" | "generating" | "report";

const STEPS = [
	{ key: "intake", label: "New Case" },
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

const CATEGORY_META: Record<string, { description: string; Icon: typeof UserIcon }> = {
	Identity: {
		description: "Cross-reference subject identity against the Ministry of Public Security population registry and telecom operator records.",
		Icon: ShieldCheckIcon,
	},
	Banking: {
		description: "Verify bank account ownership through the UnionPay interbank settlement network.",
		Icon: LandmarkIcon,
	},
	Risk: {
		description: "Screen for criminal records, civil litigation, financial fraud indicators, and adverse media mentions.",
		Icon: ShieldAlertIcon,
	},
	Corporate: {
		description: "Search SAMR business registries for commercial interests and run full KYB verification reports on associated entities.",
		Icon: BuildingIcon,
	},
	Income: {
		description: "Estimate annual income bracket from MOHRSS social insurance contribution records.",
		Icon: BanknoteIcon,
	},
	Tax: {
		description: "Verify individual income tax filings through the State Taxation Administration and check for year-over-year discrepancies.",
		Icon: FileTextIcon,
	},
};

function generateCaseRef(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const seq = String(Math.floor(Math.random() * 900) + 100);
	return `SOW-${d.getFullYear()}-${pad(d.getMonth() + 1)}${pad(d.getDate())}-${seq}`;
}

export default function SowDemo() {
	const [phase, setPhase] = useState<Phase>("intake");
	const [selectedCase, setSelectedCase] = useState<SowReport | null>(null);
	const [caseRef, setCaseRef] = useState("");
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [completedSources, setCompletedSources] = useState<SowDataSource[]>([]);
	const [currentSourceIndex, setCurrentSourceIndex] = useState(-1);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [confirmedActions, setConfirmedActions] = useState<Set<string>>(new Set());
	const cancelRef = useRef(false);
	const reportRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

	const reset = () => {
		cancelRef.current = true;
		if (timerRef.current) clearInterval(timerRef.current);
		setPhase("intake");
		setSelectedCase(null);
		setCaseRef("");
		setFormData({});
		setCompletedSources([]);
		setCurrentSourceIndex(-1);
		setElapsedMs(0);
		setConfirmedActions(new Set());
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
				/>
			)}

			{phase === "sources" && selectedCase && (
				<DataSourceOverview
					report={selectedCase}
					caseRef={caseRef}
					onBegin={beginAssessment}
					onBack={() => setPhase("intake")}
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

/* ─── Step Indicator ─── */

function StepIndicator({ current }: { current: Phase }) {
	const currentIdx = STEPS.findIndex((s) => s.key === current);
	return (
		<div className="flex items-center justify-center gap-0 py-2">
			{STEPS.map((step, i) => {
				const isComplete = i < currentIdx;
				const isCurrent = i === currentIdx;
				const isFuture = i > currentIdx;
				return (
					<div key={step.key} className="flex items-center">
						<div className="flex items-center gap-2">
							<div
								className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
									isComplete
										? "bg-primary text-primary-foreground"
										: isCurrent
											? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
											: "bg-muted text-muted-foreground"
								}`}
							>
								{isComplete ? <CheckIcon className="size-3.5" /> : i + 1}
							</div>
							<span
								className={`text-sm font-medium hidden sm:inline ${
									isCurrent ? "text-foreground" : isFuture ? "text-muted-foreground/50" : "text-muted-foreground"
								}`}
							>
								{step.label}
							</span>
						</div>
						{i < STEPS.length - 1 && (
							<div className={`w-12 sm:w-20 h-px mx-2 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
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
			? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
			: "bg-amber-500/15 text-amber-700 dark:text-amber-400";
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm mb-4">
			<div className="flex items-center gap-1.5 text-muted-foreground">
				<HashIcon className="size-3.5" />
				<span className="font-mono text-xs">{caseRef}</span>
			</div>
			<span className="text-muted-foreground hidden sm:inline">|</span>
			<span className="font-medium">{p.name} ({p.nameEn})</span>
			<span className="text-muted-foreground hidden sm:inline">|</span>
			<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${statusColor}`}>
				{status}
			</span>
			<span className="text-muted-foreground hidden sm:inline">|</span>
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
}: {
	selectedCase: SowReport | null;
	formData: Record<string, string>;
	onSelectCase: (r: SowReport) => void;
	onUpdateField: (key: string, value: string) => void;
	onCreateCase: () => void;
}) {
	return (
		<div className="space-y-6">
			{/* Demo profile selector */}
			<div className="space-y-3">
				<div>
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
						Select Demo Profile
					</p>
					<p className="text-sm text-muted-foreground">
						Choose a pre-built client profile to populate the intake form, or enter details manually.
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{SOW_CASES.map((report) => {
						const p = report.profile;
						const isSelected = selectedCase?.profile.id === p.id;
						const isHigh = p.riskRating === "High";
						return (
							<button
								key={p.id}
								onClick={() => onSelectCase(report)}
								className={`text-left rounded-xl border p-4 transition-all ${
									isSelected
										? "border-primary bg-primary/5 ring-2 ring-primary/20"
										: "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2.5">
										<div className={`h-9 w-9 rounded-full flex items-center justify-center ${isHigh ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
											<UserIcon className={`size-4 ${isHigh ? "text-red-600" : "text-emerald-600"}`} />
										</div>
										<div>
											<div className="font-semibold text-sm">{p.name}</div>
											<div className="text-xs text-muted-foreground">{p.nameEn}</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<RiskBadge rating={p.riskRating} />
										{isSelected && (
											<div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
												<CheckIcon className="size-3 text-primary-foreground" />
											</div>
										)}
									</div>
								</div>
								<div className="text-xs text-muted-foreground">
									{p.age}, {p.gender} · {p.occupation} · {p.city}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Intake form */}
			{selectedCase && (
				<div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
					<FormSection title="Client Information">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<FormField label="Occupation" required value={formData.occupation ?? ""} onChange={(v) => onUpdateField("occupation", v)} />
							<FormField label="Employer / Company" value={formData.employer ?? ""} onChange={(v) => onUpdateField("employer", v)} />
							<FormField label="City of Residence" required value={formData.city ?? ""} onChange={(v) => onUpdateField("city", v)} />
						</div>
					</FormSection>

					<FormSection title="Account Details">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

					<Button onClick={onCreateCase} className="w-full gap-2" size="lg">
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
			<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h4>
			{children}
		</div>
	);
}

function FormField({
	label,
	value,
	onChange,
	required,
	placeholder,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	required?: boolean;
	placeholder?: string;
}) {
	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</label>
			<Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
		</div>
	);
}

function FormSelect({
	label,
	value,
	onChange,
	required,
	options,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	required?: boolean;
	options: string[];
}) {
	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</label>
			<Select value={value} onValueChange={(v) => onChange(v ?? "")}>
				<SelectTrigger className="w-full">
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

/* ─── Phase 2: Data Source Overview ─── */

function DataSourceOverview({
	report,
	caseRef,
	onBegin,
	onBack,
}: {
	report: SowReport;
	caseRef: string;
	onBegin: () => void;
	onBack: () => void;
}) {
	const sources = report.dataSources;
	const categories = ["Identity", "Banking", "Risk", "Corporate", "Income", "Tax"] as const;
	const grouped = categories
		.map((cat) => ({
			category: cat,
			items: sources.filter((s) => s.category === cat),
		}))
		.filter((g) => g.items.length > 0);

	const totalDelay = sources.reduce((sum, s) => sum + s.delayMs, 0);

	return (
		<div className="space-y-5">
			<CaseBanner caseRef={caseRef} report={report} status="In Progress" />

			<div>
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
					Data Sources to Query
				</p>
				<p className="text-sm text-muted-foreground">
					The following {sources.length} government and financial data sources will be queried to build the Source of Wealth assessment for {report.profile.name}.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{grouped.map((group) => {
					const meta = CATEGORY_META[group.category];
					const CatIcon = meta?.Icon ?? SearchIcon;
					return (
						<div key={group.category} className="rounded-xl border border-border bg-card p-4 shadow-sm">
							<div className="flex items-center gap-2.5 mb-2">
								<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
									<CatIcon className="size-4 text-primary" />
								</div>
								<div>
									<h4 className="text-sm font-semibold">{group.category}</h4>
									<span className="text-[10px] text-muted-foreground">
										{group.items.length} check{group.items.length !== 1 ? "s" : ""}
									</span>
								</div>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed mb-3">
								{meta?.description}
							</p>
							<div className="space-y-1.5">
								{group.items.map((source) => (
									<div key={source.id} className="flex items-start gap-2">
										<CheckCircle2Icon className="size-3.5 text-primary mt-0.5 shrink-0" />
										<div>
											<div className="text-xs font-medium">{source.name}</div>
											<div className="text-[11px] text-muted-foreground">
												{SOURCE_PURPOSES[source.id] ?? source.provider}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>

			<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
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
					<Button variant="outline" size="sm" onClick={onBack}>
						Back
					</Button>
					<Button size="sm" onClick={onBegin} className="gap-1.5">
						Begin Assessment
						<ArrowRightIcon className="size-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}

/* ─── Phase 3: Generating ─── */

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
						Running SOW assessment for {report.profile.name}
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

/* ─── Phase 4: Report ─── */

function ReportView({
	report,
	caseRef,
	confirmedActions,
	onConfirmAction,
	onReset,
}: {
	report: SowReport;
	caseRef: string;
	confirmedActions: Set<string>;
	onConfirmAction: (id: string) => void;
	onReset: () => void;
}) {
	const p = report.profile;

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
						New Case
					</Button>
				</div>
			</div>

			<ProfileCard profile={p} />
			<KeyParameters params={report.keyParameters} />
			<RiskAssessment profile={p} />
			<WealthBreakdown
				items={report.wealthBreakdown}
				totalWealth={report.totalEstimatedWealthRMB}
				totalIncome={report.totalEstimatedAnnualIncomeRMB}
			/>
			<DataSourceFindings sources={report.dataSources} />
			<NarrativeSection narrative={report.narrative} />
			<PerpetualScreening
				alerts={report.screeningAlerts}
				nextReviewDate={report.nextReviewDate}
				riskRating={p.riskRating}
			/>
			<FollowUpActions
				riskRating={p.riskRating}
				confirmedActions={confirmedActions}
				onConfirm={onConfirmAction}
			/>
		</div>
	);
}

/* ─── Report Sub-Components ─── */

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

function KeyParameters({ params }: { params: SowReport["keyParameters"] }) {
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
					<div key={i} className={`rounded-lg border p-3 ${statusStyle[param.status]}`}>
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
		<div className={`rounded-xl border p-5 shadow-sm ${isHigh ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
			<div className="flex items-center gap-3 mb-3">
				<ShieldAlertIcon className={`size-5 ${isHigh ? "text-red-600" : "text-emerald-600"}`} />
				<span className="font-semibold">Risk Assessment: {p.riskRating}</span>
			</div>
			<ul className="space-y-1.5">
				{p.riskReasoningPoints.map((point, i) => (
					<li key={i} className="flex items-start gap-2 text-sm">
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
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Wealth Breakdown</p>
			<div className="grid grid-cols-2 gap-3">
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Estimated Wealth</div>
					<div className="text-2xl font-bold mt-1 tabular-nums tracking-tight">¥{formatRMB(totalWealth)}</div>
				</div>
				<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
					<div className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Annual Income</div>
					<div className="text-2xl font-bold mt-1 tabular-nums tracking-tight">¥{formatRMB(totalIncome)}</div>
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
			<tr className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setOpen((v) => !v)}>
				<td className="px-4 py-2.5 font-medium">
					<div className="flex items-center gap-1.5">
						<ChevronDownIcon className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
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
					<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${confColor}`}>{item.confidence}</span>
				</td>
			</tr>
			{open && (
				<tr>
					<td colSpan={4} className="px-4 py-3 bg-muted/10">
						<p className="text-xs text-muted-foreground leading-relaxed pl-5">{item.description}</p>
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
	const grouped = categories.map((cat) => ({ category: cat, items: sources.filter((s) => s.category === cat) })).filter((g) => g.items.length > 0);

	return (
		<div className="space-y-3">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				Data Source Findings — {sources.length} sources queried
			</p>
			<div className="space-y-3">
				{grouped.map((group) => (
					<div key={group.category} className="rounded-xl border border-border overflow-hidden shadow-sm">
						<div className="px-4 py-2 bg-muted/30 border-b border-border">
							<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.category}</span>
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
												<div className="text-[11px] text-muted-foreground">{source.provider}</div>
											</div>
											<SourceStatusBadge status={source.status} label={source.statusLabel} />
											<ChevronDownIcon className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
										</button>
										{isOpen && (
											<div className="px-4 pb-3 pl-12">
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
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">SOW Narrative — AI-Generated Summary</p>
			<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
				{narrative.split("\n\n").map((para, i) => (
					<p key={i} className="text-sm leading-relaxed mb-3 last:mb-0">{para}</p>
				))}
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
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Perpetual Screening & Ongoing Monitoring</p>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<CalendarIcon className="size-3.5" />
					Next review: {nextReviewDate}
				</div>
			</div>
			<div className={`rounded-lg border p-3 flex items-center justify-between ${isHigh ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
				<div className="flex items-center gap-2">
					<ActivityIcon className={`size-4 ${isHigh ? "text-amber-600" : "text-emerald-600"}`} />
					<span className="text-sm font-medium">{isHigh ? "Active Monitoring — Elevated Alerts" : "Active Monitoring — Routine"}</span>
				</div>
				<span className={`text-xs font-semibold rounded px-2 py-0.5 ${isHigh ? "bg-amber-500/15 text-amber-700" : "bg-emerald-500/15 text-emerald-700"}`}>
					{alerts.length} alert{alerts.length !== 1 ? "s" : ""}
				</span>
			</div>
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
	const severityBadge = { Critical: "bg-red-500/15 text-red-700", Warning: "bg-amber-500/15 text-amber-700", Info: "bg-sky-500/15 text-sky-700" }[alert.severity];
	const severityDot = { Critical: "bg-red-500", Warning: "bg-amber-500", Info: "bg-sky-500" }[alert.severity];
	return (
		<div className={!isLast ? "border-b border-border" : ""}>
			<button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors">
				<div className="flex flex-col items-center gap-1 shrink-0 w-16">
					<span className="text-[10px] text-muted-foreground font-mono">{alert.date}</span>
					<div className={`h-2 w-2 rounded-full ${severityDot}`} />
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-sm font-medium truncate">{alert.title}</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-muted text-muted-foreground">{alert.type}</span>
					<span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${severityBadge}`}>{alert.severity}</span>
					<ChevronDownIcon className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
				</div>
			</button>
			{open && (
				<div className="px-4 pb-3 pl-[5.5rem]">
					<p className="text-xs text-muted-foreground leading-relaxed">{alert.detail}</p>
				</div>
			)}
		</div>
	);
}

/* ─── Follow-Up Actions ─── */

interface ActionDef {
	id: string;
	label: string;
	description: string;
	Icon: typeof CheckIcon;
	color: string;
	bgColor: string;
}

const LOW_RISK_ACTIONS: ActionDef[] = [
	{
		id: "approve",
		label: "Approve — Standard Onboarding",
		description: "Client meets all SOW requirements. Proceed with standard account opening and KYC clearance.",
		Icon: CircleCheckBigIcon,
		color: "text-emerald-700 dark:text-emerald-400",
		bgColor: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15",
	},
	{
		id: "schedule-review",
		label: "Schedule Periodic Review — 12 Months",
		description: "Set standard annual review cycle. Client will be re-assessed on the next review date.",
		Icon: CalendarClockIcon,
		color: "text-sky-700 dark:text-sky-400",
		bgColor: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15",
	},
];

const HIGH_RISK_ACTIONS: ActionDef[] = [
	{
		id: "request-edd",
		label: "Request EDD Interview",
		description: "Schedule an enhanced due diligence interview with the client to clarify source of funds for property acquisitions.",
		Icon: MessageSquareIcon,
		color: "text-amber-700 dark:text-amber-400",
		bgColor: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15",
	},
	{
		id: "escalate-mlro",
		label: "Escalate to MLRO",
		description: "Refer case to the Money Laundering Reporting Officer for review of unexplained wealth gap and regulatory flags.",
		Icon: ArrowUpRightIcon,
		color: "text-red-700 dark:text-red-400",
		bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
	},
	{
		id: "hold",
		label: "Place On Hold — Pending Review",
		description: "Suspend onboarding process pending resolution of outstanding regulatory investigation and litigation.",
		Icon: PauseCircleIcon,
		color: "text-amber-700 dark:text-amber-400",
		bgColor: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15",
	},
	{
		id: "reject",
		label: "Reject Application",
		description: "Decline client onboarding based on unacceptable risk profile and unverifiable source of wealth.",
		Icon: XCircleIcon,
		color: "text-red-700 dark:text-red-400",
		bgColor: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
	},
	{
		id: "schedule-review",
		label: "Schedule Enhanced Review — 6 Months",
		description: "Set accelerated review cycle due to elevated risk profile. Client will be re-assessed in 6 months.",
		Icon: CalendarClockIcon,
		color: "text-sky-700 dark:text-sky-400",
		bgColor: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15",
	},
];

function FollowUpActions({
	riskRating,
	confirmedActions,
	onConfirm,
}: {
	riskRating: "Low" | "High";
	confirmedActions: Set<string>;
	onConfirm: (id: string) => void;
}) {
	const actions = riskRating === "High" ? HIGH_RISK_ACTIONS : LOW_RISK_ACTIONS;
	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
					Recommended Actions
				</p>
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
							className={`text-left rounded-xl border p-4 transition-all ${
								isConfirmed
									? "border-primary/30 bg-primary/5 opacity-80"
									: action.bgColor
							}`}
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<action.Icon className={`size-4 ${isConfirmed ? "text-primary" : action.color}`} />
									<span className="text-sm font-semibold">{action.label}</span>
								</div>
								{isConfirmed && (
									<span className="text-[10px] font-semibold rounded px-1.5 py-0.5 bg-primary/15 text-primary">
										Queued
									</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{action.description}
							</p>
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

		const paramRows = report.keyParameters
			.map((param) => {
				const color = param.status === "critical" ? "#dc2626" : param.status === "warning" ? "#d97706" : "#16a34a";
				return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${param.label}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:${color}">${param.value}</td></tr>`;
			}).join("");

		const wealthRows = report.wealthBreakdown
			.map((item) => {
				const confColor = item.confidence === "High" ? "#16a34a" : item.confidence === "Medium" ? "#d97706" : "#dc2626";
				return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${item.category}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${item.estimatedAnnualRMB ? "¥" + formatRMB(item.estimatedAnnualRMB) : "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-family:monospace;">${item.estimatedTotalRMB !== null ? "¥" + formatRMB(item.estimatedTotalRMB) : "—"}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;color:${confColor};font-weight:600;">${item.confidence}</td></tr>`;
			}).join("");

		const sourceRows = report.dataSources
			.map((s) => {
				const c = s.status === "confirmed" || s.status === "clear" ? "#16a34a" : s.status === "found" ? "#0284c7" : s.status === "flagged" ? "#d97706" : "#dc2626";
				return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${s.name}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${s.provider}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${c};font-weight:600;">${s.statusLabel}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;">${s.findings}</td></tr>`;
			}).join("");

		const screeningRows = report.screeningAlerts
			.map((a) => {
				const c = a.severity === "Critical" ? "#dc2626" : a.severity === "Warning" ? "#d97706" : "#0284c7";
				return `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-family:monospace;">${a.date}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${a.type}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${c};font-weight:600;">${a.severity}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${a.title}</td></tr>`;
			}).join("");

		const narrativeHtml = report.narrative.split("\n\n").map((para) => `<p style="margin:0 0 12px 0;font-size:13px;line-height:1.7;color:#374151;">${para}</p>`).join("");

		const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>SOW Report — ${p.nameEn}</title><style>@media print{body{margin:0}.page-break{page-break-before:always}}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1f2937;max-width:800px;margin:0 auto;padding:40px 32px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px 12px;background:#f3f4f6;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:2px solid #d1d5db}h1{font-size:22px;margin:0}h2{font-size:16px;margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #e5e7eb;color:#111827;text-transform:uppercase;letter-spacing:.04em}</style></head><body>
<div style="border-bottom:3px solid #1e3a5f;padding-bottom:16px;margin-bottom:24px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#6b7280;margin-bottom:4px">Confidential — Enhanced Due Diligence</div><h1>Source of Wealth Assessment Report</h1><div style="font-size:13px;color:#6b7280;margin-top:6px">Subject: ${p.name} (${p.nameEn}) | Generated: ${now}</div></div>
<div style="display:flex;gap:16px;margin-bottom:24px"><div style="flex:1;padding:12px 16px;border-radius:8px;background:${riskBg};border:1px solid ${riskColor}33"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Risk Rating</div><div style="font-size:18px;font-weight:700;color:${riskColor};margin-top:2px">${p.riskRating.toUpperCase()}</div></div><div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Total Estimated Wealth</div><div style="font-size:18px;font-weight:700;margin-top:2px">¥${formatRMB(report.totalEstimatedWealthRMB)}</div></div><div style="flex:1;padding:12px 16px;border-radius:8px;background:#f3f4f6"><div style="font-size:10px;text-transform:uppercase;color:#6b7280">Est. Annual Income</div><div style="font-size:18px;font-weight:700;margin-top:2px">¥${formatRMB(report.totalEstimatedAnnualIncomeRMB)}</div></div></div>
<h2>1. Subject Profile</h2><table><tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:140px">Full Name</td><td style="padding:4px 0;font-size:13px">${p.name} (${p.nameEn})</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Date of Birth</td><td style="padding:4px 0;font-size:13px">${p.dateOfBirth} (Age ${p.age})</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Gender</td><td style="padding:4px 0;font-size:13px">${p.gender}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">ID Number</td><td style="padding:4px 0;font-size:13px;font-family:monospace">${p.idNumber}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Nationality</td><td style="padding:4px 0;font-size:13px">${p.nationality}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Occupation</td><td style="padding:4px 0;font-size:13px">${p.occupation}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Employer</td><td style="padding:4px 0;font-size:13px">${p.employer}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#6b7280">Location</td><td style="padding:4px 0;font-size:13px">${p.city}</td></tr></table>
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
		<Button variant="outline" onClick={download} className="gap-1.5">
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
		confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		clear: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		found: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
		flagged: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
		discrepancy: "bg-red-500/15 text-red-700 dark:text-red-400",
	}[status];
	return <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 whitespace-nowrap ${color}`}>{label}</span>;
}

function RiskBadge({ rating, size = "sm" }: { rating: "Low" | "High"; size?: "sm" | "lg" }) {
	const color = rating === "High" ? "bg-red-500/15 text-red-700 dark:text-red-400" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
	const sizeClass = size === "lg" ? "text-xs px-2.5 py-1" : "text-[10px] px-1.5 py-0.5";
	return <span className={`font-semibold rounded ${color} ${sizeClass}`}>{rating} Risk</span>;
}

function formatRMB(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
	return n.toLocaleString();
}
