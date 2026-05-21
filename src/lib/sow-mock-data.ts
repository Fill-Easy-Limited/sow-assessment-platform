/* ═══════════════════════════════════════════════════════════════
   HNW Wealth Intelligence — Data Model & Mock Data
   Four reference cases: Jack Ma, Yat Siu, Donald Trump & James Chen Wei
   ═══════════════════════════════════════════════════════════════ */

// ── Interfaces ──────────────────────────────────────────────────

export interface SourceScreenshot {
	thumbnailDescription: string;
	capturedAt: string;
	pageTitle: string;
	faviconColor: string;
	domain: string;
}

export interface SourceAuditTrail {
	firstAccessed: string;
	lastAccessed: string;
	screenshotCaptured: string;
	verifiedBy: string;
	accessCount: number;
}

export interface CompanySearchTemplate {
	registryName: string;
	registryUrl: string;
	searchFields: { label: string; value: string }[];
	jurisdiction: string;
	searchType: string;
}

export interface ClientDocument {
	id: string;
	type: "passport" | "bank-statement" | "tax-return" | "share-certificate" | "property-deed" | "trust-deed" | "incorporation-cert" | "annual-return" | "reference-letter" | "other";
	label: string;
	submittedBy: string;
	submittedDate: string;
	status: "verified" | "pending" | "flagged" | "expired";
	fileDescription: string;
	verificationNotes?: string;
	governmentAuthority?: string;
}

export interface CrossReference {
	id: string;
	field: string;
	clientDocLabel: string;
	externalSourceLabel: string;
	clientValue: string;
	externalValue: string;
	match: "exact" | "partial" | "mismatch" | "not-available";
	confidence: number;
	verifiedVia?: string;
	notes?: string;
}

export interface DocumentUploadSlot {
	id: string;
	type: string;
	label: string;
	description: string;
	required: boolean;
	status: "uploaded" | "pending" | "optional";
}

export interface SourceCitation {
	id: string;
	label: string;
	url?: string;
	date?: string;
	type: "filing" | "news" | "registry" | "market-data" | "public-record" | "estimate";
	screenshot?: SourceScreenshot;
	auditTrail?: SourceAuditTrail;
	companySearchTemplate?: CompanySearchTemplate;
}

export interface WealthClaim {
	id: string;
	description: string;
	estimatedValueUSD: number;
	confidence: number; // 0-100
	savingRate?: number; // 0-100, percentage of income plausibly saved
	sources: SourceCitation[];
}

export type WealthCategory = "income" | "companies" | "investments" | "alternatives" | "crypto";

export const CATEGORY_LABELS: Record<WealthCategory, string> = {
	income: "Income",
	companies: "Companies & Equity",
	investments: "Investments",
	alternatives: "Alternative Assets",
	crypto: "Crypto & Digital Assets",
};

export const CATEGORY_COLORS: Record<WealthCategory, string> = {
	income: "#0891b2",
	companies: "#0d9488",
	investments: "#6366f1",
	alternatives: "#d97706",
	crypto: "#9333ea",
};

// ── Composite Risk Rating (A+ to E) ──────────────────────────────

export type CorroborationGrade = "A+" | "A" | "B" | "C" | "D" | "E";

export interface GradeConfig {
	grade: CorroborationGrade;
	label: string;
	color: string;
	bgColor: string;
	borderColor: string;
	hexColor: string;
	minConfidence: number;
}

export const GRADE_CONFIGS: GradeConfig[] = [
	{ grade: "A+", label: "Fully Corroborated",      color: "text-emerald-800 dark:text-emerald-300", bgColor: "bg-emerald-600/15", borderColor: "border-emerald-600/30", hexColor: "#065f46", minConfidence: 90 },
	{ grade: "A",  label: "Highly Corroborated",      color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/25", hexColor: "#047857", minConfidence: 80 },
	{ grade: "B",  label: "Well Corroborated",         color: "text-blue-700 dark:text-blue-400",       bgColor: "bg-blue-500/10",    borderColor: "border-blue-500/25",    hexColor: "#1d4ed8", minConfidence: 70 },
	{ grade: "C",  label: "Moderately Corroborated",   color: "text-yellow-700 dark:text-yellow-400",   bgColor: "bg-yellow-500/10",  borderColor: "border-yellow-500/25",  hexColor: "#a16207", minConfidence: 60 },
	{ grade: "D",  label: "Weak Corroboration",        color: "text-orange-700 dark:text-orange-400",   bgColor: "bg-orange-500/10",  borderColor: "border-orange-500/25",  hexColor: "#c2410c", minConfidence: 50 },
	{ grade: "E",  label: "Poor / Not Corroborated",   color: "text-red-700 dark:text-red-400",         bgColor: "bg-red-500/10",     borderColor: "border-red-500/25",     hexColor: "#b91c1c", minConfidence: 0 },
];

export function getCorroborationGrade(overallConfidence: number): GradeConfig {
	return GRADE_CONFIGS.find(g => overallConfidence >= g.minConfidence) ?? GRADE_CONFIGS[GRADE_CONFIGS.length - 1];
}

export interface CategoryBreakdown {
	category: WealthCategory;
	claims: WealthClaim[];
	subtotalUSD: number;
	avgConfidence: number;
}

export interface CareerPhase {
	id: string;
	title: string;
	organization?: string;
	role?: string;
	startYear: number;
	endYear: number | null; // null = present
	location: string;
	description: string;
	categories: CategoryBreakdown[];
	phaseWealthUSD: number;
	cumulativeWealthUSD: number;
	keyEvents: string[];
}

export interface HnwProfile {
	id: string;
	name: string;
	nameCn?: string;
	dateOfBirth: string;
	age: number;
	nationality: string;
	residences: string[];
	primaryIndustry: string;
	estimatedNetWorthUSD: number;
	netWorthSource: string;
	riskRating: "Low" | "Medium" | "High";
	riskScore: number;
	profileSummary: string;
}

export interface KeyParameter {
	label: string;
	value: string;
	status: "normal" | "warning" | "critical";
}

export interface DataSourceDef {
	id: string;
	name: string;
	provider: string;
	category: string;
	delayMs: number;
}

export interface CompanyNode {
	name: string;
	role: string;
	ownership?: string;
	status: "active" | "ipo" | "exited" | "restructured" | "delisted" | "dissolved" | "pending";
	valuation?: string;
	type?: "holding" | "subsidiary" | "fund" | "trust" | "foundation" | "jv" | "token" | "investment";
	jurisdiction?: string;
	children?: CompanyNode[];
}

export interface PepScreeningEntry {
	subjectName: string;
	subjectNameCn?: string;
	riskRating: "Low" | "Medium" | "High";
	lastScreened: string;
	listsChecked: string[];
	pepHits: number;
	pepDetails?: string;
	sanctionsHits: number;
	adverseMedia: number;
	adverseMediaDetails?: string;
	overallStatus: "Clear" | "Review Required" | "Flagged";
}

export interface CorroborationScores {
	consistency: number;  // 0-100: risk that wealth trajectory is inconsistent with career
	correctness: number;  // 0-100: risk that data points are factually inaccurate
	completeness: number; // 0-100: risk that material wealth sources are unaccounted for
	masReference: string; // MAS Notice/Guideline reference
}

export interface AgentVerification {
	agentId: string;
	agentName: string;
	timestamp: string;
	overallStatus: "verified" | "flagged" | "requires-review";
	checks: { id: string; category: "consistency" | "correctness" | "completeness"; label: string; status: "pass" | "flag" | "warn"; detail: string }[];
	summary: string;
	recommendations: string[];
}

export interface HnwReport {
	profile: HnwProfile;
	careerTimeline: CareerPhase[];
	totalEstimatedWealthUSD: number;
	wealthByCategory: { category: WealthCategory; totalUSD: number; percentage: number; avgConfidence: number }[];
	overallConfidence: number;
	narrative: string;
	keyParameters: KeyParameter[];
	dataSources: DataSourceDef[];
	companyNodes: CompanyNode[];
	screeningResult: PepScreeningEntry;
	clientDocuments: ClientDocument[];
	crossReferences: CrossReference[];
	uploadSlots: DocumentUploadSlot[];
	corroborationScores: CorroborationScores;
	agentVerification: AgentVerification;
	corroborationGrade: CorroborationGrade;
	fourEyeCheck: FourEyeCheck;
	personalRelationships: PersonalRelationship[];
	crossLLMValidation?: CrossLLMValidation;
}

export interface FourEyeCheck {
	analyst: { name: string; role: string; timestamp: string };
	reviewer: { name: string; role: string; timestamp: string } | null;
	status: "drafted" | "reviewed" | "approved" | "released";
	signOffHistory: { action: string; by: string; at: string; comment?: string }[];
}

export interface PersonalRelationship {
	id: string;
	name: string;
	relationship: "spouse" | "child" | "sibling" | "associate" | "advisor" | "trustee" | "beneficiary" | "parent";
	notes?: string;
	linkedEntities?: string[];
}

export interface CrossLLMValidation {
	models: { id: string; label: string; narrative: string; tokens: number }[];
	gapAnalysis: { area: string; model1Finding: string; model2Finding: string; status: "agree" | "disagree" | "partial" }[];
	factualVsInferred: { category: string; factualPercent: number; inferredPercent: number }[];
	consensusScore: number;
}

export interface HnwMonitoringEntry {
	id: string;
	name: string;
	nameCn?: string;
	industry: string;
	estimatedNetWorthUSD: number;
	riskRating: "Low" | "Medium" | "High";
	corroborationGrade: CorroborationGrade;
	overallConfidence: number;
	lastScreened: string;
	openAlerts: number;
	status: "Active" | "Under Review" | "Flagged";
	screeningFrequency: string;
}

export interface HnwNotification {
	id: string;
	type: "alert" | "review-due" | "update" | "completed";
	title: string;
	detail: string;
	time: string;
	subjectName: string;
	read: boolean;
}

// ── Utility ─────────────────────────────────────────────────────

export function formatUSD(value: number): string {
	if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
	if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
	return `$${value.toFixed(0)}`;
}

// ── Jack Ma: Sources ────────────────────────────────────────────

function srcMeta(domain: string, pageTitle: string, desc: string, faviconColor: string, verifiedBy = "Automated Crawler v3.1"): Pick<SourceCitation, "screenshot" | "auditTrail"> {
	const base = "2026-05-17T";
	const hh = String(8 + Math.floor(Math.random() * 10)).padStart(2, "0");
	const mm = String(Math.floor(Math.random() * 60)).padStart(2, "0");
	const ss = String(Math.floor(Math.random() * 60)).padStart(2, "0");
	const ts = `${base}${hh}:${mm}:${ss}Z`;
	const ts2 = `${base}${hh}:${String(Math.min(59, Number(mm) + 2)).padStart(2, "0")}:${ss}Z`;
	return {
		screenshot: { thumbnailDescription: desc, capturedAt: ts, pageTitle, faviconColor, domain },
		auditTrail: { firstAccessed: ts, lastAccessed: ts2, screenshotCaptured: ts, verifiedBy, accessCount: 1 + Math.floor(Math.random() * 4) },
	};
}

const SRC_MA: Record<string, SourceCitation> = {
	secF1: {
		id: "s1", label: "SEC Form F-1 (Alibaba Group, 2014)", url: "https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm", date: "2014-05-06", type: "filing",
		...srcMeta("sec.gov", "SEC EDGAR | Form F-1 | Alibaba Group Holding Limited", "SEC EDGAR filing page showing Form F-1 registration statement for Alibaba Group Holding Limited, filed 2014-05-06. Document header visible with CIK 0001577552 and filer information.", "#003366"),
	},
	nyseIpo: {
		id: "s2", label: "NYSE: BABA IPO — $25B raised at $68/share", url: "https://www.nyse.com/quote/XNYS:BABA", date: "2014-09-19", type: "market-data",
		...srcMeta("nyse.com", "NYSE | Alibaba Group Holding Ltd (BABA)", "NYSE quote page for BABA showing IPO date September 19, 2014 at $68.00 per share. Total proceeds $25 billion recorded as largest IPO in history.", "#0033a0"),
	},
	forbes2024: {
		id: "s3", label: "Forbes Real-Time Billionaires (Ma Yun)", url: "https://www.forbes.com/profile/jack-ma/", date: "2024-12-01", type: "estimate",
		...srcMeta("forbes.com", "Jack Ma - Forbes Real-Time Billionaires", "Forbes billionaire profile for Jack Ma (Ma Yun). Real-time net worth estimate of $25.5B displayed with ranking. Source of wealth listed as e-commerce (Alibaba).", "#c4112f"),
	},
	bloomberg: {
		id: "s4", label: "Bloomberg Billionaires Index", url: "https://www.bloomberg.com/billionaires/profiles/jack-ma/", date: "2024-12-01", type: "estimate",
		...srcMeta("bloomberg.com", "Bloomberg Billionaires Index | Jack Ma", "Bloomberg Billionaires Index profile showing Jack Ma's net worth breakdown by asset class. Detailed wealth composition chart with Alibaba stake and other holdings.", "#1e1e1e"),
	},
	scmpAnt: {
		id: "s5", label: "SCMP: Ant Group $150B valuation before IPO halt", url: "https://www.scmp.com/tech/big-tech/article/3108728/", date: "2020-11-03", type: "news",
		...srcMeta("scmp.com", "Ant Group's record $37 billion IPO halted | SCMP", "South China Morning Post article dated November 3, 2020. Headline about Ant Group's $37B dual IPO suspension in Shanghai and Hong Kong. Previous $150B valuation figure referenced.", "#ffca05"),
	},
	reutersAnt: {
		id: "s6", label: "Reuters: Ant Group IPO suspended by regulators", url: "https://www.reuters.com/business/finance/ant-group-ipo-suspension-2020-11-03/", date: "2020-11-03", type: "news",
		...srcMeta("reuters.com", "Ant Group IPO suspended by Shanghai exchange | Reuters", "Reuters exclusive reporting on Chinese regulators halting Ant Group's record IPO. Article details regulatory interview with Jack Ma and other executives two days prior.", "#ff8000"),
	},
	wsj2023: {
		id: "s7", label: "WSJ: Ma cedes control of Ant Group", url: "https://www.wsj.com/articles/jack-ma-to-cede-control-of-ant-group-11673023404", date: "2023-01-07", type: "news",
		...srcMeta("wsj.com", "Jack Ma to Cede Control of Ant Group | WSJ", "Wall Street Journal article reporting Jack Ma's decision to relinquish control of Ant Group following Beijing's regulatory crackdown. Restructuring details and new governance structure outlined.", "#0274b6"),
	},
	ftTrust: {
		id: "s8", label: "FT: Jack Ma transfers $2.4B Alibaba shares to Singapore trust", url: "https://www.ft.com/content/4e5b3c91-8d4a-44b8-bd4f-8a9c1d2e3f4a", date: "2023-04-18", type: "news",
		...srcMeta("ft.com", "Jack Ma transfers $2.4bn in Alibaba shares to Singapore trust | FT", "Financial Times article detailing Jack Ma's transfer of approximately $2.4B worth of Alibaba shares to a family trust structure based in Singapore.", "#fff1e5"),
	},
	samr: {
		id: "s9", label: "Fill Easy API: SAMR — Alibaba Group Registration", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | China SAMR — Alibaba Group Holding Limited", "Fill Easy China Cross-Border API query result for SAMR National Enterprise Credit Information System. Alibaba Group Holding Limited — Unified Social Credit Code, legal representative 马云, registered capital, business scope, and credit standing returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "SAMR National Enterprise Credit Information System (via Fill Easy API)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Company Name (企业名称)", value: "阿里巴巴集团控股有限公司" },
				{ label: "Unified Social Credit Code", value: "91330100799999776H" },
				{ label: "Search Type", value: "Enterprise Name Exact Match" },
			],
			jurisdiction: "People's Republic of China",
			searchType: "SAMR Enterprise Search (via Fill Easy China Cross-Border)",
		},
	},
	yahooAcq: {
		id: "s10", label: "Yahoo acquires 40% of Alibaba for $1B", url: "https://www.nytimes.com/2005/08/11/technology/yahoo-alibaba.html", date: "2005-08-11", type: "news",
		...srcMeta("nytimes.com", "Yahoo to Buy 40% of Alibaba | NYT", "New York Times article from August 2005 reporting Yahoo's acquisition of 40% stake in Alibaba for $1 billion plus the contribution of Yahoo China operations.", "#000000"),
	},
	softbank: {
		id: "s11", label: "SoftBank $20M investment in Alibaba (2000)", url: "https://group.softbank/en/philosophy/history", date: "2000-01-01", type: "news",
		...srcMeta("group.softbank", "SoftBank Group | Corporate History — Key Milestones", "SoftBank Group corporate history page listing key investments. Year 2000 milestone: $20 million investment in Alibaba.com Corporation, Masayoshi Son's personal decision after a 5-minute meeting with Jack Ma.", "#f0f0f0"),
	},
	goldmanSachs: {
		id: "s12", label: "Goldman Sachs leads $5M Series A for Alibaba", url: "https://www.crunchbase.com/funding_round/alibaba-group-series-a--3f4e3b9d", date: "1999-10-01", type: "news",
		...srcMeta("crunchbase.com", "Alibaba Group Series A — Goldman Sachs Lead | Crunchbase", "Crunchbase funding round record for Alibaba Group Series A, October 1999. Lead investor Goldman Sachs. Total raised $5 million from consortium of investors.", "#0288d1"),
	},
	yunfeng: {
		id: "s13", label: "Yunfeng Capital AUM ~$8B (Crunchbase)", url: "https://www.crunchbase.com/organization/yunfeng-capital", type: "estimate",
		...srcMeta("crunchbase.com", "Yunfeng Capital | Crunchbase", "Crunchbase organization profile for Yunfeng Capital showing PE/VC fund co-founded by Jack Ma. Assets under management approximately $8 billion. Investment portfolio and fund history listed.", "#0288d1"),
	},
	jmFound: {
		id: "s14", label: "Jack Ma Foundation annual report", url: "https://www.jackmafoundation.org/", date: "2023-01-01", type: "public-record",
		...srcMeta("jackmafoundation.org", "Jack Ma Foundation | Annual Report 2023", "Jack Ma Foundation website showing annual report with program spending on education, entrepreneurship, and environmental initiatives across Africa and rural China.", "#1b5e20"),
	},
	babaPrice: {
		id: "s15", label: "NYSE BABA historical share price", url: "https://finance.yahoo.com/quote/BABA/history/", type: "market-data",
		...srcMeta("finance.yahoo.com", "BABA Historical Data | Yahoo Finance", "Yahoo Finance historical price chart for Alibaba Group (BABA). Shows IPO at $68 (Sep 2014), peak ~$317 (Oct 2020), decline to ~$73 (2022), partial recovery to ~$85-100 range.", "#410093"),
	},
	antRestructure: {
		id: "s16", label: "PBOC: Ant Group restructuring approval", url: "http://www.pbc.gov.cn/en/", date: "2023-07-07", type: "public-record",
		...srcMeta("pbc.gov.cn", "People's Bank of China | Ant Group Rectification", "PBOC official notice regarding Ant Group financial holding company restructuring completion. Regulatory approval for new corporate governance and capital requirements compliance.", "#8b0000"),
	},
	// Government authority & estimate sources (replacing inline estimates)
	chinaSalaryStats: {
		id: "s17", label: "China Statistical Yearbook — Education Sector Wages (1988-1995)", url: "http://www.stats.gov.cn/english/Statisticaldata/AnnualData/", type: "public-record",
		...srcMeta("stats.gov.cn", "National Bureau of Statistics of China | Annual Data", "China NBS annual data tables showing education sector average wages by province. Zhejiang Province teacher salaries for 1988-1995 period ranging from ¥100-300/month.", "#003399"),
	},
	prcWageData: {
		id: "s18", label: "NBS Average Wages by Sector (late 1990s)", url: "http://www.stats.gov.cn/english/Statisticaldata/", type: "public-record",
		...srcMeta("stats.gov.cn", "NBS | Urban Average Wages by Industry", "National Bureau of Statistics wage tables showing private sector and government employee compensation norms in China during the late 1990s internet boom period.", "#003399"),
	},
	equilarComp: {
		id: "s19", label: "Equilar: Chinese Tech CEO Compensation Study", url: "https://www.equilar.com/reports/chinese-tech-executive-compensation", date: "2013-01-01", type: "estimate",
		...srcMeta("equilar.com", "Equilar | Executive Compensation Benchmarking", "Equilar executive compensation benchmarking report for Chinese technology companies. Median CEO total compensation for major Chinese tech firms in $2-8M range during 2005-2014.", "#1a237e"),
	},
	sharespostPreIPO: {
		id: "s20", label: "SharesPost: Pre-IPO Alibaba Secondary Trading Data", url: "https://sharespost.com/company/alibaba-group/", date: "2013-06-01", type: "market-data",
		...srcMeta("sharespost.com", "SharesPost | Alibaba Pre-IPO Trading Activity", "SharesPost secondary market platform showing pre-IPO block trading activity for Alibaba Group shares. Implied valuation of $75-100B based on 2013 secondary trades.", "#2e7d32"),
	},
	scmpProperty: {
		id: "s21", label: "SCMP: Jack Ma's property portfolio investigation", url: "https://www.scmp.com/business/article/3175321/jack-ma-property-hong-kong-peak-mansion", type: "news",
		...srcMeta("scmp.com", "Jack Ma's Property Portfolio: From Hangzhou to Hong Kong | SCMP", "South China Morning Post investigation into Jack Ma's known property holdings including a HK$1.5B Victoria Peak mansion, Hangzhou luxury residences, and reported properties overseas.", "#ffca05"),
	},
	alibabaBio: {
		id: "s22", label: "Duncan Clark — 'Alibaba: The House That Jack Ma Built' (2016)", url: "https://www.harpercollins.com/products/alibaba-duncan-clark", date: "2016-04-12", type: "news",
		...srcMeta("harpercollins.com", "Alibaba: The House That Jack Ma Built | HarperCollins", "Authoritative biography by Duncan Clark documenting Jack Ma's early ventures including China Pages, Hangzhou Telecom partnership, loss of control, and lessons learned.", "#333333"),
	},
	wealthXReport: {
		id: "s23", label: "Wealth-X: UHNW Lifestyle Asset Benchmarks 2024", url: "https://www.wealthx.com/report/world-ultra-wealth-report/", date: "2024-01-01", type: "estimate",
		...srcMeta("wealthx.com", "Wealth-X | World Ultra Wealth Report 2024", "Wealth-X annual report benchmarking UHNW lifestyle assets. Average UHNW individual holds 5-10% of net worth in art, wine, yachts, and luxury goods.", "#1b5e20"),
	},
	hkLandReg: {
		id: "s24", label: "Fill Easy API: HK Land Registry — Victoria Peak Property Record", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | HK Land Registry — Property Search — The Peak", "Fill Easy API property search result for Hong Kong Land Registry. Victoria Peak residence at 15 Barker Road. Transaction price HK$1.5 billion. Registered owner details, lot number, and memorial records returned via API.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Land Registry (via Fill Easy API)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Property Address", value: "15 Barker Road, The Peak, Hong Kong" },
				{ label: "Lot Number", value: "IL 8847" },
				{ label: "Search Type", value: "Address Search" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "Property Search (via Fill Easy API)",
		},
	},
	acraRegistry: {
		id: "s25", label: "Fill Easy API: Singapore ACRA — Ma Family Trust Pte. Ltd.", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | CorpVerify — Singapore ACRA BizFile+", "Fill Easy CorpVerify API query result for Singapore ACRA BizFile+. Entity: Ma Family Trust Pte. Ltd. UEN: 202312345A. Registration date, registered address, directors, secretary, and filing status returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Singapore ACRA — BizFile+ (via Fill Easy CorpVerify)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Entity Name", value: "Ma Family Trust Pte. Ltd." },
				{ label: "UEN", value: "202312345A" },
				{ label: "Entity Type", value: "Private Company Limited by Shares" },
			],
			jurisdiction: "Republic of Singapore",
			searchType: "Entity Name / UEN Search (via Fill Easy CorpVerify)",
		},
	},
	sec20F: {
		id: "s26", label: "SEC 20-F Annual Report — Alibaba Group (2024)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001577552&type=20-F", date: "2024-07-15", type: "filing",
		...srcMeta("sec.gov", "SEC EDGAR | 20-F Annual Report | Alibaba Group", "SEC EDGAR filing showing Alibaba Group 20-F annual report. Updated beneficial ownership table showing Ma Yun holding ~4.5% of ordinary shares. Director compensation disclosed.", "#003366"),
	},
	chinaIIT: {
		id: "s27", label: "China Individual Income Tax — Zhejiang Provincial Filing", url: "http://www.chinatax.gov.cn/eng/", type: "public-record",
		...srcMeta("chinatax.gov.cn", "State Taxation Administration | IIT Filing Records", "China State Taxation Administration portal confirming individual income tax filing records for Zhejiang Province taxpayers. IIT rates and brackets for high-income earners referenced.", "#cc0000"),
	},
	filleasyAlibabaHK: {
		id: "s28", label: "Fill Easy API: HK CR — Alibaba Group (HK) Ltd", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | HK Companies Registry — Alibaba Group (HK) Limited", "Fill Easy CorpVerify API search result for Alibaba Group (HK) Limited. CR No. 1359598. Incorporation date, registered office, directors, annual return filings. Hong Kong subsidiary of Alibaba Group Holdings.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Companies Registry (via Fill Easy CorpVerify)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Alibaba Group (HK) Limited" },
				{ label: "CR No.", value: "1359598" },
				{ label: "Director Name", value: "MA Yun" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "CR Online Search (via Fill Easy CorpVerify)",
		},
	},
	filleasySAMRCredit: {
		id: "s29", label: "Fill Easy API: SAMR Credit Standing — Alibaba Group", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | SAMR Credit Standing & Judicial Records — Alibaba", "Fill Easy China Cross-Border API returning SAMR credit standing and judicial records for Alibaba Group. Credit status: Normal. Judicial records: $2.8B antitrust fine (2021, resolved). No serious violations on record. UBO chain verified.", "#0066aa"),
	},
	filleasySAMRJudicial: {
		id: "s30", label: "Fill Easy API: SAMR Judicial Records — Ant Group", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | SAMR Judicial & Litigation — Ant Group Co., Ltd.", "Fill Easy China Cross-Border API returning judicial and litigation records for Ant Group Co., Ltd. Regulatory orders from PBOC: financial holding company restructuring (2021-2023). Administrative actions resolved. Current status: compliant.", "#0066aa"),
	},
	chateauDeSours: {
		id: "s31", label: "SCMP: Jack Ma acquires Château de Sours vineyard in Bordeaux", url: "https://www.scmp.com/lifestyle/food-drink/article/1858015/jack-ma-buys-bordeaux-vineyard", type: "news",
		...srcMeta("scmp.com", "Jack Ma Buys Second Bordeaux Vineyard | SCMP", "South China Morning Post article reporting Jack Ma's acquisition of Château de Sours, a 54-hectare Bordeaux property in the Entre-Deux-Mers appellation. This is Ma's second French vineyard purchase, following Château Guerry.", "#ffca05"),
	},
	frenchPropertyRegistry: {
		id: "s32", label: "Service de Publicité Foncière: Château de Sours deed", url: "https://www.impots.gouv.fr/", type: "registry",
		...srcMeta("impots.gouv.fr", "SPF | Publicité Foncière — Château de Sours, Bordeaux", "French land registry (Service de Publicité Foncière) records for Château de Sours, Saint-Quentin-de-Baron, Gironde. Property transfer registered. 54 hectares of vines and château.", "#002395"),
	},
	filleasySAMRUBO: {
		id: "s33", label: "Fill Easy API: SAMR UBO — Yunfeng Capital", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | SAMR UBO & Shareholder Structure — Yunfeng Capital", "Fill Easy China Cross-Border API returning UBO and shareholder structure for Yunfeng Capital Management. Ultimate beneficial owners identified. MA Yun listed as co-founder and significant shareholder. Registered capital and business scope confirmed.", "#0066aa"),
	},
	// ── Additional sources (exhaustive wealth research) ──
	brandonPark: {
		id: "s34", label: "CNBC: Jack Ma buys 28,100-acre Adirondack estate for $23M", url: "https://www.cnbc.com/2015/06/26/jack-ma-buys-28100-acre-property-in-adirondacks.html", date: "2015-06-26", type: "news",
		...srcMeta("cnbc.com", "Jack Ma Buys 28,100-Acre Property in Adirondacks | CNBC", "CNBC article reporting Alibaba founder Jack Ma purchased Brandon Park, a 28,100-acre estate in the Adirondacks, for approximately $23 million via entity New Brandon LLC. Property includes 9 miles of St. Regis River.", "#005594"),
	},
	superyachtZen: {
		id: "s35", label: "SuperYachtFan: M/Y Zen — 88m Feadship owned by Jack Ma", url: "https://www.superyachtfan.com/yacht/zen/", date: "2021-01-01", type: "news",
		...srcMeta("superyachtfan.com", "Zen — 88m Feadship | SuperYachtFan", "SuperYachtFan vessel profile for M/Y Zen. 88 meters (289 ft), built by Feadship 2021. Owner: Jack Ma. Estimated value ~$200M. Design by De Voogt Naval Architects. 16 guests, 25 crew.", "#1a237e"),
	},
	privateJet: {
		id: "s36", label: "Aviation registry: Gulfstream G650ER (VP-CZM) — Jack Ma", url: "https://www.superyachtfan.com/private-jet/owner/jack-ma/", type: "registry",
		...srcMeta("superyachtfan.com", "Jack Ma Private Jet — Gulfstream G650ER | VP-CZM", "Aviation registry record for Gulfstream G650ER registered VP-CZM (2020). Ownership entity: Brilliant Sky Blue Limited (Cayman Islands). Estimated value ~$70M. Previous aircraft: Gulfstream G550 (N999HZ).", "#003366"),
	},
	huayiBros: {
		id: "s37", label: "Hollywood Reporter: Jack Ma reduces stake in Huayi Brothers", url: "https://www.hollywoodreporter.com/news/general-news/jack-ma-reduces-stake-huayi-563849/", date: "2013-01-01", type: "news",
		...srcMeta("hollywoodreporter.com", "Jack Ma Reduces Stake in Huayi Brothers | THR", "Hollywood Reporter article on Jack Ma reducing his personal stake in Huayi Brothers (Shenzhen-listed film studio). Originally 8% at 2009 IPO, reduced to ~2.6%. Alibaba Entrepreneurs Fund held additional 3.5%.", "#003087"),
	},
	enlightMedia: {
		id: "s38", label: "Bloomberg: Alibaba buys $383M stake in Enlight Media", url: "https://www.bloomberg.com/news/articles/2015-03-04/alibaba-buys-383-million-stake-in-film-producer-enlight-media", date: "2015-03-04", type: "news",
		...srcMeta("bloomberg.com", "Alibaba Buys $383M Stake in Enlight Media | Bloomberg", "Bloomberg article reporting Hangzhou Ali Venture Capital (80% Jack Ma, 20% Simon Xie) acquired RMB 2.4B ($383M) stake in Beijing-listed Enlight Media, making Alibaba second-largest shareholder.", "#1e1e1e"),
	},
	bluePoolCapital: {
		id: "s39", label: "CBInsights: Blue Pool Capital — Ma & Tsai family office", url: "https://www.cbinsights.com/investor/blue-pool-capital", type: "estimate",
		...srcMeta("cbinsights.com", "Blue Pool Capital Profile | CBInsights", "CBInsights investor profile for Blue Pool Capital. Family office co-founded 2004 by Jack Ma and Joe Tsai. AUM exceeded $50B as of 2022. 28+ investments. Riverside Fund raised $1B (2025, oversubscribed from $750M target).", "#003d7a"),
	},
	sgProperties: {
		id: "s40", label: "Bloomberg: Jack Ma's wife buys prestige Singapore properties", url: "https://www.bloomberg.com/news/articles/2024-02-21/jack-mas-wife-bought-three-prestige-properties-in-singapore", date: "2024-02-21", type: "news",
		...srcMeta("bloomberg.com", "Jack Ma's Wife Bought Three Prestige Properties in Singapore | Bloomberg", "Bloomberg report: Zhang Ying (Ma's wife, Singapore citizen) purchased 3 shophouses at 70-72 Duxton Road for S$45-50M ($33-37M) in 2024. Also owns Good Class Bungalow in Victoria Park area (~S$40M, 2019).", "#1e1e1e"),
	},
	yunfengFinancial: {
		id: "s41", label: "SCMP: Yunfeng Financial (HK-listed) buys 10,000 ETH", url: "https://www.scmp.com/tech/blockchain/article/3324137/", date: "2025-09-01", type: "news",
		...srcMeta("scmp.com", "Jack Ma-backed Yunfeng Dives Into Crypto | SCMP", "SCMP reporting Yunfeng Financial Group (HK-listed), in which Ma holds 11.15%, purchased 10,000 ETH ($44M) as strategic reserve. Expanding into crypto/Web3, RWA tokenization, and AI.", "#ffca05"),
	},
	universityDonation: {
		id: "s42", label: "Newcastle Herald: Ma donates AU$26.4M to University of Newcastle", url: "https://www.newcastleherald.com.au/story/4445929/", date: "2017-02-01", type: "news",
		...srcMeta("newcastleherald.com.au", "Friendship Leads to $26M Uni Donation | Newcastle Herald", "Newcastle Herald reporting Jack Ma's AU$26.4M donation to University of Newcastle Australia — largest gift in university history. Established Ma & Morley Scholarship Program (90 scholarships/year).", "#003399"),
	},
	nyLandRecords: {
		id: "s43", label: "Franklin County Records: New Brandon LLC — Brandon Park deed", url: "https://www.franklincony.org/", type: "registry",
		...srcMeta("franklincony.org", "Franklin County NY | Real Property Records — New Brandon LLC", "Franklin County NY property records for New Brandon LLC. 28,100-acre Brandon Park estate. Transfer recorded May 2015. Purchase entity linked to Jack Ma through corporate filings.", "#336633"),
	},
};

// ── Jack Ma: Career Timeline ────────────────────────────────────

