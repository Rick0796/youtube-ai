import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import fs from "fs/promises";
import axios from "axios";

const require = createRequire(import.meta.url);
const yt = require('youtube-transcript');
const { YoutubeTranscript } = yt.default || yt;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// For Vercel, write to /tmp/ if needed, but it won't persist across requests properly.
// Better to suggest a DB. We'll use a local file for now but it's ephemeral.
const DB_PATH = path.join('/tmp', 'history.json');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
];

function getRandomIP() {
  return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
}

async function getTranscriptFallback(videoId: string) {
  try {
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const fakeIP = getRandomIP();
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}&pbj=1&bpctr=9999999999&has_verified=1`;
    const response = await axios.get(pageUrl, {
      timeout: 12000,
      headers: {
        'User-Agent': randomUA,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Forwarded-For': fakeIP,
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+417'
      }
    });

    const html = response.data;
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    const visitorDataMatch = html.match(/"visitorData":"([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
    const visitorData = visitorDataMatch ? visitorDataMatch[1] : null;

    let captionTracks: any[] = [];

    try {
      const jsonMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s) || 
                       html.match(/window\["ytInitialPlayerResponse"\]\s*=\s*({.+?});/s);
      if (jsonMatch) {
        const playerResponse = JSON.parse(jsonMatch[1]);
        captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      }
    } catch (e) {}

    if ((!captionTracks || captionTracks.length === 0) && apiKey) {
      const clientProfiles = [
        { name: "TVHTML5", version: "7.20230405.08.01", platform: "TV" },
        { name: "IOS", version: "17.33.2", platform: "MOBILE" }
      ];

      for (const profile of clientProfiles) {
        try {
          const res = await axios.post(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}`, {
            videoId,
            context: { 
              client: { 
                clientName: profile.name, 
                clientVersion: profile.version, 
                hl: "en", 
                gl: "US", 
                visitorData 
              } 
            }
          }, { timeout: 6000 });

          const foundTracks = res.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          if (foundTracks && foundTracks.length > 0) {
            captionTracks = foundTracks;
            break;
          }
        } catch (err) {}
      }
    }

    if (!captionTracks || captionTracks.length === 0) return null;

    const track = captionTracks.find((t: any) => t.languageCode === 'en' || t.languageCode === 'en-US') || 
                  captionTracks.find((t: any) => t.languageCode.startsWith('zh')) || 
                  captionTracks[0];

    const finalUrl = track.baseUrl + (track.baseUrl.includes('?') ? '&fmt=srv1' : '?fmt=srv1');
    const transcriptRes = await axios.get(finalUrl, { 
      headers: { 'User-Agent': randomUA },
      timeout: 8000
    });
    
    const xml = transcriptRes.data;
    const textNodes = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (!textNodes) return null;

    return textNodes
      .map((node: string) => {
        const match = node.match(/>([\s\S]*?)<\/text>/);
        return (match ? match[1] : "")
          .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '');
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (err) {
    return null;
  }
}

const app = express();
app.use(express.json());

// Initialize DB in /tmp
const initDB = async () => {
    try {
        await fs.access(DB_PATH);
    } catch {
        try {
            await fs.writeFile(DB_PATH, JSON.stringify([]));
        } catch (e) {
            console.error("Failed to init DB in /tmp", e);
        }
    }
};

app.get("/api/history", async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8').catch(() => "[]");
    res.json(JSON.parse(data));
  } catch (error) {
    res.json([]);
  }
});

app.post("/api/history", async (req, res) => {
  try {
    const newItem = req.body;
    const data = await fs.readFile(DB_PATH, 'utf-8').catch(() => "[]");
    const history = JSON.parse(data);
    
    const existingIdx = history.findIndex((h: any) => h.id === newItem.id);
    if (existingIdx > -1) {
      history[existingIdx] = newItem;
    } else {
      history.unshift(newItem);
    }
    
    const limitedHistory = history.slice(0, 50);
    await fs.writeFile(DB_PATH, JSON.stringify(limitedHistory, null, 2)).catch(() => {});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save history" });
  }
});

app.get("/api/youtube/data", async (req, res) => {
  const videoUrl = req.query.url as string;
  if (!videoUrl) return res.status(400).json({ error: "Missing video URL" });

  try {
    const videoIdMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) throw new Error("Invalid YouTube URL");

    let metadata = { 
      title: "未知视频",
      author_name: "未知作者",
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const metaResponse = await axios.get(oembedUrl);
      if (metaResponse.status === 200) {
        metadata = {
          title: metaResponse.data.title || "未知视频",
          author_name: metaResponse.data.author_name || "未知作者",
          thumbnail_url: metaResponse.data.thumbnail_url || metadata.thumbnail_url
        };
      }
    } catch (metaErr) {}

    let fullTranscript = "";
    let hasTranscript = false;

    try {
      if (YoutubeTranscript?.fetchTranscript) {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        fullTranscript = transcriptItems.map((item: any) => item.text).join(" ");
        hasTranscript = true;
      }
    } catch (e) {}

    if (!hasTranscript) {
      const fallbackTranscript = await getTranscriptFallback(videoId);
      if (fallbackTranscript) {
        fullTranscript = fallbackTranscript;
        hasTranscript = true;
      }
    }

    if (!hasTranscript) {
      fullTranscript = "【系统提示：字幕获取受限】目前无法获取全文。";
    }

    res.json({
      title: metadata.title,
      author: metadata.author_name,
      thumbnail: metadata.thumbnail_url,
      transcript: fullTranscript,
      hasTranscript,
      videoId
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// For Vercel, we don't call app.listen(), but export the app
initDB();
export default app;
