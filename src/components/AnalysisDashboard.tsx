import React from 'react';
import { AnalysisStructure, VideoData } from '../types';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  Map as MapIcon, 
  Lightbulb, 
  CheckCircle2, 
  GitBranch, 
  AlertTriangle, 
  Layers, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Brain,
  AlertCircle,
  Play,
  UserCircle,
  FileDown,
  GitMerge,
  Ban,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import { ArgumentGraph } from './ArgumentGraph';

interface AnalysisDashboardProps {
  analysis: AnalysisStructure;
  video: VideoData;
  onAskQuestion?: (question: string) => void;
}

export function AnalysisDashboard({ analysis, video, onAskQuestion }: AnalysisDashboardProps) {
  const downloadPlaybook = () => {
    if (!analysis.playbook) return;
    
    const content = `
# 行动迁移手册: ${video.title}

## 第一周尝试做的 3 件事
${analysis.playbook.firstWeekActions.map(a => `- ${a}`).join('\n')}

## 需要戒掉的 2 个习惯
${analysis.playbook.habitsToQuit.map(h => `- ${h}`).join('\n')}

## 复盘关键问题
${analysis.playbook.reflectionQuestions.map(q => `- ${q}`).join('\n')}

## 生活脚本 (Actionable SOPs)
${analysis.playbook.lifeScripts?.map(s => `- ${s}`).join('\n') || '暂无可用的生活脚本'}

---
生成自 LeanTube AI - 面向深度学习的视频辅助引擎
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Playbook_${video.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    {
      title: '核心命题',
      content: (
        <div className="space-y-6">
          <div className="prose prose-lg prose-invert max-w-none text-gray-200 leading-relaxed drop-shadow-sm first-letter:text-4xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-indigo-400">
            <Markdown>{analysis.coreMeaning}</Markdown>
          </div>
        </div>
      ),
      icon: (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition-opacity" />
          <Sparkles className="w-5 h-5 text-indigo-300 relative z-10" />
        </div>
      ),
      className: 'col-span-full border-indigo-500/30 bg-indigo-500/5 ring-1 ring-white/5'
    },
    {
      title: '结构地图',
      content: <div className="prose prose-base prose-invert max-w-none text-gray-300 leading-relaxed"><Markdown>{analysis.structureMap}</Markdown></div>,
      icon: <MapIcon className="w-5 h-5 text-green-500" />,
      className: 'col-span-full border-green-500/20 bg-green-500/5'
    },
    {
      title: '核心概念',
      content: (
        <div className="space-y-4">
          {analysis.keyConcepts.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <h4 className="text-indigo-400 font-bold text-lg mb-2 underline decoration-indigo-400/30 underline-offset-4">{c.name}</h4>
              <div className="space-y-3 mt-3">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-white/20 uppercase shrink-0 mt-0.5">CONTEXT</span>
                  <p className="text-xs text-gray-400 italic leading-relaxed">{c.videoContext}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-emerald-500/40 uppercase shrink-0 mt-0.5">MAPPING</span>
                  <p className="text-xs text-emerald-400/80 leading-relaxed font-medium">{c.plainMapping}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-indigo-500/40 uppercase shrink-0 mt-0.5">INNER LOGIC</span>
                    <p className="text-xs text-white/50 leading-relaxed font-medium">{c.aiSupplement}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
      icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
      className: 'md:col-span-1'
    },
    {
      title: '逻辑推理链',
      content: <Markdown>{analysis.argumentChain}</Markdown>,
      icon: <GitBranch className="w-5 h-5 text-purple-500" />,
      className: 'md:col-span-1'
    },
    {
      title: '深层洞察',
      content: (
        <div className="space-y-8">
          <div>
            <h4 className="text-indigo-300 font-bold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 它真正想证明什么
            </h4>
            <p className="text-sm text-gray-300 ml-3.5">{analysis.logicAnalysis.whatIsProven}</p>
          </div>

          <div>
            <h4 className="text-indigo-300 font-bold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 推理逻辑
            </h4>
            <p className="text-sm text-gray-300 ml-3.5 leading-relaxed">{analysis.logicAnalysis.reasoningChain}</p>
          </div>

          {analysis.logicAnalysis.hardEvidence && (
            <div className="p-6 my-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ClipboardList className="w-12 h-12" />
              </div>
              <h4 className="text-xs font-black text-indigo-400/60 uppercase tracking-widest mb-4">核心论证硬核 (The Hard Evidence)</h4>
              <div className="text-sm text-indigo-100/90 leading-relaxed italic font-medium">
                {analysis.logicAnalysis.hardEvidence}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-3.5">
            <div>
              <h4 className="text-indigo-300 font-bold mb-3">潜在假设</h4>
              <ul className="space-y-2">
                {analysis.logicAnalysis.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-400 flex gap-2">
                    <span className="text-indigo-500 font-bold">·</span> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-indigo-300 font-bold mb-3">争议点</h4>
              <ul className="space-y-2">
                {analysis.logicAnalysis.controversies.map((c, i) => (
                  <li key={i} className="text-sm text-gray-400 flex gap-2">
                    <span className="text-rose-500 font-bold">·</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h4 className="text-indigo-300 font-bold mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 为何具有说服力
            </h4>
            <p className="text-sm text-gray-300 ml-3.5 leading-relaxed">{analysis.logicAnalysis.persuasionReason}</p>
          </div>
        </div>
      ),
      icon: <Brain className="w-5 h-5 text-indigo-500" />,
      className: 'col-span-full'
    },
    {
      title: '认知陷阱',
      content: analysis.misconceptions.map(m => `- ${m}`).join('\n'),
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      className: 'md:col-span-1'
    },
    {
      title: '思维模型透镜',
      content: (
        <div className="flex flex-wrap gap-3 mt-2">
          {analysis.mentalModels?.map((model, i) => (
            <div key={i} className="px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group hover:bg-indigo-500/20 transition-all">
              <span className="text-xs font-bold text-indigo-300 block mb-1">#{model.name}</span>
              <p className="text-[10px] text-gray-400 leading-tight">{model.description}</p>
            </div>
          ))}
          {(!analysis.mentalModels || analysis.mentalModels.length === 0) && (
            <p className="text-xs text-gray-500 italic">正在基于逻辑流识别底层模型...</p>
          )}
        </div>
      ),
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
      className: 'md:col-span-1 border-emerald-500/20 bg-emerald-500/5'
    },
    {
      title: '行动迁移',
      content: analysis.applicationSuggestions.map(a => `- ${a}`).join('\n'),
      icon: <TrendingUp className="w-5 h-5 text-rose-500" />,
      className: 'md:col-span-1'
    },
    {
      title: '成长教练',
      content: analysis.coachInsights,
      icon: <Zap className="w-5 h-5 text-cyan-500" />,
      className: 'md:col-span-1'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      {/* Video Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12 items-start bg-black/40 p-6 rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex-shrink-0 w-full md:w-80 aspect-video rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10">
          <img 
            src={video.thumbnail} 
            alt={video.title} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{video.title}</h2>
          <p className="text-gray-300 font-medium mb-4">{video.author}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {!video.hasTranscript && (
              <div className="flex flex-col gap-1 w-full">
                <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 font-bold flex items-center gap-2 w-max shadow-lg shadow-orange-500/5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  智能推演模式：视频原文字幕受限
                </span>
                <p className="text-[10px] text-gray-400 pl-1">
                  由于该视频未开启公开字幕，LeanTube 将基于视频元数据、标题架构及 AI 深度语料库进行“跨时空本体论推演”，为你构建可能的论证模型。
                </p>
              </div>
            )}
            {analysis.mainClaims.slice(0, 3).map((claim, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-gray-200 font-medium">
                {claim}
              </span>
            ))}
          </div>
          {analysis.bottomLine && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 italic text-sm text-indigo-100 flex gap-3 items-center">
              <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>「 {analysis.bottomLine} 」</span>
            </div>
          )}

          {/* Research Assistant Pipeline Indicator */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">研究助手四层分析架构</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: '定位层', color: 'bg-blue-500' },
                { label: '获取层', color: 'bg-emerald-500' },
                { label: '规范层', color: 'bg-amber-500' },
                { label: '分析层', color: 'bg-indigo-500' }
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col gap-1">
                    <div className={`h-1 w-8 rounded-full ${step.color} opacity-80`} />
                    <span className="text-[8px] text-gray-500 font-bold">{step.label}</span>
                  </div>
                  {i < 3 && <ArrowRight className="w-2 h-2 text-white/10" />}
                </React.Fragment>
              ))}
              <div className="ml-auto px-2 py-0.5 rounded bg-white/5 border border-white/10">
                 <span className="text-[8px] text-white/40 font-mono italic">Verified Synthesis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Syntopical Analysis Section (if multi-video) */}
      {analysis.synthesis && (analysis.synthesis.consensus?.length > 0 || analysis.synthesis.contradictions?.length > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-3xl shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <GitMerge className="w-32 h-32 text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <GitMerge className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">跨视频知识合成</h3>
              <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-bold">Syntopical Analysis & Knowledge Synthesis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
               <h4 className="flex items-center gap-2 text-emerald-300 font-bold mb-4">
                 <CheckCircle2 className="w-4 h-4" /> 共识点
               </h4>
               <ul className="space-y-3">
                 {analysis.synthesis.consensus.map((item, i) => (
                   <li key={i} className="text-sm text-gray-300 flex gap-2">
                     <span className="text-emerald-500 font-bold shrink-0">·</span>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
               <h4 className="flex items-center gap-2 text-rose-300 font-bold mb-4">
                 <AlertCircle className="w-4 h-4" /> 矛盾/分歧
               </h4>
               <ul className="space-y-3">
                 {analysis.synthesis.contradictions.map((item, i) => (
                   <li key={i} className="text-sm text-gray-300 flex gap-2">
                     <span className="text-rose-500 font-bold shrink-0">·</span>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
               <h4 className="flex items-center gap-2 text-yellow-300 font-bold mb-4">
                 <Layers className="w-4 h-4" /> 信息差/缺失
               </h4>
               <ul className="space-y-3">
                 {analysis.synthesis.informationGaps.map((item, i) => (
                   <li key={i} className="text-sm text-gray-300 flex gap-2">
                     <span className="text-yellow-500 font-bold shrink-0">·</span>
                     {item}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {sections.map((section, idx) => (
          <motion.section 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-8 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all hover:bg-black/50 ${section.className}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white/10 shadow-inner">
                {section.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{section.title}</h3>
            </div>
            <div className="prose prose-sm prose-invert max-w-none text-gray-300 leading-relaxed">
              {typeof section.content === 'string' ? (
                <Markdown>{section.content}</Markdown>
              ) : (
                section.content
              )}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Logic Map Section */}
      {analysis.argumentVisualization && analysis.argumentVisualization.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 rounded-xl bg-white/10 ring-1 ring-white/20">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">深层论证模型</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Logic & Reasoning Visualization</p>
            </div>
          </div>
          <ArgumentGraph nodes={analysis.argumentVisualization} />
        </motion.div>
      )}

      {/* Critical Thinking Section */}
      {analysis.criticalThinking && analysis.criticalThinking.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <AlertTriangle className="w-32 h-32 text-rose-500" />
           </div>
           
           <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 rounded-xl bg-rose-500/10 ring-1 ring-rose-500/30">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">盲区与偏差分析</h3>
              <p className="text-[10px] text-rose-400/60 uppercase tracking-widest font-bold">Critical Thinking & Bias Detection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {analysis.criticalThinking.map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold tracking-wider uppercase">{item.type}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.name}</h4>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{item.description}</p>
                <div className="pt-4 border-t border-white/5">
                   <p className="text-xs text-rose-200/70 italic font-medium">
                     <span className="font-bold border-b border-rose-500/30 mr-1">应对建议：</span>
                     {item.mitigation}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Scenario Sandbox Section */}
      {analysis.suggestedSimulation && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-3xl shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
            <Play className="w-40 h-40 text-indigo-400 fill-current" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/40">
                <Play className="w-6 h-6 text-indigo-400 fill-current" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">实战模拟演练场</h3>
                <p className="text-[10px] text-indigo-400/60 uppercase tracking-widest font-bold">Interactive Scenario Sandbox</p>
              </div>
            </div>
            <div className="hidden sm:block">
               <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">
                 Experimental Feature
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-2 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-indigo-400/60 tracking-wider">当前模拟场景</label>
                 <p className="text-xl font-medium text-white leading-relaxed">{analysis.suggestedSimulation.scenario}</p>
               </div>
               <div className="flex flex-wrap gap-6">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                       <UserCircle className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold">AI 扮演角色</p>
                      <p className="text-sm font-semibold text-white/90">{analysis.suggestedSimulation.role}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                       <TrendingUp className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase font-bold">学习任务目标</p>
                      <p className="text-sm font-semibold text-white/90">{analysis.suggestedSimulation.goal}</p>
                    </div>
                 </div>
               </div>
            </div>
            <div className="flex flex-col justify-center">
              <button 
                onClick={() => onAskQuestion?.(`我想开始这个模拟演练：${analysis.suggestedSimulation.scenario}。你扮演${analysis.suggestedSimulation.role}，我的目标是${analysis.suggestedSimulation.goal}。我们开始吧！`)}
                className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                立刻进入演练
              </button>
              <p className="text-[10px] text-indigo-300/40 text-center mt-3 font-medium italic">点击后可在右侧教练窗口开启对抗式交谈</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actionable Playbook Section */}
      {analysis.playbook && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-3xl shadow-2xl relative"
        >
          <div className="flex items-center justify-between mb-8 relative z-10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30">
                <ClipboardList className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">个人“迁移手册”</h3>
                <p className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold">Actionable Playbook & SOP</p>
              </div>
            </div>
            <button 
              onClick={downloadPlaybook}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              导出 Markdown 手册
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
             <div className="space-y-4">
               <h4 className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/10">
                 <CalendarCheck className="w-4 h-4 text-blue-400" /> 第一周尝试
               </h4>
               <ul className="space-y-2">
                 {analysis.playbook.firstWeekActions.map((item, i) => (
                   <li key={i} className="text-sm text-gray-300 flex gap-2">
                     <span className="text-blue-400 font-bold tracking-tighter shrink-0">{i + 1}.</span>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
             <div className="space-y-4">
               <h4 className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/10">
                 <Ban className="w-4 h-4 text-rose-400" /> 戒掉这些习惯
               </h4>
               <ul className="space-y-2">
                 {analysis.playbook.habitsToQuit.map((item, i) => (
                   <li key={i} className="text-sm text-gray-300 flex gap-2">
                     <span className="text-rose-400 font-bold shrink-0">✕</span>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
             <div className="space-y-4">
               <h4 className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/10">
                 <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 复盘 5 问
               </h4>
               <ul className="space-y-2">
                 {analysis.playbook.reflectionQuestions.map((item, i) => (
                   <li key={i} className="text-sm text-gray-300 flex gap-2">
                     <span className="text-emerald-400 font-bold shrink-0">Q.</span>
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
             <div className="space-y-4">
               <h4 className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/10">
                 <Zap className="w-4 h-4 text-yellow-400" /> 生活脚本 (Actionable SOP)
               </h4>
               <ul className="space-y-3">
                 {analysis.playbook.lifeScripts?.map((item, i) => (
                   <li key={i} className="text-xs text-gray-400 border border-white/5 p-2 rounded-lg bg-white/5">
                     {item}
                   </li>
                 ))}
               </ul>
             </div>
          </div>

          {analysis.playbook.quickWin && (
            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    5分钟即时行动 (Quick Win)
                  </h4>
                  <p className="text-xs text-gray-400">{analysis.playbook.quickWin}</p>
                </div>
              </div>
              <div className="hidden sm:block text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Immediate Action Required
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-12 p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <ArrowRight className="w-6 h-6 text-white/80" />
          <h3 className="text-2xl font-bold text-white">思考与追问</h3>
        </div>
        <div className="flex flex-col gap-3">
          {analysis.nextSteps.map((step, i) => (
            <button 
              key={i} 
              onClick={() => onAskQuestion?.(step)}
              className="flex gap-3 items-center text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:text-white transition-all text-white/60" />
              <span className="font-medium text-gray-300 group-hover:text-white">{step}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
