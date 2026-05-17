export interface SowCaseProfile {
	id: string;
	name: string;
	nameEn: string;
	gender: "Male" | "Female";
	dateOfBirth: string;
	age: number;
	idNumber: string;
	nationality: string;
	occupation: string;
	employer: string;
	city: string;
	riskRating: "Low" | "High";
	riskReasoningPoints: string[];
	profileSummary: string;
}

export interface SowDataSource {
	id: string;
	name: string;
	provider: string;
	category: "Identity" | "Banking" | "Risk" | "Corporate" | "Income" | "Tax";
	delayMs: number;
	status: "confirmed" | "clear" | "found" | "flagged" | "discrepancy";
	statusLabel: string;
	findings: string;
}

export interface SowWealthItem {
	category: string;
	description: string;
	estimatedAnnualRMB: number | null;
	estimatedTotalRMB: number | null;
	confidence: "High" | "Medium" | "Low";
}

export interface ScreeningAlert {
	date: string;
	type: "Litigation" | "Adverse Media" | "Sanctions" | "Corporate Change" | "Tax" | "Regulatory";
	severity: "Info" | "Warning" | "Critical";
	title: string;
	detail: string;
}

export interface DocumentEvidence {
	id: string;
	name: string;
	type: "consent" | "identity" | "financial" | "corporate" | "correspondence";
	format: "PDF" | "JPG" | "PNG" | "XLSX";
	uploadedBy: string;
	uploadedDate: string;
	sizeKB: number;
	verified: boolean;
	verifiedBy?: string;
	verifiedDate?: string;
	notes?: string;
}

export interface AuditTrailEntry {
	id: string;
	timestamp: string;
	action: string;
	actor: string;
	actorRole: string;
	category: "system" | "analyst" | "approval" | "data" | "escalation";
	detail?: string;
}

export interface RemediationItem {
	id: string;
	title: string;
	description: string;
	priority: "Critical" | "High" | "Medium" | "Low";
	status: "Open" | "In Progress" | "Resolved" | "Overdue";
	assignee: string;
	createdDate: string;
	dueDate: string;
	resolvedDate?: string;
	category: "documentation" | "verification" | "investigation" | "regulatory" | "monitoring";
}

export interface DashboardIssue {
	id: string;
	caseRef: string;
	subjectName: string;
	type: "Overdue Review" | "Unresolved Alert" | "Missing Document" | "EDD Pending" | "Remediation Overdue" | "Data Source Error";
	severity: "Critical" | "High" | "Medium";
	description: string;
	daysPending: number;
	assignee: string;
}

export interface SowReport {
	profile: SowCaseProfile;
	dataSources: SowDataSource[];
	wealthBreakdown: SowWealthItem[];
	totalEstimatedWealthRMB: number;
	totalEstimatedAnnualIncomeRMB: number;
	narrative: string;
	screeningAlerts: ScreeningAlert[];
	nextReviewDate: string;
	keyParameters: { label: string; value: string; status: "normal" | "warning" | "critical" }[];
	documentEvidence: DocumentEvidence[];
	auditTrail: AuditTrailEntry[];
	remediationItems: RemediationItem[];
}

const LOW_RISK_PROFILE: SowCaseProfile = {
	id: "case-low",
	name: "陈志远",
	nameEn: "Chen Zhiyuan",
	gender: "Male",
	dateOfBirth: "1978-03-15",
	age: 48,
	idNumber: "4403••••••••3017",
	nationality: "Chinese",
	occupation: "Vice President, Technology",
	employer: "Shenzhen Yunchuang Technology Co., Ltd.",
	city: "Shenzhen, Guangdong",
	riskRating: "Low",
	riskReasoningPoints: [
		"Identity fully verified through MPS 4-factor authentication",
		"Declared income consistent with social insurance contribution records",
		"No litigation, criminal, or adverse media records found",
		"Commercial interests in two active companies — both in good standing with consistent filings",
		"Property holdings proportionate to verified income over career span",
		"Bank account and mobile number verified, all linked to the same identity",
		"Tax filings consistent across all available years, no discrepancies",
	],
	profileSummary:
		"Senior technology executive with 20+ years in the Shenzhen tech sector. Wealth derived primarily from salaried income and minority shareholdings in two active technology companies. All data sources return consistent, verified results with no anomalies.",
};

