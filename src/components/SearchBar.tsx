import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

export function SearchBar({ onSearch, isLoading, compact = false }: SearchBarProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  return (
    <div className={cn(
      "w-full max-w-2xl mx-auto transition-all duration-500",
      compact ? "p-4" : "mt-24 px-4"
    )}>
      {!compact && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 flex items-center justify-center gap-1 font-serif">
            <span className="text-white">Lean</span>
            <span className="text-white/60 font-light">Tube</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">把视频变成洞察，把知识变成行动</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-indigo-400/60 font-medium hover:text-indigo-400 cursor-help transition-colors group">
            <AlertCircle className="w-3 h-3" />
            <span onClick={() => alert('如果视频无法解析，您可以尝试在后续分析页面手动输入视频字幕。')}>遇到无法解析的视频？</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className={cn("relative group", !compact && "mt-12")}>
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="粘贴 YouTube 链接 (支持 2-3 个链接以进行知识合成)..."
          className={cn(
            "w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full py-5 pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-lg placeholder:text-gray-500 text-white shadow-2xl relative z-0",
            isLoading && "opacity-60 pointer-events-none"
          )}
        />
        {!isLoading && url && (
           <button 
             type="submit"
             className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-full text-sm font-medium border border-white/10 transition-all backdrop-blur-md"
           >
             分析
           </button>
        )}
      </form>

      {!compact && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['认知升级', '博弈论', '哲学分析', '商业访谈', '历史透视'].map((tag) => (
            <span 
              key={tag}
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 hover:text-white cursor-pointer transition-all"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
