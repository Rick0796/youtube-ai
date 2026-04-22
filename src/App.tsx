import React, { useState, useCallback, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { CoachChat } from './components/CoachChat';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LoadingScreen } from './components/LoadingScreen';
import { VideoData, AnalysisStructure, ChatMessage, HistoryItem } from './types';
import { analyzeVideo, askCoach } from './services/gemini';
import { AlertCircle, ArrowLeft, MoreHorizontal, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [videoSources, setVideoSources] = useState<VideoData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [pendingVideoInfo, setPendingVideoInfo] = useState<{title: string, author: string, videoId: string} | null>(null);

  // Load history on mount
  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error('Failed to load history:', err));
  }, []);

  const saveToHistory = async (videos: VideoData[], analysisResult: AnalysisStructure) => {
    if (videos.length === 0) return;
    
    const primary = videos[0];
    const historyItem: HistoryItem = {
      id: primary.videoId || primary.title,
      source: primary,
      analysis: analysisResult,
      timestamp: Date.now()
    };

    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyItem)
      });
      if (res.ok) {
        // Refresh local history
        const updatedRes = await fetch('/api/history');
        const updatedData = await updatedRes.json();
        setHistory(updatedData);
      }
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  const performAnalysis = async (videos: VideoData[]) => {
    setIsLoading(true);
    try {
      let combinedTranscript = "";
      let combinedTitle = "";
      let combinedAuthor = "";
      
      if (videos.length > 1) {
        combinedTranscript = videos.map((r, i) => `[视频 ${i+1}: ${r.title}]\n作者: ${r.author}\n内容:\n${r.transcript}`).join('\n\n---\n\n');
        combinedTitle = `主题深度合成: ${videos.map(r => r.title).slice(0, 2).join(' & ')}${videos.length > 2 ? ' 等' : ''}`;
        combinedAuthor = videos.map(r => r.author).join(', ');
      } else {
        combinedTranscript = videos[0].transcript;
        combinedTitle = videos[0].title;
        combinedAuthor = videos[0].author;
      }

      // Perform depth analysis
      const analysisResult = await analyzeVideo(combinedTranscript, combinedTitle, combinedAuthor, videos.every(r => r.hasTranscript));
      setAnalysis(analysisResult);
      
      // Save result to server DB
      saveToHistory(videos, analysisResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '分析过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (urlInput: string) => {
    setIsLoading(true);
    setError(null);
    
    // If it's the first search, clear everything. If it's subsequent, we might want to append.
    const isAppending = videoSources.length > 0;

    try {
      const urls = urlInput
        .split(/(?=https?:\/\/)|[,\s]+/)
        .map(u => u.trim())
        .filter(u => u.startsWith('http'));
      
      if (urls.length === 0) {
        throw new Error('请输入有效的 YouTube 链接');
      }

      const results = await Promise.all(urls.map(async (url) => {
        try {
          const response = await fetch(`/api/youtube/data?url=${encodeURIComponent(url)}`);
          if (!response.ok) {
            const text = await response.text();
            throw new Error(`获取视频数据失败: ${text || response.statusText}`);
          }
          const data = await response.json();
          if (!data.hasTranscript && urls.length === 1) {
            setPendingVideoInfo({ title: data.title, author: data.author, videoId: data.videoId });
            setShowManualInput(true);
          }
          return data;
        } catch (e: any) {
          throw new Error(`视频解析失败 (${url}): ${e.message}`);
        }
      }));

      const newVideoSources = isAppending ? [...videoSources, ...results] : results;
      setVideoSources(newVideoSources);
      
      await performAnalysis(newVideoSources);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '请求过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setVideoSources([item.source]);
    setAnalysis(item.analysis);
    setIsHistoryOpen(false);
    setChatMessages([]);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (videoSources.length === 0) return;

    const newUserMessage: ChatMessage = { role: 'user', content: text };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const combinedTranscript = videoSources.map(r => r.transcript).join('\n\n');
      const result = await askCoach(combinedTranscript, chatMessages, text, analysis || undefined);
      const assistantMessage: ChatMessage = { role: 'assistant', content: result };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我现在无法回答，请稍后再试。' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [videoSources, chatMessages]);

  const reset = () => {
    setVideoSources([]);
    setAnalysis(null);
    setError(null);
    setChatMessages([]);
    setShowManualInput(false);
    setManualTranscript('');
    setPendingVideoInfo(null);
  };

  const handleManualSubmit = async () => {
    if (!manualTranscript.trim() || !pendingVideoInfo) return;
    
    const manualVideo: VideoData = {
      title: pendingVideoInfo.title,
      author: pendingVideoInfo.author,
      thumbnail: `https://i.ytimg.com/vi/${pendingVideoInfo.videoId}/hqdefault.jpg`,
      videoId: pendingVideoInfo.videoId,
      transcript: manualTranscript,
      hasTranscript: true
    };
    
    setVideoSources([manualVideo]);
    setShowManualInput(false);
    await performAnalysis([manualVideo]);
  };

  const primaryVideo = videoSources[0];

  return (
    <div className="min-h-screen text-white relative">
      <HistoryDrawer 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 z-30 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={reset}>
           <div className="text-2xl font-bold tracking-tighter flex items-center font-serif">
            <span className="text-white">Lean</span>
            <span className="text-white/60 font-light">Tube</span>
           </div>
        </div>
        {videoSources.length > 0 && (
          <div className="flex-1 max-w-xl mx-auto px-4 hidden md:block">
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              compact={true} 
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-gray-300"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">历史记录</span>
            {history.length > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-[#030303]">
                {history.length}
              </span>
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-300">User</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 min-h-[calc(100vh-64px)] flex flex-col">
        <AnimatePresence mode="wait">
          {videoSources.length === 0 && !isLoading ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center pb-32"
            >
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto mt-8 p-4 bg-rose-500/10 border border-rose-500/20 backdrop-blur-md rounded-2xl flex items-center gap-3 text-rose-400 shadow-xl shadow-rose-500/5"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {showManualInput && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto mt-12 p-8 glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">由于限制，未能自动提取到该视频字幕</h3>
                      <p className="text-gray-400 text-sm">为了获得最佳分析结果，请在下方粘贴该视频的字幕内容（您可以从 YouTube 视频下方的“显示转录稿”中复制）。</p>
                    </div>
                  </div>
                  <textarea
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    placeholder="在此处粘贴字幕原文..."
                    className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all mb-6 resize-none font-sans"
                  />
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => setShowManualInput(false)}
                      className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold text-gray-400"
                    >
                      跳过并尝试联网搜索
                    </button>
                    <button 
                      onClick={handleManualSubmit}
                      disabled={!manualTranscript.trim()}
                      className="px-8 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold shadow-lg shadow-indigo-600/20"
                    >
                      开始深度分析
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              {isLoading && videoSources.length === 0 ? (
                <LoadingScreen />
              ) : primaryVideo && analysis ? (
                <>
                  <div className="flex justify-between items-center px-6 md:px-12 mb-8">
                    <button 
                      onClick={reset}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium text-sm group glass-panel px-4 py-2 rounded-full w-max"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      退出分析
                    </button>
                    {videoSources.length > 1 && (
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        已合成 {videoSources.length} 个视频源
                      </span>
                    )}
                  </div>
                  <AnalysisDashboard 
                    analysis={analysis} 
                    video={primaryVideo} 
                    onAskQuestion={(q) => {
                      setIsChatOpen(true);
                      handleSendMessage(q);
                    }}
                  />
                  {isLoading && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-indigo-600/90 backdrop-blur-xl px-8 py-4 rounded-full border border-indigo-400 shadow-2xl flex items-center gap-4 animate-bounce">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-bold text-sm">正在动态合成新加入的知识...</span>
                    </div>
                  )}
                  <CoachChat 
                    messages={chatMessages} 
                    onSendMessage={handleSendMessage} 
                    isLoading={isChatLoading} 
                    isOpen={isChatOpen}
                    setIsOpen={setIsChatOpen}
                  />
                </>
              ) : (
                <LoadingScreen />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 border-t border-white/10 text-center text-xs text-gray-500 font-medium">
        &copy; 2026 LeanTube AI • 面向深度学习的视频辅助引擎
      </footer>
    </div>
  );
}