const LOW_RISK_SOURCES: SowDataSource[] = [
	{
		id: "kyc-2fv",
		name: "Identity Verification — 2-Factor",
		provider: "Ministry of Public Security",
		category: "Identity",
		delayMs: 1200,
		status: "confirmed",
		statusLabel: "Identity Confirmed",
		findings: "Full name and ID number match MPS records. Identity record is active and valid.",
	},
	{
		id: "kyc-4fv",
		name: "Identity Verification — 4-Factor",
		provider: "Ministry of Public Security",
		category: "Identity",
		delayMs: 1800,
		status: "confirmed",
		statusLabel: "All Four Factors Match",
		findings:
			"Name, ID number, issue date (2018-06-10), and expiry date (2038-06-10) all confirmed against MPS records.",
	},
	{
		id: "mobile-attr",
		name: "Mobile Number Attribution",
		provider: "Telecom Operator",
		category: "Identity",
		delayMs: 1000,
		status: "confirmed",
		statusLabel: "Mobile Verified",
		findings:
			"Number registered to China Mobile, Shenzhen, Guangdong. In service for 12+ years. Location consistent with declared residence.",
	},
	{
		id: "bank-3fv",
		name: "Bank Account Verification — 3-Factor",
		provider: "UnionPay",
		category: "Banking",
		delayMs: 1500,
		status: "confirmed",
		statusLabel: "Account Verified",
		findings: "Name, ID number, and bank card number confirmed through UnionPay. Account is active — China Merchants Bank, Category I account.",
	},
	{
		id: "adverse",
		name: "Adverse History — Risk Score",
		provider: "People's Bank of China",
		category: "Risk",
		delayMs: 2000,
		status: "clear",
		statusLabel: "No Adverse Records",
		findings: "No adverse records found. Risk score: Low. No criminal offenses or financial defaults on record.",
	},
	{
		id: "fraud",
		name: "Financial Risk Assessment",
		provider: "Major Credit Reporting Agencies",
		category: "Risk",
		delayMs: 1300,
		status: "clear",
		statusLabel: "No Risk Flags",
		findings:
			"No overdue online loans, no multi-platform borrowing behaviour detected. Credit standing is clean.",
	},
	{
		id: "litigation",
		name: "Litigation Records Search",
		provider: "Supreme People's Court",
		category: "Risk",
		delayMs: 2500,
		status: "clear",
		statusLabel: "No Records Found",
		findings:
			"No civil or criminal litigation records. No enforcement actions, no dishonest debtor records, no administrative penalties.",
	},
	{
		id: "commercial",
		name: "Commercial Interest Registry",
		provider: "People's Bank of China & Third-Party",
		category: "Corporate",
		delayMs: 2200,
		status: "found",
		statusLabel: "2 Companies Found",
		findings:
			"Holds positions in 2 enterprises: (1) Director & 35% shareholder — Shenzhen Yunchuang Technology Co., Ltd. (2) 8% shareholder — Guangdong Xinhe Software Co., Ltd.",
	},
	{
		id: "kyb-a",
		name: "KYB Report — Shenzhen Yunchuang Technology",
		provider: "SAMR & Third-Party Providers",
		category: "Corporate",
		delayMs: 2800,
		status: "confirmed",
		statusLabel: "Active — Good Standing",
		findings:
			"Registered capital: ¥5,000,000. Status: Active. Incorporated 2012. Business scope: software development, cloud computing services. 3 shareholders, 45 employees. Tax credit rating: A. No penalties, no litigation.",
	},
	{
		id: "kyb-b",
		name: "KYB Report — Guangdong Xinhe Software",
		provider: "SAMR & Third-Party Providers",
		category: "Corporate",
		delayMs: 3000,
		status: "confirmed",
		statusLabel: "Active — Good Standing",
		findings:
			"Registered capital: ¥20,000,000. Status: Active. Incorporated 2015. Business scope: enterprise software, SaaS platforms. 5 shareholders, 120 employees. Tax credit rating: A. No penalties.",
	},
	{
		id: "income",
		name: "Estimated Annual Income",
		provider: "MOHRSS (Social Insurance)",
		category: "Income",
		delayMs: 1500,
		status: "confirmed",
		statusLabel: "Income Verified",
		findings:
			"Estimated annual income based on social insurance contributions: ¥1,100,000 – ¥1,400,000 bracket. Consistent with declared occupation and seniority.",
	},
	{
		id: "tax",
		name: "Tax Filing Verification",
		provider: "State Taxation Administration",
		category: "Tax",
		delayMs: 2000,
		status: "confirmed",
		statusLabel: "Filings Consistent",
		findings:
			"Individual income tax filings verified for 2021–2025. Declared income consistent with social insurance records. No discrepancies or audit flags.",
	},
];

const LOW_RISK_WEALTH: SowWealthItem[] = [
	{
		category: "Employment Income",
		description:
			"Vice President, Technology at Shenzhen Yunchuang Technology Co., Ltd. Social insurance contributions indicate top-bracket salary consistent with senior tech management in Shenzhen.",
		estimatedAnnualRMB: 1_200_000,
		estimatedTotalRMB: null,
		confidence: "High",
	},
	{
		category: "Business Holdings — Yunchuang Technology",
		description:
			"35% equity stake in Shenzhen Yunchuang Technology Co., Ltd. (registered capital ¥5M, active since 2012). Company has 45 employees and an A-rated tax credit.",
		estimatedAnnualRMB: 180_000,
		estimatedTotalRMB: 1_750_000,
		confidence: "Medium",
	},
	{
		category: "Business Holdings — Xinhe Software",
		description:
			"8% equity stake in Guangdong Xinhe Software Co., Ltd. (registered capital ¥20M, active since 2015). Minority passive investment — no directorship.",
		estimatedAnnualRMB: 120_000,
		estimatedTotalRMB: 1_600_000,
		confidence: "Medium",
	},
	{
		category: "Property",
		description:
			"Two residential properties: (1) 89m² apartment in Nanshan District, Shenzhen — estimated market value ¥6,500,000. (2) 110m² apartment in Dongguan — estimated market value ¥2,800,000.",
		estimatedAnnualRMB: null,
		estimatedTotalRMB: 9_300_000,
		confidence: "High",
	},
	{
		category: "Investment & Dividend Income",
		description:
			"Dividend distributions from two company holdings, estimated based on company size, profitability indicators, and shareholding ratio.",
		estimatedAnnualRMB: 120_000,
		estimatedTotalRMB: null,
		confidence: "Medium",
	},
];

const LOW_RISK_NARRATIVE = `Chen Zhiyuan (陈志远), male, 48, is a senior technology executive based in Shenzhen, Guangdong Province. He serves as Vice President of Technology at Shenzhen Yunchuang Technology Co., Ltd., a software development firm he co-founded in 2012. His identity has been fully verified through the Ministry of Public Security's 4-factor authentication, with all credentials confirmed as active and valid.

His primary source of wealth is salaried employment income. Social insurance contribution records indicate an annual income in the ¥1.1M–¥1.4M range, consistent with senior management compensation in the Shenzhen technology sector. Tax filings from 2021–2025 corroborate this income level with no discrepancies.

In addition to employment income, Mr. Chen holds equity interests in two active technology companies. He is a 35% shareholder and director of Shenzhen Yunchuang Technology (registered capital ¥5M), and an 8% passive shareholder in Guangdong Xinhe Software (registered capital ¥20M). Both companies are in good standing with A-rated tax credit, no outstanding litigation, and no regulatory penalties. Combined estimated equity value is approximately ¥3,350,000 with annual dividend income estimated at ¥120,000.

His property portfolio consists of two residential apartments — one in Nanshan District, Shenzhen (est. ¥6.5M) and one in Dongguan (est. ¥2.8M) — with a combined estimated value of ¥9.3M. This property accumulation is proportionate to his verified income trajectory over a 20+ year career.

No adverse records were found across any data source. No litigation, no criminal history, no fraud indicators, no blacklist entries. Mobile and banking records are consistent with declared identity and residence. The overall wealth profile is coherent: income sources are identifiable, verifiable, and proportionate to the individual's career and business interests.`;

