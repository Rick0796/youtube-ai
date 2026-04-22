import React from 'react';
import { HistoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X, FileText, ChevronRight, Tags } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete?: (id: string) => void;
}

export function HistoryDrawer({ isOpen, onClose, history, onSelect, onDelete }: HistoryDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#080808] border-l border-white/5 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pt-12 pb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tight">历史数据分析</h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all group border border-transparent hover:border-white/10"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar pb-12">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-20 space-y-4">
                  <Clock className="w-16 h-16" />
                  <p className="text-sm font-medium">暂无历史分析记录</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.06] transition-all cursor-pointer group relative"
                    onClick={() => onSelect(item)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          <span className="text-indigo-400 mr-1">[深度解析]</span>
                          {item.source.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-medium text-white/20 pt-1">
                        {new Date(item.timestamp).toLocaleDateString().replace(/\//g, '/')}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/40 font-bold tracking-tight uppercase group-hover:text-white/60 transition-colors">
                        {item.source.author}
                      </span>
                      {item.analysis.mainClaims?.[0] && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300/40 font-bold group-hover:text-indigo-300 transition-colors truncate max-w-[120px]">
                          {item.analysis.mainClaims[0]}
                        </span>
                      )}
                    </div>

                    {/* Summary Description */}
                    <div className="relative">
                      <p className="text-[11px] text-white/30 leading-relaxed line-clamp-2 pr-6 group-hover:text-white/50 transition-colors italic">
                        {item.analysis.coreMeaning || "基于视频元数据的深度本体论推演报告..."}
                      </p>
                      <div className="absolute right-0 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Small metrics style divider */}
                    <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center gap-4 text-[10px] font-bold tracking-tighter opacity-20">
                       <span className="flex items-center gap-1">LOGIC MAP <Tags className="w-3 h-3" /> 100%</span>
                       <span className="flex items-center gap-1">INSIGHTS V2.4</span>
                    </div>

                    {/* Interaction Glow */}
                    <div className="absolute inset-0 bg-indigo-500/[0.02] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity rounded-2xl" />
                  </motion.div>
                ))
              )}
            </div>

            {/* Sticky footer info */}
            <div className="p-6 bg-[#080808]/80 backdrop-blur-xl border-t border-white/5">
               <div className="flex items-center justify-center gap-2 text-[10px] text-white/10 font-bold tracking-widest uppercase">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  Local Analytics Engine Secured
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

