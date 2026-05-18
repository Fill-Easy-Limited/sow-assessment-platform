/* ═══════════════════════════════════════════════════════════════
   HNW Wealth Intelligence — Data Model & Mock Data
   Two reference cases: Jack Ma (Alibaba) & Yat Siu (Animoca)
   ═══════════════════════════════════════════════════════════════ */

// ── Interfaces ──────────────────────────────────────────────────

export interface SourceCitation {
	id: string;
	label: string;
	url?: string;
	date?: string;
	type: "filing" | "news" | "registry" | "market-data" | "public-record" | "estimate";
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

const SRC_MA: Record<string, SourceCitation> = {
	secF1:        { id: "s1", label: "SEC Form F-1 (Alibaba Group, 2014)", url: "https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm", date: "2014-05-06", type: "filing" },
	nyseIpo:      { id: "s2", label: "NYSE: BABA IPO — $25B raised at $68/share", date: "2014-09-19", type: "market-data" },
	forbes2024:   { id: "s3", label: "Forbes Real-Time Billionaires (Ma Yun)", url: "https://www.forbes.com/profile/jack-ma/", date: "2024-12-01", type: "estimate" },
	bloomberg:    { id: "s4", label: "Bloomberg Billionaires Index", date: "2024-12-01", type: "estimate" },
	scmpAnt:      { id: "s5", label: "SCMP: Ant Group $150B valuation before IPO halt", date: "2020-11-03", type: "news" },
	reutersAnt:   { id: "s6", label: "Reuters: Ant Group IPO suspended by regulators", date: "2020-11-03", type: "news" },
	wsj2023:      { id: "s7", label: "WSJ: Ma cedes control of Ant Group", date: "2023-01-07", type: "news" },
	ftTrust:      { id: "s8", label: "FT: Jack Ma transfers $2.4B Alibaba shares to Singapore trust", date: "2023-04-18", type: "news" },
	samr:         { id: "s9", label: "SAMR National Enterprise Credit Information (Alibaba)", type: "registry" },
	yahooAcq:     { id: "s10", label: "Yahoo acquires 40% of Alibaba for $1B", date: "2005-08-11", type: "news" },
	softbank:     { id: "s11", label: "SoftBank $20M investment in Alibaba (2000)", date: "2000-01-01", type: "news" },
	goldmanSachs: { id: "s12", label: "Goldman Sachs leads $5M Series A for Alibaba", date: "1999-10-01", type: "news" },
	yunfeng:      { id: "s13", label: "Yunfeng Capital AUM ~$8B (Crunchbase)", type: "estimate" },
	jmFound:      { id: "s14", label: "Jack Ma Foundation annual report", date: "2023-01-01", type: "public-record" },
	babaPrice:    { id: "s15", label: "NYSE BABA historical share price", type: "market-data" },
	antRestructure: { id: "s16", label: "PBOC: Ant Group restructuring approval", date: "2023-07-07", type: "public-record" },
};

// ── Jack Ma: Career Timeline ────────────────────────────────────

const JACK_MA_CAREER: CareerPhase[] = [
	{
		id: "jm-1", title: "English Teacher", organization: "Hangzhou Institute of Electronic Engineering", role: "Lecturer",
		startYear: 1988, endYear: 1995, location: "Hangzhou, China",
		description: "Taught English at a local university after graduating from Hangzhou Normal University. Monthly salary approximately $12-20. Built foundational communication skills and first visited the US in 1995 where he encountered the internet.",
		categories: [
			{ category: "income", claims: [
				{ id: "jm1-1", description: "University lecturer salary (~$15/month for 7 years)", estimatedValueUSD: 12_600, confidence: 60, sources: [{ id: "est-1", label: "Estimated from PRC public university salary scales (1988-1995)", type: "estimate" }] },
			], subtotalUSD: 12_600, avgConfidence: 60 },
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
				{ id: "jm2-1", description: "Salary and earnings from China Pages and MOFTEC (~$500/month average)", estimatedValueUSD: 24_000, confidence: 40, sources: [{ id: "est-2", label: "Estimated from PRC private/government sector norms (late 1990s)", type: "estimate" }] },
			], subtotalUSD: 24_000, avgConfidence: 40 },
			{ category: "companies", claims: [
				{ id: "jm2-2", description: "China Pages equity (diluted after Hangzhou Telecom partnership, eventually exited at near-zero)", estimatedValueUSD: 0, confidence: 50, sources: [{ id: "news-1", label: "Various biographies of Jack Ma document China Pages failure", type: "news" }] },
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
				{ id: "jm3-1", description: "CEO compensation at Alibaba Group (salary + bonuses, 1999-2014)", estimatedValueUSD: 5_000_000, confidence: 45, sources: [{ id: "est-3", label: "Estimated from Chinese tech CEO compensation benchmarks", type: "estimate" }] },
			], subtotalUSD: 5_000_000, avgConfidence: 45 },
			{ category: "companies", claims: [
				{ id: "jm3-2", description: "Pre-IPO Alibaba Group equity stake (accumulated ~8.9% through founding shares)", estimatedValueUSD: 1_500_000_000, confidence: 70, sources: [SRC_MA.goldmanSachs, SRC_MA.softbank, SRC_MA.yahooAcq, { id: "est-4", label: "Pre-IPO secondary market estimates", type: "estimate" }] },
			], subtotalUSD: 1_500_000_000, avgConfidence: 70 },
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
				{ id: "jm4-5", description: "Property holdings including residences in Hong Kong, Hangzhou, and reported overseas properties", estimatedValueUSD: 200_000_000, confidence: 30, sources: [{ id: "est-5", label: "Media reports on luxury property purchases", type: "news" }] },
			], subtotalUSD: 200_000_000, avgConfidence: 30 },
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
				{ id: "jm5-2", description: "Ant Group stake post-restructuring — valuation collapsed from $150B to ~$70B, Ma's ~10% = ~$7B", estimatedValueUSD: 7_000_000_000, confidence: 50, sources: [SRC_MA.reutersAnt, SRC_MA.wsj2023, SRC_MA.antRestructure] },
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
				{ id: "jm6-2", description: "Ant Group stake (restructured entity, estimated ~$70-80B valuation, Ma's ~8% post-dilution)", estimatedValueUSD: 6_000_000_000, confidence: 45, sources: [SRC_MA.antRestructure, SRC_MA.bloomberg] },
			], subtotalUSD: 18_500_000_000, avgConfidence: 58 },
			{ category: "investments", claims: [
				{ id: "jm6-3", description: "Yunfeng Capital and other PE/VC fund interests", estimatedValueUSD: 1_500_000_000, confidence: 35, sources: [SRC_MA.yunfeng] },
				{ id: "jm6-4", description: "Singapore family trust (transferred $2.4B in BABA shares)", estimatedValueUSD: 2_400_000_000, confidence: 85, sources: [SRC_MA.ftTrust] },
			], subtotalUSD: 3_900_000_000, avgConfidence: 60 },
			{ category: "alternatives", claims: [
				{ id: "jm6-5", description: "Global real estate portfolio (Hong Kong, Hangzhou, reported properties in New York, France)", estimatedValueUSD: 300_000_000, confidence: 25, sources: [{ id: "news-re", label: "SCMP, Bloomberg reporting on property holdings", type: "news" }] },
				{ id: "jm6-6", description: "Art collection, wine, other luxury assets", estimatedValueUSD: 50_000_000, confidence: 15, sources: [{ id: "est-lux", label: "Industry estimates for UHNW lifestyle assets", type: "estimate" }] },
			], subtotalUSD: 350_000_000, avgConfidence: 20 },
		],
		phaseWealthUSD: 22_750_000_000, cumulativeWealthUSD: 25_500_000_000,
		keyEvents: ["2023-04: $2.4B Alibaba shares transferred to Singapore trust", "2023-06: Alibaba splits into 6 business groups", "2024: Focus on agriculture technology and education"],
	},
];

