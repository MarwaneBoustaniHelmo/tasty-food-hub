export interface GuardrailRule {
  id: string;
  name: string;
  category: 'input' | 'output' | 'context' | 'escalation';
  enabled: boolean;
  pattern?: RegExp;
  checkFn?: (input: string, context?: Record<string, any>) => boolean;
  severity: 'warning' | 'block' | 'escalate';
  message: string;
}

export interface GuardrailViolation {
  ruleId: string;
  ruleName: string;
  severity: 'warning' | 'block' | 'escalate';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ValidatedInput {
  isValid: boolean;
  original: string;
  sanitized: string;
  violations: GuardrailViolation[];
  risk: 'low' | 'medium' | 'high';
}

export interface ValidatedOutput {
  isValid: boolean;
  original: string;
  filtered: string;
  violations: GuardrailViolation[];
  shouldEscalate: boolean;
  escalationReason?: string;
}

export interface SafetyContext {
  userEmail?: string;
  conversationHistory: string[];
  intent?: string;
  userSentiment?: 'positive' | 'neutral' | 'negative';
}
