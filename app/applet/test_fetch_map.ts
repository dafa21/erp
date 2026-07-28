import fetch from "node-fetch";

async function run() {
  const res = await fetch("http://localhost:3000/api/public/map-data");
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Text:", text);
}
run();
