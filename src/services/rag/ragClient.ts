import Anthropic from '@anthropic-ai/sdk';
import { vectorStore } from '@/lib/vectordb';
import { RAGDocument, RAGContext } from '@/types/rag';

export class RAGClient {
  private llm: Anthropic;

  constructor() {
    this.llm = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Main RAG query: retrieve documents, generate response
   */
  async queryWithContext(
    userQuery: string,
    userLanguage: 'fr' | 'en' | 'nl' = 'fr',
    rewrite: boolean = true,
  ): Promise<{
    answer: string;
    context: RAGContext;
    sources: RAGDocument[];
    confidence: number;
  }> {
    const startTime = Date.now();

    // Step 1: Optionally rewrite query for better retrieval
    let retrievalQuery = userQuery;
    if (rewrite) {
      retrievalQuery = await this.rewriteQuery(userQuery, userLanguage);
    }

    // Step 2: Get embedding of query
    const queryEmbedding = await this.getEmbedding(retrievalQuery);

    // Step 3: Retrieve documents
    const retrievedDocs = await this.retrieveDocuments(queryEmbedding, userLanguage);

    // Step 4: Re-rank if needed (optional ML model or simple scoring)
    const rankedDocs = await this.rerankDocuments(userQuery, retrievedDocs);

    // Step 5: Build context for LLM
    const ragContext = this.buildRAGContext(userQuery, rankedDocs);

    // Step 6: Generate answer with LLM using context
    const { answer, confidence } = await this.generateAnswer(userQuery, ragContext, userLanguage);

    const retrievalTime = Date.now() - startTime;

    return {
      answer,
      context: ragContext,
      sources: rankedDocs.map(r => r.doc),
      confidence,
    };
  }

  /**
   * Rewrite user query for better retrieval
   */
  private async rewriteQuery(query: string, language: 'fr' | 'en' | 'nl'): Promise<string> {
    try {
      const response = await this.llm.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `You are a query rewriting assistant. Rewrite this ${language} customer support query for better document retrieval. Keep it concise and clear:

Query: "${query}"

Rewritten query (${language}):`,
          },
        ],
      });

      return response.content[0].type === 'text' ? response.content[0].text.trim() : query;
    } catch (error) {
      console.error('Query rewrite failed:', error);
      return query;
    }
  }

  /**
   * Get embedding from OpenAI
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        console.error('Embedding API error:', await response.text());
        throw new Error('Failed to generate embedding');
      }

      const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Retrieve relevant documents via hybrid search
   */
  private async retrieveDocuments(
    embedding: number[],
    language: 'fr' | 'en' | 'nl',
  ): Promise<Array<{ doc: RAGDocument; score: number }>> {
    try {
      const results = await vectorStore.hybridSearch(
        'query', // placeholder – we'd use the original query here
        embedding,
        6, // retrieve top 6
      );

      return results
        .map(r => ({
          doc: r as unknown as RAGDocument,
          score: r.similarity,
        }))
        .filter(r => r.score > 0.4); // threshold
    } catch (error) {
      console.error('Document retrieval failed:', error);
      return [];
    }
  }

  /**
   * Re-rank documents by relevance (optional ML reranker)
   */
  private async rerankDocuments(
    query: string,
    docs: Array<{ doc: RAGDocument; score: number }>,
  ): Promise<Array<{ doc: RAGDocument; score: number }>> {
    if (docs.length === 0) return [];

    try {
      const docSummaries = docs.map((d, idx) => `${idx + 1}. [${d.doc.title}] ${d.doc.content.substring(0, 200)}`).join('\n');

      const response = await this.llm.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: `Rank these documents by relevance to the query. Return only the ranked indices (1-indexed) separated by commas, highest relevance first.

Query: "${query}"

Documents:
${docSummaries}

Ranking:`,
          },
        ],
      });

      const ranking = response.content[0].type === 'text' ? response.content[0].text.trim().split(',').map(s => parseInt(s.trim())) : [];
      const reranked = ranking
        .map(idx => docs[idx - 1])
        .filter(Boolean)
        .concat(docs.filter((_, i) => !ranking.includes(i + 1)));

      return reranked;
    } catch (error) {
      console.error('Re-ranking failed:', error);
      return docs;
    }
  }

  /**
   * Build RAG context payload
   */
  private buildRAGContext(query: string, docs: Array<{ doc: RAGDocument; score: number }>): RAGContext {
    return {
      query,
      documents: docs.map(d => d.doc),
      totalScore: docs.reduce((sum, d) => sum + d.score, 0),
      retrievalStrategy: 'hybrid',
    };
  }

  /**
   * Generate final answer using Claude with RAG context
   */
  private async generateAnswer(
    query: string,
    context: RAGContext,
    language: 'fr' | 'en' | 'nl',
  ): Promise<{ answer: string; confidence: number }> {
    try {
      const contextStr = context.documents
        .map((d, i) => `[${i + 1}] **${d.title}**\n${d.content}`)
        .join('\n\n');

      const systemPrompt = `You are Tasty Food support assistant. Answer using ONLY the provided context documents. If the answer is not in the context, say "I don't have this information. Let me escalate to our team."

Language: ${language}
Current date: ${new Date().toISOString()}`;

      const response = await this.llm.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.3, // low for factual answers
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Question: ${query}\n\nContext documents:\n${contextStr}`,
          },
        ],
      });

      const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response.';
      const confidence = context.totalScore / Math.max(1, context.documents.length); // average relevance

      return { answer, confidence };
    } catch (error) {
      console.error('Answer generation failed:', error);
      return { 
        answer: 'I\'m having trouble accessing information right now. Let me connect you with our support team.',
        confidence: 0
      };
    }
  }
}

export const ragClient = new RAGClient();
