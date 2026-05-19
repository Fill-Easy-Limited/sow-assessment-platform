import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { messages, profileName, profileContext, model } = body;

		const openRouterKey = process.env.OPENROUTER_API_KEY;
		if (!openRouterKey) {
			return NextResponse.json({ error: "No OpenRouter API key configured. Set OPENROUTER_API_KEY in .env.local" }, { status: 500 });
		}

		const selectedModel = model || "google/gemini-2.5-flash";

		const systemPrompt = `You are a senior compliance analyst assistant at a regulated financial institution, specialising in HNW (High Net Worth) Source of Wealth assessments under MAS (Monetary Authority of Singapore) standards — specifically MAS Notice 626 §6.18–6.22.

You are currently reviewing the case for: ${profileName}

Context about this case:
${profileContext}

Your role:
- Answer questions about this specific HNW case with precision and regulatory awareness
- Reference specific data points, dates, figures, and source citations when available
- Highlight risk factors, verification gaps, and areas requiring further investigation
- Recommend concrete next steps aligned with MAS compliance requirements
- Use professional compliance language suitable for regulatory review
- Be concise but thorough — aim for 2-4 sentence responses unless more detail is requested
- When discussing wealth figures, always note the confidence level if known
- Flag any areas where additional documentation or verification is needed

Important: You are part of the Fill Easy Wealth Intelligence platform. Reference Fill Easy APIs (CorpVerify, GovVerify, China Cross-Border) when suggesting verification actions.`;

		const apiMessages = [
			{ role: "system", content: systemPrompt },
			...messages.map((m: { role: string; text: string }) => ({
				role: m.role === "assistant" ? "assistant" : "user",
				content: m.text,
			})),
		];

		const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${openRouterKey}`,
				"HTTP-Referer": "https://filleasy.hk",
				"X-Title": "Fill Easy Compliance Assistant",
			},
			body: JSON.stringify({
				model: selectedModel,
				messages: apiMessages,
				temperature: 0.4,
				max_tokens: 1000,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			return NextResponse.json({ error: `OpenRouter API error: ${response.status} — ${errorData}` }, { status: response.status });
		}

		const data = await response.json();
		const reply = data.choices?.[0]?.message?.content ?? "";

		return NextResponse.json({ reply, model: selectedModel });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
