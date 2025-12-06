
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Patient } from '../types';
import { Send, Mic, Sparkles, AlertCircle, StopCircle, BrainCircuit } from 'lucide-react';
import { Button } from './Button';
import { geminiService } from '../services/geminiService';

interface ChatInterfaceProps {
  patient: Patient;
  onUpdateNote: (text: string) => void;
  userId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ patient, onUpdateNote, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello. I am reviewing **${patient.name}'s** file (MRN: ${patient.mrn}).\nPreference: ${patient.noteTypePreference}.\n\nHow can I help you document today's visit?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Load chat history from local storage based on User ID + Patient ID
  const storageKey = `medigentx_chat_${userId}_${patient.id}`;
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history");
      }
    } else {
        // Reset if new patient selected without history
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `Hello. I am reviewing **${patient.name}'s** file (MRN: ${patient.mrn}).\nPreference: ${patient.noteTypePreference}.\n\nHow can I help you document today's visit?`,
            timestamp: Date.now()
        }]);
    }
  }, [patient.id, userId]);

  useEffect(() => {
    if (messages.length > 1) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);


  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const assistantMsgId = crypto.randomUUID();
    
    // Optimistic empty message for streaming
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    }]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg.content });

      let fullContent = '';
      
      // Use the service class instance
      const stream = geminiService.streamChat(history, patient.noteTypePreference, userMsg.content);

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, content: fullContent }
            : msg
        ));
        
        // Try to update the note in real-time if we detect headers
        if (fullContent.includes('# Subjective') || fullContent.includes('Subjective:')) {
            onUpdateNote(fullContent);
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

      // Final note update
      onUpdateNote(fullContent);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Error generating response. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-medical-500" />
            MediGentX AI Swarm
            {isStreaming && (
                <span className="flex h-2.5 w-2.5 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Multi-Agent System Active • {patient.noteTypePreference} Context
          </p>
        </div>
        <div className="flex items-center gap-2">
            {!process.env.API_KEY && (
                <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-900">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Demo Mode (Mock API)
                </div>
            )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-medical-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
                {msg.isStreaming && <span className="typing-cursor"></span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? "AI Agents are working..." : "Describe symptoms, exams, or ask for suggestions..."}
            disabled={isStreaming}
            className="w-full pl-4 pr-24 py-4 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl shadow-inner focus:ring-2 focus:ring-medical-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-gray-100"
          />
          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
            <Button 
                type="button"
                variant="ghost" 
                className="h-10 w-10 rounded-full text-gray-400 hover:text-medical-600"
            >
                <Mic className="w-5 h-5" />
            </Button>
            <Button 
                type="submit" 
                disabled={!input.trim() || isStreaming}
                className={`h-10 w-10 rounded-full p-0 flex items-center justify-center transition-all ${
                    input.trim() 
                        ? 'bg-medical-600 hover:bg-medical-700 text-white shadow-md' 
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                }`}
            >
                {isStreaming ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5 ml-0.5" />}
            </Button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
            MediGentX AI Swarm v2.0 • Verifying all outputs via Verification Agent
        </p>
      </div>
    </div>
  );
};
