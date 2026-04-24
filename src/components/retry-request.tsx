"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { retryRequest, type RetryRequestInput } from "@/lib/aws/client";

interface RetryRequestProps {
	requestId: string;
	stage: string;
	onSuccess?: () => Promise<void> | void;
}

export default function RetryRequest({
	requestId,
	stage,
	onSuccess,
}: RetryRequestProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [prn, setPrn] = useState("");
	const [companyId, setCompanyId] = useState("");
	const [documentId, setDocumentId] = useState("");
	const [prodConfirmed, setProdConfirmed] = useState(false);
	const [showOverrides, setShowOverrides] = useState(false);

	const isLra = requestId.startsWith("LR_");
	const isProd = stage === "prod";

	// Reset form state whenever the dialog opens.
	useEffect(() => {
		if (open) {
			setMessage("");
			setPrn("");
			setCompanyId("");
			setDocumentId("");
			setProdConfirmed(false);
			setShowOverrides(false);
		}
	}, [open]);

	const mutation = useMutation({
		mutationFn: async () => {
			setMessage("");
			const input: RetryRequestInput = isLra
				? { prn: prn.trim() || undefined }
				: {
						companyId: companyId.trim() || undefined,
						documentId: documentId.trim() || undefined,
					};
			return retryRequest(requestId, input, { stage });
		},
		onSuccess: (result) => {
			if (result.success) {
				setMessage(result.message ?? "Retry invoked.");
				queryClient.invalidateQueries({ queryKey: ["requests"] });
				void onSuccess?.();
				// Auto-close the dialog shortly after a successful retry.
				setTimeout(() => setOpen(false), 900);
				return;
			}
			setMessage(result.error ?? "Failed to retry request.");
		},
		onError: (error) => {
			setMessage(
				error instanceof Error ? error.message : "Failed to retry request.",
			);
		},
	});

	const hasOverrides = isLra
		? Boolean(prn.trim())
		: Boolean(companyId.trim() || documentId.trim());

	const canSubmit = !mutation.isPending && (!isProd || prodConfirmed);

	return (
		<>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					className="gap-2"
					onClick={() => setOpen(true)}
				>
					<RefreshCw className="h-3.5 w-3.5" />
					Retry Retrieval
				</Button>
				<span className="text-xs text-muted-foreground">
					Re-invokes the retrieval lambda
					{isLra ? " (optionally with a PRN)" : " (optionally with identifiers)"}.
				</span>
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="w-[min(460px,calc(100vw-1rem))] max-w-[460px] rounded-2xl p-5">
					<DialogHeader className="space-y-1 pb-2">
						<DialogTitle className="text-base font-semibold">
							Retry retrieval
						</DialogTitle>
						<div className="flex items-center gap-2">
							<p className="font-mono text-[11px] tracking-wider text-muted-foreground">
								{requestId}
							</p>
							<span
								className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
									isProd
										? "bg-red-100 text-red-700 border border-red-200"
										: "bg-muted text-muted-foreground border border-border/60"
								}`}
							>
								{stage}
							</span>
						</div>
					</DialogHeader>

					<div className="space-y-3">
						{isProd && (
							<div className="rounded-lg border border-red-200 bg-red-50 p-3">
								<div className="flex items-start gap-2">
									<AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
									<div className="space-y-2 text-sm">
										<p className="text-red-700 font-medium">
											This will run against <span className="font-bold">production</span>.
										</p>
										<label className="flex items-start gap-2 text-red-700">
											<input
												type="checkbox"
												checked={prodConfirmed}
												onChange={(e) => setProdConfirmed(e.target.checked)}
												className="mt-0.5 h-3.5 w-3.5 rounded border-red-300 accent-red-600"
												disabled={mutation.isPending}
											/>
											<span className="text-xs leading-5">
												I understand this triggers a real retrieval on the
												production stage.
											</span>
										</label>
									</div>
								</div>
							</div>
						)}

						<p className="text-sm text-muted-foreground">
							This will re-invoke the retrieval lambda using the data already on
							file.
						</p>

						<div>
							<button
								type="button"
								onClick={() => setShowOverrides((v) => !v)}
								className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
							>
								{showOverrides ? (
									<ChevronDown className="h-3.5 w-3.5" />
								) : (
									<ChevronRight className="h-3.5 w-3.5" />
								)}
								{showOverrides
									? "Hide override fields"
									: isLra
										? "Override PRN (optional)"
										: "Override Company / Document ID (optional)"}
								{!showOverrides && hasOverrides && (
									<span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
								)}
							</button>
						</div>

						{showOverrides &&
							(isLra ? (
							<div className="space-y-1">
								<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
									PRN <span className="text-muted-foreground/60">(optional)</span>
								</div>
								<Input
									value={prn}
									onChange={(e) => setPrn(e.target.value)}
									placeholder="e.g. X1234567"
									disabled={mutation.isPending}
									autoFocus
								/>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
										Company ID{" "}
										<span className="text-muted-foreground/60">(optional)</span>
									</div>
									<Input
										value={companyId}
										onChange={(e) => setCompanyId(e.target.value)}
										placeholder="e.g. 12345678"
										disabled={mutation.isPending}
										autoFocus
									/>
								</div>
								<div className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
										Document ID{" "}
										<span className="text-muted-foreground/60">(optional)</span>
									</div>
									<Input
										value={documentId}
										onChange={(e) => setDocumentId(e.target.value)}
										placeholder="e.g. DOC-12345"
										disabled={mutation.isPending}
									/>
								</div>
							</div>
						))}

						{message && (
							<p
								className={`text-sm ${
									mutation.isSuccess && !mutation.data?.error
										? "text-green-600"
										: "text-red-600"
								}`}
							>
								{message}
							</p>
						)}

						<div className="flex items-center justify-end gap-2 pt-1">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setOpen(false)}
								disabled={mutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={() => mutation.mutate()}
								disabled={!canSubmit}
								className={
									isProd
										? "bg-red-600 hover:bg-red-700 text-white"
										: undefined
								}
							>
								{mutation.isPending
									? "Retrying..."
									: hasOverrides
										? isProd
											? "Retry on PROD with overrides"
											: "Retry with overrides"
										: isProd
											? "Confirm retry on PROD"
											: "Confirm retry"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
