"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveRequest } from "@/lib/aws/client";

interface SearchResolveProps {
	requestId: string;
	stage: string;
	defaultCompanyId?: string;
	onSuccess?: () => Promise<void> | void;
}

export default function SearchResolve({
	requestId,
	stage,
	defaultCompanyId,
	onSuccess,
}: SearchResolveProps) {
	const queryClient = useQueryClient();
	const [companyId, setCompanyId] = useState(defaultCompanyId ?? "");
	const [documentId, setDocumentId] = useState("");
	const [message, setMessage] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			setMessage("");
			return resolveRequest(
				requestId,
				{
					companyId: companyId.trim() || undefined,
					documentId: documentId.trim() || undefined,
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
			setMessage(
				error instanceof Error ? error.message : "Failed to resolve request.",
			);
		},
	});

	const hasIdentifier = Boolean(companyId.trim()) || Boolean(documentId.trim());

	return (
		<div className="rounded-xl border border-border/60 p-4 space-y-3">
			<p className="text-sm text-muted-foreground">
				Provide a company ID or document ID to resume this request from search.
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="space-y-1">
					<div className="text-xs uppercase tracking-wider text-muted-foreground">
						Company ID
					</div>
					<Input
						value={companyId}
						onChange={(e) => setCompanyId(e.target.value)}
						placeholder="e.g. 12345678"
						disabled={mutation.isPending}
					/>
				</div>

				<div className="space-y-1">
					<div className="text-xs uppercase tracking-wider text-muted-foreground">
						Document ID
					</div>
					<Input
						value={documentId}
						onChange={(e) => setDocumentId(e.target.value)}
						placeholder="e.g. DOC-12345"
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
					Requires a company ID or document ID.
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
