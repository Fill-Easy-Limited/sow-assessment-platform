"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import KycChinaFlow from "@/components/kyc-china-flow";
import SowDemo from "@/components/sow-demo";
import CraHealthCheck from "@/components/cra-health-check";
import { SERVICES, type EndpointDef, type FieldDef } from "@/lib/demo-endpoints";

interface DemoResult {
	status: number;
	ok: boolean;
	latencyMs: number;
	data: unknown;
}

interface BulkRowResult {
	row: number;
	result?: DemoResult;
	error?: string;
}

function coerceField(field: FieldDef, raw: string): unknown {
	if (raw.trim() === "" && field.type !== "boolean") return undefined;
	switch (field.type) {
		case "number":
			return Number(raw);
		case "boolean":
			return raw === "true";
		case "textarea":
			switch (field.format) {
				case "json":
					try {
						return JSON.parse(raw);
					} catch {
						return raw;
					}
				case "comma-array":
					return raw
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean);
				case "newline-array":
					return raw
						.split("\n")
						.map((s) => s.trim())
						.filter(Boolean);
				case "comma-number-array":
					return raw
						.split(",")
						.map((s) => Number(s.trim()))
						.filter((n) => !isNaN(n));
				default:
					return raw;
			}
		default:
			return raw;
	}
}

function buildBody(
	endpoint: EndpointDef,
	values: Record<string, string>,
): Record<string, unknown> {
	const body: Record<string, unknown> = {};
	for (const field of endpoint.fields) {
		const raw = values[field.key] ?? "";
		const coerced = coerceField(field, raw);
		if (coerced !== undefined) {
			if (field.key === "house_prefix" && typeof coerced === "string") {
				const parts = (coerced as string)
					.split(",")
					.map((s) => Number(s.trim()))
					.filter((n) => !isNaN(n));
				if (parts.length > 0) body[field.key] = parts;
			} else {
				body[field.key] = coerced;
			}
		}
	}
	return body;
}

function resolvePath(path: string, pathParams: Record<string, string>): string {
	return path.replace(/\{(\w+)\}/g, (_, key) => pathParams[key] ?? `{${key}}`);
}

function parseCsvRow(line: string): string[] {
	const fields: string[] = [];
	let current = "";
	let inQuotes = false;
	for (const ch of line) {
		if (ch === '"') {
			inQuotes = !inQuotes;
		} else if (ch === "," && !inQuotes) {
			fields.push(current.trim());
			current = "";
		} else {
			current += ch;
		}
	}
	fields.push(current.trim());
	return fields;
}

