import fs from "fs";

console.log("Checking index.d.ts for extra...");
const dts = fs.readFileSync("node_modules/openai/index.d.ts", "utf-8");
console.log(dts.includes("extra"));
