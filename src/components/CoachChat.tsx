import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, ChevronRight, Sparkles, Loader2, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface CoachChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CoachChat({ messages, onSendMessage, isLoading, isOpen, setIsOpen }: CoachChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-16 h-16 rounded-full bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white/20 transition-all z-40 group",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageSquare className="w-8 h-8" />
        <span className="absolute -top-12 right-0 bg-white/10 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
          进阶学习与问答
        </span>
        <div className="absolute inset-0 rounded-full animate-ping bg-white/10 -z-10" />
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-black/40 backdrop-blur-3xl shadow-2xl z-50 flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 text-white/80 rounded-xl border border-white/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">深度学习教练</h3>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Growth Coach Mode</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-white/80" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">你可以继续追问视频中没听懂的部分，或者让教练帮你结合现实应用。</p>
                  <div className="mt-4 grid grid-cols-1 gap-2 w-full">
                    {[
                      '用更简单的话重讲一遍',
                      '给我更多现实案例',
                      '反过来挑战这个观点',
                      '怎么用到我的工作中？'
                    ].map(q => (
                      <button 
                        key={q} 
                        onClick={() => onSendMessage(q)}
                        className="text-xs text-white/80 bg-white/5 hover:bg-white/10 py-2 px-4 rounded-xl text-left border border-white/10 transition-all font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col gap-2",
                    m.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === 'assistant' ? (
                       <Bot className="w-4 h-4 text-white/80" />
                    ) : (
                       <User className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-tighter">
                      {m.role === 'assistant' ? 'Learning Coach' : 'You'}
                    </span>
                  </div>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm border",
                    m.role === 'user' 
                      ? "bg-white/20 text-white border-white/30 backdrop-blur-md" 
                      : "bg-white/5 text-gray-200 border-white/10 backdrop-blur-md"
                  )}>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-white/60" />
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-tighter">Coach is thinking...</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                    <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入你的问题或思考..."
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm disabled:opacity-50 text-white placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 text-white rounded-xl shadow-lg border border-white/10 hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
