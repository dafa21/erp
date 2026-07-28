import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: "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"
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-r1",
      messages: [{"role":"user","content":"Hi"}],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 100,
    });
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error standard:", error.message);
  }
}

main();
