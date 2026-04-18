"use client";

import { format, formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { RequestItem } from "@/lib/types";
import CancelRequest from "./cancel-request";
import FileUpload from "./file-upload";
import LraSearchResolve from "./lra-search-resolve";
import RetryRequest from "./retry-request";
import SearchResolve from "./search-resolve";
import StatusBadge from "./status-badge";

interface RequestDetailProps {
	item: RequestItem | null;
	open: boolean;
	onClose: () => void;
	onRequestUpdated?: () => Promise<void> | void;
}

function formatDuration(ms: number): string {
	if (ms === 0) return "—";
	const seconds = Math.floor(ms / 1000);
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function RequestDetail({
	item,
	open,
	onClose,
	onRequestUpdated,
}: RequestDetailProps) {
	const [showErrorDetails, setShowErrorDetails] = useState(false);
	const [showDebugImage, setShowDebugImage] = useState(false);

	useEffect(() => {
		setShowErrorDetails(false);
		setShowDebugImage(false);
	}, [item?.requestId]);

	if (!item) return null;

	const isLra = item.requestId.startsWith("LR_");
	const startedDate = new Date(item.startedAt);

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="w-[min(580px,calc(100vw-1rem))] max-w-[580px] sm:max-w-[580px] max-h-[calc(100vh-1rem)] overflow-y-auto rounded-2xl p-4">
				<DialogHeader className="space-y-1 pb-1">
					<DialogTitle className="font-mono text-xs tracking-[0.16em] text-muted-foreground">
						{item.requestId}
					</DialogTitle>
					<div className="flex flex-wrap items-center gap-1.5">
						<StatusBadge step={item.step} />
						<span className="text-[11px] text-muted-foreground">
							{item.organization} • {item._stage ?? item.deploymentStage} •{" "}
							{item.type}
						</span>
					</div>
				</DialogHeader>

				<div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
					<Field label="Country" value={item.countryCode} />
					<Field label="Environment" value={item.environment} />
					<Field label="Automated" value={item.automated ? "Yes" : "No"} />
					<Field label="Duration" value={formatDuration(item.duration ?? 0)} />
					{isLra ? (
						<>
							<Field label="Address" value={item.address} />
							<Field label="PRN" value={item.prn} />
						</>
					) : (
						<>
							<Field label="Company Name" value={item.companyName} />
							<Field label="Company ID" value={item.companyId} />
							<Field label="Document ID" value={item.documentId} />
							<Field label="Document Type" value={item.documentType} />
						</>
					)}
					<Field
						label="Started At"
						value={`${format(startedDate, "yyyy-MM-dd HH:mm:ss")} (${formatDistanceToNow(startedDate, { addSuffix: true })})`}
					/>
				</div>

				{["initiated", "search", "manual"].includes(item.step) && (
					<>
						<Separator className="my-3" />
						<div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
							<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Actions
							</h4>
							<CancelRequest
								requestId={item.requestId}
								stage={item._stage ?? item.deploymentStage}
								step={item.step}
								onSuccess={onRequestUpdated}
							/>
							{item.step === "manual" && item.error && (
								<RetryRequest
									requestId={item.requestId}
									stage={item._stage ?? item.deploymentStage}
									onSuccess={onRequestUpdated}
								/>
							)}
						</div>
					</>
				)}

				{item.error && (
					<>
						<Separator className="my-3" />
						<div className="space-y-2 rounded-lg border border-red-200 bg-red-50/70 p-3">
							<div className="flex items-center justify-between gap-3">
								<h4 className="text-xs font-semibold uppercase tracking-wider text-red-600">
									Error
								</h4>
								{(item.error.step || item.error.stack) && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setShowErrorDetails((prev) => !prev)}
									>
										{showErrorDetails ? "Hide details" : "Show details"}
									</Button>
								)}
							</div>
							<p className="text-sm leading-6">
								<span className="text-muted-foreground">Message:</span>{" "}
								{item.error.message}
							</p>
							{showErrorDetails && item.error.step && (
								<p className="text-sm leading-6">
									<span className="text-muted-foreground">Step:</span>{" "}
									{item.error.step}
								</p>
							)}
							{showErrorDetails && item.error.stack && (
								<pre className="max-h-40 overflow-x-auto rounded-md bg-red-100/50 p-2.5 text-[11px] leading-5 whitespace-pre-wrap">
									{item.error.stack}
								</pre>
							)}
						</div>
					</>
				)}

				{item.debugUrl && (
					<>
						<Separator className="my-3" />
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Debug Screenshot
								</h4>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowDebugImage((prev) => !prev)}
								>
									{showDebugImage ? "Hide" : "Show"}
								</Button>
							</div>
							{showDebugImage && (
								<div className="overflow-hidden rounded-lg border border-border/60">
									<Image
										src={item.debugUrl}
										alt={`Debug screenshot for ${item.requestId}`}
										width={1280}
										height={720}
										className="h-auto w-full object-contain"
									/>
								</div>
							)}
						</div>
					</>
				)}

				{item.step === "manual" && (
					<>
						<Separator className="my-3" />
						<div className="rounded-lg border border-border/60 bg-muted/20 p-3">
							<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
								Upload File
							</h4>
							<FileUpload
								requestId={item.requestId}
								step={item.step}
								stage={item._stage ?? item.deploymentStage}
								uploadUrl={item.uploadUrl}
								onSuccess={onRequestUpdated}
							/>
						</div>
					</>
				)}

				{item.step === "search" && (
					<>
						<Separator className="my-3" />
						<div className="rounded-lg border border-border/60 bg-muted/20 p-3">
							<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
								Resolve Search Request
							</h4>
							{isLra ? (
								<LraSearchResolve
									requestId={item.requestId}
									stage={item._stage ?? item.deploymentStage}
									onSuccess={onRequestUpdated}
								/>
							) : (
								<SearchResolve
									requestId={item.requestId}
									stage={item._stage ?? item.deploymentStage}
									defaultCompanyId={item.companyId}
									onSuccess={onRequestUpdated}
								/>
							)}
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

function Field({
	label,
	value,
	children,
}: {
	label: string;
	value?: string;
	children?: React.ReactNode;
}) {
	return (
		<div>
			<span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
				{label}
			</span>
			<div className="mt-0.5 text-sm font-medium break-words leading-5">
				{children ?? value ?? "—"}
			</div>
		</div>
	);
}
