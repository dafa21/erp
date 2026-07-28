async function check() {
  try {
    const rs = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: {
        "Authorization": "Bearer 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"
      }
    });
    const json = await rs.json();
    console.log(json.data.map(m => m.id).filter(id => id.includes("deepseek")));
  } catch (e) { console.error(e); }
}
check();
