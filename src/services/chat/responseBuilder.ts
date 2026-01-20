/**
 * Response Builder
 * Constructs formatted responses with proper structure
 */

export interface ResponsePart {
  type: 'text' | 'action' | 'suggestion' | 'source';
  content: string;
  metadata?: Record<string, any>;
}

export class ResponseBuilder {
  private parts: ResponsePart[] = [];

  /**
   * Add main text response
   */
  addText(text: string): this {
    this.parts.push({ type: 'text', content: text });
    return this;
  }

  /**
   * Add action suggestion (e.g., "Track your order")
   */
  addAction(action: string, metadata?: Record<string, any>): this {
    this.parts.push({ type: 'action', content: action, metadata });
    return this;
  }

  /**
   * Add follow-up suggestion
   */
  addSuggestion(suggestion: string): this {
    this.parts.push({ type: 'suggestion', content: suggestion });
    return this;
  }

  /**
   * Add source citation
   */
  addSource(source: string, metadata?: Record<string, any>): this {
    this.parts.push({ type: 'source', content: source, metadata });
    return this;
  }

  /**
   * Build final response
   */
  build(): { response: string; parts: ResponsePart[] } {
    const textParts = this.parts.filter(p => p.type === 'text').map(p => p.content);
    const actions = this.parts.filter(p => p.type === 'action').map(p => p.content);
    const suggestions = this.parts.filter(p => p.type === 'suggestion').map(p => p.content);

    let response = textParts.join('\n\n');

    if (actions.length > 0) {
      response += '\n\n' + actions.join('\n');
    }

    if (suggestions.length > 0) {
      response += '\n\nSuggestions:\n' + suggestions.map(s => `• ${s}`).join('\n');
    }

    return {
      response,
      parts: this.parts,
    };
  }

  /**
   * Build with sources
   */
  buildWithSources(): { response: string; sources: string[] } {
    const { response } = this.build();
    const sources = this.parts.filter(p => p.type === 'source').map(p => p.content);

    return { response, sources };
  }
}

/**
 * Helper function to format response with suggestions
 */
export function formatResponseWithSuggestions(
  mainText: string,
  suggestions: string[],
): string {
  const builder = new ResponseBuilder();
  builder.addText(mainText);
  suggestions.forEach(s => builder.addSuggestion(s));
  return builder.build().response;
}
