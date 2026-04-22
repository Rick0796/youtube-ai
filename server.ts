import express from "express";
import { createServer as createViteServer } from "vite";
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
const DB_PATH = path.join(process.cwd(), 'history.json');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
];

function getRandomIP() {
  return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
}

// Aggressive Scraper for YouTube Transcripts
async function getTranscriptFallback(videoId: string) {
  try {
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const fakeIP = getRandomIP();
    console.log(`[ACQUISITION] Starting deep-scrape for protected video: ${videoId}`);
    
    // Add bypass parameters to skip consent and age-gates
    const pageUrl = `https://www.youtube.com/watch?v=${videoId}&pbj=1&bpctr=9999999999&has_verified=1`;
    const response = await axios.get(pageUrl, {
      timeout: 12000,
      headers: {
        'User-Agent': randomUA,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Forwarded-For': fakeIP,
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+417' // Bypass cookie consent
      }
    });

    const html = response.data;
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    const visitorDataMatch = html.match(/"visitorData":"([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
    const visitorData = visitorDataMatch ? visitorDataMatch[1] : null;

    let captionTracks: any[] = [];

    // Protocol Path 1: Primary JSON extraction
    try {
      const jsonMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s) || 
                       html.match(/window\["ytInitialPlayerResponse"\]\s*=\s*({.+?});/s);
      if (jsonMatch) {
        const playerResponse = JSON.parse(jsonMatch[1]);
        captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        
        const playStatus = playerResponse?.playabilityStatus?.status;
        if (playStatus === 'LOGIN_REQUIRED') {
          console.warn(`[ACQUISITION] Video ${videoId} is AGE-RESTRICTED or requires login.`);
        }
      }
    } catch (e) {}

    // Protocol Path 2: Multi-Client Tunneling (TVHTML5 is the most robust for transcripts)
    if ((!captionTracks || captionTracks.length === 0) && apiKey) {
      console.log(`[ACQUISITION] Primary path blocked. Tunneling via TV and Mobile protocols...`);
      
      const clientProfiles = [
        { name: "TVHTML5", version: "7.20230405.08.01", platform: "TV" },
        { name: "IOS", version: "17.33.2", platform: "MOBILE" },
        { name: "ANDROID_TV", version: "17.10.35", platform: "TV" },
        { name: "WEB_EMBEDDED_PLAYER", version: "1.20230714.01.00", platform: "WEB" }
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
            console.log(`[ACQUISITION] Tunneling success via ${profile.name} protocol!`);
            break;
          }
        } catch (err) {}
      }
    }

    if (!captionTracks || captionTracks.length === 0) {
      console.error(`[ACQUISITION] ALL acquisition paths failed for ${videoId}. Engaging Layer 4 fallback.`);
      return null;
    }

    // Layer 3: Normalization (Strict priority: English -> Chinese -> first available)
    const track = captionTracks.find((t: any) => t.languageCode === 'en' || t.languageCode === 'en-US') || 
                  captionTracks.find((t: any) => t.languageCode.startsWith('zh')) || 
                  captionTracks[0];

    console.log(`[NORMALIZATION] Harvesting ${track.languageCode} transcript...`);
    
    // Some tracks need a specific format parameter to return clean SRT/XML
    const finalUrl = track.baseUrl + (track.baseUrl.includes('?') ? '&fmt=srv1' : '?fmt=srv1');
    
    const transcriptRes = await axios.get(finalUrl, { 
      headers: { 'User-Agent': randomUA },
      timeout: 8000
    });
    
    const xml = transcriptRes.data;
    const textNodes = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (!textNodes) return null;

    const transcript = textNodes
      .map((node: string) => {
        const match = node.match(/>([\s\S]*?)<\/text>/);
        return (match ? match[1] : "")
          .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '');
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`[ACQUISITION] Successfully harvested ${transcript.length} characters.`);
    return transcript;

  } catch (err: any) {
    console.error(`[ACQUISITION] FATAL ERROR for ${videoId}:`, err.message);
    return null;
  }
}

export async function createExpressApp() {
  const app = express();
  app.use(express.json());

  // Ensure DB exists (Note: ephemeral on Vercel)
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8').catch(() => '[]');
    if (data === '[]') await fs.writeFile(DB_PATH, '[]');
  } catch (e) {}

  // History API
  app.get("/api/history", async (req, res) => {
    try {
      const data = await fs.readFile(DB_PATH, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error) {
      res.json([]);
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const newItem = req.body;
      const data = await fs.readFile(DB_PATH, 'utf-8').catch(() => '[]');
      const history = JSON.parse(data);
      
      const existingIdx = history.findIndex((h: any) => h.id === newItem.id);
      if (existingIdx > -1) {
        history[existingIdx] = newItem;
      } else {
        history.unshift(newItem);
      }
      
      const limitedHistory = history.slice(0, 50);
      // On Vercel, this might fail or be transient
      await fs.writeFile(DB_PATH, JSON.stringify(limitedHistory, null, 2)).catch(() => {});
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save history" });
    }
  });

  app.get("/api/test-route", (req, res) => {
    res.json({ status: "LeanTube Vercel Backend is running" });
  });

  // API Route: Get YouTube Transcript and Metadata
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
        fullTranscript = "【系统提示：字幕获取受限】由于 YouTube 的保护机制或字幕未公开，目前无法直接提取全文。LeanTube 已开启语义推演模式。";
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
      res.status(500).json({ error: error?.message || "Failed to fetch YouTube data" });
    }
  });

  return app;
}

async function startServer() {
  const app = await createExpressApp();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      // Don't intercept API calls
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only auto-start if not being imported (Vercel imports it)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

