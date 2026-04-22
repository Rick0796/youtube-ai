export interface VideoData {
  title: string;
  author: string;
  thumbnail: string;
  transcript: string;
  hasTranscript?: boolean;
  videoId: string;
}

export interface LogicNode {
  id: string;
  type: 'premise' | 'evidence' | 'conclusion' | 'counterargument';
  content: string;
  connectsTo?: string[];
}

export interface CriticalThinkingItem {
  type: string;
  name: string;
  description: string;
  mitigation: string;
}

export interface AnalysisStructure {
  coreMeaning: string;
  bottomLine?: string;
  structureMap: string;
  keyConcepts: Array<{ 
    name: string; 
    videoContext: string; 
    plainMapping: string; 
    aiSupplement: string;
  }>;
  mainClaims: string[];
  argumentChain: string;
  misconceptions: string[];
  caseStudies: string[];
  applicationSuggestions: string[];
  nextSteps: string[];
  logicAnalysis: {
    whatIsProven: string;
    reasoningChain: string;
    assumptions: string[];
    controversies: string[];
    persuasionReason: string;
    hardEvidence?: string;
  };
  coachInsights: string;
  argumentVisualization: LogicNode[];
  criticalThinking: CriticalThinkingItem[];
  mentalModels?: Array<{ name: string; description: string }>;
  suggestedSimulation: {
    scenario: string;
    role: string;
    goal: string;
  };
  playbook?: {
    firstWeekActions: string[];
    habitsToQuit: string[];
    reflectionQuestions: string[];
    lifeScripts?: string[];
    quickWin?: string;
  };
  synthesis?: {
    consensus: string[];
    contradictions: string[];
    informationGaps: string[];
  };
}

export interface HistoryItem {
  id: string;
  source: VideoData;
  analysis: AnalysisStructure;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
