// ============================================================================
// PROMPT INJECTION DETECTION
// ============================================================================

interface InjectionCheck {
  isSuspicious: boolean;
  reason?: string;
  confidence: "low" | "medium" | "high";
}

export function detectPromptInjection(message: string): InjectionCheck {
  if (typeof message !== "string") {
    return { isSuspicious: true, reason: "Invalid input type", confidence: "high" };
  }

  const lowerMessage = message.toLowerCase();

  // HIGH CONFIDENCE PATTERNS (Definite injection attempts)
  const highConfidencePatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
    /disregard\s+(all\s+)?(previous|prior)\s+instructions?/i,
    /forget\s+(all\s+)?(previous|prior)\s+instructions?/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /you\s+are\s+now\s+(a|an)\s+/i,
    /<\s*script/i,
    /javascript\s*:/i,
    /\{\{.*\}\}/i, // Template injection
    /<\s*iframe/i,
    /eval\s*\(/i,
    /\bon(load|error|click)\s*=/i,
  ];

  for (const pattern of highConfidencePatterns) {
    if (pattern.test(message)) {
      return {
        isSuspicious: true,
        reason: `High-confidence injection pattern: ${pattern.source}`,
        confidence: "high",
      };
    }
  }

  // MEDIUM CONFIDENCE PATTERNS (Likely malicious)
  const mediumConfidencePatterns = [
    /act\s+as\s+if/i,
    /pretend\s+(you|to)\s+are/i,
    /role.*play/i,
    /(show|reveal|tell)\s+me\s+(the|your)\s+(system\s+)?prompt/i,
    /what\s+(are|is)\s+your\s+instructions?/i,
    /bypass\s+your/i,
    /override\s+your/i,
    /your\s+(rules|guidelines)\s+(are|should)/i,
  ];

  for (const pattern of mediumConfidencePatterns) {
    if (pattern.test(message)) {
      return {
        isSuspicious: true,
        reason: `Medium-confidence injection pattern: ${pattern.source}`,
        confidence: "medium",
      };
    }
  }

  // SUSPICIOUS ENCODING (Base64, URL encoding abuse)
  if (message.match(/[A-Za-z0-9+\/]{40,}={0,2}/)) {
    return {
      isSuspicious: true,
      reason: "Suspicious Base64-like encoding detected",
      confidence: "medium",
    };
  }

  // EXCESSIVE REPETITION (common in injection attempts)
  const words = message.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
    return {
      isSuspicious: true,
      reason: "Excessive word repetition detected",
      confidence: "low",
    };
  }

  // SUSPICIOUS CHARACTERS (non-printable, control characters)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)) {
    return {
      isSuspicious: true,
      reason: "Control characters detected",
      confidence: "medium",
    };
  }

  // EXCESSIVE LENGTH (potential DoS)
  if (message.length > 5000) {
    return {
      isSuspicious: true,
      reason: "Message exceeds reasonable length",
      confidence: "high",
    };
  }

  return { isSuspicious: false, confidence: "low" };
}

// ============================================================================
// CONTENT VALIDATION (Check for malicious content)
// ============================================================================

export function validateMessageContent(message: string): {
  isValid: boolean;
  reason?: string;
} {
  // Check if message is empty or only whitespace
  if (!message || message.trim().length === 0) {
    return { isValid: false, reason: "Message cannot be empty" };
  }

  // Check minimum length (prevent spam of single characters)
  if (message.trim().length < 2) {
    return { isValid: false, reason: "Message too short" };
  }

  // Check maximum length
  if (message.length > 2000) {
    return { isValid: false, reason: "Message too long (max 2000 characters)" };
  }

  // Check for excessive special characters (likely spam/attack)
  const specialCharCount = (message.match(/[^a-zA-Z0-9\s\.\,\!\?\-]/g) || []).length;
  const specialCharRatio = specialCharCount / message.length;
  
  if (specialCharRatio > 0.3) {
    return {
      isValid: false,
      reason: "Message contains too many special characters",
    };
  }

  // Check for URL spam (multiple URLs in one message)
  const urlMatches = message.match(/https?:\/\/[^\s]+/g);
  if (urlMatches && urlMatches.length > 3) {
    return {
      isValid: false,
      reason: "Message contains too many URLs",
    };
  }

  return { isValid: true };
}

// ============================================================================
// SANITIZE MESSAGE (Safe escaping without breaking legitimate content)
// ============================================================================

export function sanitizeMessage(message: string): string {
  if (typeof message !== "string") return "";

  return message
    .trim()
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
    .substring(0, 2000); // Enforce max length
}
