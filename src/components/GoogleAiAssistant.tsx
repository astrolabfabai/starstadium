import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Settings, Power, PowerOff, Shield, Flame, Activity, Zap, RefreshCw, ChevronRight, BrainCircuit } from 'lucide-react';
import { OllamaConfig, GoogleAiAnalysisRequest, GoogleAiAnalysisResponse } from '../types';

interface GoogleAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeContextData?: any;
  initialPrompt?: string;
  initialMode?: 'gemini' | 'ollama';
}

export const GoogleAiAssistant: React.FC<GoogleAiAssistantProps> = ({
  isOpen,
  onClose,
  activeContextData,
  initialPrompt = '',
  initialMode = 'gemini'
}) => {
  const [activeEngine, setActiveEngine] = useState<'gemini' | 'ollama'>(initialMode);
  
  // Ollama is OFF by default per user mandate
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    host: 'http://localhost:11434',
    model: 'llama3',
    isEnabled: false
  });
  
  const [showOllamaSettings, setShowOllamaSettings] = useState(false);
  const [promptInput, setPromptInput] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<{
    id: string;
    role: 'user' | 'assistant';
    text: string;
    source?: string;
    model?: string;
    timestamp: string;
    tacticalRecommendation?: string;
  }>([
    {
      id: 'init-1',
      role: 'assistant',
      text: `👋 Welcome to **StarStadium Google AI Coach** powered by **Gemini 3.7 Flash**!

I provide real-time NFL telemetry insights, 4th down decision recommendations, red-zone conversion analysis, time-of-possession shares, tactical chalkboard breakdowns, and fantasy DFS projections.

Select a quick telemetry prompt below or type your question!`,
      source: 'Google AI • Gemini 3.7 Flash',
      model: 'gemini-3.7-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setPromptInput(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  const toggleOllama = () => {
    const nextState = !ollamaConfig.isEnabled;
    setOllamaConfig((prev) => ({ ...prev, isEnabled: nextState }));
    setMessages((prev) => [
      ...prev,
      {
        id: `ollama-toggle-${Date.now()}`,
        role: 'assistant',
        text: nextState
          ? `Local Ollama AI is now **ACTIVATED** (Target: ${ollamaConfig.model} @ ${ollamaConfig.host}). Note that Google AI (Gemini 3.7 Flash) is also available.`
          : 'Local Ollama AI is **OFF**. Google AI (Gemini) remains ready for real-time sports intelligence.',
        source: 'System State',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setPromptInput('');

    setIsLoading(true);

    if (activeEngine === 'ollama') {
      if (!ollamaConfig.isEnabled) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ollama-off-${Date.now()}`,
            role: 'assistant',
            text: '⚠️ **Local Ollama AI is currently OFF (Default).** Click the "Turn ON" toggle to query your local machine, or switch to the **Google AI (Gemini)** tab.',
            source: 'Ollama Engine Notice',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/ollama/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: ollamaConfig.host,
            model: ollamaConfig.model,
            prompt: query,
            contextData: activeContextData || {}
          })
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            text: data.response || 'No response returned.',
            source: data.source || 'Local Ollama',
            model: data.model,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: `Error connecting to Ollama service: ${err.message}. Make sure your local Ollama server is running at ${ollamaConfig.host}.`,
            source: 'Ollama Connection Error',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Google AI (Gemini 3.7 Flash) Route
      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            contextData: activeContextData || {},
            systemInstruction:
              'You are StarStadium Google AI Coach. Provide clear, data-grounded NFL analytics, real-time down-and-distance telemetry advice, red-zone conversion metrics, EPA trends, and tactical chalkboard schemes.'
          })
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-gemini-${Date.now()}`,
            role: 'assistant',
            text: data.text || 'No response received from Google AI.',
            source: data.source === 'google_genai_gemini' ? 'Google AI • Gemini 3.7 Flash' : 'Google AI Simulation',
            model: data.model || 'gemini-3.7-flash',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-gemini-${Date.now()}`,
            role: 'assistant',
            text: `Google AI query encountered an issue: ${err.message}.`,
            source: 'Google AI Engine',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const quickTelemetryPrompts = [
    'Analyze 3rd & 4 red-zone conversion efficiency and play-call recommendations',
    'Calculate Expected Points Added (EPA) and time-of-possession impact',
    'Evaluate 4th Down Go-for-it matrix at opponent 38 yardline',
    'Breakdown Chief vs Ravens pass coverage mismatches and target distribution',
    'Summarize top fantasy DFS value picks based on projected touch shares'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#111116] border-l border-white/10 shadow-2xl flex flex-col font-sans animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#09090c] space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Google AI <span className="text-amber-400">Coach</span>
                </h3>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Real-Time Down &amp; Distance Telemetry &bull; EPA Analytics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#18181f] p-1 rounded-lg border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveEngine('gemini')}
            className={`py-1.5 px-2 rounded-md font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeEngine === 'gemini'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google AI (Active)</span>
          </button>

          <button
            onClick={() => setActiveEngine('ollama')}
            className={`py-1.5 px-2 rounded-md font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeEngine === 'ollama'
                ? 'bg-purple-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ollama {ollamaConfig.isEnabled ? '(ON)' : '(OFF)'}</span>
          </button>
        </div>
      </div>

      {/* Ollama Offline/Online Notification Banner */}
      {activeEngine === 'ollama' && (
        <div className="bg-[#18181f] border-b border-white/10 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ollamaConfig.isEnabled ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
              <span className="font-mono text-slate-300 font-bold">
                Local Ollama Status: <strong className={ollamaConfig.isEnabled ? 'text-emerald-400' : 'text-rose-400'}>{ollamaConfig.isEnabled ? 'ENABLED' : 'OFF (Default)'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleOllama}
                className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  ollamaConfig.isEnabled
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400'
                }`}
              >
                {ollamaConfig.isEnabled ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                <span>{ollamaConfig.isEnabled ? 'Turn OFF' : 'Turn ON'}</span>
              </button>

              <button
                onClick={() => setShowOllamaSettings(!showOllamaSettings)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                title="Configure Ollama Endpoint"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showOllamaSettings && (
            <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-2 mt-2 font-mono text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Host Endpoint</label>
                <input
                  type="text"
                  value={ollamaConfig.host}
                  onChange={(e) => setOllamaConfig({ ...ollamaConfig, host: e.target.value })}
                  className="w-full bg-[#0c0c0e] text-slate-200 p-1.5 rounded border border-white/10"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Model Name</label>
                <input
                  type="text"
                  value={ollamaConfig.model}
                  onChange={(e) => setOllamaConfig({ ...ollamaConfig, model: e.target.value })}
                  className="w-full bg-[#0c0c0e] text-slate-200 p-1.5 rounded border border-white/10"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0a0a0d]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3.5 rounded-xl text-xs leading-relaxed transition-all ${
              m.role === 'user'
                ? 'bg-amber-500 text-slate-950 ml-6 font-semibold shadow-md'
                : 'bg-[#15151c] text-slate-200 mr-4 border border-white/10 shadow-sm'
            }`}
          >
            {m.source && (
              <div className="flex items-center justify-between text-[9px] font-mono text-amber-400 font-bold mb-1.5 pb-1 border-b border-white/5">
                <span>{m.source}</span>
                <span className="text-slate-500">{m.timestamp}</span>
              </div>
            )}
            <div className="whitespace-pre-wrap font-sans text-xs space-y-1">{m.text}</div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3.5 rounded-xl bg-[#15151c] text-amber-400 text-xs border border-amber-500/30 animate-pulse flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span className="font-mono font-bold">
              {activeEngine === 'gemini' ? 'Google AI (Gemini 3.7) evaluating down & distance telemetry...' : 'Querying local Ollama...'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Telemetry Prompts */}
      <div className="p-2 border-t border-white/5 bg-[#0e0e12] flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickTelemetryPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-[10px] font-mono bg-white/5 hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 px-2.5 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shrink-0 transition-all flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3.5 border-t border-white/10 bg-[#0c0c0f]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              activeEngine === 'gemini'
                ? 'Ask Google AI Coach about telemetry, EPA, or drives...'
                : ollamaConfig.isEnabled
                ? 'Ask Local Ollama...'
                : 'Ollama is OFF • Type message or Turn ON...'
            }
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 bg-[#141419] text-slate-200 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-md disabled:opacity-50"
            aria-label="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
