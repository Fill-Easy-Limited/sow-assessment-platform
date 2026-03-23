import { Badge } from "@/components/ui/badge";
import { StepStatus } from "@/lib/types";

const STEP_STYLES: Record<StepStatus, string> = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cancelled:
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function StatusBadge({ step }: { step: string }) {
  const style = STEP_STYLES[step as StepStatus] ?? STEP_STYLES.pending;
  return (
    <Badge variant="outline" className={style}>
      {step}
    </Badge>
  );
}
