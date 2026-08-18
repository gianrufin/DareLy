import express from "express";
import path from "path";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// 1. Generate Custom / Next Dare using Gemini 3.7 Flash
app.post("/api/dares/generate", async (req, res) => {
  try {
    const {
      relationship = "Partner",
      vibe = "playful",
      intensity = "medium",
      locationContext = "",
      customTone = "",
    } = req.body;

    const ai = getGenAI();
    const prompt = `You are an expert relationship psychologist and fun game designer. Create a fresh, creative, highly engaging "Daily Dare" card for:
- Relationship: ${relationship}
- Vibe / Mood: ${vibe} (e.g. playful, romantic, deep & vulnerable, micro-adventure, cozy, workplace boost)
- Intensity / Effort: ${intensity} (light 2-min micro-moment, medium 15-min fun activity, or bold memorable date)
- Extra context / location: ${locationContext || "at home or nearby"}
- Tone preference: ${customTone || "warm, inspiring, fun, and connection-sparking"}

The dare should be actionable, memorable, not cheesy, and designed to make both people laugh, smile, or bond deeply.
Return a JSON object with:
- title: punchy, catchy card title (max 5-7 words)
- subtitle: short category/tagline (e.g. "Micro-Adventure", "5-Min Gratitude", "Silly Challenge")
- description: clear, step-by-step instruction of the dare (2-3 sentences max)
- whyItWorks: brief 1-sentence psychology insight explaining how this builds closeness
- estimatedMinutes: number (e.g. 5, 15, 30)
- conversationStarter: a follow-up question or playful remark to ask during/after the dare
- spiceLevel: 1, 2, 3, or 4
- emoji: single fitting emoji`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            description: { type: Type.STRING },
            whyItWorks: { type: Type.STRING },
            estimatedMinutes: { type: Type.INTEGER },
            conversationStarter: { type: Type.STRING },
            spiceLevel: { type: Type.INTEGER },
            emoji: { type: Type.STRING },
          },
          required: [
            "title",
            "subtitle",
            "description",
            "whyItWorks",
            "estimatedMinutes",
            "conversationStarter",
            "spiceLevel",
            "emoji",
          ],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json({ success: true, dare: data });
  } catch (error: any) {
    console.error("Error generating dare:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Text-to-Speech using gemini-3.1-flash-tts-preview
app.post("/api/dares/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getGenAI();
    // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const allowedVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const voiceName = allowedVoices.includes(voice) ? voice : "Kore";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say warmly, playfully, and clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: "No audio generated from TTS" });
    }

    res.json({ success: true, audioBase64: base64Audio, format: "audio/pcm;rate=24000" });
  } catch (error: any) {
    console.error("Error generating TTS:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Search Grounding for Real Spot / Idea Discovery (gemini-3.5-flash with googleSearch)
app.post("/api/dares/search-places", async (req, res) => {
  try {
    const { query, location = "San Francisco, CA" } = req.body;
    const ai = getGenAI();

    const prompt = `Find 3 exciting, real, specific local spots, parks, dessert parlors, scenic viewpoints, or unique places in or around "${location}" that fit this date / connection dare activity: "${query}".
For each spot, provide:
- Name of place
- Why it's perfect for this dare / date
- Address or general area
- A fun tip or what to order/do there`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No recommendations found.";
    const chunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      success: true,
      recommendationsText: text,
      sources: chunks,
    });
  } catch (error: any) {
    console.error("Error searching places:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Dare Reflection & Conversation Buddy
app.post("/api/dares/reflect", async (req, res) => {
  try {
    const { dareTitle, userNote, relationship, rating } = req.body;
    const ai = getGenAI();

    const prompt = `The user and their ${relationship} just completed the dare: "${dareTitle}".
User reflection note: "${userNote || "We had so much fun!"}"
Rating: ${rating || 5}/5 stars.

Provide a sweet, perceptive 2-sentence feedback celebrating their connection, followed by 2 thought-provoking deep follow-up questions they can ask each other right now while the vibe is warm.
Format as JSON with:
- reaction: warm, uplifting reaction sentence
- followUpQuestions: array of 2 strings
- connectionTip: 1 brief practical takeaway to keep the spark alive`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reaction: { type: Type.STRING },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            connectionTip: { type: Type.STRING },
          },
          required: ["reaction", "followUpQuestions", "connectionTip"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, reflection: data });
  } catch (error: any) {
    console.error("Error generating reflection:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Setup Vite middleware or static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DailyDare server running on port ${PORT}`);
  });
}

start();
