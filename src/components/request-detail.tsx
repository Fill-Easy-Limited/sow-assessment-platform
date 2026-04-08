"use client";

import { format, formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { RequestItem } from "@/lib/types";
import CancelRequest from "./cancel-request";
import FileUpload from "./file-upload";
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

	const startedDate = new Date(item.startedAt);

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="w-[86vw] max-w-[86vw] sm:max-w-[86vw] h-[88vh] max-h-[88vh] overflow-y-auto rounded-2xl">
				<DialogHeader>
					<DialogTitle className="font-mono text-sm tracking-wide text-muted-foreground">
						{item.requestId}
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
					<Field label="Type" value={item.type} />
					<Field label="Status">
						<StatusBadge step={item.step} />
					</Field>
					<Field label="Organization" value={item.organization} />
					<Field label="Stage" value={item._stage ?? item.deploymentStage} />
					<Field label="Environment" value={item.environment} />
					<Field label="Country" value={item.countryCode} />
					<Field label="Document Type" value={item.documentType} />
					<Field label="Company ID" value={item.companyId} />
					<Field label="Automated" value={item.automated ? "Yes" : "No"} />
					<Field label="Duration" value={formatDuration(item.duration ?? 0)} />
					<Field
						label="Started At"
						value={`${format(startedDate, "yyyy-MM-dd HH:mm:ss")} (${formatDistanceToNow(startedDate, { addSuffix: true })})`}
					/>
				</div>

				{["initiated", "search", "manual"].includes(item.step) && (
					<>
						<Separator className="my-4" />
						<div>
							<h4 className="text-sm font-semibold text-muted-foreground mb-2">
								Actions
							</h4>
							<CancelRequest
								requestId={item.requestId}
								stage={item._stage ?? item.deploymentStage}
								step={item.step}
								onSuccess={onRequestUpdated}
							/>
						</div>
					</>
				)}

				{/* Error section */}
				{item.error && (
					<>
						<Separator className="my-4" />
						<div className="space-y-2 rounded-lg bg-red-50 p-4">
							<h4 className="text-sm font-semibold text-red-600">Error</h4>
							<p className="text-sm">
								<span className="text-muted-foreground">Message:</span>{" "}
								{item.error.message}
							</p>
							{(item.error.step || item.error.stack) && (
								<div className="pt-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setShowErrorDetails((prev) => !prev)}
									>
										{showErrorDetails ? "Hide details" : "Show details"}
									</Button>
								</div>
							)}
							{showErrorDetails && item.error.step && (
								<p className="text-sm">
									<span className="text-muted-foreground">Step:</span>{" "}
									{item.error.step}
								</p>
							)}
							{showErrorDetails && item.error.stack && (
								<pre className="text-xs bg-red-100/50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
									{item.error.stack}
								</pre>
							)}
						</div>
					</>
				)}

				{/* Debug Screenshot */}
				{item.debugUrl && (
					<>
						<Separator className="my-4" />
						<div className="space-y-3">
							<h4 className="text-sm font-semibold text-muted-foreground mb-1">
								Debug Screenshot
							</h4>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowDebugImage((prev) => !prev)}
							>
								{showDebugImage ? "Hide" : "Show"}
							</Button>
							{showDebugImage && (
								<img
									src={item.debugUrl}
									alt={`Debug screenshot for ${item.requestId}`}
									className="w-full rounded-lg border border-border/60"
								/>
							)}
						</div>
					</>
				)}

				{/* File Upload (manual step only) */}
				{item.step === "manual" && (
					<>
						<Separator className="my-4" />
						<div>
							<h4 className="text-sm font-semibold text-muted-foreground mb-2">
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

				{/* Search Resolve (search step only) */}
				{item.step === "search" && (
					<>
						<Separator className="my-4" />
						<div>
							<h4 className="text-sm font-semibold text-muted-foreground mb-2">
								Resolve Search Request
							</h4>
							<SearchResolve
								requestId={item.requestId}
								stage={item._stage ?? item.deploymentStage}
								defaultCompanyId={item.companyId}
								defaultCompanyName={item.companyName}
								defaultDocumentType={item.documentType}
								onSuccess={onRequestUpdated}
							/>
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
			<span className="text-[11px] uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			<div className="font-medium mt-0.5">{children ?? value}</div>
		</div>
	);
}