// ── Yat Siu: Sources ────────────────────────────────────────────

const SRC_SIU: Record<string, SourceCitation> = {
	ibmAcq:        { id: "y1", label: "IBM acquires Outblaze messaging division", date: "2009-01-01", type: "news" },
	asxListing:    { id: "y2", label: "ASX: Animoca Brands IPO listing", date: "2015-01-01", type: "market-data" },
	asxDelist:     { id: "y3", label: "ASX: Animoca Brands delisted over crypto accounting", date: "2020-03-25", type: "registry" },
	tcAnimoca:     { id: "y4", label: "TechCrunch: Animoca raises $358M at $5.9B valuation", url: "https://techcrunch.com/2022/01/18/animoca-brands-raises-358-million/", date: "2022-01-18", type: "news" },
	coinGecko:     { id: "y5", label: "CoinGecko: SAND token historical price data", url: "https://www.coingecko.com/en/coins/the-sandbox", type: "market-data" },
	crunchbase:    { id: "y6", label: "Crunchbase: Animoca Brands investment portfolio (340+ investments)", type: "registry" },
	dappradar:     { id: "y7", label: "DappRadar: NFT market valuation data", type: "market-data" },
	hkCompanies:   { id: "y8", label: "HK Companies Registry: Outblaze Limited", type: "registry" },
	forbesSiu:     { id: "y9", label: "Forbes: Yat Siu profile & net worth estimate", date: "2024-06-01", type: "estimate" },
	bloombergSiu:  { id: "y10", label: "Bloomberg: Animoca Brands profile", type: "news" },
	sandboxAcq:    { id: "y11", label: "Animoca acquires The Sandbox from Pixowl", date: "2018-08-01", type: "news" },
	sandPeak:      { id: "y12", label: "SAND all-time high $8.40 (Nov 25, 2021)", date: "2021-11-25", type: "market-data" },
	hkPolicy:      { id: "y13", label: "HKMA: Virtual asset regulatory framework", date: "2023-06-01", type: "public-record" },
	sequoia:       { id: "y14", label: "Sequoia China leads Animoca $65M round", date: "2021-05-01", type: "news" },
};

