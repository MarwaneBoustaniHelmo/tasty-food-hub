import { createClient } from '@supabase/supabase-js';

export class VectorStore {
  private supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  );

  /**
   * Store document with embedding
   */
  async indexDocument(
    id: string,
    content: string,
    embedding: number[],
    metadata: Record<string, any>,
  ): Promise<void> {
    await this.supabase
      .from('rag_documents')
      .upsert({
        id,
        content,
        embedding,
        metadata,
        indexed_at: new Date().toISOString(),
      });
  }

  /**
   * Semantic search via pgvector
   */
  async semanticSearch(
    queryEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.5,
  ): Promise<Array<{ id: string; content: string; metadata: Record<string, any>; similarity: number }>> {
    const { data, error } = await this.supabase.rpc('search_documents', {
      query_embedding: queryEmbedding,
      match_count: limit,
      match_threshold: threshold,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Hybrid search: semantic + BM25 (full-text)
   */
  async hybridSearch(
    query: string,
    queryEmbedding: number[],
    limit: number = 5,
  ): Promise<Array<{ id: string; content: string; similarity: number; bm25_rank: number }>> {
    // Combine semantic similarity and BM25 ranking
    const semanticResults = await this.semanticSearch(queryEmbedding, limit);

    // BM25 via Postgres FTS
    const { data: bm25Results } = await this.supabase
      .from('rag_documents')
      .select('id, content')
      .textSearch('content', query)
      .limit(limit);

    // Merge and re-rank
    const mergedMap = new Map<string, any>();
    semanticResults.forEach((r, idx) => {
      mergedMap.set(r.id, { ...r, semantic_rank: idx });
    });
    bm25Results?.forEach((r, idx) => {
      if (mergedMap.has(r.id)) {
        mergedMap.get(r.id).bm25_rank = idx;
      } else {
        mergedMap.set(r.id, { ...r, bm25_rank: idx });
      }
    });

    // Combine scores
    return Array.from(mergedMap.values())
      .sort((a, b) => {
        const scoreA = (a.semantic_rank || 10) * 0.6 + (a.bm25_rank || 10) * 0.4;
        const scoreB = (b.semantic_rank || 10) * 0.6 + (b.bm25_rank || 10) * 0.4;
        return scoreA - scoreB;
      })
      .slice(0, limit);
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<{ id: string; content: string; metadata: any } | null> {
    const { data } = await this.supabase.from('rag_documents').select('*').eq('id', id).single();
    return data;
  }

  /**
   * List all documents (for stats / admin)
   */
  async listDocuments(filters?: { source?: string; language?: string }): Promise<any[]> {
    let query = this.supabase.from('rag_documents').select('*');
    if (filters?.source) query = query.eq('source', filters.source);
    if (filters?.language) query = query.eq('language', filters.language);
    const { data } = await query;
    return data || [];
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    await this.supabase.from('rag_documents').delete().eq('id', id);
  }

  /**
   * Get KB stats
   */
  async getStats(): Promise<{ total: number; bySource: Record<string, number>; byLanguage: Record<string, number> }> {
    const docs = await this.listDocuments();
    return {
      total: docs.length,
      bySource: docs.reduce((acc, d) => ({ ...acc, [d.source]: (acc[d.source] || 0) + 1 }), {}),
      byLanguage: docs.reduce((acc, d) => ({ ...acc, [d.language]: (acc[d.language] || 0) + 1 }), {}),
    };
  }
}

export const vectorStore = new VectorStore();
