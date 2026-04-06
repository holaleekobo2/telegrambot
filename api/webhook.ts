import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenAI } from '@google/genai';

const token = process.env.TELEGRAM_BOT_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

// Initialize bot without polling for Serverless environment
const bot = token ? new TelegramBot(token, { polling: false }) : null;
const genAI = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

export default async function handler(req: any, res: any) {
  // Only process POST requests from Telegram
  if (req.method !== 'POST') {
    return res.status(200).send('Gemini Telegram Bot Webhook is active!');
  }

  if (!bot || !genAI) {
    console.error("Missing API keys");
    return res.status(500).send('Server misconfiguration: Missing API keys');
  }

  const { message } = req.body;
  if (!message || !message.text) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const text = message.text;

  try {
    if (text === '/start') {
      await bot.sendMessage(chatId, "Hello! I am your Gemini-powered Telegram Bot, now running blazingly fast on Vercel Serverless Functions!");
      return res.status(200).send('OK');
    }

    // Send typing indicator
    await bot.sendChatAction(chatId, 'typing');

    // Get Gemini response
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
    });

    const reply = response.text || "Sorry, I couldn't generate a response.";
    await bot.sendMessage(chatId, reply);
    
  } catch (error: any) {
    console.error("Error processing message:", error.message);
    await bot.sendMessage(chatId, "Oops! Something went wrong while processing your request.");
  }

  // Always return 200 OK to Telegram so it doesn't retry the message
  res.status(200).send('OK');
}
