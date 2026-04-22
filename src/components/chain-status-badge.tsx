import { Badge } from "@/components/ui/badge";

const CHAIN_STATUS_STYLES: Record<string, string> = {
	active:
		"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
	completed:
		"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
};

const FALLBACK_STYLE =
	"bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700";

export default function ChainStatusBadge({ status }: { status: string }) {
	const style = CHAIN_STATUS_STYLES[status] ?? FALLBACK_STYLE;
	return (
		<Badge variant="outline" className={style}>
			{status}
		</Badge>
	);
}
