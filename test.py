from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

try:
  completion = client.chat.completions.create(
    model="deepseek-ai/deepseek-r1",
    messages=[{"role":"user","content":"Hi"}],
    temperature=1,
    top_p=0.95,
    max_tokens=10
  )
  print("Success!")
except Exception as e:
  print("Error:", e)
