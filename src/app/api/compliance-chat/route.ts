import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { messages, profileName, profileContext, model } = body;

		const openRouterKey = process.env.OPENROUTER_API_KEY ?? "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";
		if (!openRouterKey) {
			return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured. Set it in .env.local or your hosting environment." }, { status: 500 });
		}

		const selectedModel = model || "anthropic/claude-sonnet-4";

		const systemPrompt = `You are a senior compliance analyst assistant at a regulated financial institution, specialising in HNW (High Net Worth) Source of Wealth assessments under MAS (Monetary Authority of Singapore) standards — specifically MAS Notice 626 §6.18–6.22.

You are currently reviewing the case for: ${profileName}

Context about this case:
${profileContext}

Your role:
- Answer questions about this specific HNW case with precision and regulatory awareness.
- Reference specific data points, dates, figures, and source citations when available.
- Highlight risk factors, verification gaps, and areas requiring further investigation.
- Recommend concrete next steps aligned with MAS compliance requirements.
- Use professional compliance language suitable for regulatory review.
- Be concise but thorough — aim for 2-4 sentence responses unless more detail is requested.
- When discussing wealth figures, always note the confidence level if known.
- Flag any areas where additional documentation or verification is needed.

You are part of the Fill Easy Wealth Intelligence platform. Reference Fill Easy APIs (CorpVerify, GovVerify, China Cross-Border) when suggesting verification actions.

FORMATTING — STRICT REQUIREMENTS:
The UI renders your reply as plain text (whitespace-pre-wrap). Markdown is NOT rendered, so any markdown syntax will appear as raw characters to the user. Follow these rules without exception:

1. Do NOT use any markdown:
   - No asterisks for bold or italic (no **bold**, no *italic*, no _underscores_).
   - No markdown headers (no leading #, ##, ### on any line).
   - No fenced or inline code blocks (no triple backticks, no single backticks).
   - No markdown links — write a URL inline as plain text if you must include one.
   - No tables.

2. For lists, use plain-text formatting:
   - Numbered lists: write each item on its own line beginning with "1.", "2.", "3.", ...
   - Bulleted lists: each item on its own line beginning with "• " (a real bullet character) or "- " — keep one style per response, and never combine with markdown emphasis.

3. Structure with paragraphs, not headers:
   - Separate logical sections with a single blank line between paragraphs.
   - If a section needs a label, write it as a short capitalised phrase ending with a colon at the start of the paragraph, for example: "Risk assessment: ...".

4. Citations and figures:
   - Write source names inline as plain text, for example: "per SEC Form F-1 (2014)" or "Fill Easy HK Land Registry search confirmed".
   - Use plain digits with thousands separators ("US$1,500,000,000") or compact form ("US$1.5B") — be consistent within one reply.
   - Always pair a wealth figure with its confidence level when known, for example: "US$745M (55% confidence)".

5. Tone and length:
   - Keep responses tight: aim for 2-4 sentences for direct questions, up to 3 short paragraphs for analytical questions.
   - No emojis. No exclamation marks. No first-person editorial ("I think", "I believe").
   - Open with the answer; reserve caveats and recommendations for the closing sentence.

If a previous assistant turn in this conversation accidentally used markdown, do NOT continue that style — silently switch to the plain-text format above for your next reply.`;

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
