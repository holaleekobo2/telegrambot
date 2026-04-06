import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import TelegramBot from "node-telegram-bot-api";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const appUrl = process.env.APP_URL;

  let bot: TelegramBot | null = null;

  app.post("/api/set-webhook", async (req, res) => {
    res.status(400).json({ error: "Webhooks are disabled. Bot is using polling mode." });
  });

  if (token) {
    // Initialize temporarily to delete webhook
    bot = new TelegramBot(token, { polling: false });
    
    try {
      await bot.deleteWebHook();
      console.log("✅ Cleared existing webhook to enable polling.");
    } catch (e: any) {
      console.error("⚠️ Could not delete webhook:", e.message);
    }

    // Re-initialize with polling enabled
    bot = new TelegramBot(token, { polling: true });
    console.log("✅ Bot successfully started in POLLING mode.");

    bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      console.log(`📥 Received message from ${chatId}: ${text}`);

      if (!text) return;

      if (text === "/start") {
        bot!.sendMessage(chatId, "Hello! I am your Gemini-powered Telegram Bot. I am now running in Polling mode, which means I can receive messages instantly!");
        return;
      }

      if (!genAI) {
        bot!.sendMessage(chatId, "❌ Gemini API key is not configured. Please set GEMINI_API_KEY in the secrets panel.");
        return;
      }

      try {
        bot!.sendChatAction(chatId, 'typing');

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: text,
        });

        const reply = response.text || "Sorry, I couldn't generate a response.";
        await bot!.sendMessage(chatId, reply);
        console.log(`📤 Replied to ${chatId}`);
      } catch (error: any) {
        console.error("❌ Gemini Error:", error.message);
        bot!.sendMessage(chatId, "Oops! Something went wrong while processing your request with Gemini.");
      }
    });
  }

  // Gemini Setup
  const genAI = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

  // Keep the webhook endpoint just in case, but it won't be used
  app.post("/api/telegram-webhook", async (req, res) => {
    res.sendStatus(200);
  });

  app.get("/api/status", async (req, res) => {
    res.json({
      botInitialized: !!bot,
      geminiInitialized: !!genAI,
      isPolling: bot ? bot.isPolling() : false,
      hasToken: !!token
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
