import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Flame, 
  Stethoscope, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ChevronLeft, 
  Bell, 
  Users, 
  ShieldAlert,
  Clock,
  Heart,
  Activity,
  Mic,
  Languages,
  Volume2,
  X,
  Shield,
  CheckCircle2,
  XCircle,
  Map as MapIcon,
  Scan,
  EyeOff,
  User,
  Search,
  Send,
  MessageCircle,
  BookOpen,
  Navigation,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { EmergencyType, Responder, UserLocation } from './types';
import { EMERGENCY_COLORS, MOCK_RESPONDERS } from './constants';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Components ---

const VoiceAssistant = ({ onClose, onConfirm, onTranslate }: { onClose: () => void, onConfirm: (transcript: string) => void, onTranslate: (transcript: string) => void, key?: React.Key }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");

  useEffect(() => {
    if (!isListening) return;
    setError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback for browsers without SpeechRecognition
      const timeout = setTimeout(() => {
        setTranscript("I need an ambulance at Baker Street...");
        setIsListening(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.results[0][0].transcript;
      setTranscript(current);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setError("MICROPHONE_ACCESS_DENIED: Browser blocked the connection. Please try opening this app in a NEW TAB (top right button), or check your browser settings.");
      } else {
        setError(`VOICE_SIG_LOST: ${event.error.toUpperCase()}. Try moving to a quieter area.`);
      }
      setIsListening(false);
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-8 flex flex-col items-center gap-6 shadow-2xl ring-[20px] ring-slate-900/5 z-[250]"
      >
      <div className="flex w-full justify-between items-center px-2">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voice Terminal Active</span>
        </div>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {!showManual ? (
        <>
          <div className="relative">
            <AnimatePresence>
              {isListening && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
                />
              )}
            </AnimatePresence>
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`w-28 h-28 rounded-full flex items-center justify-center relative z-10 transition-all shadow-2xl active:scale-90 ${isListening ? 'bg-blue-600 scale-110 shadow-blue-200 ring-8 ring-slate-50' : 'bg-slate-50 border border-slate-100'}`}
            >
              <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-slate-400'}`} />
            </button>
          </div>

          <div className="text-center w-full min-h-[80px] px-4">
            {error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-[250px] mx-auto">{error}</p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setIsListening(true)}
                    className="text-blue-500 font-black text-[9px] uppercase tracking-widest underline underline-offset-4"
                  >
                    Retry Connection
                  </button>
                  <button 
                    onClick={() => setShowManual(true)}
                    className="text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                  >
                    Switch to Manual Typing
                  </button>
                </div>
              </motion.div>
            ) : isListening ? (
              <p className="text-blue-500 font-black text-sm animate-pulse tracking-[0.3em] uppercase">Listening...</p>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {transcript ? (
                  <>
                    <p className="text-slate-400 text-[10px] uppercase font-black mb-3 tracking-[0.2em] italic">Transcript Deciphered</p>
                    <p className="text-slate-900 italic text-xl leading-snug font-black tracking-tight mb-2">"{transcript}"</p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">Tap mic to speak</p>
                    <button 
                      onClick={() => setShowManual(true)}
                      className="text-slate-300 font-bold text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      or type manually
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Describe Emergency</label>
            <textarea 
              autoFocus
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-xl italic font-black text-slate-900 focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-200 h-40 resize-none shadow-inner"
              placeholder="E.g. Fire on 3rd floor, two trapped..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowManual(false)}
            className="w-full text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            Go back to voice mode
          </button>
        </div>
      )}

      {((!isListening && transcript) || (showManual && manualText)) && (
        <div className="w-full flex flex-col gap-4">
          <button 
            className="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all text-white text-xs shadow-2xl shadow-blue-100"
            onClick={() => onConfirm(showManual ? manualText : transcript)}
          >
            Confirm Crisis Alert
          </button>
          <button 
            className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all text-slate-500 text-xs flex items-center justify-center gap-3"
            onClick={() => onTranslate(showManual ? manualText : transcript)}
          >
            <Languages className="w-5 h-5" />
            Send to Translator
          </button>
        </div>
      )}
      </motion.div>
    </div>
  );
};

const SOSButton = ({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-3xl transition-all active:scale-95 shadow-sm"
  >
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-3 shadow-lg text-white`}>
      {icon}
    </div>
    <span className="font-bold text-[10px] text-slate-700 uppercase tracking-widest">{label}</span>
  </button>
);

const ShieldAlertButton = ({ onClick }: { onClick: () => void }) => (
  <SOSButton 
    icon={<ShieldAlert className="w-6 h-6" />} 
    label="SECURITY" 
    color="bg-red-600" 
    onClick={onClick} 
  />
);

const VoiceButton = ({ onClick }: { onClick: () => void }) => (
  <SOSButton 
    icon={<Mic className="w-6 h-6" />} 
    label="VOICE" 
    color="bg-slate-800" 
    onClick={onClick} 
  />
);

const Translator = ({ onClose, onConfirm, initialText = "" }: { onClose: () => void, onConfirm: (msg: string) => void, initialText?: string, key?: React.Key }) => {
  const [text, setText] = useState(initialText);
  const [translated, setTranslated] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (initialText) {
      handleTranslate();
    }
  }, []);

  const handleTranslate = async () => {
    const textToTranslate = text || initialText;
    if (!textToTranslate) return;
    setIsTranslating(true);
    try {
      const prompt = `Translate the following English text to Hindi. Respond ONLY with the Hindi translation text without any quotes or additional comments: "${textToTranslate}"`;
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const translatedText = result.text?.trim() || "Translation unavailable";
      setTranslated(translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslated("Error in translation");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2.5rem] p-6 flex flex-col gap-4 shadow-2xl ring-[20px] ring-slate-900/5 z-[250]"
      >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.2)]" />
          <span className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400">Tactical Translator</span>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 text-slate-900 overflow-hidden">
        <div className="flex-[1.2] flex flex-col gap-1.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Source: English</p>
            <textarea 
              placeholder="TYPE_HERE"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] focus:border-blue-500 outline-none resize-none text-slate-900 font-bold italic placeholder:text-slate-200"
            />
        </div>

        <div className="flex justify-between items-center text-[8px] font-black text-slate-400 tracking-widest px-2">
          <span>EN</span>
          <div className="h-[0.5px] bg-slate-100 flex-1 mx-4" />
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <div className="h-[0.5px] bg-slate-100 flex-1 mx-4" />
          <span>HI</span>
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right">Target: Hindi</p>
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] relative group shadow-inner">
              {isTranslating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl backdrop-blur-[1px]">
                  <p className="text-[8px] font-black text-blue-500 animate-pulse tracking-widest uppercase">Syncing...</p>
                </div>
              ) : (
                <p className={`font-bold text-xs tracking-tight leading-loose ${translated ? 'text-slate-900' : 'text-slate-300'}`}>
                  {translated || "Awaiting Packets..."}
                </p>
              )}
              {translated && (
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg flex items-center justify-center active:scale-90 transition-all">
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button 
          onClick={handleTranslate}
          disabled={isTranslating || !text || !!translated}
          className="w-full bg-slate-50 border border-slate-100 disabled:opacity-50 py-3 rounded-xl font-black uppercase tracking-widest transition-all text-slate-400 text-[9px] active:scale-95"
        >
          Translate
        </button>
        <button 
          onClick={() => onConfirm(translated || text)}
          disabled={!text}
          className="w-full bg-blue-600 py-3 rounded-xl font-black uppercase tracking-widest transition-all text-white text-[10px] shadow-xl shadow-blue-100 active:scale-95"
        >
          Dispatch Link
        </button>
      </div>
      </motion.div>
    </div>
  );
};

const Header = ({ onBack, title }: { onBack?: () => void, title?: string }) => (
  <header className="flex items-center justify-between p-6 bg-white border-b border-slate-100 z-50">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-100">
        <ShieldAlert className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase leading-none mb-1">Emergency</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title || "STANDBY"}</p>
      </div>
    </div>
    <button className="p-2 hover:bg-slate-50 rounded-full transition-colors relative text-slate-400 hover:text-slate-900">
      <Bell className="w-5 h-5" />
      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
    </button>
  </header>
);

const UserAvatar = ({ name, type }: { name: string, type: Responder['type'] }) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  const colors = {
    DOCTOR: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    HOSPITAL: 'bg-red-500/10 text-red-400 border border-red-500/20',
    CITIZEN: 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  };
  return (
    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-xs shadow-inner ${colors[type]}`}>
      {initials}
    </div>
  );
};

const ChatOverlay = ({ type, onClose, responder }: { type: 'Doctor' | 'Police' | 'Responder', onClose: () => void, responder?: Responder, key?: React.Key }) => {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      text: lang === 'EN' 
        ? `You are now connected to the emergency ${type.toLowerCase()} dispatch.` 
        : `अब आप आपातकालीन ${type === 'Police' ? 'पुलिस' : type === 'Doctor' ? 'तैयार डॉक्टर' : 'सहायक'} डिस्पैच से जुड़े हैं।`
    },
    { 
      role: 'them', 
      text: lang === 'EN'
        ? `This is ${responder?.name || type} responder. I am inbound to your location. Please describe your situation.`
        : `यह ${responder?.name || (type === 'Police' ? 'पुलिस' : type === 'Doctor' ? 'डॉक्टर' : 'सहायक')} डिस्पैच है। मैं आपकी लोकेशन की ओर आ रहा हूँ। कृपया अपनी स्थिति बताएं।`
    }
  ]);
  const [input, setInput] = useState("");

  const quickReplies = lang === 'EN' ? [
    "I'm trapped",
    "Pain is worsening",
    "Smoke is thick",
    "Help arrives?"
  ] : [
    "मैं फँसा हूँ",
    "दर्द बढ़ रहा है",
    "धुआँ घना है",
    "मदद आ गई?"
  ];

  const handleSend = (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim()) return;
    setMessages([...messages, { role: 'me', text: msgText }]);
    if (!text) setInput("");
    
    // Simulate response
    setTimeout(() => {
      const responses = [
        "Roger that. Help is on the way. Keep the line open.",
        "I'm roughly 2 minutes out. Stay calm.",
        "Understood. Relaying this to HQ. Stay in position.",
        "Help is nearby. We have your signal locked."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'them', text: randomResponse }]);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute inset-x-0 bottom-0 top-12 z-[150] bg-white rounded-t-[3.5rem] shadow-2xl flex flex-col border-t border-slate-100"
    >
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50 rounded-t-[3.5rem]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${type === 'Doctor' ? 'bg-blue-600 text-white' : type === 'Responder' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-white'}`}>
            {type === 'Doctor' ? <Stethoscope className="w-6 h-6" /> : type === 'Responder' ? <Users className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 italic uppercase tracking-tight">{responder?.name || `${type} Dispatch`}</p>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest leading-none">{responder ? 'Confirmed Unit' : 'Line Active'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-full p-1 border border-slate-200 shadow-inner">
            <button 
              onClick={() => setLang('EN')}
              className={`px-3 py-1 text-[8px] font-black rounded-full transition-all ${lang === 'EN' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('HI')}
              className={`px-3 py-1 text-[8px] font-black rounded-full transition-all ${lang === 'HI' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              HI
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.map((m, i) => (
          <div key={`msg-${i}`} className={`flex ${m.role === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] font-bold leading-relaxed shadow-sm ${
              m.role === 'system' ? 'w-full bg-slate-50 text-slate-400 text-center italic border-none py-2' :
              m.role === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-50'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white pb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickReplies.map((reply, idx) => (
            <button
              key={`quick-${idx}`}
              onClick={() => handleSend(reply)}
              className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
            >
              {reply}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 p-2 pr-4 shadow-inner">
          <input 
            type="text" 
            placeholder={lang === 'EN' ? "TYPE_MESSAGE" : "सन्देश_लिखें"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none outline-none text-[11px] font-black italic uppercase px-4 text-slate-900 placeholder:text-slate-300"
          />
          <button 
            onClick={() => handleSend()}
            className="w-10 h-10 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const VolunteerSOP = ({ type, onClose }: { type: EmergencyType, onClose: () => void, key?: React.Key }) => {
  const [personalizedSteps, setPersonalizedSteps] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultSteps = type === 'MEDICAL' ? [
    "Check for responsiveness.",
    "Call 911 if not already done.",
    "Check for breathing.",
    "Perform CPR if trained.",
    "Apply pressure to any bleeding wounds."
  ] : type === 'FIRE' ? [
    "Evacuate everyone immediately.",
    "Do not use elevators.",
    "Crawl low under smoke.",
    "Close doors behind you to stop spread.",
    "Assemble at a safe primary location."
  ] : [
    "Find a safe place to hide or exit.",
    "Silence your mobile device.",
    "Lock and barricade doors.",
    "Stay away from windows.",
    "Await official clearance."
  ];

  const handlePersonalize = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Create a short, tactical 5-step emergency guide for a ${type} emergency. 
      Personalize it for a volunteer who wants to help. 
      Keep each step under 15 words.
      Respond ONLY with a JSON array of 5 strings. No other text.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const text = response.text || "";
      // Basic JSON extraction in case model includes markdown code blocks
      const jsonStr = text.replace(/```json|```/g, '').trim();
      const steps = JSON.parse(jsonStr);
      if (Array.isArray(steps)) {
        setPersonalizedSteps(steps);
      }
    } catch (error) {
      console.error("Personalization error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSteps = personalizedSteps || defaultSteps;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-8 z-[210] bg-white border border-slate-200 shadow-2xl rounded-[3rem] p-8 flex flex-col gap-8 ring-8 ring-slate-50"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.2)]" />
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Operation Guide</span>
        </div>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Tactical Guide</h3>
          {!personalizedSteps && (
            <button 
              onClick={handlePersonalize}
              disabled={isGenerating}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Activity className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'AI Personalize'}
            </button>
          )}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
          {personalizedSteps ? 'AI-Personalized Protocol' : 'Standard Operating Procedures'}
        </p>
        
        <div className="space-y-5">
          {currentSteps.map((step, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={`step-${i}`} 
              className="flex gap-4 items-start"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-blue-500 flex items-center justify-center shrink-0 text-[11px] font-black shadow-sm">
                {i + 1}
              </div>
              <p className="text-xs font-bold text-slate-600 leading-tight pt-2 uppercase tracking-tight">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-orange-50 rounded-3xl border border-orange-100">
        <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-500" />
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Force Safety</p>
        </div>
        <p className="text-[10px] text-slate-500 italic leading-snug uppercase font-medium">Do not exceed training levels. profesional extraction units are in-bound to your current grid.</p>
      </div>

      <button 
        onClick={onClose}
        className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all text-xs shadow-xl"
      >
        I am Ready
      </button>
    </motion.div>
  );
};

const ExitNavigation = ({ onBack }: { onBack: () => void, key?: React.Key }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-white"
    >
      <Header onBack={onBack} title="TACTICAL EXTRACTION" />
      
      <div className="flex-1 relative overflow-hidden bg-slate-50">
        {/* Tactical Blueprints */}
        <div className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px' 
          }}
        />

        {/* Floor Plan Mockup */}
        <svg className="absolute inset-0 w-full h-full p-12 opacity-40" viewBox="0 0 400 600">
          <path d="M50,100 L350,100 L350,500 L50,500 Z" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M150,100 L150,500 M250,100 L250,500 M50,250 L350,250 M50,400 L350,400" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Path to Exit */}
          <motion.path 
            d="M200,325 L200,450 L300,450 L300,550" 
            fill="none" 
            stroke="#3B82F6" 
            strokeWidth="4" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          
          <circle cx="200" cy="325" r="5" fill="#3B82F6" className="animate-pulse" />
          <motion.circle cx="300" cy="550" r="8" fill="#EF4444" 
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </svg>

        <div className="absolute top-8 left-8 right-8 flex flex-col gap-4">
           <div className="bg-white border border-slate-100 p-5 rounded-3xl backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-white" />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Exit Vector Found</p>
              </div>
              <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">North-East Exit • 42m</h3>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Follow Blue Tactical Path</p>
           </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 bg-white text-slate-900 p-6 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] flex items-center gap-5 border border-slate-100">
           <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6 text-white" />
           </div>
           <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Command</p>
              <p className="text-sm font-black uppercase tracking-tight italic">Proceed to Level 4 Stairwell</p>
           </div>
           <ChevronRight className="w-6 h-6 text-slate-300" />
        </div>
      </div>

      <div className="p-6 pb-12 bg-slate-50 flex items-center justify-center">
         <button 
           onClick={onBack}
           className="px-8 py-4 bg-white border border-slate-200 shadow-sm rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] active:scale-95 transition-all hover:text-slate-900"
         >
           Close Vector
         </button>
      </div>
    </motion.div>
  );
};

// --- Main App ---

const VolunteerAlert = ({ incident, onAccept, onDecline }: { incident: any, onAccept: () => void, onDecline: () => void, key?: React.Key }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col"
    >
      <div className="bg-blue-600 p-6 pt-10 flex flex-col items-center gap-3 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
        </div>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl relative z-10 animate-pulse">
          <Activity className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic relative z-10 leading-none">Mission Alert</h2>
        <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.3em] relative z-10">Responder Unit Required</p>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50">
        <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 h-48 bg-slate-200 relative shadow-2xl group shrink-0">
           <img 
             src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
             className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
             alt="Hospitality"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
           <div className="absolute bottom-6 left-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-red-500/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">Live Visual</span>
           </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Location</p>
              <p className="text-base font-black text-slate-900 italic mb-1 uppercase tracking-tight">Hospitality • Building A</p>
              <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Floor 04 • Lobby B • Room 402</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-100 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Profile</p>
              <p className="text-base font-black text-slate-900 italic uppercase tracking-tight">{incident.title}</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{incident.desc || "Class 1 Emergency Signal"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 pb-12 flex flex-col gap-4 bg-white border-t border-slate-100">
        <button 
          onClick={onAccept}
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white p-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-green-100 active:scale-95 transition-all text-sm"
        >
          <CheckCircle2 className="w-6 h-6" />
          I Can Help
        </button>
        <button 
          onClick={onDecline}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 p-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all text-sm border border-slate-200"
        >
          <XCircle className="w-6 h-6" />
          Decline
        </button>
      </div>
    </motion.div>
  );
};

const IncidentFeedScreen = ({ onVolunteer }: { onVolunteer: (incident: any) => void }) => {
  const incidents = [
    { title: 'Hospitality Anomaly', type: 'SECURITY', dist: 'Floor 4', time: '1m ago', desc: 'Aggressive human action detected by AI.' },
    { title: 'Lobby Glass Break', type: 'SECURITY', dist: 'Main Lobby', time: '5m ago', desc: 'Sonic sensor match for glass impact at Bar.' },
    { title: 'Maintenance Fire', type: 'FIRE', dist: 'Basement', time: '12m ago', desc: 'Smoke sensors active near HVAC unit.' },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Community Feed</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Live Scan</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nearby Activity</p>
        {incidents.map((incident, i) => (
          <div key={`incident-${i}`} className="p-4 bg-white border border-slate-100 rounded-3xl flex gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              incident.type === 'FIRE' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 
              incident.type === 'MEDICAL' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-red-50 text-red-500 border border-red-100'
            }`}>
              {incident.type === 'FIRE' ? <Flame className="w-6 h-6" /> : 
               incident.type === 'MEDICAL' ? <Stethoscope className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-black text-slate-900 italic truncate uppercase">{incident.title}</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase shrink-0 ml-2">{incident.time}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mb-3 font-medium uppercase tracking-tight">{incident.desc}</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500">
                  <MapPin className="w-2.5 h-2.5" />
                  {incident.dist}
                </span>
                <button className="text-[9px] font-black uppercase text-slate-300 hover:text-slate-600 transition-colors underline underline-offset-4 decoration-slate-100">Protocols</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="p-8 bg-blue-600 rounded-3xl text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-24 h-24 rotate-12" />
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-xl font-black mb-1 italic tracking-tighter">VOLUNTEER FORCE</h3>
            <p className="text-[11px] opacity-80 mb-6 leading-relaxed font-bold uppercase tracking-wide">400+ Responders Active In Grid</p>
            <button 
              onClick={() => onVolunteer(incidents[0])}
              className="w-full bg-white text-blue-600 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Check Missions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CAMERAS = [
  { id: 'FLOOR_4_SEC_B', label: 'Lounge B', url: 'https://images.unsplash.com/photo-1541888941297-dc59cd386ec3?q=80&w=2070&auto=format&fit=crop', status: 'ACTIVE' },
  { id: 'LOBBY_MAIN_A', label: 'Main Lobby', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop', status: 'ACTIVE' },
  { id: 'PARKING_LVL_1', label: 'P1 Parking', url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1974&auto=format&fit=crop', status: 'GLITCH' },
  { id: 'ROOFTOP_NORTH', label: 'Roof North', url: 'https://images.unsplash.com/photo-1533418264835-98fe1e49c115?q=80&w=2070&auto=format&fit=crop', status: 'ACTIVE' }
];

const SurveillanceScreen = () => {
  const [lastEvents, setLastEvents] = useState([
    { type: 'NORMAL', time: '10s ago', msg: 'Ambient hospitality monitoring active.', conf: 99 },
    { type: 'NORMAL', time: '1m ago', msg: 'System check: Smart-Mics online in Floor 1 Lobby.', conf: 100 },
  ]);

  const [isAlert, setIsAlert] = useState(false);
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [riskLevel, setRiskLevel] = useState(12);
  const [activeCam, setActiveCam] = useState(CAMERAS[0]);
  const [isNightVision, setIsNightVision] = useState(false);

  // Simulate an AI detection event
  useEffect(() => {
    const timer = setTimeout(() => {
      const confidence = 87;
      const newEvent = { 
        type: 'MISHAP', 
        time: 'JUST NOW', 
        msg: '⚠️ AGGRESSIVE HUMAN ACTION: POTENTIAL CONFLICT - SECTOR 7 LOUNGE',
        conf: confidence
      };
      
      setLastEvents(prev => [newEvent, ...prev]);
      setIsAlert(true);
      setRiskLevel(84);

      if (confidence > 80) {
        setTimeout(() => setBroadcastActive(true), 1000);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">Sentinel AI</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Neural Mesh v4.2</p>
        </div>
        <div className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 border shadow-sm ${isAlert ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isAlert ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'}`} />
          <span className={`text-[9px] font-black uppercase tracking-tighter ${isAlert ? 'text-red-600' : 'text-green-600'}`}>
            {isAlert ? 'Threat Alert' : 'Nodes Secure'}
          </span>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Risk Index</p>
          <h3 className={`text-4xl font-black italic tracking-tighter relative z-10 ${riskLevel > 50 ? 'text-red-600' : 'text-slate-900'}`}>
            {riskLevel}%
          </h3>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 transition-transform">
            <Activity className="w-20 h-20" />
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${riskLevel}%` }}
               className={`h-full ${riskLevel > 50 ? 'bg-red-500' : 'bg-blue-500'}`}
             />
          </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Mics Active</p>
          <div className="flex items-end gap-1 h-10 relative z-10">
             {[1,2,3,4,5,6].map(i => (
                <motion.div 
                  key={`mic-bar-${i}`}
                  animate={{ height: isAlert ? [4, 24, 8, 20, 10] : [4, 8, 6, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                  className={`w-1 rounded-full ${isAlert ? 'bg-red-500' : 'bg-blue-400'}`}
                />
             ))}
          </div>
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-2">{isAlert ? 'High Decibel' : 'Ambient OK'}</p>
        </div>
      </div>

      <AnimatePresence>
        {broadcastActive && (
          <motion.div 
            key="protocol-alpha"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-600 rounded-[2.5rem] text-white shadow-2xl shadow-red-100 border border-white/20 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Alpha: Autonomous</p>
              </div>
              <h3 className="text-xl font-black italic uppercase leading-none mb-1">Mass Notification Sent</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-4">Direct warnings dispatched to all sector units</p>
              
              <div className="flex items-center gap-2 bg-black/20 p-3 rounded-2xl border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Broadcast confirmed • Floor 4 & 5</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <ShieldAlert className="w-24 h-24 rotate-12" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* CCTV SIMULATION */}
        <section>
          <div className="flex justify-between items-center mb-4">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">CCTV Data Stream</p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LIVE_FEED • {activeCam.label}</span>
                </div>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsNightVision(!isNightVision)}
                  className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${isNightVision ? 'bg-green-600 border-green-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  Night Mode
                </button>
             </div>
          </div>
          
          <div className="relative rounded-[2.5rem] overflow-hidden aspect-video bg-black border border-slate-200 shadow-xl group">
            {/* GLITCH OVERLAY */}
            <motion.div 
               animate={{ opacity: [0, 0.05, 0, 0.1, 0] }}
               transition={{ repeat: Infinity, duration: 0.2 }}
               className="absolute inset-0 z-10 bg-white pointer-events-none"
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="text-[10px] font-black text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md tracking-tighter border border-white/10 uppercase">{activeCam.id}</span>
              <span className="text-[10px] font-black text-blue-400 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md tracking-tighter border border-white/10">{Math.floor(Math.random() * 500) + 120} kbps</span>
            </div>

            <div className="absolute top-4 right-4 z-20">
               <p className="text-[8px] font-mono font-bold text-white/40 leading-tight">
                 X: {Math.random().toFixed(4)}<br />
                 Y: {Math.random().toFixed(4)}<br />
                 Z: {Math.random().toFixed(4)}
               </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCam.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 bg-cover bg-center grayscale transition-all duration-500 ${isNightVision ? 'brightness-150 contrast-150 sepia-[0.8] hue-rotate-[90deg] saturate-200' : ''}`}
                style={{ backgroundImage: `url(${activeCam.url})` }}
              >
                 {/* SCANLINES */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[size:100%_4px,3px_100%]" />
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay z-10" />

            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none z-20">
               <div className="w-full h-full border border-blue-400/20 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400/60" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400/60" />
                  
                  {isAlert && (
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.05, 1], 
                        borderColor: ['#EF4444', '#FFFFFF', '#EF4444'],
                        x: [0, 5, -5, 0],
                        y: [0, -3, 3, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-red-500 flex flex-col items-center justify-center p-2 bg-red-500/10 backdrop-blur-[2px]"
                    >
                      <div className="relative">
                         <User className="w-8 h-8 text-red-500 mb-2" />
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      </div>
                      <span className="text-[10px] bg-red-600 text-white font-black px-3 py-1 rounded uppercase tracking-tighter animate-pulse mb-1">Pattern: Hostile</span>
                      <span className="text-[8px] font-mono text-red-400 bg-black/40 px-2 py-0.5 rounded">ID: TARGET_092</span>
                    </motion.div>
                  )}
               </div>
            </div>

            {/* SCANNING LINE */}
            <motion.div 
               animate={{ top: ['0%', '100%', '0%'] }}
               transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
               className="absolute w-full h-px bg-blue-400/50 shadow-[0_0_10px_#60A5FA] z-30"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
             {CAMERAS.map((cam) => (
                <button 
                  key={cam.id}
                  onClick={() => setActiveCam(cam)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${activeCam.id === cam.id ? 'border-blue-500 scale-105 shadow-lg z-10' : 'border-slate-100 opacity-60'}`}
                >
                   <img src={cam.url} className="w-full h-full object-cover grayscale" />
                   <div className="absolute inset-0 bg-black/20" />
                   <div className="absolute bottom-1 inset-x-1 bg-black/60 backdrop-blur-sm rounded-md p-1">
                      <p className="text-[7px] font-black text-white uppercase truncate text-center">{cam.label}</p>
                   </div>
                   {cam.status === 'GLITCH' && (
                     <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
                        <motion.div 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          className="w-full h-px bg-red-500"
                        />
                     </div>
                   )}
                </button>
             ))}
          </div>
        </section>

        {/* HUMAN ACTION DETECTION */}
        <section>
          <div className="flex justify-between items-center mb-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Action Scoring</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {[
               { icon: <Activity className="w-4 h-4" />, label: 'Conflict', conf: riskLevel, active: isAlert },
               { icon: <Mic className="w-4 h-4" />, label: 'Acoustic Panic', conf: isAlert ? 78 : 4 },
               { icon: <EyeOff className="w-4 h-4" />, label: 'Concealment', conf: isAlert ? 42 : 12 },
               { icon: <Users className="w-4 h-4" />, label: 'Crowd Density', conf: 15 }
             ].map((m, i) => (
               <div key={`metric-${i}`} className={`p-5 rounded-[2.5rem] border transition-all ${m.active ? 'bg-red-50 border-red-100 shadow-md ring-4 ring-red-500/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${m.active ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {m.icon}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-black uppercase italic mb-1 truncate ${m.active ? 'text-red-900' : 'text-slate-900'}`}>{m.label}</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${m.conf}%` }}
                            className={`h-full ${m.active ? 'bg-red-500' : 'bg-blue-500'}`}
                          />
                       </div>
                       <span className={`text-[9px] font-black tracking-widest uppercase ${m.active ? 'text-red-600' : 'text-slate-300'}`}>{m.conf}%</span>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* AI LOGS */}
        <section className="space-y-3 pb-8">
            <div className="flex justify-between items-center mb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Heuristic Stream</p>
            </div>
            {lastEvents.map((event, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={`event-${i}`} 
                className={`p-4 rounded-[2rem] border flex items-center gap-4 ${
                  event.type === 'MISHAP' ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  event.type === 'MISHAP' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {event.type === 'MISHAP' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-black italic leading-tight uppercase mb-1 tracking-tighter ${event.type === 'MISHAP' ? 'text-red-600' : 'text-slate-600'}`}>
                    {event.msg}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{event.time} • CON: {event.conf}%</p>
                </div>
              </motion.div>
            ))}
        </section>
      </div>
    </div>
  );
};

const CallOverlay = ({ isOpen, onClose, name }: { isOpen: boolean, onClose: () => void, name: string, key?: React.Key }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
    >
       <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 relative">
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-blue-500 rounded-full"
          />
          <Phone className="w-10 h-10 text-white relative z-10" />
       </div>
       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{name}</h3>
       <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-12">Encrypted Audio Link</p>
       
       <button 
         onClick={onClose}
         className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all"
       >
         <Phone className="w-8 h-8 rotate-[135deg]" />
       </button>
       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-6">End Call</p>
    </motion.div>
  );
};

const VolunteerMissionScreen = ({ incident, onBack, onChat, onCall }: { incident: any, onBack: () => void, onChat: () => void, onCall: () => void, key?: React.Key }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-white"
    >
      <Header onBack={onBack} title="ACTIVE MISSION" />
      
      <div className="flex-1 relative overflow-hidden bg-slate-900">
        {/* Tactical Map Mockup */}
        <div className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
            backgroundSize: '30px 30px' 
          }}
        />
        
        <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-slate-800 rounded-[3rem] pointer-events-none" />

        {/* Navigation Path Simulation */}
        <svg className="absolute inset-0 w-full h-full p-12" viewBox="0 0 400 600">
           <motion.path 
             d="M100,500 L100,300 L300,300 L300,100" 
             fill="none" 
             stroke="#3B82F6" 
             strokeWidth="3" 
             strokeDasharray="8 8"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 3, repeat: Infinity }}
           />
           <circle cx="100" cy="500" r="6" fill="#3B82F6" className="animate-pulse" />
           <motion.circle 
             cx="300" cy="100" r="10" fill="#EF4444" 
             animate={{ scale: [1, 1.4, 1] }} 
             transition={{ repeat: Infinity, duration: 1.5 }}
           />
        </svg>

        <div className="absolute top-8 left-8 right-8 space-y-4">
           <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-3xl">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Individual</p>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Victim Status: ALIVE</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{incident.dist} • Room 402</p>
           </div>
        </div>

        <div className="absolute bottom-12 left-8 right-8 flex flex-col gap-4">
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onChat}
                className="bg-white p-5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Live Chat</span>
              </button>
              <button 
                onClick={onCall}
                className="bg-blue-600 p-5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl text-white"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Voice Call</span>
              </button>
           </div>
           
           <button 
             onClick={onBack}
             className="w-full bg-red-600/10 border border-red-600/20 text-red-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
           >
             Abort Mission
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<'home' | 'tracking' | 'terminal' | 'network' | 'exit-navigation' | 'volunteer-mission'>('home');
  const [activeEmergency, setActiveEmergency] = useState<EmergencyType | null>(null);
  const [location, setLocation] = useState<UserLocation>({ lat: 51.505, lng: -0.09 });
  const [responders, setResponders] = useState<Responder[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [activeFeature, setActiveFeature] = useState<'voice' | 'translator' | null>(null);
  const [sharedText, setSharedText] = useState("");
  const [activeChat, setActiveChat] = useState<'Doctor' | 'Police' | 'Responder' | null>(null);
  const [showSOP, setShowSOP] = useState(false);
  const [volunteerIncident, setVolunteerIncident] = useState<any>(null);
  const [activeMission, setActiveMission] = useState<any>(null);
  const [showCall, setShowCall] = useState(false);
  const [sosPressProgress, setSosPressProgress] = useState(0);
  const [selectedResponderId, setSelectedResponderId] = useState<string | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate GPS tracking
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback to mock location
        }
      );
    }
  }, []);

  // Real-time responder tracking simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (screen === 'tracking' && responders.length > 0) {
      interval = setInterval(() => {
        setResponders(prevResponders => 
          prevResponders.map(responder => ({
            ...responder,
            // Subtly update coordinates (moving towards user's center at 0,0 relative in this map layout)
            lat: responder.lat * 0.95 + (Math.random() - 0.5) * 0.0005,
            lng: responder.lng * 0.95 + (Math.random() - 0.5) * 0.0005,
            // Update distance string simulation
            distance: (Math.sqrt(responder.lat**2 + responder.lng**2) * 100).toFixed(1) + ' km'
          }))
        );
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [screen, responders.length]);

  const handleSosStart = () => {
    const startTime = Date.now();
    const duration = 3000;
    
    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setSosPressProgress(progress);
      
      if (progress >= 100) {
        if (pressTimerRef.current) clearInterval(pressTimerRef.current);
        triggerEmergency('SOS');
        setSosPressProgress(0);
      }
    }, 50);
  };

  const handleSosEnd = () => {
    if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    setSosPressProgress(0);
  };

  const triggerEmergency = (type: EmergencyType) => {
    setActiveEmergency(type);
    setScreen('tracking');
    setActiveFeature(null);
    
    // Simulate responders being notified
    setTimeout(() => {
      setResponders([MOCK_RESPONDERS[0], MOCK_RESPONDERS[1]]);
      setNotificationMsg(`${type} SIGNAL BROADCASTED. EMERGENCY SERVICES ENGAGED.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }, 2000);

    setTimeout(() => {
      setResponders(MOCK_RESPONDERS);
    }, 5000);
  };

  const handleBack = () => {
    setActiveChat(null);
    setShowSOP(false);
    setSelectedResponderId(null);
    if (screen === 'volunteer-mission') {
      setScreen('terminal');
      setActiveMission(null);
    } else if (screen === 'tracking') {
      setScreen('home');
      setActiveEmergency(null);
      setResponders([]);
      setActiveFeature(null);
    } else if (screen === 'emergency-selection') {
      setScreen('home');
      setActiveFeature(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans max-w-md mx-auto relative overflow-hidden flex flex-col shadow-2xl border-x border-slate-100">
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col pt-2"
          >
            <Header />
            
            <main className="flex-1 px-6 flex flex-col gap-6 overflow-y-auto pb-8 bg-white">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Ready. GPS Active.</span>
                </div>
                <MapPin className="w-3 h-3 text-slate-300" />
              </div>

              <section className="text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2 font-mono">Emergency Dispatch</p>
                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-6 uppercase">Need Immediate Help?</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    onClick={() => triggerEmergency('FIRE')}
                    className="flex flex-col items-center justify-center p-6 bg-[#FFF7ED] rounded-3xl transition-all active:scale-95 shadow-xl shadow-orange-100 h-full border border-[#FFF7ED]"
                  >
                    <div className="w-14 h-14 bg-[#F97316] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-orange-200 text-white">
                      <Flame className="w-8 h-8" />
                    </div>
                    <span className="font-black text-[11px] text-[#F97316] uppercase tracking-widest leading-none">Fire Dept</span>
                  </button>
                  
                  <button 
                    onClick={() => triggerEmergency('MEDICAL')}
                    className="flex flex-col items-center justify-center p-6 bg-[#EFF6FF] rounded-3xl transition-all active:scale-95 shadow-xl shadow-blue-100 h-full border border-[#EFF6FF]"
                  >
                    <div className="w-14 h-14 bg-[#3B82F6] rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-200 text-white">
                      <Stethoscope className="w-8 h-8" />
                    </div>
                    <span className="font-black text-[11px] text-[#3B82F6] uppercase tracking-widest leading-none">Medical</span>
                  </button>

                  <button 
                    onClick={() => triggerEmergency('SECURITY')}
                    className="col-span-2 flex items-center justify-center gap-4 p-5 bg-slate-900 rounded-3xl transition-all active:scale-95 shadow-xl shadow-slate-200"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg text-slate-900">
                      <Shield className="w-6 h-6" />
                    </div>
                    <span className="font-black text-sm text-white uppercase tracking-widest leading-none">Security Task Force</span>
                  </button>
                </div>

                <div className="flex gap-4 mb-8">
                  <button 
                    onClick={() => setActiveFeature('voice')}
                    className="flex-1 flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all active:scale-95 text-[11px] font-black text-slate-500 uppercase tracking-widest"
                  >
                    <Mic className="w-4 h-4 text-blue-500" />
                    Voice
                  </button>
                  <button 
                    onClick={() => setActiveFeature('translator')}
                    className="flex-1 flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all active:scale-95 text-[11px] font-black text-slate-500 uppercase tracking-widest"
                  >
                    <Languages className="w-4 h-4 text-blue-500" />
                    Translate
                  </button>
                </div>
              </section>

              <section className="flex flex-col items-center justify-center relative mb-8">
                 <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl" />
                 <div className="relative group">
                    {/* SOS Long Press Progress Ring */}
                    <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none z-20">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="118"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.05)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="50%"
                        cy="50%"
                        r="118"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="8"
                        strokeDasharray="741.4"
                        strokeDashoffset={741.4 - (741.4 * sosPressProgress) / 100}
                        strokeLinecap="round"
                        transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                      />
                    </svg>

                    <button 
                        onPointerDown={handleSosStart}
                        onPointerUp={handleSosEnd}
                        onPointerLeave={handleSosEnd}
                        className="w-56 h-56 rounded-full bg-red-600 p-2 relative z-10 active:scale-95 transition-all flex items-center justify-center shadow-2xl shadow-red-200 group overflow-hidden select-none touch-none"
                    >
                        <div className="w-full h-full rounded-full border-4 border-white/20 flex flex-col items-center justify-center gap-1 group-active:bg-white/10 transition-colors">
                          <span className="text-7xl font-black italic tracking-tighter text-white uppercase mt-4">SOS</span>
                          <div className="h-0.5 w-12 bg-white/40 block" />
                          <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.2em]">
                            {sosPressProgress > 0 ? "Holding..." : "Hold For Help"}
                          </span>
                        </div>
                    </button>
                    
                    {sosPressProgress > 0 && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl z-30">
                        Stay Pressed • {Math.ceil((3000 - (sosPressProgress * 30)) / 1000)}s
                      </div>
                    )}
                 </div>
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0, 0.1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute w-72 h-72 border-2 border-red-500/20 rounded-full"
                 />

                 <button 
                    onClick={() => setScreen('exit-navigation')}
                    className="mt-12 flex items-center gap-3 px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-800 uppercase tracking-[0.3em] hover:bg-slate-100 transition-all active:scale-95 z-10 shadow-sm"
                 >
                    <Navigation className="w-4 h-4 text-blue-500" />
                    Navigate to Exit
                 </button>
              </section>

              <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Global Scan Active</p>
                  <p className="text-[11px] font-mono font-bold text-blue-600 mb-0.5">42.3601° N, 71.0589° W</p>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-tight">Floor: 04 • Lobby: B • Room: 402</p>
                </div>
                <div className="bg-green-50 text-green-600 p-1.5 rounded-lg border border-green-100">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
            </main>
          </motion.div>
        )}

        {screen === 'exit-navigation' && (
          <ExitNavigation key="exit-navigation" onBack={() => setScreen('home')} />
        )}

        {screen === 'terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <Header onBack={() => setScreen('home')} title="FEED DISCOVERY" />
            <IncidentFeedScreen onVolunteer={(inc) => setVolunteerIncident(inc)} />
          </motion.div>
        )}

        {screen === 'network' && (
          <motion.div
            key="network"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <Header onBack={() => setScreen('home')} title="AI SURVEILLANCE" />
            <SurveillanceScreen />
          </motion.div>
        )}

        {screen === 'volunteer-mission' && activeMission && (
          <VolunteerMissionScreen 
            key="volunteer-mission"
            incident={activeMission} 
            onBack={handleBack}
            onChat={() => setActiveChat('Responder')}
            onCall={() => setShowCall(true)}
          />
        )}

        {screen === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full bg-white"
          >
            <Header 
              onBack={handleBack} 
              title="EMERGENCY BROADCAST"
            />
            
            <div 
              onClick={() => setSelectedResponderId(null)}
              className="relative flex-1 bg-slate-50 overflow-hidden border-b border-slate-100 cursor-crosshair"
            >
              {/* Engineering Grid Map (Indoor Blueprint Style) */}
              <div className="absolute inset-0 opacity-10" 
                style={{ 
                  backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
                  backgroundSize: '40px 40px' 
                }}
              />
              
              {/* Floor Plan Labels */}
              <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-slate-200 rounded-3xl pointer-events-none">
                 <div className="absolute top-4 left-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Building A • West Wing</div>
                 <div className="absolute bottom-4 right-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Floor 04 • Hospitality Suite</div>
                 <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100" />
                 <div className="absolute left-1/2 top-0 w-px h-full bg-slate-100" />
              </div>

              {/* Radar Sweeper Simulation */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/0 via-blue-500/5 to-blue-500/10 rounded-full pointer-events-none"
              />

              {/* User Pulsing Location Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0.05, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-16 h-16 rounded-full absolute -translate-x-1/2 -translate-y-1/2 ${activeEmergency ? EMERGENCY_COLORS[activeEmergency].bg : 'bg-red-500'}/20 border border-current shadow-xl shadow-red-200`}
                />
                <div className={`w-4 h-4 rounded-full border-4 border-white shadow-2xl z-30 ${activeEmergency ? EMERGENCY_COLORS[activeEmergency].bg : 'bg-red-500'}`} />
              </div>
              
              <AnimatePresence>
                {responders.map((r) => (
                  <motion.div
                    key={`marker-${r.id}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: selectedResponderId === r.id ? 1.2 : 1, 
                      x: (r.lng * 1200), 
                      y: (r.lat * 1200) 
                    }}
                    whileHover={{ scale: 1.1 }}
                    className={`absolute top-1/2 left-1/2 z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResponderId(r.id);
                    }}
                  >
                    <div className="relative">
                      {selectedResponderId === r.id && (
                        <motion.div 
                          layoutId="pulse"
                          className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"
                        />
                      )}
                      <div className={`p-2 rounded-2xl border-2 shadow-2xl transition-all ${
                        selectedResponderId === r.id ? 'border-blue-500 scale-110' : 'border-white'
                      } ${
                        r.type === 'DOCTOR' ? 'bg-blue-600' : 
                        r.type === 'HOSPITAL' ? 'bg-red-600' : 'bg-slate-700'
                      }`}>
                        {r.type === 'DOCTOR' && <Stethoscope className="w-4 h-4 text-white" />}
                        {r.type === 'HOSPITAL' && <AlertTriangle className="w-4 h-4 text-white" />}
                        {r.type === 'CITIZEN' && <Users className="w-4 h-4 text-white" />}
                      </div>

                      <AnimatePresence>
                        {selectedResponderId === r.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 10, x: '-50%' }}
                            className="absolute bottom-full left-1/2 mb-4 bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 min-w-[140px] z-50 pointer-events-none"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-1.5 h-1.5 rounded-full bg-green-500`} />
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Unit</p>
                            </div>
                            <p className="text-[11px] font-black text-slate-900 uppercase italic leading-none mb-1 truncate">{r.name}</p>
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{r.distance} Inbound</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-100" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Sheet Terminals */}
            <motion.div 
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              className="bg-white rounded-t-[3.5rem] p-8 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.05)] z-50 border-t border-slate-50"
            >
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Nearby Responders</p>
                <div className="px-3 py-1 bg-green-50 border border-green-100 text-green-600 text-[9px] font-black rounded-lg uppercase tracking-widest leading-none">
                  Secure Link
                </div>
              </div>

              <div className="space-y-4 mb-8 max-h-[25vh] overflow-y-auto pr-2 custom-scrollbar">
                {responders.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                       <Search className="w-4 h-4 text-blue-500 animate-spin" />
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Locating Nodes...</p>
                    </div>
                  </div>
                ) : (
                  responders.map((responder) => (
                    <motion.div 
                      id={`responder-${responder.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={`list-item-${responder.id}`} 
                      className={`p-4 border rounded-3xl flex items-center gap-4 transition-all group ${
                        selectedResponderId === responder.id 
                        ? 'bg-blue-50 border-blue-200 ring-4 ring-blue-500/5 shadow-lg scale-[1.02]' 
                        : 'bg-slate-50 border-slate-100 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedResponderId(responder.id)}
                    >
                      <UserAvatar name={responder.name} type={responder.type} />
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-sm block text-slate-900 italic uppercase truncate transition-colors group-hover:text-blue-600">{responder.name}</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{responder.distance} • {responder.id === '1' ? 'Floor 04' : responder.id === '2' ? 'West Wing' : 'Main Lobby'}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setNotificationMsg(`NOTIFYING ${responder.name.toUpperCase()}...`);
                          setShowNotification(true);
                          setTimeout(() => setShowNotification(false), 3000);
                        }}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-95 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={handleBack}
                  className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-all text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-100"
                >
                  Cancel Signal
                </button>
                <div className="grid grid-flow-col gap-2">
                  <button 
                    onClick={() => {
                      if (responders.length > 0) {
                        setSelectedResponderId(responders[0].id);
                        setActiveChat('Responder');
                      } else {
                        setActiveChat(activeEmergency === 'MEDICAL' ? 'Doctor' : 'Police');
                      }
                    }}
                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-all active:scale-95 shadow-sm border border-blue-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Chat</span>
                  </button>
                  <button 
                    onClick={() => setShowSOP(true)}
                    className="p-3 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-all active:scale-95 shadow-sm border border-orange-100"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Guide</span>
                  </button>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {activeChat && (
                <ChatOverlay 
                  key="chat-overlay"
                  type={activeChat} 
                  responder={activeChat === 'Responder' && selectedResponderId ? responders.find(r => r.id === selectedResponderId) : undefined}
                  onClose={() => setActiveChat(null)} 
                />
              )}
              {showSOP && (
                <VolunteerSOP 
                  key="sop-overlay"
                  type={activeEmergency} 
                  onClose={() => setShowSOP(false)} 
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && (
          <motion.div 
            key="notification"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-[250] px-6 pointer-events-none"
          >
            <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 backdrop-blur-3xl ring-4 ring-slate-900/5">
              <div className="p-2 bg-red-600 rounded-2xl shadow-lg shadow-red-200">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <p className="text-[11px] font-black leading-tight flex-1 uppercase tracking-widest italic">{notificationMsg}</p>
            </div>
          </motion.div>
        )}

        {activeFeature === 'voice' && (
          <VoiceAssistant 
            key="voice-assistant"
            onClose={() => setActiveFeature(null)} 
            onConfirm={(msg) => {
              setNotificationMsg(`VOICE ALERT CONFIRMED: ${msg.toUpperCase()}`);
              triggerEmergency('SOS');
            }}
            onTranslate={(msg) => {
              setSharedText(msg);
              setActiveFeature('translator');
            }}
          />
        )}
        {activeFeature === 'translator' && (
          <Translator 
            key="translator"
            onClose={() => {
              setActiveFeature(null);
              setSharedText("");
            }} 
            initialText={sharedText}
            onConfirm={(msg) => {
              setActiveFeature(null);
              triggerEmergency('MEDICAL');
              setNotificationMsg(`CRISIS CONFIRMED: ${msg.toUpperCase()}`);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 3000);
            }}
          />
        )}

        {volunteerIncident && (
          <VolunteerAlert 
            key="volunteer-alert"
            incident={volunteerIncident}
            onAccept={() => {
              const incident = { ...volunteerIncident };
              setVolunteerIncident(null);
              setNotificationMsg("MISSION ACCEPTED. PROCEED TO DISPATCH.");
              setShowNotification(true);
              setTimeout(() => {
                setShowNotification(false);
                setActiveMission(incident);
                setScreen('volunteer-mission');
              }, 2000);
            }}
            onDecline={() => setVolunteerIncident(null)}
          />
        )}

        {showCall && (
          <CallOverlay 
            key="call-overlay"
            isOpen={showCall} 
            onClose={() => setShowCall(false)} 
            name="Victim Link" 
          />
        )}
      </AnimatePresence>

      {screen !== 'tracking' && (
        <footer className="p-4 pb-8 flex items-center justify-center gap-12 bg-white border-t border-slate-100">
          <button 
            onClick={() => setScreen('home')}
            className="flex flex-col items-center gap-1 group"
          >
            <ShieldAlert className={`w-5 h-5 ${screen === 'home' || screen === 'tracking' ? 'text-red-500' : 'text-slate-400'}`} />
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${screen === 'home' || screen === 'tracking' ? 'text-red-500' : 'text-slate-400'}`}>Alerts</span>
          </button>
          <button 
            onClick={() => setScreen('terminal')}
            className="flex flex-col items-center gap-1"
          >
            <MessageSquare className={`w-5 h-5 ${screen === 'terminal' ? 'text-blue-500' : 'text-slate-400'}`} />
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${screen === 'terminal' ? 'text-blue-500' : 'text-slate-400'}`}>Feed</span>
          </button>
          <button 
            onClick={() => setScreen('network')}
            className="flex flex-col items-center gap-1"
          >
            <Activity className={`w-5 h-5 ${screen === 'network' ? 'text-blue-500' : 'text-slate-400'}`} />
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${screen === 'network' ? 'text-blue-500' : 'text-slate-400'}`}>Security</span>
          </button>
        </footer>
      )}
    </div>
  );
}


