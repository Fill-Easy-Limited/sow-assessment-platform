"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveRequest } from "@/lib/aws/client";

interface SearchResolveProps {
	requestId: string;
	stage: string;
	defaultCompanyId?: string;
	defaultCompanyName?: string;
	defaultDocumentType?: string;
	onSuccess?: () => Promise<void> | void;
}

export default function SearchResolve({
	requestId,
	stage,
	defaultCompanyId,
	defaultCompanyName,
	defaultDocumentType,
	onSuccess,
}: SearchResolveProps) {
	const queryClient = useQueryClient();
	const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
	const [documentId, setDocumentId] = useState("");
	const [companyName, setCompanyName] = useState(defaultCompanyName ?? "");
	const [documentType, setDocumentType] = useState(defaultDocumentType ?? "");
	const [message, setMessage] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			setMessage("");
			return resolveRequest(
				requestId,
				{
					companyId: companyId.trim() || undefined,
					companyName: companyName.trim() || undefined,
					documentId: documentId.trim() || undefined,
					documentType: documentType.trim() || undefined,
				},
				{ stage },
			);
		},
		onSuccess: (result) => {
			if (result.success) {
				setMessage(result.message ?? "Resolve submitted.");
				queryClient.invalidateQueries({ queryKey: ["requests"] });
				onSuccess?.();
				return;
			}
			setMessage(result.error ?? "Failed to resolve request.");
		},
		onError: (error) => {
			setMessage(error instanceof Error ? error.message : "Failed to resolve request.");
		},
	});

	const hasIdentifier =
		Boolean(companyId.trim()) || Boolean(documentId.trim()) || Boolean(companyName.trim());

	return (
		<div className="rounded-xl border border-border/60 p-4 space-y-3">
			<p className="text-sm text-muted-foreground">
				Provide company or document identifiers to resume this request from search.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="space-y-1">
					<label className="text-xs uppercase tracking-wider text-muted-foreground">
						Company ID
					</label>
					<Input
						value={companyId}
						onChange={(e) => setCompanyId(e.target.value)}
						placeholder="e.g. 12345678"
						disabled={mutation.isPending}
					/>
				</div>

				<div className="space-y-1">
					<label className="text-xs uppercase tracking-wider text-muted-foreground">
						Document ID
					</label>
					<Input
						value={documentId}
						onChange={(e) => setDocumentId(e.target.value)}
						placeholder="Optional direct document id"
						disabled={mutation.isPending}
					/>
				</div>

				<div className="space-y-1">
					<label className="text-xs uppercase tracking-wider text-muted-foreground">
						Company Name
					</label>
					<Input
						value={companyName}
						onChange={(e) => setCompanyName(e.target.value)}
						placeholder="Optional company name"
						disabled={mutation.isPending}
					/>
				</div>

				<div className="space-y-1">
					<label className="text-xs uppercase tracking-wider text-muted-foreground">
						Document Type
					</label>
					<Input
						value={documentType}
						onChange={(e) => setDocumentType(e.target.value)}
						placeholder="Optional override"
						disabled={mutation.isPending}
					/>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Button
					onClick={() => mutation.mutate()}
					disabled={!hasIdentifier || mutation.isPending}
				>
					{mutation.isPending ? "Sending..." : "Send To Resolve"}
				</Button>
				<span className="text-xs text-muted-foreground">
					Requires at least one of company id, company name, or document id.
				</span>
			</div>

			{message && (
				<p
					className={`text-sm ${
						mutation.isError || (!mutation.isPending && !mutation.isSuccess)
							? "text-red-600"
							: "text-green-600"
					}`}
				>
					{message}
				</p>
			)}
		</div>
	);
}
