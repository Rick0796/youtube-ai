import { GoogleGenAI } from "@google/genai";

async function testGeminiSearch() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Analyze this youtube video link: https://www.youtube.com/watch?v=BtlWoqWLm9Q. What is its core message and breakdown?",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}

testGeminiSearch();
