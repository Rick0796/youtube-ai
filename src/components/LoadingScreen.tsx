import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Radio, Globe, Shield } from 'lucide-react';

export function LoadingScreen() {
  const steps = [
    { icon: <Globe className="w-4 h-4" />, text: "正在与 YouTube 神经中枢建立连接..." },
    { icon: <Shield className="w-4 h-4" />, text: "安全提取加密字幕流与元数据..." },
    { icon: <Cpu className="w-4 h-4" />, text: "启动本体论推理引擎进行深度解析..." },
    { icon: <Zap className="w-4 h-4" />, text: "构建多维逻辑地图与迁移手册..." },
    { icon: <Radio className="w-4 h-4" />, text: "同步专家教练的批判性洞察..." }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6">
      <div className="relative w-32 h-32 mb-12">
        {/* Orbital Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-10px] border border-blue-500/20 rounded-full"
        />
        
        {/* Core Pulsing Glow */}
        <div className="absolute inset-4 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Central Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 10, repeat: Infinity, ease: "linear" }
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]"
          >
            <Cpu className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </div>

      <div className="text-center space-y-6 max-w-lg">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">构筑深度认知报告</h3>
          <div className="flex justify-center gap-1">
             {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ opacity: [0.2, 1, 0.2] }}
                 transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                 className="w-1.5 h-1.5 rounded-full bg-indigo-400"
               />
             ))}
          </div>
        </div>

        <div className="space-y-3 pt-4">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.8 }}
              className="flex items-center gap-3 text-sm font-medium"
            >
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-indigo-400">
                {step.icon}
              </div>
              <span className="text-white/60 text-left">{step.text}</span>
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: idx === steps.length - 1 ? Infinity : 1 }}
                className="ml-auto"
              >
                <div className="w-1 h-1 rounded-full bg-indigo-400" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
        Metacognition Engine v2.0 // Active
      </div>
    </div>
  );
}
