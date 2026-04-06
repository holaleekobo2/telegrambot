import TelegramBot from 'node-telegram-bot-api';

export default async function handler(req: any, res: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN environment variable." });
  }

  // Get the host from the request headers (this will be your vercel.app domain)
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  
  const webhookUrl = `${protocol}://${host}/api/webhook`;

  const bot = new TelegramBot(token, { polling: false });

  try {
    await bot.setWebHook(webhookUrl);
    res.status(200).json({ 
      success: true, 
      message: `Webhook successfully set to ${webhookUrl}`,
      note: "Your bot is now ready to receive messages on Vercel!"
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
