"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cancelRequest } from "@/lib/aws/client";
import type { Step } from "@/lib/types";

interface CancelRequestProps {
	requestId: string;
	stage: string;
	step: Step;
	onSuccess?: () => Promise<void> | void;
}

const CANCELLABLE_STEPS = new Set<Step>(["initiated", "search", "manual"]);

export default function CancelRequest({
	requestId,
	stage,
	step,
	onSuccess,
}: CancelRequestProps) {
	const [message, setMessage] = useState("");
	const canCancel = CANCELLABLE_STEPS.has(step);

	const mutation = useMutation({
		mutationFn: async () => {
			setMessage("");
			const confirmed = window.confirm(
				`Cancel request ${requestId}? This can only be done before retrieval starts.`,
			);
			if (!confirmed) {
				return { success: false, error: "Cancellation aborted" };
			}
			return cancelRequest(requestId, { stage });
		},
		onSuccess: (result) => {
			if (result.success) {
				setMessage(result.message ?? "Request cancelled");
				onSuccess?.();
				return;
			}
			if (result.error !== "Cancellation aborted") {
				setMessage(result.error ?? "Failed to cancel request");
			}
		},
		onError: (error) => {
			setMessage(error instanceof Error ? error.message : "Failed to cancel request");
		},
	});

	if (!canCancel) {
		return null;
	}

	return (
		<div className="space-y-2">
			<Button
				type="button"
				variant="destructive"
				onClick={() => mutation.mutate()}
				disabled={mutation.isPending}
			>
				{mutation.isPending ? "Cancelling..." : "Cancel Request"}
			</Button>
			{message && (
				<p className={`text-sm ${message.toLowerCase().includes("cancelled") ? "text-green-600" : "text-red-600"}`}>
					{message}
				</p>
			)}
		</div>
	);
}