const HIGH_RISK_PROFILE: SowCaseProfile = {
	id: "case-high",
	name: "刘雨薇",
	nameEn: "Liu Yuwei",
	gender: "Female",
	dateOfBirth: "1993-08-22",
	age: 32,
	idNumber: "3101••••••••6028",
	nationality: "Chinese",
	occupation: "Independent Consultant",
	employer: "Self-employed",
	city: "Shanghai",
	riskRating: "High",
	riskReasoningPoints: [
		"Declared income (¥350K/year consulting) is inconsistent with property holdings (3 apartments, est. ¥18.5M total)",
		"Mobile number registered in Hangzhou, not Shanghai as declared — residence inconsistency",
		"Medium fraud risk score — phone number linked to multiple financial accounts across provinces",
		"2 civil litigation cases found: defendant in a ¥2.1M contract dispute (ongoing)",
		"One associated company under active regulatory investigation (Shanghai Meihe Trading)",
		"One associated company dissolved in 2024 — previously in real estate sector during regulatory crackdown",
		"Tax filings show discrepancies in 2023 and 2024 — declared income significantly below spending patterns",
		"Estimated ¥800K+ annual gap between verified income and apparent consumption/asset accumulation",
	],
	profileSummary:
		"Young self-declared independent consultant based in Shanghai. Significant unexplained wealth gap — property holdings and spending patterns are disproportionate to verified income. Multiple corporate associations including one under regulatory investigation and one dissolved entity. Litigation exposure and tax discrepancies compound the risk profile.",
};

const HIGH_RISK_SOURCES: SowDataSource[] = [
	{
		id: "kyc-2fv",
		name: "Identity Verification — 2-Factor",
		provider: "Ministry of Public Security",
		category: "Identity",
		delayMs: 1100,
		status: "confirmed",
		statusLabel: "Identity Confirmed",
		findings: "Full name and ID number match MPS records. Identity record is active and valid.",
	},
	{
		id: "kyc-4fv",
		name: "Identity Verification — 4-Factor",
		provider: "Ministry of Public Security",
		category: "Identity",
		delayMs: 1600,
		status: "confirmed",
		statusLabel: "All Four Factors Match",
		findings:
			"Name, ID number, issue date (2021-11-05), and expiry date (2041-11-05) confirmed against MPS records.",
	},
	{
		id: "mobile-attr",
		name: "Mobile Number Attribution",
		provider: "Telecom Operator",
		category: "Identity",
		delayMs: 1200,
		status: "flagged",
		statusLabel: "Location Mismatch",
		findings:
			"Number registered to China Unicom, Hangzhou, Zhejiang. Declared residence is Shanghai. Mobile in service for 4 years. Location inconsistency noted.",
	},
	{
		id: "bank-3fv",
		name: "Bank Account Verification — 3-Factor",
		provider: "UnionPay",
		category: "Banking",
		delayMs: 1400,
		status: "confirmed",
		statusLabel: "Account Verified",
		findings: "Name, ID number, and bank card number confirmed. Account active — ICBC, Category I account.",
	},
	{
		id: "adverse",
		name: "Adverse History — Risk Score",
		provider: "People's Bank of China",
		category: "Risk",
		delayMs: 1800,
		status: "clear",
		statusLabel: "No Criminal Records",
		findings:
			"No criminal offenses on record. No financial defaults recorded with PBOC. Risk score: Low-Medium.",
	},
	{
		id: "fraud",
		name: "Financial Risk Assessment",
		provider: "Major Credit Reporting Agencies",
		category: "Risk",
		delayMs: 1500,
		status: "flagged",
		statusLabel: "Medium Risk",
		findings:
			"Phone number linked to financial accounts at 6 institutions across 3 provinces (Shanghai, Zhejiang, Jiangsu). Multi-platform borrowing pattern detected. No current overdue amounts, but risk score elevated.",
	},
	{
		id: "litigation",
		name: "Litigation Records Search",
		provider: "Supreme People's Court",
		category: "Risk",
		delayMs: 2800,
		status: "flagged",
		statusLabel: "2 Cases Found",
		findings:
			"(1) Plaintiff in a ¥450,000 service fee dispute — resolved 2023. (2) Defendant in a ¥2,100,000 contract dispute filed by a Zhejiang trading company — case ongoing, hearing scheduled Q3 2026.",
	},
	{
		id: "commercial",
		name: "Commercial Interest Registry",
		provider: "People's Bank of China & Third-Party",
		category: "Corporate",
		delayMs: 2400,
		status: "found",
		statusLabel: "3 Companies Found",
		findings:
			"Holds positions in 3 enterprises: (1) 100% shareholder & director — Shanghai Yuwei Consulting Co., Ltd. (2) 60% shareholder & director — Shanghai Meihe Trading Co., Ltd. (3) Former 40% shareholder — Hangzhou Qianhe Real Estate Co., Ltd. (dissolved).",
	},
	{
		id: "kyb-a",
		name: "KYB Report — Shanghai Yuwei Consulting",
		provider: "SAMR & Third-Party Providers",
		category: "Corporate",
		delayMs: 2500,
		status: "confirmed",
		statusLabel: "Active",
		findings:
			"Registered capital: ¥500,000. Status: Active. Incorporated 2020. Business scope: management consulting, business advisory. Sole shareholder. 2 employees. Tax credit rating: B. No penalties.",
	},
	{
		id: "kyb-b",
		name: "KYB Report — Shanghai Meihe Trading",
		provider: "SAMR & Third-Party Providers",
		category: "Corporate",
		delayMs: 3000,
		status: "flagged",
		statusLabel: "Under Investigation",
		findings:
			"Registered capital: ¥3,000,000. Status: Active — regulatory investigation pending. Incorporated 2019. Business scope: import/export, general trading. 2 shareholders (Liu Yuwei 60%, Zhang Wei 40%). 8 employees. Tax credit rating: C. Administrative penalty recorded 2024 — failure to file annual report. Investigation by Shanghai Market Supervision Bureau opened Jan 2026.",
	},
	{
		id: "kyb-c",
		name: "KYB Report — Hangzhou Qianhe Real Estate",
		provider: "SAMR & Third-Party Providers",
		category: "Corporate",
		delayMs: 2200,
		status: "flagged",
		statusLabel: "Dissolved",
		findings:
			"Status: Dissolved (Oct 2024). Previously registered capital: ¥10,000,000. Business scope: real estate brokerage, property management. Dissolved during sector-wide regulatory tightening. 2 outstanding enforcement records at time of dissolution.",
	},
	{
		id: "income",
		name: "Estimated Annual Income",
		provider: "MOHRSS (Social Insurance)",
		category: "Income",
		delayMs: 1800,
		status: "discrepancy",
		statusLabel: "Income Gap Detected",
		findings:
			"Social insurance contributions indicate annual income in the ¥280,000 – ¥420,000 bracket. This is inconsistent with property holdings (3 apartments, est. combined value ¥18.5M) and apparent spending patterns.",
	},
	{
		id: "tax",
		name: "Tax Filing Verification",
		provider: "State Taxation Administration",
		category: "Tax",
		delayMs: 2300,
		status: "discrepancy",
		statusLabel: "Discrepancies Found",
		findings:
			"Individual income tax filings reviewed for 2021–2025. Declared income for 2023 (¥310,000) and 2024 (¥380,000) shows significant gap with estimated consumption. Consulting income reported under sole proprietorship — limited third-party verification available.",
	},
];

