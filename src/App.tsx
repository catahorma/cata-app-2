import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Bot, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp,
  CreditCard,
  Target,
  Zap,
  Info,
  LogOut,
  Download,
  Trash2,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- System Prompt Const ---
const SYSTEM_PROMPT = `Eres un consultor senior de Business UX llamado "Asesor UX" con experiencia en empresas latinoamericanas. Combinas estrategia de negocio con metodología UX.

PROYECTO DEL ALUMNO:
→ Empresa: Clínica Las Condes
→ Problema: alto abandono en el flujo de pago de la app
→ Usuario: mujeres 30-45 años que compran desde el móvil

TU TRABAJO:
1. Validar hipótesis de negocio
2. Dar feedback crítico y honesto (no seas complaciente)
3. Estimar el ROI de propuestas UX
4. Identificar oportunidades de IA en la solución
5. Ayudar a armar el caso de negocio para stakeholders

CÓMO EVALÚAS CADA PROPUESTA — sigue este orden:
1. Diagnóstico: [qué entendiste]
2. Lo que funciona: [puntos fuertes]
3. Riesgos: [sé directo]
4. Métrica sugerida: [cómo medir el éxito]
5. Próximo paso: [acción concreta]

Si te piden calcular ROI, usa:
📈 ROI UX estimado:
- Problema actual: ...
- Mejora proyectada: ...%
- Impacto estimado: ...
- Supuestos clave: ...

Responde siempre en español. Tono profesional y directo. Máximo 350 palabras por respuesta.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isConfigured, setIsConfigured] = useState<boolean>(!!apiKey);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsConfigured(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: input, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiInput = new GoogleGenAI(apiKey);
      
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const model = aiInput.getGenerativeModel({ 
        model: 'gemini-1.5-flash-latest',
        systemInstruction: SYSTEM_PROMPT,
      });

      const response = await model.generateContent({
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: input }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.response.text() || 'Sin respuesta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error with Gemini API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Error de Conexión:** ${error?.message || 'Ocurrió un error al conectar con la API de Gemini. Por favor revisa tu API Key.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el historial de la sesión?')) {
      setMessages([]);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0F1117] text-[#E2E8F0] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-2xl p-8 shadow-2xl shadow-black/50"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 tracking-tight text-white font-sans">Asesor UX AI</h1>
          <p className="text-slate-400 text-center mb-10 text-sm">
            Entorno de consultoría estratégica para el Proyecto Clínica Las Condes.
          </p>
          
          <form onSubmit={handleSaveApiKey} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Gemini API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu Professional Key..."
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] text-sm"
            >
              Iniciar Sesión de Estrategia
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-3 items-start">
            <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tu clave se almacena de forma segura en el almacenamiento local del navegador y no se comparte con terceros, excepto para autenticar peticiones directas a Google AI.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#E2E8F0] flex font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-[#1E293B] bg-[#0A0C10] flex flex-col shrink-0 hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Asesor UX AI</h1>
              <p className="text-[10px] text-slate-500 capitalize tracking-widest font-bold">Consultoría Estratégica</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Proyecto Actual</label>
              <div className="p-4 bg-[#161B22] border border-[#30363D] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="text-xs font-bold text-white">Clínica Las Condes</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Optimización de flujo de pago móvil para target 30-45 años.
                </p>
              </div>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="w-full flex items-center justify-between p-4 text-xs font-bold hover:bg-[#1C2128] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  System Prompt
                </span>
                {showSystemPrompt ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              <AnimatePresence>
                {showSystemPrompt && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-[#30363D]"
                  >
                    <div className="p-4 text-[10px] text-slate-500 font-mono italic leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {SYSTEM_PROMPT}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <button 
                onClick={clearChat}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Trash2 className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                Limpiar Historial
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
                <Download className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
                Exportar Logs (.md)
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-[#1E293B] bg-[#0D1117]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#30363D]">CL</div>
            <div className="flex-grow min-w-0">
              <p className="text-[11px] font-bold text-white truncate">Sesión Activa</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Consultoría Senior</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('gemini_api_key');
                setIsConfigured(false);
              }}
              className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        
        {/* Chat Header */}
        <header className="h-16 border-b border-[#1E293B] bg-[#0F1117]/80 backdrop-blur-md flex items-center px-8 justify-between shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-semibold tracking-tight">UX Strategy Session</h2>
          </div>
          <div className="flex gap-6 items-center">
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-indigo-500" /> Business Validated</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-emerald-500" /> ROI Focused</span>
            </div>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-grow overflow-y-auto px-6 py-10 space-y-10 bg-gradient-to-b from-[#0F1117] to-[#0A0C10]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center ring-1 ring-indigo-500/20 shadow-xl">
                <Lightbulb className="w-10 h-10 text-indigo-500" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">Estrategia de Pagos Móviles</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bienvenido a la sesión de consultoría estratégica. Analiza hipótesis, calcula el impacto financiero de tus propuestas y obtén feedback crítico de nivel Senior.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("Valida mi hipótesis: simplificar el paso de autenticación reducirá el abandono un 15%.")}
                  className="p-4 bg-[#161B22] border border-[#30363D] rounded-xl text-[11px] text-left hover:border-indigo-500/50 transition-all group"
                >
                  <p className="font-bold text-slate-300 mb-1 group-hover:text-indigo-400 text-xs">Validar Hipótesis</p>
                  <p className="text-slate-500 italic">"Sobre autenticación y abandono..."</p>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("Calcula el ROI si implementamos pagos con un solo clic para pacientes recurrentes.")}
                  className="p-4 bg-[#161B22] border border-[#30363D] rounded-xl text-[11px] text-left hover:border-indigo-500/50 transition-all group"
                >
                  <p className="font-bold text-slate-300 mb-1 group-hover:text-indigo-400 text-xs">Análisis de ROI</p>
                  <p className="text-slate-500 italic">"Para pagos en un solo clic..."</p>
                </motion.button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex items-start gap-5 max-w-4xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-md ${
                msg.role === 'user' 
                ? 'bg-slate-700 ring-1 ring-white/10' 
                : 'bg-indigo-600 shadow-indigo-500/20'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-300" /> : <Bot className="w-6 h-6 text-white" />}
              </div>
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-[#161B22] border border-[#30363D] text-slate-300 rounded-tl-none'
                }`}>
                  <div className="markdown-container prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:text-indigo-400 
                    prose-strong:text-white prose-ul:list-disc prose-li:marker:text-indigo-600">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-tighter">
                  {msg.timestamp} {msg.role === 'assistant' && '• Gemini 1.5 Flash'}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-5 max-w-3xl mr-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-indigo-500/20">
                <Bot className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl rounded-tl-none px-6 py-5 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-8 bg-[#0F1117] border-t border-[#1E293B]">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-end gap-3 bg-[#161B22] border border-[#30363D] rounded-2xl p-2 pl-6 focus-within:border-indigo-500/50 transition-all shadow-2xl focus-within:shadow-indigo-500/5"
            >
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Describe tu propuesta de UX..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm py-4 h-14 resize-none placeholder-slate-600 text-[#E2E8F0]"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-3.5 rounded-xl transition-all mb-0.5 ${
                  input.trim() && !isLoading 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95' 
                  : 'text-slate-700 bg-[#0D1117] cursor-not-allowed border border-[#30363D]'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold">
              Powered by Google Gemini 1.5 Pro • Professional Polish Theme
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .markdown-container h1, .markdown-container h2, .markdown-container h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.025em;
        }
        .markdown-container ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .markdown-container li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .markdown-container p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #30363D;
          border-radius: 10px;
          border: 2px solid #0F1117;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}
