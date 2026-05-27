import OpenAI from "openai";

/**
 * xAI Client
 * All AI features in this platform (design generation, copywriting, recommendations, etc.)
 * must go through this client per project requirements.
 */
export const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1", // xAI's OpenAI-compatible endpoint
});

/**
 * Generate postcard concepts + copy using xAI
 */
export async function generatePostcardConcepts(prompt: string) {
  const completion = await xai.chat.completions.create({
    model: "grok-2", // Update to latest available Grok model
    messages: [
      {
        role: "system",
        content:
          "You are an expert direct mail designer and copywriter specializing in high-converting local business postcards.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return completion.choices[0]?.message?.content ?? "No response generated";
}

// @cursor: Add more helper functions here (targeting suggestions, copy improvement, etc.)
