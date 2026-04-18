"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { retryRequest } from "@/lib/aws/client";

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
	const [message, setMessage] = useState("");

	const mutation = useMutation({
		mutationFn: async () => {
			setMessage("");
			return retryRequest(requestId, { stage });
		},
		onSuccess: (result) => {
			if (result.success) {
				setMessage(result.message ?? "Retry invoked.");
				queryClient.invalidateQueries({ queryKey: ["requests"] });
				onSuccess?.();
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

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => mutation.mutate()}
					disabled={mutation.isPending}
				>
					{mutation.isPending ? "Retrying..." : "Retry Retrieval"}
				</Button>
				<span className="text-xs text-muted-foreground">
					Re-invokes the retrieval lambda with the existing request data.
				</span>
			</div>
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
		</div>
	);
}
