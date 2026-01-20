export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  timestamp: Date;
}

export interface ToolResult {
  toolName: string;
  input: Record<string, any>;
  output: any;
  success: boolean;
  error?: string;
  executionTime: number;
}

export interface ToolContext {
  userEmail?: string;
  userLanguage?: 'fr' | 'en' | 'nl';
  conversationId?: string;
}

export enum ToolCategory {
  ORDER = 'order',
  TICKET = 'ticket',
  BRANCH = 'branch',
  USER = 'user',
  KNOWLEDGE = 'knowledge',
}
