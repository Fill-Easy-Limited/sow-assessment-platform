import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { profileName, profileSummary, netWorth, riskRating, riskScore, careerPhases, wealthCategories, corroborationScores, overallConfidence, keyRiskFactors, model } = body;

		const openRouterKey = process.env.OPENROUTER_API_KEY;
		if (!openRouterKey) {
			return NextResponse.json({ error: "No OpenRouter API key configured. Set OPENROUTER_API_KEY in .env.local" }, { status: 500 });
		}

		const selectedModel = model || "anthropic/claude-sonnet-4";

		const systemPrompt = `You are a senior compliance analyst at a regulated financial institution. You write detailed Source of Wealth (SOW) narrative reports for High Net Worth (HNW) individual assessments under MAS (Monetary Authority of Singapore) regulatory standards — specifically MAS Notice 626 §6.18–6.22.

Your narratives must be:
- Comprehensive (800-1200 words, 6-8 detailed paragraphs)
- Factual and evidence-based — cite specific data points, dates, and figures
- Structured chronologically — trace the career-to-wealth trajectory
- Risk-aware — highlight regulatory exposure, jurisdictional complexity, and verification gaps
- Professional compliance language — suitable for regulatory review
- Include a clear conclusion with risk assessment and recommended next steps

Structure your narrative as follows:
1. Opening paragraph: Subject identification, net worth summary, primary wealth sources
2. Career origin and early wealth formation
3. Key wealth crystallisation events (IPOs, exits, major transactions)
4. Current wealth composition breakdown with confidence assessments
5. Risk factors and regulatory considerations
6. Jurisdictional complexity and cross-border structures
7. Verification gaps and areas requiring further investigation
8. Conclusion with overall assessment and recommendations

Use paragraph breaks (double newline) between sections. Do NOT use markdown headers or bullet points — write in flowing prose paragraphs suitable for a compliance report.`;

		const userPrompt = `Generate a comprehensive Source of Wealth narrative report for the following HNW individual:

Subject: ${profileName}
Estimated Net Worth: $${(netWorth / 1e9).toFixed(1)}B
Risk Rating: ${riskRating} (${riskScore}/100)
Overall Confidence: ${overallConfidence}%

Corroboration Risk Scores (MAS 3C Framework):
- Consistency Risk: ${corroborationScores?.consistency ?? "N/A"}/100
- Correctness Risk: ${corroborationScores?.correctness ?? "N/A"}/100
- Completeness Risk: ${corroborationScores?.completeness ?? "N/A"}/100

Profile Summary: ${profileSummary}

Career Phases:
${(careerPhases ?? []).map((p: { title: string; startYear: number; endYear: number | null; organization?: string; location: string; cumulativeWealthUSD: number; description: string }) => `- ${p.startYear}–${p.endYear ?? "Present"}: ${p.title} (${p.organization ?? ""}, ${p.location}) — $${(p.cumulativeWealthUSD / 1e6).toFixed(0)}M cumulative`).join("\n")}

Wealth Composition:
${(wealthCategories ?? []).map((w: { category: string; totalUSD: number; percentage: number; avgConfidence: number }) => `- ${w.category}: $${(w.totalUSD / 1e6).toFixed(0)}M (${w.percentage.toFixed(1)}%, ${w.avgConfidence}% confidence)`).join("\n")}

Key Risk Factors: ${keyRiskFactors ?? "None specified"}

Write a detailed 800-1200 word narrative report. Use double newlines between paragraphs.`;

		const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${openRouterKey}`,
				"HTTP-Referer": "https://filleasy.hk",
				"X-Title": "Fill Easy Wealth Intelligence",
			},
			body: JSON.stringify({
				model: selectedModel,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.7,
				max_tokens: 3000,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			return NextResponse.json({ error: `OpenRouter API error: ${response.status} — ${errorData}` }, { status: response.status });
		}

		const data = await response.json();
		const narrative = data.choices?.[0]?.message?.content ?? "";
		const usage = data.usage ?? {};

		return NextResponse.json({
			narrative,
			model: selectedModel,
			usage: { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens, totalTokens: usage.total_tokens },
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
