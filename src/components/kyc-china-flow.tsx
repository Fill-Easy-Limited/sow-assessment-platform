"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, InfoIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface ProxyResponse<T = unknown> {
	status: number;
	ok: boolean;
	latencyMs: number;
	data: T;
}

interface RequestResponseData {
	token?: string;
	error?: string;
}

interface ErroredCheck {
	check: string;
	error: string;
}

interface PollResponseData {
	reportMetadata?: { status?: string };
	submitted?: Record<string, unknown>;
	pdfUrl?: string;
	pdfFileName?: string;
	summary?: {
		ran?: string[];
		matched?: string[];
		unmatched?: string[];
		notFound?: string[];
		errored?: ErroredCheck[];
	};
	error?: string;
	[k: string]: unknown;
}

interface FormValues {
	name: string;
	idNumber: string;
	idIssueDate: string;
	idExpiryDate: string;
	mobile: string;
	bankCardNumber: string;
	facePhoto: string;
	addressesToVerify: string;
}

const EMPTY_FORM: FormValues = {
	name: "",
	idNumber: "",
	idIssueDate: "",
	idExpiryDate: "",
	mobile: "",
	bankCardNumber: "",
	facePhoto: "",
	addressesToVerify: "",
};

const SAMPLE: Partial<FormValues> = {
	name: "章妤雯",
	idNumber: "330682199905155045",
};

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90_000;

function maskValue(v: string, keepStart: number, keepEnd: number): string {
	if (!v) return "";
	const chars = [...v];
	if (chars.length <= 2) {
		return chars[0] + "•".repeat(Math.max(1, chars.length - 1));
	}
	if (chars.length <= keepStart + keepEnd) {
		return chars[0] + "•".repeat(chars.length - 2) + chars[chars.length - 1];
	}
	return (
		chars.slice(0, keepStart).join("") +
		"•".repeat(chars.length - keepStart - keepEnd) +
		chars.slice(-keepEnd).join("")
	);
}

const maskName = (v: string) => maskValue(v, 1, 1);
const maskId = (v: string) => maskValue(v, 4, 4);
const maskMobile = (v: string) => maskValue(v, 3, 4);
const maskBank = (v: string) => maskValue(v, 4, 4);

interface MaskedFieldProps {
	label: string;
	value: string;
	onChange: (v: string) => void;
	mask: (v: string) => string;
	placeholder?: string;
	required?: boolean;
	description?: string;
	disabled?: boolean;
}

function MaskedField({
	label,
	value,
	onChange,
	mask,
	placeholder,
	required,
	description,
	disabled,
}: MaskedFieldProps) {
	const [editing, setEditing] = useState(false);
	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">
				{label}
				{required && <span className="ml-1 text-destructive">*</span>}
			</label>
			{editing ? (
				<Input
					autoFocus
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onBlur={() => setEditing(false)}
					placeholder={placeholder}
					disabled={disabled}
					className="placeholder:opacity-50 font-mono"
				/>
			) : (
				<button
					type="button"
					onClick={() => !disabled && setEditing(true)}
					disabled={disabled}
					className="h-8 w-full flex items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm hover:bg-muted/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span
						className={
							value
								? "font-mono"
								: "text-muted-foreground opacity-50"
						}
					>
						{value ? mask(value) : (placeholder ?? "—")}
					</span>
					<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
						{value ? "Tap to edit" : "Tap to enter"}
					</span>
				</button>
			)}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
		</div>
	);
}

interface PlainFieldProps {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	type?: "text" | "textarea";
	rows?: number;
}

function PlainField({
	label,
	value,
	onChange,
	placeholder,
	description,
	disabled,
	type = "text",
	rows = 3,
}: PlainFieldProps) {
	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">{label}</label>
			{type === "textarea" ? (
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					rows={rows}
					className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm font-mono resize-y outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground placeholder:opacity-50 disabled:opacity-50"
				/>
			) : (
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					className="placeholder:opacity-50 font-mono"
				/>
			)}
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
		</div>
	);
}

interface PhotoFieldProps {
	label: string;
	value: string;
	onChange: (base64: string, meta?: { name: string; size: number; mime: string }) => void;
	description?: string;
	disabled?: boolean;
	preview: { name: string; size: number; mime: string } | null;
	onClear: () => void;
}

