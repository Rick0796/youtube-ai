import express from "express";
import { YoutubeTranscript } from "youtube-transcript";

const app = express();
app.get("/test", async (req, res) => {
  try {
    const videoId = 'BtlWoqWLm9Q';
    let fullTranscript = "";
    let hasTranscript = false;
    
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      fullTranscript = transcriptItems.map((item: any) => item.text).join(" ");
      hasTranscript = true;
    } catch (e: any) {
      console.log("INNER CATCH:", e.message);
    }
    
    res.json({ hasTranscript, ok: "yes" });
  } catch (error: any) {
    console.log("OUTER CATCH:", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.listen(3001, async () => {
   const res = await fetch("http://localhost:3001/test");
   console.log(await res.text());
   process.exit(0);
});
