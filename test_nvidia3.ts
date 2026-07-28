import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: "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"
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [{"role":"user","content":"Hi, please output a JSON object: {\"message\": \"hello\"}"}],
      temperature: 0.1,
      response_format: { type: "json_object" }
    } as any);
    console.log("With inline param:", completion?.choices?.[0]?.message?.content);
  } catch (error) {
    console.error("Error inline param:", error.message);
  }
}

main();
