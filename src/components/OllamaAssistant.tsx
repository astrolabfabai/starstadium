import React, { useState } from 'react';
import { OllamaConfig } from '../types';
import { Bot, Send, Settings, Sparkles, X, Terminal, CheckCircle2, AlertCircle, Power, PowerOff } from 'lucide-react';

interface OllamaAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeContextData?: any;
}

export const OllamaAssistant: React.FC<OllamaAssistantProps> = ({
  isOpen,
  onClose,
  activeContextData
}) => {
  // Start with Ollama OFF by default per user request
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    host: 'http://localhost:11434',
    model: 'llama3',
    isEnabled: false
  });
  const [showConfig, setShowConfig] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; source?: string }[]>([
    {
      role: 'assistant',
      text: 'Ollama AI is currently **turned OFF** by default. You can browse all raw SportsData NFL metrics and chalkboard playbooks manually. If you have a local Ollama server running on your machine, click the "Turn ON" toggle in the header to activate AI analytics.'
    }
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const toggleOllama = () => {
    const nextState = !ollamaConfig.isEnabled;
    setOllamaConfig((prev) => ({ ...prev, isEnabled: nextState }));
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: nextState
          ? `Local Ollama AI is now **ACTIVATED** (Target: ${ollamaConfig.model} @ ${ollamaConfig.host}). Ask any NFL strategy, EPA, or fantasy DFS question!`
          : 'Local Ollama AI has been **TURNED OFF**. No AI requests will be dispatched.'
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setPromptInput('');

    if (!ollamaConfig.isEnabled) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Local Ollama AI is currently **OFF**. Please click the "Turn ON" switch in the top bar or settings if you wish to query your local Ollama instance.'
        }
      ]);
      return;
    }

    setIsLoading(true);

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
          role: 'assistant',
          text: data.response || 'No response returned.',
          source: data.source || 'Local Ollama'
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error connecting to Ollama service: ${err.message}. Make sure local Ollama server is running at ${ollamaConfig.host}.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Analyze team passing yards vs touchdowns for Week 4',
    'Which players offer the highest DFS fantasy value?',
    'Summarize line movement shifts for home favorites',
    'Evaluate key player injury statuses and depth impacts'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#121214] border-l border-white/10 shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded border ${
            ollamaConfig.isEnabled ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-white/5 text-slate-400 border-white/10'
          }`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase italic tracking-wider font-serif">
                StarStadium<span className="font-sans not-italic text-amber-500 ml-1">AI Assist</span>
              </h3>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                ollamaConfig.isEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {ollamaConfig.isEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {ollamaConfig.isEnabled ? `${ollamaConfig.model} @ ${ollamaConfig.host}` : 'AI Engine Disabled (Off)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle ON/OFF Switch Button */}
          <button
            onClick={toggleOllama}
            className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
              ollamaConfig.isEnabled
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/10'
            }`}
            title={ollamaConfig.isEnabled ? 'Turn Ollama AI OFF' : 'Turn Ollama AI ON'}
            aria-label={ollamaConfig.isEnabled ? 'Turn Ollama AI OFF' : 'Turn Ollama AI ON'}
          >
            {ollamaConfig.isEnabled ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3 text-slate-400" />}
            <span>{ollamaConfig.isEnabled ? 'AI ON' : 'Turn ON'}</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
            title="Ollama Connection Settings"
            aria-label="Ollama Connection Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showConfig && (
        <div className="p-4 bg-[#0c0c0e] border-b border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-amber-500 uppercase tracking-widest text-[10px]">Ollama Local Settings</h4>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Ollama Status:</span>
              <button
                onClick={toggleOllama}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ollamaConfig.isEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {ollamaConfig.isEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Host Endpoint</label>
            <input
              type="text"
              value={ollamaConfig.host}
              onChange={(e) => setOllamaConfig({ ...ollamaConfig, host: e.target.value })}
              className="w-full bg-[#09090b] text-slate-200 p-2 rounded border border-white/10 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Model Name</label>
            <input
              type="text"
              value={ollamaConfig.model}
              onChange={(e) => setOllamaConfig({ ...ollamaConfig, model: e.target.value })}
              placeholder="e.g. llama3, mistral, qwen2.5"
              className="w-full bg-[#09090b] text-slate-200 p-2 rounded border border-white/10 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Status Notice Banner when OFF */}
      {!ollamaConfig.isEnabled && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-400 font-medium">
          <div className="flex items-center gap-1.5">
            <PowerOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Ollama AI is OFF (Default)</span>
          </div>
          <button
            onClick={toggleOllama}
            className="text-[10px] font-bold underline hover:text-white"
          >
            Enable local AI
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#09090b]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-amber-500 text-slate-950 ml-6 font-semibold shadow-sm'
                : 'bg-[#121214] text-slate-200 mr-4 border border-white/10'
            }`}
          >
            {m.source && (
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold block mb-1">
                [{m.source}]
              </span>
            )}
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3 rounded bg-[#121214] text-slate-400 text-xs border border-white/10 animate-pulse flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Querying Local Ollama...
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 border-t border-white/5 bg-[#0c0c0e] flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="text-[10px] bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 whitespace-nowrap shrink-0 transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Prompt Input */}
      <div className="p-3 border-t border-white/10 bg-[#0c0c0e]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={ollamaConfig.isEnabled ? "Ask Ollama about sports data..." : "AI is OFF • Type message or Turn ON..."}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 bg-[#09090b] text-slate-200 text-xs p-2.5 rounded border border-white/10 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all"
            aria-label="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

