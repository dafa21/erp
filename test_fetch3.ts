async function main() {
  const rs = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek-ai/deepseek-v4-pro",
      messages: [{"role":"user","content":"Hi"}],
    })
  });
  console.log("Status:", rs.status);
  console.log("Text:", await rs.text());
}
main();
