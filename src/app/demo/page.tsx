import type { Metadata } from "next";
import ApiDemo from "@/components/api-demo";

export const metadata: Metadata = {
	title: "SOW Assessment Platform · Demo",
	robots: { index: false, follow: false },
};

export default function DemoPage() {
	return (
		<main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 sm:px-10">
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-2">
					<div className="h-10 w-10 rounded-lg bg-[#0f2b3c] flex items-center justify-center">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
					</div>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							Source of Wealth Assessment
						</h1>
						<p className="text-sm text-muted-foreground">
							AI-powered due diligence with verified government and financial data sources.
						</p>
					</div>
				</div>
			</div>

			<ApiDemo />
		</main>
	);
}
