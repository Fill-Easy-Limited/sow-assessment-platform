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
import { SERVICES, type EndpointDef, type FieldDef } from "@/lib/demo-endpoints";

interface DemoResult {
	status: number;
	ok: boolean;
	latencyMs: number;
	data: unknown;
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
			// special-case house_prefix: single number → [n], two numbers → [a, b]
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
					className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm resize-y outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
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

export default function ApiDemo() {
	const [activeService, setActiveService] = useState(SERVICES[0].id);
	const [activeEndpoints, setActiveEndpoints] = useState<Record<string, string>>(
		Object.fromEntries(SERVICES.map((s) => [s.id, s.endpoints[0].id])),
	);
	const [values, setValues] = useState<Record<string, string>>({});
	const [pathParamValues, setPathParamValues] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<DemoResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const service = SERVICES.find((s) => s.id === activeService)!;
	const endpointId = activeEndpoints[activeService];
	const endpoint = service.endpoints.find((e) => e.id === endpointId)!;

	const setValue = (key: string, val: string) =>
		setValues((prev) => ({ ...prev, [key]: val }));

	const setPathParam = (key: string, val: string) =>
		setPathParamValues((prev) => ({ ...prev, [key]: val }));

	const switchService = (id: string) => {
		setActiveService(id);
		setResult(null);
		setError(null);
	};

	const switchEndpoint = (id: string) => {
		setActiveEndpoints((prev) => ({ ...prev, [activeService]: id }));
		setResult(null);
		setError(null);
	};

	const fillSample = () => {
		const next: Record<string, string> = {};
		for (const field of endpoint.fields) {
			if (field.type === "select") {
				next[field.key] = field.options?.[0] ?? "";
			} else if (field.type !== "boolean" && field.placeholder) {
				next[field.key] = field.placeholder;
			}
		}
		setValues((prev) => ({ ...prev, ...next }));
	};

	const run = useCallback(async () => {
		setLoading(true);
		setResult(null);
		setError(null);
		try {
			const resolvedPath = resolvePath(endpoint.path, pathParamValues);
			let url = `/api/demo/${resolvedPath}`;
			let fetchOptions: RequestInit;

			if (endpoint.method === "GET") {
				const body = buildBody(endpoint, values);
				const params = new URLSearchParams();
				for (const [k, v] of Object.entries(body)) {
					if (v !== undefined && v !== null) {
						params.set(k, String(v));
					}
				}
				const qs = params.toString();
				if (qs) url += `?${qs}`;
				fetchOptions = { method: "GET" };
			} else {
				const body = buildBody(endpoint, values);
				fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};
			}

			const res = await fetch(url, fetchOptions);
			const json = (await res.json()) as DemoResult;
			setResult(json);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	}, [endpoint, values, pathParamValues]);

	return (
		<div className="space-y-6">
			{/* Service tabs */}
			<div className="flex flex-wrap gap-0.5 border-b border-border/60 -mb-px">
				{SERVICES.map((s) => (
					<button
						key={s.id}
						onClick={() => switchService(s.id)}
						className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
							s.id === activeService
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						{s.label}
					</button>
				))}
			</div>

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
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Fields */}
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

			{/* Actions */}
			<div className="flex gap-2 flex-wrap">
				<Button onClick={run} disabled={loading}>
					{loading ? "Running…" : `Run — ${endpoint.method} /${endpoint.path}`}
				</Button>
				<Button variant="outline" onClick={fillSample} disabled={loading}>
					Fill Sample Values
				</Button>
			</div>

			{/* Error */}
			{error && (
				<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{/* Result */}
			{result && <ResultPanel result={result} />}
		</div>
	);
}
