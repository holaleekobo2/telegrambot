import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Settings, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface BotStatus {
  botInitialized: boolean;
  geminiInitialized: boolean;
  isPolling: boolean;
  hasToken: boolean;
}

export default function App() {
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/status')
        .then(res => res.json())
        .then(data => {
          setStatus(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch status:", err);
          setLoading(false);
        });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
              <Bot className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Gemini Telegram Bot</h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Secure Backend</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bot Status</h2>
              <p className="text-slate-500">Real-time status of your Telegram integration.</p>
            </div>
            {loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>}
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatusCard 
              title="Telegram Token" 
              active={status?.hasToken ?? false} 
              description={status?.hasToken ? "Token is configured in environment." : "Missing TELEGRAM_BOT_TOKEN."}
            />
            <StatusCard 
              title="Gemini API" 
              active={status?.geminiInitialized ?? false} 
              description={status?.geminiInitialized ? "Gemini is ready to process messages." : "Missing GEMINI_API_KEY."}
            />
            <StatusCard 
              title="Connection Mode" 
              active={status?.isPolling ?? false} 
              description={status?.isPolling ? "Active (Polling Mode)" : "Disconnected"}
            />
            <StatusCard 
              title="Server" 
              active={true} 
              description="Backend is running on port 3000."
            />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-400" />
            Setup Instructions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard 
              number="1"
              title="Get Bot Token"
              description="Message @BotFather on Telegram to create a new bot and get your API token."
              link="https://t.me/botfather"
            />
            <StepCard 
              number="2"
              title="Set Secrets"
              description="Go to Settings > Secrets and add TELEGRAM_BOT_TOKEN and GEMINI_API_KEY."
            />
            <StepCard 
              number="3"
              title="Start Chatting"
              description="Open your bot on Telegram and send a message. Gemini will respond instantly!"
            />
          </div>
        </section>

        <section className="bg-blue-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready to test?</h3>
              <p className="text-blue-100">Your bot is running in polling mode and listening for messages.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
            >
              Refresh Status
            </motion.button>
          </div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-400 text-sm">
        <p>Powered by Google Gemini & Express</p>
      </footer>
    </div>
  );
}

function StatusCard({ title, active, description }: { title: string, active: boolean, description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
      {active ? (
        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
      ) : (
        <XCircle className="w-6 h-6 text-red-400 shrink-0" />
      )}
      <div>
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-500 break-all">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description, link }: { number: string, title: string, description: string, link?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
        {number}
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
      {link && (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 text-sm font-bold hover:underline"
        >
          Open Telegram <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