function PhotoField({
	label,
	value,
	onChange,
	description,
	disabled,
	preview,
	onClear,
}: PhotoFieldProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [readError, setReadError] = useState<string | null>(null);

	const handleFile = (file: File) => {
		setReadError(null);
		if (!file.type.startsWith("image/")) {
			setReadError("Please select an image file (JPEG or PNG).");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setReadError("Image must be smaller than 5 MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			const base64 = result.includes(",") ? result.split(",", 2)[1] : result;
			onChange(base64, {
				name: file.name,
				size: file.size,
				mime: file.type,
			});
		};
		reader.onerror = () => setReadError("Could not read the file.");
		reader.readAsDataURL(file);
	};

	const dataUrl =
		value && preview ? `data:${preview.mime};base64,${value}` : null;

	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">{label}</label>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png"
				className="sr-only"
				disabled={disabled}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
					e.target.value = "";
				}}
			/>
			{value ? (
				<div className="rounded-lg border border-input bg-transparent p-2.5 flex items-center gap-3">
					{dataUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={dataUrl}
							alt="Face photo preview"
							className="h-16 w-16 rounded-md object-cover bg-muted"
						/>
					) : (
						<div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
							img
						</div>
					)}
					<div className="flex-1 min-w-0 text-xs">
						<div className="font-medium truncate">
							{preview?.name ?? "Uploaded image"}
						</div>
						<div className="text-muted-foreground tabular-nums">
							{preview ? `${(preview.size / 1024).toFixed(1)} KB` : ""}
							{preview && ` · base64 ${(value.length / 1024).toFixed(1)} KB`}
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={onClear}
						disabled={disabled}
						aria-label="Remove photo"
					>
						<XIcon />
					</Button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => !disabled && inputRef.current?.click()}
					disabled={disabled}
					className="h-20 w-full flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-transparent text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<UploadIcon className="size-4" />
					<span>Click to upload a face photo (JPEG or PNG)</span>
				</button>
			)}
			{readError && (
				<p className="text-xs text-destructive">{readError}</p>
			)}
			{description && !readError && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
		</div>
	);
}

function buildRequestBody(v: FormValues): { body: Record<string, unknown>; error?: string } {
	const body: Record<string, unknown> = {};
	if (v.name.trim()) body.name = v.name.trim();
	if (v.idNumber.trim()) body.idNumber = v.idNumber.trim();
	if (v.idIssueDate.trim()) body.idIssueDate = v.idIssueDate.trim();
	if (v.idExpiryDate.trim()) body.idExpiryDate = v.idExpiryDate.trim();
	if (v.mobile.trim()) body.mobile = v.mobile.trim();
	if (v.bankCardNumber.trim()) body.bankCardNumber = v.bankCardNumber.trim();
	if (v.facePhoto.trim()) body.facePhoto = v.facePhoto.trim();
	if (v.addressesToVerify.trim()) {
		try {
			body.addressesToVerify = JSON.parse(v.addressesToVerify);
		} catch {
			return { body, error: "addressesToVerify is not valid JSON." };
		}
	}
	return { body };
}

type Phase = "idle" | "submitting" | "polling" | "done" | "error";

