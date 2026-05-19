import { NextRequest, NextResponse } from "next/server";

const MODELS = [
	{ id: "anthropic/claude-sonnet-4", label: "Claude Sonnet" },
	{ id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
	{ id: "openai/gpt-4o", label: "GPT-4o" },
];

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { profileName, profileContext, models } = body;

		const openRouterKey = process.env.OPENROUTER_API_KEY;
		if (!openRouterKey) {
			return NextResponse.json({ error: "No OpenRouter API key configured. Set OPENROUTER_API_KEY in .env.local" }, { status: 500 });
		}

		const selectedModels = (models as string[] | undefined)?.length
			? MODELS.filter(m => (models as string[]).includes(m.id))
			: MODELS;

		const systemPrompt = `You are a senior compliance analyst conducting a Source of Wealth assessment under MAS Notice 626. Based on the profile data provided, write a concise 3-4 paragraph assessment covering: (1) key wealth sources and their verifiability, (2) main risk factors and gaps, (3) recommended next steps. Be specific with figures and dates. Do not use markdown formatting.`;

		const userPrompt = `Assess this HNW individual for Source of Wealth compliance:\n\nSubject: ${profileName}\n\n${profileContext}\n\nProvide a concise assessment (3-4 paragraphs, ~300 words).`;

		const results = await Promise.allSettled(
			selectedModels.map(async (model) => {
				const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${openRouterKey}`,
						"HTTP-Referer": "https://filleasy.hk",
						"X-Title": "Fill Easy Cross-LLM Validation",
					},
					body: JSON.stringify({
						model: model.id,
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content: userPrompt },
						],
						temperature: 0.3,
						max_tokens: 800,
					}),
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`${model.label}: ${response.status} — ${errorText}`);
				}

				const data = await response.json();
				const narrative = data.choices?.[0]?.message?.content ?? "";
				const usage = data.usage ?? {};
				return {
					id: model.id,
					label: model.label,
					narrative,
					tokens: usage.total_tokens ?? 0,
				};
			}),
		);

		const models_output = results.map((r, i) => {
			if (r.status === "fulfilled") return r.value;
			return { id: selectedModels[i].id, label: selectedModels[i].label, narrative: `Error: ${r.reason?.message ?? "Unknown error"}`, tokens: 0 };
		});

		return NextResponse.json({ models: models_output });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
