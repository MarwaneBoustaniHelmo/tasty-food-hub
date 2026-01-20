import Anthropic from '@anthropic-ai/sdk';
import { toolRegistry } from './toolRegistry';
import { ToolResult, ToolContext } from '@/types/tools';

export class ToolOrchestrator {
  private llm: Anthropic;
  private toolUseHistory: ToolResult[] = [];

  constructor() {
    this.llm = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Execute LLM with tool use capability
   */
  async executeLLMWithTools(
    userQuery: string,
    systemPrompt: string,
    availableToolNames: string[],
    context?: ToolContext,
  ): Promise<{
    finalResponse: string;
    toolsUsed: ToolResult[];
    stopReason: 'end_turn' | 'tool_use' | 'max_tokens';
  }> {
    const toolsUsed: ToolResult[] = [];
    const tools = toolRegistry.getAll().filter(t => availableToolNames.includes(t.name));

    const messages: Array<{ role: 'user' | 'assistant'; content: string | any }> = [
      {
        role: 'user',
        content: userQuery,
      },
    ];

    let response = await this.llm.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema,
      })) as any,
      messages: messages as any,
    });

    // Process tool calls in a loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find((block: any) => block.type === 'tool_use');

      if (!toolUseBlock) break;

      const toolName = toolUseBlock.name;
      const toolInput = toolUseBlock.input;

      // Execute tool
      const startTime = Date.now();
      let output: any;
      let error: string | undefined;
      let success = true;

      try {
        output = await toolRegistry.execute(toolName, toolInput);
      } catch (e) {
        error = e instanceof Error ? e.message : 'Unknown error';
        success = false;
      }

      const executionTime = Date.now() - startTime;

      toolsUsed.push({
        toolName,
        input: toolInput,
        output,
        success,
        error,
        executionTime,
      });

      // Add assistant response and tool result to messages
      messages.push({
        role: 'assistant',
        content: response.content,
      });

      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: success ? JSON.stringify(output) : `Error: ${error}`,
          },
        ],
      });

      // Continue LLM
      response = await this.llm.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema,
        })) as any,
        messages: messages as any,
      });
    }

    // Extract final text response
    const finalResponse =
      response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n') || 'No response generated.';

    return {
      finalResponse,
      toolsUsed,
      stopReason: response.stop_reason as 'end_turn' | 'tool_use' | 'max_tokens',
    };
  }
}

export const toolOrchestrator = new ToolOrchestrator();
