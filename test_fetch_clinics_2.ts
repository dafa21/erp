import fetch from "node-fetch";
async function run() {
  const headers = { 'x-user-id': '1', 'x-user-role': 'Admin'};
  const res = await fetch("http://localhost:3000/api/clinics", { headers });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Text:", text);
}
run();
