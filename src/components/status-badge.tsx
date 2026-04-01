import { Badge } from "@/components/ui/badge";
import { StepStatus } from "@/lib/types";

const STEP_STYLES: Record<StepStatus, string> = {
  completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  failed: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  "in-progress":
    "bg-primary/10 text-primary-foreground border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/40",
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  cancelled:
    "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700",
};

export default function StatusBadge({ step }: { step: string }) {
  const style = STEP_STYLES[step as StepStatus] ?? STEP_STYLES.pending;
  return (
    <Badge variant="outline" className={style}>
      {step}
    </Badge>
  );
}