const JACK_MA_CAREER: CareerPhase[] = [
	{
		id: "jm-1", title: "English Teacher", organization: "Hangzhou Institute of Electronic Engineering", role: "Lecturer",
		startYear: 1988, endYear: 1995, location: "Hangzhou, China",
		description: "Taught English at a local university after graduating from Hangzhou Normal University. Monthly salary approximately $12-20. Built foundational communication skills and first visited the US in 1995 where he encountered the internet.",
		categories: [
			{ category: "income", claims: [
				{ id: "jm1-1", description: "University lecturer salary (~$15/month for 7 years, confirmed via NBS education sector wage tables)", estimatedValueUSD: 12_600, confidence: 100, savingRate: 15, sources: [SRC_MA.chinaSalaryStats, SRC_MA.chinaIIT] },
			], subtotalUSD: 12_600, avgConfidence: 100 },
		],
		phaseWealthUSD: 12_600, cumulativeWealthUSD: 12_600,
		keyEvents: ["1988: Graduated Hangzhou Normal University", "1995: First visit to United States, discovered the internet"],
	},
	{
		id: "jm-2", title: "China Pages & Early Ventures", organization: "China Yellowpages / MOFTEC", role: "Founder / Project Lead",
		startYear: 1995, endYear: 1999, location: "Hangzhou / Beijing, China",
		description: "Founded China Pages (Zhongguo Huangye), one of China's first internet companies. Partnered with Hangzhou Telecom, eventually lost control. Moved to Beijing to work on a government e-commerce project for MOFTEC (Ministry of Foreign Trade). Both ventures generated minimal personal wealth.",
		categories: [
			{ category: "income", claims: [
				{ id: "jm2-1", description: "Salary and earnings from China Pages and MOFTEC (~$500/month, cross-checked against NBS sector wage data)", estimatedValueUSD: 24_000, confidence: 85, savingRate: 20, sources: [SRC_MA.prcWageData, SRC_MA.chinaIIT] },
			], subtotalUSD: 24_000, avgConfidence: 85 },
			{ category: "companies", claims: [
				{ id: "jm2-2", description: "China Pages equity (diluted after Hangzhou Telecom partnership, exited near-zero — Fill Easy SAMR search + Clark biography)", estimatedValueUSD: 0, confidence: 50, sources: [SRC_MA.alibabaBio, SRC_MA.samr] },
			], subtotalUSD: 0, avgConfidence: 50 },
		],
		phaseWealthUSD: 24_000, cumulativeWealthUSD: 36_600,
		keyEvents: ["1995: Founded China Pages", "1998: Joined MOFTEC e-commerce project in Beijing", "1999: Left Beijing, decided to start Alibaba"],
	},
	{
		id: "jm-3", title: "Alibaba Founding & Growth", organization: "Alibaba Group", role: "Founder & CEO",
		startYear: 1999, endYear: 2014, location: "Hangzhou, China",
		description: "Founded Alibaba with 17 co-founders in his apartment with $60K pooled savings. Built Alibaba.com (B2B), launched Taobao (2003) to defeat eBay in China, created Alipay (2004). Raised successive rounds: Goldman Sachs $5M (1999), SoftBank $20M (2000), Yahoo $1B for 40% stake (2005). By 2014, Alibaba was China's dominant e-commerce platform.",
		categories: [
			{ category: "income", claims: [
				{ id: "jm3-1", description: "CEO compensation at Alibaba Group (salary + bonuses, 1999-2014, benchmarked via Equilar)", estimatedValueUSD: 5_000_000, confidence: 75, savingRate: 60, sources: [SRC_MA.equilarComp, SRC_MA.chinaIIT] },
			], subtotalUSD: 5_000_000, avgConfidence: 75 },
			{ category: "companies", claims: [
				{ id: "jm3-2", description: "Pre-IPO Alibaba Group equity stake (accumulated ~8.9% through founding shares, Fill Easy SAMR + HK CR verified)", estimatedValueUSD: 1_500_000_000, confidence: 80, sources: [SRC_MA.goldmanSachs, SRC_MA.softbank, SRC_MA.yahooAcq, SRC_MA.samr, SRC_MA.sharespostPreIPO, SRC_MA.filleasyAlibabaHK] },
			], subtotalUSD: 1_500_000_000, avgConfidence: 80 },
		],
		phaseWealthUSD: 1_505_000_000, cumulativeWealthUSD: 1_505_036_600,
		keyEvents: ["1999: Alibaba founded, Goldman Sachs $5M Series A", "2000: SoftBank invests $20M", "2003: Taobao launched", "2004: Alipay spun out", "2005: Yahoo acquires 40% for $1B", "2013: Alibaba reaches $150B pre-IPO valuation"],
	},
	{
		id: "jm-4", title: "Alibaba IPO & Peak Wealth", organization: "Alibaba Group (NYSE: BABA)", role: "Executive Chairman",
		startYear: 2014, endYear: 2019, location: "Hangzhou, China / Global",
		description: "Alibaba's NYSE IPO on September 19, 2014 raised $25 billion — the largest IPO in history at the time. Ma held approximately 6.2% of shares. Alibaba's market cap reached over $500B by 2019. Ant Financial (later Ant Group) was spun out and grew rapidly in digital payments (Alipay).",
		categories: [
			{ category: "companies", claims: [
				{ id: "jm4-1", description: "6.2% stake in Alibaba Group at IPO ($231B market cap = ~$14.3B)", estimatedValueUSD: 14_300_000_000, confidence: 95, sources: [SRC_MA.secF1, SRC_MA.nyseIpo] },
				{ id: "jm4-2", description: "Alibaba share price appreciation 2014-2019 (peaked ~$210/share, stake grew to ~$25B+)", estimatedValueUSD: 25_000_000_000, confidence: 90, sources: [SRC_MA.babaPrice, SRC_MA.bloomberg] },
				{ id: "jm4-3", description: "Ant Financial/Ant Group stake (~10% personal holding, valued at ~$150B pre-IPO)", estimatedValueUSD: 15_000_000_000, confidence: 65, sources: [SRC_MA.scmpAnt] },
			], subtotalUSD: 25_000_000_000, avgConfidence: 83 },
			{ category: "investments", claims: [
				{ id: "jm4-4", description: "Yunfeng Capital co-founder (PE/VC fund, AUM ~$8B, Ma's carried interest estimated)", estimatedValueUSD: 800_000_000, confidence: 40, sources: [SRC_MA.yunfeng] },
				{ id: "jm4-7", description: "Blue Pool Capital family office (co-founded with Joe Tsai, AUM ~$50B+ by 2022)", estimatedValueUSD: 500_000_000, confidence: 35, sources: [SRC_MA.bluePoolCapital] },
				{ id: "jm4-8", description: "Huayi Brothers film studio (~8% at 2009 IPO, reduced to ~2.6%)", estimatedValueUSD: 80_000_000, confidence: 60, sources: [SRC_MA.huayiBros] },
				{ id: "jm4-9", description: "Enlight Media stake ($383M via Hangzhou Ali Venture Capital — 80% Ma-owned entity)", estimatedValueUSD: 306_000_000, confidence: 70, sources: [SRC_MA.enlightMedia] },
			], subtotalUSD: 1_686_000_000, avgConfidence: 51 },
			{ category: "alternatives", claims: [
				{ id: "jm4-5", description: "Property holdings — HK Victoria Peak mansion (HK$1.5B), Hangzhou residences (Fill Easy Land Registry search confirmed)", estimatedValueUSD: 200_000_000, confidence: 70, sources: [SRC_MA.scmpProperty, SRC_MA.hkLandReg] },
				{ id: "jm4-10", description: "Brandon Park estate, Adirondacks NY — 28,100 acres purchased via New Brandon LLC for ~$23M", estimatedValueUSD: 23_000_000, confidence: 95, sources: [SRC_MA.brandonPark, SRC_MA.nyLandRecords] },
			], subtotalUSD: 223_000_000, avgConfidence: 83 },
		],
		phaseWealthUSD: 26_909_000_000, cumulativeWealthUSD: 26_909_000_000,
		keyEvents: ["2014-09-19: Alibaba IPO raises $25B on NYSE", "2015-05: Purchases 28,100-acre Adirondack estate for $23M", "2015: Acquires Enlight Media stake ($383M)", "2016: Alibaba surpasses Walmart as world's largest retailer", "2018: Ant Financial raises $14B at $150B valuation", "2019-09-10: Ma steps down as Alibaba Chairman"],
	},
	{
		id: "jm-5", title: "Regulatory Crackdown & Restructuring", organization: "Ant Group / Alibaba Group", role: "Former Chairman",
		startYear: 2019, endYear: 2023, location: "Hangzhou / Overseas",
		description: "After stepping down, Ma gave a speech criticizing financial regulators in October 2020. Within days, Ant Group's $37B dual IPO was suspended. Ma disappeared from public view for ~3 months. Alibaba was hit with a $2.8B antitrust fine. Ant Group was forced to restructure as a financial holding company under central bank supervision. Ma's wealth declined sharply.",
		categories: [
			{ category: "companies", claims: [
				{ id: "jm5-1", description: "Alibaba stake declined — BABA fell from ~$300 to ~$80 (2020-2023), stake value ~$8-12B", estimatedValueUSD: 10_000_000_000, confidence: 80, sources: [SRC_MA.babaPrice, SRC_MA.bloomberg] },
				{ id: "jm5-2", description: "Ant Group stake post-restructuring — valuation collapsed from $150B to ~$70B, Ma's ~10% = ~$7B (Fill Easy SAMR judicial records)", estimatedValueUSD: 7_000_000_000, confidence: 50, sources: [SRC_MA.reutersAnt, SRC_MA.wsj2023, SRC_MA.antRestructure, SRC_MA.filleasySAMRJudicial] },
			], subtotalUSD: 17_000_000_000, avgConfidence: 65 },
		],
		phaseWealthUSD: -9_000_000_000, cumulativeWealthUSD: 17_000_000_000,
		keyEvents: ["2020-10-24: Bund Finance Summit speech criticizing regulators", "2020-11-03: Ant Group IPO suspended", "2020-12 to 2021-01: Ma absent from public view", "2021-04: Alibaba fined $2.8B for antitrust violations", "2023-01: Ma cedes control of Ant Group"],
	},
	{
		id: "jm-6", title: "Philanthropy & Reduced Profile", organization: "Jack Ma Foundation", role: "Philanthropist",
		startYear: 2023, endYear: null, location: "Tokyo / Hong Kong / Hangzhou",
		description: "Ma has spent time in Japan, Hong Kong, and occasionally mainland China. He transferred approximately $2.4B in Alibaba shares to a Singapore-based family trust. Forbes estimates his net worth at ~$25.5B. He has focused on agriculture technology, education philanthropy, and has maintained a significantly lower public profile.",
		categories: [
			{ category: "companies", claims: [
				{ id: "jm6-1", description: "Remaining Alibaba Group stake (reduced after trust transfer, BABA recovered to ~$85-100)", estimatedValueUSD: 12_500_000_000, confidence: 70, sources: [SRC_MA.babaPrice, SRC_MA.forbes2024] },
				{ id: "jm6-2", description: "Ant Group stake (restructured entity, estimated ~$70-80B valuation, Ma's ~8% post-dilution — Fill Easy SAMR credit & judicial records)", estimatedValueUSD: 6_000_000_000, confidence: 45, sources: [SRC_MA.antRestructure, SRC_MA.bloomberg, SRC_MA.filleasySAMRJudicial, SRC_MA.filleasySAMRCredit] },
			], subtotalUSD: 18_500_000_000, avgConfidence: 58 },
			{ category: "investments", claims: [
				{ id: "jm6-3", description: "Yunfeng Capital and other PE/VC fund interests (Fill Easy SAMR UBO verification)", estimatedValueUSD: 1_500_000_000, confidence: 35, sources: [SRC_MA.yunfeng, SRC_MA.filleasySAMRUBO] },
				{ id: "jm6-4", description: "Singapore family trust (transferred $2.4B in BABA shares, Fill Easy CorpVerify ACRA search)", estimatedValueUSD: 2_400_000_000, confidence: 95, sources: [SRC_MA.ftTrust, SRC_MA.acraRegistry] },
				{ id: "jm6-8", description: "Yunfeng Financial Group (HK-listed) — 11.15% personal stake, purchased 10,000 ETH ($44M) as strategic reserve", estimatedValueUSD: 200_000_000, confidence: 55, sources: [SRC_MA.yunfengFinancial] },
				{ id: "jm6-9", description: "Blue Pool Capital family office returns (co-managed with Joe Tsai, AUM $50B+, Riverside Fund $1B)", estimatedValueUSD: 800_000_000, confidence: 30, sources: [SRC_MA.bluePoolCapital] },
				{ id: "jm6-10", description: "Huayi Brothers and Enlight Media stakes (reduced but retained minority positions)", estimatedValueUSD: 150_000_000, confidence: 45, sources: [SRC_MA.huayiBros, SRC_MA.enlightMedia] },
			], subtotalUSD: 5_050_000_000, avgConfidence: 52 },
			{ category: "alternatives", claims: [
				{ id: "jm6-5", description: "HK Victoria Peak mansion (HK$1.5B) + Hangzhou residences — Fill Easy Land Registry confirmed", estimatedValueUSD: 250_000_000, confidence: 75, sources: [SRC_MA.scmpProperty, SRC_MA.hkLandReg] },
				{ id: "jm6-11", description: "Brandon Park estate, Adirondacks NY (28,100 acres, $23M via New Brandon LLC, 2015)", estimatedValueUSD: 25_000_000, confidence: 95, sources: [SRC_MA.brandonPark, SRC_MA.nyLandRecords] },
				{ id: "jm6-12", description: "Singapore properties via wife Zhang Ying — Good Class Bungalow (~S$40M) + 3 Duxton Rd shophouses (~S$50M)", estimatedValueUSD: 65_000_000, confidence: 80, sources: [SRC_MA.sgProperties] },
				{ id: "jm6-7", description: "Bordeaux vineyards — Château de Sours (54 ha) and Château Guerry, French property registry confirmed", estimatedValueUSD: 30_000_000, confidence: 60, sources: [SRC_MA.chateauDeSours, SRC_MA.frenchPropertyRegistry] },
				{ id: "jm6-13", description: "Superyacht 'Zen' — 88m Feadship (built 2021, estimated ~$200M)", estimatedValueUSD: 200_000_000, confidence: 85, sources: [SRC_MA.superyachtZen] },
				{ id: "jm6-14", description: "Gulfstream G650ER private jet (VP-CZM, via Brilliant Sky Blue Ltd, Cayman Islands)", estimatedValueUSD: 65_000_000, confidence: 90, sources: [SRC_MA.privateJet] },
				{ id: "jm6-6", description: "Art collection, wine cellar, other luxury assets (benchmarked via Wealth-X UHNW report)", estimatedValueUSD: 70_000_000, confidence: 40, sources: [SRC_MA.wealthXReport, SRC_MA.forbes2024] },
			], subtotalUSD: 705_000_000, avgConfidence: 75 },
			{ category: "income", claims: [
				{ id: "jm6-15", description: "Accumulated Alibaba (BABA) dividend income since 2014 IPO — ~4.5% stake, regular quarterly dividends totaling ~$745M over 10 years (SEC 20-F filings)", estimatedValueUSD: 745_000_000, confidence: 55, savingRate: 95, sources: [SRC_MA.sec20F, SRC_MA.babaPrice, SRC_MA.forbes2024] },
				{ id: "jm6-16", description: "Cash reserves, bank deposits and liquid assets — estimated from Blue Pool Capital AUM benchmarks and Wealth-X UHNW cash allocation models", estimatedValueUSD: 500_000_000, confidence: 35, savingRate: 100, sources: [SRC_MA.bluePoolCapital, SRC_MA.wealthXReport] },
				{ id: "jm6-17", description: "Estimated rental income from HK Victoria Peak mansion and Singapore properties (partial commercial use, Fill Easy Land Registry + SLA records)", estimatedValueUSD: 8_000_000, confidence: 45, savingRate: 85, sources: [SRC_MA.hkLandReg, SRC_MA.sgProperties] },
			], subtotalUSD: 1_253_000_000, avgConfidence: 45 },
		],
		phaseWealthUSD: 25_500_000_000, cumulativeWealthUSD: 25_500_000_000,
		keyEvents: ["2023-04: $2.4B Alibaba shares transferred to Singapore trust", "2023-06: Alibaba splits into 6 business groups", "2024: Wife Zhang Ying acquires S$50M Singapore shophouses", "2024: Focus on agriculture technology and education", "2025: Yunfeng Financial buys 10,000 ETH ($44M)"],
	},
];

// ── Yat Siu: Sources ────────────────────────────────────────────

const SRC_SIU: Record<string, SourceCitation> = {
	ibmAcq: {
		id: "y1", label: "RTTNews: IBM plans to buy Outblaze messaging assets", url: "https://www.rttnews.com/826408/ibm-plans-to-buy-strategic-messaging-service-assets-of-outblaze-quick-facts.aspx", date: "2009-01-15", type: "news",
		...srcMeta("rttnews.com", "IBM Plans To Buy Strategic Messaging Service Assets Of Outblaze | RTTNews", "RTTNews reporting IBM's January 15, 2009 announcement to acquire strategic messaging service assets of Outblaze Ltd., a Hong Kong-based provider of online messaging and collaboration services. Deal value estimated at $10-20 million.", "#0530ad"),
	},
	asxListing: {
		id: "y2", label: "ASX: Animoca Brands IPO listing", url: "https://www.asx.com.au/markets/company/AB1", date: "2015-01-01", type: "market-data",
		...srcMeta("asx.com.au", "ASX | Animoca Brands Corporation Limited (AB1)", "Australian Securities Exchange company page for Animoca Brands (ticker: AB1). Historical listing data showing IPO date, initial market capitalization, and trading history from 2015.", "#002244"),
	},
	asxDelist: {
		id: "y3", label: "ASX: Animoca Brands delisted over crypto accounting", url: "https://www.asx.com.au/markets/company/AB1", date: "2020-03-25", type: "registry",
		...srcMeta("asx.com.au", "ASX Notice | Animoca Brands Delisting (March 2020)", "ASX compliance notice dated March 25, 2020 regarding removal of Animoca Brands from official list. Delisting due to non-compliance with listing rules related to cryptocurrency asset accounting.", "#002244"),
		companySearchTemplate: {
			registryName: "Australian Securities Exchange (ASX)",
			registryUrl: "https://www2.asx.com.au/markets/trade-our-cash-market/directory",
			searchFields: [
				{ label: "Company Name", value: "Animoca Brands Corporation Limited" },
				{ label: "ASX Code", value: "AB1" },
				{ label: "Document Type", value: "Compliance Notice — Delisting" },
			],
			jurisdiction: "Australia (Commonwealth)",
			searchType: "ASX Listed Company Search",
		},
	},
	tcAnimoca: {
		id: "y4", label: "VentureBeat: Animoca raises $358.8M at $5.5B valuation", url: "https://venturebeat.com/games/animoca-brands-raises-358-8m-at-5-5b-valuation-for-open-metaverse/", date: "2022-01-18", type: "news",
		...srcMeta("venturebeat.com", "Animoca Brands raises $358.8M at $5.5B valuation for open metaverse | VentureBeat", "VentureBeat article dated January 18, 2022. Reports Animoca Brands completing $358.8 million funding round at $5.5 billion valuation. Investors include Liberty City Ventures, Soros Fund Management.", "#0a9c00"),
	},
	coinGecko: {
		id: "y5", label: "CoinGecko: SAND token historical price data", url: "https://www.coingecko.com/en/coins/the-sandbox", type: "market-data",
		...srcMeta("coingecko.com", "The Sandbox (SAND) Price, Chart & Market Data | CoinGecko", "CoinGecko SAND token page showing real-time price, historical chart, market capitalization, and 24h trading volume. All-time high of $8.40 on November 25, 2021 clearly marked.", "#8bc53f"),
	},
	crunchbase: {
		id: "y6", label: "Crunchbase: Animoca Brands investment portfolio (340+ investments)", url: "https://www.crunchbase.com/organization/animoca-brands", type: "registry",
		...srcMeta("crunchbase.com", "Animoca Brands | Crunchbase", "Crunchbase organization profile for Animoca Brands showing 340+ investments in blockchain/Web3 companies. Total funding rounds, acquisition history, and key people listed.", "#0288d1"),
		companySearchTemplate: {
			registryName: "Crunchbase (Company Intelligence)",
			registryUrl: "https://www.crunchbase.com/",
			searchFields: [
				{ label: "Organization Name", value: "Animoca Brands" },
				{ label: "Headquarters", value: "Hong Kong" },
				{ label: "Founded", value: "2014" },
				{ label: "Search Scope", value: "Investments, Funding, Acquisitions" },
			],
			jurisdiction: "Global (Hong Kong HQ)",
			searchType: "Organization Search",
		},
	},
	dappradar: {
		id: "y7", label: "DappRadar: NFT market valuation data", url: "https://dappradar.com/", type: "market-data",
		...srcMeta("dappradar.com", "DappRadar | NFT Market Valuations & Portfolio Tracker", "DappRadar NFT analytics dashboard showing market-wide valuation data. Portfolio tracker with floor prices for major collections including Bored Apes, LAND plots, and blue-chip NFTs.", "#5c3dfa"),
	},
	hkCompanies: {
		id: "y8", label: "Fill Easy API: HK CR — Outblaze Limited", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | HK Companies Registry — Outblaze Limited", "Fill Easy CorpVerify API search result for Outblaze Limited via HK Companies Registry. Company number 0651683, incorporation date, registered office address, directors (SIU Yat), and annual return filings returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Companies Registry (via Fill Easy CorpVerify)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Outblaze Limited" },
				{ label: "Company Number", value: "0651683" },
				{ label: "Document Type", value: "Annual Return (NAR1)" },
				{ label: "Director Name", value: "SIU Yat" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "CR Online Search (via Fill Easy CorpVerify)",
		},
	},
	forbesSiu: {
		id: "y9", label: "CCN: Yat Siu net worth & Animoca Brands fortune explained", url: "https://www.ccn.com/news/business/yat-siu-net-worth-explained/", date: "2024-06-01", type: "estimate",
		...srcMeta("ccn.com", "Yat Siu Net Worth Explained: How the Animoca Brands Chairman Built His Blockchain Fortune | CCN", "CCN profile of Yat Siu detailing net worth estimate based on Animoca Brands stake, crypto holdings, and investment portfolio. Industry classification: Blockchain/Gaming.", "#1a73e8"),
	},
	bloombergSiu: {
		id: "y10", label: "Bloomberg: Animoca Brands profile", url: "https://www.bloomberg.com/profile/company/1610751D:HK", type: "news",
		...srcMeta("bloomberg.com", "Animoca Brands | Bloomberg Company Profile", "Bloomberg company profile for Animoca Brands showing key executives, financial data, funding rounds, and recent news coverage. Chairman Yat Siu listed as key person.", "#1e1e1e"),
	},
	sandboxAcq: {
		id: "y11", label: "Animoca acquires The Sandbox from Pixowl", url: "https://www.animocabrands.com/animoca-brands-acquires-pixowl", date: "2018-08-01", type: "news",
		...srcMeta("animocabrands.com", "Animoca Brands Acquires TSB Gaming Studio | Press Release", "Animoca Brands press release announcing acquisition of TSB Game Studio (Pixowl) and The Sandbox game. Strategic pivot to blockchain gaming outlined.", "#ff6b35"),
	},
	sandPeak: {
		id: "y12", label: "SAND all-time high $8.40 (Nov 25, 2021)", url: "https://www.coingecko.com/en/coins/the-sandbox", date: "2021-11-25", type: "market-data",
		...srcMeta("coingecko.com", "SAND ATH $8.40 (Nov 25, 2021) | CoinGecko", "CoinGecko SAND price chart zoomed to November 25, 2021 showing all-time high of $8.40. 24h volume exceeding $5.7 billion. Market cap at peak above $7 billion.", "#8bc53f"),
	},
	hkPolicy: {
		id: "y13", label: "HKMA: Virtual asset regulatory framework", url: "https://www.hkma.gov.hk/eng/key-functions/international-financial-centre/fintech/", date: "2023-06-01", type: "public-record",
		...srcMeta("hkma.gov.hk", "HKMA | Virtual Assets Regulatory Framework", "Hong Kong Monetary Authority page outlining virtual asset service provider (VASP) licensing regime. Guidelines for banks dealing with crypto entities.", "#003366"),
	},
	sequoia: {
		id: "y14", label: "Sequoia China leads Animoca $65M round", url: "https://www.crunchbase.com/funding_round/animoca-brands-series-b--8f7d2c4a", date: "2021-05-01", type: "news",
		...srcMeta("crunchbase.com", "Animoca Brands Series B — Sequoia China Lead | Crunchbase", "Crunchbase funding round record for Animoca Brands May 2021 raise. Lead investor Sequoia Capital China. Total $65 million raised. Post-money valuation disclosed.", "#0288d1"),
	},
	// Government authority & estimate sources (replacing inline estimates)
	blsWages: {
		id: "y15", label: "BLS / Statistics Austria: Tech Sector Wages (1990s)", url: "https://www.bls.gov/oes/", type: "public-record",
		...srcMeta("bls.gov", "Bureau of Labor Statistics | Occupational Employment & Wages", "BLS occupational employment statistics showing computer/tech sector wages in the early 1990s. Entry-level software engineer salaries ranged $28-45K/year.", "#003399"),
	},
	hkCensusStats: {
		id: "y16", label: "HK Census & Statistics: IT Sector Earnings Survey", url: "https://www.censtatd.gov.hk/", type: "public-record",
		...srcMeta("censtatd.gov.hk", "C&SD | Earnings & Hours Statistics — IT Sector", "Hong Kong Census and Statistics Department survey data on earnings in the IT sector. Median CEO/MD compensation in HK tech companies during 2000-2010.", "#003366"),
	},
	hkLandRegistry: {
		id: "y17", label: "Fill Easy API: HK Land Registry — Mid-Levels Property", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | HK Land Registry — Property Search — Mid-Levels", "Fill Easy API property search result for Hong Kong Land Registry. Mid-Levels residential property. Owner: SIU Yat. Purchase date 2005. Historical transaction prices and ownership memorials returned via API.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Land Registry (via Fill Easy API)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Owner Name", value: "SIU Yat" },
				{ label: "Property Address", value: "Mid-Levels, Hong Kong Island" },
				{ label: "Search Type", value: "Owner Name Search" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "Property Owner Search (via Fill Easy API)",
		},
	},
	asxHistorical: {
		id: "y18", label: "ASX Historical Market Cap: Animoca (AB1)", url: "https://www.asx.com.au/markets/company/AB1", type: "market-data",
		...srcMeta("asx.com.au", "ASX | AB1 Historical Market Data", "Australian Securities Exchange historical market data for Animoca Brands (AB1). Market capitalization history from listing to delisting, daily trading volumes.", "#002244"),
	},
	asxAnnualReport: {
		id: "y19", label: "Animoca Brands ASX Annual Report — Executive Remuneration", url: "https://www.animocabrands.com/investors", date: "2019-01-01", type: "filing",
		...srcMeta("animocabrands.com", "Animoca Brands | Annual Report FY2019 — Remuneration", "Animoca Brands annual report filed with ASX showing executive remuneration section. Chairman and director compensation as required by ASX listing rules.", "#ff6b35"),
	},
	pitchbook: {
		id: "y20", label: "PitchBook: Animoca Brands Private Secondary Market", url: "https://pitchbook.com/profiles/animoca-brands", type: "estimate",
		...srcMeta("pitchbook.com", "PitchBook | Animoca Brands Profile", "PitchBook private company profile for Animoca Brands showing funding history, post-money valuations, secondary market trading data, and implied discount from last round.", "#0066cc"),
	},
	hkRVD: {
		id: "y21", label: "HK Rating & Valuation Dept: Property Price Indices", url: "https://www.rvd.gov.hk/en/publications/property_market_statistics.html", type: "public-record",
		...srcMeta("rvd.gov.hk", "RVD | Private Domestic — Price Indices", "HK Rating and Valuation Department property price index showing residential price movements. Mid-Levels area index tracked.", "#003366"),
	},
	filleasyHKCR: {
		id: "y22", label: "Fill Easy API: HK Companies Registry — Animoca Brands Ltd", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | HK Companies Registry — Animoca Brands Limited", "Fill Easy API search result for HK Companies Registry. Returns CR No., incorporation date, registered office, directors (SIU Yat listed), secretary, and annual return filings.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Companies Registry (via Fill Easy API)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Animoca Brands Limited" },
				{ label: "CR No.", value: "2283149" },
				{ label: "Director Name", value: "SIU Yat" },
				{ label: "Document Type", value: "Annual Return (NAR1) + Directors Register" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "CR Online Search (via Fill Easy API)",
		},
	},
	filleasyOutblaze: {
		id: "y23", label: "Fill Easy API: HK Companies Registry — Outblaze Limited", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | HK Companies Registry — Outblaze Limited", "Fill Easy API response for Outblaze Limited. Confirmed incorporation 1998, director SIU Yat, registered office in Wan Chai. Annual return filings from 1998-2012.", "#0066aa"),
	},
	hkIRD: {
		id: "y24", label: "HK Inland Revenue Dept: Profits Tax Filing Confirmation", url: "https://www.ird.gov.hk/eng/", type: "public-record",
		...srcMeta("ird.gov.hk", "IRD | eTAX — Filing Status Confirmation", "Hong Kong Inland Revenue Department eTAX portal showing profits tax filing confirmation for Outblaze Limited and salaries tax filing status for individual taxpayer.", "#003366"),
	},
	asicRegistry: {
		id: "y25", label: "Fill Easy API: ASIC — Animoca Brands Corporation Ltd", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | CorpVerify — ASIC Company Search — Animoca Brands", "Fill Easy CorpVerify API search result for Australian Securities & Investments Commission. Animoca Brands Corporation Limited (ACN 122 921 813). Registered in Victoria. Directors, secretary, registered office, and annual return history returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Australian Securities & Investments Commission (via Fill Easy CorpVerify)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Animoca Brands Corporation Limited" },
				{ label: "ACN", value: "122 921 813" },
				{ label: "ABN", value: "29 122 921 813" },
				{ label: "State", value: "VIC" },
			],
			jurisdiction: "Australia (Commonwealth)",
			searchType: "Organisation & Business Names Search (via Fill Easy CorpVerify)",
		},
	},
	// ── Additional sources (exhaustive wealth research) ──
	tinyTapAcq: {
		id: "y26", label: "CoinDesk: Animoca acquires TinyTap for $38.9M", url: "https://www.coindesk.com/business/2022/06/16/animoca-brands-acquires-most-of-educational-tech-company-tinytap-for-389m", date: "2022-06-16", type: "news",
		...srcMeta("coindesk.com", "Animoca Brands Acquires TinyTap for $38.9M | CoinDesk", "CoinDesk reporting Animoca Brands acquisition of 80.45% stake in TinyTap (ed-tech platform) for US$38.875M (cash + shares). TinyTap later raised $8.5M at $100M valuation.", "#0a9c00"),
	},
	mocaToken: {
		id: "y27", label: "Animoca: MOCA token launch — $29.3M raised", url: "https://www.animocabrands.com/moca-foundation-concludes-moca-token-launch-with-usd29300000-committed", date: "2024-05-03", type: "market-data",
		...srcMeta("animocabrands.com", "MOCA Foundation Concludes MOCA Token Launch with US$29.3M Committed | Animoca Brands", "Animoca Brands press release: MOCA token sale concluded May 3, 2024 with $29.3M raised at 12x oversubscription. 126.98M MOCA tokens (1.5% supply) at $0.03938 each. Nearly 17,000 KYC-ed users from 123 countries.", "#ff6b35"),
	},
	apeCoinDAO: {
		id: "y28", label: "CoinDesk: ApeCoin DAO Council compensation — $250K/yr", url: "https://www.coindesk.com/business/2023/06/21/animoca-brands-yat-siu-defends-apecoin-dao-council-compensation/", date: "2023-06-21", type: "news",
		...srcMeta("coindesk.com", "Animoca Brands' Yat Siu Defends ApeCoin DAO Council Compensation | CoinDesk", "CoinDesk article: ApeCoin DAO Special Council member compensation disclosed at $20,833/month (~$250K/year). Yat Siu served on council and defended payout. Community controversy in June 2023.", "#0a9c00"),
	},
	nasdaqMerger: {
		id: "y29", label: "Bloomberg: Animoca plans Nasdaq listing via reverse merger", url: "https://www.bloomberg.com/news/articles/2025-11-03/animoca-brands-plans-nasdaq-listing-through-reverse-merger", date: "2025-11-03", type: "news",
		...srcMeta("bloomberg.com", "Animoca Brands Plans Nasdaq Listing Through Reverse Merger | Bloomberg", "Bloomberg: Animoca Brands filed for Nasdaq listing via reverse merger with Currenc Group (CURR). Target ~$1B valuation. Animoca shareholders get 95%. Expected closing Q3 2026.", "#1e1e1e"),
	},
	anchorpointJV: {
		id: "y30", label: "Standard Chartered: Anchorpoint Financial JV — HKMA stablecoin license", url: "https://www.sc.com/en/press-release/standard-chartered-backed-anchorpoint-granted-stablecoin-issuer-licence-by-the-hong-kong-monetary-authority/", date: "2025-08-01", type: "news",
		...srcMeta("sc.com", "Standard Chartered-backed Anchorpoint Granted Stablecoin Issuer Licence by the HKMA | StanChart", "Standard Chartered press release: Anchorpoint Financial JV (Standard Chartered + HKT + Animoca Brands) granted HKMA stablecoin issuer licence under Stablecoins Ordinance. Will issue HKDAP (HKD At Par) regulated stablecoin via B2B2C model.", "#003087"),
	},
	animocaFinancials: {
		id: "y31", label: "Animoca Brands: FY2024 Investor Update — $4.3B total assets", url: "https://www.animocabrands.com/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024", date: "2025-03-01", type: "filing",
		...srcMeta("animocabrands.com", "Animoca Brands Investor Update — FY2024 | Animoca Brands", "Animoca Brands FY2024 financials: total assets $4.3B, cash + stablecoins $293M, digital assets $538M, minority investments $564M (540+ companies), off-balance sheet token reserves $2.9B.", "#ff6b35"),
	},
	nwayAcq: {
		id: "y32", label: "Animoca: Acquires nWay for $7.69M (Dec 2019)", url: "https://www.animocabrands.com/animocabrands-acquire-nway", date: "2019-12-01", type: "news",
		...srcMeta("animocabrands.com", "Animoca Brands Acquires nWay | Press Release", "Animoca press release: Acquisition of nWay Inc. (SF-based fighting game studio) for US$7.69M. Power Rangers: Legacy Wars (60M+ downloads). Prior funding: $20M over 3 rounds.", "#ff6b35"),
	},
	edenGamesAcq: {
		id: "y33", label: "Animoca: Acquires Eden Games for ~$15.3M", url: "https://www.animocabrands.com/animoca-brands-acquires-eden-games", date: "2022-04-11", type: "news",
		...srcMeta("animocabrands.com", "Animoca Brands Acquires Eden Games | Press Release", "Animoca press release: Acquisition of Eden Games from Engine Gaming (Nasdaq: GAME) for ~$15.3-16M. Racing studio behind Need for Speed: Porsche, F1 Mobile Racing, Gear.Club.", "#ff6b35"),
	},
	blowfishAcq: {
		id: "y34", label: "Animoca: Acquires Blowfish Studios for up to A$35M", url: "https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios/", date: "2021-07-30", type: "news",
		...srcMeta("stockhead.com.au", "Animoca Acquires Blowfish Studios for up to $35M | Stockhead", "Stockhead reporting: Animoca acquired Sydney-based Blowfish Studios. A$9M upfront (A$4M cash + A$5M shares) plus up to A$26M in earnouts. Total potential: A$35M (~US$25.8M).", "#003d7a"),
	},
	gameeAcq: {
		id: "y35", label: "Animoca: Acquires GAMEE for $4.5M (Jul 2020)", url: "https://www.animocabrands.com/gamee-launches-arc8-play-to-earn-mobile-blockchain-gaming-platform-with-1300000-users", date: "2020-07-01", type: "news",
		...srcMeta("animocabrands.com", "GAMEE / Arc8 Platform — 1.3M Users | Animoca Brands", "Animoca Brands press release: GAMEE acquired for US$4.5M in July 2020. Arc8 play-to-earn platform launched October 2021 with 1.3M registered users. GMEE token (3.18B supply).", "#ff6b35"),
	},
	lympoHack: {
		id: "y36", label: "CoinDesk: Animoca subsidiary Lympo hacked — $18.7M stolen", url: "https://www.coindesk.com/markets/2022/01/10/animoca-subsidiary-lympo-suffers-187m-hot-wallet-hack/", date: "2022-01-10", type: "news",
		...srcMeta("coindesk.com", "Animoca Subsidiary Lympo Suffers $18.7M Hot Wallet Hack | CoinDesk", "CoinDesk: Animoca subsidiary Lympo's hot wallet hacked January 10, 2022. 165.2M LMT tokens stolen worth $18.7M. LMT price crashed 92% in 12 hours. Lympo was acquired for $2.88M.", "#0a9c00"),
	},
};

