import { execSync } from "child_process";

try {
  console.log("Killing old zombie servers");
  [938, 949, 961, 967].forEach(pid => {
     try {
       execSync(`kill -9 ${pid}`);
     } catch(e){}
  });
} catch (e) {
  console.log("Error:", e.message);
}
