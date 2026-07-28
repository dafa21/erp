import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: "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"
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-v4-pro",
      messages: [{"role":"user","content":"Hi"}],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 100,
      chat_template_kwargs: { thinking: false }
    } as any);
    console.log("With inline param:", completion?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error("Error inline param:", error.message);
  }
}

main();
