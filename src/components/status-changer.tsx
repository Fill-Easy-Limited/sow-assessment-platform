"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { STEP_ORDER } from "@/lib/types";

interface StatusChangerProps {
	requestId: string;
	currentStep: string;
}

export default function StatusChanger({
	requestId,
	currentStep,
}: StatusChangerProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		// Status changes are read-only for now — this is a placeholder
		mutationFn: async (_newStep: string) => {
			throw new Error("Status changes not yet supported");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["requests"] });
		},
	});

	return (
		<Select
			value={currentStep}
			onValueChange={(v) => v && mutation.mutate(v)}
			disabled={mutation.isPending}
		>
			<SelectTrigger className="w-[160px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{STEP_ORDER.map((s) => (
					<SelectItem key={s} value={s}>
						{s}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