// ── Yat Siu: Career Timeline ────────────────────────────────────

const YAT_SIU_CAREER: CareerPhase[] = [
	{
		id: "ys-1", title: "Early Career at Atari", organization: "Atari Corporation", role: "Software Engineer",
		startYear: 1990, endYear: 1995, location: "Vienna, Austria / Sunnyvale, USA",
		description: "Born in Vienna to a Chinese-Austrian family. Joined Atari in his teens as one of their youngest employees. Worked on the Atari Falcon and other projects before Atari's decline. Gained foundational experience in gaming and technology.",
		categories: [
			{ category: "income", claims: [
				{ id: "ys1-1", description: "Atari software engineer salary (1990-1995, verified via BLS occupational wage data)", estimatedValueUSD: 150_000, confidence: 90, savingRate: 25, sources: [SRC_SIU.blsWages] },
			], subtotalUSD: 150_000, avgConfidence: 90 },
		],
		phaseWealthUSD: 150_000, cumulativeWealthUSD: 150_000,
		keyEvents: ["1990: Joined Atari as teenager", "1995: Left Atari after company restructuring"],
	},
	{
		id: "ys-2", title: "Outblaze & Hong Kong Tech", organization: "Outblaze Limited", role: "Founder & CEO",
		startYear: 1998, endYear: 2012, location: "Hong Kong",
		description: "Founded Outblaze in Hong Kong as a white-label web services company. Grew it into a provider of messaging, community, and gaming services for major portals. Sold the messaging/community division to IBM in 2009 for an estimated $10-20M. Retained the gaming division which would eventually become Animoca Brands.",
		categories: [
			{ category: "income", claims: [
				{ id: "ys2-1", description: "CEO salary at Outblaze (1998-2012, cross-checked via HK C&SD IT sector earnings and IRD filings)", estimatedValueUSD: 2_000_000, confidence: 100, savingRate: 40, sources: [SRC_SIU.hkCensusStats, SRC_SIU.hkIRD, SRC_SIU.filleasyOutblaze] },
			], subtotalUSD: 2_000_000, avgConfidence: 100 },
			{ category: "companies", claims: [
				{ id: "ys2-2", description: "Sale of Outblaze messaging division to IBM (~$10-20M, Siu retained majority — HK CR confirmed via Fill Easy)", estimatedValueUSD: 15_000_000, confidence: 85, sources: [SRC_SIU.ibmAcq, SRC_SIU.hkCompanies, SRC_SIU.filleasyOutblaze] },
			], subtotalUSD: 15_000_000, avgConfidence: 85 },
			{ category: "alternatives", claims: [
				{ id: "ys2-3", description: "Hong Kong residential property acquired during this period (Fill Easy Land Registry search confirmed)", estimatedValueUSD: 3_000_000, confidence: 100, sources: [SRC_SIU.hkLandRegistry, SRC_SIU.hkRVD] },
			], subtotalUSD: 3_000_000, avgConfidence: 100 },
		],
		phaseWealthUSD: 20_000_000, cumulativeWealthUSD: 20_150_000,
		keyEvents: ["1998: Founded Outblaze in Hong Kong", "2004: Outblaze services powering 100+ portals", "2009: IBM acquires Outblaze messaging division"],
	},
	{
		id: "ys-3", title: "Animoca Brands Founding", organization: "Animoca Brands", role: "Co-Founder & Chairman",
		startYear: 2014, endYear: 2017, location: "Hong Kong",
		description: "Repurposed the gaming division of Outblaze into Animoca Brands, focusing on mobile games. Licensed major brands (Garfield, Doraemon, Astro Boy, Power Rangers). Listed on the Australian Securities Exchange (ASX) in 2015. Generated revenue from mobile games but modest profitability.",
		categories: [
			{ category: "companies", claims: [
				{ id: "ys3-1", description: "Animoca Brands ASX listing equity (co-founder stake ~55%, Fill Easy ASIC + HK CR verified, ASX market cap AU$20-50M)", estimatedValueUSD: 20_000_000, confidence: 95, sources: [SRC_SIU.asxListing, SRC_SIU.asxHistorical, SRC_SIU.asicRegistry, SRC_SIU.filleasyHKCR] },
			], subtotalUSD: 20_000_000, avgConfidence: 95 },
			{ category: "income", claims: [
				{ id: "ys3-2", description: "Chairman compensation at Animoca Brands (ASX annual report + Fill Easy ASIC verification)", estimatedValueUSD: 1_500_000, confidence: 100, savingRate: 50, sources: [SRC_SIU.asxAnnualReport, SRC_SIU.asicRegistry] },
			], subtotalUSD: 1_500_000, avgConfidence: 100 },
		],
		phaseWealthUSD: 21_500_000, cumulativeWealthUSD: 41_650_000,
		keyEvents: ["2014: Animoca Brands incorporated", "2015: Listed on ASX", "2016-17: Licensed Garfield, Doraemon, Power Rangers mobile games"],
	},
	{
		id: "ys-4", title: "Pivot to Blockchain Gaming", organization: "Animoca Brands / The Sandbox", role: "Chairman",
		startYear: 2018, endYear: 2020, location: "Hong Kong",
		description: "Strategic pivot to blockchain gaming and NFTs. Acquired The Sandbox from Pixowl in 2018. Launched SAND token. Invested in Dapper Labs (CryptoKitties/NBA Top Shot). ASX delisted Animoca in March 2020 over disputes about crypto asset accounting. This delisting actually removed constraints on their crypto strategy.",
		categories: [
			{ category: "companies", claims: [
				{ id: "ys4-1", description: "Animoca Brands equity (post-delisting, private valuation rising, ~$100M by late 2020 per PitchBook)", estimatedValueUSD: 55_000_000, confidence: 60, sources: [SRC_SIU.asxDelist, SRC_SIU.pitchbook, SRC_SIU.filleasyHKCR] },
			], subtotalUSD: 55_000_000, avgConfidence: 60 },
			{ category: "crypto", claims: [
				{ id: "ys4-2", description: "SAND token allocation (team/founder allocation, tokens worth ~$0.05-0.10 pre-boom)", estimatedValueUSD: 5_000_000, confidence: 45, sources: [SRC_SIU.coinGecko, SRC_SIU.sandboxAcq] },
				{ id: "ys4-3", description: "Various NFT and token holdings from early blockchain gaming investments", estimatedValueUSD: 3_000_000, confidence: 30, sources: [SRC_SIU.dappradar] },
			], subtotalUSD: 8_000_000, avgConfidence: 38 },
			{ category: "investments", claims: [
				{ id: "ys4-4", description: "Early investments in Dapper Labs, Sky Mavis (Axie Infinity), and other blockchain startups", estimatedValueUSD: 10_000_000, confidence: 40, sources: [SRC_SIU.crunchbase] },
				{ id: "ys4-5", description: "nWay Inc. acquisition (SF fighting game studio, $7.69M, Power Rangers: Legacy Wars 60M+ downloads)", estimatedValueUSD: 7_690_000, confidence: 95, sources: [SRC_SIU.nwayAcq] },
				{ id: "ys4-6", description: "GAMEE acquisition ($4.5M, mobile gaming platform, later launched Arc8 with 1.3M users)", estimatedValueUSD: 4_500_000, confidence: 95, sources: [SRC_SIU.gameeAcq] },
			], subtotalUSD: 22_190_000, avgConfidence: 77 },
		],
		phaseWealthUSD: 85_190_000, cumulativeWealthUSD: 126_840_000,
		keyEvents: ["2018: Acquired The Sandbox from Pixowl", "2019: SAND token launched", "2019-12: Acquired nWay for $7.69M", "2019: Invested in Dapper Labs", "2020-03: ASX delists Animoca Brands", "2020-07: Acquired GAMEE for $4.5M"],
	},
	{
		id: "ys-5", title: "Web3 Boom & Peak Wealth", organization: "Animoca Brands", role: "Co-Founder & Chairman",
		startYear: 2021, endYear: 2022, location: "Hong Kong",
		description: "The NFT and metaverse boom propelled Animoca Brands to a $5.9B valuation in January 2022 after raising $358.8M. SAND token peaked at $8.40 in November 2021 with a market cap exceeding $7B. Animoca made over 340 blockchain investments. Siu became one of crypto's most prominent advocates.",
		categories: [
			{ category: "companies", claims: [
				{ id: "ys5-1", description: "Animoca Brands equity at $5.9B valuation (estimated ~30-40% stake after dilution)", estimatedValueUSD: 2_000_000_000, confidence: 70, sources: [SRC_SIU.tcAnimoca, SRC_SIU.sequoia] },
			], subtotalUSD: 2_000_000_000, avgConfidence: 70 },
			{ category: "crypto", claims: [
				{ id: "ys5-2", description: "SAND token holdings at peak (~$8.40, estimated 100-200M tokens in founder/team allocation)", estimatedValueUSD: 800_000_000, confidence: 55, sources: [SRC_SIU.sandPeak, SRC_SIU.coinGecko] },
				{ id: "ys5-3", description: "NFT portfolio (LAND plots, Bored Apes, other blue-chip NFTs at peak valuations)", estimatedValueUSD: 150_000_000, confidence: 35, sources: [SRC_SIU.dappradar] },
				{ id: "ys5-4", description: "Various token allocations (REVV, TOWER, GMEE, LMT) from subsidiaries and 340+ portfolio investments", estimatedValueUSD: 250_000_000, confidence: 30, sources: [SRC_SIU.crunchbase, SRC_SIU.coinGecko, SRC_SIU.gameeAcq] },
			], subtotalUSD: 1_200_000_000, avgConfidence: 40 },
			{ category: "investments", claims: [
				{ id: "ys5-5", description: "Portfolio of 340+ blockchain/Web3 investments (book value at peak, $529.6M gains reported in FY2021)", estimatedValueUSD: 500_000_000, confidence: 45, sources: [SRC_SIU.crunchbase, SRC_SIU.bloombergSiu, SRC_SIU.animocaFinancials] },
				{ id: "ys5-7", description: "TinyTap ed-tech acquisition (80.45% for $38.9M, later raised at $100M valuation)", estimatedValueUSD: 80_000_000, confidence: 65, sources: [SRC_SIU.tinyTapAcq] },
				{ id: "ys5-8", description: "Blowfish Studios acquisition (up to A$35M / ~US$25.8M, Sydney game developer)", estimatedValueUSD: 25_000_000, confidence: 80, sources: [SRC_SIU.blowfishAcq] },
				{ id: "ys5-9", description: "Eden Games acquisition (~$15.3M, racing studio — NFS Porsche, F1 Mobile Racing)", estimatedValueUSD: 15_000_000, confidence: 85, sources: [SRC_SIU.edenGamesAcq] },
			], subtotalUSD: 620_000_000, avgConfidence: 69 },
			{ category: "alternatives", claims: [
				{ id: "ys5-6", description: "Hong Kong property portfolio (appreciated — Fill Easy Land Registry search and RVD index confirmed)", estimatedValueUSD: 8_000_000, confidence: 100, sources: [SRC_SIU.hkLandRegistry, SRC_SIU.hkRVD] },
			], subtotalUSD: 8_000_000, avgConfidence: 100 },
			{ category: "income", claims: [
				{ id: "ys5-10", description: "ApeCoin DAO Special Council compensation (~$250K/year, publicly disclosed June 2023)", estimatedValueUSD: 500_000, confidence: 100, sources: [SRC_SIU.apeCoinDAO] },
			], subtotalUSD: 500_000, avgConfidence: 100 },
		],
		phaseWealthUSD: 3_828_500_000, cumulativeWealthUSD: 3_828_500_000,
		keyEvents: ["2021-05: Sequoia China leads $65M round", "2021-07: Acquires Blowfish Studios (A$35M)", "2021-11-25: SAND peaks at $8.40 (ATH)", "2022-01: Animoca raises $358.8M at $5.9B valuation", "2022-01: Lympo subsidiary hacked ($18.7M stolen)", "2022-04: Acquires Eden Games (~$15.3M)", "2022-06: Acquires TinyTap for $38.9M"],
	},
	{
		id: "ys-6", title: "Market Correction & Rebuilding", organization: "Animoca Brands", role: "Co-Founder & Chairman",
		startYear: 2023, endYear: null, location: "Hong Kong",
		description: "Crypto winter caused severe portfolio markdowns. SAND fell ~90% from peak. NFT market collapsed. However, Animoca Brands maintained its $5.9B valuation from last funding round (no down round) and filed for a Nasdaq listing via reverse merger with Currenc Group in November 2025. Siu launched MOCA token ($29.3M raised), secured HKMA stablecoin license via Anchorpoint Financial JV (with Standard Chartered and HKT), and grew portfolio to 540+ companies. FY2024 total assets: $4.3B.",
		categories: [
			{ category: "companies", claims: [
				{ id: "ys6-1", description: "Animoca Brands equity — Siu's ~25% stake at last round ($5.9B) implies ~$1.475B; Nasdaq reverse merger filed Nov 2025 suggests $1B floor; PitchBook secondary at 30% discount gives ~$1.03B. Mid-range estimate.", estimatedValueUSD: 1_500_000_000, confidence: 50, sources: [SRC_SIU.tcAnimoca, SRC_SIU.bloombergSiu, SRC_SIU.pitchbook, SRC_SIU.filleasyHKCR, SRC_SIU.nasdaqMerger, SRC_SIU.animocaFinancials] },
				{ id: "ys6-7", description: "Anchorpoint Financial JV (Standard Chartered + HKT + Animoca) — HKMA stablecoin issuer license for HKDAP", estimatedValueUSD: 100_000_000, confidence: 30, sources: [SRC_SIU.anchorpointJV] },
			], subtotalUSD: 1_600_000_000, avgConfidence: 40 },
			{ category: "crypto", claims: [
				{ id: "ys6-2", description: "SAND token holdings — estimated 150-200M tokens at ~$0.30-0.60, highly volatile (down ~93% from $8.40 ATH)", estimatedValueUSD: 85_000_000, confidence: 60, sources: [SRC_SIU.coinGecko, SRC_SIU.sandPeak] },
				{ id: "ys6-12", description: "Personal BTC/ETH and blue-chip crypto holdings — Siu is a vocal crypto advocate; estimated personal portfolio based on UHNW crypto allocation benchmarks", estimatedValueUSD: 170_000_000, confidence: 25, sources: [SRC_SIU.coinGecko, SRC_SIU.forbesSiu] },
				{ id: "ys6-8", description: "MOCA token (launched Jul 2024, $29.3M raised, ATH $0.48, current ~$0.014) + Mocaverse NFTs (8,888 collection)", estimatedValueUSD: 25_000_000, confidence: 40, sources: [SRC_SIU.mocaToken] },
				{ id: "ys6-3", description: "NFT portfolio (severely depreciated, floor prices down 80-95%)", estimatedValueUSD: 15_000_000, confidence: 25, sources: [SRC_SIU.dappradar] },
				{ id: "ys6-4", description: "Remaining token positions (REVV, TOWER, GMEE, EDU, CHECK + off-balance sheet reserves $2.9B) — personal allocation estimated", estimatedValueUSD: 55_000_000, confidence: 20, sources: [SRC_SIU.crunchbase, SRC_SIU.coinGecko, SRC_SIU.animocaFinancials] },
			], subtotalUSD: 350_000_000, avgConfidence: 34 },
			{ category: "investments", claims: [
				{ id: "ys6-5", description: "540+ blockchain/Web3 portfolio companies — FY2024 fair value $564M on balance sheet; Siu's personal carry and co-investment estimated at ~45% of carried interest", estimatedValueUSD: 250_000_000, confidence: 35, sources: [SRC_SIU.crunchbase, SRC_SIU.animocaFinancials] },
				{ id: "ys6-9", description: "Animoca Ventures fund (separate entity, AUM $100M+, 100+ companies across 26 countries)", estimatedValueUSD: 15_000_000, confidence: 25, sources: [SRC_SIU.crunchbase] },
				{ id: "ys6-10", description: "Subsidiary portfolio (TinyTap, nWay, Eden Games, Blowfish, GAMEE, Forj) — marked down from ~$120M total acquisition cost", estimatedValueUSD: 90_000_000, confidence: 50, sources: [SRC_SIU.tinyTapAcq, SRC_SIU.nwayAcq, SRC_SIU.edenGamesAcq, SRC_SIU.animocaFinancials] },
			], subtotalUSD: 355_000_000, avgConfidence: 37 },
			{ category: "alternatives", claims: [
				{ id: "ys6-6", description: "Hong Kong Mid-Levels residence (purchased 2005, current value ~$15M based on RVD price index) — Fill Easy Land Registry confirmed", estimatedValueUSD: 15_000_000, confidence: 90, sources: [SRC_SIU.hkLandRegistry, SRC_SIU.hkRVD] },
				{ id: "ys6-13", description: "Additional overseas properties and tangible assets (estimated from UHNW lifestyle benchmarks for $2B+ net worth individuals)", estimatedValueUSD: 15_000_000, confidence: 20, sources: [SRC_SIU.forbesSiu] },
			], subtotalUSD: 30_000_000, avgConfidence: 55 },
			{ category: "income", claims: [
				{ id: "ys6-14", description: "Accumulated CEO/Chairman compensation from Animoca Brands (2014-present, ASX remuneration disclosures + estimated post-delisting salary)", estimatedValueUSD: 35_000_000, confidence: 45, sources: [SRC_SIU.asxAnnualReport, SRC_SIU.animocaFinancials] },
				{ id: "ys6-15", description: "Historical Outblaze IBM sale proceeds and reinvested earnings (~$15M acquisition, founder share estimated at 60-70%)", estimatedValueUSD: 28_000_000, confidence: 60, sources: [SRC_SIU.ibmAcq, SRC_SIU.hkIRD] },
				{ id: "ys6-11", description: "Advisory/board compensation — ApeCoin DAO (~$250K/yr), DigitalX, Hex Trust, speaking fees, and consulting", estimatedValueUSD: 2_000_000, confidence: 75, sources: [SRC_SIU.apeCoinDAO] },
				{ id: "ys6-re", description: "Rental income from Hong Kong residential properties (Fill Easy HK Land Registry confirmed)", estimatedValueUSD: 1_200_000, confidence: 80, savingRate: 90, sources: [SRC_SIU.hkLandRegistry] },
			], subtotalUSD: 66_200_000, avgConfidence: 65 },
		],
		phaseWealthUSD: 2_400_000_000, cumulativeWealthUSD: 2_400_000_000,
		keyEvents: ["2023: SAND drops below $0.50", "2023-06: HK launches virtual asset regulatory framework", "2024-07: MOCA token launches ($29.3M raised)", "2024-12: X/Twitter account hacked (phishing)", "2025-02: Anchorpoint Financial JV gets HKMA stablecoin license", "2025-11: Files Nasdaq reverse merger with Currenc Group"],
	},
];

// ── Helper: aggregate wealth by category ────────────────────────

function aggregateWealth(timeline: CareerPhase[]): { category: WealthCategory; totalUSD: number; percentage: number; avgConfidence: number }[] {
	const totals: Record<WealthCategory, { sum: number; confSum: number; count: number }> = {
		income: { sum: 0, confSum: 0, count: 0 },
		companies: { sum: 0, confSum: 0, count: 0 },
		investments: { sum: 0, confSum: 0, count: 0 },
		alternatives: { sum: 0, confSum: 0, count: 0 },
		crypto: { sum: 0, confSum: 0, count: 0 },
	};
	// Use only the last phase for current breakdown
	const lastPhase = timeline[timeline.length - 1];
	for (const cat of lastPhase.categories) {
		totals[cat.category].sum += cat.subtotalUSD;
		for (const c of cat.claims) {
			totals[cat.category].confSum += c.confidence;
			totals[cat.category].count++;
		}
	}
	const grandTotal = Object.values(totals).reduce((s, t) => s + t.sum, 0);
	return (Object.keys(totals) as WealthCategory[]).map((cat) => ({
		category: cat,
		totalUSD: totals[cat].sum,
		percentage: grandTotal > 0 ? (totals[cat].sum / grandTotal) * 100 : 0,
		avgConfidence: totals[cat].count > 0 ? Math.round(totals[cat].confSum / totals[cat].count) : 0,
	}));
}

function overallConfidence(timeline: CareerPhase[]): number {
	let totalWeight = 0;
	let weightedConf = 0;
	const last = timeline[timeline.length - 1];
	for (const cat of last.categories) {
		for (const cl of cat.claims) {
			weightedConf += cl.confidence * cl.estimatedValueUSD;
			totalWeight += cl.estimatedValueUSD;
		}
	}
	return totalWeight > 0 ? Math.round(weightedConf / totalWeight) : 0;
}

// ── Data Sources (for generating animation) ─────────────────────

const JACK_MA_SOURCES: DataSourceDef[] = [
	{ id: "ds-1", name: "SEC EDGAR — Form F-1, 20-F filings", provider: "U.S. Securities and Exchange Commission", category: "Regulatory Filings", delayMs: 1800 },
	{ id: "ds-2", name: "NYSE Historical Market Data (BABA)", provider: "New York Stock Exchange", category: "Market Data", delayMs: 1200 },
	{ id: "ds-3", name: "Bloomberg Billionaires Index", provider: "Bloomberg LP", category: "Wealth Estimates", delayMs: 2200 },
	{ id: "ds-4", name: "Fill Easy — SAMR Enterprise Credit + Judicial Records", provider: "Fill Easy Ltd / China SAMR", category: "Corporate Registry", delayMs: 1500 },
	{ id: "ds-5", name: "PBOC Ant Group Regulatory Filings", provider: "People's Bank of China", category: "Regulatory Filings", delayMs: 2000 },
	{ id: "ds-6", name: "Forbes Real-Time Billionaires", provider: "Forbes Media", category: "Wealth Estimates", delayMs: 800 },
	{ id: "ds-7", name: "Fill Easy — HK Land Registry Property Search", provider: "Fill Easy Ltd / HKSAR Land Reg", category: "Property Records", delayMs: 1400 },
	{ id: "ds-8", name: "Dow Jones Adverse Media Screening", provider: "Dow Jones Risk & Compliance", category: "Adverse Media", delayMs: 1600 },
	{ id: "ds-9", name: "OFAC / EU / UN Sanctions Lists", provider: "Multi-jurisdictional", category: "Sanctions Screening", delayMs: 900 },
	{ id: "ds-10", name: "PEP Database (Global)", provider: "World-Check / Dow Jones", category: "PEP Screening", delayMs: 1100 },
	{ id: "ds-11", name: "Crunchbase — Investment Portfolio", provider: "Crunchbase Inc.", category: "Investment Data", delayMs: 1300 },
	{ id: "ds-12", name: "Fill Easy — Singapore ACRA Registry Search", provider: "Fill Easy Ltd / SG ACRA", category: "Trust & Structures", delayMs: 1700 },
	{ id: "ds-13", name: "Fill Easy — HK Companies Registry Search", provider: "Fill Easy Ltd / HKSAR CR", category: "Corporate Registry", delayMs: 1400 },
	{ id: "ds-14", name: "China Individual Income Tax Records", provider: "State Taxation Administration", category: "Tax Records", delayMs: 1900 },
	{ id: "ds-15", name: "Fill Easy — SAMR UBO & Shareholder Structures", provider: "Fill Easy Ltd / China SAMR", category: "Corporate Registry", delayMs: 1600 },
	{ id: "ds-16", name: "French Land Registry (SPF)", provider: "Service de Publicité Foncière", category: "Property Records", delayMs: 2100 },
	{ id: "ds-17", name: "Franklin County NY — Property Records", provider: "Franklin County Real Property", category: "Property Records", delayMs: 1300 },
	{ id: "ds-18", name: "SuperYachtFan / Maritime Registry", provider: "Vessel & Aviation Registry", category: "Luxury Assets", delayMs: 1000 },
	{ id: "ds-19", name: "Singapore ACRA + Property Records", provider: "IRAS / URA / Fill Easy CorpVerify", category: "Property Records", delayMs: 1700 },
	{ id: "ds-20", name: "HK Stock Exchange — Yunfeng Financial", provider: "HKEX / SEHK", category: "Market Data", delayMs: 1200 },
];

const YAT_SIU_SOURCES: DataSourceDef[] = [
	{ id: "ds-1", name: "Fill Easy — HK Companies Registry Search", provider: "Fill Easy Ltd / HKSAR CR", category: "Corporate Registry", delayMs: 1500 },
	{ id: "ds-2", name: "ASX Historical Data (Animoca)", provider: "Australian Securities Exchange", category: "Market Data", delayMs: 1800 },
	{ id: "ds-3", name: "CoinGecko — SAND Token Data", provider: "CoinGecko", category: "Crypto Market Data", delayMs: 900 },
	{ id: "ds-4", name: "CoinMarketCap — Token Holdings", provider: "CoinMarketCap", category: "Crypto Market Data", delayMs: 800 },
	{ id: "ds-5", name: "Etherscan / Polygon — On-chain Analysis", provider: "Blockchain Explorers", category: "On-chain Data", delayMs: 2200 },
	{ id: "ds-6", name: "DappRadar — NFT Portfolio Valuation", provider: "DappRadar", category: "NFT Valuations", delayMs: 2000 },
	{ id: "ds-7", name: "Crunchbase — Animoca Investment Portfolio", provider: "Crunchbase Inc.", category: "Investment Data", delayMs: 1300 },
	{ id: "ds-8", name: "Bloomberg Company Profile", provider: "Bloomberg LP", category: "Company Intelligence", delayMs: 1600 },
	{ id: "ds-9", name: "Forbes / Forbes Crypto Billionaires", provider: "Forbes Media", category: "Wealth Estimates", delayMs: 700 },
	{ id: "ds-10", name: "Dow Jones Adverse Media Screening", provider: "Dow Jones Risk & Compliance", category: "Adverse Media", delayMs: 1400 },
	{ id: "ds-11", name: "OFAC / EU / UN Sanctions Lists", provider: "Multi-jurisdictional", category: "Sanctions Screening", delayMs: 900 },
	{ id: "ds-12", name: "HKMA Virtual Asset Registry", provider: "Hong Kong Monetary Authority", category: "Regulatory Data", delayMs: 1200 },
	{ id: "ds-13", name: "Fill Easy — HK Land Registry Property Search", provider: "Fill Easy Ltd / HKSAR Land Reg", category: "Property Records", delayMs: 1100 },
	{ id: "ds-14", name: "Fill Easy — ASIC Company Register Search", provider: "Fill Easy Ltd / AU ASIC", category: "Corporate Registry", delayMs: 1600 },
	{ id: "ds-15", name: "HK Inland Revenue Department", provider: "HKSAR IRD", category: "Tax Records", delayMs: 1800 },
	{ id: "ds-16", name: "Animoca FY2024 Investor Filings", provider: "Animoca Brands Corp.", category: "Company Financials", delayMs: 1400 },
	{ id: "ds-17", name: "Nasdaq / SEC — Currenc Group Merger Filing", provider: "SEC / Nasdaq", category: "Regulatory Filings", delayMs: 2000 },
	{ id: "ds-18", name: "HKMA Stablecoin Registry", provider: "Hong Kong Monetary Authority", category: "Regulatory Data", delayMs: 1100 },
	{ id: "ds-19", name: "CoinList / Token Sale Records", provider: "CoinList Markets", category: "Crypto Market Data", delayMs: 900 },
];

// ── Company Nodes (for network graph) ───────────────────────────

const JACK_MA_COMPANIES: CompanyNode[] = [
	{
		name: "Alibaba Group (NYSE: BABA)", role: "Founder & Former Chairman", ownership: "~4.5%", status: "ipo", valuation: "$215B",
		type: "holding", jurisdiction: "Cayman Islands / NYSE",
		children: [
			{ name: "Taobao / Tmall Group", role: "Core e-commerce", status: "active", type: "subsidiary", jurisdiction: "China", valuation: "Separated entity" },
			{ name: "Alibaba Cloud (Aliyun)", role: "Cloud computing", status: "active", type: "subsidiary", jurisdiction: "China", valuation: "$11B revenue" },
			{ name: "Cainiao Network", role: "Logistics (IPO filed HK)", ownership: "~70%", status: "active", type: "subsidiary", jurisdiction: "China / HK", valuation: "~$25B" },
			{ name: "Alibaba International (AIDC)", role: "Lazada, AliExpress, Trendyol", status: "active", type: "subsidiary", jurisdiction: "Global" },
			{ name: "Freshippo (Hema)", role: "New retail grocery", status: "active", type: "subsidiary", jurisdiction: "China" },
		],
	},
	{
		name: "Ant Group", role: "Co-founder, former controlling shareholder", ownership: "~8%", status: "restructured", valuation: "~$70B",
		type: "holding", jurisdiction: "China",
		children: [
			{ name: "Alipay", role: "Payments platform (1.3B+ users)", status: "active", type: "subsidiary", jurisdiction: "China" },
			{ name: "MYbank", role: "Online bank (30% Ant-owned)", ownership: "30%", status: "active", type: "subsidiary", jurisdiction: "China" },
			{ name: "Zhima Credit (Sesame)", role: "Credit scoring", status: "restructured", type: "subsidiary", jurisdiction: "China" },
			{ name: "Tianhong Asset Mgmt", role: "Yu'e Bao money market fund", status: "active", type: "fund", jurisdiction: "China", valuation: "¥600B AUM" },
			{ name: "Ant Insurance", role: "InsurTech platform", status: "restructured", type: "subsidiary", jurisdiction: "China" },
		],
	},
	{
		name: "Yunfeng Capital", role: "Co-founder", ownership: "GP interest", status: "active", valuation: "AUM ~$8B",
		type: "fund", jurisdiction: "Hong Kong / China",
		children: [
			{ name: "Alibaba Health (HK: 0241)", role: "Portfolio company", status: "active", type: "investment", jurisdiction: "HK", valuation: "~$5B mcap" },
			{ name: "Meituan (early investor)", role: "Early-stage investment", status: "exited", type: "investment", jurisdiction: "HK" },
		],
	},
	{
		name: "Blue Pool Capital", role: "Co-founder (with Joe Tsai)", ownership: "Co-principal", status: "active", valuation: "AUM ~$50B",
		type: "fund", jurisdiction: "Hong Kong",
		children: [
			{ name: "Riverside Fund ($1B+)", role: "Concentrated equity strategy", status: "active", type: "fund", jurisdiction: "Hong Kong" },
			{ name: "Global equities portfolio", role: "Public markets (TSMC, Apple, etc.)", status: "active", type: "investment", jurisdiction: "Global" },
		],
	},
	{
		name: "Yunfeng Financial Group (HK: 1160)", role: "Major shareholder", ownership: "11.15%", status: "active",
		type: "holding", jurisdiction: "Hong Kong",
		children: [
			{ name: "Yunfeng Securities", role: "Brokerage", status: "active", type: "subsidiary", jurisdiction: "HK" },
			{ name: "ETH Strategic Reserve", role: "10,000 ETH purchased ($44M)", status: "active", type: "investment", jurisdiction: "On-chain" },
		],
	},
	{
		name: "Singapore Family Trust", role: "Settlor", status: "active", valuation: "$2.4B+",
		type: "trust", jurisdiction: "Singapore",
		children: [
			{ name: "BABA shares (~$2.4B)", role: "Trust corpus — transferred 2023", status: "active", type: "investment", jurisdiction: "Singapore" },
			{ name: "Singapore properties (via Zhang Ying)", role: "GCB + Duxton Rd shophouses", status: "active", type: "investment", jurisdiction: "Singapore", valuation: "~S$90M" },
		],
	},
	{ name: "Jack Ma Foundation", role: "Founder", status: "active", type: "foundation", jurisdiction: "China / Global" },
	{
		name: "Hangzhou Ali Venture Capital", role: "Controlling shareholder (80%)", ownership: "80%", status: "active",
		type: "holding", jurisdiction: "China",
		children: [
			{ name: "Enlight Media (SZ-listed)", role: "$383M stake", ownership: "~10%", status: "active", type: "investment", jurisdiction: "China" },
		],
	},
	{ name: "Huayi Brothers (SZ-listed)", role: "Minority investor (since 2009 IPO)", ownership: "~2.6%", status: "active", type: "investment", jurisdiction: "China" },
	{
		name: "Real estate portfolio", role: "Personal assets", status: "active", valuation: "~$600M",
		type: "holding", jurisdiction: "Multi-jurisdictional",
		children: [
			{ name: "Victoria Peak mansion (HK)", role: "HK$1.5B — Fill Easy Land Reg", status: "active", type: "investment", jurisdiction: "Hong Kong", valuation: "~$200M" },
			{ name: "Brandon Park (NY, 28,100 ac)", role: "Via New Brandon LLC", status: "active", type: "investment", jurisdiction: "USA" , valuation: "$23M" },
			{ name: "Château de Sours (Bordeaux)", role: "54ha vineyard", status: "active", type: "investment", jurisdiction: "France", valuation: "~$20M" },
			{ name: "Château Guerry (Bordeaux)", role: "Second vineyard", status: "active", type: "investment", jurisdiction: "France" },
		],
	},
	{
		name: "Luxury & lifestyle assets", role: "Personal", status: "active", valuation: "~$265M",
		type: "holding",
		children: [
			{ name: "M/Y Zen (88m Feadship)", role: "Superyacht — built 2021", status: "active", type: "investment", valuation: "~$200M" },
			{ name: "Gulfstream G650ER (VP-CZM)", role: "Via Brilliant Sky Blue Ltd", status: "active", type: "investment", jurisdiction: "Cayman Islands", valuation: "~$65M" },
		],
	},
];

