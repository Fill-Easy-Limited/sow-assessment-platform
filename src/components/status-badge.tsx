import { Badge } from "@/components/ui/badge";
import type { Step } from "@/lib/types";

const STEP_STYLES: Record<Step, string> = {
	initiated:
		"bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700",
	search:
		"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
	manual:
		"bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
	retrieved:
		"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	processing:
		"bg-primary/10 text-primary-foreground border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/40",
	ready:
		"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
	delivered:
		"bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700",
};

export default function StatusBadge({ step }: { step: string }) {
	const style = STEP_STYLES[step as Step] ?? STEP_STYLES.initiated;
	return (
		<Badge variant="outline" className={style}>
			{step}
		</Badge>
	);
}
