"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Endpoint = "identity" | "mobile" | "risk";

type FieldKey =
	| "name"
	| "idNo"
	| "mobile"
	| "frDate"
	| "toDate"
	| "img"
	| "locationType"
	| "city"
	| "address";

interface SubtypeConfig {
	value: string;
	label: string;
	description: string;
	fields: FieldKey[];
	sample: Partial<Record<FieldKey, string>>;
}

interface EndpointConfig {
	value: Endpoint;
	label: string;
	description: string;
	subtypes: SubtypeConfig[];
}

const ENDPOINTS: EndpointConfig[] = [
	{
		value: "identity",
		label: "Verify Identity",
		description:
			"Verify a person's identity using government records and/or telecom registration.",
		subtypes: [
			{
				value: "two-factor",
				label: "Two-Factor (name + ID)",
				description: "Basic — verify name matches ID number.",
				fields: ["name", "idNo"],
				sample: { name: "李明", idNo: "110101199003076515" },
			},
			{
				value: "four-factor",
				label: "Four-Factor (+ validity dates)",
				description: "Enhanced — also verify ID card issue and expiry dates.",
				fields: ["name", "idNo", "frDate", "toDate"],
				sample: {
					name: "李明",
					idNo: "110101199003076515",
					frDate: "20200315",
					toDate: "20400315",
				},
			},
			{
				value: "image",
				label: "Biometric (name + ID + photo)",
				description: "Biometric — also compare a facial photo (base64).",
				fields: ["name", "idNo", "img"],
				sample: { name: "李明", idNo: "110101199003076515" },
			},
			{
				value: "name-mobile",
				label: "Name + Mobile",
				description: "Verify mobile number is registered to this name.",
				fields: ["name", "mobile"],
				sample: { name: "李明", mobile: "13912345678" },
			},
			{
				value: "id-mobile",
				label: "ID + Mobile",
				description: "Verify mobile number is registered to this ID number.",
				fields: ["idNo", "mobile"],
				sample: { idNo: "110101199003076515", mobile: "13912345678" },
			},
			{
				value: "three-factor",
				label: "Three-Factor (name + ID + mobile)",
				description: "Verify mobile, name, and ID all match.",
				fields: ["name", "idNo", "mobile"],
				sample: {
					name: "李明",
					idNo: "110101199003076515",
					mobile: "13912345678",
				},
			},
		],
	},
	{
		value: "mobile",
		label: "Mobile Number Lookup",
		description: "Carrier attribution and telco-based location intelligence.",
		subtypes: [
			{
				value: "attribution",
				label: "Carrier Attribution",
				description: "Carrier, province, and city for a mobile number.",
				fields: ["mobile"],
				sample: { mobile: "13912345678" },
			},
			{
				value: "location-verify",
				label: "Location Verify",
				description:
					"Check distance between a mobile user's location and a given address.",
				fields: ["mobile", "locationType", "city", "address"],
				sample: {
					mobile: "13912345678",
					locationType: "2",
					city: "北京",
					address: "朝阳区建国路88号",
				},
			},
			{
				value: "location-query",
				label: "Location Query",
				description: "Retrieve the city where the mobile user is active.",
				fields: ["mobile", "locationType"],
				sample: { mobile: "13912345678", locationType: "2" },
			},
		],
	},
	{
		value: "risk",
		label: "Risk Assessment",
		description: "Fraud/gambling risk scoring and criminal record checks.",
		subtypes: [
			{
				value: "fraud-risk",
				label: "Fraud / Gambling Risk",
				description: "Risk scored on a mobile number and/or ID number.",
				fields: ["mobile", "idNo"],
				sample: { mobile: "13912345678" },
			},
			{
				value: "criminal-record",
				label: "Criminal Record",
				description: "Public security criminal record check.",
				fields: ["name", "idNo"],
				sample: { name: "李明", idNo: "110101199003076515" },
			},
		],
	},
];

const FIELD_META: Record<
	FieldKey,
	{ label: string; placeholder: string; type?: string; hint?: string }
> = {
	name: { label: "Name (Chinese)", placeholder: "李明" },
	idNo: {
		label: "ID Number",
		placeholder: "18-digit Chinese Resident ID",
	},
	mobile: { label: "Mobile", placeholder: "13912345678" },
	frDate: { label: "ID Issue Date", placeholder: "YYYYMMDD" },
	toDate: {
		label: "ID Expiry Date",
		placeholder: 'YYYYMMDD or "长期"',
	},
	img: {
		label: "Photo (base64)",
		placeholder: "base64 JPEG/PNG",
		hint: "Base64 only, no data: prefix",
	},
	locationType: {
		label: "Location Type",
		placeholder: "1, 2 or 3",
		hint: "1=common  2=work (7–19 wkd)  3=home (21–7)",
	},
	city: { label: "City (Chinese)", placeholder: "北京" },
	address: { label: "Address (Chinese)", placeholder: "朝阳区建国路88号" },
};

interface CallResult {
	status: number;
	ok: boolean;
	latencyMs: number;
	data: unknown;
}

