async function check() {
  try {
    const rs = await fetch("https://integrate.api.nvidia.com/v1/models/deepseek-ai/deepseek-r1", {
      headers: {
        "Authorization": "Bearer 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"
      }
    });
    console.log(await rs.text());
  } catch (e) { console.error(e); }
}
check();
