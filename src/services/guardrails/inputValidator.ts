import { GuardrailRule, ValidatedInput, GuardrailViolation } from '@/types/guardrails';

export class InputValidator {
  private rules: GuardrailRule[] = [
    // Injection attacks
    {
      id: 'prompt_injection_1',
      name: 'Prompt Injection: System Prompt Override',
      category: 'input',
      enabled: true,
      pattern: /ignore\s+(all\s+)?instructions|forget\s+previous|system\s+prompt|you\s+are\s+now/i,
      severity: 'block',
      message: 'Prompt injection detected.',
    },

    // PII / Sensitive data
    {
      id: 'pii_credit_card',
      name: 'Credit Card Numbers',
      category: 'input',
      enabled: true,
      pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
      severity: 'escalate',
      message: 'Credit card number detected. For security, please do not share card details in chat. Use our secure payment page.',
    },

    {
      id: 'pii_full_ssn',
      name: 'SSN / National ID',
      category: 'input',
      enabled: true,
      pattern: /\b\d{3}-\d{2}-\d{4}\b/,
      severity: 'escalate',
      message: 'National ID detected. Please do not share sensitive identification numbers in chat.',
    },

    // Offensive content
    {
      id: 'offensive_slurs',
      name: 'Offensive Language',
      category: 'input',
      enabled: true,
      pattern: /\b(badword1|badword2|badword3)\b/i,
      severity: 'warning',
      message: 'Offensive language detected. Please keep conversation respectful.',
    },

    // Out-of-scope requests
    {
      id: 'out_of_scope_medical',
      name: 'Medical Advice Request',
      category: 'input',
      enabled: true,
      pattern: /cure|treat|diagnose|medical|doctor|prescription/i,
      checkFn: (input, context) => {
        // Allow "allergy" if in food context, block if medical context
        return input.includes('allergy') && !input.includes('food');
      },
      severity: 'escalate',
      message: 'This sounds like a medical question. Please consult a healthcare professional.',
    },

    // Rate limiting (handled separately but included for completeness)
    {
      id: 'rate_limit_messages',
      name: 'Rate Limit: Too Many Messages',
      category: 'input',
      enabled: true,
      checkFn: (input, context) => {
        const recentMessages = (context?.recentMessageCount as number) || 0;
        return recentMessages > 50; // 50 messages in last hour
      },
      severity: 'block',
      message: 'You have reached the message limit. Please try again later.',
    },
  ];

  /**
   * Validate user input
   */
  async validate(input: string, context?: Record<string, any>): Promise<ValidatedInput> {
    const violations: GuardrailViolation[] = [];
    let sanitized = input;
    let risk: 'low' | 'medium' | 'high' = 'low';

    // Check each rule
    for (const rule of this.rules.filter(r => r.enabled)) {
      let violated = false;

      if (rule.pattern && rule.pattern.test(input)) {
        violated = true;
      } else if (rule.checkFn && rule.checkFn(input, context)) {
        violated = true;
      }

      if (violated) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: rule.message,
          timestamp: new Date(),
          context,
        });

        // Update risk level
        if (rule.severity === 'block') risk = 'high';
        else if (rule.severity === 'escalate' && risk !== 'high') risk = 'medium';

        // Sanitize (remove PII, inject warnings)
        if (rule.pattern && (rule.severity === 'escalate' || rule.severity === 'block')) {
          sanitized = sanitized.replace(rule.pattern, '[REDACTED]');
        }
      }
    }

    const isValid = violations.filter(v => v.severity === 'block').length === 0;

    return {
      isValid,
      original: input,
      sanitized,
      violations,
      risk,
    };
  }

  /**
   * Add custom rule
   */
  addRule(rule: GuardrailRule): void {
    this.rules.push(rule);
  }

  /**
   * Disable rule by ID
   */
  disableRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) rule.enabled = false;
  }
}

export const inputValidator = new InputValidator();