// ── Yat Siu: Career Timeline ────────────────────────────────────

const YAT_SIU_CAREER: CareerPhase[] = [
	{
		id: "ys-1", title: "Early Career at Atari", organization: "Atari Corporation", role: "Software Engineer",
		startYear: 1990, endYear: 1995, location: "Vienna, Austria / Sunnyvale, USA",
		description: "Born in Vienna to a Chinese-Austrian family. Joined Atari in his teens as one of their youngest employees. Worked on the Atari Falcon and other projects before Atari's decline. Gained foundational experience in gaming and technology.",
		categories: [
			{ category: "income", claims: [
				{ id: "ys1-1", description: "Atari software engineer salary (1990-1995)", estimatedValueUSD: 150_000, confidence: 40, sources: [{ id: "est-at", label: "Estimated from Austrian/US tech salaries (early 1990s)", type: "estimate" }] },
			], subtotalUSD: 150_000, avgConfidence: 40 },
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
				{ id: "ys2-1", description: "CEO salary at Outblaze (1998-2012)", estimatedValueUSD: 2_000_000, confidence: 35, sources: [{ id: "est-ob", label: "Estimated from HK tech CEO compensation", type: "estimate" }] },
			], subtotalUSD: 2_000_000, avgConfidence: 35 },
			{ category: "companies", claims: [
				{ id: "ys2-2", description: "Sale of Outblaze messaging division to IBM (~$10-20M, Siu retained majority)", estimatedValueUSD: 15_000_000, confidence: 55, sources: [SRC_SIU.ibmAcq, SRC_SIU.hkCompanies] },
			], subtotalUSD: 15_000_000, avgConfidence: 55 },
			{ category: "alternatives", claims: [
				{ id: "ys2-3", description: "Hong Kong residential property acquired during this period", estimatedValueUSD: 3_000_000, confidence: 35, sources: [{ id: "est-hk", label: "HK Land Registry records (estimated)", type: "estimate" }] },
			], subtotalUSD: 3_000_000, avgConfidence: 35 },
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
				{ id: "ys3-1", description: "Animoca Brands ASX listing equity (co-founder stake ~55%, ASX market cap AU$20-50M)", estimatedValueUSD: 20_000_000, confidence: 60, sources: [SRC_SIU.asxListing, { id: "asx-mc", label: "ASX historical market cap data", type: "market-data" }] },
			], subtotalUSD: 20_000_000, avgConfidence: 60 },
			{ category: "income", claims: [
				{ id: "ys3-2", description: "Chairman compensation at Animoca Brands", estimatedValueUSD: 1_500_000, confidence: 40, sources: [{ id: "est-ch", label: "Estimated from ASX-listed company executive comp", type: "estimate" }] },
			], subtotalUSD: 1_500_000, avgConfidence: 40 },
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
				{ id: "ys4-1", description: "Animoca Brands equity (post-delisting, private valuation rising, ~$100M by late 2020)", estimatedValueUSD: 55_000_000, confidence: 50, sources: [SRC_SIU.asxDelist, { id: "priv-val", label: "Private secondary market estimates", type: "estimate" }] },
			], subtotalUSD: 55_000_000, avgConfidence: 50 },
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
				{ id: "ys5-6", description: "Hong Kong property portfolio (appreciated significantly)", estimatedValueUSD: 8_000_000, confidence: 40, sources: [{ id: "hk-prop", label: "HK property index appreciation 2018-2022", type: "market-data" }] },
			], subtotalUSD: 8_000_000, avgConfidence: 40 },
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
				{ id: "ys6-1", description: "Animoca Brands equity (last round $5.9B, likely marked down 30-50% in secondary markets)", estimatedValueUSD: 1_200_000_000, confidence: 45, sources: [SRC_SIU.tcAnimoca, SRC_SIU.bloombergSiu, { id: "sec-est", label: "Secondary market estimates suggest 30-50% discount", type: "estimate" }] },
			], subtotalUSD: 1_200_000_000, avgConfidence: 45 },
			{ category: "crypto", claims: [
				{ id: "ys6-2", description: "SAND token holdings at current price (~$0.30-0.60, down ~93% from peak)", estimatedValueUSD: 60_000_000, confidence: 65, sources: [SRC_SIU.coinGecko] },
				{ id: "ys6-3", description: "NFT portfolio (severely depreciated, floor prices down 80-95%)", estimatedValueUSD: 15_000_000, confidence: 25, sources: [SRC_SIU.dappradar] },
				{ id: "ys6-4", description: "Remaining token positions from portfolio companies", estimatedValueUSD: 30_000_000, confidence: 20, sources: [SRC_SIU.crunchbase, SRC_SIU.coinGecko] },
			], subtotalUSD: 105_000_000, avgConfidence: 37 },
			{ category: "investments", claims: [
				{ id: "ys6-5", description: "Blockchain/Web3 portfolio (heavily marked down but some survivors)", estimatedValueUSD: 150_000_000, confidence: 30, sources: [SRC_SIU.crunchbase] },
			], subtotalUSD: 150_000_000, avgConfidence: 30 },
			{ category: "alternatives", claims: [
				{ id: "ys6-6", description: "Hong Kong property and other tangible assets", estimatedValueUSD: 7_000_000, confidence: 40, sources: [{ id: "hk-prop2", label: "HK property market data", type: "market-data" }] },
			], subtotalUSD: 7_000_000, avgConfidence: 40 },
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
	{ id: "ds-4", name: "SAMR National Enterprise Credit System", provider: "State Administration for Market Regulation", category: "Corporate Registry", delayMs: 1500 },
	{ id: "ds-5", name: "PBOC Ant Group Regulatory Filings", provider: "People's Bank of China", category: "Regulatory Filings", delayMs: 2000 },
	{ id: "ds-6", name: "Forbes Real-Time Billionaires", provider: "Forbes Media", category: "Wealth Estimates", delayMs: 800 },
	{ id: "ds-7", name: "Hong Kong Land Registry", provider: "HKSAR Government", category: "Property Records", delayMs: 1400 },
	{ id: "ds-8", name: "Dow Jones Adverse Media Screening", provider: "Dow Jones Risk & Compliance", category: "Adverse Media", delayMs: 1600 },
	{ id: "ds-9", name: "OFAC / EU / UN Sanctions Lists", provider: "Multi-jurisdictional", category: "Sanctions Screening", delayMs: 900 },
	{ id: "ds-10", name: "PEP Database (Global)", provider: "World-Check / Dow Jones", category: "PEP Screening", delayMs: 1100 },
	{ id: "ds-11", name: "Crunchbase — Investment Portfolio", provider: "Crunchbase Inc.", category: "Investment Data", delayMs: 1300 },
	{ id: "ds-12", name: "Singapore ACRA Registry", provider: "Accounting and Corporate Regulatory Authority", category: "Trust & Structures", delayMs: 1700 },
];

