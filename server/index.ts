import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import { v4 as uuidv4 } from "uuid";
import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAggregatedMenu, refreshMenuCache } from '../src/services/menuAggregator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// SSE MANAGER - Handles Server-Sent Events connections
// ============================================================================

interface SSEClient {
  id: string;
  response: Response;
  createdAt: Date;
}

interface SSEEvent {
  type: "token" | "error" | "done" | "metadata";
  data: any;
  timestamp: number;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();

  registerClient(clientId: string, response: Response): void {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Transfer-Encoding": "chunked",
    });

    // Send initial comment to establish connection
    response.write(": sse-initialized\n\n");

    const client: SSEClient = {
      id: clientId,
      response,
      createdAt: new Date(),
    };

    this.clients.set(clientId, client);

    response.on("close", () => {
      this.removeClient(clientId);
    });

    console.log(`[SSE] Client ${clientId} connected. Total: ${this.clients.size}`);
  }

  sendEvent(clientId: string, event: SSEEvent): boolean {
    const client = this.clients.get(clientId);

    if (!client) {
      console.warn(`[SSE] Client ${clientId} not found`);
      return false;
    }

    try {
      const formatted = this.formatEvent(event);
      client.response.write(formatted);
      return true;
    } catch (error) {
      console.error(`[SSE] Error sending to ${clientId}:`, error);
      this.removeClient(clientId);
      return false;
    }
  }

  sendToken(clientId: string, token: string): boolean {
    return this.sendEvent(clientId, {
      type: "token",
      data: { token },
      timestamp: Date.now(),
    });
  }

  sendError(clientId: string, message: string): boolean {
    return this.sendEvent(clientId, {
      type: "error",
      data: { message },
      timestamp: Date.now(),
    });
  }

  closeStream(clientId: string): boolean {
    return this.sendEvent(clientId, {
      type: "done",
      data: {},
      timestamp: Date.now(),
    });
  }

  private formatEvent(event: SSEEvent): string {
    const data = JSON.stringify(event);
    return `data: ${data}\n\n`;
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);

    if (client) {
      try {
        client.response.end();
      } catch {
        // Already closed
      }

      this.clients.delete(clientId);
      console.log(
        `[SSE] Client ${clientId} disconnected. Total: ${this.clients.size}`,
      );
    }
  }

  broadcast(event: SSEEvent): number {
    let sent = 0;

    for (const [clientId] of this.clients.entries()) {
      try {
        const formatted = this.formatEvent(event);
        const client = this.clients.get(clientId);
        if (client) {
          client.response.write(formatted);
          sent++;
        }
      } catch (error) {
        console.error(`[SSE] Broadcast error for ${clientId}:`, error);
        this.removeClient(clientId);
      }
    }

    return sent;
  }

  getStats() {
    return {
      activeClients: this.clients.size,
      clients: Array.from(this.clients.values()).map((c) => ({
        id: c.id,
        connectedForMs: Date.now() - c.createdAt.getTime(),
      })),
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// ANTHROPIC CLIENT - LLM streaming setup
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
const sseManager = new SSEManager();
const PORT = Number(process.env.API_PORT || 3001);
const CACHE_FILE = path.join(__dirname, '..', 'data', 'menu-cache.json');

// Middleware: Performance optimization
app.use(compression()); // gzip compression
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  }),
);

// Middleware: Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware: Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES - CHAT & SSE
// ============================================================================

/**
 * GET /api/chat/stream
 * Stream LLM response via Server-Sent Events
 *
 * Query params:
 *   - message: string (required) - User message to send to Claude
 *   - conversation_id: string (optional) - For multi-turn conversations
 *
 * Example:
 *   GET /api/chat/stream?message=What%20is%20AI?
 */
