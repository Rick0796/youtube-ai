import { createRequire } from "module";
const require = createRequire(import.meta.url);
const yt = require('youtube-transcript');
const { YoutubeTranscript } = yt.default || yt;

async function testFetch() {
  try {
     console.log("Start fetching transcript");
     await YoutubeTranscript.fetchTranscript("BtlWoqWLm9Q");
     console.log("Success");
  } catch (e: any) {
    console.log("CAUGHT INNER MESSAGE:", e.message);
  }
}

async function run() {
  try {
     await testFetch();
  } catch (err: any) {
     console.log("CAUGHT OUTER MESSAGE:", err.message);
  }
}
run();