async function fetchEndpoint(
	endpoint: EndpointDef,
	vals: Record<string, string>,
	pathVals: Record<string, string>,
): Promise<DemoResult> {
	const resolvedPath = resolvePath(endpoint.path, pathVals);
	let url = `/api/demo/${resolvedPath}`;
	let fetchOptions: RequestInit;
	if (endpoint.method === "GET") {
		const body = buildBody(endpoint, vals);
		const params = new URLSearchParams();
		for (const [k, v] of Object.entries(body)) {
			if (v !== undefined && v !== null) params.set(k, String(v));
		}
		const qs = params.toString();
		if (qs) url += `?${qs}`;
		fetchOptions = { method: "GET" };
	} else {
		const body = buildBody(endpoint, vals);
		fetchOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		};
	}
	const res = await fetch(url, fetchOptions);
	const text = await res.text();
	try {
		return JSON.parse(text) as DemoResult;
	} catch {
		throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 300) || "(empty body)"}`);
	}
}

function FieldInput({
	field,
	value,
	onChange,
}: {
	field: FieldDef;
	value: string;
	onChange: (v: string) => void;
}) {
	const isWide = field.type === "textarea";
	return (
		<div className={`space-y-1 ${isWide ? "sm:col-span-2" : ""}`}>
			<label className="text-sm font-medium">
				{field.label}
				{field.required && <span className="ml-1 text-destructive">*</span>}
			</label>
			{field.type === "select" ? (
				<Select value={value} onValueChange={(v) => onChange(v ?? "")}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={field.placeholder ?? `Select…`} />
					</SelectTrigger>
					<SelectContent>
						{field.options?.map((opt) => (
							<SelectItem key={opt} value={opt}>
								{opt}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : field.type === "textarea" ? (
				<textarea
					className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm resize-y outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground placeholder:opacity-50"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={field.placeholder}
				/>
			) : field.type === "boolean" ? (
				<div className="flex items-center gap-2 h-8">
					<input
						type="checkbox"
						id={field.key}
						checked={value === "true"}
						onChange={(e) => onChange(e.target.checked ? "true" : "false")}
						className="h-4 w-4 rounded"
					/>
					{field.description && (
						<label
							htmlFor={field.key}
							className="text-sm text-muted-foreground cursor-pointer"
						>
							{field.description}
						</label>
					)}
				</div>
			) : (
				<Input
					type={field.type === "number" ? "number" : "text"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={field.placeholder}
					className="placeholder:opacity-50"
				/>
			)}
			{field.description && field.type !== "boolean" && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}
		</div>
	);
}

function ResultPanel({ result }: { result: DemoResult }) {
	const statusColor =
		result.ok
			? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
			: result.status >= 500
				? "bg-red-500/15 text-red-700 dark:text-red-400"
				: result.status >= 400
					? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
					: "bg-sky-500/15 text-sky-700 dark:text-sky-400";

	return (
		<div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
			<div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
				<span className={`text-xs font-semibold rounded px-1.5 py-0.5 ${statusColor}`}>
					{result.status}
				</span>
				<span className="text-xs text-muted-foreground">{result.latencyMs}ms</span>
			</div>
			<pre className="p-4 text-xs overflow-auto max-h-[520px] leading-relaxed whitespace-pre-wrap break-words">
				{JSON.stringify(result.data, null, 2)}
			</pre>
		</div>
	);
}

function BulkResultPanel({ items }: { items: BulkRowResult[] }) {
	const [expanded, setExpanded] = useState<Set<number>>(new Set());

	const toggle = (row: number) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			next.has(row) ? next.delete(row) : next.add(row);
			return next;
		});

	return (
		<div className="space-y-2">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				Results ({items.length} row{items.length !== 1 ? "s" : ""})
			</p>
			<div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
				{items.map((item) => {
					const r = item.result;
					const isOpen = expanded.has(item.row);
					const statusColor = item.error
						? "bg-red-500/15 text-red-700 dark:text-red-400"
						: r?.ok
							? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
							: r && r.status >= 500
								? "bg-red-500/15 text-red-700 dark:text-red-400"
								: r && r.status >= 400
									? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
									: "bg-sky-500/15 text-sky-700 dark:text-sky-400";

					return (
						<div key={item.row}>
							<button
								onClick={() => toggle(item.row)}
								className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
							>
								<span className="text-xs text-muted-foreground w-12 shrink-0">
									Row {item.row}
								</span>
								{item.error ? (
									<span className={`text-xs font-semibold rounded px-1.5 py-0.5 ${statusColor}`}>
										Error
									</span>
								) : r ? (
									<>
										<span className={`text-xs font-semibold rounded px-1.5 py-0.5 ${statusColor}`}>
											{r.status}
										</span>
										<span className="text-xs text-muted-foreground">{r.latencyMs}ms</span>
									</>
								) : null}
								<span className="ml-auto text-xs text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
							</button>
							{isOpen && (
								<pre className="px-4 pb-3 text-xs overflow-auto max-h-[300px] leading-relaxed whitespace-pre-wrap break-words bg-muted/20">
									{item.error ? item.error : JSON.stringify(r?.data, null, 2)}
								</pre>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

const API_SERVICES = SERVICES.filter((s) => s.id !== "sow");

type TopTab = "sow" | "integrations" | "api";

function DataIntegrationsPanel() {
	// Fill Easy — owned platform, hero treatment
	const fillEasyModules = [
		{
			title: "CorpVerify",
			description: "Real-time corporate registry search & verification across 80+ jurisdictions.",
			items: [
				"Hong Kong CR · Singapore ACRA",
				"UK Companies House · US SEC EDGAR",
				"Australia ASIC · Cayman CIMA · BVI FSC",
			],
		},
		{
			title: "GovVerify",
			description: "Government authority records for identity, tax, land and regulatory checks.",
			items: [
				"Tax filings (SG IRAS · PRC IIT)",
				"Land registries (HK · CN · SG)",
				"Ethics & FI directories (OGE · MAS)",
			],
		},
		{
			title: "China Cross-Border",
			description: "Deep mainland China corporate, judicial, and credit intelligence.",
			items: [
				"SAMR registration, UBO & credit standing",
				"Supreme People's Court judicial records",
				"State Taxation Administration · NBS data",
			],
		},
	];

	// Third-party partner integrations — the classic SoW stack
	const partners = [
		{
			title: "Opoint",
			vendor: "Adverse Media · News Intelligence",
			description: "Real-time adverse media monitoring across 200,000+ global news sources in 200+ languages with AI-driven entity matching.",
			features: [
				"200K+ news sources",
				"200+ languages",
				"Real-time alerting",
				"AI entity matching",
			],
			category: "Adverse Media",
			badgeColor: "bg-amber-500/15 text-amber-700 border-amber-500/30",
			accent: "text-amber-600",
		},
		{
			title: "LSEG World-Check",
			vendor: "London Stock Exchange Group",
			description: "Industry-standard PEP, sanctions, watchlist and heightened-risk screening (formerly Thomson Reuters Refinitiv).",
			features: [
				"PEP & RCA coverage",
				"Global sanctions & watchlists",
				"Adverse media records",
				"Daily list refreshes",
			],
			category: "PEP / Sanctions",
			badgeColor: "bg-red-500/15 text-red-700 border-red-500/30",
			accent: "text-red-600",
		},
		{
			title: "Dow Jones Risk & Compliance",
			vendor: "Dow Jones · Factiva",
			description: "PEP, sanctions, and state-owned enterprise screening paired with Factiva-powered global news intelligence.",
			features: [
				"PEP & SIE lists",
				"Sanctions & SOE coverage",
				"Factiva adverse media",
				"30+ years archive",
			],
			category: "PEP / Sanctions",
			badgeColor: "bg-red-500/15 text-red-700 border-red-500/30",
			accent: "text-red-600",
		},
		{
			title: "Sayari Graph",
			vendor: "Public Records · Network Analysis",
			description: "Corporate network graphs across global public records — surface hidden UBOs, supply-chain risk and sanctions exposure.",
			features: [
				"Corporate network graphs",
				"Hidden UBO discovery",
				"Sanctions nexus mapping",
				"Cross-jurisdiction linking",
			],
			category: "Corporate / UBO",
			badgeColor: "bg-violet-500/15 text-violet-700 border-violet-500/30",
			accent: "text-violet-600",
		},
		{
			title: "LSEG Eikon · Bloomberg · Forbes",
			vendor: "Market & Wealth Intelligence",
			description: "Public-market pricing, executive compensation, and real-time wealth estimates underpinning net-worth analysis.",
			features: [
				"Forbes Real-Time Billionaires",
				"Bloomberg Billionaires Index",
				"LSEG Eikon market data",
				"PitchBook private markets",
			],
			category: "Market & Wealth",
			badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
			accent: "text-emerald-600",
		},
	];

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-heading font-semibold tracking-tight">
					Data Integrations
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Powered by <span className="text-primary font-semibold">Fill Easy</span> and integrated with the leading third-party Source of Wealth providers
				</p>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{[
					{ value: "80+", label: "Jurisdictions" },
					{ value: "200+", label: "Registries" },
					{ value: "5", label: "Third-party providers" },
					{ value: "Real-Time", label: "Access" },
				].map((stat) => (
					<div
						key={stat.label}
						className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center"
					>
						<p className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">
							{stat.value}
						</p>
						<p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
					</div>
				))}
			</div>

			{/* Fill Easy — hero */}
			<div className="relative rounded-2xl overflow-hidden border border-[#231815]/15 shadow-lg shadow-[#FED200]/30">
				<div className="absolute inset-0 bg-[#FED200]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(26,82,193,0.18)_0%,_transparent_60%)]" />
				<div className="relative p-6 sm:p-8 text-[#231815]">
					<div className="flex items-start gap-4 mb-5">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/favicon.ico"
							alt="Fill Easy"
							className="h-12 w-12 shrink-0"
						/>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h3 className="text-xl font-heading font-semibold tracking-tight">Fill Easy</h3>
								<span className="text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full bg-[#1A52C1] text-white">
									Core Platform
								</span>
							</div>
							<p className="text-sm text-[#231815]/75 mt-1.5 max-w-2xl leading-relaxed">
								Unified API access to corporate registries, government records, and China cross-border intelligence across 80+ jurisdictions — the primary data spine for every Source of Wealth assessment.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{fillEasyModules.map((m) => (
							<div
								key={m.title}
								className="rounded-xl bg-white p-4 shadow-sm border border-[#231815]/10"
							>
								<p className="text-sm font-heading font-semibold text-[#231815]">{m.title}</p>
								<p className="text-xs text-[#231815]/75 mt-1.5 leading-relaxed">{m.description}</p>
								<div className="mt-3 space-y-1">
									{m.items.map((item) => (
										<div key={item} className="flex items-start gap-1.5 text-[11px] text-[#231815]/70">
											<span className="mt-1.5 h-1 w-1 rounded-full bg-[#1A52C1] shrink-0" />
											<span>{item}</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>

					<div className="flex items-center gap-1.5 text-xs text-[#231815]/65 pt-4 mt-5 border-t border-[#231815]/15">
						<span className="h-2 w-2 rounded-full bg-[#1A52C1] shadow-[0_0_8px_rgba(26,82,193,0.6)]" />
						<span>Live · Primary integration · 200+ registries connected</span>
					</div>
				</div>
			</div>

			{/* Third-party partners */}
			<div>
				<div className="flex items-end justify-between mb-4">
					<div>
						<h3 className="text-base font-heading font-semibold tracking-tight">Third-party SoW data partners</h3>
						<p className="text-xs text-muted-foreground mt-0.5">Integrated alongside Fill Easy for adverse media, sanctions, UBO and market intelligence</p>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{partners.map((p) => (
						<div
							key={p.title}
							className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow"
						>
							<div className="flex items-start justify-between gap-3 mb-3">
								<div className="min-w-0 flex-1">
									<h4 className={`text-sm font-heading font-semibold tracking-tight ${p.accent}`}>{p.title}</h4>
									<p className="text-[11px] text-muted-foreground/80 mt-0.5">{p.vendor}</p>
								</div>
								<span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${p.badgeColor}`}>
									{p.category}
								</span>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.description}</p>
							<div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3 flex-1">
								{p.features.map((feat) => (
									<div key={feat} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
										<span className="mt-1.5 h-1 w-1 rounded-full bg-teal-400 shrink-0" />
										<span>{feat}</span>
									</div>
								))}
							</div>
							<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-2.5 border-t border-border/60">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								<span>Live integration</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function ApiDemo() {
	const [topTab, setTopTab] = useState<TopTab>("sow");
	const [activeService, setActiveService] = useState(API_SERVICES[0].id);
	const [activeEndpoints, setActiveEndpoints] = useState<Record<string, string>>(
		Object.fromEntries(
			SERVICES.filter((s) => s.endpoints.length > 0).map((s) => [
				s.id,
				s.endpoints[0].id,
			]),
		),
	);
	const [values, setValues] = useState<Record<string, string>>({});
	const [pathParamValues, setPathParamValues] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<DemoResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [bulkCsv, setBulkCsv] = useState("");
	const [bulkResults, setBulkResults] = useState<BulkRowResult[]>([]);
	const [bulkLoading, setBulkLoading] = useState(false);
	const [bulkError, setBulkError] = useState<string | null>(null);

	const service = SERVICES.find((s) => s.id === activeService)!;
	const endpointId = activeEndpoints[activeService];
	const endpoint = service.endpoints.find((e) => e.id === endpointId);

	const setValue = (key: string, val: string) =>
		setValues((prev) => ({ ...prev, [key]: val }));

	const setPathParam = (key: string, val: string) =>
		setPathParamValues((prev) => ({ ...prev, [key]: val }));

	const switchService = (id: string) => {
		setActiveService(id);
		setBulkCsv("");
		setBulkResults([]);
		setResult(null);
		setError(null);
		setBulkError(null);
	};

	const switchEndpoint = (id: string) => {
		setActiveEndpoints((prev) => ({ ...prev, [activeService]: id }));
		setBulkCsv("");
		setBulkResults([]);
		setResult(null);
		setError(null);
		setBulkError(null);
	};

	const fillPathParams = () => {
		if (!endpoint) return;
		if (endpoint.pathParams?.length) {
			const next: Record<string, string> = {};
			for (const p of endpoint.pathParams) next[p] = pathParamValues[p] || "hk";
			setPathParamValues((prev) => ({ ...prev, ...next }));
		}
	};

	const fillSample = () => {
		if (!endpoint) return;
		fillPathParams();
		const next: Record<string, string> = {};
		for (const field of endpoint.fields) {
			if (field.noSample) continue;
			if (field.type === "select") next[field.key] = values[field.key] || field.placeholder || "";
			else if (field.type !== "boolean" && field.placeholder) next[field.key] = field.placeholder;
		}
		setValues(next);
	};

	const fillBulkSample = () => {
		if (!endpoint) return;
		fillPathParams()
		if (!endpoint.bulkSamples?.length) return;
		const rows = endpoint.bulkSamples.map((sample) =>
			endpoint.fields
				.map((f) => {
					const v = sample[f.key] ?? "";
					return v.includes(",") || v.includes('"') || v.includes("\n")
						? `"${v.replace(/"/g, '""')}"`
						: v;
				})
				.join(","),
		);
		setBulkCsv(rows.join("\n"));
	};

	const run = useCallback(async () => {
		if (!endpoint) return;
		setLoading(true);
		setResult(null);
		setError(null);
		try {
			const r = await fetchEndpoint(endpoint, values, pathParamValues);
			setResult(r);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	}, [endpoint, values, pathParamValues]);

	const runBulk = useCallback(async () => {
		if (!endpoint) return;
		setBulkLoading(true);
		setBulkResults([]);
		setBulkError(null);
		const lines = bulkCsv.split("\n").map((l) => l.trim()).filter(Boolean);
		if (lines.length < 1) {
			setBulkError("Add at least one row.");
			setBulkLoading(false);
			return;
		}
		const headers = endpoint.fields.map((f) => f.key);
		await Promise.allSettled(
			lines.map((line, i) => {
				const cells = parseCsvRow(line);
				const rowVals: Record<string, string> = {};
				headers.forEach((h, idx) => { rowVals[h] = cells[idx] ?? ""; });
				return fetchEndpoint(endpoint, rowVals, pathParamValues).then(
					(r) => setBulkResults((prev) => [...prev, { row: i + 1, result: r }]),
					(e) => setBulkResults((prev) => [...prev, { row: i + 1, error: e instanceof Error ? e.message : String(e) }]),
				);
			}),
		);
		setBulkLoading(false);
	}, [endpoint, bulkCsv, pathParamValues]);

	return (
		<div className="space-y-6">
			{/* Top-level tabs: Wealth Intelligence (primary) + API Explorer */}
			<div className="flex items-center gap-2">
				<button
					onClick={() => setTopTab("sow")}
					className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
						topTab === "sow"
							? "bg-[#0f2b3c] text-white shadow-sm"
							: "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
					}`}
				>
					<span className="flex items-center gap-2">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={topTab === "sow" ? "text-sky-300" : "text-muted-foreground"}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
						Wealth Intelligence
					</span>
				</button>
				<button
					onClick={() => setTopTab("integrations")}
					className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
						topTab === "integrations"
							? "bg-[#FED200] text-[#231815] shadow-sm ring-1 ring-[#FED200]/60"
							: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
					}`}
				>
					<span className="flex items-center gap-2">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={topTab === "integrations" ? "text-[#1A52C1]" : "text-muted-foreground"}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
						Data Integrations
					</span>
				</button>
				<button
					onClick={() => setTopTab("api")}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
						topTab === "api"
							? "bg-muted/80 text-foreground shadow-sm ring-1 ring-border"
							: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
					}`}
				>
					API Explorer
				</button>
			</div>

			{topTab === "integrations" ? (
				<DataIntegrationsPanel />
			) : topTab === "sow" ? (
				<SowDemo />
			) : (
				<>
					{/* API service sub-tabs */}
					<div className="flex flex-wrap gap-1 border-b border-border/60 pb-px">
						{API_SERVICES.map((s) => (
							<button
								key={s.id}
								onClick={() => switchService(s.id)}
								className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap ${
									s.id === activeService
										? "bg-muted/60 text-foreground border border-b-0 border-border/60"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{s.label}
							</button>
						))}
					</div>

			{activeService === "kyc-china" ? (
				<KycChinaFlow />
			) : endpoint ? (
				<>
			{activeService === "corpverify" && (
				<div className="mt-4">
					<CraHealthCheck />
				</div>
			)}
			{/* Endpoint tabs */}
			<div className="space-y-2.5 mt-4">
				<div className="flex flex-wrap gap-1.5">
					{service.endpoints.map((ep) => (
						<button
							key={ep.id}
							onClick={() => switchEndpoint(ep.id)}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
								ep.id === endpointId
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
							}`}
						>
							<span className="font-mono opacity-75">{ep.method}</span>
							{ep.label}
						</button>
					))}
				</div>
				{endpoint.description && (
					<p className="text-sm text-muted-foreground">{endpoint.description}</p>
				)}
			</div>

			{/* Path params */}
			{endpoint.pathParams && endpoint.pathParams.length > 0 && (
				<div className="space-y-3">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Path Parameters
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{endpoint.pathParams.map((param) => (
							<div key={param} className="space-y-1">
								<label className="text-sm font-medium">{param}</label>
								<Input
									value={pathParamValues[param] ?? ""}
									onChange={(e) => setPathParam(param, e.target.value)}
									placeholder={`Enter ${param} (e.g. hk)`}
									className="placeholder:opacity-50"
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Single request */}
			{endpoint.fields.length > 0 && (
				<div className="space-y-3">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						{endpoint.method === "GET" ? "Query Parameters" : "Request Body"}
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{endpoint.fields
							.filter((field) => {
								if (!field.visibleWhen) return true;
								const controlling = values[field.visibleWhen.field] ?? "";
								return field.visibleWhen.values.includes(controlling);
							})
							.map((field) => (
								<FieldInput
									key={field.key}
									field={field}
									value={values[field.key] ?? ""}
									onChange={(val) => setValue(field.key, val)}
								/>
							))}
					</div>
				</div>
			)}

			<div className="flex gap-2 flex-wrap">
				<Button onClick={run} disabled={loading}>
					{loading ? "Running…" : `Run — ${endpoint.method} /${endpoint.path}`}
				</Button>
				<Button variant="outline" onClick={fillSample} disabled={loading}>
					Fill Sample Values
				</Button>
			</div>

			{error && (
				<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{result && <ResultPanel result={result} />}

			{/* Bulk CSV */}
			{endpoint.supportsBulk && (
				<>
					<div className="border-t border-border/60 pt-6 space-y-3">
						<div className="flex items-start justify-between gap-4">
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								Bulk CSV
							</p>
							<p className="font-mono text-xs text-muted-foreground text-right leading-relaxed">
								{endpoint.fields.map((f) => f.key).join(", ")}
							</p>
						</div>
						<textarea
							className="w-full min-h-[140px] rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm font-mono resize-y outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground placeholder:opacity-50"
							value={bulkCsv}
							onChange={(e) => setBulkCsv(e.target.value)}
							placeholder={`value1,value2,...\nvalue1,value2,...`}
							spellCheck={false}
						/>
					</div>

					<div className="flex gap-2 flex-wrap">
						<Button onClick={runBulk} disabled={bulkLoading}>
							{bulkLoading ? "Running…" : `Run Bulk — ${endpoint.method} /${endpoint.path}`}
						</Button>
						<Button variant="outline" onClick={fillBulkSample} disabled={bulkLoading || !endpoint.bulkSamples?.length}>
							Fill Sample Values
						</Button>
					</div>

					{bulkError && (
						<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
							{bulkError}
						</div>
					)}

					{bulkResults.length > 0 && <BulkResultPanel items={bulkResults} />}
				</>
			)}
				</>
			) : null}
				</>
			)}
		</div>
	);
}