const YAT_SIU_COMPANIES: CompanyNode[] = [
	{
		name: "Animoca Brands", role: "Co-founder & Chairman", ownership: "~30-40%", status: "active", valuation: "$5.9B (last round)",
		type: "holding", jurisdiction: "Hong Kong",
		children: [
			{
				name: "The Sandbox (SAND)", role: "Subsidiary — metaverse platform", ownership: "Subsidiary", status: "active", valuation: "SAND mcap ~$900M",
				type: "subsidiary", jurisdiction: "Hong Kong / Argentina",
				children: [
					{ name: "SAND token reserves", role: "Treasury tokens (locked/vesting)", status: "active", type: "token", valuation: "$150M+ notional" },
					{ name: "LAND NFT ecosystem", role: "175K+ virtual parcels sold", status: "active", type: "token", jurisdiction: "Ethereum / Polygon" },
				],
			},
			{
				name: "TinyTap (ed-tech)", role: "84.13% — acquired 2022 ($38.9M)", ownership: "84.13%", status: "active", valuation: "$100M (2023 raise)",
				type: "subsidiary", jurisdiction: "Israel",
				children: [
					{ name: "TINT token (proposed)", role: "Ed-fi token — not yet launched", status: "pending", type: "token" },
				],
			},
			{ name: "nWay (fighting games)", role: "Subsidiary — Power Rangers: Legacy Wars", ownership: "100%", status: "active", type: "subsidiary", jurisdiction: "San Francisco", valuation: "60M+ downloads" },
			{
				name: "GAMEE / Arc8", role: "Subsidiary — mobile competitive gaming", ownership: "100%", status: "active",
				type: "subsidiary", jurisdiction: "Prague",
				children: [
					{ name: "GMEE token", role: "Play-to-earn rewards", status: "active", type: "token", valuation: "~$5M mcap" },
					{ name: "AlphaTON divestiture (51%)", role: "LOI signed — TON blockchain pivot", status: "pending", type: "subsidiary" },
				],
			},
			{ name: "Eden Games (racing)", role: "Subsidiary — Gear.Club, V-Rally", ownership: "100%", status: "active", type: "subsidiary", jurisdiction: "Lyon, France" },
			{ name: "Blowfish Studios", role: "Subsidiary — game development", ownership: "100%", status: "active", type: "subsidiary", jurisdiction: "Sydney, Australia" },
			{
				name: "Lympo (fitness/NFT)", role: "Subsidiary — hot wallet hacked $18.7M", ownership: "Subsidiary", status: "restructured",
				type: "subsidiary", jurisdiction: "Lithuania",
				children: [
					{ name: "LMT token", role: "Severely impaired post-hack", status: "restructured", type: "token", valuation: "<$1M" },
				],
			},
			{
				name: "Quidd (digital collectibles)", role: "Subsidiary — licensed IP collectibles", ownership: "100%", status: "active",
				type: "subsidiary", jurisdiction: "USA",
			},
			{ name: "REVV Motorsport ecosystem", role: "Cross-game token (F1 Delta Time, MotoGP)", status: "active", type: "token", valuation: "REVV ~$15M mcap" },
			{ name: "TOWER token (Crazy Defense Heroes)", role: "Game token — 3M+ players", status: "active", type: "token", valuation: "~$20M mcap" },
		],
	},
	{
		name: "Animoca Ventures", role: "GP", ownership: "GP interest", status: "active", valuation: "AUM $100M+",
		type: "fund", jurisdiction: "Hong Kong",
		children: [
			{ name: "540+ portfolio companies", role: "Web3 / gaming investments", status: "active", type: "investment", valuation: "$2.9B off-balance" },
			{ name: "Mocaverse / MOCA token", role: "Animoca ecosystem token", status: "active", type: "token", jurisdiction: "On-chain", valuation: "Raised $29.3M" },
		],
	},
	{
		name: "Anchorpoint Financial", role: "JV (StanChart + HKT + Animoca)", ownership: "JV partner", status: "active",
		type: "jv", jurisdiction: "Hong Kong", valuation: "HKMA stablecoin license",
		children: [
			{ name: "HKD-pegged stablecoin (planned)", role: "Regulatory sandbox participant", status: "pending", type: "token", jurisdiction: "Hong Kong" },
		],
	},
	{
		name: "Outblaze Limited", role: "Founder", ownership: "Majority", status: "exited",
		type: "holding", jurisdiction: "Hong Kong", valuation: "Messaging sold to IBM (~$15M)",
		children: [
			{ name: "Outblaze messaging (sold to IBM)", role: "Enterprise messaging division", status: "exited", type: "subsidiary", jurisdiction: "Hong Kong" },
			{ name: "Outblaze games division", role: "Became Animoca Brands (2014)", status: "exited", type: "subsidiary", jurisdiction: "Hong Kong" },
		],
	},
	{
		name: "Currenc Group (Nasdaq merger)", role: "Reverse merger vehicle for Animoca listing", status: "pending",
		type: "holding", jurisdiction: "Cayman Islands / Nasdaq",
		children: [
			{ name: "Animoca Brands public listing", role: "Expected via reverse merger", status: "pending", type: "subsidiary", jurisdiction: "Nasdaq" },
		],
	},
	{
		name: "Personal token holdings", role: "Direct wallet holdings", status: "active",
		type: "holding", jurisdiction: "On-chain",
		children: [
			{ name: "SAND tokens (personal)", role: "Discounted from peak $8.40 → ~$0.40", status: "active", type: "token", valuation: "~$30M est." },
			{ name: "MOCA tokens (personal)", role: "Ecosystem governance token", status: "active", type: "token", valuation: "~$20M est." },
			{ name: "NFT collection", role: "BAYC, Mocaverse, Sandbox LAND", status: "active", type: "token", valuation: "~$5M (depreciated)" },
		],
	},
];

// ── Key Parameters ──────────────────────────────────────────────

const JACK_MA_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "High — career trajectory clearly explains wealth accumulation", status: "normal" },
	{ label: "Source Diversity", value: "20 independent sources across filings, market data, registries, property records (Fill Easy multi-registry)", status: "normal" },
	{ label: "Overall Confidence", value: `${overallConfidence(JACK_MA_CAREER)}%`, status: "normal" },
	{ label: "Regulatory Exposure", value: "Significant — Ant Group restructuring, Alibaba antitrust fine", status: "warning" },
	{ label: "PEP Status", value: "Near-match — political connections in China require monitoring", status: "warning" },
	{ label: "Wealth Volatility", value: "Moderate — Alibaba stock fluctuations, Ant Group valuation uncertainty", status: "warning" },
	{ label: "Jurisdictional Complexity", value: "High — China, Hong Kong, Singapore, global structures", status: "warning" },
	{ label: "Transparency Score", value: "Good — SEC filings, NYSE listing provide verified data", status: "normal" },
];

const YAT_SIU_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "Plausible but volatile — majority tied to crypto asset valuations", status: "warning" },
	{ label: "Source Diversity", value: "19 sources (Fill Easy multi-registry, Nasdaq filings, HKMA) but crypto data has lower reliability", status: "warning" },
	{ label: "Overall Confidence", value: `${overallConfidence(YAT_SIU_CAREER)}%`, status: "critical" },
	{ label: "Regulatory Exposure", value: "High — ASX delisting, crypto regulatory uncertainty globally", status: "critical" },
	{ label: "PEP Status", value: "Clear — no PEP matches or political exposure", status: "normal" },
	{ label: "Wealth Volatility", value: "Extreme — 90%+ drawdown in crypto assets from peak", status: "critical" },
	{ label: "Jurisdictional Complexity", value: "Moderate — Hong Kong primary, Australia (former), global crypto", status: "warning" },
	{ label: "Transparency Score", value: "Low — private company, crypto assets, no mandatory disclosure", status: "critical" },
];

// ── PEP/Sanctions Screening ─────────────────────────────────────

export const PEP_SCREENING: PepScreeningEntry[] = [
	{
		subjectName: "Jack Ma (Ma Yun)", subjectNameCn: "马云", riskRating: "Medium",
		lastScreened: "2026-05-17",
		listsChecked: ["OFAC SDN", "EU Consolidated", "UN Security Council", "PBOC", "HK SFC", "World-Check PEP", "Dow Jones Watchlist"],
		pepHits: 1,
		pepDetails: "Near-match: CPPCC delegate (12th National Committee, 2013-2018). Not a current PEP but retains political connections in China. Requires enhanced monitoring.",
		sanctionsHits: 0,
		adverseMedia: 3,
		adverseMediaDetails: "Ant Group IPO suspension (2020), Alibaba $2.8B antitrust fine (2021), 3-month public disappearance (2020-2021). All widely reported by major outlets.",
		overallStatus: "Review Required",
	},
	{
		subjectName: "Yat Siu", subjectNameCn: "蕭逸", riskRating: "High",
		lastScreened: "2026-05-17",
		listsChecked: ["OFAC SDN", "EU Consolidated", "UN Security Council", "HKMA", "ASIC", "World-Check PEP", "Dow Jones Watchlist"],
		pepHits: 0,
		sanctionsHits: 0,
		adverseMedia: 4,
		adverseMediaDetails: "ASX delisting of Animoca Brands over crypto accounting disputes (2020). Lympo subsidiary hacked — $18.7M stolen (Jan 2022). X/Twitter account compromised via phishing (Dec 2024). General crypto regulatory scrutiny.",
		overallStatus: "Review Required",
	},
	{
		subjectName: "Donald Trump", riskRating: "High",
		lastScreened: "2026-05-19",
		listsChecked: ["OFAC SDN", "EU Consolidated", "UN Security Council", "FinCEN", "FEC", "OGE", "World-Check PEP", "Dow Jones Watchlist"],
		pepHits: 1,
		pepDetails: "Active PEP — current President of the United States (2025-present). Former President (2017-2021). Highest-level PEP classification. Mandatory enhanced due diligence.",
		sanctionsHits: 0,
		adverseMedia: 12,
		adverseMediaDetails: "Multiple criminal indictments (2023-2024), civil fraud judgment ($454M, NY), E. Jean Carroll defamation verdicts, Trump University settlement ($25M), six corporate bankruptcies (1991-2014), ongoing DOJ investigations.",
		overallStatus: "Flagged",
	},
	{
		subjectName: "James Chen Wei", subjectNameCn: "陈伟", riskRating: "Low",
		lastScreened: "2026-05-19",
		listsChecked: ["OFAC SDN", "EU Consolidated", "UN Security Council", "MAS", "SFC", "World-Check PEP", "Dow Jones Watchlist"],
		pepHits: 0,
		sanctionsHits: 0,
		adverseMedia: 0,
		overallStatus: "Clear",
	},
	{
		subjectName: "Elon Musk", riskRating: "Medium",
		lastScreened: "2026-05-15",
		listsChecked: ["OFAC SDN", "EU Consolidated", "UN Security Council", "SEC", "World-Check PEP", "Dow Jones Watchlist"],
		pepHits: 1,
		pepDetails: "Current US government official — Department of Government Efficiency (DOGE). Active PEP classification.",
		sanctionsHits: 0,
		adverseMedia: 5,
		adverseMediaDetails: "SEC enforcement actions (Tesla tweets), DoJ investigations, multiple regulatory inquiries across jurisdictions.",
		overallStatus: "Flagged",
	},
	{
		subjectName: "Changpeng Zhao (CZ)", subjectNameCn: "赵长鹏", riskRating: "High",
		lastScreened: "2026-05-16",
		listsChecked: ["OFAC SDN", "EU Consolidated", "UN Security Council", "DOJ", "FinCEN", "World-Check PEP", "Dow Jones Watchlist"],
		pepHits: 0,
		sanctionsHits: 0,
		adverseMedia: 8,
		adverseMediaDetails: "DOJ guilty plea (Nov 2023) for BSA/AML violations. $4.3B Binance settlement. 4-month prison sentence served. Ongoing regulatory scrutiny.",
		overallStatus: "Flagged",
	},
];

// ── Narratives ──────────────────────────────────────────────────

const JACK_MA_NARRATIVE = `Jack Ma's wealth trajectory is one of the most documented in modern Chinese business history. His estimated net worth of approximately $25.5 billion according to [Forbes](https://www.forbes.com/profile/jack-ma/) is overwhelmingly derived from his founding equity in Alibaba Group, crystallized through the company's record-breaking $25 billion NYSE IPO in September 2014. [SEC Form F-1](https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm) filings confirm Ma held approximately 6.2% of Alibaba shares at IPO. The wealth accumulation path from $60,000 pooled founding investment through Goldman Sachs ($5M), SoftBank ($20M), and Yahoo ($1B) rounds to public market is well-documented.

Beyond core Alibaba equity, the assessment identified a substantial portfolio of alternative assets and investments: the Blue Pool Capital family office (co-founded with Joe Tsai, AUM ~$50B), an 11.15% stake in HK-listed Yunfeng Financial Group (which purchased 10,000 ETH as strategic reserve in 2025), Yunfeng Capital PE fund (AUM ~$8B), minority stakes in Huayi Brothers and Enlight Media, and a Singapore family trust holding $2.4B in BABA shares verified via [ACRA Registry](https://www.acra.gov.sg/). Real estate includes a Victoria Peak mansion (HK$1.5B, Fill Easy Land Registry confirmed) per [SCMP](https://www.scmp.com/property), a 28,100-acre Adirondack estate ($23M via New Brandon LLC), two Bordeaux vineyards (Château de Sours and Château Guerry), and Singapore properties held via wife Zhang Ying (Good Class Bungalow ~S$40M and three Duxton Road shophouses ~S$50M). Lifestyle assets include the 88m superyacht Zen (~$200M, Feadship 2021) and a Gulfstream G650ER private jet (~$65M, registered VP-CZM in the Cayman Islands).

Key risk factors include significant regulatory exposure (Ant Group restructuring, $2.8B Alibaba antitrust fine), PEP near-match status from his former CPPCC membership, and ongoing uncertainty about the true value of his Ant Group stake post-restructuring (~8% of ~$70B). Singapore properties in wife's name and corporate-entity-held assets (New Brandon LLC, Brilliant Sky Blue Ltd) add jurisdictional complexity. Despite these factors, the overall wealth plausibility score is high — 20 independent data sources across 6 jurisdictions clearly explain the accumulation of wealth at this scale.`;

const YAT_SIU_NARRATIVE = `Yat Siu's estimated net worth of approximately $2.4 billion represents one of the more complex wealth profiles in the technology sector. Unlike traditional tech billionaires anchored to publicly traded shares, the majority of Siu's wealth derives from his co-founder stake in Animoca Brands (last valued at $5.9B per [PitchBook](https://pitchbook.com/profiles/animoca-brands-profile) in January 2022), crypto/NFT holdings with extreme volatility, and an extensive portfolio of 540+ blockchain investments.

The career trajectory shows credible progression: Atari (teen employee), Outblaze founding and [IBM exit](https://www.rttnews.com/826408/ibm-plans-to-buy-strategic-messaging-service-assets-of-outblaze-quick-facts.aspx) (~$15M), Animoca Brands [ASX listing](https://connectonline.asic.gov.au/), strategic pivot to blockchain gaming via The Sandbox acquisition (2018), and explosive growth during the 2021-2022 Web3 boom. Animoca executed an aggressive acquisition strategy — nWay ($7.69M), GAMEE ($4.5M), TinyTap ($38.9M), Blowfish Studios (up to A$35M), and Eden Games (~$15.3M) — building a gaming studio portfolio with recognized IP (Power Rangers, F1 Racing, Gear.Club).

Significant developments since 2023 include: the MOCA token launch ($29.3M raised, Jul 2024), the Anchorpoint Financial JV with Standard Chartered and HKT (granted HKMA stablecoin issuer licence for HKDAP), and a Nasdaq reverse merger filing with Currenc Group (Nov 2025) at ~$1B valuation — notably below the last $5.9B private round. FY2024 financials show total assets of $4.3B, with $2.9B in off-balance sheet token reserves.

However, substantial risks persist. [SAND](https://www.coingecko.com/en/coins/the-sandbox) has declined ~93% from peak. Subsidiary tokens (REVV, TOWER) are effectively defunct. The Lympo subsidiary was hacked for $18.7M (Jan 2022) — 6.5x its acquisition cost. Siu's X/Twitter account was compromised via phishing (Dec 2024). NFT valuations remain highly subjective (client claims $50M vs. DappRadar floor prices of $12-18M). The ASX delisting in 2020 removed mandatory disclosure, and the overall confidence score reflects limited transparency across 19 data sources.`;

// ── Monitoring Table ────────────────────────────────────────────

export const HNW_MONITORING: HnwMonitoringEntry[] = [
	{ id: "m1", name: "Jack Ma", nameCn: "马云", industry: "E-Commerce / Fintech", estimatedNetWorthUSD: 25_500_000_000, riskRating: "Medium", corroborationGrade: "C", overallConfidence: 62, lastScreened: "2026-05-17", openAlerts: 2, status: "Under Review", screeningFrequency: "Monthly" },
	{ id: "m2", name: "Yat Siu", nameCn: "蕭逸", industry: "Blockchain Gaming / Web3", estimatedNetWorthUSD: 2_400_000_000, riskRating: "High", corroborationGrade: "E", overallConfidence: 45, lastScreened: "2026-05-17", openAlerts: 3, status: "Active", screeningFrequency: "Weekly" },
	{ id: "m8", name: "Donald Trump", industry: "Real Estate / Media / Politics", estimatedNetWorthUSD: 6_500_000_000, riskRating: "High", corroborationGrade: "D", overallConfidence: 52, lastScreened: "2026-05-19", openAlerts: 4, status: "Flagged", screeningFrequency: "Weekly" },
	{ id: "m9", name: "James Chen Wei", nameCn: "陈伟", industry: "Private Equity / Family Office", estimatedNetWorthUSD: 380_000_000, riskRating: "Low", corroborationGrade: "A", overallConfidence: 88, lastScreened: "2026-05-19", openAlerts: 0, status: "Active", screeningFrequency: "Quarterly" },
	{ id: "m3", name: "Elon Musk", industry: "EV / Space / AI", estimatedNetWorthUSD: 240_000_000_000, riskRating: "Medium", corroborationGrade: "D", overallConfidence: 55, lastScreened: "2026-05-15", openAlerts: 5, status: "Flagged", screeningFrequency: "Weekly" },
	{ id: "m4", name: "Changpeng Zhao", nameCn: "赵长鹏", industry: "Crypto Exchanges", estimatedNetWorthUSD: 33_000_000_000, riskRating: "High", corroborationGrade: "E", overallConfidence: 38, lastScreened: "2026-05-16", openAlerts: 4, status: "Flagged", screeningFrequency: "Weekly" },
	{ id: "m5", name: "Masayoshi Son", nameCn: "孙正义", industry: "Venture Capital / Telecom", estimatedNetWorthUSD: 10_300_000_000, riskRating: "Low", corroborationGrade: "B", overallConfidence: 72, lastScreened: "2026-05-14", openAlerts: 0, status: "Active", screeningFrequency: "Monthly" },
	{ id: "m6", name: "Li Ka-shing", nameCn: "李嘉诚", industry: "Real Estate / Conglomerate", estimatedNetWorthUSD: 35_000_000_000, riskRating: "Low", corroborationGrade: "B", overallConfidence: 78, lastScreened: "2026-05-12", openAlerts: 1, status: "Active", screeningFrequency: "Quarterly" },
	{ id: "m7", name: "Vitalik Buterin", industry: "Blockchain / Ethereum", estimatedNetWorthUSD: 1_500_000_000, riskRating: "Medium", corroborationGrade: "E", overallConfidence: 42, lastScreened: "2026-05-16", openAlerts: 1, status: "Active", screeningFrequency: "Monthly" },
];

// ── Notifications ───────────────────────────────────────────────

export const HNW_NOTIFICATIONS: HnwNotification[] = [
	{ id: "n9", type: "alert", title: "PEP status — active head of state — Donald Trump", detail: "Active PEP classification: sitting U.S. President. Mandatory enhanced due diligence and senior management approval required before onboarding.", time: "1 hour ago", subjectName: "Donald Trump", read: false },
	{ id: "n10", type: "alert", title: "OGE financial disclosure update — Donald Trump", detail: "New Office of Government Ethics public financial disclosure filed. Updated DJT/TMTG holdings and real estate valuations available.", time: "6 hours ago", subjectName: "Donald Trump", read: false },
	{ id: "n11", type: "alert", title: "DJT stock volatility — Donald Trump", detail: "Trump Media & Technology Group (DJT) shares swung 18% in 48 hours. Mark-to-market wealth estimate requires update.", time: "1 day ago", subjectName: "Donald Trump", read: false },
	{ id: "n12", type: "completed", title: "Assessment complete — James Chen Wei", detail: "Full SOW assessment completed with Grade A corroboration. All documents verified. Four-eye check approved by Michael Wong.", time: "2 hours ago", subjectName: "James Chen Wei", read: false },
	{ id: "n1", type: "alert", title: "Adverse media hit — Jack Ma", detail: "Bloomberg reports on Ant Group regulatory developments. New PBOC disclosure requirements affecting valuation estimates.", time: "3 hours ago", subjectName: "Jack Ma", read: false },
	{ id: "n2", type: "alert", title: "SAND token price alert — Yat Siu", detail: "SAND dropped 12% in 24h to $0.28. Portfolio mark-to-market valuation update required.", time: "5 hours ago", subjectName: "Yat Siu", read: false },
	{ id: "n3", type: "update", title: "SEC filing update — Alibaba Group", detail: "Alibaba 20-F annual report filed. Updated share structure and beneficial ownership data available.", time: "1 day ago", subjectName: "Jack Ma", read: true },
	{ id: "n4", type: "review-due", title: "Quarterly review due — Li Ka-shing", detail: "Routine quarterly screening and wealth re-assessment scheduled. 8 data sources queued.", time: "2 days ago", subjectName: "Li Ka-shing", read: true },
	{ id: "n5", type: "completed", title: "Assessment complete — Masayoshi Son", detail: "Monthly screening completed. No material changes. SoftBank Vision Fund NAV stable.", time: "4 days ago", subjectName: "Masayoshi Son", read: true },
	{ id: "n6", type: "alert", title: "PEP status change — Elon Musk", detail: "Updated PEP classification following Department of Government Efficiency role. Enhanced monitoring applied.", time: "1 week ago", subjectName: "Elon Musk", read: true },
	{ id: "n7", type: "update", title: "On-chain activity — Vitalik Buterin", detail: "Large ETH transfer detected from known Buterin wallet. Charitable donation to Kanro confirmed.", time: "1 week ago", subjectName: "Vitalik Buterin", read: true },
	{ id: "n8", type: "alert", title: "Regulatory update — CZ / Binance", detail: "FinCEN monitoring report filed. Post-settlement compliance status reviewed.", time: "2 weeks ago", subjectName: "Changpeng Zhao", read: true },
];

// ── Client Documents ───────────────────────────────────────────

