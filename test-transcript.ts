import { YoutubeTranscript } from 'youtube-transcript';

async function run() {
  try {
    await YoutubeTranscript.fetchTranscript("BtlWoqWLm9Q");
  } catch (e: any) {
    console.log("CAUGHT MESSAGE:", e.message);
  }
}
run();
