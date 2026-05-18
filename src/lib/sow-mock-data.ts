/* ═══════════════════════════════════════════════════════════════
   HNW Wealth Intelligence — Data Model & Mock Data
   Two reference cases: Jack Ma (Alibaba) & Yat Siu (Animoca)
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
	status: "active" | "ipo" | "exited" | "restructured" | "delisted";
	valuation?: string;
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
}

export interface HnwMonitoringEntry {
	id: string;
	name: string;
	nameCn?: string;
	industry: string;
	estimatedNetWorthUSD: number;
	riskRating: "Low" | "Medium" | "High";
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
		id: "s9", label: "FilEasy API: SAMR — Alibaba Group Registration", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | China SAMR — Alibaba Group Holding Limited", "FilEasy China Cross-Border API query result for SAMR National Enterprise Credit Information System. Alibaba Group Holding Limited — Unified Social Credit Code, legal representative 马云, registered capital, business scope, and credit standing returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "SAMR National Enterprise Credit Information System (via FilEasy API)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Company Name (企业名称)", value: "阿里巴巴集团控股有限公司" },
				{ label: "Unified Social Credit Code", value: "91330100799999776H" },
				{ label: "Search Type", value: "Enterprise Name Exact Match" },
			],
			jurisdiction: "People's Republic of China",
			searchType: "SAMR Enterprise Search (via FilEasy China Cross-Border)",
		},
	},
	yahooAcq: {
		id: "s10", label: "Yahoo acquires 40% of Alibaba for $1B", url: "https://www.nytimes.com/2005/08/11/technology/yahoo-alibaba.html", date: "2005-08-11", type: "news",
		...srcMeta("nytimes.com", "Yahoo to Buy 40% of Alibaba | NYT", "New York Times article from August 2005 reporting Yahoo's acquisition of 40% stake in Alibaba for $1 billion plus the contribution of Yahoo China operations.", "#000000"),
	},
	softbank: {
		id: "s11", label: "SoftBank $20M investment in Alibaba (2000)", url: "https://group.softbank/en/about/history", date: "2000-01-01", type: "news",
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
		id: "s24", label: "FilEasy API: HK Land Registry — Victoria Peak Property Record", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | HK Land Registry — Property Search — The Peak", "FilEasy API property search result for Hong Kong Land Registry. Victoria Peak residence at 15 Barker Road. Transaction price HK$1.5 billion. Registered owner details, lot number, and memorial records returned via API.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Land Registry (via FilEasy API)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Property Address", value: "15 Barker Road, The Peak, Hong Kong" },
				{ label: "Lot Number", value: "IL 8847" },
				{ label: "Search Type", value: "Address Search" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "Property Search (via FilEasy API)",
		},
	},
	acraRegistry: {
		id: "s25", label: "FilEasy API: Singapore ACRA — Ma Family Trust Pte. Ltd.", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | CorpVerify — Singapore ACRA BizFile+", "FilEasy CorpVerify API query result for Singapore ACRA BizFile+. Entity: Ma Family Trust Pte. Ltd. UEN: 202312345A. Registration date, registered address, directors, secretary, and filing status returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Singapore ACRA — BizFile+ (via FilEasy CorpVerify)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Entity Name", value: "Ma Family Trust Pte. Ltd." },
				{ label: "UEN", value: "202312345A" },
				{ label: "Entity Type", value: "Private Company Limited by Shares" },
			],
			jurisdiction: "Republic of Singapore",
			searchType: "Entity Name / UEN Search (via FilEasy CorpVerify)",
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
	fileasyAlibabaHK: {
		id: "s28", label: "FilEasy API: HK CR — Alibaba Group (HK) Ltd", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | HK Companies Registry — Alibaba Group (HK) Limited", "FilEasy CorpVerify API search result for Alibaba Group (HK) Limited. CR No. 1359598. Incorporation date, registered office, directors, annual return filings. Hong Kong subsidiary of Alibaba Group Holdings.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Companies Registry (via FilEasy CorpVerify)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Alibaba Group (HK) Limited" },
				{ label: "CR No.", value: "1359598" },
				{ label: "Director Name", value: "MA Yun" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "CR Online Search (via FilEasy CorpVerify)",
		},
	},
	fileasySAMRCredit: {
		id: "s29", label: "FilEasy API: SAMR Credit Standing — Alibaba Group", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | SAMR Credit Standing & Judicial Records — Alibaba", "FilEasy China Cross-Border API returning SAMR credit standing and judicial records for Alibaba Group. Credit status: Normal. Judicial records: $2.8B antitrust fine (2021, resolved). No serious violations on record. UBO chain verified.", "#0066aa"),
	},
	fileasySAMRJudicial: {
		id: "s30", label: "FilEasy API: SAMR Judicial Records — Ant Group", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | SAMR Judicial & Litigation — Ant Group Co., Ltd.", "FilEasy China Cross-Border API returning judicial and litigation records for Ant Group Co., Ltd. Regulatory orders from PBOC: financial holding company restructuring (2021-2023). Administrative actions resolved. Current status: compliant.", "#0066aa"),
	},
	chateauDeSours: {
		id: "s31", label: "SCMP: Jack Ma acquires Château de Sours vineyard in Bordeaux", url: "https://www.scmp.com/lifestyle/food-drink/article/1858015/jack-ma-buys-bordeaux-vineyard", type: "news",
		...srcMeta("scmp.com", "Jack Ma Buys Second Bordeaux Vineyard | SCMP", "South China Morning Post article reporting Jack Ma's acquisition of Château de Sours, a 54-hectare Bordeaux property in the Entre-Deux-Mers appellation. This is Ma's second French vineyard purchase, following Château Guerry.", "#ffca05"),
	},
	frenchPropertyRegistry: {
		id: "s32", label: "Service de Publicité Foncière: Château de Sours deed", url: "https://www.impots.gouv.fr/", type: "registry",
		...srcMeta("impots.gouv.fr", "SPF | Publicité Foncière — Château de Sours, Bordeaux", "French land registry (Service de Publicité Foncière) records for Château de Sours, Saint-Quentin-de-Baron, Gironde. Property transfer registered. 54 hectares of vines and château.", "#002395"),
	},
	fileasySAMRUBO: {
		id: "s33", label: "FilEasy API: SAMR UBO — Yunfeng Capital", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | SAMR UBO & Shareholder Structure — Yunfeng Capital", "FilEasy China Cross-Border API returning UBO and shareholder structure for Yunfeng Capital Management. Ultimate beneficial owners identified. MA Yun listed as co-founder and significant shareholder. Registered capital and business scope confirmed.", "#0066aa"),
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
				{ id: "jm1-1", description: "University lecturer salary (~$15/month for 7 years, confirmed via NBS education sector wage tables)", estimatedValueUSD: 12_600, confidence: 100, sources: [SRC_MA.chinaSalaryStats, SRC_MA.chinaIIT] },
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
				{ id: "jm2-1", description: "Salary and earnings from China Pages and MOFTEC (~$500/month, cross-checked against NBS sector wage data)", estimatedValueUSD: 24_000, confidence: 85, sources: [SRC_MA.prcWageData, SRC_MA.chinaIIT] },
			], subtotalUSD: 24_000, avgConfidence: 85 },
			{ category: "companies", claims: [
				{ id: "jm2-2", description: "China Pages equity (diluted after Hangzhou Telecom partnership, exited near-zero — FilEasy SAMR search + Clark biography)", estimatedValueUSD: 0, confidence: 50, sources: [SRC_MA.alibabaBio, SRC_MA.samr] },
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
				{ id: "jm3-1", description: "CEO compensation at Alibaba Group (salary + bonuses, 1999-2014, benchmarked via Equilar)", estimatedValueUSD: 5_000_000, confidence: 75, sources: [SRC_MA.equilarComp, SRC_MA.chinaIIT] },
			], subtotalUSD: 5_000_000, avgConfidence: 75 },
			{ category: "companies", claims: [
				{ id: "jm3-2", description: "Pre-IPO Alibaba Group equity stake (accumulated ~8.9% through founding shares, FilEasy SAMR + HK CR verified)", estimatedValueUSD: 1_500_000_000, confidence: 80, sources: [SRC_MA.goldmanSachs, SRC_MA.softbank, SRC_MA.yahooAcq, SRC_MA.samr, SRC_MA.sharespostPreIPO, SRC_MA.fileasyAlibabaHK] },
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
			], subtotalUSD: 800_000_000, avgConfidence: 40 },
			{ category: "alternatives", claims: [
				{ id: "jm4-5", description: "Property holdings — HK Victoria Peak mansion (HK$1.5B), Hangzhou residences, reported overseas properties", estimatedValueUSD: 200_000_000, confidence: 70, sources: [SRC_MA.scmpProperty, SRC_MA.hkLandReg] },
			], subtotalUSD: 200_000_000, avgConfidence: 70 },
		],
		phaseWealthUSD: 26_000_000_000, cumulativeWealthUSD: 26_000_000_000,
		keyEvents: ["2014-09-19: Alibaba IPO raises $25B on NYSE", "2016: Alibaba surpasses Walmart as world's largest retailer", "2018: Ant Financial raises $14B at $150B valuation", "2019-09-10: Ma steps down as Alibaba Chairman"],
	},
	{
		id: "jm-5", title: "Regulatory Crackdown & Restructuring", organization: "Ant Group / Alibaba Group", role: "Former Chairman",
		startYear: 2019, endYear: 2023, location: "Hangzhou / Overseas",
		description: "After stepping down, Ma gave a speech criticizing financial regulators in October 2020. Within days, Ant Group's $37B dual IPO was suspended. Ma disappeared from public view for ~3 months. Alibaba was hit with a $2.8B antitrust fine. Ant Group was forced to restructure as a financial holding company under central bank supervision. Ma's wealth declined sharply.",
		categories: [
			{ category: "companies", claims: [
				{ id: "jm5-1", description: "Alibaba stake declined — BABA fell from ~$300 to ~$80 (2020-2023), stake value ~$8-12B", estimatedValueUSD: 10_000_000_000, confidence: 80, sources: [SRC_MA.babaPrice, SRC_MA.bloomberg] },
				{ id: "jm5-2", description: "Ant Group stake post-restructuring — valuation collapsed from $150B to ~$70B, Ma's ~10% = ~$7B (FilEasy SAMR judicial records)", estimatedValueUSD: 7_000_000_000, confidence: 50, sources: [SRC_MA.reutersAnt, SRC_MA.wsj2023, SRC_MA.antRestructure, SRC_MA.fileasySAMRJudicial] },
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
				{ id: "jm6-2", description: "Ant Group stake (restructured entity, estimated ~$70-80B valuation, Ma's ~8% post-dilution — FilEasy SAMR credit & judicial records)", estimatedValueUSD: 6_000_000_000, confidence: 45, sources: [SRC_MA.antRestructure, SRC_MA.bloomberg, SRC_MA.fileasySAMRJudicial, SRC_MA.fileasySAMRCredit] },
			], subtotalUSD: 18_500_000_000, avgConfidence: 58 },
			{ category: "investments", claims: [
				{ id: "jm6-3", description: "Yunfeng Capital and other PE/VC fund interests (FilEasy SAMR UBO verification)", estimatedValueUSD: 1_500_000_000, confidence: 35, sources: [SRC_MA.yunfeng, SRC_MA.fileasySAMRUBO] },
				{ id: "jm6-4", description: "Singapore family trust (transferred $2.4B in BABA shares, FilEasy CorpVerify ACRA search)", estimatedValueUSD: 2_400_000_000, confidence: 95, sources: [SRC_MA.ftTrust, SRC_MA.acraRegistry] },
			], subtotalUSD: 3_900_000_000, avgConfidence: 65 },
			{ category: "alternatives", claims: [
				{ id: "jm6-5", description: "Global real estate portfolio (HK Victoria Peak, Hangzhou, New York — FilEasy Land Registry search confirmed)", estimatedValueUSD: 250_000_000, confidence: 75, sources: [SRC_MA.scmpProperty, SRC_MA.hkLandReg] },
				{ id: "jm6-7", description: "Bordeaux vineyards — Château de Sours (54 ha) and Château Guerry, French property registry confirmed", estimatedValueUSD: 30_000_000, confidence: 60, sources: [SRC_MA.chateauDeSours, SRC_MA.frenchPropertyRegistry] },
				{ id: "jm6-6", description: "Art collection, wine, other luxury assets (benchmarked via Wealth-X UHNW report)", estimatedValueUSD: 70_000_000, confidence: 40, sources: [SRC_MA.wealthXReport, SRC_MA.forbes2024] },
			], subtotalUSD: 350_000_000, avgConfidence: 58 },
		],
		phaseWealthUSD: 22_750_000_000, cumulativeWealthUSD: 25_500_000_000,
		keyEvents: ["2023-04: $2.4B Alibaba shares transferred to Singapore trust", "2023-06: Alibaba splits into 6 business groups", "2024: Focus on agriculture technology and education"],
	},
];

// ── Yat Siu: Sources ────────────────────────────────────────────

const SRC_SIU: Record<string, SourceCitation> = {
	ibmAcq: {
		id: "y1", label: "IBM acquires Outblaze messaging division", url: "https://newsroom.ibm.com/2009-08-05-IBM-Acquires-Outblaze-Web-Community-Technology", date: "2009-01-01", type: "news",
		...srcMeta("ibm.com", "IBM Acquires Outblaze Web Community Technology | IBM", "IBM press release announcing acquisition of Outblaze's web messaging and community services division. Deal value estimated at $10-20 million. Hong Kong-based technology transfer.", "#0530ad"),
	},
	asxListing: {
		id: "y2", label: "ASX: Animoca Brands IPO listing", url: "https://www2.asx.com.au/markets/company/AB1", date: "2015-01-01", type: "market-data",
		...srcMeta("asx.com.au", "ASX | Animoca Brands Corporation Limited (AB1)", "Australian Securities Exchange company page for Animoca Brands (ticker: AB1). Historical listing data showing IPO date, initial market capitalization, and trading history from 2015.", "#002244"),
	},
	asxDelist: {
		id: "y3", label: "ASX: Animoca Brands delisted over crypto accounting", url: "https://www2.asx.com.au/markets/company/AB1", date: "2020-03-25", type: "registry",
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
		id: "y4", label: "TechCrunch: Animoca raises $358M at $5.9B valuation", url: "https://techcrunch.com/2022/01/18/animoca-brands-raises-358-million/", date: "2022-01-18", type: "news",
		...srcMeta("techcrunch.com", "Animoca Brands raises $358.8M at $5.9B valuation | TechCrunch", "TechCrunch article dated January 18, 2022. Reports Animoca Brands completing $358.8 million funding round at $5.9 billion valuation. Investors include Liberty City Ventures, Soros Fund Management.", "#0a9c00"),
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
		id: "y8", label: "FilEasy API: HK CR — Outblaze Limited", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | HK Companies Registry — Outblaze Limited", "FilEasy CorpVerify API search result for Outblaze Limited via HK Companies Registry. Company number 0651683, incorporation date, registered office address, directors (SIU Yat), and annual return filings returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Companies Registry (via FilEasy CorpVerify)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Outblaze Limited" },
				{ label: "Company Number", value: "0651683" },
				{ label: "Document Type", value: "Annual Return (NAR1)" },
				{ label: "Director Name", value: "SIU Yat" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "CR Online Search (via FilEasy CorpVerify)",
		},
	},
	forbesSiu: {
		id: "y9", label: "Forbes: Yat Siu profile & net worth estimate", url: "https://www.forbes.com/profile/yat-siu/", date: "2024-06-01", type: "estimate",
		...srcMeta("forbes.com", "Yat Siu - Forbes Profile", "Forbes profile page for Yat Siu. Net worth estimate based on Animoca Brands stake and crypto holdings. Industry classification: Blockchain/Gaming.", "#c4112f"),
	},
	bloombergSiu: {
		id: "y10", label: "Bloomberg: Animoca Brands profile", url: "https://www.bloomberg.com/profile/company/1610751D:HK", type: "news",
		...srcMeta("bloomberg.com", "Animoca Brands | Bloomberg Company Profile", "Bloomberg company profile for Animoca Brands showing key executives, financial data, funding rounds, and recent news coverage. Chairman Yat Siu listed as key person.", "#1e1e1e"),
	},
	sandboxAcq: {
		id: "y11", label: "Animoca acquires The Sandbox from Pixowl", url: "https://www.animocabrands.com/animoca-brands-acquires-tsb-game-studio", date: "2018-08-01", type: "news",
		...srcMeta("animocabrands.com", "Animoca Brands Acquires TSB Gaming Studio | Press Release", "Animoca Brands press release announcing acquisition of TSB Game Studio (Pixowl) and The Sandbox game. Strategic pivot to blockchain gaming outlined.", "#ff6b35"),
	},
	sandPeak: {
		id: "y12", label: "SAND all-time high $8.40 (Nov 25, 2021)", url: "https://www.coingecko.com/en/coins/the-sandbox", date: "2021-11-25", type: "market-data",
		...srcMeta("coingecko.com", "SAND ATH $8.40 (Nov 25, 2021) | CoinGecko", "CoinGecko SAND price chart zoomed to November 25, 2021 showing all-time high of $8.40. 24h volume exceeding $5.7 billion. Market cap at peak above $7 billion.", "#8bc53f"),
	},
	hkPolicy: {
		id: "y13", label: "HKMA: Virtual asset regulatory framework", url: "https://www.hkma.gov.hk/eng/key-functions/banking/banking-regulatory-and-supervisory-regime/virtual-assets/", date: "2023-06-01", type: "public-record",
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
		id: "y17", label: "FilEasy API: HK Land Registry — Mid-Levels Property", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | HK Land Registry — Property Search — Mid-Levels", "FilEasy API property search result for Hong Kong Land Registry. Mid-Levels residential property. Owner: SIU Yat. Purchase date 2005. Historical transaction prices and ownership memorials returned via API.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Land Registry (via FilEasy API)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Owner Name", value: "SIU Yat" },
				{ label: "Property Address", value: "Mid-Levels, Hong Kong Island" },
				{ label: "Search Type", value: "Owner Name Search" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "Property Owner Search (via FilEasy API)",
		},
	},
	asxHistorical: {
		id: "y18", label: "ASX Historical Market Cap: Animoca (AB1)", url: "https://www2.asx.com.au/markets/company/AB1", type: "market-data",
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
		id: "y21", label: "HK Rating & Valuation Dept: Property Price Indices", url: "https://www.rvd.gov.hk/en/property_market_statistics/", type: "public-record",
		...srcMeta("rvd.gov.hk", "RVD | Private Domestic — Price Indices", "HK Rating and Valuation Department property price index showing residential price movements. Mid-Levels area index tracked.", "#003366"),
	},
	fileasyHKCR: {
		id: "y22", label: "FilEasy API: HK Companies Registry — Animoca Brands Ltd", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | HK Companies Registry — Animoca Brands Limited", "FilEasy API search result for HK Companies Registry. Returns CR No., incorporation date, registered office, directors (SIU Yat listed), secretary, and annual return filings.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Hong Kong Companies Registry (via FilEasy API)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Animoca Brands Limited" },
				{ label: "CR No.", value: "2283149" },
				{ label: "Director Name", value: "SIU Yat" },
				{ label: "Document Type", value: "Annual Return (NAR1) + Directors Register" },
			],
			jurisdiction: "Hong Kong SAR",
			searchType: "CR Online Search (via FilEasy API)",
		},
	},
	fileasyOutblaze: {
		id: "y23", label: "FilEasy API: HK Companies Registry — Outblaze Limited", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | HK Companies Registry — Outblaze Limited", "FilEasy API response for Outblaze Limited. Confirmed incorporation 1998, director SIU Yat, registered office in Wan Chai. Annual return filings from 1998-2012.", "#0066aa"),
	},
	hkIRD: {
		id: "y24", label: "HK Inland Revenue Dept: Profits Tax Filing Confirmation", url: "https://www.ird.gov.hk/eng/", type: "public-record",
		...srcMeta("ird.gov.hk", "IRD | eTAX — Filing Status Confirmation", "Hong Kong Inland Revenue Department eTAX portal showing profits tax filing confirmation for Outblaze Limited and salaries tax filing status for individual taxpayer.", "#003366"),
	},
	asicRegistry: {
		id: "y25", label: "FilEasy API: ASIC — Animoca Brands Corporation Ltd", url: "https://www.fileasy.hk/", type: "registry",
		...srcMeta("fileasy.hk", "FilEasy | CorpVerify — ASIC Company Search — Animoca Brands", "FilEasy CorpVerify API search result for Australian Securities & Investments Commission. Animoca Brands Corporation Limited (ACN 122 921 813). Registered in Victoria. Directors, secretary, registered office, and annual return history returned.", "#0066aa"),
		companySearchTemplate: {
			registryName: "Australian Securities & Investments Commission (via FilEasy CorpVerify)",
			registryUrl: "https://www.fileasy.hk/",
			searchFields: [
				{ label: "Company Name", value: "Animoca Brands Corporation Limited" },
				{ label: "ACN", value: "122 921 813" },
				{ label: "ABN", value: "29 122 921 813" },
				{ label: "State", value: "VIC" },
			],
			jurisdiction: "Australia (Commonwealth)",
			searchType: "Organisation & Business Names Search (via FilEasy CorpVerify)",
		},
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
				{ id: "ys1-1", description: "Atari software engineer salary (1990-1995, verified via BLS occupational wage data)", estimatedValueUSD: 150_000, confidence: 90, sources: [SRC_SIU.blsWages] },
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
				{ id: "ys2-1", description: "CEO salary at Outblaze (1998-2012, cross-checked via HK C&SD IT sector earnings and IRD filings)", estimatedValueUSD: 2_000_000, confidence: 100, sources: [SRC_SIU.hkCensusStats, SRC_SIU.hkIRD, SRC_SIU.fileasyOutblaze] },
			], subtotalUSD: 2_000_000, avgConfidence: 100 },
			{ category: "companies", claims: [
				{ id: "ys2-2", description: "Sale of Outblaze messaging division to IBM (~$10-20M, Siu retained majority — HK CR confirmed via FilEasy)", estimatedValueUSD: 15_000_000, confidence: 85, sources: [SRC_SIU.ibmAcq, SRC_SIU.hkCompanies, SRC_SIU.fileasyOutblaze] },
			], subtotalUSD: 15_000_000, avgConfidence: 85 },
			{ category: "alternatives", claims: [
				{ id: "ys2-3", description: "Hong Kong residential property acquired during this period (FilEasy Land Registry search confirmed)", estimatedValueUSD: 3_000_000, confidence: 100, sources: [SRC_SIU.hkLandRegistry, SRC_SIU.hkRVD] },
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
				{ id: "ys3-1", description: "Animoca Brands ASX listing equity (co-founder stake ~55%, FilEasy ASIC + HK CR verified, ASX market cap AU$20-50M)", estimatedValueUSD: 20_000_000, confidence: 95, sources: [SRC_SIU.asxListing, SRC_SIU.asxHistorical, SRC_SIU.asicRegistry, SRC_SIU.fileasyHKCR] },
			], subtotalUSD: 20_000_000, avgConfidence: 95 },
			{ category: "income", claims: [
				{ id: "ys3-2", description: "Chairman compensation at Animoca Brands (ASX annual report + FilEasy ASIC verification)", estimatedValueUSD: 1_500_000, confidence: 100, sources: [SRC_SIU.asxAnnualReport, SRC_SIU.asicRegistry] },
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
				{ id: "ys4-1", description: "Animoca Brands equity (post-delisting, private valuation rising, ~$100M by late 2020 per PitchBook)", estimatedValueUSD: 55_000_000, confidence: 60, sources: [SRC_SIU.asxDelist, SRC_SIU.pitchbook, SRC_SIU.fileasyHKCR] },
			], subtotalUSD: 55_000_000, avgConfidence: 60 },
			{ category: "crypto", claims: [
				{ id: "ys4-2", description: "SAND token allocation (team/founder allocation, tokens worth ~$0.05-0.10 pre-boom)", estimatedValueUSD: 5_000_000, confidence: 45, sources: [SRC_SIU.coinGecko, SRC_SIU.sandboxAcq] },
				{ id: "ys4-3", description: "Various NFT and token holdings from early blockchain gaming investments", estimatedValueUSD: 3_000_000, confidence: 30, sources: [SRC_SIU.dappradar] },
			], subtotalUSD: 8_000_000, avgConfidence: 38 },
			{ category: "investments", claims: [
				{ id: "ys4-4", description: "Early investments in Dapper Labs, Sky Mavis (Axie Infinity), and other blockchain startups", estimatedValueUSD: 10_000_000, confidence: 40, sources: [SRC_SIU.crunchbase] },
			], subtotalUSD: 10_000_000, avgConfidence: 40 },
		],
		phaseWealthUSD: 73_000_000, cumulativeWealthUSD: 114_650_000,
		keyEvents: ["2018: Acquired The Sandbox from Pixowl", "2019: SAND token launched", "2019: Invested in Dapper Labs", "2020-03: ASX delists Animoca Brands"],
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
				{ id: "ys5-4", description: "Various token allocations from 340+ portfolio investments", estimatedValueUSD: 200_000_000, confidence: 30, sources: [SRC_SIU.crunchbase, SRC_SIU.coinGecko] },
			], subtotalUSD: 1_150_000_000, avgConfidence: 40 },
			{ category: "investments", claims: [
				{ id: "ys5-5", description: "Portfolio of 340+ blockchain/Web3 investments (book value)", estimatedValueUSD: 500_000_000, confidence: 45, sources: [SRC_SIU.crunchbase, SRC_SIU.bloombergSiu] },
			], subtotalUSD: 500_000_000, avgConfidence: 45 },
			{ category: "alternatives", claims: [
				{ id: "ys5-6", description: "Hong Kong property portfolio (appreciated — FilEasy Land Registry search and RVD index confirmed)", estimatedValueUSD: 8_000_000, confidence: 100, sources: [SRC_SIU.hkLandRegistry, SRC_SIU.hkRVD] },
			], subtotalUSD: 8_000_000, avgConfidence: 100 },
		],
		phaseWealthUSD: 3_658_000_000, cumulativeWealthUSD: 3_658_000_000,
		keyEvents: ["2021-05: Sequoia China leads $65M round", "2021-11-25: SAND peaks at $8.40 (ATH)", "2022-01: Animoca raises $358.8M at $5.9B valuation", "2022: 340+ blockchain investments made"],
	},
	{
		id: "ys-6", title: "Market Correction & Rebuilding", organization: "Animoca Brands", role: "Co-Founder & Chairman",
		startYear: 2023, endYear: null, location: "Hong Kong",
		description: "Crypto winter caused severe portfolio markdowns. SAND fell ~90% from peak. NFT market collapsed. However, Animoca Brands maintained its $5.9B valuation from last funding round (no down round). Siu became active in Hong Kong's virtual asset regulatory framework, positioning Animoca as a key player in HK's Web3 hub strategy.",
		categories: [
			{ category: "companies", claims: [
				{ id: "ys6-1", description: "Animoca Brands equity (last round $5.9B, PitchBook secondary data suggests 30-50% discount)", estimatedValueUSD: 1_200_000_000, confidence: 55, sources: [SRC_SIU.tcAnimoca, SRC_SIU.bloombergSiu, SRC_SIU.pitchbook, SRC_SIU.fileasyHKCR] },
			], subtotalUSD: 1_200_000_000, avgConfidence: 55 },
			{ category: "crypto", claims: [
				{ id: "ys6-2", description: "SAND token holdings at current price (~$0.30-0.60, down ~93% from peak)", estimatedValueUSD: 60_000_000, confidence: 65, sources: [SRC_SIU.coinGecko] },
				{ id: "ys6-3", description: "NFT portfolio (severely depreciated, floor prices down 80-95%)", estimatedValueUSD: 15_000_000, confidence: 25, sources: [SRC_SIU.dappradar] },
				{ id: "ys6-4", description: "Remaining token positions from portfolio companies", estimatedValueUSD: 30_000_000, confidence: 20, sources: [SRC_SIU.crunchbase, SRC_SIU.coinGecko] },
			], subtotalUSD: 105_000_000, avgConfidence: 37 },
			{ category: "investments", claims: [
				{ id: "ys6-5", description: "Blockchain/Web3 portfolio (heavily marked down but some survivors)", estimatedValueUSD: 150_000_000, confidence: 30, sources: [SRC_SIU.crunchbase] },
			], subtotalUSD: 150_000_000, avgConfidence: 30 },
			{ category: "alternatives", claims: [
				{ id: "ys6-6", description: "Hong Kong property and other tangible assets (FilEasy Land Registry search confirmed, RVD indexed)", estimatedValueUSD: 7_000_000, confidence: 100, sources: [SRC_SIU.hkLandRegistry, SRC_SIU.hkRVD] },
			], subtotalUSD: 7_000_000, avgConfidence: 100 },
		],
		phaseWealthUSD: 1_462_000_000, cumulativeWealthUSD: 2_400_000_000,
		keyEvents: ["2023: SAND drops below $0.50", "2023-06: HK launches virtual asset regulatory framework", "2024: Animoca active in HK Web3 hub strategy", "2024: No down-round — maintains $5.9B last-round valuation"],
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
	{ id: "ds-4", name: "FilEasy — SAMR Enterprise Credit + Judicial Records", provider: "FilEasy Ltd / China SAMR", category: "Corporate Registry", delayMs: 1500 },
	{ id: "ds-5", name: "PBOC Ant Group Regulatory Filings", provider: "People's Bank of China", category: "Regulatory Filings", delayMs: 2000 },
	{ id: "ds-6", name: "Forbes Real-Time Billionaires", provider: "Forbes Media", category: "Wealth Estimates", delayMs: 800 },
	{ id: "ds-7", name: "FilEasy — HK Land Registry Property Search", provider: "FilEasy Ltd / HKSAR Land Reg", category: "Property Records", delayMs: 1400 },
	{ id: "ds-8", name: "Dow Jones Adverse Media Screening", provider: "Dow Jones Risk & Compliance", category: "Adverse Media", delayMs: 1600 },
	{ id: "ds-9", name: "OFAC / EU / UN Sanctions Lists", provider: "Multi-jurisdictional", category: "Sanctions Screening", delayMs: 900 },
	{ id: "ds-10", name: "PEP Database (Global)", provider: "World-Check / Dow Jones", category: "PEP Screening", delayMs: 1100 },
	{ id: "ds-11", name: "Crunchbase — Investment Portfolio", provider: "Crunchbase Inc.", category: "Investment Data", delayMs: 1300 },
	{ id: "ds-12", name: "FilEasy — Singapore ACRA Registry Search", provider: "FilEasy Ltd / SG ACRA", category: "Trust & Structures", delayMs: 1700 },
	{ id: "ds-13", name: "FilEasy — HK Companies Registry Search", provider: "FilEasy Ltd / HKSAR CR", category: "Corporate Registry", delayMs: 1400 },
	{ id: "ds-14", name: "China Individual Income Tax Records", provider: "State Taxation Administration", category: "Tax Records", delayMs: 1900 },
	{ id: "ds-15", name: "FilEasy — SAMR UBO & Shareholder Structures", provider: "FilEasy Ltd / China SAMR", category: "Corporate Registry", delayMs: 1600 },
	{ id: "ds-16", name: "French Land Registry (SPF)", provider: "Service de Publicité Foncière", category: "Property Records", delayMs: 2100 },
];

const YAT_SIU_SOURCES: DataSourceDef[] = [
	{ id: "ds-1", name: "FilEasy — HK Companies Registry Search", provider: "FilEasy Ltd / HKSAR CR", category: "Corporate Registry", delayMs: 1500 },
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
	{ id: "ds-13", name: "FilEasy — HK Land Registry Property Search", provider: "FilEasy Ltd / HKSAR Land Reg", category: "Property Records", delayMs: 1100 },
	{ id: "ds-14", name: "FilEasy — ASIC Company Register Search", provider: "FilEasy Ltd / AU ASIC", category: "Corporate Registry", delayMs: 1600 },
	{ id: "ds-15", name: "HK Inland Revenue Department", provider: "HKSAR IRD", category: "Tax Records", delayMs: 1800 },
];

// ── Company Nodes (for network graph) ───────────────────────────

const JACK_MA_COMPANIES: CompanyNode[] = [
	{ name: "Alibaba Group (NYSE: BABA)", role: "Founder & Former Chairman", ownership: "~4.5%", status: "active", valuation: "$215B" },
	{ name: "Ant Group", role: "Co-founder, former controlling shareholder", ownership: "~8%", status: "restructured", valuation: "~$70B" },
	{ name: "Yunfeng Capital", role: "Co-founder", ownership: "GP interest", status: "active", valuation: "AUM ~$8B" },
	{ name: "Jack Ma Foundation", role: "Founder", status: "active" },
	{ name: "Singapore Family Trust", role: "Settlor", status: "active", valuation: "$2.4B+" },
];

const YAT_SIU_COMPANIES: CompanyNode[] = [
	{ name: "Animoca Brands", role: "Co-founder & Chairman", ownership: "~30-40%", status: "active", valuation: "$5.9B (last round)" },
	{ name: "The Sandbox", role: "Parent company (via Animoca)", ownership: "Subsidiary", status: "active", valuation: "SAND mcap ~$900M" },
	{ name: "Outblaze Limited", role: "Founder", ownership: "Majority", status: "exited", valuation: "Messaging sold to IBM" },
	{ name: "Animoca Ventures", role: "GP", ownership: "GP interest", status: "active", valuation: "340+ investments" },
	{ name: "nWay (fighting games)", role: "Via Animoca", ownership: "Subsidiary", status: "active" },
];

// ── Key Parameters ──────────────────────────────────────────────

const JACK_MA_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "High — career trajectory clearly explains wealth accumulation", status: "normal" },
	{ label: "Source Diversity", value: "16 independent sources across filings, market data, registries (FilEasy multi-registry)", status: "normal" },
	{ label: "Overall Confidence", value: `${overallConfidence(JACK_MA_CAREER)}%`, status: "normal" },
	{ label: "Regulatory Exposure", value: "Significant — Ant Group restructuring, Alibaba antitrust fine", status: "warning" },
	{ label: "PEP Status", value: "Near-match — political connections in China require monitoring", status: "warning" },
	{ label: "Wealth Volatility", value: "Moderate — Alibaba stock fluctuations, Ant Group valuation uncertainty", status: "warning" },
	{ label: "Jurisdictional Complexity", value: "High — China, Hong Kong, Singapore, global structures", status: "warning" },
	{ label: "Transparency Score", value: "Good — SEC filings, NYSE listing provide verified data", status: "normal" },
];

const YAT_SIU_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "Plausible but volatile — majority tied to crypto asset valuations", status: "warning" },
	{ label: "Source Diversity", value: "15 sources (FilEasy multi-registry) but crypto data has lower reliability", status: "warning" },
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
		adverseMedia: 2,
		adverseMediaDetails: "ASX delisting of Animoca Brands over crypto accounting disputes (2020). General crypto industry regulatory scrutiny coverage.",
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

const JACK_MA_NARRATIVE = `Jack Ma's wealth trajectory is one of the most documented in modern Chinese business history. His estimated net worth of approximately $25.5 billion is overwhelmingly derived from his founding equity in Alibaba Group, which was crystallized through the company's record-breaking $25 billion NYSE IPO in September 2014. SEC Form F-1 filings confirm Ma held approximately 6.2% of Alibaba shares at IPO, valued at ~$14.3 billion against the initial $231 billion market capitalization.

The wealth accumulation path is clearly traceable: from a $60,000 pooled founding investment in 1999, through successive institutional rounds (Goldman Sachs $5M, SoftBank $20M, Yahoo $1B), to public market valuation. This represents the highest-confidence portion of his wealth profile, backed by regulatory filings and exchange data.

Lower-confidence components include his stake in Ant Group (restructured under PBOC supervision after the 2020 IPO suspension, current valuation estimates range from $70-80B), his Yunfeng Capital fund interests, and real estate holdings. The 2023 transfer of $2.4B in Alibaba shares to a Singapore family trust adds jurisdictional complexity.

Key risk factors include significant regulatory exposure (Ant Group restructuring, $2.8B Alibaba antitrust fine), PEP near-match status from his former CPPCC membership, and ongoing uncertainty about the true value of his Ant Group stake post-restructuring. Despite these factors, the overall wealth plausibility score is high — the career trajectory clearly explains the accumulation of wealth at this scale.`;

const YAT_SIU_NARRATIVE = `Yat Siu's estimated net worth of approximately $2.4 billion represents one of the more complex wealth profiles in the technology sector due to its heavy concentration in crypto assets and private company equity. Unlike traditional tech billionaires whose wealth is anchored to publicly traded shares, approximately 85% of Siu's estimated wealth derives from two sources: his co-founder stake in Animoca Brands (last valued at $5.9B in January 2022) and crypto/NFT holdings whose valuations have experienced extreme volatility.

The career trajectory shows a credible progression from early tech roles at Atari, through the founding and IBM exit of Outblaze (~$15M), to the strategic pivot of Animoca Brands into blockchain gaming. The acquisition of The Sandbox in 2018 proved transformative — SAND token reached an all-time high of $8.40 in November 2021.

However, significant valuation uncertainty persists. SAND has declined approximately 93% from its peak. NFT market values have collapsed 80-95% from 2021 highs. Animoca Brands' $5.9B valuation is based on the last funding round (January 2022) and has not been tested by a subsequent round or public offering. Secondary market estimates suggest a 30-50% discount may be appropriate.

The overall confidence score is notably lower than typical UHNW profiles. On-chain data provides some transparency for crypto holdings, but private company valuations, unrealized investment returns from 340+ portfolio companies, and illiquid NFT holdings create substantial uncertainty. The ASX delisting in 2020 removed mandatory public disclosure requirements, further reducing transparency.`;

// ── Monitoring Table ────────────────────────────────────────────

export const HNW_MONITORING: HnwMonitoringEntry[] = [
	{ id: "m1", name: "Jack Ma", nameCn: "马云", industry: "E-Commerce / Fintech", estimatedNetWorthUSD: 25_500_000_000, riskRating: "Medium", lastScreened: "2026-05-17", openAlerts: 2, status: "Under Review", screeningFrequency: "Monthly" },
	{ id: "m2", name: "Yat Siu", nameCn: "蕭逸", industry: "Blockchain Gaming / Web3", estimatedNetWorthUSD: 2_400_000_000, riskRating: "High", lastScreened: "2026-05-17", openAlerts: 3, status: "Active", screeningFrequency: "Weekly" },
	{ id: "m3", name: "Elon Musk", industry: "EV / Space / AI", estimatedNetWorthUSD: 240_000_000_000, riskRating: "Medium", lastScreened: "2026-05-15", openAlerts: 5, status: "Flagged", screeningFrequency: "Weekly" },
	{ id: "m4", name: "Changpeng Zhao", nameCn: "赵长鹏", industry: "Crypto Exchanges", estimatedNetWorthUSD: 33_000_000_000, riskRating: "High", lastScreened: "2026-05-16", openAlerts: 4, status: "Flagged", screeningFrequency: "Weekly" },
	{ id: "m5", name: "Masayoshi Son", nameCn: "孙正义", industry: "Venture Capital / Telecom", estimatedNetWorthUSD: 10_300_000_000, riskRating: "Low", lastScreened: "2026-05-14", openAlerts: 0, status: "Active", screeningFrequency: "Monthly" },
	{ id: "m6", name: "Li Ka-shing", nameCn: "李嘉诚", industry: "Real Estate / Conglomerate", estimatedNetWorthUSD: 35_000_000_000, riskRating: "Low", lastScreened: "2026-05-12", openAlerts: 1, status: "Active", screeningFrequency: "Quarterly" },
	{ id: "m7", name: "Vitalik Buterin", industry: "Blockchain / Ethereum", estimatedNetWorthUSD: 1_500_000_000, riskRating: "Medium", lastScreened: "2026-05-16", openAlerts: 1, status: "Active", screeningFrequency: "Monthly" },
];

// ── Notifications ───────────────────────────────────────────────

export const HNW_NOTIFICATIONS: HnwNotification[] = [
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
	{ id: "cd-jm-4", type: "trust-deed", label: "FilEasy API: Singapore ACRA — Ma Family Trust Pte. Ltd.", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Singapore ACRA BizFile+ record for Ma Family Trust Pte. Ltd. (UEN: 202312345A). Entity registration, directors, secretary, and filing status. Retrieved via FilEasy CorpVerify API.", verificationNotes: "100% verified — government authority. FilEasy CorpVerify returned ACRA exact match. Trust entity registration confirmed. Trust deed (provided separately by client counsel) references this entity.", governmentAuthority: "Singapore ACRA (via FilEasy CorpVerify)" },
	{ id: "cd-jm-5", type: "tax-return", label: "PRC Individual Income Tax — 2025 Filing Summary", submittedBy: "Client (via PwC China)", submittedDate: "2026-04-25", status: "verified", fileDescription: "Summary of PRC Individual Income Tax (IIT) filing for calendar year 2025. Zhejiang Province filing. Comprehensive income, capital gains, and offshore income reported.", verificationNotes: "IIT filing consistent with disclosed compensation and investment income. Cross-referenced against NBS tax bracket data.", governmentAuthority: "China State Taxation Administration (STA)" },
	{ id: "cd-jm-6", type: "property-deed", label: "FilEasy API: HK Land Registry — Victoria Peak Residence", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Hong Kong Land Registry memorial showing property at 15 Barker Road, The Peak. Purchase price: HK$1.5 billion. Registered owner details confirmed via FilEasy property search API.", verificationNotes: "100% verified — government authority. FilEasy API returned land registry memorial with registered owner, lot number, and transaction history. Price matches SCMP reporting.", governmentAuthority: "Hong Kong Land Registry (via FilEasy API)" },
	{ id: "cd-jm-7", type: "incorporation-cert", label: "FilEasy API: SAMR — Alibaba Group Holdings Registration", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "SAMR National Enterprise Credit Information System record for Alibaba Group Holding Limited. USCC: 91330100799999776H. Legal representative: 马云. Business scope, registered capital, credit standing, and judicial records returned.", verificationNotes: "100% verified — government authority. FilEasy China Cross-Border API returned full SAMR registration, credit standing (Normal), and judicial records (antitrust fine resolved 2021).", governmentAuthority: "China SAMR (via FilEasy China Cross-Border)" },
	{ id: "cd-jm-8", type: "incorporation-cert", label: "FilEasy API: HK CR — Alibaba Group (HK) Limited", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Hong Kong Companies Registry record for Alibaba Group (HK) Limited (CR No. 1359598). Directors, registered office, annual returns. Hong Kong subsidiary entity.", verificationNotes: "100% verified — government authority. FilEasy CorpVerify returned exact match on company name and CR number.", governmentAuthority: "Hong Kong Companies Registry (via FilEasy CorpVerify)" },
	{ id: "cd-jm-9", type: "property-deed", label: "French Land Registry — Château de Sours, Bordeaux", submittedBy: "Client (via Notaire, Bordeaux)", submittedDate: "2026-05-02", status: "verified", fileDescription: "Service de Publicité Foncière deed for Château de Sours, Saint-Quentin-de-Baron, Gironde. 54-hectare vineyard property. Owner: corporate entity linked to Ma Yun. Second French vineyard acquisition after Château Guerry.", verificationNotes: "Verified via French land registry. Ownership via corporate entity — beneficial owner cross-referenced against SCMP reporting. Valuation estimate from vineyard broker data.", governmentAuthority: "Service de Publicité Foncière (French Land Registry)" },
];

const YAT_SIU_CLIENT_DOCS: ClientDocument[] = [
	{ id: "cd-ys-1", type: "passport", label: "Austrian Passport — SIU Yat", submittedBy: "Client (directly)", submittedDate: "2026-04-10", status: "verified", fileDescription: "Republic of Austria passport. Name: SIU Yat. DOB: 01 JAN 1973. Passport No: P••••••12. Austrian citizenship. Valid through 2033.", verificationNotes: "Name matches HK Companies Registry (FilEasy API) director records for Animoca Brands Limited and Outblaze Limited.", governmentAuthority: "Austrian Federal Ministry of the Interior" },
	{ id: "cd-ys-2", type: "other", label: "Hong Kong Identity Card — SIU Yat", submittedBy: "Client (directly)", submittedDate: "2026-04-10", status: "verified", fileDescription: "HKID card for SIU Yat. Permanent resident status confirmed. HKID No: A••••••(•).", verificationNotes: "HKID matches Immigration Department records cross-referenced via Companies Registry filings.", governmentAuthority: "HK Immigration Department" },
	{ id: "cd-ys-3", type: "incorporation-cert", label: "HK Companies Registry — Outblaze Limited (CR via FilEasy)", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Certificate of Incorporation for Outblaze Limited (CR No. 0651683). Incorporated 1998 in Hong Kong. Directors: SIU Yat. Registered office: Wan Chai, HK.", verificationNotes: "100% verified — government authority. FilEasy API returned exact match. Director name matches passport.", governmentAuthority: "Hong Kong Companies Registry (via FilEasy API)" },
	{ id: "cd-ys-4", type: "annual-return", label: "FilEasy API: ASIC — Animoca Brands Corporation Ltd", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "ASIC annual return for Animoca Brands Corporation Limited (ACN 122 921 813). Directors include SIU Yat. Registered in Victoria, Australia. Retrieved via FilEasy CorpVerify API.", verificationNotes: "100% verified — government authority. FilEasy CorpVerify returned ASIC exact match. Directorship and company registration confirmed.", governmentAuthority: "Australian Securities & Investments Commission (via FilEasy CorpVerify)" },
	{ id: "cd-ys-5", type: "bank-statement", label: "HSBC Private Banking — HKD Account Statement", submittedBy: "Client (via HSBC HK)", submittedDate: "2026-04-15", status: "verified", fileDescription: "HSBC Private Banking statement for account ending ••7293. Period: Jan-Mar 2026. Shows salary credits from Animoca Brands, dividend income, and crypto exchange settlements.", verificationNotes: "Salary credits match ASX annual report executive remuneration disclosures. HSBC is HKMA-regulated institution.", governmentAuthority: "Hong Kong Monetary Authority (HKMA) — regulated institution" },
	{ id: "cd-ys-6", type: "property-deed", label: "FilEasy API: HK Land Registry — Mid-Levels Residential Property", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "Hong Kong Land Registry memorial for residential property in Mid-Levels. Owner: SIU Yat. Purchase completed 2005. Current estimated value per RVD index. Retrieved via FilEasy property search API.", verificationNotes: "100% verified — government authority. FilEasy API returned land registry memorial with registered owner and transaction history. RVD price index applied for current valuation.", governmentAuthority: "Hong Kong Land Registry (via FilEasy API)" },
	{ id: "cd-ys-7", type: "incorporation-cert", label: "FilEasy API: Animoca Brands Limited — HK CR Search", submittedBy: "FilEasy API — automated retrieval", submittedDate: "2026-05-17", status: "verified", fileDescription: "HK Companies Registry record for Animoca Brands Limited (CR No. 2283149). Incorporation date, registered office, directors (SIU Yat), secretary, annual returns.", verificationNotes: "100% verified — government authority. FilEasy API exact match on company name and CR number.", governmentAuthority: "Hong Kong Companies Registry (via FilEasy API)" },
];

// ── Cross-References ───────────────────────────────────────────

const JACK_MA_CROSS_REFS: CrossReference[] = [
	{ id: "xr-jm-1", field: "Full Name", clientDocLabel: "PRC Passport", externalSourceLabel: "SEC Form F-1 (2014)", clientValue: "MA YUN (马云)", externalValue: "Ma Yun (Jack Ma)", match: "exact", confidence: 100, verifiedVia: "SEC EDGAR — government authority", notes: "English alias 'Jack Ma' confirmed in SEC filing" },
	{ id: "xr-jm-2", field: "Date of Birth", clientDocLabel: "PRC Passport", externalSourceLabel: "Forbes Billionaires Profile", clientValue: "10 SEP 1964", externalValue: "September 10, 1964", match: "exact", confidence: 100, verifiedVia: "Multiple independent sources" },
	{ id: "xr-jm-3", field: "BABA Shareholding", clientDocLabel: "Morgan Stanley Custody Confirmation", externalSourceLabel: "SEC 20-F Annual Report (2024)", clientValue: "~131M shares (4.5%)", externalValue: "4.5% beneficial ownership", match: "exact", confidence: 100, verifiedVia: "SEC EDGAR — government authority" },
	{ id: "xr-jm-4", field: "Dividend Income (Q1 2026)", clientDocLabel: "DBS Bank Statement", externalSourceLabel: "NYSE BABA Dividend Record", clientValue: "$3.2M received", externalValue: "$3.18M (131M shares × $0.0243)", match: "exact", confidence: 100, verifiedVia: "NYSE market data + bank records" },
	{ id: "xr-jm-5", field: "Trust Entity", clientDocLabel: "FilEasy: ACRA — Ma Family Trust", externalSourceLabel: "FT Reporting — Share Transfer", clientValue: "Ma Family Trust Pte. Ltd. (UEN: 202312345A)", externalValue: "$2.4B BABA shares transferred (Apr 2023)", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify (ACRA) — government authority" },
	{ id: "xr-jm-6", field: "HK Property", clientDocLabel: "FilEasy: HK Land Registry — Victoria Peak", externalSourceLabel: "SCMP Property Investigation", clientValue: "15 Barker Road, The Peak — HK$1.5B", externalValue: "Victoria Peak mansion, HK$1.5B", match: "exact", confidence: 100, verifiedVia: "HK Land Registry via FilEasy API — government authority" },
	{ id: "xr-jm-7", field: "Tax Filing Status", clientDocLabel: "PRC IIT Filing Summary", externalSourceLabel: "NBS Wage Data + SEC Compensation", clientValue: "IIT filed, Zhejiang Province", externalValue: "Alibaba HQ in Hangzhou, Zhejiang", match: "exact", confidence: 100, verifiedVia: "China STA — government authority" },
	{ id: "xr-jm-8", field: "Alibaba Registration", clientDocLabel: "FilEasy: SAMR — Alibaba Group", externalSourceLabel: "SEC F-1 — Alibaba Group Holding", clientValue: "USCC: 91330100799999776H / Legal rep: 马云", externalValue: "Alibaba Group Holding Limited — CIK 0001577552", match: "exact", confidence: 100, verifiedVia: "FilEasy China Cross-Border (SAMR) — government authority" },
	{ id: "xr-jm-9", field: "Alibaba HK Entity", clientDocLabel: "FilEasy: HK CR — Alibaba Group (HK) Ltd", externalSourceLabel: "SEC 20-F — Subsidiary List", clientValue: "CR No. 1359598 — Alibaba Group (HK) Limited", externalValue: "Hong Kong subsidiary listed in 20-F Exhibit 8.1", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify (HK CR) — government authority" },
	{ id: "xr-jm-10", field: "Bordeaux Vineyard", clientDocLabel: "French Land Registry — Château de Sours", externalSourceLabel: "SCMP Lifestyle Report", clientValue: "Château de Sours, 54 ha, Saint-Quentin-de-Baron", externalValue: "\"Jack Ma buys second Bordeaux vineyard\"", match: "partial", confidence: 70, verifiedVia: "French SPF + news cross-reference", notes: "Ownership via corporate entity — beneficial owner inferred from news reports, not directly named on French deed. Valuation uncertain." },
	{ id: "xr-jm-11", field: "New York Property", clientDocLabel: "Client self-declaration", externalSourceLabel: "NYC Dept of Finance — ACRIS", clientValue: "Reported luxury residence, Manhattan", externalValue: "No matching record found under MA YUN or known entities", match: "not-available", confidence: 20, verifiedVia: "NYC ACRIS search — no result", notes: "Client disclosed NYC property but no matching deed found in ACRIS under known name or entity variants. May be held via undisclosed LLC." },
	{ id: "xr-jm-12", field: "Ant Group Stake", clientDocLabel: "Client counsel disclosure", externalSourceLabel: "Reuters / WSJ — Post-restructuring reports", clientValue: "~10% personal stake in Ant Group", externalValue: "Ma ceded control; stake diluted to ~8% post-restructuring", match: "partial", confidence: 55, verifiedVia: "News sources — no official registry confirmation", notes: "Client claims 10% but post-restructuring dilution suggests ~8%. Ant Group is private with no mandatory disclosure — exact figure unverifiable." },
	{ id: "xr-jm-13", field: "Ant Group Credit Standing", clientDocLabel: "FilEasy: SAMR — Ant Group Judicial Records", externalSourceLabel: "PBOC Restructuring Approval", clientValue: "SAMR status: Normal, judicial orders resolved", externalValue: "PBOC approved financial holding company status (Jul 2023)", match: "exact", confidence: 100, verifiedVia: "FilEasy China Cross-Border (SAMR Judicial) — government authority" },
];

const YAT_SIU_CROSS_REFS: CrossReference[] = [
	{ id: "xr-ys-1", field: "Full Name", clientDocLabel: "Austrian Passport", externalSourceLabel: "FilEasy: HK CR — Animoca Brands Ltd", clientValue: "SIU Yat", externalValue: "SIU Yat — Director", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify (HK CR) — government authority" },
	{ id: "xr-ys-2", field: "HKID", clientDocLabel: "Hong Kong Identity Card", externalSourceLabel: "FilEasy: HK CR — Director Record", clientValue: "A••••••(•)", externalValue: "HKID on file with CR", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify (HK CR) — government authority" },
	{ id: "xr-ys-3", field: "Outblaze Directorship", clientDocLabel: "FilEasy: HK CR — Outblaze Limited", externalSourceLabel: "IBM Acquisition Press Release", clientValue: "Director since 1998", externalValue: "Founder/CEO — selling party", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify (HK CR) — government authority" },
	{ id: "xr-ys-4", field: "Animoca Brands Directorship", clientDocLabel: "FilEasy: HK CR — Animoca Brands Ltd", externalSourceLabel: "FilEasy: ASIC — Animoca Brands Corp", clientValue: "Director — CR No. 2283149", externalValue: "Director — ACN 122 921 813", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify — dual registry (HK CR + ASIC)" },
	{ id: "xr-ys-5", field: "Salary Income", clientDocLabel: "HSBC Bank Statement", externalSourceLabel: "ASX Annual Report — Remuneration", clientValue: "HK$425,000/month salary credit", externalValue: "AU$780,000 p.a. chairman remuneration", match: "exact", confidence: 100, verifiedVia: "ASX filing + HKMA-regulated bank" },
	{ id: "xr-ys-6", field: "Property Ownership", clientDocLabel: "FilEasy: HK Land Registry — Mid-Levels", externalSourceLabel: "RVD Property Price Index", clientValue: "Owner: SIU Yat, purchased 2005", externalValue: "Mid-Levels Class D index: +85% since 2005", match: "exact", confidence: 100, verifiedVia: "HK Land Registry via FilEasy API — government authority" },
	{ id: "xr-ys-7", field: "Austrian Citizenship", clientDocLabel: "Austrian Passport", externalSourceLabel: "FilEasy: ASIC — Director Records", clientValue: "Austrian national", externalValue: "Nationality: Austria", match: "exact", confidence: 100, verifiedVia: "FilEasy CorpVerify (ASIC) — government authority" },
	{ id: "xr-ys-8", field: "SAND Token Holdings", clientDocLabel: "Client self-declaration", externalSourceLabel: "CoinGecko + On-chain Wallet Analysis", clientValue: "~150M SAND tokens (founder allocation)", externalValue: "Wallets linked to Animoca hold ~120-180M SAND", match: "partial", confidence: 55, verifiedVia: "On-chain analysis — wallet attribution probabilistic", notes: "Founder/team allocation confirmed by token contract but exact personal portion vs. company holdings unclear. Wallet clustering suggests range." },
	{ id: "xr-ys-9", field: "NFT Portfolio Value", clientDocLabel: "Client self-declaration", externalSourceLabel: "DappRadar Portfolio Tracker", clientValue: "$50M estimated (personal collection)", externalValue: "Floor price aggregate: ~$12-18M", match: "mismatch", confidence: 25, verifiedVia: "DappRadar floor price methodology", notes: "Client's self-assessed NFT value ($50M) significantly exceeds market floor prices ($12-18M). NFT valuations are illiquid and subjective. Last sold comparables suggest 60-75% markdown from client estimate." },
	{ id: "xr-ys-10", field: "Animoca Brands Valuation", clientDocLabel: "Client counsel (investor deck)", externalSourceLabel: "PitchBook Secondary Market Data", clientValue: "$5.9B (last funding round, Jan 2022)", externalValue: "Secondary trades imply $2.5-3.5B (30-50% discount)", match: "partial", confidence: 45, verifiedVia: "PitchBook private secondary market", notes: "Last round valuation ($5.9B) has not been tested by a subsequent round. Secondary market estimates suggest significant discount. No IPO or down-round to establish current fair value." },
	{ id: "xr-ys-11", field: "IBM Acquisition Proceeds", clientDocLabel: "FilEasy: HK CR — Outblaze Limited", externalSourceLabel: "IBM Press Release (2009)", clientValue: "Messaging division sold — est. $10-20M", externalValue: "IBM confirms acquisition, no price disclosed", match: "partial", confidence: 70, verifiedVia: "IBM newsroom + HK CR records", notes: "IBM confirmed the acquisition but never disclosed the price. Range of $10-20M is inferred from industry comparables and media reports. Exact figure unverifiable." },
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
};

export const HNW_CASES: HnwReport[] = [JACK_MA_REPORT, YAT_SIU_REPORT];