export default function KycCnDemo() {
	const [endpoint, setEndpoint] = useState<Endpoint>("identity");
	const [subtype, setSubtype] = useState<string>(
		ENDPOINTS[0].subtypes[0].value,
	);
	const [values, setValues] = useState<Partial<Record<FieldKey, string>>>(
		ENDPOINTS[0].subtypes[0].sample,
	);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<CallResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showRaw, setShowRaw] = useState(false);

	const currentEndpoint = useMemo(
		() => ENDPOINTS.find((e) => e.value === endpoint) ?? ENDPOINTS[0],
		[endpoint],
	);
	const currentSubtype = useMemo(
		() =>
			currentEndpoint.subtypes.find((s) => s.value === subtype) ??
			currentEndpoint.subtypes[0],
		[currentEndpoint, subtype],
	);

	function switchEndpoint(next: Endpoint) {
		const cfg = ENDPOINTS.find((e) => e.value === next) ?? ENDPOINTS[0];
		setEndpoint(next);
		setSubtype(cfg.subtypes[0].value);
		setValues(cfg.subtypes[0].sample);
		setResult(null);
		setError(null);
	}

	function switchSubtype(next: string | null) {
		if (next == null) return;
		const sub =
			currentEndpoint.subtypes.find((s) => s.value === next) ??
			currentEndpoint.subtypes[0];
		setSubtype(sub.value);
		setValues(sub.sample);
		setResult(null);
		setError(null);
	}

	function setField(key: FieldKey, v: string) {
		setValues((prev) => ({ ...prev, [key]: v }));
	}

	function loadSample() {
		setValues(currentSubtype.sample);
		setResult(null);
		setError(null);
	}

	async function run() {
		setLoading(true);
		setError(null);
		setResult(null);

		const body: Record<string, string> = { type: currentSubtype.value };
		for (const key of currentSubtype.fields) {
			const v = values[key];
			if (v !== undefined && v !== "") body[key] = v;
		}

		try {
			const res = await fetch(`/api/demo/kyc-cn/${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const json = (await res.json()) as CallResult & {
				error?: string;
				details?: string;
			};
			if (!res.ok) {
				setError(
					json.error
						? `${json.error}${json.details ? ` — ${json.details}` : ""}`
						: `HTTP ${res.status}`,
				);
			} else {
				setResult(json);
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setLoading(false);
		}
	}

	const verdict = result?.ok
		? summarize(endpoint, currentSubtype.value, result)
		: null;

	const upstreamMessage =
		result && !result.ok && result.data && typeof result.data === "object"
			? (() => {
					const d = result.data as Record<string, unknown>;
					const m = d.message ?? d.error ?? d.details;
					return typeof m === "string" ? m : null;
				})()
			: null;

	return (
		<div className="space-y-6">
			{/* Endpoint tabs */}
			<div className="flex flex-wrap items-center gap-1 border-b border-border/60">
				{ENDPOINTS.map((e) => {
					const active = e.value === endpoint;
					return (
						<button
							type="button"
							key={e.value}
							onClick={() => switchEndpoint(e.value)}
							className={`px-3 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
								active
									? "border-primary text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							{e.label}
						</button>
					);
				})}
			</div>

			<p className="text-sm text-muted-foreground -mt-2">
				{currentEndpoint.description}
			</p>

			{/* Form panel */}
			<div className="rounded-xl border border-border/60 bg-background p-5 space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-end gap-3">
					<div className="flex-1">
						<div className="text-xs font-medium text-muted-foreground mb-1.5">
							Verification type
						</div>
						<Select value={subtype} onValueChange={switchSubtype}>
							<SelectTrigger className="w-full sm:w-[320px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{currentEndpoint.subtypes.map((s) => (
									<SelectItem key={s.value} value={s.value}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="text-xs text-muted-foreground flex-1">
						{currentSubtype.description}
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{currentSubtype.fields.map((key) => {
						const meta = FIELD_META[key];
						const inputId = `kyc-cn-${key}`;
						return (
							<div key={key} className="space-y-1">
								<label
									htmlFor={inputId}
									className="block text-xs font-medium text-muted-foreground"
								>
									{meta.label}
								</label>
								<Input
									id={inputId}
									value={values[key] ?? ""}
									placeholder={meta.placeholder}
									onChange={(ev) => setField(key, ev.target.value)}
								/>
								{meta.hint && (
									<div className="text-[11px] text-muted-foreground">
										{meta.hint}
									</div>
								)}
							</div>
						);
					})}
				</div>

				<div className="flex items-center gap-2 pt-1">
					<Button onClick={run} disabled={loading}>
						{loading ? "Running…" : "Run verification"}
					</Button>
					<Button variant="outline" onClick={loadSample} disabled={loading}>
						Use sample values
					</Button>
					<div className="ml-auto text-[11px] text-muted-foreground font-mono">
						POST /kyc/cn/{endpoint}
					</div>
				</div>
			</div>

			{/* Request failed (network / proxy error) */}
			{error && (
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
					<div className="font-medium mb-1">Request failed</div>
					<div className="font-mono text-xs break-all">{error}</div>
				</div>
			)}

			{/* Upstream non-2xx response */}
			{result && !result.ok && (
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Badge variant="destructive">
								{result.status === 502
									? "UPSTREAM ERROR"
									: result.status === 400
										? "BAD REQUEST"
										: `HTTP ${result.status}`}
							</Badge>
							<div className="text-sm text-destructive">
								{upstreamMessage ??
									(result.status === 502
										? "The verification provider did not respond successfully. This is an upstream issue, not a problem with the request."
										: result.status === 400
											? "The request parameters were rejected by the API."
											: "The API returned an error.")}
							</div>
						</div>
						<div className="text-[11px] text-destructive/70 font-mono">
							{result.status} · {result.latencyMs} ms
						</div>
					</div>
					<div>
						<button
							type="button"
							onClick={() => setShowRaw((v) => !v)}
							className="text-xs text-destructive/80 hover:text-destructive underline-offset-2 hover:underline"
						>
							{showRaw ? "Hide" : "Show"} raw response
						</button>
						{showRaw && (
							<pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-background/60 p-3 text-xs font-mono">
								{JSON.stringify(result.data, null, 2)}
							</pre>
						)}
					</div>
				</div>
			)}

			{/* Successful verdict panel */}
			{result?.ok && verdict && (
				<div className="rounded-xl border border-border/60 bg-background p-5 space-y-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Badge variant={verdict.tone}>{verdict.headline}</Badge>
							<div className="text-sm text-foreground">{verdict.summary}</div>
						</div>
						<div className="text-[11px] text-muted-foreground font-mono">
							{result.status} · {result.latencyMs} ms
						</div>
					</div>

					{verdict.details.length > 0 && (
						<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
							{verdict.details.map((d) => (
								<div
									key={d.label}
									className="flex justify-between gap-3 border-b border-border/40 py-1.5"
								>
									<dt className="text-muted-foreground">{d.label}</dt>
									<dd className="font-medium text-right">{d.value}</dd>
								</div>
							))}
						</dl>
					)}

					<div>
						<button
							type="button"
							onClick={() => setShowRaw((v) => !v)}
							className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
						>
							{showRaw ? "Hide" : "Show"} raw JSON response
						</button>
						{showRaw && (
							<pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-muted/50 p-3 text-xs font-mono">
								{JSON.stringify(result.data, null, 2)}
							</pre>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

type BadgeTone = "default" | "secondary" | "destructive" | "outline";

interface Verdict {
	tone: BadgeTone;
	headline: string;
	summary: string;
	details: { label: string; value: string }[];
}

function summarize(
	endpoint: Endpoint,
	_subtype: string,
	result: CallResult,
): Verdict {
	const data = (result.data ?? {}) as Record<string, unknown>;
	const message = typeof data.message === "string" ? data.message : "";

	if (endpoint === "identity") {
		const r = typeof data.result === "string" ? data.result : "unknown";
		const tone: BadgeTone =
			r === "match"
				? "default"
				: r === "no match"
					? "destructive"
					: "secondary";
		const headline =
			r === "match"
				? "MATCH"
				: r === "no match"
					? "NO MATCH"
					: r === "not found"
						? "NOT FOUND"
						: r.toUpperCase();
		return {
			tone,
			headline,
			summary: message || "Identity verification completed.",
			details: [
				typeof data.verification === "string"
					? { label: "Verified", value: data.verification }
					: null,
			].filter(Boolean) as { label: string; value: string }[],
		};
	}

	if (endpoint === "mobile") {
		const success = data.success === true;
		const details: { label: string; value: string }[] = [];
		for (const k of ["operator", "province", "city", "distance", "locations"]) {
			const v = data[k];
			if (v === undefined || v === null) continue;
			details.push({
				label: k[0].toUpperCase() + k.slice(1),
				value:
					typeof v === "string" || typeof v === "number"
						? String(v)
						: JSON.stringify(v),
			});
		}
		return {
			tone: success ? "default" : "secondary",
			headline: success ? "FOUND" : "NO RESULT",
			summary: message || "Mobile lookup completed.",
			details,
		};
	}

	// risk
	const success = data.success === true;
	const risks = Array.isArray(data.risks) ? (data.risks as unknown[]) : [];
	const hasHit = risks.some((r) => {
		if (r && typeof r === "object" && "level" in r) {
			const lvl = (r as { level?: unknown }).level;
			return typeof lvl === "string" && lvl.toLowerCase() !== "none";
		}
		return false;
	});
	const details: { label: string; value: string }[] = risks.map((r) => {
		const obj = r as { type?: unknown; level?: unknown };
		return {
			label: typeof obj.type === "string" ? obj.type : "Risk",
			value: typeof obj.level === "string" ? obj.level : "—",
		};
	});
	return {
		tone: hasHit ? "destructive" : success ? "default" : "secondary",
		headline: hasHit ? "RISK DETECTED" : success ? "CLEAR" : "NO RESULT",
		summary: message || "Risk assessment completed.",
		details,
	};
}
