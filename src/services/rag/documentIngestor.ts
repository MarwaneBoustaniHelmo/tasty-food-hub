import { vectorStore } from '@/lib/vectordb';
import { RAGDocument } from '@/types/rag';
import * as crypto from 'crypto';

export class DocumentIngestor {
  private chunkSize = 500; // tokens
  private chunkOverlap = 50; // tokens

  /**
   * Ingest a document (e.g., FAQ, policy, menu)
   */
  async ingestDocument(
    title: string,
    content: string,
    source: 'faq' | 'policy' | 'procedure' | 'blog' | 'legal' | 'menu',
    language: 'fr' | 'en' | 'nl',
    tags: string[] = [],
    metadata?: Record<string, any>,
  ): Promise<RAGDocument[]> {
    // Step 1: Split into chunks
    const chunks = this.chunkContent(content);

    // Step 2: Generate embeddings for each chunk
    const ingestedDocs: RAGDocument[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const docId = this.generateId(title, i);

      const doc: RAGDocument = {
        id: docId,
        title: `${title} (Part ${i + 1})`,
        content: chunk,
        source,
        language,
        tags: [...tags, source],
        lastUpdated: new Date(),
        metadata,
      };

      // Get embedding
      const embedding = await this.getEmbedding(chunk);
      doc.embedding = embedding;

      // Store in vector DB
      await vectorStore.indexDocument(docId, chunk, embedding, {
        sourceTitle: title,
        partNumber: i + 1,
        totalParts: chunks.length,
        source,
        language,
        tags,
        ...metadata,
      });

      ingestedDocs.push(doc);
    }

    console.log(`Ingested ${title} into ${ingestedDocs.length} chunks`);
    return ingestedDocs;
  }

  /**
   * Ingest batch of documents
   */
  async ingestBatch(documents: Array<{
    title: string;
    content: string;
    source: 'faq' | 'policy' | 'procedure' | 'blog' | 'legal' | 'menu';
    language: 'fr' | 'en' | 'nl';
    tags?: string[];
  }>): Promise<void> {
    for (const doc of documents) {
      await this.ingestDocument(doc.title, doc.content, doc.source, doc.language, doc.tags);
    }
    console.log(`Batch ingestion complete: ${documents.length} documents processed`);
  }

  /**
   * Split content into overlapping chunks
   */
  private chunkContent(content: string): string[] {
    const sentences = content.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const tokens = sentence.split(/\s+/).length;
      const currentTokens = currentChunk.split(/\s+/).length;

      if (currentTokens + tokens > this.chunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        // Start new chunk with overlap
        const words = currentChunk.split(/\s+/);
        currentChunk = words.slice(-this.chunkOverlap).join(' ') + ' ' + sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  /**
   * Generate embedding via OpenAI
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

      if (!response.ok) throw new Error('Embedding failed');
      const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Generate unique doc ID
   */
  private generateId(title: string, partNumber: number): string {
    const hash = crypto.createHash('sha256').update(title + partNumber).digest('hex').substring(0, 8);
    return `${title.toLowerCase().replace(/\s+/g, '-')}-${partNumber}-${hash}`;
  }
}

export const documentIngestor = new DocumentIngestor();
