import { inputValidator } from './inputValidator';
import { outputFilter } from './outputFilter';
import { GuardrailViolation } from '@/types/guardrails';

export class GuardrailsEngine {
  /**
   * Run full guardrail pipeline: input validation + output filtering
   */
  async processMessage(
    userMessage: string,
    llmOutput: string,
    context?: {
      userEmail?: string;
      conversationHistory?: string[];
      ragDocuments?: string[];
    },
  ): Promise<{
    approved: boolean;
    userMessage: { isValid: boolean; sanitized: string; violations: GuardrailViolation[] };
    llmOutput: { isValid: boolean; filtered: string; shouldEscalate: boolean; violations: GuardrailViolation[] };
    escalate: boolean;
    escalationReason?: string;
  }> {
    // Validate input
    const inputValidation = await inputValidator.validate(userMessage, { ...context, recentMessageCount: 0 });

    if (!inputValidation.isValid) {
      return {
        approved: false,
        userMessage: {
          isValid: false,
          sanitized: inputValidation.sanitized,
          violations: inputValidation.violations,
        },
        llmOutput: { isValid: true, filtered: '', shouldEscalate: false, violations: [] },
        escalate: inputValidation.violations.some(v => v.severity === 'escalate'),
        escalationReason: inputValidation.violations[0]?.message,
      };
    }

    // Filter output
    const outputValidation = await outputFilter.filter(llmOutput, {
      query: userMessage,
      ragDocuments: context?.ragDocuments,
    });

    return {
      approved: outputValidation.isValid && !outputValidation.shouldEscalate,
      userMessage: {
        isValid: inputValidation.isValid,
        sanitized: inputValidation.sanitized,
        violations: inputValidation.violations,
      },
      llmOutput: {
        isValid: outputValidation.isValid,
        filtered: outputValidation.filtered,
        shouldEscalate: outputValidation.shouldEscalate,
        violations: outputValidation.violations,
      },
      escalate: outputValidation.shouldEscalate,
      escalationReason: outputValidation.escalationReason,
    };
  }
}

export const guardrailsEngine = new GuardrailsEngine();
