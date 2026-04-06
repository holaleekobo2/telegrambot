export default function handler(req: any, res: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  res.status(200).json({
    // On Vercel, the bot initializes on every request, so if we have a token, it's "ready"
    botInitialized: !!token,
    geminiInitialized: !!geminiKey,
    // Vercel uses Webhooks, not Polling
    isPolling: false,
    hasToken: !!token
  });
}
