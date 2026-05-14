"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { CRA_HEALTH_SAMPLES, getHealthSample } from "@/lib/cra-health-samples";

interface HealthResult {
	country: string;
	companyName: string;
	status?: number;
	ok?: boolean;
	latencyMs?: number;
	data?: unknown;
	error?: string;
}

interface DemoEnvelope {
	status: number;
	ok: boolean;
	latencyMs: number;
	data: unknown;
}

function extractSearchableCountries(value: unknown): string[] {
	if (!value || typeof value !== "object") return [];
	const root = value as Record<string, unknown>;
	const rawList = Array.isArray(root.countries) ? root.countries : [];
	const out: string[] = [];
	for (const item of rawList) {
		if (!item || typeof item !== "object") continue;
		const c = item as Record<string, unknown>;
		const code = typeof c.code === "string" ? c.code.toUpperCase() : null;
		if (!code || !/^[A-Z]{2}$/.test(code)) continue;
		const search = (c.search && typeof c.search === "object" ? c.search : {}) as Record<string, unknown>;
		if (search.companies !== true) continue;
		out.push(code);
	}
	return out.sort();
}

async function callSearchCompanies(
	country: string,
	companyName: string,
): Promise<{ envelope?: DemoEnvelope; error?: string }> {
	const url = `/api/demo/cra/${country.toLowerCase()}/search/companies`;
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ companyName }),
		});
		const text = await res.text();
		try {
			return { envelope: JSON.parse(text) as DemoEnvelope };
		} catch {
			return {
				error: `Non-JSON response (${res.status}): ${text.slice(0, 300) || "(empty)"}`,
			};
		}
	} catch (e) {
		return { error: e instanceof Error ? e.message : String(e) };
	}
}

function statusClasses(result: HealthResult): string {
	if (result.error) return "bg-red-500/15 text-red-700 dark:text-red-400";
	if (result.ok) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
	const s = result.status ?? 0;
	if (s >= 500) return "bg-red-500/15 text-red-700 dark:text-red-400";
	if (s >= 400) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
	return "bg-sky-500/15 text-sky-700 dark:text-sky-400";
}

