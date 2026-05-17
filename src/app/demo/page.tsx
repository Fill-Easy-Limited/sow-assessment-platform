import type { Metadata } from "next";
import ApiDemo from "@/components/api-demo";

export const metadata: Metadata = {
	title: "SOW Assessment Platform · Demo",
	robots: { index: false, follow: false },
};

export default function DemoPage() {
	return (
		<div className="flex flex-col min-h-screen">
			{/* Header */}
			<header className="bg-[#0f2b3c] text-white border-b border-white/10">
				<div className="max-w-6xl mx-auto w-full px-6 sm:px-10 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
						</div>
						<div>
							<h1 className="text-base font-semibold tracking-tight leading-tight">
								SOW Assessment Platform
							</h1>
							<p className="text-[11px] text-white/50 leading-tight">
								AI-powered due diligence · Government & financial data sources
							</p>
						</div>
					</div>
					<span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-400/20">
						Demo
					</span>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 sm:px-10">
				<ApiDemo />
			</main>

			{/* Footer */}
			<footer className="bg-[#0a1e2c] text-white/40 border-t border-white/5">
				<div className="max-w-6xl mx-auto w-full px-6 sm:px-10 py-5">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
						<p>
							This is a demonstration environment with simulated data. All names, identifiers, and financial figures are fictional.
						</p>
						<p className="text-white/25 shrink-0">
							&copy; {new Date().getFullYear()} Confidential
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