const JACK_MA_CLIENT_DOCS: ClientDocument[] = [
	{ id: "cd-jm-1", type: "passport", label: "PRC Passport — Ma Yun (马云)", submittedBy: "Client (via legal counsel, King & Wood Mallesons)", submittedDate: "2026-04-15", status: "verified", fileDescription: "People's Republic of China passport. Name: MA YUN (马云). DOB: 10 SEP 1964. Passport No: E12••••78. Valid through 2031.", verificationNotes: "Name and DOB match SEC F-1 filing beneficial ownership table. Passport format valid for PRC issuance.", governmentAuthority: "PRC Ministry of Public Security" },
	{ id: "cd-jm-2", type: "bank-statement", label: "DBS Private Banking Statement — SGD Account", submittedBy: "Client (via DBS Wealth Management)", submittedDate: "2026-04-20", status: "verified", fileDescription: "DBS Private Banking statement for account ending ••4821. Period: Jan-Mar 2026. Shows dividend income from Alibaba Holdings, trust distributions, and investment returns.", verificationNotes: "Dividend amounts cross-checked against BABA ex-dividend dates. Trust distributions consistent with Singapore family trust structure per ACRA records.", governmentAuthority: "Monetary Authority of Singapore (MAS) — regulated institution" },
	{ id: "cd-jm-3", type: "share-certificate", label: "Morgan Stanley — BABA Beneficial Ownership Confirmation", submittedBy: "Client (via Morgan Stanley)", submittedDate: "2026-04-18", status: "verified", fileDescription: "Morgan Stanley custody confirmation showing beneficial ownership of BABA ADR shares. Current holding: ~131M shares (approximately 4.5% of outstanding).", verificationNotes: "Cross-verified against SEC Schedule 13D/A filing and 20-F beneficial ownership table. Custodian confirmed independently.", governmentAuthority: "U.S. Securities and Exchange Commission (SEC)" },
	{ id: "cd-jm-4", type: "trust-deed", label: "Fill Easy API: Singapore ACRA — Ma Family Trust Pte. Ltd.", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Singapore ACRA BizFile+ record for Ma Family Trust Pte. Ltd. (UEN: 202312345A). Entity registration, directors, secretary, and filing status. Retrieved via Fill Easy CorpVerify API.", verificationNotes: "100% verified — government authority. Fill Easy CorpVerify returned ACRA exact match. Trust entity registration confirmed. Trust deed (provided separately by client counsel) references this entity.", governmentAuthority: "Singapore ACRA (via Fill Easy CorpVerify)" },
	{ id: "cd-jm-5", type: "tax-return", label: "PRC Individual Income Tax — 2025 Filing Summary", submittedBy: "Client (via PwC China)", submittedDate: "2026-04-25", status: "verified", fileDescription: "Summary of PRC Individual Income Tax (IIT) filing for calendar year 2025. Zhejiang Province filing. Comprehensive income, capital gains, and offshore income reported.", verificationNotes: "IIT filing consistent with disclosed compensation and investment income. Cross-referenced against NBS tax bracket data.", governmentAuthority: "China State Taxation Administration (STA)" },
	{ id: "cd-jm-6", type: "property-deed", label: "Fill Easy API: HK Land Registry — Victoria Peak Residence", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Hong Kong Land Registry memorial showing property at 15 Barker Road, The Peak. Purchase price: HK$1.5 billion. Registered owner details confirmed via Fill Easy property search API.", verificationNotes: "100% verified — government authority. Fill Easy API returned land registry memorial with registered owner, lot number, and transaction history. Price matches SCMP reporting.", governmentAuthority: "Hong Kong Land Registry (via Fill Easy API)" },
	{ id: "cd-jm-7", type: "incorporation-cert", label: "Fill Easy API: SAMR — Alibaba Group Holdings Registration", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "SAMR National Enterprise Credit Information System record for Alibaba Group Holding Limited. USCC: 91330100799999776H. Legal representative: 马云. Business scope, registered capital, credit standing, and judicial records returned.", verificationNotes: "100% verified — government authority. Fill Easy China Cross-Border API returned full SAMR registration, credit standing (Normal), and judicial records (antitrust fine resolved 2021).", governmentAuthority: "China SAMR (via Fill Easy China Cross-Border)" },
	{ id: "cd-jm-8", type: "incorporation-cert", label: "Fill Easy API: HK CR — Alibaba Group (HK) Limited", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Hong Kong Companies Registry record for Alibaba Group (HK) Limited (CR No. 1359598). Directors, registered office, annual returns. Hong Kong subsidiary entity.", verificationNotes: "100% verified — government authority. Fill Easy CorpVerify returned exact match on company name and CR number.", governmentAuthority: "Hong Kong Companies Registry (via Fill Easy CorpVerify)" },
	{ id: "cd-jm-9", type: "property-deed", label: "French Land Registry — Château de Sours, Bordeaux", submittedBy: "Client (via Notaire, Bordeaux)", submittedDate: "2026-05-02", status: "verified", fileDescription: "Service de Publicité Foncière deed for Château de Sours, Saint-Quentin-de-Baron, Gironde. 54-hectare vineyard property. Owner: corporate entity linked to Ma Yun. Second French vineyard acquisition after Château Guerry.", verificationNotes: "Verified via French land registry. Ownership via corporate entity — beneficial owner cross-referenced against SCMP reporting. Valuation estimate from vineyard broker data.", governmentAuthority: "Service de Publicité Foncière (French Land Registry)" },
	{ id: "cd-jm-10", type: "property-deed", label: "Franklin County NY — Brandon Park Estate (28,100 acres)", submittedBy: "Client (via Sullivan & Cromwell LLP)", submittedDate: "2026-04-28", status: "verified", fileDescription: "Franklin County NY deed for Brandon Park. 28,100 acres in Adirondacks. Purchased May 2015 via New Brandon LLC for ~$23M. Includes 9 miles of St. Regis River, lakes, 20+ structures.", verificationNotes: "Deed verified via Franklin County real property records. Ownership entity New Brandon LLC linked to Ma through corporate filings.", governmentAuthority: "Franklin County NY Clerk (Real Property)" },
	{ id: "cd-jm-11", type: "other", label: "Maritime Registry — M/Y Zen (88m Feadship)", submittedBy: "Client (via maritime broker)", submittedDate: "2026-05-05", status: "verified", fileDescription: "Vessel registration for M/Y Zen. 88m (289 ft) Feadship, launched 2021. 2,562 GT. Builder: Royal Van Lent. Registered owner details. 16 guests, 25 crew. Estimated value ~$200M.", verificationNotes: "Vessel identity confirmed via IMO number and flag state registry. Ownership linked to Ma through corporate structures.", governmentAuthority: "Cayman Islands Shipping Registry" },
	{ id: "cd-jm-12", type: "other", label: "Aviation Registry — Gulfstream G650ER (VP-CZM)", submittedBy: "Client (via aviation management company)", submittedDate: "2026-05-05", status: "verified", fileDescription: "Aircraft registration for Gulfstream G650ER. Registration: VP-CZM (Cayman Islands). Year: 2020. Ownership entity: Brilliant Sky Blue Limited. Estimated value ~$65-70M.", verificationNotes: "Registration confirmed via Cayman Islands Civil Aviation Authority. Previous aircraft G550 (N999HZ) also documented.", governmentAuthority: "Cayman Islands CAA" },
	{ id: "cd-jm-13", type: "other", label: "HKEX Disclosure — Yunfeng Financial Group (11.15% stake)", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "HKEX mandatory disclosure filing showing Ma Yun as holder of 11.15% stake in Yunfeng Financial Group. Recent disclosure: company purchased 10,000 ETH ($44M) as strategic reserve.", verificationNotes: "100% verified — government authority. HKEX mandatory substantial shareholder disclosure.", governmentAuthority: "HKEX / SFC (via Fill Easy CorpVerify)" },
];

const YAT_SIU_CLIENT_DOCS: ClientDocument[] = [
	{ id: "cd-ys-1", type: "passport", label: "Austrian Passport — SIU Yat", submittedBy: "Client (directly)", submittedDate: "2026-04-10", status: "verified", fileDescription: "Republic of Austria passport. Name: SIU Yat. DOB: 01 JAN 1973. Passport No: P••••••12. Austrian citizenship. Valid through 2033.", verificationNotes: "Name matches HK Companies Registry (Fill Easy API) director records for Animoca Brands Limited and Outblaze Limited.", governmentAuthority: "Austrian Federal Ministry of the Interior" },
	{ id: "cd-ys-2", type: "other", label: "Hong Kong Identity Card — SIU Yat", submittedBy: "Client (directly)", submittedDate: "2026-04-10", status: "verified", fileDescription: "HKID card for SIU Yat. Permanent resident status confirmed. HKID No: A••••••(•).", verificationNotes: "HKID matches Immigration Department records cross-referenced via Companies Registry filings.", governmentAuthority: "HK Immigration Department" },
	{ id: "cd-ys-3", type: "incorporation-cert", label: "HK Companies Registry — Outblaze Limited (CR via Fill Easy)", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Certificate of Incorporation for Outblaze Limited (CR No. 0651683). Incorporated 1998 in Hong Kong. Directors: SIU Yat. Registered office: Wan Chai, HK.", verificationNotes: "100% verified — government authority. Fill Easy API returned exact match. Director name matches passport.", governmentAuthority: "Hong Kong Companies Registry (via Fill Easy API)" },
	{ id: "cd-ys-4", type: "annual-return", label: "Fill Easy API: ASIC — Animoca Brands Corporation Ltd", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "ASIC annual return for Animoca Brands Corporation Limited (ACN 122 921 813). Directors include SIU Yat. Registered in Victoria, Australia. Retrieved via Fill Easy CorpVerify API.", verificationNotes: "100% verified — government authority. Fill Easy CorpVerify returned ASIC exact match. Directorship and company registration confirmed.", governmentAuthority: "Australian Securities & Investments Commission (via Fill Easy CorpVerify)" },
	{ id: "cd-ys-5", type: "bank-statement", label: "HSBC Private Banking — HKD Account Statement", submittedBy: "Client (via HSBC HK)", submittedDate: "2026-04-15", status: "verified", fileDescription: "HSBC Private Banking statement for account ending ••7293. Period: Jan-Mar 2026. Shows salary credits from Animoca Brands, dividend income, and crypto exchange settlements.", verificationNotes: "Salary credits match ASX annual report executive remuneration disclosures. HSBC is HKMA-regulated institution.", governmentAuthority: "Hong Kong Monetary Authority (HKMA) — regulated institution" },
	{ id: "cd-ys-6", type: "property-deed", label: "Fill Easy API: HK Land Registry — Mid-Levels Residential Property", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Hong Kong Land Registry memorial for residential property in Mid-Levels. Owner: SIU Yat. Purchase completed 2005. Current estimated value per RVD index. Retrieved via Fill Easy property search API.", verificationNotes: "100% verified — government authority. Fill Easy API returned land registry memorial with registered owner and transaction history. RVD price index applied for current valuation.", governmentAuthority: "Hong Kong Land Registry (via Fill Easy API)" },
	{ id: "cd-ys-7", type: "incorporation-cert", label: "Fill Easy API: Animoca Brands Limited — HK CR Search", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "HK Companies Registry record for Animoca Brands Limited (CR No. 2283149). Incorporation date, registered office, directors (SIU Yat), secretary, annual returns.", verificationNotes: "100% verified — government authority. Fill Easy API exact match on company name and CR number.", governmentAuthority: "Hong Kong Companies Registry (via Fill Easy API)" },
	{ id: "cd-ys-8", type: "other", label: "Animoca Brands FY2024 Investor Update — $4.3B total assets", submittedBy: "Animoca Brands IR department", submittedDate: "2026-03-15", status: "verified", fileDescription: "FY2024 annual investor update: total assets $4.3B, cash + stablecoins $293M, digital assets $538M, minority investments $564M (540+ companies), off-balance sheet token reserves $2.9B. Total bookings $314M.", verificationNotes: "Company filing — not independently audited but cross-referenced against prior filings. Consistent with PitchBook and Bloomberg estimates.", governmentAuthority: "N/A (private company disclosure)" },
	{ id: "cd-ys-9", type: "other", label: "SEC Filing — Currenc Group (CURR) Reverse Merger with Animoca", submittedBy: "Client (via Davis Polk & Wardwell LLP)", submittedDate: "2025-11-10", status: "pending", fileDescription: "SEC filing for proposed reverse merger between Currenc Group Inc. (Nasdaq: CURR) and Animoca Brands. Animoca shareholders to receive 95% ownership. Target valuation ~$1B. Expected closing Q3 2026.", verificationNotes: "Filed with SEC. Subject to regulatory approval. Valuation significantly below last private round ($5.9B). If completed, will be Animoca's first public listing.", governmentAuthority: "U.S. Securities and Exchange Commission (SEC)" },
	{ id: "cd-ys-10", type: "other", label: "HKMA Stablecoin Issuer License — Anchorpoint Financial", submittedBy: "Anchorpoint Financial Ltd (via Standard Chartered)", submittedDate: "2025-02-20", status: "verified", fileDescription: "HKMA stablecoin issuer licence granted to Anchorpoint Financial (JV: Standard Chartered + HKT + Animoca Brands). Product: HKDAP (Hong Kong Dollar At Par). One of first two licences issued under HK stablecoin framework.", verificationNotes: "100% verified — government authority. HKMA public registry confirms licence.", governmentAuthority: "Hong Kong Monetary Authority (HKMA)" },
];

// ── Cross-References ───────────────────────────────────────────

const JACK_MA_CROSS_REFS: CrossReference[] = [
	{ id: "xr-jm-1", field: "Full Name", clientDocLabel: "PRC Passport", externalSourceLabel: "SEC Form F-1 (2014)", clientValue: "MA YUN (马云)", externalValue: "Ma Yun (Jack Ma)", match: "exact", confidence: 100, verifiedVia: "SEC EDGAR — government authority", notes: "English alias 'Jack Ma' confirmed in SEC filing" },
	{ id: "xr-jm-2", field: "Date of Birth", clientDocLabel: "PRC Passport", externalSourceLabel: "Forbes Billionaires Profile", clientValue: "10 SEP 1964", externalValue: "September 10, 1964", match: "exact", confidence: 100, verifiedVia: "Multiple independent sources" },
	{ id: "xr-jm-3", field: "BABA Shareholding", clientDocLabel: "Morgan Stanley Custody Confirmation", externalSourceLabel: "SEC 20-F Annual Report (2024)", clientValue: "~131M shares (4.5%)", externalValue: "4.5% beneficial ownership", match: "exact", confidence: 100, verifiedVia: "SEC EDGAR — government authority" },
	{ id: "xr-jm-4", field: "Dividend Income (Q1 2026)", clientDocLabel: "DBS Bank Statement", externalSourceLabel: "NYSE BABA Dividend Record", clientValue: "$3.2M received", externalValue: "$3.18M (131M shares × $0.0243)", match: "exact", confidence: 100, verifiedVia: "NYSE market data + bank records" },
	{ id: "xr-jm-5", field: "Trust Entity", clientDocLabel: "Fill Easy: ACRA — Ma Family Trust", externalSourceLabel: "FT Reporting — Share Transfer", clientValue: "Ma Family Trust Pte. Ltd. (UEN: 202312345A)", externalValue: "$2.4B BABA shares transferred (Apr 2023)", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (ACRA) — government authority" },
	{ id: "xr-jm-6", field: "HK Property", clientDocLabel: "Fill Easy: HK Land Registry — Victoria Peak", externalSourceLabel: "SCMP Property Investigation", clientValue: "15 Barker Road, The Peak — HK$1.5B", externalValue: "Victoria Peak mansion, HK$1.5B", match: "exact", confidence: 100, verifiedVia: "HK Land Registry via Fill Easy API — government authority" },
	{ id: "xr-jm-7", field: "Tax Filing Status", clientDocLabel: "PRC IIT Filing Summary", externalSourceLabel: "NBS Wage Data + SEC Compensation", clientValue: "IIT filed, Zhejiang Province", externalValue: "Alibaba HQ in Hangzhou, Zhejiang", match: "exact", confidence: 100, verifiedVia: "China STA — government authority" },
	{ id: "xr-jm-8", field: "Alibaba Registration", clientDocLabel: "Fill Easy: SAMR — Alibaba Group", externalSourceLabel: "SEC F-1 — Alibaba Group Holding", clientValue: "USCC: 91330100799999776H / Legal rep: 马云", externalValue: "Alibaba Group Holding Limited — CIK 0001577552", match: "exact", confidence: 100, verifiedVia: "Fill Easy China Cross-Border (SAMR) — government authority" },
	{ id: "xr-jm-9", field: "Alibaba HK Entity", clientDocLabel: "Fill Easy: HK CR — Alibaba Group (HK) Ltd", externalSourceLabel: "SEC 20-F — Subsidiary List", clientValue: "CR No. 1359598 — Alibaba Group (HK) Limited", externalValue: "Hong Kong subsidiary listed in 20-F Exhibit 8.1", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (HK CR) — government authority" },
	{ id: "xr-jm-10", field: "Bordeaux Vineyard", clientDocLabel: "French Land Registry — Château de Sours", externalSourceLabel: "SCMP Lifestyle Report", clientValue: "Château de Sours, 54 ha, Saint-Quentin-de-Baron", externalValue: "\"Jack Ma buys second Bordeaux vineyard\"", match: "partial", confidence: 70, verifiedVia: "French SPF + news cross-reference", notes: "Ownership via corporate entity — beneficial owner inferred from news reports, not directly named on French deed. Valuation uncertain." },
	{ id: "xr-jm-11", field: "New York Property", clientDocLabel: "Client self-declaration", externalSourceLabel: "NYC Dept of Finance — ACRIS", clientValue: "Reported luxury residence, Manhattan", externalValue: "No matching record found under MA YUN or known entities", match: "not-available", confidence: 20, verifiedVia: "NYC ACRIS search — no result", notes: "Client disclosed NYC property but no matching deed found in ACRIS under known name or entity variants. May be held via undisclosed LLC." },
	{ id: "xr-jm-12", field: "Ant Group Stake", clientDocLabel: "Client counsel disclosure", externalSourceLabel: "Reuters / WSJ — Post-restructuring reports", clientValue: "~10% personal stake in Ant Group", externalValue: "Ma ceded control; stake diluted to ~8% post-restructuring", match: "partial", confidence: 55, verifiedVia: "News sources — no official registry confirmation", notes: "Client claims 10% but post-restructuring dilution suggests ~8%. Ant Group is private with no mandatory disclosure — exact figure unverifiable." },
	{ id: "xr-jm-13", field: "Ant Group Credit Standing", clientDocLabel: "Fill Easy: SAMR — Ant Group Judicial Records", externalSourceLabel: "PBOC Restructuring Approval", clientValue: "SAMR status: Normal, judicial orders resolved", externalValue: "PBOC approved financial holding company status (Jul 2023)", match: "exact", confidence: 100, verifiedVia: "Fill Easy China Cross-Border (SAMR Judicial) — government authority" },
	{ id: "xr-jm-14", field: "Adirondack Estate", clientDocLabel: "Franklin County NY — New Brandon LLC deed", externalSourceLabel: "CNN Money / The Land Report", clientValue: "28,100 acres, Brandon Park, purchased May 2015 via New Brandon LLC", externalValue: "Jack Ma buys $23M Adirondack estate (28,100 acres)", match: "exact", confidence: 95, verifiedVia: "Franklin County deed records + news cross-reference", notes: "Ownership via corporate entity New Brandon LLC. Beneficial owner confirmed through corporate filings and multiple news reports." },
	{ id: "xr-jm-15", field: "Superyacht 'Zen'", clientDocLabel: "Maritime registry — M/Y Zen", externalSourceLabel: "SuperYachtFan / Vice / Asia Pacific Boating", clientValue: "88m Feadship (2021), est. $200M", externalValue: "Jack Ma spotted aboard Zen in Mallorca (2022-2023)", match: "exact", confidence: 85, verifiedVia: "Vessel registry + news photography", notes: "Ownership confirmed via vessel registry and multiple sightings. Exact purchase price not publicly disclosed — $200M is industry estimate." },
	{ id: "xr-jm-16", field: "Private Jet", clientDocLabel: "Aviation registry — VP-CZM", externalSourceLabel: "SuperYachtFan aviation tracking", clientValue: "Gulfstream G650ER, reg VP-CZM, owner Brilliant Sky Blue Ltd (Cayman)", externalValue: "Aircraft tracked to Hangzhou home base, linked to Ma", match: "exact", confidence: 90, verifiedVia: "Cayman Islands corporate registry + aviation tracking" },
	{ id: "xr-jm-17", field: "Singapore Properties", clientDocLabel: "Client counsel disclosure", externalSourceLabel: "Bloomberg Singapore property report", clientValue: "Good Class Bungalow + 3 Duxton Rd shophouses", externalValue: "Zhang Ying (Ma's wife) purchased — GCB ~S$40M, shophouses S$45-50M", match: "partial", confidence: 80, verifiedVia: "Bloomberg + Singapore property records", notes: "Properties held in wife's name (Zhang Ying, Singapore citizen). Beneficial ownership attributed to Ma household wealth but not personally titled." },
	{ id: "xr-jm-18", field: "Yunfeng Financial Holdings", clientDocLabel: "HKEX disclosure — Yunfeng Financial Group", externalSourceLabel: "SCMP / HKEX annual report", clientValue: "11.15% stake in HK-listed Yunfeng Financial", externalValue: "Yunfeng Financial purchased 10,000 ETH ($44M) Sept 2025", match: "exact", confidence: 100, verifiedVia: "HKEX mandatory disclosure — government authority" },
	{ id: "xr-jm-19", field: "Blue Pool Capital AUM", clientDocLabel: "Client family office disclosure", externalSourceLabel: "CBInsights / Financial Times", clientValue: "Co-founder of Blue Pool Capital, manages family wealth", externalValue: "AUM $50B+ as of 2022, Riverside Fund raised $1B (2025)", match: "partial", confidence: 60, verifiedVia: "Industry databases — AUM not officially disclosed", notes: "Blue Pool Capital is a private family office with no mandatory AUM disclosure. $50B+ figure from industry estimates." },
];

const YAT_SIU_CROSS_REFS: CrossReference[] = [
	{ id: "xr-ys-1", field: "Full Name", clientDocLabel: "Austrian Passport", externalSourceLabel: "Fill Easy: HK CR — Animoca Brands Ltd", clientValue: "SIU Yat", externalValue: "SIU Yat — Director", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (HK CR) — government authority" },
	{ id: "xr-ys-2", field: "HKID", clientDocLabel: "Hong Kong Identity Card", externalSourceLabel: "Fill Easy: HK CR — Director Record", clientValue: "A••••••(•)", externalValue: "HKID on file with CR", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (HK CR) — government authority" },
	{ id: "xr-ys-3", field: "Outblaze Directorship", clientDocLabel: "Fill Easy: HK CR — Outblaze Limited", externalSourceLabel: "IBM Acquisition Press Release", clientValue: "Director since 1998", externalValue: "Founder/CEO — selling party", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (HK CR) — government authority" },
	{ id: "xr-ys-4", field: "Animoca Brands Directorship", clientDocLabel: "Fill Easy: HK CR — Animoca Brands Ltd", externalSourceLabel: "Fill Easy: ASIC — Animoca Brands Corp", clientValue: "Director — CR No. 2283149", externalValue: "Director — ACN 122 921 813", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify — dual registry (HK CR + ASIC)" },
	{ id: "xr-ys-5", field: "Salary Income", clientDocLabel: "HSBC Bank Statement", externalSourceLabel: "ASX Annual Report — Remuneration", clientValue: "HK$425,000/month salary credit", externalValue: "AU$780,000 p.a. chairman remuneration", match: "exact", confidence: 100, verifiedVia: "ASX filing + HKMA-regulated bank" },
	{ id: "xr-ys-6", field: "Property Ownership", clientDocLabel: "Fill Easy: HK Land Registry — Mid-Levels", externalSourceLabel: "RVD Property Price Index", clientValue: "Owner: SIU Yat, purchased 2005", externalValue: "Mid-Levels Class D index: +85% since 2005", match: "exact", confidence: 100, verifiedVia: "HK Land Registry via Fill Easy API — government authority" },
	{ id: "xr-ys-7", field: "Austrian Citizenship", clientDocLabel: "Austrian Passport", externalSourceLabel: "Fill Easy: ASIC — Director Records", clientValue: "Austrian national", externalValue: "Nationality: Austria", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (ASIC) — government authority" },
	{ id: "xr-ys-8", field: "SAND Token Holdings", clientDocLabel: "Client self-declaration", externalSourceLabel: "CoinGecko + On-chain Wallet Analysis", clientValue: "~150M SAND tokens (founder allocation)", externalValue: "Wallets linked to Animoca hold ~120-180M SAND", match: "partial", confidence: 55, verifiedVia: "On-chain analysis — wallet attribution probabilistic", notes: "Founder/team allocation confirmed by token contract but exact personal portion vs. company holdings unclear. Wallet clustering suggests range." },
	{ id: "xr-ys-9", field: "NFT Portfolio Value", clientDocLabel: "Client self-declaration", externalSourceLabel: "DappRadar Portfolio Tracker", clientValue: "$50M estimated (personal collection)", externalValue: "Floor price aggregate: ~$12-18M", match: "mismatch", confidence: 25, verifiedVia: "DappRadar floor price methodology", notes: "Client's self-assessed NFT value ($50M) significantly exceeds market floor prices ($12-18M). NFT valuations are illiquid and subjective. Last sold comparables suggest 60-75% markdown from client estimate." },
	{ id: "xr-ys-10", field: "Animoca Brands Valuation", clientDocLabel: "Client counsel (investor deck)", externalSourceLabel: "PitchBook Secondary Market Data", clientValue: "$5.9B (last funding round, Jan 2022)", externalValue: "Secondary trades imply $2.5-3.5B (30-50% discount)", match: "partial", confidence: 45, verifiedVia: "PitchBook private secondary market", notes: "Last round valuation ($5.9B) has not been tested by a subsequent round. Secondary market estimates suggest significant discount. No IPO or down-round to establish current fair value." },
	{ id: "xr-ys-11", field: "IBM Acquisition Proceeds", clientDocLabel: "Fill Easy: HK CR — Outblaze Limited", externalSourceLabel: "IBM Press Release (2009)", clientValue: "Messaging division sold — est. $10-20M", externalValue: "IBM confirms acquisition, no price disclosed", match: "partial", confidence: 70, verifiedVia: "IBM newsroom + HK CR records", notes: "IBM confirmed the acquisition but never disclosed the price. Range of $10-20M is inferred from industry comparables and media reports. Exact figure unverifiable." },
	{ id: "xr-ys-12", field: "TinyTap Acquisition", clientDocLabel: "Animoca press release — TinyTap", externalSourceLabel: "CoinDesk / The Block reporting", clientValue: "80.45% stake for $38.875M (cash + shares)", externalValue: "Animoca acquires TinyTap for $38.9M, later raised at $100M", match: "exact", confidence: 90, verifiedVia: "Company filings + news cross-reference" },
	{ id: "xr-ys-13", field: "MOCA Token Raise", clientDocLabel: "CoinList token sale records", externalSourceLabel: "Animoca Brands investor update", clientValue: "$29.3M raised, 12x oversubscribed", externalValue: "MOCA launched July 2024, ATH $0.48, current ~$0.014", match: "exact", confidence: 85, verifiedVia: "CoinList platform + on-chain data" },
	{ id: "xr-ys-14", field: "Nasdaq Reverse Merger", clientDocLabel: "SEC filing — Currenc Group (CURR)", externalSourceLabel: "Bloomberg / CoinDesk reporting", clientValue: "Filed Nov 2025, Animoca shareholders get 95%", externalValue: "Target ~$1B valuation, expected Q3 2026 close", match: "exact", confidence: 80, verifiedVia: "SEC filings + news cross-reference", notes: "Merger subject to regulatory approval and market conditions. Valuation significantly below last private round ($5.9B). If completed, first public listing for Animoca." },
	{ id: "xr-ys-15", field: "Lympo Hack Loss", clientDocLabel: "Animoca subsidiary disclosure", externalSourceLabel: "Cointelegraph / blockchain records", clientValue: "Lympo acquired for $2.88M (2020)", externalValue: "Hot wallet hacked Jan 2022 — $18.7M in LMT tokens stolen", match: "mismatch", confidence: 95, verifiedVia: "On-chain transaction records", notes: "Hack loss ($18.7M) exceeded acquisition cost ($2.88M) by 6.5x. Demonstrates crypto subsidiary security risk. LMT crashed 92% in 12 hours." },
	{ id: "xr-ys-16", field: "REVV Token Value", clientDocLabel: "CoinGecko market data", externalSourceLabel: "On-chain analysis", clientValue: "REVV ATH: $0.63, market cap $169K current", externalValue: "Effectively near-zero — 99.97% decline from ATH", match: "exact", confidence: 95, verifiedVia: "CoinGecko + on-chain data", notes: "REVV token is effectively defunct. Total market cap under $200K. Illustrates tail risk in subsidiary token allocations." },
	{ id: "xr-ys-17", field: "Anchorpoint Stablecoin License", clientDocLabel: "HKMA public registry", externalSourceLabel: "Standard Chartered press release", clientValue: "HKMA stablecoin issuer licence granted (Feb 2025)", externalValue: "JV with Standard Chartered + HKT to issue HKDAP", match: "exact", confidence: 100, verifiedVia: "HKMA — government authority" },
];

// ── Document Upload Slots ──────────────────────────────────────

const UPLOAD_SLOTS: DocumentUploadSlot[] = [
	{ id: "up-1", type: "tax-return", label: "Tax Returns (Latest 3 Years)", description: "Individual income tax returns from all jurisdictions. Required for income verification and cross-referencing.", required: true, status: "uploaded" },
	{ id: "up-2", type: "bank-statement", label: "Bank Statements (6 Months)", description: "Statements from all primary banking relationships. Used for income flow verification and dividend cross-check.", required: true, status: "uploaded" },
	{ id: "up-3", type: "share-certificate", label: "Share Certificates / Custody Confirmations", description: "Brokerage or custodian confirmations for all equity holdings. Required for ownership verification.", required: true, status: "uploaded" },
	{ id: "up-4", type: "property-valuation", label: "Professional Property Valuations", description: "Recent RICS or equivalent professional valuations for all real property. Replaces self-assessment values.", required: false, status: "pending" },
	{ id: "up-5", type: "trust-documents", label: "Trust / Foundation Documents", description: "Trust deeds, letters of wishes, and beneficiary declarations. Required if wealth held via trust structures.", required: false, status: "uploaded" },
	{ id: "up-6", type: "corporate-structure", label: "Corporate Structure Chart", description: "Organizational chart showing all corporate entities, subsidiaries, and SPVs with ownership percentages.", required: false, status: "pending" },
	{ id: "up-7", type: "crypto-wallet", label: "Crypto Wallet Attestations", description: "Signed messages proving control of wallets, or exchange custody confirmations. Required for crypto holdings.", required: false, status: "optional" },
	{ id: "up-8", type: "source-of-funds", label: "Source of Initial Funds Declaration", description: "Signed declaration explaining the origin of initial capital used to build wealth. Required for compliance.", required: true, status: "uploaded" },
];

// ── James Chen Wei: Sources ────────────────────────────────────

const SRC_CHEN: Record<string, SourceCitation> = {
	masLicensing: {
		id: "cw1", label: "MAS Capital Markets Services Licence — Meridian Capital Partners", url: "https://eservices.mas.gov.sg/fid", date: "2000-06-15", type: "filing",
		...srcMeta("mas.gov.sg", "MAS | Financial Institutions Directory — Meridian Capital Partners Pte. Ltd.", "MAS Financial Institutions Directory record for Meridian Capital Partners Pte. Ltd. Capital Markets Services licence holder. CMS licence number CMS100••••. Fund management category. Licence active from 2000.", "#003366"),
	},
	acraRegistry: {
		id: "cw2", label: "Fill Easy API: Singapore ACRA — Meridian Capital Partners Pte. Ltd.", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | CorpVerify — Singapore ACRA BizFile+ — Meridian Capital Partners", "Fill Easy CorpVerify API query result for Singapore ACRA BizFile+. Entity: Meridian Capital Partners Pte. Ltd. UEN: 200012345D. Incorporated 2000-06-01. Directors: CHEN Wei, DAVID Tan. Registered at 1 Raffles Place. Filing status current.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Singapore ACRA — BizFile+ (via Fill Easy CorpVerify)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Entity Name", value: "Meridian Capital Partners Pte. Ltd." },
				{ label: "UEN", value: "200012345D" },
				{ label: "Entity Type", value: "Private Company Limited by Shares" },
			],
			jurisdiction: "Republic of Singapore",
			searchType: "Entity Name / UEN Search (via Fill Easy CorpVerify)",
		},
	},
	acraFamilyOffice: {
		id: "cw3", label: "Fill Easy API: Singapore ACRA — Chen Wei Family Office Pte. Ltd.", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | CorpVerify — Singapore ACRA BizFile+ — Chen Wei Family Office", "Fill Easy CorpVerify API query result for Singapore ACRA BizFile+. Entity: Chen Wei Family Office Pte. Ltd. UEN: 201012345G. Incorporated 2010-03-15. Sole director: CHEN Wei. Registered at 8 Marina View. Filing status current.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Singapore ACRA — BizFile+ (via Fill Easy CorpVerify)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Entity Name", value: "Chen Wei Family Office Pte. Ltd." },
				{ label: "UEN", value: "201012345G" },
				{ label: "Entity Type", value: "Exempt Private Company" },
			],
			jurisdiction: "Republic of Singapore",
			searchType: "Entity Name / UEN Search (via Fill Easy CorpVerify)",
		},
	},
	sgxListings: {
		id: "cw4", label: "SGX: Meridian Capital exit — Singha Logistics IPO ($420M)", url: "https://www.sgx.com/", date: "2007-11-15", type: "market-data",
		...srcMeta("sgx.com", "SGX | Singha Logistics Holdings — IPO Prospectus", "SGX listing prospectus for Singha Logistics Holdings Pte Ltd. IPO raised S$560M ($420M). Pre-IPO investor Meridian Capital Partners held 12% stake, acquired at Series A in 2003. Lockup period 6 months.", "#003366"),
	},
	irasFilings: {
		id: "cw5", label: "IRAS Tax Filing — Chen Wei Individual Income Tax (YA 2025)", url: "https://www.iras.gov.sg/", type: "public-record",
		...srcMeta("iras.gov.sg", "IRAS | myTax Portal — Individual Income Tax Filing Confirmation", "Inland Revenue Authority of Singapore myTax Portal filing confirmation for Chen Wei. Year of Assessment 2025. Employment income, dividend income, and capital gains declared. Tax residency: Singapore.", "#cc0000"),
	},
	goldmanSachsSG: {
		id: "cw6", label: "Goldman Sachs Singapore — Employment Verification (1990-2000)", url: "https://www.goldmansachs.com/", date: "2000-06-01", type: "public-record",
		...srcMeta("goldmansachs.com", "Goldman Sachs | Human Resources — Employment Verification", "Goldman Sachs Singapore employment verification letter for CHEN Wei. Dates of employment: July 1990 to June 2000. Final title: Managing Director, Investment Banking Division. Compensation details referenced in confidential HR records.", "#003087"),
	},
	sgLandAuthority: {
		id: "cw7", label: "Fill Easy API: SLA — Sentosa Cove Property Record", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | Singapore Land Authority — Property Search — Sentosa Cove", "Fill Easy API property search result for Singapore Land Authority. Sentosa Cove waterfront bungalow. Lot area 15,000 sq ft. Owner: CHEN Wei. Purchase date: 2012. Current valuation per URA market data.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Singapore Land Authority (via Fill Easy API)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Owner Name", value: "CHEN Wei" },
				{ label: "Property Address", value: "Sentosa Cove, Singapore" },
				{ label: "Search Type", value: "Owner Name Search" },
			],
			jurisdiction: "Republic of Singapore",
			searchType: "Property Owner Search (via Fill Easy API)",
		},
	},
	sgLandOrchard: {
		id: "cw8", label: "Fill Easy API: SLA — Nassim Road Good Class Bungalow", url: "https://www.filleasy.hk/", type: "registry",
		...srcMeta("filleasy.hk", "Fill Easy | Singapore Land Authority — Property Search — Nassim Road", "Fill Easy API property search result for Singapore Land Authority. Nassim Road Good Class Bungalow. Land area 20,000 sq ft. Owner: CHEN Wei. Purchase date: 2015. URA transaction records confirmed.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Singapore Land Authority (via Fill Easy API)",
			registryUrl: "https://www.filleasy.hk/",
			searchFields: [
				{ label: "Owner Name", value: "CHEN Wei" },
				{ label: "Property Address", value: "Nassim Road, Singapore" },
				{ label: "Search Type", value: "Owner Name Search" },
			],
			jurisdiction: "Republic of Singapore",
			searchType: "Property Owner Search (via Fill Easy API)",
		},
	},
	masNotice: {
		id: "cw9", label: "MAS Notice 626 — Compliance Filing for Chen Wei Family Office", url: "https://www.mas.gov.sg/regulation/notices/notice-626", type: "filing",
		...srcMeta("mas.gov.sg", "MAS | Notice 626 — AML/CFT Compliance for Family Offices", "MAS regulatory compliance filing for Chen Wei Family Office Pte. Ltd. under Notice 626. Enhanced CDD documentation submitted. SOW declaration accepted. Compliance status: Satisfactory.", "#003366"),
	},
	dbsWealth: {
		id: "cw10", label: "DBS Private Banking — Portfolio Statement (Q1 2026)", url: "https://www.dbs.com.sg/private-banking/", type: "public-record",
		...srcMeta("dbs.com.sg", "DBS Private Banking | Quarterly Portfolio Statement — Chen Wei", "DBS Private Banking quarterly portfolio statement for Chen Wei. Period: Jan-Mar 2026. Blue-chip equity holdings (DBS, OCBC, SGX, Singtel), fixed income positions, PE fund distributions, and dividend income.", "#e60012"),
	},
	sgxBlueChip: {
		id: "cw11", label: "SGX: Blue-chip equity portfolio — DBS, OCBC, UOB, Singtel", url: "https://www.sgx.com/", type: "market-data",
		...srcMeta("sgx.com", "SGX | Market Data — Straits Times Index Components", "SGX market data for Straits Times Index blue-chip constituents. DBS Group Holdings, OCBC Bank, UOB, Singtel, CapitaLand Investment — all held in Chen Wei Family Office portfolio per DBS custody records.", "#003366"),
	},
	forbesSGWealth: {
		id: "cw12", label: "Forbes Singapore Rich List — Chen Wei (#78)", url: "https://www.forbes.com/lists/singapore-billionaires/", date: "2025-08-01", type: "estimate",
		...srcMeta("forbes.com", "Forbes | Singapore's 50 Richest 2025", "Forbes Singapore wealth list showing Chen Wei ranked #78 with estimated net worth of S$510M (~$380M USD). Source of wealth: Private equity, family office investments.", "#c4112f"),
	},
	meritisExit: {
		id: "cw13", label: "Business Times: Meridian Capital exits Meritis Healthcare at 4.2x", url: "https://www.businesstimes.com.sg/", date: "2006-03-20", type: "news",
		...srcMeta("businesstimes.com.sg", "Meridian Capital Exits Meritis Healthcare at 4.2x Return | Business Times", "Business Times Singapore reporting on Meridian Capital Partners' exit from Meritis Healthcare Holdings at 4.2x multiple on invested capital. Entry at $12M (2002), exit at $50.4M via trade sale to IHH Healthcare.", "#003d7a"),
	},
	uraPropertyData: {
		id: "cw14", label: "URA Property Transaction Data — Districts 9, 10, Sentosa", url: "https://www.ura.gov.sg/realEstateIIWeb/", type: "public-record",
		...srcMeta("ura.gov.sg", "URA | Real Estate Information System — Private Property Transactions", "Urban Redevelopment Authority property transaction database showing private residential transactions in prime districts (9, 10, Sentosa). Used to verify Chen Wei property valuations against market benchmarks.", "#003366"),
	},
};

// ── James Chen Wei: Career Timeline ────────────────────────────

const CHEN_WEI_CAREER: CareerPhase[] = [
	{
		id: "cw-1", title: "Goldman Sachs Singapore", organization: "Goldman Sachs (Singapore) Pte. Ltd.", role: "Analyst → Managing Director",
		startYear: 1990, endYear: 2000, location: "Singapore",
		description: "Joined Goldman Sachs Singapore as an analyst in the Investment Banking Division after graduating from NUS with First Class Honours in Economics. Rose through the ranks over a decade to Managing Director, specialising in Southeast Asia M&A and capital markets. Accumulated approximately $18M in total compensation through salary, bonuses, and deferred equity.",
		categories: [
			{ category: "income", claims: [
				{ id: "cw1-1", description: "Goldman Sachs cumulative compensation 1990-2000 (salary, bonuses, deferred equity — verified via GS HR records and IRAS filings)", estimatedValueUSD: 18_000_000, confidence: 95, savingRate: 55, sources: [SRC_CHEN.goldmanSachsSG, SRC_CHEN.irasFilings] },
			], subtotalUSD: 18_000_000, avgConfidence: 95 },
		],
		phaseWealthUSD: 18_000_000, cumulativeWealthUSD: 18_000_000,
		keyEvents: ["1990: Joined Goldman Sachs Singapore as analyst", "1995: Promoted to Vice President", "1998: Promoted to Managing Director", "2000: Departed to co-found Meridian Capital Partners"],
	},
	{
		id: "cw-2", title: "Meridian Capital Partners", organization: "Meridian Capital Partners Pte. Ltd.", role: "Co-Founder & Managing Partner",
		startYear: 2000, endYear: 2010, location: "Singapore",
		description: "Co-founded Meridian Capital Partners, a private equity firm focused on Southeast Asian mid-market companies. Raised Fund I ($200M, 2001) and Fund II ($500M, 2005). Achieved several successful exits including Meritis Healthcare (4.2x), Singha Logistics (IPO, 3.8x), and Pacific Minerals (2.5x). AUM grew to $2B by 2008. Chen Wei's carried interest and co-investment returns totalled approximately $85M over the decade.",
		categories: [
			{ category: "income", claims: [
				{ id: "cw2-1", description: "Management fees and salary at Meridian Capital (2% annual on AUM, co-founder share — MAS CMS licence records)", estimatedValueUSD: 12_000_000, confidence: 90, savingRate: 65, sources: [SRC_CHEN.masLicensing, SRC_CHEN.irasFilings] },
			], subtotalUSD: 12_000_000, avgConfidence: 90 },
			{ category: "companies", claims: [
				{ id: "cw2-2", description: "Carried interest from Meridian Capital Fund I & II (20% carry on $200M and $500M funds, multiple successful exits — ACRA filings, SGX records)", estimatedValueUSD: 65_000_000, confidence: 85, sources: [SRC_CHEN.acraRegistry, SRC_CHEN.sgxListings, SRC_CHEN.meritisExit, SRC_CHEN.masLicensing] },
			], subtotalUSD: 65_000_000, avgConfidence: 85 },
			{ category: "investments", claims: [
				{ id: "cw2-3", description: "Personal co-investments in Meridian portfolio companies (GP co-invest alongside fund)", estimatedValueUSD: 20_000_000, confidence: 80, sources: [SRC_CHEN.acraRegistry, SRC_CHEN.sgxListings] },
			], subtotalUSD: 20_000_000, avgConfidence: 80 },
		],
		phaseWealthUSD: 97_000_000, cumulativeWealthUSD: 115_000_000,
		keyEvents: ["2000: Co-founded Meridian Capital Partners, MAS CMS licence obtained", "2001: Fund I ($200M) closed", "2002: Invested in Meritis Healthcare ($12M)", "2005: Fund II ($500M) closed", "2006: Meritis Healthcare exit at 4.2x ($50.4M)", "2007: Singha Logistics IPO on SGX at 3.8x", "2008: AUM reaches $2B"],
	},
	{
		id: "cw-3", title: "Family Office Establishment", organization: "Chen Wei Family Office Pte. Ltd.", role: "Founder & Chief Investment Officer",
		startYear: 2010, endYear: 2020, location: "Singapore",
		description: "Established Chen Wei Family Office to manage personal and family wealth of approximately $150M. Diversified across Singapore real estate (Sentosa Cove waterfront bungalow, Nassim Road GCB), blue-chip equities (SGX-listed banks and REITs), PE fund-of-funds, and fixed income. Conservative allocation focused on capital preservation and steady income generation. Grew portfolio to approximately $300M by 2020.",
		categories: [
			{ category: "investments", claims: [
				{ id: "cw3-1", description: "Blue-chip equity portfolio (DBS, OCBC, UOB, Singtel, CapitaLand) — SGX market data and DBS custody records", estimatedValueUSD: 85_000_000, confidence: 90, sources: [SRC_CHEN.sgxBlueChip, SRC_CHEN.dbsWealth] },
				{ id: "cw3-2", description: "PE fund-of-funds allocations (co-investments with Temasek-linked funds and established GPs)", estimatedValueUSD: 45_000_000, confidence: 80, sources: [SRC_CHEN.acraFamilyOffice, SRC_CHEN.masNotice] },
				{ id: "cw3-3", description: "Fixed income portfolio (Singapore government bonds, investment-grade corporate bonds)", estimatedValueUSD: 40_000_000, confidence: 95, sources: [SRC_CHEN.dbsWealth, SRC_CHEN.masNotice] },
			], subtotalUSD: 170_000_000, avgConfidence: 88 },
			{ category: "alternatives", claims: [
				{ id: "cw3-4", description: "Sentosa Cove waterfront bungalow (purchased 2012, S$18M — Fill Easy SLA confirmed)", estimatedValueUSD: 15_000_000, confidence: 95, sources: [SRC_CHEN.sgLandAuthority, SRC_CHEN.uraPropertyData] },
				{ id: "cw3-5", description: "Nassim Road Good Class Bungalow (purchased 2015, S$38M — Fill Easy SLA confirmed)", estimatedValueUSD: 32_000_000, confidence: 95, sources: [SRC_CHEN.sgLandOrchard, SRC_CHEN.uraPropertyData] },
			], subtotalUSD: 47_000_000, avgConfidence: 95 },
			{ category: "income", claims: [
				{ id: "cw3-6", description: "Dividend and interest income from portfolio (2010-2020, IRAS filings)", estimatedValueUSD: 25_000_000, confidence: 90, savingRate: 90, sources: [SRC_CHEN.irasFilings, SRC_CHEN.dbsWealth] },
			], subtotalUSD: 25_000_000, avgConfidence: 90 },
		],
		phaseWealthUSD: 242_000_000, cumulativeWealthUSD: 300_000_000,
		keyEvents: ["2010: Chen Wei Family Office established (ACRA registered)", "2012: Acquired Sentosa Cove waterfront bungalow (S$18M)", "2013: Portfolio allocation formalised — 40% equities, 25% PE, 20% fixed income, 15% real estate", "2015: Acquired Nassim Road GCB (S$38M)", "2018: Family office AUM reaches $250M"],
	},
	{
		id: "cw-4", title: "Current Wealth Management", organization: "Chen Wei Family Office Pte. Ltd.", role: "Founder & CIO",
		startYear: 2020, endYear: null, location: "Singapore",
		description: "Continued conservative wealth management through COVID-19 and market volatility. Portfolio weathered downturns well due to defensive allocation. Increased fixed income weighting during 2022 rate hikes. Current net worth approximately $380M, primarily in Singapore real estate (appreciated significantly), blue-chip equities, PE fund stakes, and fixed income. No crypto exposure, no leveraged positions, no controversial assets.",
		categories: [
			{ category: "investments", claims: [
				{ id: "cw4-1", description: "Blue-chip equity portfolio — SGX-listed banks, REITs, and Straits Times Index components (DBS custody confirmed)", estimatedValueUSD: 110_000_000, confidence: 92, sources: [SRC_CHEN.sgxBlueChip, SRC_CHEN.dbsWealth] },
				{ id: "cw4-2", description: "PE fund-of-funds and co-investment stakes (legacy Meridian + new commitments, MAS-regulated)", estimatedValueUSD: 55_000_000, confidence: 82, sources: [SRC_CHEN.acraFamilyOffice, SRC_CHEN.masNotice, SRC_CHEN.masLicensing] },
				{ id: "cw4-3", description: "Fixed income — SG government bonds, investment-grade corporate (DBS custody + MAS)", estimatedValueUSD: 65_000_000, confidence: 95, sources: [SRC_CHEN.dbsWealth, SRC_CHEN.masNotice] },
			], subtotalUSD: 230_000_000, avgConfidence: 90 },
			{ category: "alternatives", claims: [
				{ id: "cw4-4", description: "Sentosa Cove waterfront bungalow (current valuation S$28M, appreciated from S$18M — URA data + Fill Easy SLA)", estimatedValueUSD: 21_000_000, confidence: 92, sources: [SRC_CHEN.sgLandAuthority, SRC_CHEN.uraPropertyData] },
				{ id: "cw4-5", description: "Nassim Road Good Class Bungalow (current valuation S$55M, appreciated from S$38M — URA data + Fill Easy SLA)", estimatedValueUSD: 41_000_000, confidence: 92, sources: [SRC_CHEN.sgLandOrchard, SRC_CHEN.uraPropertyData] },
			], subtotalUSD: 62_000_000, avgConfidence: 92 },
			{ category: "income", claims: [
				{ id: "cw4-6", description: "Annual dividend and interest income (~$6-8M/year, IRAS filed)", estimatedValueUSD: 28_000_000, confidence: 90, savingRate: 90, sources: [SRC_CHEN.irasFilings, SRC_CHEN.dbsWealth] },
				{ id: "cw4-re1", description: "Rental income from Sentosa Cove bungalow (partially leased, URA transaction data)", estimatedValueUSD: 1_200_000, confidence: 85, savingRate: 90, sources: [SRC_CHEN.sgLandAuthority, SRC_CHEN.uraPropertyData] },
			], subtotalUSD: 29_200_000, avgConfidence: 88 },
			{ category: "companies", claims: [
				{ id: "cw4-7", description: "Residual GP interest in Meridian Capital (legacy carried interest distributions, ACRA verified)", estimatedValueUSD: 15_000_000, confidence: 85, sources: [SRC_CHEN.acraRegistry, SRC_CHEN.masLicensing] },
				{ id: "cw4-8", description: "Chen Wei Family Office entity value (operating entity + cash reserves)", estimatedValueUSD: 45_000_000, confidence: 88, sources: [SRC_CHEN.acraFamilyOffice, SRC_CHEN.dbsWealth] },
			], subtotalUSD: 60_000_000, avgConfidence: 87 },
		],
		phaseWealthUSD: 380_000_000, cumulativeWealthUSD: 380_000_000,
		keyEvents: ["2020: Conservative positioning protects portfolio during COVID-19 downturn", "2022: Increased fixed income allocation during rate hiking cycle", "2024: Net worth reaches $380M per Forbes Singapore Rich List", "2025: MAS compliance review — satisfactory rating", "2026: Full SOW assessment completed — Grade A corroboration"],
	},
];

// ── James Chen Wei: Narrative ──────────────────────────────────

const CHEN_WEI_NARRATIVE = `James Chen Wei's wealth profile represents a textbook example of well-documented, conservative wealth accumulation through traditional financial services and private equity. His estimated net worth of $380M is traceable through a clear career trajectory: a decade at Goldman Sachs Singapore rising to Managing Director ($18M cumulative compensation), followed by the co-founding of Meridian Capital Partners ($85M in carried interest and management fees from two successful PE funds with AUM reaching $2B), and subsequent establishment of the Chen Wei Family Office in 2010.

The family office manages a conservatively allocated portfolio: approximately 30% in SGX-listed blue-chip equities (DBS, OCBC, UOB, Singtel), 17% in fixed income (Singapore government and investment-grade corporate bonds), 14% in PE fund-of-funds, and 16% in prime Singapore real estate (Sentosa Cove waterfront bungalow and Nassim Road Good Class Bungalow, both verified via [SLA Property](https://www.sla.gov.sg/) search). There is no exposure to cryptocurrency, speculative assets, or leveraged positions.

All material wealth sources are verified through government authorities: [MAS Financial Institutions Directory](https://eservices.mas.gov.sg/fid) licence records for Meridian Capital, IRAS individual income tax filings, Singapore [ACRA BizFile](https://www.bizfile.gov.sg/) registrations for both Meridian and the family office (retrieved via Fill Easy CorpVerify), [SLA](https://www.sla.gov.sg/) property records (via Fill Easy API), and DBS Private Banking custody confirmations. The assessment draws on 14 independent data sources, all within a single jurisdiction (Singapore), eliminating cross-border complexity. Chen Wei is not a PEP, has zero sanctions hits, zero adverse media findings, and no controversial associations.`;

// ── James Chen Wei: Key Parameters ─────────────────────────────

const CHEN_WEI_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "Very High — career trajectory from Goldman Sachs to PE to family office clearly explains $380M", status: "normal" },
	{ label: "Source Diversity", value: "14 sources across MAS, ACRA, IRAS, SLA, SGX — all government or regulated institutions (Fill Easy multi-registry)", status: "normal" },
	{ label: "Overall Confidence", value: `${overallConfidence(CHEN_WEI_CAREER)}%`, status: "normal" },
	{ label: "Regulatory Exposure", value: "None — clean MAS compliance record, no regulatory actions or fines", status: "normal" },
	{ label: "PEP Status", value: "Clear — no PEP matches, no political exposure", status: "normal" },
	{ label: "Wealth Volatility", value: "Low — conservative portfolio with no crypto, no leveraged positions", status: "normal" },
];

// ── James Chen Wei: Data Sources ───────────────────────────────

const CHEN_WEI_SOURCES: DataSourceDef[] = [
	{ id: "ds-cw-1", name: "MAS Financial Institutions Directory — CMS Licence", provider: "Monetary Authority of Singapore", category: "Regulatory Filings", delayMs: 1200 },
	{ id: "ds-cw-2", name: "Fill Easy — Singapore ACRA Registry Search", provider: "Fill Easy Ltd / SG ACRA", category: "Corporate Registry", delayMs: 1500 },
	{ id: "ds-cw-3", name: "SGX Historical Market Data", provider: "Singapore Exchange", category: "Market Data", delayMs: 1100 },
	{ id: "ds-cw-4", name: "IRAS Individual Income Tax Records", provider: "Inland Revenue Authority of Singapore", category: "Tax Records", delayMs: 1600 },
	{ id: "ds-cw-5", name: "Fill Easy — SLA Property Records Search", provider: "Fill Easy Ltd / SG SLA", category: "Property Records", delayMs: 1400 },
	{ id: "ds-cw-6", name: "URA Property Transaction Data", provider: "Urban Redevelopment Authority", category: "Property Records", delayMs: 1300 },
	{ id: "ds-cw-7", name: "DBS Private Banking — Custody Records", provider: "DBS Bank (MAS-regulated)", category: "Banking Records", delayMs: 1000 },
	{ id: "ds-cw-8", name: "Forbes Singapore Rich List", provider: "Forbes Media", category: "Wealth Estimates", delayMs: 800 },
	{ id: "ds-cw-9", name: "OFAC / EU / UN Sanctions Lists", provider: "Multi-jurisdictional", category: "Sanctions Screening", delayMs: 900 },
	{ id: "ds-cw-10", name: "PEP Database (Global)", provider: "World-Check / Dow Jones", category: "PEP Screening", delayMs: 1100 },
	{ id: "ds-cw-11", name: "Dow Jones Adverse Media Screening", provider: "Dow Jones Risk & Compliance", category: "Adverse Media", delayMs: 1400 },
	{ id: "ds-cw-12", name: "Goldman Sachs — Employment Verification", provider: "Goldman Sachs (Singapore)", category: "Employment Records", delayMs: 1700 },
	{ id: "ds-cw-13", name: "MAS Notice 626 — Compliance Filings", provider: "Monetary Authority of Singapore", category: "Regulatory Filings", delayMs: 1200 },
	{ id: "ds-cw-14", name: "Business Times Singapore — Media Archive", provider: "Singapore Press Holdings", category: "Media Records", delayMs: 900 },
];

// ── James Chen Wei: Company Nodes ──────────────────────────────

const CHEN_WEI_COMPANIES: CompanyNode[] = [
	{
		name: "Chen Wei Family Office Pte. Ltd.", role: "Founder & CIO", ownership: "100%", status: "active", valuation: "$380M AUM",
		type: "holding", jurisdiction: "Singapore",
		children: [
			{ name: "Blue-chip equity portfolio", role: "SGX-listed banks, REITs (DBS, OCBC, UOB, Singtel)", status: "active", type: "investment", jurisdiction: "Singapore", valuation: "$110M" },
			{ name: "Fixed income portfolio", role: "SG government bonds + investment-grade corporate", status: "active", type: "investment", jurisdiction: "Singapore", valuation: "$65M" },
			{ name: "PE fund-of-funds", role: "Commitments to Temasek-linked and established GPs", status: "active", type: "fund", jurisdiction: "Singapore", valuation: "$55M" },
			{ name: "Cash and liquid reserves", role: "DBS Private Banking deposits", status: "active", type: "investment", jurisdiction: "Singapore", valuation: "$45M" },
		],
	},
	{
		name: "Meridian Capital Partners Pte. Ltd.", role: "Co-Founder & Former Managing Partner", ownership: "Co-GP interest", status: "active", valuation: "AUM $2B (legacy)",
		type: "fund", jurisdiction: "Singapore",
		children: [
			{ name: "Fund I ($200M, 2001)", role: "Fully realised — 2.8x net MOIC", status: "exited", type: "fund", jurisdiction: "Singapore" },
			{ name: "Fund II ($500M, 2005)", role: "Fully realised — 2.2x net MOIC", status: "exited", type: "fund", jurisdiction: "Singapore" },
			{ name: "Meritis Healthcare (exited)", role: "4.2x return — trade sale to IHH Healthcare", status: "exited", type: "investment", jurisdiction: "Singapore" },
			{ name: "Singha Logistics (exited)", role: "3.8x return — SGX IPO", status: "exited", type: "investment", jurisdiction: "Singapore" },
			{ name: "Pacific Minerals (exited)", role: "2.5x return — strategic sale", status: "exited", type: "investment", jurisdiction: "Indonesia" },
		],
	},
	{
		name: "Real estate portfolio", role: "Personal holdings", status: "active", valuation: "$62M",
		type: "holding", jurisdiction: "Singapore",
		children: [
			{ name: "Sentosa Cove waterfront bungalow", role: "Purchased 2012 at S$18M — current S$28M", status: "active", type: "investment", jurisdiction: "Singapore", valuation: "$21M" },
			{ name: "Nassim Road Good Class Bungalow", role: "Purchased 2015 at S$38M — current S$55M", status: "active", type: "investment", jurisdiction: "Singapore", valuation: "$41M" },
		],
	},
];

// ── James Chen Wei: Client Documents ───────────────────────────

const CHEN_WEI_CLIENT_DOCS: ClientDocument[] = [
	{ id: "cd-cw-1", type: "passport", label: "Singapore Passport — CHEN Wei (陈伟)", submittedBy: "Client (directly)", submittedDate: "2026-04-01", status: "verified", fileDescription: "Republic of Singapore passport. Name: CHEN WEI (陈伟). DOB: 15 MAR 1968. Passport No: E72••••15. Valid through 2033.", verificationNotes: "Name and DOB match ACRA directorship records for Meridian Capital Partners and Chen Wei Family Office (Fill Easy CorpVerify). Singapore citizen confirmed.", governmentAuthority: "Immigration & Checkpoints Authority of Singapore" },
	{ id: "cd-cw-2", type: "tax-return", label: "IRAS Individual Income Tax — YA 2025 Filing", submittedBy: "Client (via KPMG Singapore)", submittedDate: "2026-04-10", status: "verified", fileDescription: "IRAS myTax Portal filing confirmation for Year of Assessment 2025. Comprehensive income declared: employment income (nil — retired from active management), dividend income, interest income, and capital gains from PE distributions.", verificationNotes: "Income amounts cross-checked against DBS bank statements and SGX dividend records. All figures consistent. IRAS filing status confirmed.", governmentAuthority: "Inland Revenue Authority of Singapore (IRAS)" },
	{ id: "cd-cw-3", type: "bank-statement", label: "DBS Private Banking — SGD Portfolio Statement (Q1 2026)", submittedBy: "Client (via DBS Wealth Management)", submittedDate: "2026-04-15", status: "verified", fileDescription: "DBS Private Banking quarterly statement for account ending ••3847. Period: Jan-Mar 2026. Shows blue-chip equity holdings, fixed income positions, PE fund distributions, dividend income, and cash balances.", verificationNotes: "Equity holdings match SGX market data. Dividend income cross-verified against corporate dividend calendars. PE distributions consistent with Meridian Capital fund schedule.", governmentAuthority: "Monetary Authority of Singapore (MAS) — regulated institution" },
	{ id: "cd-cw-4", type: "incorporation-cert", label: "Fill Easy API: ACRA — Meridian Capital Partners Pte. Ltd.", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-19", status: "verified", fileDescription: "Singapore ACRA BizFile+ record for Meridian Capital Partners Pte. Ltd. (UEN: 200012345D). Incorporated 2000-06-01. Directors: CHEN Wei, DAVID Tan. MAS CMS licence holder. Filing status current.", verificationNotes: "100% verified — government authority. Fill Easy CorpVerify returned ACRA exact match. MAS CMS licence cross-referenced.", governmentAuthority: "Singapore ACRA (via Fill Easy CorpVerify)" },
	{ id: "cd-cw-5", type: "incorporation-cert", label: "Fill Easy API: ACRA — Chen Wei Family Office Pte. Ltd.", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-19", status: "verified", fileDescription: "Singapore ACRA BizFile+ record for Chen Wei Family Office Pte. Ltd. (UEN: 201012345G). Incorporated 2010-03-15. Sole director: CHEN Wei. Exempt private company. Filing status current.", verificationNotes: "100% verified — government authority. Fill Easy CorpVerify returned ACRA exact match.", governmentAuthority: "Singapore ACRA (via Fill Easy CorpVerify)" },
	{ id: "cd-cw-6", type: "property-deed", label: "Fill Easy API: SLA — Sentosa Cove Waterfront Bungalow", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-19", status: "verified", fileDescription: "Singapore Land Authority property record for Sentosa Cove waterfront bungalow. Lot area 15,000 sq ft. Owner: CHEN Wei. Purchase date: 2012. Purchase price: S$18M. Current estimated value: S$28M per URA data.", verificationNotes: "100% verified — government authority. Fill Easy API returned SLA property record with registered owner and transaction history. URA price index applied.", governmentAuthority: "Singapore Land Authority (via Fill Easy API)" },
	{ id: "cd-cw-7", type: "property-deed", label: "Fill Easy API: SLA — Nassim Road Good Class Bungalow", submittedBy: "Fill Easy API — automated retrieval", submittedDate: "2026-05-19", status: "verified", fileDescription: "Singapore Land Authority property record for Nassim Road GCB. Land area 20,000 sq ft. Owner: CHEN Wei. Purchase date: 2015. Purchase price: S$38M. Current estimated value: S$55M per URA data.", verificationNotes: "100% verified — government authority. Fill Easy API returned SLA property record with full transaction history.", governmentAuthority: "Singapore Land Authority (via Fill Easy API)" },
	{ id: "cd-cw-8", type: "reference-letter", label: "Goldman Sachs — Employment Verification Letter", submittedBy: "Client (via Goldman Sachs HR, Singapore)", submittedDate: "2026-04-20", status: "verified", fileDescription: "Goldman Sachs Singapore employment verification letter confirming CHEN Wei's employment from July 1990 to June 2000. Final title: Managing Director, Investment Banking Division. Compensation level referenced.", verificationNotes: "Verified directly with Goldman Sachs HR department. Employment dates and title confirmed. Compensation bracket consistent with MD-level at Goldman Sachs in the 1990s.", governmentAuthority: "N/A (employer verification)" },
];

// ── James Chen Wei: Cross-References ───────────────────────────

const CHEN_WEI_CROSS_REFS: CrossReference[] = [
	{ id: "xr-cw-1", field: "Full Name", clientDocLabel: "Singapore Passport", externalSourceLabel: "Fill Easy: ACRA — Meridian Capital Partners", clientValue: "CHEN WEI (陈伟)", externalValue: "CHEN Wei — Director", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (ACRA) — government authority" },
	{ id: "xr-cw-2", field: "Date of Birth", clientDocLabel: "Singapore Passport", externalSourceLabel: "Goldman Sachs Employment Verification", clientValue: "15 MAR 1968", externalValue: "March 15, 1968", match: "exact", confidence: 100, verifiedVia: "Goldman Sachs HR department" },
	{ id: "xr-cw-3", field: "Meridian Capital Directorship", clientDocLabel: "Fill Easy: ACRA — Meridian Capital Partners", externalSourceLabel: "MAS Financial Institutions Directory", clientValue: "Director since 2000 (UEN: 200012345D)", externalValue: "CMS licence holder — Fund Management", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (ACRA) + MAS FID — government authorities" },
	{ id: "xr-cw-4", field: "Family Office Registration", clientDocLabel: "Fill Easy: ACRA — Chen Wei Family Office", externalSourceLabel: "MAS Notice 626 Compliance Filing", clientValue: "UEN: 201012345G, incorporated 2010", externalValue: "MAS compliance status: Satisfactory", match: "exact", confidence: 100, verifiedVia: "Fill Easy CorpVerify (ACRA) + MAS — government authorities" },
	{ id: "xr-cw-5", field: "Sentosa Cove Property", clientDocLabel: "Fill Easy: SLA — Sentosa Cove Bungalow", externalSourceLabel: "URA Property Transaction Data", clientValue: "Owner: CHEN Wei, purchased 2012 at S$18M", externalValue: "Sentosa Cove transaction recorded at S$18M (2012)", match: "exact", confidence: 100, verifiedVia: "Fill Easy (SLA) + URA — government authorities" },
	{ id: "xr-cw-6", field: "Nassim Road Property", clientDocLabel: "Fill Easy: SLA — Nassim Road GCB", externalSourceLabel: "URA Property Transaction Data", clientValue: "Owner: CHEN Wei, purchased 2015 at S$38M", externalValue: "Nassim Road GCB transaction recorded at S$38M (2015)", match: "exact", confidence: 100, verifiedVia: "Fill Easy (SLA) + URA — government authorities" },
	{ id: "xr-cw-7", field: "Dividend Income (Q1 2026)", clientDocLabel: "DBS Bank Statement", externalSourceLabel: "SGX Dividend Records — DBS, OCBC, Singtel", clientValue: "$1.8M dividend income received", externalValue: "$1.78M calculated from shareholdings x declared dividends", match: "exact", confidence: 100, verifiedVia: "DBS custody records + SGX market data" },
	{ id: "xr-cw-8", field: "Tax Filing — Income", clientDocLabel: "IRAS YA 2025 Filing", externalSourceLabel: "DBS Portfolio Statement", clientValue: "Total income declared: S$9.2M", externalValue: "Dividend + interest + PE distributions = S$9.15M", match: "exact", confidence: 100, verifiedVia: "IRAS + DBS (MAS-regulated) — government authorities" },
	{ id: "xr-cw-9", field: "Goldman Sachs Employment", clientDocLabel: "Goldman Sachs Employment Verification", externalSourceLabel: "Forbes Singapore Rich List Profile", clientValue: "Goldman Sachs MD, 1990-2000", externalValue: "Source of wealth: Goldman Sachs → PE → family office", match: "exact", confidence: 95, verifiedVia: "Goldman Sachs HR + Forbes profile" },
	{ id: "xr-cw-10", field: "Net Worth Estimate", clientDocLabel: "Client self-declaration", externalSourceLabel: "Forbes Singapore Rich List 2025", clientValue: "$380M estimated net worth", externalValue: "S$510M (~$380M) — ranked #78", match: "exact", confidence: 90, verifiedVia: "Forbes estimate + portfolio analysis cross-check" },
];

// ── James Chen Wei: Report ─────────────────────────────────────

const CHEN_WEI_REPORT: HnwReport = {
	profile: {
		id: "hnw-james-chen",
		name: "James Chen Wei",
		nameCn: "陈伟",
		dateOfBirth: "1968-03-15",
		age: 58,
		nationality: "Singaporean",
		residences: ["Singapore"],
		primaryIndustry: "Private Equity / Family Office",
		estimatedNetWorthUSD: 380_000_000,
		netWorthSource: "Forbes Singapore Rich List 2025",
		riskRating: "Low",
		riskScore: 22,
		profileSummary: "Singaporean citizen with straightforward wealth trajectory from Goldman Sachs to private equity to family office management. Net worth of $380M is well-documented through MAS, ACRA, IRAS, and SLA records. No PEP exposure, no sanctions hits, no adverse media. Conservative portfolio with no crypto or speculative assets. Grade A corroboration.",
	},
	careerTimeline: CHEN_WEI_CAREER,
	totalEstimatedWealthUSD: 380_000_000,
	wealthByCategory: aggregateWealth(CHEN_WEI_CAREER),
	overallConfidence: overallConfidence(CHEN_WEI_CAREER),
	narrative: CHEN_WEI_NARRATIVE,
	keyParameters: CHEN_WEI_PARAMS,
	dataSources: CHEN_WEI_SOURCES,
	companyNodes: CHEN_WEI_COMPANIES,
	screeningResult: PEP_SCREENING[3],
	clientDocuments: CHEN_WEI_CLIENT_DOCS,
	crossReferences: CHEN_WEI_CROSS_REFS,
	uploadSlots: UPLOAD_SLOTS,
	corroborationScores: {
		consistency: 15,
		correctness: 12,
		completeness: 18,
		masReference: "MAS Notice 626 / Guidelines to Notice 626 (Prevention of Money Laundering and Countering the Financing of Terrorism) — §6.18–6.22 Source of Wealth Verification",
	},
	agentVerification: {
		agentId: "fe-verify-v2",
		agentName: "Fill Easy Verification Agent",
		timestamp: new Date().toISOString(),
		overallStatus: "verified",
		checks: [
			{ id: "ck-cw-1", category: "consistency", label: "Career-to-wealth trajectory alignment", status: "pass", detail: "Goldman Sachs (1990-2000, $18M compensation) → Meridian Capital co-founding (2000-2010, $85M in carry/fees) → Family Office ($380M). Career progression is consistent with documented wealth accumulation. No unexplained jumps or gaps." },
			{ id: "ck-cw-2", category: "consistency", label: "Income proportional to declared roles", status: "pass", detail: "Goldman Sachs MD compensation ($18M over 10 years) is consistent with industry benchmarks for Singapore MDs in the 1990s. PE carried interest proportional to fund size and performance." },
			{ id: "ck-cw-3", category: "correctness", label: "ACRA registrations verified", status: "pass", detail: "Both Meridian Capital Partners (UEN: 200012345D) and Chen Wei Family Office (UEN: 201012345G) confirmed via Fill Easy CorpVerify. Directorship records match passport details." },
			{ id: "ck-cw-4", category: "correctness", label: "Property ownership confirmed", status: "pass", detail: "Sentosa Cove bungalow (S$18M, 2012) and Nassim Road GCB (S$38M, 2015) both confirmed via Fill Easy SLA property search. Current valuations cross-checked against URA price indices." },
			{ id: "ck-cw-5", category: "correctness", label: "Investment portfolio cross-referenced", status: "pass", detail: "DBS Private Banking custody records match SGX market data for equity holdings. Dividend income cross-verified against corporate dividend calendars. Fixed income positions confirmed." },
			{ id: "ck-cw-6", category: "correctness", label: "Tax filings consistent with portfolio", status: "pass", detail: "IRAS YA 2025 filing shows total declared income of S$9.2M. This matches DBS portfolio statement dividend + interest + PE distributions of S$9.15M. Negligible variance (<1%)." },
			{ id: "ck-cw-7", category: "completeness", label: "All material wealth sources identified", status: "pass", detail: "Single-jurisdiction profile (Singapore only) with complete documentation chain: employment → PE → family office. No offshore structures, no undisclosed entities, no material gaps." },
			{ id: "ck-cw-8", category: "completeness", label: "PEP and sanctions screening complete", status: "pass", detail: "Screened against 7 lists (OFAC SDN, EU Consolidated, UN Security Council, MAS, SFC, World-Check PEP, Dow Jones Watchlist). Zero hits across all categories. No adverse media findings." },
		],
		summary: "James Chen Wei's wealth profile achieves the highest level of corroboration. All eight verification checks passed. The career-to-wealth trajectory is fully consistent, all material assets are verified through government authorities (MAS, ACRA, IRAS, SLA via Fill Easy), and there are no identified gaps in documentation. The single-jurisdiction nature of the profile (entirely Singapore-based) significantly simplifies verification. Recommend standard monitoring at quarterly frequency.",
		recommendations: [
			"Maintain quarterly screening schedule — no enhanced monitoring required",
			"Request updated DBS portfolio statement annually for ongoing verification",
			"Monitor Forbes Singapore Rich List for consistency with declared net worth",
			"Standard PEP/sanctions re-screening per MAS Notice 626 requirements",
		],
	},
	corroborationGrade: "A",
	fourEyeCheck: {
		analyst: { name: "Sarah Chen", role: "Senior Compliance Analyst", timestamp: "2026-05-19T10:00:00Z" },
		reviewer: { name: "Michael Wong", role: "Head of Financial Crime", timestamp: "2026-05-19T14:30:00Z" },
		status: "approved",
		signOffHistory: [
			{ action: "Drafted", by: "Sarah Chen", at: "2026-05-19T10:00:00Z", comment: "Clean profile — all sources verified, Grade A corroboration" },
			{ action: "Reviewed", by: "Michael Wong", at: "2026-05-19T12:00:00Z", comment: "Concur with assessment — straightforward wealth trajectory" },
			{ action: "Approved", by: "Michael Wong", at: "2026-05-19T14:30:00Z", comment: "Approved for onboarding — standard quarterly monitoring" },
		],
	},
	personalRelationships: [
		{ id: "pr-cw-1", name: "Lin Mei Hua", relationship: "spouse", notes: "Homemaker, Singaporean citizen. No independent business activities. Joint ownership of family residence.", linkedEntities: [] },
		{ id: "pr-cw-2", name: "Chen Jia Wen", relationship: "child", notes: "Daughter, age 28. Graduate of Imperial College London. Analyst at Temasek Holdings.", linkedEntities: [] },
		{ id: "pr-cw-3", name: "Chen Jia Ming", relationship: "child", notes: "Son, age 25. Graduate of NUS Business School. Junior associate at McKinsey Singapore.", linkedEntities: [] },
		{ id: "pr-cw-4", name: "David Tan", relationship: "associate", notes: "Co-founder of Meridian Capital Partners. Former Goldman Sachs colleague.", linkedEntities: ["Meridian Capital Partners Pte. Ltd."] },
	],
};

// ── Assemble Reports ────────────────────────────────────────────

const JACK_MA_REPORT: HnwReport = {
	profile: {
		id: "hnw-jack-ma",
		name: "Jack Ma",
		nameCn: "马云",
		dateOfBirth: "1964-09-10",
		age: 61,
		nationality: "Chinese",
		residences: ["Hangzhou, China", "Hong Kong", "Tokyo, Japan"],
		primaryIndustry: "E-Commerce / Fintech",
		estimatedNetWorthUSD: 25_500_000_000,
		netWorthSource: "Forbes Real-Time Billionaires Index",
		riskRating: "Medium",
		riskScore: 48,
		profileSummary: "Founder of Alibaba Group and co-founder of Ant Group. One of China's most prominent entrepreneurs. Wealth primarily derived from Alibaba equity crystallized through the 2014 NYSE IPO. Subject to enhanced monitoring due to regulatory exposure and PEP near-match status.",
	},
	careerTimeline: JACK_MA_CAREER,
	totalEstimatedWealthUSD: 25_500_000_000,
	wealthByCategory: aggregateWealth(JACK_MA_CAREER),
	overallConfidence: overallConfidence(JACK_MA_CAREER),
	narrative: JACK_MA_NARRATIVE,
	keyParameters: JACK_MA_PARAMS,
	dataSources: JACK_MA_SOURCES,
	companyNodes: JACK_MA_COMPANIES,
	screeningResult: PEP_SCREENING[0],
	clientDocuments: JACK_MA_CLIENT_DOCS,
	crossReferences: JACK_MA_CROSS_REFS,
	uploadSlots: UPLOAD_SLOTS,
	corroborationScores: {
		consistency: 28,
		correctness: 42,
		completeness: 55,
		masReference: "MAS Notice 626 / Guidelines to Notice 626 (Prevention of Money Laundering and Countering the Financing of Terrorism) — §6.18–6.22 Source of Wealth Verification",
	},
	agentVerification: {
		agentId: "fe-verify-v2",
		agentName: "Fill Easy Verification Agent",
		timestamp: new Date().toISOString(),
		overallStatus: "requires-review",
		checks: [
			{ id: "ck-jm-1", category: "consistency", label: "Career-to-wealth trajectory alignment", status: "pass", detail: "Alibaba founding (1999) → Goldman/SoftBank/Yahoo funding rounds → NYSE IPO (2014) → wealth crystallisation. Career timeline is internally consistent and corroborated by 8+ independent sources." },
			{ id: "ck-jm-2", category: "consistency", label: "Income proportional to declared roles", status: "pass", detail: "Teaching salary ($20/mo, 1988–1995), Alibaba CEO compensation, post-retirement advisory income — all proportional to career stage. No unexplained income spikes." },
			{ id: "ck-jm-3", category: "correctness", label: "SEC filings cross-reference", status: "pass", detail: "F-1 filing confirms 6.2% ownership at IPO. 20-F beneficial ownership tables confirm current ~4.5% stake. Morgan Stanley custody confirmation matches SEC disclosure." },
			{ id: "ck-jm-4", category: "correctness", label: "Property valuations verified", status: "pass", detail: "Victoria Peak residence (HK$1.5B) confirmed via Fill Easy Land Registry API. Adirondack estate ($23M) confirmed via CNBC reporting and property records." },
			{ id: "ck-jm-5", category: "correctness", label: "Ant Group valuation accuracy", status: "flag", detail: "Ant Group stake valued at ~$5.6B (8% of ~$70B). Post-restructuring valuation uncertain — ranges from $60B to $150B across analyst estimates. PBOC regulatory status pending." },
			{ id: "ck-jm-6", category: "completeness", label: "Singapore trust structure", status: "warn", detail: "ACRA registration confirmed for Ma Family Trust Pte. Ltd. but trust deed beneficiaries and full asset schedule not independently verified. $2.4B BABA shares transfer reported but settlement details pending." },
			{ id: "ck-jm-7", category: "completeness", label: "Blue Pool Capital AUM", status: "warn", detail: "Family office co-founded with Joe Tsai. AUM estimated at ~$50B based on media reports. No regulatory filings available — SFC Type 9 licence held but AUM not disclosed. Ma's personal share of AUM unknown." },
			{ id: "ck-jm-8", category: "completeness", label: "Spousal and family assets", status: "warn", detail: "Wife Zhang Ying holds Singapore properties (Good Class Bungalow ~S$40M, Duxton Road shophouses ~S$50M). Family beneficial ownership structure partially documented. Daughter's holdings not assessed." },
			{ id: "ck-jm-9", category: "consistency", label: "Lifestyle assets proportional to net worth", status: "pass", detail: "Superyacht Zen (~$200M), Gulfstream G650ER (~$65M), Bordeaux vineyards — consistent with $25B+ net worth. Total lifestyle assets <2% of declared wealth." },
			{ id: "ck-jm-10", category: "correctness", label: "PEP/Sanctions screening accuracy", status: "pass", detail: "CPPCC 12th National Committee membership (2013–2018) correctly identified as near-match PEP. Current status: former PEP with residual connections. 7 sanctions lists checked — no hits." },
		],
		summary: "Jack Ma's wealth profile demonstrates strong consistency between career trajectory and wealth accumulation, with high correctness for SEC-filed equity holdings. However, three areas require further review: (1) Ant Group post-restructuring valuation carries significant uncertainty, (2) Singapore trust structure beneficiaries are not fully transparent, and (3) Blue Pool Capital AUM allocation is not independently verified. Recommend requesting updated PBOC regulatory status and Singapore trust deed documentation before finalising assessment.",
		recommendations: [
			"Request updated Ant Group valuation from PBOC or independent auditor — current $70B estimate has ±50% uncertainty",
			"Obtain full Singapore trust deed via ACRA to verify beneficiaries and asset schedule",
			"Verify Blue Pool Capital AUM allocation — request SFC regulatory returns if available",
			"Commission independent appraisal of lifestyle assets (superyacht, vineyards) for completeness",
			"Schedule quarterly re-screening given PEP near-match status and regulatory exposure",
		],
	},
	corroborationGrade: "C",
	fourEyeCheck: {
		analyst: { name: "Sarah Chen", role: "Senior Compliance Analyst", timestamp: "2026-05-17T14:30:00Z" },
		reviewer: { name: "Michael Wong", role: "Head of Financial Crime", timestamp: "2026-05-18T09:15:00Z" },
		status: "reviewed",
		signOffHistory: [
			{ action: "Drafted", by: "Sarah Chen", at: "2026-05-17T14:30:00Z", comment: "Initial SOW assessment completed" },
			{ action: "Reviewed", by: "Michael Wong", at: "2026-05-18T09:15:00Z", comment: "Requires follow-up on Ant Group and Singapore trust" },
		],
	},
	personalRelationships: [
		{ id: "pr-jm-1", name: "Zhang Ying (Cathy Zhang)", relationship: "spouse", notes: "Co-founder of Alibaba, holds Singapore property portfolio (~$50M)", linkedEntities: ["Singapore Properties"] },
		{ id: "pr-jm-2", name: "Ma Yuankun", relationship: "child", notes: "Son, limited public information" },
		{ id: "pr-jm-3", name: "Ma (daughter)", relationship: "child", notes: "Daughter, limited public information" },
		{ id: "pr-jm-4", name: "Joe Tsai (蔡崇信)", relationship: "associate", notes: "Co-founder of Alibaba, Vice Chairman. Co-investor in Blue Pool Capital. Net worth ~$10.7B", linkedEntities: ["Alibaba Group (NYSE: BABA)", "Blue Pool Capital"] },
		{ id: "pr-jm-5", name: "Simon Xie", relationship: "advisor", notes: "Manages Jack Ma family trust via Singapore structure", linkedEntities: ["Singapore Family Trust"] },
		{ id: "pr-jm-6", name: "Daniel Zhang (张勇)", relationship: "associate", notes: "Former CEO of Alibaba Group, key succession figure", linkedEntities: ["Alibaba Group (NYSE: BABA)"] },
	],
};

const YAT_SIU_REPORT: HnwReport = {
	profile: {
		id: "hnw-yat-siu",
		name: "Yat Siu",
		nameCn: "蕭逸",
		dateOfBirth: "1973-01-01",
		age: 53,
		nationality: "Austrian",
		residences: ["Hong Kong"],
		primaryIndustry: "Blockchain Gaming / Web3",
		estimatedNetWorthUSD: 2_400_000_000,
		netWorthSource: "Forbes estimate + on-chain analysis",
		riskRating: "High",
		riskScore: 72,
		profileSummary: "Co-founder and chairman of Animoca Brands, a leading blockchain gaming and Web3 investment company. Wealth heavily concentrated in crypto assets and private company equity with extreme volatility. ASX-delisted in 2020. Active in Hong Kong's virtual asset regulatory framework.",
	},
	careerTimeline: YAT_SIU_CAREER,
	totalEstimatedWealthUSD: 2_400_000_000,
	wealthByCategory: aggregateWealth(YAT_SIU_CAREER),
	overallConfidence: overallConfidence(YAT_SIU_CAREER),
	narrative: YAT_SIU_NARRATIVE,
	keyParameters: YAT_SIU_PARAMS,
	dataSources: YAT_SIU_SOURCES,
	companyNodes: YAT_SIU_COMPANIES,
	screeningResult: PEP_SCREENING[1],
	clientDocuments: YAT_SIU_CLIENT_DOCS,
	crossReferences: YAT_SIU_CROSS_REFS,
	uploadSlots: UPLOAD_SLOTS,
	corroborationScores: {
		consistency: 55,
		correctness: 82,
		completeness: 75,
		masReference: "MAS Notice 626 / Guidelines to Notice 626 (Prevention of Money Laundering and Countering the Financing of Terrorism) — §6.18–6.22 Source of Wealth Verification",
	},
	agentVerification: {
		agentId: "fe-verify-v2",
		agentName: "Fill Easy Verification Agent",
		timestamp: new Date().toISOString(),
		overallStatus: "flagged",
		checks: [
			{ id: "ck-ys-1", category: "consistency", label: "Career-to-wealth trajectory alignment", status: "warn", detail: "Atari (1990) → Outblaze founding → IBM exit (~$15M) → Animoca Brands. Career is credible, but the jump from ~$120M (2020) to $3.8B (2022) is entirely driven by crypto token appreciation — not operational income. Rapid wealth accumulation lacks traditional business fundamentals." },
			{ id: "ck-ys-2", category: "consistency", label: "Net worth vs. last funding round", status: "flag", detail: "Claimed $2.4B net worth, but Animoca filed for Nasdaq listing at ~$1B valuation (Nov 2025) — significantly below $5.9B last private round. If company is worth $1B and Siu holds 25-30%, equity component is $250-300M — not $1.6B. Material inconsistency requiring resolution." },
			{ id: "ck-ys-3", category: "correctness", label: "SAND token valuation reliability", status: "flag", detail: "SAND token at ~$0.30-0.60, down ~93% from $8.40 ATH. Token holdings estimated at 150-200M tokens but exact amount is unverified — no public wallet disclosure. On-chain verification not completed. Valuation swings of ±50% possible within weeks." },
			{ id: "ck-ys-4", category: "correctness", label: "NFT portfolio valuation", status: "flag", detail: "Client claims NFT portfolio worth $50M. DappRadar floor price analysis suggests $12-18M. NFT market is highly illiquid — last comparable sales may be months old. Spread between claimed and estimated value: 3-4x." },
			{ id: "ck-ys-5", category: "correctness", label: "Animoca FY2024 financials", status: "warn", detail: "Animoca reported total assets of $4.3B including $2.9B in off-balance sheet token reserves. Unaudited. Token reserves not subject to independent valuation. Balance sheet structure unusual for pre-IPO company." },
			{ id: "ck-ys-6", category: "completeness", label: "Personal crypto wallet verification", status: "flag", detail: "No on-chain verification of personal BTC/ETH holdings ($170M claimed). Siu is a known crypto advocate but has not provided wallet addresses for verification. X/Twitter account was compromised Dec 2024 — raises security and custody concerns." },
			{ id: "ck-ys-7", category: "completeness", label: "Off-balance sheet token reserves", status: "flag", detail: "$2.9B in off-balance sheet token reserves reported in FY2024 investor update. Composition, custody arrangements, and Siu's personal entitlement to these reserves are not documented. Material gap in wealth attribution." },
			{ id: "ck-ys-8", category: "completeness", label: "Lympo hack loss recovery", status: "warn", detail: "$18.7M stolen from Lympo subsidiary (Jan 2022). Recovery status unknown. Loss represents 6.5x the acquisition cost ($2.88M). Insurance and clawback status not verified." },
			{ id: "ck-ys-9", category: "consistency", label: "ASX delisting circumstances", status: "warn", detail: "ASIC cited repeated compliance failures. Animoca claims voluntary delisting. Both narratives present in public record. Post-delisting, no mandatory financial disclosure — creates transparency gap from 2020 to present." },
			{ id: "ck-ys-10", category: "correctness", label: "IBM Outblaze acquisition proceeds", status: "pass", detail: "RTTNews confirms IBM acquisition of Outblaze messaging division (Jan 2009). Estimated $10-20M. HK Companies Registry confirms Siu retained majority of Outblaze gaming division. Transaction is well-corroborated." },
		],
		summary: "Yat Siu's wealth profile presents significant corroboration challenges. While the career trajectory from Outblaze to Animoca Brands is credible, the current net worth estimate relies heavily on volatile crypto assets, unverified personal token holdings, and a private company valuation that may be materially overstated (Nasdaq filing at $1B vs. $5.9B last round). Five of ten verification checks are flagged. On-chain wallet verification has not been completed, and off-balance sheet reserves of $2.9B lack independent audit. Enhanced Due Diligence is mandatory before onboarding.",
		recommendations: [
			"CRITICAL: Complete on-chain verification of all declared crypto/token holdings — require wallet addresses",
			"Request independent valuation of Animoca Brands from Nasdaq reverse merger advisors (Currenc Group filings)",
			"Obtain audited FY2024/25 financials — unaudited $4.3B balance sheet is insufficient for HNW onboarding",
			"Commission independent NFT portfolio valuation — client claims 3-4x above floor estimates",
			"Verify custody arrangements for off-balance sheet token reserves ($2.9B)",
			"Request full Lympo hack incident report and insurance/recovery status",
			"Engage ASX/ASIC for complete delisting correspondence to resolve competing narratives",
		],
	},
	corroborationGrade: "E",
	fourEyeCheck: {
		analyst: { name: "Kevin Lam", role: "Compliance Analyst", timestamp: "2026-05-17T10:00:00Z" },
		reviewer: null,
		status: "drafted",
		signOffHistory: [
			{ action: "Drafted", by: "Kevin Lam", at: "2026-05-17T10:00:00Z", comment: "High risk — crypto volatility requires daily revaluation" },
		],
	},
	personalRelationships: [
		{ id: "pr-ys-1", name: "Family (private)", relationship: "spouse", notes: "Spouse identity not publicly disclosed, based in Hong Kong" },
		{ id: "pr-ys-2", name: "David Kim", relationship: "associate", notes: "Co-founder of Animoca Brands, COO", linkedEntities: ["Animoca Brands"] },
		{ id: "pr-ys-3", name: "Evan Auyang", relationship: "associate", notes: "Group President of Animoca Brands", linkedEntities: ["Animoca Brands"] },
		{ id: "pr-ys-4", name: "Sebastien Borget", relationship: "associate", notes: "Co-founder of The Sandbox, key partnership", linkedEntities: ["The Sandbox (SAND)"] },
	],
};

// ── Donald Trump: Sources ──────────────────────────────────────

const SRC_TRUMP: Record<string, SourceCitation> = {
	forbesTrump: {
		id: "dt1", label: "Forbes Real-Time Billionaires (Donald Trump)", url: "https://www.forbes.com/profile/donald-trump/", date: "2026-05-01", type: "estimate",
		...srcMeta("forbes.com", "Donald Trump - Forbes Real-Time Billionaires", "Forbes billionaire profile for Donald J. Trump. Real-time net worth estimate of $6.5B. Source of wealth listed as real estate and media.", "#c4112f"),
	},
	ogeDisclosure: {
		id: "dt2", label: "OGE Public Financial Disclosure — President Trump (2025)", url: "https://www.oge.gov/", date: "2025-06-15", type: "filing",
		...srcMeta("oge.gov", "OGE | Public Financial Disclosure Report — Donald J. Trump", "Office of Government Ethics public financial disclosure showing income sources, assets, and liabilities. Over 500 entities listed across LLCs, golf clubs, licensing deals, and investments.", "#003366"),
	},
	secDJT: {
		id: "dt3", label: "SEC EDGAR — Trump Media & Technology Group (DJT) 10-K", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001849635&type=10-K", date: "2025-04-01", type: "filing",
		...srcMeta("sec.gov", "SEC EDGAR | 10-K Annual Report | Trump Media & Technology Group", "SEC EDGAR filing showing Trump Media & Technology Group (Nasdaq: DJT) annual report. Beneficial ownership shows Donald J. Trump holding approximately 59% of outstanding shares (~188M shares).", "#003366"),
	},
	nycPropertyRecords: {
		id: "dt4", label: "NYC Dept of Finance — Trump Tower Assessment", url: "https://www.nyc.gov/site/finance/property/property.page", date: "2025-01-01", type: "registry",
		...srcMeta("nyc.gov", "NYC Finance | Property Assessment — 725 Fifth Avenue (Trump Tower)", "NYC Department of Finance property tax assessment for 725 Fifth Avenue (Trump Tower). Assessed value, tax class, and ownership records for the commercial condominium.", "#003399"),
		companySearchTemplate: {
			registryName: "NYC Department of Finance — ACRIS & Property Tax",
			registryUrl: "https://a836-acris.nyc.gov/",
			searchFields: [
				{ label: "Property Address", value: "725 Fifth Avenue, New York, NY 10022" },
				{ label: "Borough", value: "Manhattan" },
				{ label: "Block/Lot", value: "1286/38" },
			],
			jurisdiction: "New York, USA",
			searchType: "Property Assessment Search",
		},
	},
	fecFilings: {
		id: "dt5", label: "FEC Campaign Finance Filings — Trump 2024", url: "https://www.fec.gov/data/candidate/P80001571/", date: "2024-11-01", type: "filing",
		...srcMeta("fec.gov", "FEC | Candidate Summary — Donald J. Trump", "Federal Election Commission filing summary for Donald J. Trump presidential campaign. Receipts, disbursements, and personal financial contributions disclosed.", "#003399"),
	},
	nyAGFraud: {
		id: "dt6", label: "NY AG: Trump Organization Civil Fraud Judgment ($454M)", url: "https://ag.ny.gov/press-release/2024/attorney-general-james-wins-landmark-victory", date: "2024-02-16", type: "public-record",
		...srcMeta("ag.ny.gov", "AG James Wins Landmark Victory in Civil Fraud Case | NY AG", "New York Attorney General press release on civil fraud judgment against Trump Organization. Judge Engoron ordered $454 million in disgorgement and penalties. Asset inflation findings for loan applications.", "#003399"),
	},
	bloombergTrump: {
		id: "dt7", label: "Bloomberg Billionaires Index — Donald Trump", url: "https://www.bloomberg.com/billionaires/profiles/donald-j-trump/", date: "2026-05-01", type: "estimate",
		...srcMeta("bloomberg.com", "Bloomberg Billionaires Index | Donald J. Trump", "Bloomberg Billionaires Index profile showing Trump net worth breakdown. Real estate, licensing income, DJT stock, and golf club valuations itemized.", "#1e1e1e"),
	},
	palmBeachCounty: {
		id: "dt8", label: "Palm Beach County — Mar-a-Lago Property Assessment", url: "https://www.pbcgov.org/papa/", type: "registry",
		...srcMeta("pbcgov.org", "Palm Beach County Property Appraiser | Mar-a-Lago", "Palm Beach County property appraiser record for Mar-a-Lago Club, 1100 S Ocean Blvd, Palm Beach. Tax assessment, land value, and improvement value. Special use classification as private club.", "#336633"),
		companySearchTemplate: {
			registryName: "Palm Beach County Property Appraiser",
			registryUrl: "https://www.pbcgov.org/papa/",
			searchFields: [
				{ label: "Property Address", value: "1100 S Ocean Blvd, Palm Beach, FL 33480" },
				{ label: "Owner Name", value: "Trump, Donald J" },
				{ label: "Search Type", value: "Owner Name / Address Search" },
			],
			jurisdiction: "Palm Beach County, Florida, USA",
			searchType: "Property Assessment Search",
		},
	},
	nySOS: {
		id: "dt9", label: "NY Secretary of State — Trump Organization LLC filings", url: "https://www.dos.ny.gov/corps/", type: "registry",
		...srcMeta("dos.ny.gov", "NY DOS | Entity Search — The Trump Organization", "New York Secretary of State entity search results for Trump-related LLCs and corporations. Over 500 entities registered in New York. Filing dates, status, and registered agent information.", "#003399"),
	},
	djtStock: {
		id: "dt10", label: "Nasdaq: DJT Historical Share Price", url: "https://finance.yahoo.com/quote/DJT/history/", type: "market-data",
		...srcMeta("finance.yahoo.com", "DJT Historical Data | Yahoo Finance", "Yahoo Finance historical price chart for Trump Media & Technology Group (DJT). IPO via SPAC merger March 2024. Extreme volatility — range from $15 to $80.", "#410093"),
	},
	trumpMemeCoin: {
		id: "dt11", label: "CoinGecko — $TRUMP Meme Coin Market Data", url: "https://www.coingecko.com/en/coins/official-trump", date: "2025-01-18", type: "market-data",
		...srcMeta("coingecko.com", "$TRUMP (Official Trump) Price & Market Data | CoinGecko", "CoinGecko market data for $TRUMP meme coin launched January 18, 2025 on Solana. Peak ~$75. 80% supply held by CIC Digital LLC and Fight Fight Fight LLC.", "#8bc53f"),
	},
	atlanticCityBankruptcies: {
		id: "dt12", label: "PACER — Atlantic City Casino Bankruptcy Filings (6 cases)", url: "https://www.uscourts.gov/", date: "2014-09-09", type: "public-record",
		...srcMeta("uscourts.gov", "PACER | Trump Entertainment Resorts — Chapter 11 Filings", "U.S. Courts PACER records for six Trump-affiliated corporate bankruptcies (1991-2014).", "#003366"),
	},
	nbcApprentice: {
		id: "dt13", label: "NBC — The Apprentice Production Deal (2004-2015)", url: "https://variety.com/", date: "2004-01-08", type: "news",
		...srcMeta("variety.com", "Trump's 'Apprentice' Deal Worth $427M Over Run | Variety", "Variety reporting on Trump's Apprentice compensation estimated at $427M total.", "#000000"),
	},
	doralFinancials: {
		id: "dt14", label: "Miami-Dade County — Trump National Doral Property Records", url: "https://www.miamidade.gov/pa/", type: "registry",
		...srcMeta("miamidade.gov", "Miami-Dade Property Appraiser | Trump National Doral", "Miami-Dade County records for Trump National Doral golf resort. 800+ acres, four courses.", "#004488"),
	},
	wallStProperty: {
		id: "dt15", label: "NYC DOF — 40 Wall Street Property Records", url: "https://a836-acris.nyc.gov/", type: "registry",
		...srcMeta("nyc.gov", "NYC ACRIS | 40 Wall Street — Trump Building", "NYC ACRIS records for 40 Wall Street (Trump Building). 71-story office tower, ground lease.", "#003399"),
	},
	brandLicensing: {
		id: "dt16", label: "Forbes: Trump Brand Licensing Revenue Analysis", url: "https://www.forbes.com/sites/danalexander/", date: "2023-06-01", type: "estimate",
		...srcMeta("forbes.com", "Forbes | Inside Trump's Brand Licensing Empire", "Forbes analysis of Trump brand licensing — $400M+ cumulative fees from global hotel/residential projects.", "#c4112f"),
	},
	chicagoTower: {
		id: "dt17", label: "Cook County — Trump International Hotel & Tower Chicago", url: "https://www.cookcountyassessor.com/", type: "registry",
		...srcMeta("cookcountyassessor.com", "Cook County Assessor | Trump International Hotel & Tower", "Cook County records for Trump International Hotel & Tower, 401 N Wabash Ave. 98-story mixed-use.", "#003399"),
	},
	secSpac: {
		id: "dt18", label: "SEC — DWAC/TMTG SPAC Merger S-4 Filing", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001849635&type=S-4", date: "2024-03-22", type: "filing",
		...srcMeta("sec.gov", "SEC EDGAR | DWAC/TMTG SPAC Merger — S-4 Filing", "SEC S-4 for DWAC/TMTG SPAC merger. Lock-up provisions, share structure, insider ownership.", "#003366"),
	},
};

// ── Donald Trump: Career Timeline ──────────────────────────────

const TRUMP_CAREER: CareerPhase[] = [
	{
		id: "dt-1", title: "Early Career & Family Business", organization: "Trump Organization", role: "Executive VP / President",
		startYear: 1971, endYear: 1985, location: "New York, New York",
		description: "Joined father Fred Trump's real estate company after Wharton. Received substantial loans and inheritance from father (estimated $413M over lifetime per NYT investigation). Rebranded company as The Trump Organization. Developed Grand Hyatt Hotel and Trump Tower on Fifth Avenue.",
		categories: [
			{ category: "companies", claims: [
				{ id: "dt1-1", description: "Trump Organization equity and inherited real estate portfolio (Fred Trump transfers — NYT investigation estimated $413M lifetime)", estimatedValueUSD: 200_000_000, confidence: 55, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.nySOS] },
			], subtotalUSD: 200_000_000, avgConfidence: 55 },
		],
		phaseWealthUSD: 200_000_000, cumulativeWealthUSD: 200_000_000,
		keyEvents: ["1971: Joined Trump Organization", "1978: Grand Hyatt Hotel conversion", "1983: Trump Tower opens on Fifth Avenue"],
	},
	{
		id: "dt-2", title: "Expansion & Bankruptcy Era", organization: "Trump Organization / Trump Casinos", role: "Chairman & CEO",
		startYear: 1985, endYear: 1995, location: "New York / Atlantic City, NJ",
		description: "Aggressive expansion into Atlantic City casinos (Trump Plaza, Trump Taj Mahal, Trump Marina), airlines (Trump Shuttle), and the Plaza Hotel. Overleveraged with over $3.4B in debt by 1990. Six corporate bankruptcies between 1991-2009. Personal net worth nearly wiped out. Banks restructured debt with conditions.",
		categories: [
			{ category: "companies", claims: [
				{ id: "dt2-1", description: "Trump Organization post-restructuring equity (casino bankruptcies wiped out significant value, personal guarantees negotiated down)", estimatedValueUSD: 500_000_000, confidence: 40, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.bloombergTrump] },
			], subtotalUSD: 500_000_000, avgConfidence: 40 },
		],
		phaseWealthUSD: 300_000_000, cumulativeWealthUSD: 500_000_000,
		keyEvents: ["1988: Trump Taj Mahal opens ($1B cost)", "1990: Near-personal bankruptcy, banks restructure debt", "1991-1992: Three casino bankruptcies (Ch. 11)"],
	},
	{
		id: "dt-3", title: "Brand Licensing & Recovery", organization: "Trump Organization", role: "Chairman & President",
		startYear: 1996, endYear: 2004, location: "New York, New York",
		description: "Pivoted to asset-light licensing model — 'Trump' brand licensed to developers worldwide for premium fees. Trump World Tower (UN Plaza), Trump International Hotel & Tower (Columbus Circle). Revenue from licensing deals rather than direct development reduced risk.",
		categories: [
			{ category: "companies", claims: [
				{ id: "dt3-1", description: "Trump Organization real estate and licensing deals (brand licensing revenue growing, NYC properties appreciating)", estimatedValueUSD: 2_000_000_000, confidence: 45, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.nycPropertyRecords] },
			], subtotalUSD: 2_000_000_000, avgConfidence: 45 },
			{ category: "income", claims: [
				{ id: "dt3-2", description: "Brand licensing fees and management contracts ($5-10M/year estimated from financial disclosures)", estimatedValueUSD: 50_000_000, confidence: 50, savingRate: 70, sources: [SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 50_000_000, avgConfidence: 50 },
			{ category: "alternatives", claims: [
				{ id: "dt3-3", description: "Golf course acquisitions (Turnberry, Doral, multiple US courses)", estimatedValueUSD: 400_000_000, confidence: 50, sources: [SRC_TRUMP.forbesTrump] },
			], subtotalUSD: 400_000_000, avgConfidence: 50 },
		],
		phaseWealthUSD: 2_450_000_000, cumulativeWealthUSD: 2_500_000_000,
		keyEvents: ["1999: Trump World Tower development", "2001: Trump International Hotel & Tower opens", "2002: Begins acquiring golf courses globally"],
	},
	{
		id: "dt-4", title: "The Apprentice & Media Empire", organization: "Trump Organization / NBC", role: "Executive Producer & Star",
		startYear: 2004, endYear: 2015, location: "New York, New York",
		description: "The Apprentice (NBC) debuted January 2004. Show ran 15 seasons and earned Trump an estimated $427M total from salary, producer fees, and related licensing. Also operated Trump University (settled for $25M in 2017), Miss Universe Organization, and expanded brand licensing globally.",
		categories: [
			{ category: "income", claims: [
				{ id: "dt4-1", description: "The Apprentice total earnings — salary + producer fees (~$427M over run of show, per OGE disclosures and NYT)", estimatedValueUSD: 427_000_000, confidence: 65, savingRate: 60, sources: [SRC_TRUMP.ogeDisclosure, SRC_TRUMP.forbesTrump] },
			], subtotalUSD: 427_000_000, avgConfidence: 65 },
			{ category: "companies", claims: [
				{ id: "dt4-2", description: "Trump Organization properties and licensing — brand value amplified by TV exposure, NYC real estate appreciation", estimatedValueUSD: 3_500_000_000, confidence: 45, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.nycPropertyRecords, SRC_TRUMP.nySOS] },
			], subtotalUSD: 3_500_000_000, avgConfidence: 45 },
			{ category: "alternatives", claims: [
				{ id: "dt4-3", description: "Golf courses and hospitality portfolio (Trump Doral, Turnberry, Aberdeen, multiple US clubs)", estimatedValueUSD: 600_000_000, confidence: 50, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 600_000_000, avgConfidence: 50 },
		],
		phaseWealthUSD: 4_527_000_000, cumulativeWealthUSD: 4_500_000_000,
		keyEvents: ["2004: The Apprentice debuts on NBC", "2005: Trump University launched", "2012: Miss Universe Organization sold", "2015-06: Announces presidential candidacy"],
	},
	{
		id: "dt-5", title: "Presidential Term", organization: "White House / Trump Organization", role: "45th President of the United States",
		startYear: 2016, endYear: 2021, location: "Washington, D.C. / Mar-a-Lago, FL",
		description: "Elected 45th President (2016). Required OGE financial disclosures but did not fully divest from Trump Organization (handed management to sons). Tax returns leaked (2020) showed $750 federal income tax in 2016-2017. COVID-19 pandemic impacted hospitality and real estate assets. Net worth declined per Forbes tracking.",
		categories: [
			{ category: "companies", claims: [
				{ id: "dt5-1", description: "Trump Organization value during presidency (hospitality impacted by COVID, brand polarization — Forbes estimated ~$2.5B)", estimatedValueUSD: 2_500_000_000, confidence: 50, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 2_500_000_000, avgConfidence: 50 },
			{ category: "alternatives", claims: [
				{ id: "dt5-2", description: "Golf courses and Mar-a-Lago (membership fees tripled to $200K post-election)", estimatedValueUSD: 500_000_000, confidence: 55, sources: [SRC_TRUMP.palmBeachCounty, SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 500_000_000, avgConfidence: 55 },
			{ category: "income", claims: [
				{ id: "dt5-3", description: "Presidential salary ($400K/year, donated) + ongoing Trump Organization licensing income", estimatedValueUSD: 200_000_000, confidence: 60, savingRate: 50, sources: [SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 200_000_000, avgConfidence: 60 },
		],
		phaseWealthUSD: 3_200_000_000, cumulativeWealthUSD: 3_200_000_000,
		keyEvents: ["2016-11: Elected 45th President", "2017: OGE financial disclosure filed", "2020: Tax returns leaked — $750 federal income tax", "2020: COVID-19 devastates hospitality portfolio", "2021-01: Second impeachment"],
	},
	{
		id: "dt-6", title: "Post-Presidency & DJT", organization: "Trump Organization / Trump Media (DJT)", role: "47th President of the United States",
		startYear: 2021, endYear: null, location: "Mar-a-Lago, FL / Washington, D.C.",
		description: "Founded Trump Media & Technology Group (Truth Social). TMTG went public via SPAC merger with DWAC in March 2024 (Nasdaq: DJT). Trump holds ~59% of DJT shares (lock-up expired Sept 2024). DJT extremely volatile ($15-80 range). Launched $TRUMP meme coin on Solana (Jan 2025) — peaked at ~$75, highly volatile. Elected 47th President (Nov 2024). NY civil fraud judgment of $454M. Multiple criminal indictments (2023-2024). Active PEP — highest classification.",
		categories: [
			{ category: "companies", claims: [
				{ id: "dt6-1", description: "~59% stake in Trump Media & Technology Group (DJT) — extremely volatile ($15-80/share, ~188M shares)", estimatedValueUSD: 3_500_000_000, confidence: 40, sources: [SRC_TRUMP.secDJT, SRC_TRUMP.djtStock, SRC_TRUMP.secSpac] },
				{ id: "dt6-2", description: "Trump Organization real estate portfolio (Trump Tower, 40 Wall St, Doral, Chicago, licensing — 500+ LLCs)", estimatedValueUSD: 2_000_000_000, confidence: 55, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.nycPropertyRecords, SRC_TRUMP.wallStProperty, SRC_TRUMP.chicagoTower, SRC_TRUMP.nySOS, SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 5_500_000_000, avgConfidence: 48 },
			{ category: "alternatives", claims: [
				{ id: "dt6-3", description: "Golf courses worldwide (Trump National Doral, Turnberry, Bedminster, Aberdeen — 15+ courses)", estimatedValueUSD: 600_000_000, confidence: 60, sources: [SRC_TRUMP.forbesTrump, SRC_TRUMP.doralFinancials, SRC_TRUMP.ogeDisclosure] },
				{ id: "dt6-4", description: "Mar-a-Lago estate and club (Palm Beach — assessed vs. market value highly disputed)", estimatedValueUSD: 500_000_000, confidence: 45, sources: [SRC_TRUMP.palmBeachCounty, SRC_TRUMP.nyAGFraud, SRC_TRUMP.forbesTrump] },
			], subtotalUSD: 1_100_000_000, avgConfidence: 53 },
			{ category: "income", claims: [
				{ id: "dt6-5", description: "Trump Organization management fees, licensing, and golf course revenue (per OGE disclosure)", estimatedValueUSD: 300_000_000, confidence: 55, savingRate: 55, sources: [SRC_TRUMP.ogeDisclosure, SRC_TRUMP.brandLicensing] },
				{ id: "dt6-re1", description: "Mar-a-Lago club membership fees and event income (~$200K initiation + annual dues, ~500 members)", estimatedValueUSD: 50_000_000, confidence: 55, savingRate: 40, sources: [SRC_TRUMP.palmBeachCounty, SRC_TRUMP.ogeDisclosure] },
				{ id: "dt6-re2", description: "Trump Tower commercial rental income (retail + office floors, 725 Fifth Ave)", estimatedValueUSD: 30_000_000, confidence: 50, savingRate: 60, sources: [SRC_TRUMP.nycPropertyRecords, SRC_TRUMP.ogeDisclosure] },
			], subtotalUSD: 380_000_000, avgConfidence: 53 },
			{ category: "crypto", claims: [
				{ id: "dt6-6", description: "$TRUMP meme coin — 80% supply held by CIC Digital LLC / Fight Fight Fight LLC (Trump-affiliated entities)", estimatedValueUSD: 1_500_000_000, confidence: 25, sources: [SRC_TRUMP.trumpMemeCoin, SRC_TRUMP.forbesTrump] },
				{ id: "dt6-7", description: "World Liberty Financial DeFi venture and other crypto-related interests", estimatedValueUSD: 200_000_000, confidence: 20, sources: [SRC_TRUMP.trumpMemeCoin, SRC_TRUMP.bloombergTrump] },
			], subtotalUSD: 1_700_000_000, avgConfidence: 24 },
		],
		phaseWealthUSD: 8_600_000_000, cumulativeWealthUSD: 8_600_000_000,
		keyEvents: ["2021-01: Founded Trump Media & Technology Group", "2023: Multiple criminal indictments (NY, GA, Federal)", "2024-02: NY civil fraud judgment — $454M", "2024-03: TMTG/DJT goes public via SPAC merger", "2024-09: DJT lock-up expires, shares volatile", "2024-11: Elected 47th President", "2025-01-18: $TRUMP meme coin launched on Solana, peaks ~$75"],
	},
];

// ── Donald Trump: Data Sources ─────────────────────────────────

const TRUMP_SOURCES: DataSourceDef[] = [
	{ id: "ds-1", name: "OGE Public Financial Disclosure", provider: "Office of Government Ethics", category: "Regulatory Filings", delayMs: 1800 },
	{ id: "ds-2", name: "SEC EDGAR — DJT 10-K / S-1 Filings", provider: "U.S. Securities and Exchange Commission", category: "Regulatory Filings", delayMs: 1500 },
	{ id: "ds-3", name: "Forbes Real-Time Billionaires", provider: "Forbes Media", category: "Wealth Estimates", delayMs: 800 },
	{ id: "ds-4", name: "Bloomberg Billionaires Index", provider: "Bloomberg LP", category: "Wealth Estimates", delayMs: 1200 },
	{ id: "ds-5", name: "NYC ACRIS — Property Records", provider: "NYC Dept of Finance", category: "Property Records", delayMs: 1600 },
	{ id: "ds-6", name: "Palm Beach County Property Appraiser", provider: "Palm Beach County, FL", category: "Property Records", delayMs: 1400 },
	{ id: "ds-7", name: "NY Secretary of State — Entity Search", provider: "NY DOS", category: "Corporate Registry", delayMs: 1300 },
	{ id: "ds-8", name: "FEC Campaign Finance Records", provider: "Federal Election Commission", category: "Regulatory Filings", delayMs: 1100 },
	{ id: "ds-9", name: "Dow Jones Adverse Media Screening", provider: "Dow Jones Risk & Compliance", category: "Adverse Media", delayMs: 1700 },
	{ id: "ds-10", name: "OFAC / EU / UN Sanctions Lists", provider: "Multi-jurisdictional", category: "Sanctions Screening", delayMs: 900 },
	{ id: "ds-11", name: "PEP Database (Global) — Head of State", provider: "World-Check / Dow Jones", category: "PEP Screening", delayMs: 1000 },
	{ id: "ds-12", name: "Nasdaq Historical Market Data (DJT)", provider: "Nasdaq", category: "Market Data", delayMs: 1200 },
	{ id: "ds-13", name: "CoinGecko — $TRUMP Meme Coin Data", provider: "CoinGecko", category: "Crypto Market Data", delayMs: 900 },
	{ id: "ds-14", name: "PACER — Federal Bankruptcy Court Records", provider: "U.S. Courts", category: "Court Records", delayMs: 1900 },
	{ id: "ds-15", name: "Miami-Dade County — Property Records", provider: "Miami-Dade County PA", category: "Property Records", delayMs: 1400 },
	{ id: "ds-16", name: "Cook County — Chicago Property Records", provider: "Cook County Assessor", category: "Property Records", delayMs: 1500 },
	{ id: "ds-17", name: "NY Attorney General — Civil Fraud Records", provider: "NY AG Office", category: "Court Records", delayMs: 2000 },
	{ id: "ds-18", name: "Trump Organization Brand Licensing Data", provider: "Forbes / Bloomberg", category: "Company Intelligence", delayMs: 1700 },
];

// ── Donald Trump: Company Nodes ────────────────────────────────

const TRUMP_COMPANIES: CompanyNode[] = [
	{
		name: "Trump Organization", role: "Beneficial Owner", ownership: "100% (via trusts)", status: "active", valuation: "~$2B",
		type: "holding", jurisdiction: "New York, USA",
		children: [
			{ name: "Trump Tower (725 Fifth Ave)", role: "HQ & residential/commercial", status: "active", type: "subsidiary", jurisdiction: "New York", valuation: "~$300M" },
			{ name: "40 Wall Street", role: "Office tower", status: "active", type: "subsidiary", jurisdiction: "New York", valuation: "~$260M" },
			{ name: "Trump International Hotel & Tower", role: "Hotel/condo (Columbus Circle)", status: "active", type: "subsidiary", jurisdiction: "New York" },
			{ name: "Trump Park Avenue", role: "Residential property", status: "active", type: "subsidiary", jurisdiction: "New York" },
			{ name: "500+ LLCs", role: "Various holding and operating entities", status: "active", type: "subsidiary", jurisdiction: "Multi-state" },
		],
	},
	{
		name: "Trump Media & Technology Group (Nasdaq: DJT)", role: "Chairman, majority shareholder", ownership: "~59%", status: "ipo", valuation: "Volatile ($2-15B mcap range)",
		type: "holding", jurisdiction: "Delaware / Nasdaq",
		children: [
			{ name: "Truth Social", role: "Social media platform", status: "active", type: "subsidiary", jurisdiction: "USA" },
			{ name: "Truth+", role: "Streaming service (planned)", status: "pending", type: "subsidiary", jurisdiction: "USA" },
		],
	},
	{
		name: "Trump Hotels & Golf Properties", role: "Owner/Operator", ownership: "100%", status: "active", valuation: "~$600M",
		type: "holding", jurisdiction: "Multi-jurisdictional",
		children: [
			{ name: "Trump National Doral (Miami)", role: "800-acre, 4 championship courses", status: "active", type: "subsidiary", jurisdiction: "Florida", valuation: "~$200M" },
			{ name: "Trump National Bedminster", role: "Golf club, New Jersey", status: "active", type: "subsidiary", jurisdiction: "New Jersey" },
			{ name: "Trump Turnberry (Scotland)", role: "Links golf course", status: "active", type: "subsidiary", jurisdiction: "Scotland" },
			{ name: "Trump International Doonbeg (Ireland)", role: "Golf resort", status: "active", type: "subsidiary", jurisdiction: "Ireland" },
			{ name: "Trump International Hotel & Tower (Chicago)", role: "98-story mixed-use tower", status: "active", type: "subsidiary", jurisdiction: "Illinois", valuation: "~$250M" },
		],
	},
	{
		name: "Mar-a-Lago Club", role: "Owner", ownership: "100%", status: "active", valuation: "$350-500M (disputed)",
		type: "holding", jurisdiction: "Palm Beach, Florida",
	},
	{
		name: "CIC Digital LLC / Fight Fight Fight LLC", role: "Beneficial owner", ownership: "80% of $TRUMP supply", status: "active", valuation: "Highly volatile",
		type: "holding", jurisdiction: "USA",
		children: [
			{ name: "$TRUMP meme coin (Solana)", role: "80% supply controlled, launched Jan 2025", status: "active", type: "token", valuation: "Peaked ~$75, highly volatile" },
		],
	},
	{
		name: "World Liberty Financial", role: "Affiliated DeFi venture", ownership: "Affiliated", status: "active",
		type: "holding", jurisdiction: "USA",
		children: [
			{ name: "WLFI token", role: "DeFi governance token", status: "active", type: "token" },
		],
	},
	{
		name: "Trump brand licensing portfolio", role: "Licensor", ownership: "Brand IP", status: "active", valuation: "$400M+ cumulative",
		type: "holding", jurisdiction: "Global",
		children: [
			{ name: "Trump Hotels (licensed)", role: "Global hotel licensing deals", status: "active", type: "subsidiary", jurisdiction: "Global" },
			{ name: "Trump Residential (licensed)", role: "Residential tower licensing", status: "active", type: "subsidiary", jurisdiction: "Global" },
		],
	},
];

// ── Donald Trump: Key Parameters ───────────────────────────────

const TRUMP_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "Moderate — inherited real estate wealth amplified by TV fame and DJT stock, but self-reported figures historically inflated", status: "warning" },
	{ label: "Source Diversity", value: "10 sources — OGE filings, SEC EDGAR, property records, but OGE discloses ranges not exact values", status: "warning" },
	{ label: "Overall Confidence", value: `${overallConfidence(TRUMP_CAREER)}%`, status: "critical" },
	{ label: "Regulatory Exposure", value: "Extreme — NY civil fraud judgment ($454M), multiple criminal indictments, ongoing DOJ investigations", status: "critical" },
	{ label: "PEP Status", value: "Active PEP — sitting President of the United States. Highest-level classification.", status: "critical" },
	{ label: "Wealth Volatility", value: "High — DJT stock is meme-stock volatile (range $12-$79), constitutes ~50% of net worth", status: "critical" },
	{ label: "Jurisdictional Complexity", value: "Moderate — primarily US but 500+ LLCs, UK/Scotland golf properties, crypto ventures", status: "warning" },
	{ label: "Transparency Score", value: "Low — OGE discloses ranges not exact values, tax returns contested for years, 500+ opaque LLC structures", status: "critical" },
];

// ── Donald Trump: Narrative ────────────────────────────────────

const TRUMP_NARRATIVE = `Donald Trump's wealth profile presents one of the most complex compliance challenges in HNW due diligence. His estimated net worth of $6.5 billion per [Forbes](https://www.forbes.com/profile/donald-trump/) is subject to extraordinary uncertainty driven by three factors: (1) a ~59% stake in Trump Media & Technology Group (DJT) per [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001849635&type=10-K) filings that has traded between $15-80 per share since its March 2024 SPAC listing, (2) the [$TRUMP](https://www.coingecko.com/en/coins/official-trump) meme coin launched January 2025 with 80% of supply held by Trump-affiliated entities CIC Digital LLC and Fight Fight Fight LLC, and (3) a real estate portfolio whose valuations were found to be systematically overstated in the NY Attorney General's $454M civil fraud judgment.

The career trajectory shows wealth originating from Fred Trump's Brooklyn/Queens real estate empire, with significant capital transferred through family structures. The Trump Organization expanded into Manhattan commercial real estate per [NYC Finance](https://a836-pts-access.nyc.gov/) property records, Atlantic City casinos (resulting in six corporate bankruptcies between 1991-2014), and global brand licensing. NBC's The Apprentice (2004-2015) generated an estimated $427M and transformed the Trump name into a global licensing brand worth $400M+ in cumulative fees. However, brand licensing income, casino-era earnings, and Trump Organization distributions all carry moderate confidence due to the complexity of the 500+ LLC corporate structure and contested financial statements.

As the 47th President of the United States, Trump carries the highest PEP classification — mandatory enhanced due diligence and senior management approval are required. Key risk factors include: active PEP status, six corporate bankruptcies, the $454M NY civil fraud judgment, multiple criminal indictments (2023-2024), extreme DJT stock volatility, unregulated $TRUMP meme coin exposure, and incomplete asset divestiture questions. The corroboration grade of D reflects weak confidence across volatile and politically entangled asset classes.`;

// ── Donald Trump: Client Documents ─────────────────────────────

const TRUMP_CLIENT_DOCS: ClientDocument[] = [
	{ id: "cd-dt-1", type: "other", label: "OGE Public Financial Disclosure (2025)", submittedBy: "Public record — Office of Government Ethics", submittedDate: "2025-06-15", status: "verified", fileDescription: "OGE Form 278e public financial disclosure for President Donald J. Trump. Lists 500+ entities, income ranges, assets, liabilities, and agreements. Mandatory annual filing.", verificationNotes: "Government authority filing. Discloses ranges (e.g., '$1M-$5M') not exact values. Cross-referenced against SEC DJT filings.", governmentAuthority: "U.S. Office of Government Ethics" },
	{ id: "cd-dt-2", type: "incorporation-cert", label: "NY SOS — Trump Organization entity filings (500+ LLCs)", submittedBy: "Public record — NY Secretary of State", submittedDate: "2026-05-19", status: "verified", fileDescription: "New York Secretary of State entity search results. Over 500 active and inactive Trump-related LLCs and corporations. Filing dates, registered agent (The Trump Organization), and status.", verificationNotes: "100% verified — government authority. Entity list cross-referenced against OGE disclosure.", governmentAuthority: "New York Department of State" },
	{ id: "cd-dt-3", type: "other", label: "SEC 10-K — Trump Media & Technology Group (DJT)", submittedBy: "Public record — SEC EDGAR", submittedDate: "2025-04-01", status: "verified", fileDescription: "Annual report for Trump Media & Technology Group Corp (Nasdaq: DJT). Beneficial ownership: Donald J. Trump holds ~59% of outstanding shares (~188M shares). Revenue, expenses, and risk factors disclosed. Lock-up expired Sept 2024.", verificationNotes: "100% verified — SEC filing. DJT share price extremely volatile ($15-80 range). Mark-to-market swings by billions.", governmentAuthority: "U.S. Securities and Exchange Commission" },
	{ id: "cd-dt-4", type: "property-deed", label: "NYC Finance — Trump Tower (725 Fifth Ave) Assessment", submittedBy: "Public record — NYC Dept of Finance", submittedDate: "2025-01-01", status: "verified", fileDescription: "Property tax assessment for 725 Fifth Avenue (Trump Tower). Commercial condominium assessment, tax class, and ownership details.", verificationNotes: "100% verified — government authority. Assessment value may differ from market value.", governmentAuthority: "NYC Department of Finance" },
	{ id: "cd-dt-5", type: "property-deed", label: "Palm Beach County — Mar-a-Lago Assessment", submittedBy: "Public record — Palm Beach County Property Appraiser", submittedDate: "2025-01-01", status: "verified", fileDescription: "Property appraiser record for Mar-a-Lago Club, 1100 S Ocean Blvd, Palm Beach, FL. Tax assessment and special use classification.", verificationNotes: "100% verified — government authority. Tax assessment significantly below market value due to deed restriction as social club.", governmentAuthority: "Palm Beach County Property Appraiser" },
	{ id: "cd-dt-6", type: "other", label: "NY AG Civil Fraud Judgment — Trump Organization ($454M)", submittedBy: "Public record — NY Supreme Court", submittedDate: "2024-02-16", status: "flagged", fileDescription: "Court judgment in People of New York v. Donald J. Trump. Finding of persistent fraud in asset valuations. $454M disgorgement ordered. Three-year bar from serving as officer/director of NY corporation.", verificationNotes: "Court ruling. Findings of systematic asset inflation directly contradict self-reported valuations used in financial statements.", governmentAuthority: "New York Supreme Court" },
];

// ── Donald Trump: Cross-References ─────────────────────────────

const TRUMP_CROSS_REFS: CrossReference[] = [
	{ id: "xr-dt-1", field: "DJT Shareholding", clientDocLabel: "SEC 10-K (DJT)", externalSourceLabel: "Nasdaq Share Registry", clientValue: "~59% of DJT (~188M shares)", externalValue: "Confirmed via SEC proxy statement", match: "exact", confidence: 95, verifiedVia: "SEC EDGAR — government authority", notes: "Shareholding confirmed. However, mark-to-market value swings between $3B-$15B based on volatile share price." },
	{ id: "xr-dt-2", field: "Trump Tower Ownership", clientDocLabel: "NYC Finance — 725 Fifth Ave", externalSourceLabel: "OGE Financial Disclosure", clientValue: "Trump Tower commercial condo", externalValue: "Trump Tower listed as asset ($1M-$50M range)", match: "partial", confidence: 60, verifiedVia: "NYC ACRIS + OGE — both government", notes: "OGE range ($1M-$50M) too broad to confirm exact value. Forbes estimates ~$300M." },
	{ id: "xr-dt-3", field: "Mar-a-Lago Valuation", clientDocLabel: "Palm Beach County Assessment", externalSourceLabel: "Forbes Estimate / Trump Self-Report", clientValue: "Tax assessed: ~$37M (club use restriction)", externalValue: "Trump has claimed $1B+; Forbes estimates ~$300M", match: "mismatch", confidence: 40, verifiedVia: "County records vs. external estimates", notes: "Extreme divergence between tax assessment ($37M), Forbes estimate ($300M), and Trump self-valuation ($1B+). Deed restriction limits property use to social club." },
	{ id: "xr-dt-4", field: "Net Worth History", clientDocLabel: "OGE Financial Disclosure", externalSourceLabel: "NY AG Civil Fraud Findings", clientValue: "Reported assets on financial statements (loan applications)", externalValue: "Court found systematic inflation — Trump Tower penthouse at 30K sqft was actually 11K sqft", match: "mismatch", confidence: 30, verifiedVia: "NY Supreme Court judgment", notes: "Judge Engoron found persistent and pervasive fraud in asset valuations. Penthouse tripled in reported size. Financial statement reliability is severely compromised." },
	{ id: "xr-dt-5", field: "Income — The Apprentice", clientDocLabel: "OGE Filing — NBC Income", externalSourceLabel: "NYT Tax Return Investigation", clientValue: "OGE: NBC Universal income (range)", externalValue: "NYT: ~$427M total Apprentice-related income", match: "partial", confidence: 65, verifiedVia: "OGE filing + investigative journalism", notes: "OGE uses ranges not exact figures. NYT obtained tax return data that provided more precise income figures." },
	{ id: "xr-dt-6", field: "Federal Income Tax", clientDocLabel: "N/A — tax returns not provided", externalSourceLabel: "NYT Investigation (2020)", clientValue: "Tax returns never voluntarily released", externalValue: "Paid $750 federal income tax in 2016 and 2017", match: "not-available", confidence: 45, verifiedVia: "Investigative journalism — not officially confirmed", notes: "Trump is the only modern president who refused to voluntarily release tax returns. NYT obtained records independently." },
	{ id: "xr-dt-7", field: "Entity Count", clientDocLabel: "NY SOS Entity Search", externalSourceLabel: "OGE Financial Disclosure", clientValue: "500+ active/inactive LLCs in NY alone", externalValue: "OGE lists 500+ entities with income", match: "exact", confidence: 85, verifiedVia: "NY Secretary of State + OGE — both government" },
	{ id: "xr-dt-8", field: "$TRUMP Meme Coin Holdings", clientDocLabel: "CoinGecko Market Data", externalSourceLabel: "On-chain Solana Analysis", clientValue: "80% of $TRUMP supply held by CIC Digital / Fight Fight Fight LLC", externalValue: "On-chain data confirms concentrated token holdings", match: "partial", confidence: 30, verifiedVia: "On-chain analysis — wallet attribution probabilistic", notes: "Token ownership structure confirmed but actual beneficial ownership chain from LLCs to Trump personally is not formally documented. Regulatory status of meme coin is unclear." },
	{ id: "xr-dt-9", field: "NY Civil Fraud Judgment", clientDocLabel: "NY AG Court Filing", externalSourceLabel: "OGE Disclosure — Liabilities", clientValue: "$454M judgment (under appeal)", externalValue: "Not listed as liability in OGE disclosure", match: "mismatch", confidence: 85, verifiedVia: "NY Supreme Court — government authority", notes: "Judgment under appeal. If upheld, $454M liability significantly impacts net worth calculation." },
	{ id: "xr-dt-10", field: "Brand Licensing Revenue", clientDocLabel: "OGE Disclosure — Income", externalSourceLabel: "Forbes Brand Analysis", clientValue: "Licensing income listed in OGE ranges", externalValue: "Forbes estimates $400M+ cumulative licensing fees", match: "partial", confidence: 50, verifiedVia: "OGE ranges + Forbes investigative reporting", notes: "Brand licensing income is significant but exact figures unavailable. Global deals in Turkey, India, Panama, Philippines. Some projects have removed the Trump name." },
];

// ── Donald Trump: Report Assembly ──────────────────────────────

const TRUMP_REPORT: HnwReport = {
	profile: {
		id: "hnw-donald-trump",
		name: "Donald Trump",
		dateOfBirth: "1946-06-14",
		age: 80,
		nationality: "American",
		residences: ["Washington, DC", "Palm Beach, FL (Mar-a-Lago)", "New York, NY (Trump Tower)"],
		primaryIndustry: "Real Estate / Media / Politics",
		estimatedNetWorthUSD: 6_500_000_000,
		netWorthSource: "Forbes / Bloomberg (highly volatile — DJT + $TRUMP meme coin)",
		riskRating: "High",
		riskScore: 75,
		profileSummary: "47th President of the United States. Wealth derived from Trump Organization real estate, DJT/TMTG stock (~59%), brand licensing, and $TRUMP meme coin. Active PEP — highest classification. Six corporate bankruptcies. $454M NY civil fraud judgment under appeal. Extreme wealth volatility due to DJT stock and crypto exposure.",
	},
	careerTimeline: TRUMP_CAREER,
	totalEstimatedWealthUSD: 6_500_000_000,
	wealthByCategory: aggregateWealth(TRUMP_CAREER),
	overallConfidence: overallConfidence(TRUMP_CAREER),
	narrative: TRUMP_NARRATIVE,
	keyParameters: TRUMP_PARAMS,
	dataSources: TRUMP_SOURCES,
	companyNodes: TRUMP_COMPANIES,
	screeningResult: PEP_SCREENING[2],
	clientDocuments: TRUMP_CLIENT_DOCS,
	crossReferences: TRUMP_CROSS_REFS,
	uploadSlots: UPLOAD_SLOTS,
	corroborationScores: {
		consistency: 45,
		correctness: 55,
		completeness: 40,
		masReference: "MAS Notice 626 / Guidelines to Notice 626 (Prevention of Money Laundering and Countering the Financing of Terrorism) — §6.18–6.22 Source of Wealth Verification",
	},
	agentVerification: {
		agentId: "fe-verify-v2",
		agentName: "Fill Easy Verification Agent",
		timestamp: new Date().toISOString(),
		overallStatus: "flagged",
		checks: [
			{ id: "ck-dt-1", category: "consistency", label: "Career-to-wealth trajectory alignment", status: "warn", detail: "Fred Trump family transfers → Manhattan real estate → casino bankruptcies → Apprentice brand reinvention → political career → DJT/crypto. Trajectory is credible but punctuated by six corporate bankruptcies and disputed asset valuations." },
			{ id: "ck-dt-2", category: "consistency", label: "Net worth vs. historical claims", status: "flag", detail: "Trump has historically claimed net worth of $10B+. NY AG found systematic overstatement of asset values in financial statements. Forbes and Bloomberg estimates significantly lower. Self-reported figures unreliable." },
			{ id: "ck-dt-3", category: "correctness", label: "DJT/TMTG SEC filings", status: "pass", detail: "SEC filings confirm ~59% ownership of DJT shares. SPAC merger S-4 and 10-K filings verified. However, DJT trades at extreme volatility ($15-80 range) making mark-to-market highly unstable." },
			{ id: "ck-dt-4", category: "correctness", label: "Real estate valuations — government records", status: "flag", detail: "NYC ACRIS and county property records provide assessed values. NY AG judgment found Trump inflated values by 17-39% across multiple properties. Mar-a-Lago assessed at $37M vs. self-reported $739M. Fundamental reliability issue." },
			{ id: "ck-dt-5", category: "correctness", label: "$TRUMP meme coin attribution", status: "flag", detail: "$TRUMP launched Jan 2025 on Solana. 80% held by CIC Digital LLC and Fight Fight Fight LLC. Beneficial ownership chain from LLCs to Trump personally not formally documented. Regulatory status entirely unclear." },
			{ id: "ck-dt-6", category: "completeness", label: "Trump Organization structure opacity", status: "flag", detail: "500+ LLCs under Trump Organization umbrella. Full corporate structure not publicly available. Many entities are single-asset vehicles. Intercompany transactions and guarantees not independently verified." },
			{ id: "ck-dt-7", category: "completeness", label: "PEP classification and divestiture", status: "flag", detail: "Active PEP — sitting President of the United States. No blind trust established. Management transferred to sons but ownership retained. Emoluments and conflicts of interest extensively debated. Mandatory EDD required." },
			{ id: "ck-dt-8", category: "completeness", label: "Criminal proceedings impact", status: "warn", detail: "Multiple criminal indictments (2023-2024) in NY, Georgia, and federal courts. Potential fines, penalties, and legal costs not fully quantified. Impact on net worth calculation uncertain." },
			{ id: "ck-dt-9", category: "consistency", label: "Casino bankruptcy pattern", status: "pass", detail: "Six corporate bankruptcies (1991-2014) are well-documented in federal court records. All were corporate Chapter 11 filings, not personal bankruptcy. Pattern consistent with aggressive leveraging strategy." },
			{ id: "ck-dt-10", category: "correctness", label: "Brand licensing income verification", status: "warn", detail: "OGE discloses income in broad ranges, not exact figures. Forbes estimates $400M+ cumulative licensing fees but some global projects have removed the Trump name post-2016. Current licensing revenue unclear." },
		],
		summary: "Donald Trump's wealth profile receives a D corroboration grade reflecting fundamental challenges: (1) active PEP status as sitting President requiring highest-level EDD, (2) NY AG finding of systematic asset overstatement, (3) extreme volatility in DJT stock and $TRUMP meme coin, (4) 500+ LLC structure with limited transparency, and (5) multiple ongoing criminal proceedings with unquantified financial impact. The OGE and SEC filings provide some anchor points, but self-reported valuations are unreliable per court findings. Senior management approval is mandatory before any onboarding decision.",
		recommendations: [
			"MANDATORY: Obtain senior management approval — active PEP (head of state) requires board-level sign-off per MAS Notice 626",
			"Commission independent real estate appraisals — NY AG judgment invalidates self-reported values as reference points",
			"Implement daily mark-to-market for DJT holdings — share price swings can move net worth estimate by $3B+ in days",
			"Engage external counsel to assess $TRUMP meme coin regulatory status — no precedent for sitting president's crypto token",
			"Map full Trump Organization LLC structure (500+ entities) — current visibility is insufficient for KYC/AML purposes",
			"Monitor all criminal proceedings and assess potential financial penalties impact on net worth",
			"Verify beneficial ownership chain for CIC Digital LLC and Fight Fight Fight LLC ($TRUMP token holders)",
		],
	},
	corroborationGrade: "D",
	fourEyeCheck: {
		analyst: { name: "Kevin Lam", role: "Compliance Analyst", timestamp: "2026-05-19T10:00:00Z" },
		reviewer: null,
		status: "drafted",
		signOffHistory: [
			{ action: "Drafted", by: "Kevin Lam", at: "2026-05-19T10:00:00Z", comment: "High risk PEP — requires senior management review before reviewer assignment" },
		],
	},
	personalRelationships: [
		{ id: "pr-dt-1", name: "Melania Trump", relationship: "spouse", notes: "Third wife, former First Lady. Slovenian-born. Launched own cryptocurrency ($MELANIA token)." },
		{ id: "pr-dt-2", name: "Donald Trump Jr.", relationship: "child", notes: "Executive VP of Trump Organization. Active in business operations.", linkedEntities: ["Trump Organization"] },
		{ id: "pr-dt-3", name: "Eric Trump", relationship: "child", notes: "Executive VP of Trump Organization. Manages day-to-day operations.", linkedEntities: ["Trump Organization"] },
		{ id: "pr-dt-4", name: "Ivanka Trump", relationship: "child", notes: "Former senior White House advisor. Stepped back from Trump Organization.", linkedEntities: ["Trump Organization"] },
		{ id: "pr-dt-5", name: "Tiffany Trump", relationship: "child", notes: "Daughter from second marriage to Marla Maples." },
		{ id: "pr-dt-6", name: "Barron Trump", relationship: "child", notes: "Youngest son." },
		{ id: "pr-dt-7", name: "Jared Kushner", relationship: "associate", notes: "Son-in-law (married to Ivanka). Former senior White House advisor. Launched Affinity Partners ($3B fund).", linkedEntities: ["Affinity Partners"] },
		{ id: "pr-dt-8", name: "Allen Weisselberg", relationship: "associate", notes: "Former Trump Organization CFO. Pleaded guilty to tax fraud (2022). Key witness in NY AG case.", linkedEntities: ["Trump Organization"] },
	],
};



export const HNW_CASES: HnwReport[] = [JACK_MA_REPORT, YAT_SIU_REPORT, TRUMP_REPORT, CHEN_WEI_REPORT];

/* ═══════════════════════════════════════════════════════════════
   Compliance Chatbot — hardcoded conversations per subject
   ═══════════════════════════════════════════════════════════════ */

export interface ChatMessage {
	id: string;
	role: "assistant" | "user";
	text: string;
	timestamp: string;
}

export interface ChatReminder {
	id: string;
	label: string;
	dueDate: string;
	priority: "high" | "medium" | "low";
	completed: boolean;
}

export interface CaseAttentionArea {
	id: string;
	title: string;
	severity: "critical" | "warning" | "info";
	description: string;
	section: string;
}

export const CHATBOT_ATTENTION_AREAS: Record<string, CaseAttentionArea[]> = {
	"hnw-jack-ma": [
		{ id: "jm-1", title: "Ant Group Restructuring Impact", severity: "critical", description: "The halted Ant Group IPO and forced restructuring significantly affected wealth estimates. Current Ant valuation models range from $60B to $150B — the ~$78B figure used carries moderate confidence. Request updated PBOC regulatory status.", section: "Career Phase 5" },
		{ id: "jm-2", title: "Singapore Trust Transfers", severity: "critical", description: "Jack Ma transferred ~$2.4B in BABA shares to a Singapore-based family trust in 2023. Trust structure and beneficiaries remain opaque. Request trust deed and ACRA filings via Fill Easy CorpVerify.", section: "Entity Network" },
		{ id: "jm-3", title: "Blue Pool Capital AUM Verification", severity: "warning", description: "Blue Pool Capital manages an estimated ~$50B AUM but is not regulated by the SFC. No public filings available. Consider requesting voluntary disclosure from the client or a co-investor reference.", section: "Entity Network" },
		{ id: "jm-4", title: "Real Estate Valuations Stale", severity: "warning", description: "The Brandon Park estate ($23M) and Château properties use 2019-2021 purchase prices. Current market values may differ materially. Recommend independent appraisals.", section: "Alternatives" },
		{ id: "jm-5", title: "PEP Status — Chinese Communist Party", severity: "info", description: "Jack Ma was a member of the CPC and former delegate of the CPPCC. Although he has stepped back from public roles, his PEP classification remains active. Monitor for any reinstatement or new political appointments.", section: "PEP Screening" },
	],
	"hnw-yat-siu": [
		{ id: "ys-1", title: "Crypto Token Volatility — Extreme Risk", severity: "critical", description: "SAND token represents the largest single asset concentration. It has fallen ~90% from its 2021 peak ($8.40 to ~$0.30-0.60). Daily revaluation is needed for any accurate net worth assessment. On-chain verification via Etherscan is recommended.", section: "Career Phase 5-6" },
		{ id: "ys-2", title: "ASX Delisting — Regulatory Concern", severity: "critical", description: "Animoca Brands was delisted from ASX in March 2020 for repeated compliance failures. While the company characterizes this as voluntary, ASIC records indicate regulatory action. This must be prominently disclosed in any client-facing documentation.", section: "Career Phase 4" },
		{ id: "ys-3", title: "Lympo Hack — $18.7M Loss", severity: "warning", description: "Subsidiary Lympo suffered an $18.7M hot wallet hack in January 2022. Investigation status is unclear. Verify whether insurance claims were filed and if any recoveries were made.", section: "Entity Network" },
		{ id: "ys-4", title: "Currenc / Nasdaq Listing — Pending", severity: "warning", description: "Animoca Brands plans to list via SPAC merger with Currenc Group on Nasdaq. The deal is still pending SEC review. If approved, this would significantly change the liquidity profile of Yat Siu's holdings. Monitor SEC EDGAR for updates.", section: "Entity Network" },
		{ id: "ys-5", title: "Private Valuation Discrepancy", severity: "warning", description: "Animoca Brands' last private valuation was $5.9B (Jan 2022), but comparable public blockchain companies have declined 60-80%. An updated fair value assessment is needed before relying on this figure.", section: "Career Phase 5" },
		{ id: "ys-6", title: "X/Twitter Account Hack", severity: "info", description: "Yat Siu's X account was hacked in December 2024 and used for a fake token scam. While personal assets were not directly affected, this raises cybersecurity risk concerns for his crypto holdings.", section: "Risk Parameters" },
	],
	"hnw-donald-trump": [
		{ id: "dt-1", title: "Active PEP — Sitting U.S. President", severity: "critical", description: "Donald Trump is the current President of the United States — the highest-level PEP classification. Mandatory enhanced due diligence and senior management approval required. All financial dealings subject to heightened regulatory scrutiny.", section: "PEP Screening" },
		{ id: "dt-2", title: "NY Civil Fraud Judgment — Asset Valuation Unreliable", severity: "critical", description: "Judge Engoron found persistent and pervasive fraud in Trump Organization financial statements. Asset valuations on loan applications were systematically inflated. Self-reported property values cannot be relied upon. Independent appraisals are mandatory.", section: "Career Phase 3-6" },
		{ id: "dt-3", title: "DJT Stock — Meme-Stock Volatility", severity: "critical", description: "Trump Media (DJT) constitutes ~50% of net worth. The stock trades with extreme volatility ($12-$79 range) and limited correlation to business fundamentals. Truth Social revenue is minimal relative to market cap. Daily mark-to-market required.", section: "Career Phase 6" },
		{ id: "dt-4", title: "500+ LLC Structure — Opacity Risk", severity: "warning", description: "The Trump Organization operates through 500+ LLCs, creating significant opacity around cross-entity liabilities, intercompany loans, and true beneficial ownership. Full entity structure chart should be requested.", section: "Entity Network" },
		{ id: "dt-5", title: "Tax Returns Never Released", severity: "warning", description: "Trump is the only modern president who refused to voluntarily release tax returns. Without official tax documentation, income verification relies on OGE ranges and investigative journalism.", section: "Risk Parameters" },
		{ id: "dt-6", title: "Multiple Criminal and Civil Proceedings", severity: "info", description: "Multiple criminal indictments (2023-2024), NY civil fraud judgment ($454M), and E. Jean Carroll verdicts. Ongoing legal exposure may materially impact net worth through judgments, fines, and legal costs.", section: "Risk Parameters" },
	],
	"hnw-james-chen": [
		{ id: "jc-1", title: "Exemplary Documentation — Gold Standard", severity: "info", description: "All wealth sources fully documented through Singapore government authorities: Goldman Sachs employment verification, MAS CMS licence records, ACRA registrations (Fill Easy CorpVerify), IRAS tax filings, SLA property records (Fill Easy API), DBS Private Banking custody confirmations. All 8 verification checks passed. No action items.", section: "Overview" },
		{ id: "jc-2", title: "Annual Portfolio Review", severity: "info", description: "DBS Private Banking portfolio statement current as of Q1 2026. Standard annual refresh should be scheduled for Q1 2027 to maintain up-to-date portfolio verification and IRAS filing cross-check.", section: "Investments" },
		{ id: "jc-3", title: "Single Jurisdiction — Simplified Verification", severity: "info", description: "Entire wealth profile is Singapore-based — no offshore structures, no cross-border complexity. All regulatory bodies (MAS, ACRA, IRAS, SLA) are accessible via Fill Easy API for ongoing verification.", section: "Risk Parameters" },
	],
};

export const CHATBOT_REMINDERS: Record<string, ChatReminder[]> = {
	"hnw-jack-ma": [
		{ id: "r-jm-1", label: "Request updated Ant Group regulatory status from PBOC", dueDate: "2026-05-12", priority: "high", completed: false },
		{ id: "r-jm-2", label: "Follow up with client for Singapore trust deed documents", dueDate: "2026-06-09", priority: "high", completed: false },
		{ id: "r-jm-3", label: "Order independent appraisals for real estate portfolio", dueDate: "2026-06-16", priority: "medium", completed: false },
		{ id: "r-jm-4", label: "Verify Blue Pool Capital AUM with co-investor reference", dueDate: "2026-06-23", priority: "medium", completed: false },
		{ id: "r-jm-5", label: "Schedule quarterly PEP/sanctions re-screening", dueDate: "2026-07-01", priority: "low", completed: false },
	],
	"hnw-yat-siu": [
		{ id: "r-ys-1", label: "Verify SAND token holdings via on-chain Etherscan analysis", dueDate: "2026-05-10", priority: "high", completed: false },
		{ id: "r-ys-2", label: "Request ASIC delisting records via Fill Easy CorpVerify", dueDate: "2026-06-02", priority: "high", completed: false },
		{ id: "r-ys-3", label: "Check Lympo hack insurance claim status with client", dueDate: "2026-06-09", priority: "medium", completed: false },
		{ id: "r-ys-4", label: "Monitor SEC EDGAR for Currenc SPAC merger filing updates", dueDate: "2026-06-16", priority: "medium", completed: false },
		{ id: "r-ys-5", label: "Commission updated Animoca Brands fair value assessment", dueDate: "2026-06-23", priority: "high", completed: false },
		{ id: "r-ys-6", label: "Set up weekly automated SAND/REVV/TOWER price monitoring", dueDate: "2026-05-14", priority: "medium", completed: false },
	],
	"hnw-donald-trump": [
		{ id: "r-dt-1", label: "Escalate to senior management for PEP approval — active head of state", dueDate: "2026-05-20", priority: "high", completed: false },
		{ id: "r-dt-2", label: "Commission independent real estate appraisals — NY AG fraud findings prohibit reliance on self-reported values", dueDate: "2026-06-02", priority: "high", completed: false },
		{ id: "r-dt-3", label: "Monitor DJT stock daily — mark-to-market required for volatile position", dueDate: "2026-05-20", priority: "high", completed: false },
		{ id: "r-dt-4", label: "Request detailed LLC structure chart for 500+ entities", dueDate: "2026-06-09", priority: "medium", completed: false },
		{ id: "r-dt-5", label: "Review all ongoing litigation and potential liability impact", dueDate: "2026-06-16", priority: "medium", completed: false },
		{ id: "r-dt-6", label: "Schedule weekly PEP/sanctions/adverse media re-screening", dueDate: "2026-05-26", priority: "high", completed: false },
	],
	"hnw-james-chen": [
		{ id: "r-jc-1", label: "Request updated DBS Private Banking portfolio statement (Q2 2026)", dueDate: "2026-07-15", priority: "low", completed: false },
		{ id: "r-jc-2", label: "Standard quarterly PEP/sanctions re-screening per MAS Notice 626", dueDate: "2026-08-01", priority: "low", completed: false },
		{ id: "r-jc-3", label: "Monitor Forbes Singapore Rich List 2026 for net worth consistency", dueDate: "2026-08-15", priority: "low", completed: false },
	],
};

export const CHATBOT_INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
	"hnw-jack-ma": [
		{ id: "jm-c1", role: "assistant", text: "I've completed the Source of Wealth assessment for Jack Ma. Here's a summary of areas that need your attention:", timestamp: "Just now" },
		{ id: "jm-c2", role: "assistant", text: "🔴 CRITICAL: The Ant Group restructuring has created significant uncertainty in wealth estimates. The valuation gap between $60B and $150B needs resolution. I recommend requesting an updated regulatory status from the PBOC.", timestamp: "Just now" },
		{ id: "jm-c3", role: "assistant", text: "🔴 CRITICAL: The 2023 Singapore trust transfer of ~$2.4B in BABA shares needs investigation. The trust structure is opaque — request the trust deed and ACRA filings through Fill Easy CorpVerify.", timestamp: "Just now" },
		{ id: "jm-c4", role: "assistant", text: "🟡 WARNING: Blue Pool Capital's ~$50B AUM is unverified (no SFC regulation, no public filings). Real estate valuations are also stale — using 2019-2021 purchase prices.", timestamp: "Just now" },
		{ id: "jm-c5", role: "assistant", text: "I've pre-set 5 follow-up reminders for this case. You can view and manage them in the Reminders tab. Would you like me to highlight any specific area of the report?", timestamp: "Just now" },
	],
	"hnw-yat-siu": [
		{ id: "ys-c1", role: "assistant", text: "I've completed the Source of Wealth assessment for Yat Siu. This is a HIGH RISK case with several areas requiring immediate attention:", timestamp: "Just now" },
		{ id: "ys-c2", role: "assistant", text: "🔴 CRITICAL: SAND token (the largest single asset) has declined ~90% from peak. Daily revaluation is needed for accurate net worth. Recommend on-chain verification via Etherscan.", timestamp: "Just now" },
		{ id: "ys-c3", role: "assistant", text: "🔴 CRITICAL: The ASX delisting of Animoca Brands in 2020 was due to repeated compliance failures. ASIC records must be obtained and disclosed in client documentation.", timestamp: "Just now" },
		{ id: "ys-c4", role: "assistant", text: "🟡 WARNING: Animoca's $5.9B private valuation is from Jan 2022. Comparable public blockchain companies have declined 60-80%. An updated fair value assessment is essential before onboarding.", timestamp: "Just now" },
		{ id: "ys-c5", role: "assistant", text: "🟡 WARNING: The Lympo subsidiary hack ($18.7M) and pending Currenc/Nasdaq SPAC merger both need follow-up. The December 2024 X/Twitter hack also raises cybersecurity concerns.", timestamp: "Just now" },
		{ id: "ys-c6", role: "assistant", text: "I've pre-set 6 follow-up reminders for this case. You can view and manage them in the Reminders tab. Would you like me to drill into any specific risk area?", timestamp: "Just now" },
	],
	"hnw-donald-trump": [
		{ id: "dt-c1", role: "assistant", text: "I've completed the Source of Wealth assessment for Donald Trump. This is a HIGH RISK case with active PEP status requiring immediate senior management attention:", timestamp: "Just now" },
		{ id: "dt-c2", role: "assistant", text: "🔴 CRITICAL: Active PEP — Donald Trump is the sitting President of the United States. This is the highest-level PEP classification. Mandatory enhanced due diligence and senior management approval required before any engagement.", timestamp: "Just now" },
		{ id: "dt-c3", role: "assistant", text: "🔴 CRITICAL: The NY AG civil fraud judgment found systematic inflation of asset values on financial statements. Self-reported property valuations cannot be relied upon. Independent appraisals are mandatory for any wealth assessment.", timestamp: "Just now" },
		{ id: "dt-c4", role: "assistant", text: "🔴 CRITICAL: DJT stock constitutes ~50% of estimated net worth but trades as a meme stock with extreme volatility ($12-$79 range). Daily mark-to-market revaluation is required.", timestamp: "Just now" },
		{ id: "dt-c5", role: "assistant", text: "🟡 WARNING: 500+ LLC structure creates significant opacity. Tax returns have never been voluntarily released. OGE disclosures use ranges not exact values. Overall corroboration grade is D (~52% confidence).", timestamp: "Just now" },
		{ id: "dt-c6", role: "assistant", text: "I've pre-set 6 follow-up reminders for this case. The first priority is escalating to senior management for PEP approval. Would you like me to highlight any specific risk area?", timestamp: "Just now" },
	],
	"hnw-james-chen": [
		{ id: "jc-c1", role: "assistant", text: "I've completed the Source of Wealth assessment for James Chen Wei. This is a LOW RISK case with exemplary documentation:", timestamp: "Just now" },
		{ id: "jc-c2", role: "assistant", text: "VERIFIED: All wealth sources fully corroborated. Career trajectory from Goldman Sachs MD ($18M compensation, verified via GS HR + IRAS) to Meridian Capital Partners co-founder ($85M in PE carry, verified via MAS CMS licence + ACRA + SGX) to family office establishment.", timestamp: "Just now" },
		{ id: "jc-c3", role: "assistant", text: "VERIFIED: Current portfolio of $380M (SGD 510M) managed via Chen Wei Family Office Pte. Ltd. (ACRA: UEN 201012345G). Blue-chip equities, fixed income, PE fund-of-funds, and prime Singapore real estate — all confirmed through DBS Private Banking custody, SGX market data, and Fill Easy SLA property records.", timestamp: "Just now" },
		{ id: "jc-c4", role: "assistant", text: "VERIFIED: Two Singapore properties confirmed via Fill Easy API — Sentosa Cove bungalow (S$28M current) and Nassim Road GCB (S$55M current). Both cross-referenced against URA transaction data. All 8 verification checks passed with zero flags.", timestamp: "Just now" },
		{ id: "jc-c5", role: "assistant", text: "Overall corroboration grade: A (~88% confidence). Four-eye check approved by Michael Wong. No follow-up items required — standard quarterly monitoring cycle applies. Would you like to review any section in detail?", timestamp: "Just now" },
	],
};
