"use client";

import { updateRequestStatus } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const STEPS = ["completed", "failed", "in-progress", "pending", "cancelled"];

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
    mutationFn: (newStep: string) => updateRequestStatus(requestId, newStep),
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
        {STEPS.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