const HIGH_RISK_WEALTH: SowWealthItem[] = [
	{
		category: "Consulting Income",
		description:
			"Self-declared independent consultant operating through Shanghai Yuwei Consulting Co., Ltd. (sole shareholder). Social insurance contributions and tax filings indicate ¥280K–¥420K annual income. Limited third-party corroboration — income self-reported through sole proprietorship.",
		estimatedAnnualRMB: 350_000,
		estimatedTotalRMB: null,
		confidence: "Low",
	},
	{
		category: "Business Holdings — Yuwei Consulting",
		description:
			"100% ownership of Shanghai Yuwei Consulting (registered capital ¥500K, 2 employees). Minimal asset value — single-person consulting vehicle.",
		estimatedAnnualRMB: null,
		estimatedTotalRMB: 500_000,
		confidence: "Low",
	},
	{
		category: "Business Holdings — Meihe Trading",
		description:
			"60% shareholding in Shanghai Meihe Trading (registered capital ¥3M). Company is under active regulatory investigation by Shanghai Market Supervision Bureau. Tax credit rating: C. Valuation uncertain due to investigation status.",
		estimatedAnnualRMB: null,
		estimatedTotalRMB: 1_800_000,
		confidence: "Low",
	},
	{
		category: "Business Holdings — Qianhe Real Estate (Dissolved)",
		description:
			"Former 40% shareholder of Hangzhou Qianhe Real Estate Co., Ltd. (dissolved Oct 2024, registered capital ¥10M). 2 outstanding enforcement records at dissolution. Historical value — current realisable value unknown.",
		estimatedAnnualRMB: null,
		estimatedTotalRMB: 0,
		confidence: "Low",
	},
	{
		category: "Property",
		description:
			"Three residential properties in Shanghai: (1) 75m² apartment in Jing'an District — est. ¥8,200,000. (2) 62m² apartment in Pudong — est. ¥5,100,000. (3) 55m² apartment in Minhang — est. ¥5,200,000. Total property value is disproportionate to verified income.",
		estimatedAnnualRMB: null,
		estimatedTotalRMB: 18_500_000,
		confidence: "High",
	},
	{
		category: "Unexplained Gap",
		description:
			"Verified annual income (¥280K–¥420K) cannot account for accumulated property holdings (¥18.5M) over the subject's career span (approx. 10 working years since age 22). Even assuming maximum savings rate, the gap exceeds ¥800K per year. Sources of funds for property acquisitions are not explained by verified data.",
		estimatedAnnualRMB: 800_000,
		estimatedTotalRMB: null,
		confidence: "Low",
	},
];

const HIGH_RISK_NARRATIVE = `Liu Yuwei (刘雨薇), female, 32, presents as an independent management consultant based in Shanghai. Her identity has been verified through MPS 4-factor authentication. However, multiple data sources raise concerns about the consistency and plausibility of her declared source of wealth.

Her stated occupation is self-employed consulting, operated through Shanghai Yuwei Consulting Co., Ltd. — a sole-proprietorship vehicle with ¥500,000 registered capital and 2 employees. Social insurance records and tax filings indicate annual income in the ¥280,000–¥420,000 range. This income level is inconsistent with her property portfolio: three Shanghai apartments with a combined estimated market value of ¥18,500,000. Over an approximately 10-year career, her verified income cannot plausibly account for this level of asset accumulation, even under generous savings assumptions. The annual gap between verified income and apparent wealth accumulation exceeds ¥800,000.

Corporate associations introduce additional concerns. Ms. Liu holds a 60% stake in Shanghai Meihe Trading Co., Ltd., which is currently under active investigation by the Shanghai Market Supervision Bureau (opened January 2026) and carries a C-rated tax credit. She was also previously a 40% shareholder in Hangzhou Qianhe Real Estate Co., Ltd., which was dissolved in October 2024 during the real estate regulatory crackdown, with 2 outstanding enforcement records at the time of dissolution.

Litigation records show two civil cases: one resolved service fee dispute (¥450,000, plaintiff, 2023) and one ongoing contract dispute (¥2,100,000, defendant, hearing Q3 2026). Her mobile number is registered in Hangzhou rather than her declared residence of Shanghai, and is linked to financial accounts at 6 institutions across 3 provinces — an unusual pattern that elevates her fraud risk score.

In summary, the subject's verified income does not support her declared wealth. The property-to-income ratio is unexplained, one associated company is under investigation, another has been dissolved with enforcement records, and there are tax filing discrepancies across two years. This case requires enhanced due diligence with direct client engagement to clarify the source of funds for property acquisitions and the nature of trading activities through Meihe Trading.`;

