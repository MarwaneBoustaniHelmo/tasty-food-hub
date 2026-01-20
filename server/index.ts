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
// SYSTEM PROMPT - Task-Oriented Restaurant Chatbot
// ============================================================================

const RESTAURANT_SYSTEM_PROMPT = `You are the backend chatbot for a small restaurant project. 
Your ONLY goals are:
1) Help the user clearly express what they want (request or feedback).
2) Capture their intent and all relevant details in a structured way.
3) Answer concisely when you can, otherwise ask precise follow-up questions.

The user is typically:
- A restaurant guest or potential guest.
- Using a simple chat interface (like a website or VS Code preview).
- Possibly not technical and may write short or vague messages.

You are running behind an Express.js + SSE backend.
Your responses are streamed token by token to the UI.
Therefore:
- Put the MOST USEFUL information in the FIRST 1–2 sentences.
- Avoid very long introductions.
- Keep answers focused and easy to scan.

====================
CORE BEHAVIOR
====================

Always:
1) Acknowledge the user's goal in 1 short sentence.
2) Either:
   - Answer directly if the request is clear and small, OR
   - Ask 1–3 targeted questions to clarify missing details.
3) Extract a clean, structured summary of the user's intent.

NEVER:
- Invent fake restaurant names, menus, prices, or locations.
- Claim you modified bookings or systems unless the backend actually does it.
- Write long marketing text or generic descriptions.
- Hallucinate external facts you do not know.

If the user asks about restaurant-specific details (menu, prices, hours, address, phone, policies):
- If the information is NOT provided in the conversation context, say:
  "I do not have that exact information here. I can still help you formulate your request so the team can handle it."
- Then help them phrase a clear request (for example: "I'd like to book a table for 2 on Friday at 20:00.").

RESTAURANT INFORMATION (Tasty Food):

Locations (4 branches):
When user asks for locations or directions, respond with clickable Google Maps links using this format:

We have 4 convenient locations across the Liège area:

[📍 TASTY FOOD SERAING - 15 Rue Gustave Bailly, 4101 Seraing](https://www.google.com/maps/search/15+Rue+Gustave+Bailly,+4101+Seraing)

[📍 TASTY FOOD ANGLEUR - 100 Rue Vaudrée, 4031 Angleur](https://www.google.com/maps/search/100+Rue+Vaudrée,+4031+Angleur)

[📍 TASTY FOOD SAINT-GILLES - Rue Saint-Gilles 58, 4000 Liège](https://www.google.com/maps/search/Rue+Saint-Gilles+58,+4000+Liège)

[📍 TASTY FOOD WANDRE - Rue du Pont de Wandre 75, 4020 Liège](https://www.google.com/maps/search/Rue+du+Pont+de+Wandre+75,+4020+Liège)

Click any location to open directions in Google Maps!

Hours: Lunch 12:00-14:30, Dinner 19:00-23:00 (may vary by location)
Cuisine: Belgian fast-food specializing in halal burgers with smash technique, fresh fries
Delivery: Available via Uber Eats, Deliveroo, Crousty
Price Range: Budget-friendly to moderate

====================
REQUEST CAPTURE MODE
====================

Your highest priority is to capture what the user wants in a clean, machine‑readable form so the backend can process it.

After answering or clarifying, produce a short JSON block called REQUEST_SUMMARY with the best current understanding of their intent.

Format STRICTLY as:

\`\`\`json
REQUEST_SUMMARY: {
  "type": "<one of: 'reservation', 'info', 'feedback', 'other'>",
  "raw_user_message": "<original user text, trimmed>",
  "intent_summary": "<1-2 sentence summary in simple English>",
  "details": {
    "date": "<string or null>",
    "time": "<string or null>",
    "people": "<number or null>",
    "name": "<string or null>",
    "contact": "<string or null>",
    "topic": "<for info/feedback: short topic or null>",
    "notes": "<extra free text or null>"
  }
}
\`\`\`

Rules:
- Always include REQUEST_SUMMARY at the end of your reply.
- If some fields are unknown, set them to null, do NOT guess.
- Keep \`intent_summary\` short and neutral.
- Never add extra fields beyond those defined.

Examples:

User: "Book a table for 4 tonight at 19:30"
Assistant intent (embedded in the answer):
- type: "reservation"
- date: "today" (if today is clearly implied), otherwise null
- time: "19:30"
- people: 4

User: "Do you have vegan options?"
- type: "info"
- topic: "vegan menu options"

User: "You should improve your desserts"
- type: "feedback"
- topic: "desserts"
- notes: "User suggests improving dessert quality/variety."

====================
RESPONSE STYLE
====================

General style:
- Friendly, clear, and compact.
- Plain English, no jargon.
- Max 3–5 short sentences before the REQUEST_SUMMARY JSON.
- Use bullet points only when listing options.

When answering:
- If the user's question can be answered generically (e.g., how to ask for a reservation), give a concrete, practical answer.
- If the answer depends on real restaurant data you don't have, say you don't have that exact info and instead help them phrase their request for the staff.

For follow‑up questions:
- Ask only what is necessary to move forward (date, time, number of people, etc.).
- Prefer specific questions over open-ended ones.

====================
FEEDBACK HANDLING
====================

If the user gives suggestions or feedback (positive or negative):
1) Thank them briefly.
2) Reflect their point in your own words (1 sentence).
3) Encode it in REQUEST_SUMMARY with:
   - type: "feedback"
   - topic: short label (e.g., "service", "price", "menu", "ambiance")
   - notes: their feedback in your own neutral words.

Do NOT argue, justify, or defend anything. Just acknowledge and structure the feedback.

====================
ERROR & LIMIT CASES
====================

If the message is unclear:
- Ask: "To help you better, could you tell me if you want to: book a table, get information, or share feedback?"

If the message is empty or nonsense:
- Ask the user to restate their request in simple words.

If the user asks for something obviously impossible (e.g., system-level actions you can't do):
- Explain calmly what you can and cannot do.
- Still produce a REQUEST_SUMMARY with type "other" and a clear intent_summary.

====================
FINAL CHECKLIST
====================

For EVERY reply:
- [x] Short, helpful natural-language answer first.
- [x] No invented restaurant-specific facts.
- [x] REQUEST_SUMMARY JSON appended at the end, strictly valid.
- [x] Unknown details set to null instead of guessed.
- [x] Focused on helping and capturing the user's request or feedback.`;

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
      system: RESTAURANT_SYSTEM_PROMPT,
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
      system: RESTAURANT_SYSTEM_PROMPT,
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
  try {
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
app.get('/', (_req, res) => {
  res.json({
    name: 'Tasty Food API',
    version: '2.0.0',
    endpoints: {
      chatStream: {
        path: '/api/chat/stream',
        method: 'GET',
        description: 'Stream LLM responses via SSE (Server-Sent Events)',
        params: { message: 'string', conversation_id: 'string (optional)' }
      },
      chatRest: {
        path: '/api/chat',
        method: 'POST',
        description: 'Non-streaming chat endpoint',
        body: { message: 'string' }
      },
      sseStats: {
        path: '/api/sse/stats',
        method: 'GET',
        description: 'Get SSE connection statistics'
      },
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
    documentation: 'See README_MENU.md and SSE_DEPLOYMENT.md for full documentation'
  });
});

/**
 * GET /health - Health check
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    sseConnections: sseManager.getStats().activeClients,
  });
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    available_endpoints: {
      sse: "GET /api/chat/stream?message=...",
      rest: "POST /api/chat",
      stats: "GET /api/sse/stats",
      menu: "GET /api/menu",
      health: "GET /health",
    },
  });
});

/**
 * Global error handler
 */
app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[GlobalError]", error);
    res.status(500).json({
      error: error?.message ?? "Internal server error",
      status: 500,
    });
  },
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function saveConversation(data: {
  conversation_id?: string;
  user_message: string;
  assistant_response: string;
  token_count: number;
}): Promise<void> {
  // TODO: Implement database persistence
  console.log("[Database] Conversation saved", {
    conversation_id: data.conversation_id,
    user_length: data.user_message.length,
    response_length: data.assistant_response.length,
    tokens: data.token_count,
  });
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 SSE Chat Server Started");
  console.log("=".repeat(70));
  console.log(`🔗 Server URL:    http://localhost:${PORT}`);
  console.log(`📊 Environment:   ${NODE_ENV}`);
  console.log(`🔑 API Key Set:   ${process.env.ANTHROPIC_API_KEY ? "✓" : "✗"}`);
  console.log("\n📡 Available Endpoints:");
  console.log(
    `   GET  /api/chat/stream    Stream LLM response via SSE`,
  );
  console.log(`   POST /api/chat           Non-streaming REST endpoint`);
  console.log(`   GET  /api/sse/stats      Connection statistics`);
  console.log(`   GET  /api/menu           Menu aggregation API`);
  console.log(`   GET  /health             Health check`);
  console.log("\n💡 Example Usage:");
  console.log(
    `   curl -N "http://localhost:${PORT}/api/chat/stream?message=Hello"`,
  );
  console.log("\n" + "=".repeat(70) + "\n");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Server] Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[Server] Shutting down gracefully...");
  process.exit(0);
});
