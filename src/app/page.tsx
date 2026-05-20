"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import EnvSwitcher from "@/components/env-switcher";
import type { Stage } from "@/lib/dynamodb/config";

const Dashboard = dynamic(() => import("@/components/dashboard"), {
	ssr: false,
});

export default function Home() {
	const [stage, setStage] = useState<Stage>("prod");

	return (
		<div className="flex flex-col min-h-screen">
			{/* Header */}
			<header className="relative bg-gradient-to-r from-[#0b1e2d] via-[#0f2b3c] to-[#0b1e2d] text-white border-b border-white/8">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.08)_0%,_transparent_60%)]" />
				<div className="relative max-w-6xl mx-auto w-full px-6 sm:px-10 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3.5">
						<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-cyan-400/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#headerGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
								<defs><linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
							</svg>
						</div>
						<div>
							<h1 className="text-[15px] font-heading font-semibold tracking-tight leading-tight">
								HNW Wealth Intelligence
							</h1>
							<p className="text-[11px] text-white/45 leading-tight tracking-wide">
								Powered by <span className="text-sky-300 font-semibold">Fill Easy</span> · AI-powered source of wealth · International data sources
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<span className="hidden sm:inline text-[10px] text-white/30 tracking-wide">CorpVerify · GovVerify · China Cross-Border</span>
						<span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md bg-sky-500/15 text-sky-300 border border-sky-400/15 backdrop-blur-sm">
							Demo
						</span>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 sm:px-10">
				<div className="mb-8 flex items-start justify-between">
					<div>
						<div className="flex items-center gap-3 mb-1">
							<div className="h-8 w-1 rounded-full bg-primary" />
							<h1 className="text-2xl font-semibold tracking-tight">
								Request Dashboard
							</h1>
						</div>
						<p className="text-sm text-muted-foreground ml-[1.75rem]">
							Monitor and manage incoming requests
						</p>
					</div>
					<EnvSwitcher value={stage} onChange={setStage} />
				</div>
				<Dashboard stage={stage} />
			</main>

			{/* Footer */}
			<footer className="bg-gradient-to-r from-[#081620] via-[#0a1e2c] to-[#081620] text-white/35 border-t border-white/5">
				<div className="max-w-6xl mx-auto w-full px-6 sm:px-10 py-5">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
						<div>
							<p className="tracking-wide">
								This is a demonstration environment with simulated data. All names, identifiers, and financial figures are fictional.
							</p>
							<p className="text-white/20 tracking-wide mt-1">
								Data sourced via <span className="text-sky-400/60 font-semibold">Fill Easy</span> CorpVerify, GovVerify, and China Cross-Border APIs across 80+ jurisdictions.
							</p>
						</div>
						<p className="text-white/20 shrink-0 tracking-wider">
							&copy; {new Date().getFullYear()} <span className="text-sky-400/40 font-semibold">Fill Easy</span> Limited
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