const LOW_RISK_SCREENING: ScreeningAlert[] = [
	{
		date: "2026-04-28",
		type: "Sanctions",
		severity: "Info",
		title: "Sanctions screening clear — quarterly refresh",
		detail: "Quarterly sanctions screening against OFAC SDN, EU Consolidated List, UN Security Council, and PBOC blacklist completed. No matches found for subject or associated entities.",
	},
	{
		date: "2026-04-12",
		type: "Corporate Change",
		severity: "Info",
		title: "Annual return filed — Shenzhen Yunchuang Technology",
		detail: "2025 annual return filed with Shenzhen Market Supervision Bureau. No changes to shareholders, directors, or registered capital. Revenue reported at ¥12.3M (+8% YoY).",
	},
	{
		date: "2026-03-22",
		type: "Corporate Change",
		severity: "Info",
		title: "Employee count update — Shenzhen Yunchuang Technology",
		detail: "Social insurance registration count increased from 45 to 52 employees. Consistent with reported business growth trajectory.",
	},
	{
		date: "2026-03-08",
		type: "Corporate Change",
		severity: "Info",
		title: "New patent registered — Guangdong Xinhe Software",
		detail: "Utility patent #ZL202510234567.8 registered for cloud infrastructure optimization method. Business scope remains consistent with prior filings.",
	},
	{
		date: "2026-02-15",
		type: "Tax",
		severity: "Info",
		title: "FY2025 tax filing confirmed — Chen Zhiyuan",
		detail: "Individual income tax filing for FY2025 confirmed by STA. Declared income of ¥1,280,000 is consistent with prior filings and social insurance contributions. No discrepancies.",
	},
];

const HIGH_RISK_SCREENING: ScreeningAlert[] = [
	{
		date: "2026-05-10",
		type: "Regulatory",
		severity: "Critical",
		title: "Investigation update — Shanghai Meihe Trading",
		detail: "Shanghai Market Supervision Bureau issued preliminary findings. Company ordered to produce financial records for 2023–2025. Administrative hearing scheduled for June 2026.",
	},
	{
		date: "2026-04-28",
		type: "Litigation",
		severity: "Warning",
		title: "New court filing — contract dispute escalation",
		detail: "Zhejiang Huaxin Trading Co. filed supplementary claim increasing disputed amount from ¥2,100,000 to ¥3,450,000. Additional allegations of breach of fiduciary duty.",
	},
	{
		date: "2026-04-15",
		type: "Adverse Media",
		severity: "Warning",
		title: "Media mention — Shanghai real estate investigations",
		detail: "Subject's name appeared in a Caixin investigative report on former Hangzhou Qianhe Real Estate shareholders. Article alleges undisclosed related-party transactions during 2022–2023.",
	},
	{
		date: "2026-03-22",
		type: "Tax",
		severity: "Warning",
		title: "Tax audit notice issued — Shanghai Yuwei Consulting",
		detail: "State Taxation Administration issued audit notice for FY2024. Scope: individual income tax and corporate income tax cross-verification.",
	},
	{
		date: "2026-02-14",
		type: "Corporate Change",
		severity: "Info",
		title: "Director resignation — Shanghai Meihe Trading",
		detail: "Zhang Wei (40% shareholder) resigned as co-director. Liu Yuwei now sole director. No corresponding share transfer recorded.",
	},
	{
		date: "2026-01-30",
		type: "Sanctions",
		severity: "Warning",
		title: "Near-match on PEP database — secondary association",
		detail: "Automated PEP screening flagged a partial name match for 'Liu Wei' (brother, per client declaration) against provincial-level government official registry. Manual review determined this is a different individual — cleared, but flagged for ongoing monitoring.",
	},
	{
		date: "2026-01-15",
		type: "Adverse Media",
		severity: "Warning",
		title: "Social media activity flagged — luxury lifestyle inconsistency",
		detail: "Automated adverse media scan detected social media posts showing overseas travel (Maldives, Switzerland) and luxury goods purchases inconsistent with declared ¥350K annual income. Screenshots archived for EDD file.",
	},
	{
		date: "2025-12-20",
		type: "Regulatory",
		severity: "Critical",
		title: "SAMR administrative penalty — Shanghai Meihe Trading",
		detail: "Administrative penalty of ¥50,000 issued by Shanghai Market Supervision Bureau for failure to file 2024 annual report within statutory deadline. Second consecutive year of late filing.",
	},
];

const LOW_RISK_PARAMS: SowReport["keyParameters"] = [
	{ label: "Income-to-Wealth Ratio", value: "1 : 7.8", status: "normal" },
	{ label: "Wealth Accumulation Period", value: "20+ years", status: "normal" },
	{ label: "Income Verification", value: "Corroborated", status: "normal" },
	{ label: "Corporate Standing", value: "All Active / A-rated", status: "normal" },
	{ label: "Litigation Exposure", value: "None", status: "normal" },
	{ label: "Tax Compliance", value: "Consistent filings", status: "normal" },
	{ label: "PEP / Sanctions", value: "Not listed", status: "normal" },
	{ label: "Source of Funds", value: "Employment + Equity", status: "normal" },
];

