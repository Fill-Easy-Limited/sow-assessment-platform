"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invokeLraRetrieval } from "@/lib/aws/client";

interface LraSearchResolveProps {
	requestId: string;
	stage: string;
	onSuccess?: () => Promise<void> | void;
}

export default function LraSearchResolve({
	requestId,
	stage,
	onSuccess,
}: LraSearchResolveProps) {
	const queryClient = useQueryClient();
	const [prn, setPrn] = useState("");
	const [message, setMessage] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			setMessage("");
			return invokeLraRetrieval(requestId, { prn: prn.trim() }, { stage });
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

	return (
		<div className="rounded-xl border border-border/60 p-4 space-y-3">
			<p className="text-sm text-muted-foreground">
				Provide a PRN to resume this LRA request from search.
			</p>

			<div className="space-y-1">
				<div className="text-xs uppercase tracking-wider text-muted-foreground">
					PRN
				</div>
				<Input
					value={prn}
					onChange={(e) => setPrn(e.target.value)}
					placeholder="e.g. X1234567"
					disabled={mutation.isPending}
				/>
			</div>

			<div className="flex items-center gap-2">
				<Button
					onClick={() => mutation.mutate()}
					disabled={!prn.trim() || mutation.isPending}
				>
					{mutation.isPending ? "Sending..." : "Send To Resolve"}
				</Button>
				<span className="text-xs text-muted-foreground">
					Requires a PRN.
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
