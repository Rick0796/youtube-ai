import { execSync } from "child_process";

try {
  // Using pure JS to list running processes in /proc or use generic ps inside node
  const output = execSync("ps aux || true").toString();
  console.log(output);
} catch (e) {
  console.log("Error:", e.message);
}