const HIGH_RISK_PARAMS: SowReport["keyParameters"] = [
	{ label: "Income-to-Wealth Ratio", value: "1 : 18.1", status: "critical" },
	{ label: "Wealth Accumulation Period", value: "~10 years", status: "warning" },
	{ label: "Income Verification", value: "Self-reported only", status: "warning" },
	{ label: "Corporate Standing", value: "1 Under Investigation", status: "critical" },
	{ label: "Litigation Exposure", value: "2 cases (1 ongoing)", status: "warning" },
	{ label: "Tax Compliance", value: "Discrepancies 2023–24", status: "critical" },
	{ label: "PEP / Sanctions", value: "Not listed", status: "normal" },
	{ label: "Source of Funds", value: "Unexplained gap ¥800K+/yr", status: "critical" },
];

const LOW_RISK_DOCUMENTS: DocumentEvidence[] = [
	{ id: "doc-1", name: "Signed_Consent_Form_ChenZhiyuan.pdf", type: "consent", format: "PDF", uploadedBy: "Analyst Wang", uploadedDate: "2026-05-17 09:15", sizeKB: 245, verified: true, verifiedBy: "Senior Analyst Li", verifiedDate: "2026-05-17 09:22", notes: "Original consent form with wet signature, countersigned by relationship manager." },
	{ id: "doc-2", name: "ID_Card_Front_Back.jpg", type: "identity", format: "JPG", uploadedBy: "Analyst Wang", uploadedDate: "2026-05-17 09:16", sizeKB: 1830, verified: true, verifiedBy: "System (MPS 4-Factor)", verifiedDate: "2026-05-17 09:18" },
	{ id: "doc-3", name: "Bank_Statement_CMB_2025Q4.pdf", type: "financial", format: "PDF", uploadedBy: "Analyst Wang", uploadedDate: "2026-05-17 09:20", sizeKB: 412, verified: true, verifiedBy: "Analyst Wang", verifiedDate: "2026-05-17 10:05", notes: "Quarterly statement from China Merchants Bank. Income deposits consistent with declared salary." },
	{ id: "doc-4", name: "Yunchuang_Business_License.pdf", type: "corporate", format: "PDF", uploadedBy: "System (SAMR)", uploadedDate: "2026-05-17 09:35", sizeKB: 890, verified: true, verifiedBy: "System (SAMR Registry)", verifiedDate: "2026-05-17 09:35" },
	{ id: "doc-5", name: "Tax_Certificate_FY2025.pdf", type: "financial", format: "PDF", uploadedBy: "Analyst Wang", uploadedDate: "2026-05-17 09:25", sizeKB: 156, verified: true, verifiedBy: "Analyst Wang", verifiedDate: "2026-05-17 10:10" },
	{ id: "doc-6", name: "Property_Deed_Nanshan.pdf", type: "financial", format: "PDF", uploadedBy: "Analyst Wang", uploadedDate: "2026-05-17 09:28", sizeKB: 2100, verified: true, verifiedBy: "Senior Analyst Li", verifiedDate: "2026-05-17 10:30", notes: "Property registration certificate for Nanshan District apartment. Purchased 2018, mortgage fully paid." },
];

const HIGH_RISK_DOCUMENTS: DocumentEvidence[] = [
	{ id: "doc-1", name: "Signed_Consent_Form_LiuYuwei.pdf", type: "consent", format: "PDF", uploadedBy: "Analyst Zhang", uploadedDate: "2026-05-17 10:05", sizeKB: 198, verified: true, verifiedBy: "Senior Analyst Li", verifiedDate: "2026-05-17 10:12" },
	{ id: "doc-2", name: "ID_Card_Scan.jpg", type: "identity", format: "JPG", uploadedBy: "Analyst Zhang", uploadedDate: "2026-05-17 10:06", sizeKB: 1650, verified: true, verifiedBy: "System (MPS 4-Factor)", verifiedDate: "2026-05-17 10:08" },
	{ id: "doc-3", name: "ICBC_Statement_2025H2.pdf", type: "financial", format: "PDF", uploadedBy: "Analyst Zhang", uploadedDate: "2026-05-17 10:15", sizeKB: 380, verified: true, verifiedBy: "Analyst Zhang", verifiedDate: "2026-05-17 11:00", notes: "Statement shows irregular large deposits not matching declared consulting income." },
	{ id: "doc-4", name: "Yuwei_Consulting_Registration.pdf", type: "corporate", format: "PDF", uploadedBy: "System (SAMR)", uploadedDate: "2026-05-17 10:32", sizeKB: 560, verified: true, verifiedBy: "System (SAMR Registry)", verifiedDate: "2026-05-17 10:32" },
	{ id: "doc-5", name: "Meihe_Trading_Investigation_Notice.pdf", type: "corporate", format: "PDF", uploadedBy: "Analyst Zhang", uploadedDate: "2026-05-17 10:40", sizeKB: 125, verified: true, verifiedBy: "Senior Analyst Li", verifiedDate: "2026-05-17 11:15", notes: "Official notice from Shanghai MSB re: investigation opened Jan 2026." },
	{ id: "doc-6", name: "Property_Deed_Jingan.jpg", type: "financial", format: "JPG", uploadedBy: "Analyst Zhang", uploadedDate: "2026-05-17 10:20", sizeKB: 3200, verified: false, notes: "Pending verification — deed shows purchase price ¥7.8M in 2022, inconsistent with declared income at that time." },
	{ id: "doc-7", name: "Client_Email_SOF_Explanation.pdf", type: "correspondence", format: "PDF", uploadedBy: "Analyst Zhang", uploadedDate: "2026-05-17 14:30", sizeKB: 85, verified: false, notes: "Client's email response regarding source of funds for property. Claims family gift — no supporting documentation provided yet." },
];

