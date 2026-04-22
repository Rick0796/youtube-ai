import { execSync } from "child_process";

try {
  const fuser = execSync("apk add fuser || apt-get install psmisc || true; fuser -k 3000/tcp").toString();
  console.log("Fuser output:", fuser);
} catch (e) {
  console.log("Error:", e.message);
}
