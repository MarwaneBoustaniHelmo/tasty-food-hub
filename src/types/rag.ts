/**
 * Types pour le système RAG (Retrieval-Augmented Generation)
 */

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: 'faq' | 'policy' | 'procedure' | 'blog' | 'legal' | 'menu';
  language: 'fr' | 'en' | 'nl';
  tags: string[];
  branch?: string;
  category?: string;
  lastUpdated: Date;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface RAGQueryResult {
  documents: Array<{
    doc: RAGDocument;
    relevanceScore: number;
    snippet: string; // passage extrait
  }>;
  rawQuery: string;
  rewrittenQuery?: string;
  retrievalTime: number; // ms
}

export interface RAGContext {
  query: string;
  documents: RAGDocument[];
  totalScore: number;
  retrievalStrategy: 'semantic' | 'hybrid' | 'reranking';
}

export interface KnowledgeBaseStats {
  totalDocuments: number;
  languageDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  lastSync: Date;
  vectorDimensionality: number;
}