const LOW_RISK_AUDIT: AuditTrailEntry[] = [
	{ id: "at-1", timestamp: "2026-05-17 09:10:00", action: "Case created", actor: "Analyst Wang", actorRole: "L2 Analyst", category: "system", detail: "New SOW case initiated for onboarding. Client referred by Private Banking RM." },
	{ id: "at-2", timestamp: "2026-05-17 09:15:00", action: "Consent form uploaded", actor: "Analyst Wang", actorRole: "L2 Analyst", category: "analyst", detail: "Signed consent form received and uploaded. Original retained in physical file." },
	{ id: "at-3", timestamp: "2026-05-17 09:18:00", action: "Identity verified (MPS 4-Factor)", actor: "System", actorRole: "Automated", category: "data", detail: "All 4 factors confirmed against MPS database. Verification ID: MPS-2026-0517-88421." },
	{ id: "at-4", timestamp: "2026-05-17 09:25:00", action: "Supporting documents uploaded", actor: "Analyst Wang", actorRole: "L2 Analyst", category: "analyst", detail: "Bank statement, tax certificate, and property deed uploaded for verification." },
	{ id: "at-5", timestamp: "2026-05-17 09:35:00", action: "Automated assessment initiated", actor: "System", actorRole: "Automated", category: "system", detail: "13 data sources queried. Assessment completed in 28.4 seconds." },
	{ id: "at-6", timestamp: "2026-05-17 10:05:00", action: "Document verification complete", actor: "Analyst Wang", actorRole: "L2 Analyst", category: "analyst", detail: "All uploaded documents reviewed and cross-referenced with data source findings." },
	{ id: "at-7", timestamp: "2026-05-17 10:30:00", action: "Senior review completed", actor: "Senior Analyst Li", actorRole: "L3 Senior Analyst", category: "approval", detail: "Report reviewed. Findings consistent. Risk rating confirmed as Low." },
	{ id: "at-8", timestamp: "2026-05-17 10:45:00", action: "Case approved — standard onboarding", actor: "Senior Analyst Li", actorRole: "L3 Senior Analyst", category: "approval", detail: "SOW assessment approved. Client cleared for standard onboarding. Annual review scheduled for 2027-05-17." },
];

const HIGH_RISK_AUDIT: AuditTrailEntry[] = [
	{ id: "at-1", timestamp: "2026-05-17 10:00:00", action: "Case created", actor: "Analyst Zhang", actorRole: "L2 Analyst", category: "system", detail: "New SOW case initiated. Client referred by Investment Banking division." },
	{ id: "at-2", timestamp: "2026-05-17 10:05:00", action: "Consent form uploaded", actor: "Analyst Zhang", actorRole: "L2 Analyst", category: "analyst" },
	{ id: "at-3", timestamp: "2026-05-17 10:08:00", action: "Identity verified (MPS 4-Factor)", actor: "System", actorRole: "Automated", category: "data", detail: "All 4 factors confirmed. Verification ID: MPS-2026-0517-91034." },
	{ id: "at-4", timestamp: "2026-05-17 10:15:00", action: "Supporting documents uploaded", actor: "Analyst Zhang", actorRole: "L2 Analyst", category: "analyst", detail: "Bank statement and ID scan uploaded." },
	{ id: "at-5", timestamp: "2026-05-17 10:32:00", action: "Automated assessment initiated", actor: "System", actorRole: "Automated", category: "system", detail: "13 data sources queried. Assessment completed in 32.1 seconds." },
	{ id: "at-6", timestamp: "2026-05-17 11:00:00", action: "Multiple risk flags identified", actor: "System", actorRole: "Automated", category: "data", detail: "Automated risk scoring flagged: income gap, litigation, corporate investigation, tax discrepancy." },
	{ id: "at-7", timestamp: "2026-05-17 11:15:00", action: "Investigation notice uploaded", actor: "Analyst Zhang", actorRole: "L2 Analyst", category: "analyst", detail: "Shanghai MSB investigation notice for Meihe Trading added to case file." },
	{ id: "at-8", timestamp: "2026-05-17 11:30:00", action: "Escalated to Senior Analyst", actor: "Analyst Zhang", actorRole: "L2 Analyst", category: "escalation", detail: "Case escalated due to High risk rating. Multiple unresolved findings require senior review." },
	{ id: "at-9", timestamp: "2026-05-17 13:00:00", action: "Senior review — EDD recommended", actor: "Senior Analyst Li", actorRole: "L3 Senior Analyst", category: "approval", detail: "Reviewed all findings. Recommending enhanced due diligence interview. Property source of funds must be clarified." },
	{ id: "at-10", timestamp: "2026-05-17 13:15:00", action: "MLRO notification sent", actor: "Senior Analyst Li", actorRole: "L3 Senior Analyst", category: "escalation", detail: "Case referred to MLRO (Chen Wei) for independent review per policy for cases scoring >70." },
	{ id: "at-11", timestamp: "2026-05-17 14:00:00", action: "EDD interview scheduled", actor: "Senior Analyst Li", actorRole: "L3 Senior Analyst", category: "analyst", detail: "Enhanced due diligence interview scheduled for 2026-05-24 at 14:00 CST." },
	{ id: "at-12", timestamp: "2026-05-17 14:30:00", action: "Client correspondence received", actor: "Analyst Zhang", actorRole: "L2 Analyst", category: "analyst", detail: "Client responded via email regarding source of funds query. Claims family gift for property — no documentation provided." },
	{ id: "at-13", timestamp: "2026-05-17 15:00:00", action: "Remediation tasks created", actor: "Senior Analyst Li", actorRole: "L3 Senior Analyst", category: "analyst", detail: "4 remediation items assigned: property SOF docs, EDD interview, Meihe Trading investigation follow-up, tax discrepancy review." },
];

const LOW_RISK_REMEDIATION: RemediationItem[] = [
	{ id: "rem-1", title: "Schedule annual periodic review", description: "Configure automated annual review with full data source refresh for 2027-05-17.", priority: "Low", status: "Resolved", assignee: "System", createdDate: "2026-05-17", dueDate: "2026-05-24", resolvedDate: "2026-05-17", category: "monitoring" },
	{ id: "rem-2", title: "Activate perpetual screening", description: "Enable monthly automated screening across sanctions, PEP, adverse media, and corporate registry sources.", priority: "Medium", status: "Resolved", assignee: "System", createdDate: "2026-05-17", dueDate: "2026-05-17", resolvedDate: "2026-05-17", category: "monitoring" },
];

