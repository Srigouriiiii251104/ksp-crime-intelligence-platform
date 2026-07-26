import React, { useState, useRef, useEffect } from 'react';
import type { User, Message, GraphData } from '../types.js';
import { GraphView } from './GraphView.js';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Shield, FileDown, 
  ChevronDown, ChevronUp, BookOpen, Sparkles, Bot, User as UserIcon, Search, Network
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ChatProps {
  user: User;
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [activeGraph, setActiveGraph] = useState<GraphData>({ nodes: [], edges: [] });
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Start voice recording using browser Web Speech API
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser version. Please use Google Chrome or Microsoft Edge for native microphone input.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert("Microphone permission denied. Please allow microphone access in your browser settings.");
        } else if (event.error === 'no-speech') {
          alert("No speech was detected. Please ensure your microphone is enabled and speak clearly.");
        } else if (event.error === 'network') {
          alert("Network error during speech recognition. Please check your internet connection.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsRecording(false);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle Play/Stop TTS reply
  const handlePlayTTS = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingMessageId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const audio = new Audio();
    audioRef.current = audio;
    setPlayingMessageId(messageId);

    const isKannada = /[\u0C80-\u0CFF]/.test(text);
    const langParam = isKannada ? 'kn' : 'en';

    let audioPlayed = false;

    try {
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}&language=${langParam}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 0) {
          const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(blob);

          audio.src = audioUrl;
          audio.onended = () => {
            setPlayingMessageId(null);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = (e) => {
            console.warn("HTML5 Audio playback error:", e);
            setPlayingMessageId(null);
          };

          try {
            await audio.play();
            audioPlayed = true;
          } catch (playErr: any) {
            console.warn("Autoplay policy blocked audio.play(), falling back to speech synthesis...", playErr);
          }
        }
      }
    } catch (backendErr) {
      console.warn("Backend TTS service unreachable, falling back to browser Speech Synthesis...", backendErr);
    }

    if (!audioPlayed && window.speechSynthesis) {
      const cleanText = text
        .replace(/\[[A-Za-z]+:\s*([^\]]+)\]/g, '$1')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isKannada ? 'kn-IN' : 'en-IN';
      utterance.onend = () => setPlayingMessageId(null);
      utterance.onerror = () => setPlayingMessageId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSources = (msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Submit Query helper (used by input form and sample pills)
  const submitQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    const historyPayload = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: historyPayload,
          language: language
        })
      });

      if (!response.ok) {
        let errMsg = 'API failed to synthesize query response';
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errMsg = errData.detail;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await response.json();

      const botMessage: Message = {
        id: `msg_bot_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        sql_ran: data.sql_ran,
        cypher_ran: data.cypher_ran,
        graph_data: data.graph_data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      if (data.graph_data && data.graph_data.nodes && data.graph_data.nodes.length > 0) {
        setActiveGraph(data.graph_data);
      } else {
        setActiveGraph({ nodes: [], edges: [] });
      }
    } catch (err: any) {
      const errorMessage: Message = {
        id: `msg_error_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Server connection error.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(inputText);
  };

  // Cytoscape highlight helper for inline citations
  const renderMessageContent = (content: string) => {
    const citationRegex = /\[(FIR|Accused|Victim|Location):\s*([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      const type = match[1];
      const identifier = match[2];

      let badgeColor = '';
      if (type === 'Accused') badgeColor = 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300';
      else if (type === 'Victim') badgeColor = 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300';
      else if (type === 'Location') badgeColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300';
      else if (type === 'FIR') badgeColor = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-300';

      parts.push(
        <span key={match.index} className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs border font-medium mx-0.5 ${badgeColor}`}>
          {type}: {identifier}
        </span>
      );

      lastIndex = citationRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(21, 34, 48);
    doc.text("Karnataka State Police (KSP) Intelligence Audit", 15, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated by: ${user.name} (${user.role}) | Badge Email: ${user.email}`, 15, y);
    y += 5;
    doc.text(`Date of Export: ${new Date().toLocaleString('en-IN')}`, 15, y);
    y += 5;
    doc.text(`Database Mode: KSP Grounded PoC Environment`, 15, y);
    y += 8;

    doc.setDrawColor(200);
    doc.line(15, y, 195, y);
    y += 10;

    if (messages.length === 0) {
      doc.setFontSize(10);
      doc.text("No dialogue history recorded.", 15, y);
      doc.save(`ksp-audit-dialogue-${Date.now()}.pdf`);
      return;
    }

    messages.forEach((msg) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      if (msg.role === 'user') {
        doc.setTextColor(30, 64, 175);
        doc.text(`[INVESTIGATOR QUERY - ${user.name}]:`, 15, y);
      } else {
        doc.setTextColor(16, 185, 129);
        doc.text(`[KSP AI GROUNDED ANSWER]:`, 15, y);
      }
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40);

      const splitText = doc.splitTextToSize(msg.content, 175);
      doc.text(splitText, 15, y);
      y += (splitText.length * 5) + 4;

      if (msg.role === 'assistant' && msg.sources && msg.sources.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(120);
        const sourceText = `Sources (${msg.sources.length}): ` + msg.sources.map(s => `${s.type}:${s.identifier}`).join(', ');
        const splitSources = doc.splitTextToSize(sourceText, 175);
        doc.text(splitSources, 15, y);
        y += (splitSources.length * 4) + 6;
      }
    });

    doc.save(`ksp-audit-dialogue-${Date.now()}.pdf`);
  };

  const sampleQueries = language === 'kn' ? [
    { icon: Search, label: "ವೈಟ್‌ಫೀಲ್ಡ್‌ನಲ್ಲಿ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳು", text: "ವೈಟ್‌ಫೀಲ್ಡ್‌ನಲ್ಲಿ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ" },
    { icon: Network, label: "ಗೀತಾ ರೆಡ್ಡಿ ಅವರ ಸಹಚರರು", text: "ಆರೋಪಿ ಗೀತಾ ರೆಡ್ಡಿ ಅವರ ಸಹಚರರು ಯಾರು?" },
    { icon: BookOpen, label: "ಇತ್ತೀಚಿನ ವಂಚನೆ ಪ್ರಕರಣಗಳು", text: "ಮೋಸ ಮತ್ತು ವಂಚನೆ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ" },
    { icon: Sparkles, label: "ಹಣಕಾಸಿನ ಖಾತೆಗಳ ಲಿಂಕ್‌ಗಳು", text: "ಖಾತೆಗಳ ಹಣಕಾಸಿನ ಲಿಂಕ್‌ಗಳನ್ನು ತೋರಿಸಿ" }
  ] : [
    { icon: Search, label: "Theft Cases in Whitefield", text: "Show me theft cases in Whitefield" },
    { icon: Network, label: "Associates of Geeta Reddy", text: "Who are the associates of accused Geeta Reddy?" },
    { icon: BookOpen, label: "Recent Fraud Cases", text: "Show me fraud cases" },
    { icon: Sparkles, label: "Financial Account Links", text: "Show me financial links" }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">

      {/* Left Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border bg-card/40">

        {/* Header bar */}
        <div className="bg-card px-5 py-3 border-b border-border flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Crime Records Assistant</h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Grounded AI
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Karnataka State Police Intelligence Terminal</p>
            </div>
          </div>

          {/* Controls: Language & PDF Export */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg border border-border">
              <span className="text-[10px] uppercase font-bold text-muted-foreground px-1">Lang:</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  language === 'en' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  language === 'kn' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <button
              onClick={exportToPDF}
              disabled={messages.length === 0}
              className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground border border-border rounded-lg transition-all flex items-center gap-1.5 font-medium active:scale-95 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Message Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>

              <h3 className="font-bold text-foreground text-base mb-1">
                Welcome, Officer! Ask me anything about KSP Crime Records
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                I can help you look up FIR reports, analyze criminal networks, inspect co-accused links, or track crime trends across Bengaluru. All answers are strictly grounded in official database records.
              </p>

              {/* Sample Action Pills */}
              <div className="w-full grid grid-cols-2 gap-2.5">
                {sampleQueries.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => submitQuery(item.text)}
                    className="p-3 bg-card hover:bg-muted/60 border border-border hover:border-primary/40 rounded-xl text-left transition-all group shadow-sm flex items-start gap-2.5"
                  >
                    <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                      <span className="block text-[10px] text-muted-foreground truncate">{item.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-1.5 px-3 py-1 bg-muted/60 rounded-full border border-border text-[10px] text-muted-foreground">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Karnataka State Police PoC • Grounded RAG Reasoning</span>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Name badge & TTS player */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                      {msg.role === 'user' ? user.name : 'KSP ASSISTANT'}
                    </span>
                    {msg.role === 'assistant' && !msg.id.startsWith('msg_error') && (
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(msg.id, msg.content)}
                        className={`p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors ${
                          playingMessageId === msg.id ? 'text-primary animate-bounce' : ''
                        }`}
                        title={playingMessageId === msg.id ? "Stop voice playback" : "Play reply via text-to-speech"}
                      >
                        {playingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Content Bubble */}
                  <div 
                    className={`px-4 py-3 rounded-2xl text-xs leading-relaxed border shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none'
                        : msg.id.startsWith('msg_error')
                          ? 'bg-destructive/10 border-destructive/20 text-destructive rounded-tl-none'
                          : 'bg-card border-border text-card-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
                  </div>

                  {/* Evidence Panel & Graph Link (only for bot responses) */}
                  {msg.role === 'assistant' && ((msg.sources && msg.sources.length > 0) || (msg.graph_data && msg.graph_data.nodes && msg.graph_data.nodes.length > 0)) && (
                    <div className="w-full mt-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm text-[10px]">
                      {msg.graph_data && msg.graph_data.nodes && msg.graph_data.nodes.length > 0 && (
                        <div className="px-3 py-2 border-b border-border bg-primary/5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-semibold text-primary">
                            <Network className="w-3.5 h-3.5" />
                            <span>Link Analysis Network ({msg.graph_data.nodes.length} nodes)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveGraph(msg.graph_data!)}
                            className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[9px] font-semibold hover:bg-primary/90 transition-colors"
                          >
                            Show Graph
                          </button>
                        </div>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleSources(msg.id)}
                            className="w-full px-3 py-2 flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              Grounded Evidence ({msg.sources.length} sources)
                            </span>
                            {expandedSources[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {expandedSources[msg.id] && (
                            <div className="p-3 border-t border-border bg-muted/30 space-y-2">
                              <div className="grid grid-cols-1 gap-1.5">
                                {msg.sources.map((src, sIdx) => (
                                  <div key={sIdx} className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-border text-foreground">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary">
                                      {src.database}
                                    </span>
                                    <span className="font-semibold text-xs">{src.type}:</span>
                                    <span className="text-muted-foreground truncate">{src.identifier}</span>
                                  </div>
                                ))}
                              </div>

                              {msg.sql_ran && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <span className="font-mono text-[9px] text-muted-foreground font-semibold uppercase block mb-1">Generated SQL Query:</span>
                                  <pre className="bg-muted p-2 rounded-lg text-[9px] font-mono overflow-x-auto text-foreground border border-border whitespace-pre-wrap">
                                    {msg.sql_ran}
                                  </pre>
                                </div>
                              )}

                              {msg.cypher_ran && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <span className="font-mono text-[9px] text-muted-foreground font-semibold uppercase block mb-1">Generated Cypher Query:</span>
                                  <pre className="bg-muted p-2 rounded-lg text-[9px] font-mono overflow-x-auto text-foreground border border-border whitespace-pre-wrap">
                                    {msg.cypher_ran}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-muted-foreground text-xs max-w-xs shadow-sm">
              <Sparkles className="w-4 h-4 text-primary animate-spin" />
              <span>Querying database records...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-card shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">

            {/* Mic button for STT */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                  : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
              title={isRecording ? "Stop recording speech" : "Speak to type (Voice Input)"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording 
                  ? "Listening to your voice..." 
                  : language === 'kn' 
                    ? "ವೈಟ್‌ಫೀಲ್ಡ್‌ನಲ್ಲಿ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ..." 
                    : "Ask a question about FIRs, accused, locations, or networks..."
              }
              className="flex-1 px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0"
              title="Submit Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Network Relationship Graph View */}
      <div className="w-[420px] lg:w-[480px] shrink-0 h-full border-l border-border bg-card/60">
        <GraphView graphData={activeGraph} />
      </div>

    </div>
  );
};
