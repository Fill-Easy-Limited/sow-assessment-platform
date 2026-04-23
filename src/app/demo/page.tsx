import type { Metadata } from "next";
import KycCnDemo from "@/components/kyc-cn-demo";

export const metadata: Metadata = {
	title: "KYC China · Demo",
	robots: { index: false, follow: false },
};

export default function DemoPage() {
	return (
		<main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 sm:px-10">
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="h-8 w-1 rounded-full bg-primary" />
					<h1 className="text-2xl font-semibold tracking-tight">
						KYC China — Live Demo
					</h1>
				</div>
				<p className="text-sm text-muted-foreground ml-[1.75rem]">
					Identity verification, mobile lookup, and risk assessment for Chinese
					citizens — powered by FillEasy.
				</p>
			</div>

			<KycCnDemo />

			<p className="mt-10 text-[11px] text-muted-foreground">
				Demo environment · canary.api.fill-easy.com · requests are proxied
				server-side; credentials never touch the browser.
			</p>
		</main>
	);
}
