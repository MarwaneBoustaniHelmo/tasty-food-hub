/**
 * Types for orchestration layer
 */

export interface OrchestrationStrategy {
  type: 'rag_only' | 'rag_with_tools' | 'tools_only' | 'direct_llm';
  reason: string;
  confidence: number;
}

export interface ChatProcessingResult {
  response: string;
  escalate: boolean;
  escalationReason?: string;
  usedRAG: boolean;
  usedTools: boolean;
  metadata: Record<string, any>;
}

export interface ProcessingPipeline {
  steps: Array<{
    name: string;
    duration: number;
    success: boolean;
    output?: any;
  }>;
  totalDuration: number;
}