const YAT_SIU_SOURCES: DataSourceDef[] = [
	{ id: "ds-1", name: "HK Companies Registry (CR Online)", provider: "HKSAR Companies Registry", category: "Corporate Registry", delayMs: 1500 },
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
	{ label: "Source Diversity", value: "12 independent sources across filings, market data, registries", status: "normal" },
	{ label: "Overall Confidence", value: `${overallConfidence(JACK_MA_CAREER)}%`, status: "normal" },
	{ label: "Regulatory Exposure", value: "Significant — Ant Group restructuring, Alibaba antitrust fine", status: "warning" },
	{ label: "PEP Status", value: "Near-match — political connections in China require monitoring", status: "warning" },
	{ label: "Wealth Volatility", value: "Moderate — Alibaba stock fluctuations, Ant Group valuation uncertainty", status: "warning" },
	{ label: "Jurisdictional Complexity", value: "High — China, Hong Kong, Singapore, global structures", status: "warning" },
	{ label: "Transparency Score", value: "Good — SEC filings, NYSE listing provide verified data", status: "normal" },
];

const YAT_SIU_PARAMS: KeyParameter[] = [
	{ label: "Wealth Plausibility", value: "Plausible but volatile — majority tied to crypto asset valuations", status: "warning" },
	{ label: "Source Diversity", value: "12 sources but crypto data has lower reliability", status: "warning" },
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
};

export const HNW_CASES: HnwReport[] = [JACK_MA_REPORT, YAT_SIU_REPORT];