export default function CraHealthCheck() {
	const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
	const [results, setResults] = useState<HealthResult[]>([]);
	const [total, setTotal] = useState(0);
	const [completed, setCompleted] = useState(0);
	const [missingSamples, setMissingSamples] = useState<string[]>([]);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	const toggle = (key: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});

	const run = useCallback(async () => {
		setStatus("running");
		setResults([]);
		setMissingSamples([]);
		setFetchError(null);
		setCompleted(0);
		setExpanded(new Set());

		let infoRes: Response;
		try {
			infoRes = await fetch("/api/demo/cra/info", { method: "GET" });
		} catch (e) {
			setFetchError(e instanceof Error ? e.message : String(e));
			setStatus("done");
			setTotal(0);
			return;
		}
		const infoText = await infoRes.text();
		let infoEnvelope: DemoEnvelope;
		try {
			infoEnvelope = JSON.parse(infoText) as DemoEnvelope;
		} catch {
			setFetchError(`GET /cra/info returned non-JSON (${infoRes.status})`);
			setStatus("done");
			setTotal(0);
			return;
		}
		if (!infoEnvelope.ok) {
			setFetchError(`GET /cra/info failed with status ${infoEnvelope.status}`);
			setStatus("done");
			setTotal(0);
			return;
		}

		const countries = extractSearchableCountries(infoEnvelope.data);
		if (countries.length === 0) {
			setFetchError("No name-searchable countries found in /cra/info response.");
			setStatus("done");
			setTotal(0);
			return;
		}

		const missing: string[] = [];
		const tasks: Array<{ country: string; companyName: string }> = [];
		for (const code of countries) {
			const sample = getHealthSample(code);
			if (!sample) {
				missing.push(code);
				continue;
			}
			tasks.push({ country: code, companyName: sample.companyName });
		}
		setMissingSamples(missing);
		setTotal(tasks.length);

		await Promise.allSettled(
			tasks.map(async (task) => {
				const { envelope, error } = await callSearchCompanies(task.country, task.companyName);
				const result: HealthResult = {
					country: task.country,
					companyName: task.companyName,
					status: envelope?.status,
					ok: envelope?.ok,
					latencyMs: envelope?.latencyMs,
					data: envelope?.data,
					error,
				};
				setResults((prev) => [...prev, result]);
				setCompleted((n) => n + 1);
			}),
		);

		setStatus("done");
	}, []);

	const okCount = results.filter((r) => r.ok && !r.error).length;
	const failed = results.filter((r) => r.error || !r.ok);

	const knownSampleCodes = Object.keys(CRA_HEALTH_SAMPLES).sort().join(", ");

	return (
		<details className="rounded-xl border border-border bg-muted/20 overflow-hidden">
			<summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold">CorpVerify Health Check</span>
					<span className="text-xs text-muted-foreground">
						Runs per-country &quot;search by name&quot; and reports failures
					</span>
				</div>
				{status === "done" && total > 0 && (
					<span
						className={`text-xs font-semibold rounded px-1.5 py-0.5 ${
							failed.length === 0
								? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
								: "bg-amber-500/15 text-amber-700 dark:text-amber-400"
						}`}
					>
						{okCount} / {total} OK
					</span>
				)}
			</summary>

			<div className="border-t border-border px-4 py-4 space-y-4">
				<div className="flex items-center gap-2 flex-wrap">
					<Button onClick={run} disabled={status === "running"}>
						{status === "running"
							? `Running… ${completed} / ${total || "?"}`
							: status === "done"
								? "Run Again"
								: "Run Health Check"}
					</Button>
					<span className="text-xs text-muted-foreground">
						Sample data defined for: {knownSampleCodes || "(none)"}
					</span>
				</div>

				{fetchError && (
					<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
						{fetchError}
					</div>
				)}

				{status === "done" && total > 0 && (
					<div className="rounded-lg border border-border bg-background p-3">
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-bold tabular-nums">
								{okCount} / {total}
							</span>
							<span className="text-sm text-muted-foreground">endpoints OK</span>
						</div>
						{failed.length > 0 && (
							<p className="text-xs text-muted-foreground mt-1">
								{failed.length} failed — see details below.
							</p>
						)}
					</div>
				)}

				{missingSamples.length > 0 && (
					<div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
						<p className="font-medium text-amber-700 dark:text-amber-400">
							Missing default sample(s) for: {missingSamples.join(", ")}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Add entries to <code className="font-mono">src/lib/cra-health-samples.ts</code> and re-run.
							These countries were not tested.
						</p>
					</div>
				)}

				{failed.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Failures ({failed.length})
						</p>
						<div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
							{failed.map((r) => {
								const isOpen = expanded.has(r.country);
								return (
									<div key={r.country}>
										<button
											onClick={() => toggle(r.country)}
											className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
										>
											<span className="text-xs font-mono font-semibold w-8 shrink-0">
												{r.country}
											</span>
											<span className="text-xs text-muted-foreground flex-1 truncate">
												{r.companyName}
											</span>
											<span
												className={`text-xs font-semibold rounded px-1.5 py-0.5 ${statusClasses(r)}`}
											>
												{r.error ? "Error" : r.status}
											</span>
											{typeof r.latencyMs === "number" && (
												<span className="text-xs text-muted-foreground tabular-nums">
													{r.latencyMs}ms
												</span>
											)}
											<span className="text-xs text-muted-foreground w-3 text-right">
												{isOpen ? "▲" : "▼"}
											</span>
										</button>
										{isOpen && (
											<pre className="px-4 pb-3 text-xs overflow-auto max-h-[300px] leading-relaxed whitespace-pre-wrap break-words bg-muted/20">
												{r.error ? r.error : JSON.stringify(r.data, null, 2)}
											</pre>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</details>
	);
}
