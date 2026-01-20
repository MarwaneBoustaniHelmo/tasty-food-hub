import { ToolDefinition, ToolCategory } from '@/types/tools';

export class ToolRegistry {
  private tools: Map<string, { definition: ToolDefinition; handler: Function; category: ToolCategory }> = new Map();

  /**
   * Register a tool
   */
  register(
    name: string,
    definition: ToolDefinition,
    handler: Function,
    category: ToolCategory,
  ): void {
    this.tools.set(name, { definition, handler, category });
  }

  /**
   * Get all tools
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(t => t.category === category)
      .map(t => t.definition);
  }

  /**
   * Execute a tool
   */
  async execute(toolName: string, input: Record<string, any>): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool not found: ${toolName}`);

    try {
      return await tool.handler(input);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tool by name
   */
  getTool(name: string): ToolDefinition | null {
    return this.tools.get(name)?.definition || null;
  }
}

export const toolRegistry = new ToolRegistry();
