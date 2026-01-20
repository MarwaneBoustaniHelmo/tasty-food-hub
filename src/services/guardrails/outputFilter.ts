import { ValidatedOutput, GuardrailViolation } from '@/types/guardrails';

export class OutputFilter {
  private bannedPatterns = [
    // Hallucinated claims
    /I can (definitely|absolutely) promise.*refund/i,
    /we will (definitely|absolutely) deliver.*hours/i,

    // Generic medical advice
    /take (aspirin|ibuprofen|paracetamol)/i,
    /drink (more|lots of) water/i,

    // Competitor recommendations
    /you should try (McDonald|KFC|Subway|competitor)/i,

    // Personal information generation
    /your credit card.*is.*\d{4}/i,
  ];

  private escalationTriggers = [
    /refund.*not possible/i,
    /we cannot (help|assist)/i,
    /I (don't|don't|cannot) know/i,
    /out of (my|our) hands/i,
  ];

  /**
   * Filter LLM output for safety and quality
   */
  async filter(
    output: string,
    context?: {
      query?: string;
      ragDocuments?: string[];
      userSentiment?: 'positive' | 'neutral' | 'negative';
    },
  ): Promise<ValidatedOutput> {
    const violations: GuardrailViolation[] = [];
    let filtered = output;
    let shouldEscalate = false;
    let escalationReason: string | undefined;

    // Check for hallucinations
    for (const pattern of this.bannedPatterns) {
      if (pattern.test(output)) {
        violations.push({
          ruleId: 'hallucination_' + pattern.source,
          ruleName: 'Hallucination Detection',
          severity: 'block',
          message: 'Output contains unsupported claims.',
          timestamp: new Date(),
        });
        filtered = this.sanitizeHallucination(filtered, pattern);
        shouldEscalate = true;
        escalationReason = 'Potential hallucination detected';
      }
    }

    // Check for escalation triggers
    for (const trigger of this.escalationTriggers) {
      if (trigger.test(output)) {
        violations.push({
          ruleId: 'escalation_trigger_' + trigger.source,
          ruleName: 'Escalation Trigger',
          severity: 'escalate',
          message: 'Response suggests customer may be unsatisfied.',
          timestamp: new Date(),
        });
        shouldEscalate = true;
        if (!escalationReason) escalationReason = 'Customer appears unsatisfied';
      }
    }

    // If RAG context available, check if response matches it
    if (context?.ragDocuments && context.ragDocuments.length > 0) {
      const isConsistent = await this.checkConsistency(output, context.ragDocuments);
      if (!isConsistent) {
        violations.push({
          ruleId: 'rag_consistency',
          ruleName: 'RAG Context Consistency',
          severity: 'warning',
          message: 'Response may not be consistent with knowledge base.',
          timestamp: new Date(),
        });
        shouldEscalate = true;
        escalationReason = 'Response consistency with KB needs verification';
      }
    }

    const isValid = violations.filter(v => v.severity === 'block').length === 0;

    return {
      isValid,
      original: output,
      filtered,
      violations,
      shouldEscalate,
      escalationReason,
    };
  }

  /**
   * Remove hallucinated claims
   */
  private sanitizeHallucination(text: string, pattern: RegExp): string {
    return text.replace(pattern, '[This claim cannot be verified. Please check with our support team.]');
  }

  /**
   * Check if response is consistent with RAG context
   */
  private async checkConsistency(response: string, ragDocs: string[]): Promise<boolean> {
    // Simple heuristic: if response uses quotes or specific facts, they should align
    // with RAG docs. For production, use more sophisticated similarity check.
    const responseKeywords = response.split(/\s+/).filter(w => w.length > 4);
    const docKeywords = ragDocs.join(' ').split(/\s+/).filter(w => w.length > 4);

    const overlap = responseKeywords.filter(w => docKeywords.includes(w)).length;
    const consistency = overlap / responseKeywords.length;

    return consistency > 0.3; // 30% keyword overlap threshold
  }
}

export const outputFilter = new OutputFilter();
