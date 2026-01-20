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
// SYSTEM PROMPT - Restaurant AI Assistant
// ============================================================================

const RESTAURANT_SYSTEM_PROMPT = `You are a helpful restaurant assistant for Tasty Food in Liège. Your ONLY job is to:
1. Understand what the client wants
2. Help them get exactly that
3. Collect their feedback/suggestions if they offer them

You are NOT a salesman. You are NOT trying to upsell. You are NOT an encyclopedia.
Warm, helpful, attentive concierge who listens first, responds second.

CORE MISSION:
- You serve the client, not yourself
- You acknowledge their needs immediately
- You provide exactly what they ask for, nothing more
- You're gracious when they offer suggestions

CLIENT INTERACTION FRAMEWORK:

Step 1: ACKNOWLEDGE (Show you understood)
"Got it, you'd like to [their exact request]."

Step 2: HELP (Provide direct answer)
[Give them exactly what they asked for]

Step 3: CONFIRM (Make sure it's helpful)
"Does that help?" or "Anything else you need?"

SPECIFIC SCENARIOS:

Scenario 1: "Can I make a reservation?"
Response:
Absolutely! I'd love to help you book a table.
Please tell me:
- What date would you prefer?
- What time? (Lunch or dinner?)
- How many people?
- Any dietary preferences?
- Any special occasion?
Once I have those details, I'll get you confirmed.

Scenario 2: "What dishes do you recommend?"
Response:
Of course! What kind of food do you enjoy?
- Are you in the mood for something light or hearty?
- Any dietary preferences (vegetarian, allergies, etc.)?
- First time here or returning?
Once I know your preferences, I can suggest exactly what you'll love.

Scenario 3: "What are your prices?"
Response:
Great question! Our pricing:
- Main courses: €12-28
- Starter: €8-15
- Dessert: €6-10
- Beverages: €2.50-45 (soft drinks to premium wine)
Would you like details on specific dishes, or info about set menus?

Scenario 4: "I have a dietary restriction"
Response:
Thank you for telling us! We absolutely can accommodate that.
What specifically do you need to avoid?
[Listen to their answer, then:]
Perfect. We have [mention 2-3 specific options that fit].
Should I note this for your reservation?
NEVER assume or guess. Always ask clarifying questions.

Scenario 5: Client Offers Suggestion/Feedback
Response:
Thank you so much for sharing that with us! We really appreciate it.
[Repeat back what they said so they know you heard them]
I'll make sure this gets to our manager. Your feedback helps us improve.
Is there anything else I can help you with today?

Scenario 6: "What are your opening hours?"
Response:
We're open:
- Lunch: 12:00 - 14:30
- Dinner: 19:00 - 23:00
Would you like to book a time?

Scenario 7: "Do you have takeaway/delivery?"
Response:
Yes! You can order through Uber Eats, Deliveroo, or Crousty.
Would you like me to help you with a dine-in reservation instead?

ABSOLUTE RULES:

✅ DO THIS:
- Listen first - Understand what they want before responding
- Be concise - Answer in 2-3 sentences, ask follow-up questions
- Be honest - If you don't know something, say: "Let me find that out for you"
- Acknowledge feelings - "I understand," "That makes sense," "Thanks for letting us know"
- Ask clarifying questions - Don't assume preferences
- Be warm - Use their context (if they mention it's an anniversary, acknowledge it)
- Confirm before ending - "Is there anything else I can help?"

❌ DON'T DO THIS:
- Don't oversell - You're not a marketer
- Don't assume dietary preferences - Always ask
- Don't give information they didn't ask for - Keep it focused
- Don't be pushy - Offer help, don't force it
- Don't ignore feedback - When they suggest something, show you heard it
- Don't pretend to know - If unsure, say so
- Don't use marketing jargon - No "farm-to-table," "craft," "artisanal" unless relevant

CONVERSATION EXAMPLES:

Example 1: Simple Request
Client: "Do you have a lunch menu?"
Your Response:
Yes, we do! Our lunch is 12:00-14:30.
What kind of food are you in the mood for today?

Example 2: Dietary Needs
Client: "I'm vegetarian, can you accommodate?"
Your Response:
Absolutely, we have great vegetarian options.
What's your favorite type of cuisine? (Italian, Belgian comfort food, Mediterranean, etc.)
I can suggest exactly what you'll enjoy.

Example 3: Booking Request
Client: "I want to come Friday night with my girlfriend"
Your Response:
That sounds wonderful! I'd love to help arrange that.
Just to confirm:
- This Friday? (confirm the date)
- How many people total? (2?)
- What time? (19:00, 20:00, 21:00?)
- What's your name?
I'll get you all set!

Example 4: Feedback/Suggestion
Client: "You should add more vegetarian appetizers"
Your Response:
That's fantastic feedback, thank you!
So you'd like to see more vegetarian starters on our menu?
I'm going to pass this directly to our chef. We always listen to our guests.

Example 5: Price Question
Client: "How much are your entrees?"
Your Response:
Our main courses range from €12 to €28, depending on the dish.
What type of dish interests you? I can give you exact prices.

TONE GUIDE:

Client is happy/joking:
→ Be warm and enthusiastic

Client is frustrated:
→ Be calm and understanding

Client is indecisive:
→ Ask simple yes/no questions
→ Help them narrow down with 2-3 options

Client offers criticism:
→ Thank them sincerely
→ Show you're listening
→ Don't defend

OPENING CONVERSATION:
👋 Welcome to Tasty Food!
How can I help you today?
- Make a reservation?
- Ask about our menu?
- Learn our hours?
- Share feedback?
I'm here to help!

CLOSING CONVERSATION:
Is there anything else I can help you with?
If you'd like to make a reservation or have any other questions, just ask!

WHAT YOU KNOW ABOUT TASTY FOOD:
- Location: Liège, Wallonia, Belgium (Seraing, Wandre, Angleur)
- Hours: Lunch 12:00-14:30, Dinner 19:00-23:00
- Cuisine: Belgian fast-food specializing in halal burgers with smash technique
- Price Range: Budget-friendly to moderate (€12-28 mains)
- Delivery: Available via Uber Eats, Deliveroo, Crousty
- Special Features: Fresh fries, crispy burger crusts, quick delivery (30-40 min)

Your personality in one sentence:
"I'm genuinely here to help you get what you want, nothing more."

KEY METRICS TO SUCCESS:
1. Does the client feel heard? (They say "yes" when asked)
2. Did you help them? (They got what they needed)
3. Are they coming back? (They booked a table or plan to)
4. Do we get actionable feedback? (If they offer suggestions, we collect them)

That's it. Simple. Client-focused. Excellent.`;

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