export default function KycChinaFlow() {
	const [form, setForm] = useState<FormValues>(EMPTY_FORM);
	const [photoMeta, setPhotoMeta] = useState<{
		name: string;
		size: number;
		mime: string;
	} | null>(null);
	const [additionalOpen, setAdditionalOpen] = useState(false);
	const [phase, setPhase] = useState<Phase>("idle");
	const [error, setError] = useState<string | null>(null);
	const [pollAttempts, setPollAttempts] = useState(0);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [result, setResult] = useState<PollResponseData | null>(null);
	const stopRef = useRef(false);

	useEffect(
		() => () => {
			stopRef.current = true;
		},
		[],
	);

	const updateField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const reset = () => {
		stopRef.current = true;
		setPhase("idle");
		setError(null);
		setPollAttempts(0);
		setElapsedMs(0);
		setResult(null);
	};

	const clearPhoto = () => {
		updateField("facePhoto", "");
		setPhotoMeta(null);
	};

	const setPhoto = (
		base64: string,
		meta?: { name: string; size: number; mime: string },
	) => {
		updateField("facePhoto", base64);
		if (meta) setPhotoMeta(meta);
	};

	const fillSample = () => {
		setForm((prev) => ({ ...prev, ...SAMPLE }));
	};

	const run = useCallback(async () => {
		setError(null);
		setResult(null);
		setPollAttempts(0);
		setElapsedMs(0);
		stopRef.current = false;

		const { body, error: buildError } = buildRequestBody(form);
		if (Object.keys(body).length === 0) {
			setError("Provide at least one field before running.");
			setPhase("error");
			return;
		}
		if (buildError) {
			setError(buildError);
			setPhase("error");
			return;
		}

		setPhase("submitting");
		try {
			const res = await fetch("/api/demo/kyc/cn/request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const wrapper = (await res.json()) as ProxyResponse<RequestResponseData>;
			if (wrapper.status !== 200 || !wrapper.data?.token) {
				setError(
					wrapper.data?.error ??
						`Request failed (HTTP ${wrapper.status})`,
				);
				setPhase("error");
				return;
			}
			const token = wrapper.data.token;
			setPhase("polling");

			const startedAt = Date.now();
			let attempt = 0;
			while (!stopRef.current) {
				if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
					setError(
						"Polling timed out after 90s — the report may still be processing upstream.",
					);
					setPhase("error");
					return;
				}
				await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
				if (stopRef.current) return;
				attempt++;
				setPollAttempts(attempt);
				setElapsedMs(Date.now() - startedAt);

				try {
					const pollRes = await fetch("/api/demo/kyc/cn/poll", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token }),
					});
					const pollWrapper =
						(await pollRes.json()) as ProxyResponse<PollResponseData>;

					if (pollWrapper.status === 202) continue;
					if (pollWrapper.status === 200) {
						setResult(pollWrapper.data);
						setPhase("done");
						return;
					}
					setError(
						pollWrapper.data?.error ??
							`Polling failed (HTTP ${pollWrapper.status})`,
					);
					setPhase("error");
					return;
				} catch {
					// transient network error — keep trying until timeout
				}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
			setPhase("error");
		}
	}, [form]);

	const isBusy = phase === "submitting" || phase === "polling";

	return (
		<div className="space-y-5">
			<div>
				<div className="flex items-center justify-between mb-3">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Subject
					</p>
					<FieldReferenceDialog />
				</div>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<MaskedField
						label="Full Name (Chinese)"
						value={form.name}
						onChange={(v) => updateField("name", v)}
						mask={maskName}
						placeholder="章妤雯"
						disabled={isBusy}
					/>
					<MaskedField
						label="ID Number"
						value={form.idNumber}
						onChange={(v) => updateField("idNumber", v)}
						mask={maskId}
						placeholder="330682199905155045"
						description="18-digit Chinese Resident Identity Card"
						disabled={isBusy}
					/>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					All fields are optional — provide whichever you have, and the
					service runs every sub-check whose inputs are present. Personal info
					stays masked while not being edited.
				</p>
			</div>

			<div className="border-t border-border/60 pt-5">
				<button
					type="button"
					onClick={() => setAdditionalOpen((v) => !v)}
					aria-expanded={additionalOpen}
					className="w-full flex items-center justify-between gap-2 text-left group"
				>
					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide group-hover:text-foreground transition-colors">
							Additional Fields (Optional)
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Issue/expiry dates, mobile, bank card, photo, addresses —
							each unlocks more sub-checks.
						</p>
					</div>
					<ChevronDownIcon
						className={`size-4 text-muted-foreground transition-transform ${additionalOpen ? "rotate-180" : ""}`}
					/>
				</button>
				{additionalOpen && (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
						<PlainField
							label="ID Issue Date"
							value={form.idIssueDate}
							onChange={(v) => updateField("idIssueDate", v)}
							placeholder="20200315"
							description="YYYYMMDD — enables four-factor identity check"
							disabled={isBusy}
						/>
						<PlainField
							label="ID Expiry Date"
							value={form.idExpiryDate}
							onChange={(v) => updateField("idExpiryDate", v)}
							placeholder="20400315"
							description="YYYYMMDD or 长期"
							disabled={isBusy}
						/>
						<MaskedField
							label="Mobile Number"
							value={form.mobile}
							onChange={(v) => updateField("mobile", v)}
							mask={maskMobile}
							placeholder="13912345678"
							description="11-digit mainland number — unlocks mobile/risk/bank-4F checks"
							disabled={isBusy}
						/>
						<MaskedField
							label="Bank Card Number"
							value={form.bankCardNumber}
							onChange={(v) => updateField("bankCardNumber", v)}
							mask={maskBank}
							placeholder="6217001180041276133"
							description="Debit/credit card — enables bank verification"
							disabled={isBusy}
						/>
						<div className="sm:col-span-2">
							<PhotoField
								label="Face Photo"
								value={form.facePhoto}
								onChange={setPhoto}
								onClear={clearPhoto}
								preview={photoMeta}
								description="JPEG or PNG, max 5 MB — enables image identity match against MPS file photo"
								disabled={isBusy}
							/>
						</div>
						<div className="sm:col-span-2">
							<PlainField
								label="Addresses to Verify (JSON)"
								value={form.addressesToVerify}
								onChange={(v) => updateField("addressesToVerify", v)}
								placeholder={`[\n  { "type": "work", "city": "杭州", "address": "西湖区文三路123号" }\n]`}
								description="Array of { type: common|work|residential, city, address } — enables address verification via mobile location"
								disabled={isBusy}
								type="textarea"
								rows={4}
							/>
						</div>
					</div>
				)}
			</div>

			<div className="flex gap-2 flex-wrap">
				<Button onClick={run} disabled={isBusy}>
					{phase === "submitting"
						? "Submitting…"
						: phase === "polling"
							? `Polling… (attempt ${pollAttempts})`
							: "Run KYC China"}
				</Button>
				<Button variant="outline" onClick={fillSample} disabled={isBusy}>
					Fill Sample Values
				</Button>
				{(phase === "done" || phase === "error") && (
					<Button variant="outline" onClick={reset}>
						Reset
					</Button>
				)}
			</div>

			{phase === "polling" && (
				<div className="rounded-xl border border-border bg-muted/20 p-4 flex items-center gap-3">
					<div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
					<div className="text-sm flex-1">
						Verification in progress — polling every {POLL_INTERVAL_MS / 1000}s.
						Reports typically complete within 10–30s.
					</div>
					<div className="text-xs text-muted-foreground tabular-nums">
						{(elapsedMs / 1000).toFixed(1)}s
					</div>
				</div>
			)}

			{error && (
				<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{phase === "done" && result && <ResultView result={result} />}
		</div>
	);
}

function ResultView({ result }: { result: PollResponseData }) {
	const pdfViewerUrl = result.pdfUrl
		? `${result.pdfUrl}#view=FitH&navpanes=0&toolbar=1&statusbar=0`
		: undefined;

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-border bg-muted/20 p-4">
				<div className="flex items-center gap-3 mb-3 flex-wrap">
					<span className="text-xs font-semibold rounded px-1.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
						COMPLETED
					</span>
					{result.pdfFileName && (
						<span className="text-xs text-muted-foreground font-mono">
							{result.pdfFileName}
						</span>
					)}
				</div>
				{result.summary && (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
						<SummaryStat label="Ran" items={result.summary.ran} tone="default" />
						<SummaryStat
							label="Matched"
							items={result.summary.matched}
							tone="success"
						/>
						<SummaryStat
							label="Unmatched"
							items={result.summary.unmatched}
							tone="warn"
						/>
						<SummaryStat
							label="Errored"
							items={result.summary.errored?.map((e) => e.check)}
							tone="error"
						/>
					</div>
				)}
			</div>

			{pdfViewerUrl && (
				<div className="rounded-xl border border-border overflow-hidden">
					<div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
						<span className="text-sm font-medium">PDF Report</span>
						<a
							href={result.pdfUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-primary hover:underline"
						>
							Open in new tab ↗
						</a>
					</div>
					<iframe
						src={pdfViewerUrl}
						title="KYC China Report"
						className="w-full h-[1200px] bg-background"
					/>
				</div>
			)}

			<details className="rounded-xl border border-border bg-muted/20">
				<summary className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground cursor-pointer">
					Raw Response
				</summary>
				<pre className="px-4 pb-3 text-xs overflow-auto max-h-[400px] whitespace-pre-wrap break-words leading-relaxed">
					{JSON.stringify(result, null, 2)}
				</pre>
			</details>
		</div>
	);
}

function SummaryStat({
	label,
	items,
	tone,
}: {
	label: string;
	items?: string[];
	tone: "default" | "success" | "warn" | "error";
}) {
	const count = items?.length ?? 0;
	const toneClass = {
		default: "bg-muted/40 text-foreground",
		success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
		warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
		error: "bg-red-500/15 text-red-700 dark:text-red-400",
	}[tone];
	return (
		<div className={`rounded-lg p-2.5 ${toneClass}`}>
			<div className="text-[10px] uppercase tracking-wider opacity-75">
				{label}
			</div>
			<div className="text-base font-semibold mt-0.5 tabular-nums">{count}</div>
		</div>
	);
}

interface SubCheckRow {
	check: string;
	required: string;
	verifies: string;
}

const SUB_CHECKS: { group: string; rows: SubCheckRow[] }[] = [
	{
		group: "Identity",
		rows: [
			{
				check: "two-factor",
				required: "name + idNumber",
				verifies: "Name + ID exists in MPS records",
			},
			{
				check: "four-factor",
				required: "+ idIssueDate + idExpiryDate",
				verifies: "+ issue/expiry dates match the record",
			},
			{
				check: "image",
				required: "name + idNumber + facePhoto",
				verifies: "Photo matches the MPS file photo",
			},
			{
				check: "three-factor",
				required: "name + idNumber + mobile",
				verifies: "All three are linked to one person",
			},
		],
	},
	{
		group: "Mobile",
		rows: [
			{
				check: "attribution",
				required: "mobile",
				verifies: "Carrier, province, and city",
			},
			{
				check: "location-work",
				required: "mobile",
				verifies: "City during 07:00–19:00 weekdays",
			},
			{
				check: "location-residential",
				required: "mobile",
				verifies: "City during 21:00–07:00",
			},
			{
				check: "address-verify",
				required: "mobile + addressesToVerify[]",
				verifies: "Distance band (≤3km up to >50km)",
			},
		],
	},
	{
		group: "Risk",
		rows: [
			{
				check: "fraud",
				required: "mobile or idNumber",
				verifies: "Fraud / gambling / money-mule severity (None–High)",
			},
			{
				check: "criminal",
				required: "name + idNumber",
				verifies: "Police records by category",
			},
		],
	},
	{
		group: "Bank",
		rows: [
			{
				check: "three-factor",
				required: "name + idNumber + bankCardNumber",
				verifies: "Card belongs to this person",
			},
			{
				check: "four-factor",
				required: "+ mobile",
				verifies: "+ mobile is registered to the card",
			},
		],
	},
];

function FieldReferenceDialog() {
	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant="outline" size="sm">
						<InfoIcon />
						Field Reference
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>What each field unlocks</DialogTitle>
					<DialogDescription>
						The KYC China endpoint runs a sub-check whenever the fields it needs are present.
						Omit a field to skip its checks. Each sub-check is one upstream call.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{SUB_CHECKS.map((group) => (
						<div key={group.group}>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
								{group.group}
							</p>
							<div className="rounded-lg border border-border overflow-hidden">
								<table className="w-full text-xs">
									<thead className="bg-muted/40 text-muted-foreground">
										<tr>
											<th className="text-left px-3 py-1.5 font-medium w-1/5">Check</th>
											<th className="text-left px-3 py-1.5 font-medium w-2/5">Requires</th>
											<th className="text-left px-3 py-1.5 font-medium">Verifies</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{group.rows.map((row) => (
											<tr key={row.check}>
												<td className="px-3 py-2 font-mono">{row.check}</td>
												<td className="px-3 py-2 font-mono text-muted-foreground">
													{row.required}
												</td>
												<td className="px-3 py-2">{row.verifies}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					))}
					<div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1">
						<p>
							<span className="font-semibold">Data sources:</span> Ministry of Public Security,
							telecom carriers, UnionPay, national anti-fraud blacklist.
						</p>
						<p>
							<span className="font-semibold">Polling:</span> request returns a JWT immediately;
							the report typically completes in 10–30 seconds. The PDF link is valid for 7 days.
						</p>
						<p>
							<span className="font-semibold">Billing:</span> each sub-check counts as one
							upstream call. A full KYC with one address is roughly 9–10 calls.
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
