export default function handler(req: any, res: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  res.status(200).json({
    botInitialized: !!token,
    geminiInitialized: !!geminiKey,
    isPolling: false,
    isVercel: true,
    hasToken: !!token
  });
}