app.get("/api/chat/stream", async (req: Request, res: Response) => {
  try {
    const { message, conversation_id } = req.query;

    // Validation: Check message exists and is a string
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message query parameter is required and must be a string",
      });
    }

    // Validation: Check message is not empty
    if (!message.trim()) {
      return res.status(400).json({ error: "message cannot be empty" });
    }

    const clientId = uuidv4();

    // Register SSE client connection
    sseManager.registerClient(clientId, res);

    console.log(`[Chat] Starting stream for client: ${clientId}`);
    console.log(`[Chat] Message: "${message.substring(0, 150)}..."`);

    let tokenCount = 0;
    let fullResponse = "";

    // Stream from Claude API
    const stream = await anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Handle streaming tokens
    stream.on("text", (token: string) => {
      tokenCount += 1;
      fullResponse += token;

      // Send token to client via SSE
      sseManager.sendToken(clientId, token);

      // Log progress every 20 tokens
      if (tokenCount % 20 === 0) {
        console.log(
          `[Chat] Client ${clientId} | Token ${tokenCount} | Length: ${fullResponse.length}`,
        );
      }
    });

    // Handle stream completion
    stream.on("end", () => {
      console.log(
        `[Chat] Stream complete for ${clientId} | Total tokens: ${tokenCount} | Response length: ${fullResponse.length}`,
      );

      // Send completion signal
      sseManager.closeStream(clientId);

      // Optional: Persist conversation to database
      saveConversation({
        conversation_id: conversation_id as string | undefined,
        user_message: message,
        assistant_response: fullResponse,
        token_count: tokenCount,
      }).catch((err) => {
        console.error("[Database] Save error:", err);
      });
    });

    // Handle stream errors
    stream.on("error", (error: Error) => {
      console.error(`[Chat] Stream error for ${clientId}:`, error);

      // Send error to client
      sseManager.sendError(clientId, error.message);

      // Close stream
      sseManager.closeStream(clientId);
    });
  } catch (error: any) {
    console.error("[Chat] Handler error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: error?.message ?? "Internal server error",
      });
    }
  }
});

/**
 * GET /api/sse/stats
 * Get SSE connection statistics
 */
app.get("/api/sse/stats", (_req: Request, res: Response) => {
  const stats = sseManager.getStats();
  res.json(stats);
});

/**
 * POST /api/chat
 * Traditional REST endpoint (non-streaming) for comparison
 * Useful for testing without SSE support
 */
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message field is required" });
    }

    if (!message.trim()) {
      return res.status(400).json({ error: "message cannot be empty" });
    }

    console.log(`[Chat REST] Message: "${message.substring(0, 150)}..."`);

    // Non-streaming response
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    res.json({
      message: text,
      tokens: response.usage.output_tokens,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Chat REST] Error:", error);
    res.status(500).json({ error: error?.message ?? "Internal server error" });
  }
});

// ============================================================================
// ROUTES - MENU API
// ============================================================================

/**
 * GET /api/menu - Get cached menu data
 */
app.get('/api/menu', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const items = await getAggregatedMenu(forceRefresh);
    
    res.json({
      items,
      count: items.length,
      cached: !forceRefresh,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error serving menu:', error);
    res.status(500).json({
      error: 'Failed to load menu data',
      message: error.message
    });
  }
});

/**
 * POST /api/menu/refresh - Manually refresh menu cache
 */
app.post('/api/menu/refresh', async (req, res) => {
  try {
    console.log('Manual refresh requested...');
    const items = await refreshMenuCache();
    
    res.json({
      success: true,
      items,
      count: items.length,
      timestamp: Date.now(),
      message: 'Menu cache refreshed successfully'
    });
  } catch (error: any) {
    console.error('Error refreshing menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh menu cache',
      message: error.message
    });
  }
});

/**
 * GET /api/menu/status - Get cache status
 */
app.get('/api/menu/status', (req, res) => {
  try chatStream: {
        path: '/api/chat/stream',
        method: 'POST',
        description: 'Stream LLM responses via SSE (Server-Sent Events)',
        body: { message: 'string', systemPrompt: 'string (optional)' }
      },
      {
    if (!fs.existsSync(CACHE_FILE)) {
      return res.json({
        cached: false,
        message: 'No cache available'
      });
    }

    const stats = fs.statSync(CACHE_FILE);
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const age = Date.now() - data.timestamp;
    const ageMinutes = Math.round(age / 1000 / 60);

    res.json({
      cached: true,
      itemCount: data.items?.length || 0,
      timestamp: data.timestamp,
      age: ageMinutes,
      ageFormatted: `${ageMinutes} minutes ago`,
      errors: data.errors || []
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to read cache status',
      message: error.message
    });
  }
});

/**
 * GET / - API info and available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Tasty Food Menu Aggregation API',
    version: '1.0.0',
    endpoints: {
      menu: {
        path: '/api/menu',
        method: 'GET',
        description: 'Get cached or fresh menu data from all platforms'
      },
      refresh: {
        path: '/api/menu/refresh',
        method: 'POST',
        description: 'Manually refresh the menu cache'
      },
      status: {
        path: '/api/menu/status',
        method: 'GET',
        description: 'Check cache status and age'
      },
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      }
    },
    documentation: 'See README_MENU.md for full documentation'
  });
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 Menu API server running on http://localhost:${PORT}`);
  console.log(`📋 Menu endpoint: http://localhost:${PORT}/api/menu`);
  console.log(`🔄 Refresh endpoint: http://localhost:${PORT}/api/menu/refresh`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/api/menu/status`);
});