const HIGH_RISK_REMEDIATION: RemediationItem[] = [
	{ id: "rem-1", title: "Obtain property source of funds documentation", description: "Request client to provide documentary evidence for source of funds for 3 Shanghai property acquisitions (total ¥18.5M). Acceptable: gift deed with donor's bank statement, sale contract showing prior asset sale, inheritance documentation.", priority: "Critical", status: "Open", assignee: "Analyst Zhang", createdDate: "2026-05-17", dueDate: "2026-05-31", category: "documentation" },
	{ id: "rem-2", title: "Complete EDD interview", description: "Conduct enhanced due diligence interview with client to clarify: (1) source of funds for properties, (2) nature of Meihe Trading activities, (3) explanation for tax filing discrepancies.", priority: "Critical", status: "In Progress", assignee: "Senior Analyst Li", createdDate: "2026-05-17", dueDate: "2026-05-24", category: "verification" },
	{ id: "rem-3", title: "Monitor Meihe Trading investigation outcome", description: "Track Shanghai MSB investigation progress. Administrative hearing scheduled June 2026. Request interim updates from public records.", priority: "High", status: "Open", assignee: "Analyst Zhang", createdDate: "2026-05-17", dueDate: "2026-07-31", category: "investigation" },
	{ id: "rem-4", title: "Review tax filing discrepancies with STA records", description: "Cross-reference client's FY2023 and FY2024 tax returns against social insurance contributions and bank statement deposits. Quantify the gap.", priority: "High", status: "In Progress", assignee: "Analyst Zhang", createdDate: "2026-05-17", dueDate: "2026-06-15", category: "verification" },
	{ id: "rem-5", title: "File STR if funds unexplained after 30 days", description: "Per PBOC directive, if source of funds for property acquisitions cannot be satisfactorily explained within 30 days of EDD request, file Suspicious Transaction Report.", priority: "Critical", status: "Open", assignee: "MLRO Chen Wei", createdDate: "2026-05-17", dueDate: "2026-06-24", category: "regulatory" },
	{ id: "rem-6", title: "Activate weekly perpetual screening", description: "Enable weekly automated screening for high-risk subject across all data sources including sanctions, adverse media, court records, and corporate registry.", priority: "Medium", status: "Resolved", assignee: "System", createdDate: "2026-05-17", dueDate: "2026-05-17", resolvedDate: "2026-05-17", category: "monitoring" },
];

export const DASHBOARD_ISSUES: DashboardIssue[] = [
	{ id: "iss-1", caseRef: "SOW-2025-0918-087", subjectName: "张丽华", type: "Unresolved Alert", severity: "Critical", description: "3 unresolved alerts including adverse media hit linked to regulatory investigation. Last reviewed 14 days ago.", daysPending: 14, assignee: "Senior Analyst Li" },
	{ id: "iss-2", caseRef: "SOW-2026-0402-291", subjectName: "赵薇薇", type: "EDD Pending", severity: "Critical", description: "Enhanced due diligence interview scheduled but not completed. 5 active alerts pending resolution.", daysPending: 45, assignee: "Senior Analyst Li" },
	{ id: "iss-3", caseRef: "SOW-2026-0402-291", subjectName: "赵薇薇", type: "Missing Document", severity: "High", description: "Client has not provided requested source of funds documentation for offshore transfers. Reminder sent 2 weeks ago.", daysPending: 30, assignee: "Analyst Zhang" },
	{ id: "iss-4", caseRef: "SOW-2026-0428-195", subjectName: "林婉琪", type: "Unresolved Alert", severity: "High", description: "Possible OFAC SDN partial match for associated entity requires manual verification and clearance.", daysPending: 21, assignee: "Analyst Wang" },
	{ id: "iss-5", caseRef: "SOW-2025-0918-087", subjectName: "张丽华", type: "Remediation Overdue", severity: "High", description: "Remediation task to obtain updated corporate filing from associated entity overdue by 8 days.", daysPending: 8, assignee: "Analyst Zhang" },
	{ id: "iss-6", caseRef: "SOW-2026-0428-195", subjectName: "林婉琪", type: "Overdue Review", severity: "Medium", description: "90-day interim review for high-risk case is 5 days overdue. Re-query of 6 data sources required.", daysPending: 5, assignee: "Analyst Wang" },
	{ id: "iss-7", caseRef: "SOW-2025-1203-412", subjectName: "王建国", type: "Data Source Error", severity: "Medium", description: "SAMR commercial registry query returned timeout during last automated monthly scan. Manual retry required.", daysPending: 3, assignee: "System" },
];

export const SOW_CASES: SowReport[] = [
	{
		profile: LOW_RISK_PROFILE,
		dataSources: LOW_RISK_SOURCES,
		wealthBreakdown: LOW_RISK_WEALTH,
		totalEstimatedWealthRMB: 12_650_000,
		totalEstimatedAnnualIncomeRMB: 1_620_000,
		narrative: LOW_RISK_NARRATIVE,
		screeningAlerts: LOW_RISK_SCREENING,
		nextReviewDate: "2027-05-17",
		keyParameters: LOW_RISK_PARAMS,
		documentEvidence: LOW_RISK_DOCUMENTS,
		auditTrail: LOW_RISK_AUDIT,
		remediationItems: LOW_RISK_REMEDIATION,
	},
	{
		profile: HIGH_RISK_PROFILE,
		dataSources: HIGH_RISK_SOURCES,
		wealthBreakdown: HIGH_RISK_WEALTH,
		totalEstimatedWealthRMB: 20_800_000,
		totalEstimatedAnnualIncomeRMB: 1_150_000,
		narrative: HIGH_RISK_NARRATIVE,
		screeningAlerts: HIGH_RISK_SCREENING,
		nextReviewDate: "2026-11-17",
		keyParameters: HIGH_RISK_PARAMS,
		documentEvidence: HIGH_RISK_DOCUMENTS,
		auditTrail: HIGH_RISK_AUDIT,
		remediationItems: HIGH_RISK_REMEDIATION,
	},
];
