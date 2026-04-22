import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisStructure } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Please configure GEMINI_API_KEY to use the analysis feature.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export async function analyzeVideo(transcript: string, title: string, author: string, hasTranscript: boolean = true): Promise<AnalysisStructure> {
  const ai = getAiClient();
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    你是一位顶级的视频内容深度学习分析师和成长教练。
    你不是简单的总结者，而是一个遵循“四层分析架构”的超级研究助手：
    1. **定位层 (Positioning)**：基于视频 ID (${title} - ${author}) 锁定真相源，进行多维信息锁定。
    2. **获取层 (Acquisition)**：整合转录文本、元数据及公域语料，确保原始素材的真实性。
    3. **规范化层 (Normalization)**：将杂乱素材转化为结构化的知识中间件（metadata/transcript/segments）。
    4. **学习分析层 (Analysis)**：进行四步理解——【切分】语义分段、【抽取】核心推演、【校验】一致性检查、【生成】按需输出。
    
    你的任务是将这些原始信息转化为深度学习、结构化拆解、可追问学习和成长迁移的应用报告。报告内容必须极其详尽、专业且富有洞见，避免任何表层化、模板化的描述。
    
    【极其重要】无论视频内容是哪种语言，你**必须**全部使用简体中文输出所有分析和洞察！绝不允许出现大段的其他语言分析（可以用括号标注关键术语的外语原文）。
    
    输出必须是 JSON 格式，且符合指定的 Schema。不要包含任何额外的 Markdown 格式（如 \`\`\`json）。
    
    分析维度：
    1. coreMeaning: 【核心命题】视频的核心命题和真正想表达的底层逻辑。要求：必须整理总结出至少 500 字以上的高质量、深度的完整内容，严禁寥寥数语，要体现出对视频灵魂的深度解剖。
    2. bottomLine: 一句话总结。用极其辛辣、精辟的一句话揭示核心洞察，打破原有认知的那个点。
    3. structureMap: 【叙事逻辑流/结构地图】不要简单列出标题，要详尽地描述“知识是如何生长的”，内容要充实，解释逻辑如何从一个点演进到下一个点，体现完整的思维动线。要求：内容必须详尽丰富，篇幅要大，不仅要有骨架，还要有血有肉，形成一张完整的、深度的知识网络图景。
    3. keyConcepts: 【核心概念补丁】必须包含三个维度：视频中的用法、白话类比映射、以及AI基于全局知识库补充的底层原理。
    4. mainClaims: 主要主张。
    5. argumentChain: 推理链条，它是如何一步步推导出来的。
    6. misconceptions: 容易被误解的地方。
    7. caseStudies: 延展案例。
    8. applicationSuggestions: 在工作和生活中的迁移应用建议。
    9. nextSteps: 下一步值得追问的问题。
    10. logicAnalysis: 深层逻辑分析。必须包含：真正想证明什么、推理路径描述、核心论证硬核（The Hard Evidence，复原视频中最具代表性的具体推演、矩阵或案例逻辑）、依赖的假设、争议点、说服力来源。
    11. coachInsights: 成长教练式的洞察。
    12. argumentVisualization: 逻辑地图节点。
    13. criticalThinking: 批判性思维助手。
    14. mentalModels: 【思维模型透镜】识别视频中应用或体现的经典思维模型（如第一性原理、奥卡姆剃刀、帕累托法则等），并解释其在视频中的体现。
    15. playbook: 【行动迁移手册】必须包含具体的“生活脚本（Actionable SOPs）”，以及一个“五分钟即时行动（Quick Win）”。
    ## 核心约束与“四层分析法”
    1. **定位层校验**：确认视频标题《${title}》和作者 ${author}。
    2. **获取层异常处理**：若 transcript 包含“【系统提示：无法获取字幕】”，你作为“深度研究助手”，必须启动**主动搜索模式**。
    3. **主动搜索指令**：使用 \`googleSearch\` 搜索该视频的“full transcript”、“video summary”、“script”或“key points”。重点搜索该作者（如 Professor Jiang）的官方博客或知乎/B站专栏。
    4. **规范化合成**：将搜索到的零散信息规范化为你习惯的分析结构。
    5. **诚实声明**：在 coreMeaning 顶部注明：“本分析基于公域信息检索合成（Syntopical Synthesis），已通过标题和作者校验。”
    
    只有在全网搜索后依然无法找到任何实质性内容时，才如实告知无法分析。
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      coreMeaning: { type: Type.STRING },
      structureMap: { type: Type.STRING },
      keyConcepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            videoContext: { type: Type.STRING },
            plainMapping: { type: Type.STRING },
            aiSupplement: { type: Type.STRING }
          },
          required: ["name", "videoContext", "plainMapping", "aiSupplement"]
        }
      },
      mainClaims: { type: Type.ARRAY, items: { type: Type.STRING } },
      argumentChain: { type: Type.STRING },
      misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
      caseStudies: { type: Type.ARRAY, items: { type: Type.STRING } },
      applicationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      logicAnalysis: {
        type: Type.OBJECT,
        properties: {
          whatIsProven: { type: Type.STRING },
          reasoningChain: { type: Type.STRING },
          hardEvidence: { type: Type.STRING },
          assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          controversies: { type: Type.ARRAY, items: { type: Type.STRING } },
          persuasionReason: { type: Type.STRING }
        },
        required: ["whatIsProven", "reasoningChain", "hardEvidence", "assumptions", "controversies", "persuasionReason"]
      },
      coachInsights: { type: Type.STRING },
      argumentVisualization: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["premise", "evidence", "conclusion", "counterargument"] },
            content: { type: Type.STRING },
            connectsTo: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "type", "content"]
        }
      },
      criticalThinking: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            mitigation: { type: Type.STRING }
          },
          required: ["type", "name", "description", "mitigation"]
        }
      },
      mentalModels: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      },
      suggestedSimulation: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING },
          role: { type: Type.STRING },
          goal: { type: Type.STRING }
        },
        required: ["scenario", "role", "goal"]
      },
      playbook: {
        type: Type.OBJECT,
        properties: {
          firstWeekActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          habitsToQuit: { type: Type.ARRAY, items: { type: Type.STRING } },
          reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          lifeScripts: { type: Type.ARRAY, items: { type: Type.STRING } },
          quickWin: { type: Type.STRING }
        },
        required: ["firstWeekActions", "habitsToQuit", "reflectionQuestions", "lifeScripts", "quickWin"]
      },
      synthesis: {
        type: Type.OBJECT,
        properties: {
          consensus: { type: Type.ARRAY, items: { type: Type.STRING } },
          contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
          informationGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    required: [
      "coreMeaning", "structureMap", "keyConcepts", "mainClaims", "argumentChain", 
      "misconceptions", "caseStudies", "applicationSuggestions", "nextSteps", 
      "logicAnalysis", "coachInsights", "argumentVisualization", "criticalThinking",
      "suggestedSimulation", "playbook"
    ]
  };

  const contents = hasTranscript 
    ? `【已就绪：获取层内容成功】\n视频标题: ${title}\n作者: ${author}\n\n字幕内容:\n${transcript}`
    : `【获取层异常：字幕缺失】\n视频标题: ${title}\n作者: ${author}\n\n当前无法直接通过接口获取字幕。你现在必须切换到“公域搜索模式”。\n请使用 Google Search 搜索该视频的具体内容摘要、博弈矩阵、核心观点或转录文本。基于搜索到的真实资料进行深度拆解，严禁凭空臆造。`;

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function askCoach(transcript: string, history: any[], question: string, analysisContext?: AnalysisStructure) {
  const ai = getAiClient();
  const model = "gemini-3-flash-preview";
  
  const analysisData = analysisContext ? `
【已捕获的深度拆解干货】:
- 核心命题: ${analysisContext.coreMeaning}
- 叙事逻辑流: ${analysisContext.structureMap}
- 论证硬核: ${analysisContext.logicAnalysis.hardEvidence}
- 思维模型: ${analysisContext.mentalModels?.map(m => m.name).join(', ')}
- 可视化节点: ${analysisContext.argumentVisualization?.map(n => n.content).join(' -> ')}
- 教练私房话: ${analysisContext.coachInsights}
` : "目前尚未生成有效的分析报告。";

  const systemInstruction = `
    你是一位顶级成长型学习伴侣和全能教练，具备“研究助手”级别的深度分析能力。
    
    【核心原则】
    - **严禁因为“原始字幕缺失”而拒绝回答**：如果你看到了下方的“【已捕获的深度拆解干货】”，说明“分析层”已经为你拿到了核心逻辑。你必须直接基于这些干货回答用户，假装你已经通过某种方式读懂了视频。
    - **知识读取优先级**：1. 深度分析报告内容 -> 2. 主动调用 googleSearch 搜索 -> 3. 实在无解时再引导用户。
    
    【异常处理：全链路信息缺失】
    只有在“深度分析报告”为空且尝试“googleSearch”后依然获取不到任何信息时，你才**必须**回复以下内容：
    “你好！我是你的深度学习教练。我已注意到由于 YouTube 的保护机制，该视频的原始字幕暂时无法直接读取。别担心，这正是我的‘研究助手’模式大显身手的时候。为了能为你执行【极简拆解】并把干货揉碎了讲给你听，请告诉我这个视频的‘标题’或者‘分享链接’。一旦你提供了视频名称，我将立即通过搜索引擎和语义推演为你完成以下动作：
    - 【极简拆解】：我会绕开所有专业术语，用最通俗的例子告诉你这视频到底说了啥。
    - 【知识迁移】：我会告诉你这些内容在你的工作或生活中能怎么用。
    - 【模拟演练场】：我会为你设计一个极具挑战性的实战场景，让你在对抗中真正掌握这些知识。
    请直接在下方回复视频标题或链接，我们马上开始！”

    ${analysisData}
    
    你的风格应该是启发式的、深度且极具迁移价值的。回复全部使用简体中文。
    
    支持并主动引导以下“深度学习”模式：
    - **【极简拆解】**：化繁为简，用最高通俗易懂的语言重讲一遍。
    - **【模拟演练场 (Scenario Sandbox)】**：这是你的杀手锏。将视频中的理论转化为真实的现实场景，并扮演其中的对立角色与用户进行对抗式模拟。
    - **【二阶挑战】**：反过来挑战视频中的观点，引导用户进行辩证思考。
    - **【知识迁移】**：结合用户的工作/生活场景提供建议。
  `;

  const chat = ai.chats.create({
    model,
    config: { 
      systemInstruction,
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true }
    },
    history: history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
  });

  // Include transcript as context in the first message if history is empty
  const context = history.length === 0 ? `视频背景内容:\n${transcript}\n\n` : "";
  const response = await chat.sendMessage({
    message: `${context}我的问题是: ${question}`
  });

  return response.text;
}
