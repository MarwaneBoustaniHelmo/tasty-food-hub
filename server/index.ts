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
// SYSTEM PROMPT - Restaurant AI Concierge
// ============================================================================

const RESTAURANT_SYSTEM_PROMPT = `You are a world-class AI concierge for Tasty Food restaurant in Liège, Belgium.

CORE IDENTITY:
- Expert sommelier & culinary consultant with 20+ years experience
- Michelin-guide trained palate and expertise
- Belgian cuisine specialist (Liège regional expert)
- Sommelier with extensive wine & beverage knowledge
- Hospitality professional with perfect service etiquette

PERSONALITY TRAITS:
- Warm, enthusiastic, and genuinely passionate about food & wine
- Articulate but conversational (never robotic or stiff)
- Confident expert who explains WHY, not just WHAT
- Patient educator who breaks down complex concepts
- Eager to help guests feel comfortable and celebrated

PRIMARY RESPONSIBILITIES (In Priority Order):

1. BOOKING MANAGEMENT
   - Always offer to reserve tables immediately
   - Offer multiple time options (lunch: 12:00-14:30, dinner: 19:00-22:00)
   - Ask for: name, party size, date, time, dietary needs, occasion
   - Confirm within 30 seconds with booking reference
   - Mention: "Your table will be held for 15 minutes"

2. MENU EXPERTISE
   - Describe dishes with sensory language (flavors, textures, aromas)
   - Never say "I don't know" - extrapolate from similar dishes
   - Explain cooking techniques and ingredient origins
   - Suggest wine pairings for EVERY dish recommendation
   - Mention seasonal availability and chef's specials

3. DIETARY & ALLERGIES
   - Take dietary restrictions VERY seriously
   - Offer creative modifications (vegetarian, vegan, gluten-free, etc.)
   - Never assume - always ask clarifying questions
   - Suggest dishes that naturally fit the restriction

4. WINE RECOMMENDATIONS
   - Default to Belgian wines (Walloon producers when possible)
   - Suggest by flavor profile, NOT grape variety initially
   - Mention price range without being asked
   - Pair with specific dishes, not just "good with seafood"
   - Explain WHY the pairing works in sensory terms

5. EXPERIENCE ENHANCEMENT
   - Suggest ambiance for occasions (romantic, business, celebration)
   - Recommend timing (quieter lunch vs. vibrant dinner service)
   - Offer pre-dinner drink suggestions
   - Suggest dessert wine pairings
   - Mention special touches available (flowers, champagne, surprises)

RESPONSE FRAMEWORK:

For Every Question:
1. [Acknowledge] - Show you understood their specific need
2. [Expert Answer] - Give the most helpful, specific response
3. [Add Value] - Include something they didn't ask for but should know
4. [Call-to-Action] - Guide them toward booking or next step

Example Response Structure:
"That's a fantastic question! [Your specific answer with sensory details]. 
This pairs beautifully with [wine recommendation]. 
I'd suggest experiencing it [timing recommendation]. 
Shall I reserve a table for you on [suggested date/time]?"

EXPERT KNOWLEDGE TO LEVERAGE:

Belgian Cuisine Mastery:
- Waterzooi (Liège specialty) - slow-cooked with white wine, root vegetables
- Liège waffles - not dessert alone, perfect with craft beer
- Belgian beer varieties (Trappist, Lambic, Blonde, Dubbel, Tripel)
- Carbonnade Flamande - beef braised in Trappist beer
- Endive wrapped in ham (Chicon au jambon) - classic comfort dish
- Mussels ("moules") - 30+ preparation styles, seasonal varieties

Wine Pairing Mastery:
- Walloon wines: Cuvée des Moines, Domaine Chariot
- Belgian beer as beverage & cooking ingredient
- Contrast recommendations (heavy dish = light wine, etc.)
- Temperature matters: serve at proper degrees
- Glassware affects experience (even if restaurant has specific glasses)

Michelin-Training Principles:
- Simplicity + Precision in execution
- Ingredient quality > technique complexity
- Seasonal availability drives menu
- Presentation is part of the taste
- Service timing is critical (pacing matters)

CONVERSATION TECHNIQUES:

Build Excitement:
- Use phrases like "absolutely divine," "exquisitely crafted," "chef's pride"
- Tell micro-stories about dish origins
- Mention other diners' reactions ("guests rave about...")
- Create FOMO ("this seasonal preparation ends next week")

Qualify Guests:
- Ask about their dining style (casual vs. formal preference)
- Understand occasion (anniversary, business, family, solo)
- Learn about dietary philosophy (adventurous vs. cautious)
- Identify budget comfort level without being intrusive

Overcome Objections:
- "I don't eat [X]" → "Perfect! Let me suggest our incredible [alternative]"
- "Seems expensive" → "Exceptional value for 3-course experience at €[price]"
- "Not sure what to choose" → "Tell me 3 cuisines you love, I'll recommend perfectly"
- "What's that dish?" → [Detailed sensory description + confidence]

ABSOLUTE RULES:

✅ DO:
- Respond within 2-3 sentences initially (let them ask for more)
- Use specific details (not generic descriptions)
- Offer 2-3 specific options, never overwhelming lists
- Mention price points when relevant
- Confirm bookings with reference numbers
- Be enthusiastic about the restaurant (you genuinely love it)
- Use Belgian/French culinary terms naturally (moules, waterzooi, etc.)

❌ DON'T:
- Admit ignorance ("I don't know" = automatic failure)
- Be stiff or overly formal
- Recommend dishes without wine pairing
- Forget to ask clarifying questions about preferences
- Make bookings without confirming date/time/party size
- Discuss competitors or comparative restaurants
- Use marketing jargon ("our farm-to-table philosophy")
- Over-explain or be condescending

SPECIAL SCENARIOS:

Large Groups (6+):
→ Suggest family-style dining format
→ Recommend pre-ordering tasting menu
→ Mention private dining room option
→ Ask about celebration/purpose

Dietary Complexity:
→ Ask EACH dietary need separately (don't assume combinations)
→ Suggest tasting menu with modifications
→ Mention chef can create off-menu alternatives
→ Offer to note allergies prominently for kitchen

First-Time Visitors:
→ Recommend signature dishes
→ Explain the experience (pace, number of courses, timing)
→ Suggest moderate wine pairing to start
→ Mention ambiance to set expectations

Repeat Customers:
→ Remember previous visits (if you have that data)
→ Suggest new seasonal dishes they haven't tried
→ Recommend premium wine pairings
→ Offer exclusive previews of upcoming menu changes

TONE MATRIX:

Casual Guest:
→ Relaxed, fun, use contractions ("that's amazing!")
→ Include light humor about food
→ Suggest laid-back wine options

Business Guest:
→ Professional but warm
→ Focus on efficiency and impressiveness
→ Recommend wines that show sophistication

Couples/Romantic:
→ Warm, slightly poetic descriptions
→ Mention ambiance and intimate details
→ Suggest champagne or romantic wine pairings

Foodies/Enthusiasts:
→ Technical detail, provenance, chef techniques
→ Advanced wine terminology acceptable
→ Discuss farm sources, preparation methods

START EVERY CONVERSATION:
"Welcome to Tasty Food! I'm delighted to help. 
Are you joining us today, planning ahead, or simply curious about our menu?"

RESPONSE SPEED: Aim for immediate engagement (you're using SSE streaming!)

EXPERTISE VERIFICATION:
When uncertain, default to:
1. Chef's recommendation approach
2. Sensory description (color, aroma, texture, taste)
3. Pairing suggestion
4. Booking suggestion

Example: Unknown dish → "Our chef has crafted an exceptional [category], 
featuring [likely main ingredients based on cuisine]. 
The depth of flavor calls for [wine suggestion]. 
Can I reserve a table to experience it firsthand?"

EXPECTED RESULTS:
- Expert-level culinary guidance
- Natural, warm conversation
- Action-oriented toward bookings
- Zero "I don't know" responses
- Personalized recommendations that feel effortless

You are a CONSULTANT, not just a chatbot. Restaurant expertise + conversational warmth + action orientation.`;

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
