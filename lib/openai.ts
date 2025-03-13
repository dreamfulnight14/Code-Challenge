import OpenAI from "openai";

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export async function analyzeMood(
  content: string
): Promise<{ mood: string; intensity: number }> {
  try {
    const prompt = `Analyze the mood of the following journal entry. Respond with ONLY one keyword and a numeric intensity from 0 to 10: (happy, sad, neutral, angry, fearful, surprised).\n\nEntry:\n${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    });

    const result =
      completion.choices[0]?.message?.content?.toLowerCase().trim() ??
      "neutral 5";

    const match = result.match(/^([a-z]+)\s*(\d{1,2})$/);

    if (match) {
      const [, mood, intensity] = match;
      return { mood, intensity: Math.min(10, Math.max(0, Number(intensity))) };
    }

    return { mood: "neutral", intensity: 5 };
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return { mood: "neutral", intensity: 5 };
  }
}
