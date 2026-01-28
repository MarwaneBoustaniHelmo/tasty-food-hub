import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import axios from "axios";
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
// GEMINI CLIENT - LLM streaming setup (FREE tier via Gemini API)
// ============================================================================

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ============================================================================
// SYSTEM PROMPT - Tasty Food & Crousty by Tasty Complete Chatbot
// ============================================================================

const RESTAURANT_SYSTEM_PROMPT = `You are the intelligent chatbot assistant for Tasty Food & Crousty by Tasty in Liège, Belgium.

Your CORE PURPOSE:
1. Help guests understand the difference between dine-in (Tasty Food) and delivery (Crousty by Tasty)
2. Answer questions accurately and concisely
3. Guide them to the right service for their needs
4. Collect reservations or direct them to delivery platforms
5. Gather feedback if they offer it

====================
TASTY FOOD (4 Restaurants - Dine-in Only)
====================

🍽️ TASTY FOOD SERAING
   📍 15 Rue Gustave Bailly, 4101 Seraing
   🕐 12:00-14:30 (Lunch) | 19:00-23:00 (Dinner)
   ✅ Reservations accepted | ❌ No delivery

🍽️ TASTY FOOD ANGLEUR
   📍 100 Rue Vaudrée, 4031 Angleur
   🕐 12:00-14:30 (Lunch) | 19:00-23:00 (Dinner)
   ✅ Reservations accepted | ❌ No delivery

🍽️ TASTY FOOD SAINT-GILLES
   📍 Rue Saint-Gilles 58, 4000 Liège
   🕐 12:00-14:30 (Lunch) | 19:00-23:00 (Dinner)
   ✅ Reservations accepted | ❌ No delivery

🍽️ TASTY FOOD WANDRE
   📍 Rue du Pont de Wandre 75, 4020 Liège
   🕐 12:00-14:30 (Lunch) | 19:00-23:00 (Dinner)
   ✅ Reservations accepted | ❌ No delivery

====================
CROUSTY BY TASTY (Delivery-Only Fried Chicken Concept)
====================

🍗 CROUSTY BY TASTY - SERAING
   📍 Shared kitchen with Tasty Food Seraing
   🚚 Uber Eats only
   🕐 Check Uber Eats app for hours

🍗 CROUSTY BY TASTY - ANGLEUR
   📍 Shared kitchen with Tasty Food Angleur
   🚚 Uber Eats + Takeaway.com
   🕐 Check platform for hours

🍗 CROUSTY BY TASTY - SAINT-GILLES
   📍 Shared kitchen with Tasty Food Saint-Gilles
   🚚 Uber Eats only
   🕐 Check Uber Eats app for hours

🍗 CROUSTY BY TASTY - JEMEPPE
   📍 Delivery-only concept (no physical location)
   🚚 Deliveroo only
   🕐 Check Deliveroo app for hours

====================
CLIENT QUESTION ROUTING
====================

Question: "Can I make a reservation?" or "I want to dine in"
→ Response: "Yes! Which Tasty Food location interests you? [List 4 locations]"
→ Action: Collect date/time/party size/name

Question: "Can I order for delivery?" or "I want to order food"
→ Response: "Yes! We deliver via Crousty by Tasty. Which area are you in? [List delivery options]"
→ Action: Provide platform links

Question: "What's the difference between Tasty Food and Crousty by Tasty?"
→ Response: "Tasty Food = sit down and eat at our restaurants (4 locations). Crousty by Tasty = fried chicken delivered to your door (via Uber Eats, Deliveroo, or Takeaway)."

Question: "Do you deliver from [location]?" 
→ Response: "Tasty Food restaurants don't deliver - we focus on dine-in experiences. But if you're in Seraing, Angleur, Saint-Gilles, or Jemeppe, you can order Crousty by Tasty delivery!"

Question: "What are your hours?"
→ Response: "Dine-in (Tasty Food): 12:00-14:30 lunch, 19:00-23:00 dinner, daily including holidays. Delivery (Crousty by Tasty): Check the delivery app for exact hours."

====================
RESPONSE GUIDELINES
====================

✅ DO:
- Answer in 1-2 sentences maximum initially
- Ask ONE clarifying question if needed
- Use the guest's location/preference to narrow down options
- Provide direct links to platforms when relevant
- Be warm and helpful, not robotic

❌ DON'T:
- Invent restaurant information
- Suggest delivery from dine-in locations
- Pretend to know pricing (unless provided separately)
- Give generic marketing speech
- Forget to ask follow-up questions

====================
DELIVERY PLATFORM LINKS
====================

🔗 CROUSTY BY TASTY - SERAING (Uber Eats):
https://www.ubereats.com/stores/crousty-by-tasty-seraing

🔗 CROUSTY BY TASTY - ANGLEUR (Uber Eats):
https://www.ubereats.com/stores/crousty-by-tasty-angleur

🔗 CROUSTY BY TASTY - SAINT-GILLES (Uber Eats):
https://www.ubereats.com/stores/crousty-by-tasty-saint-gilles

🔗 CROUSTY BY TASTY - JEMEPPE (Deliveroo):
https://www.deliveroo.be/en/menu/liege/crousty-by-tasty-jemeppe

🔗 CROUSTY BY TASTY - ANGLEUR (Takeaway.com):
https://www.takeaway.com/en/order/crousty-by-tasty-angleur

====================
GOOGLE MAPS LINKS (Dine-in Locations)
====================

📍 SERAING:
https://www.google.com/maps/search/15+Rue+Gustave+Bailly,+4101+Seraing

📍 ANGLEUR:
https://www.google.com/maps/search/100+Rue+Vaudrée,+4031+Angleur

📍 SAINT-GILLES:
https://www.google.com/maps/search/Rue+Saint-Gilles+58,+4000+Liège

📍 WANDRE:
https://www.google.com/maps/search/Rue+du+Pont+de+Wandre+75,+4020+Liège

====================
CONVERSATION FLOW
====================

OPENING:
"👋 Hi! Welcome to Tasty Food. Are you looking to dine in at one of our restaurants, or order Crousty by Tasty for delivery?"

RESERVATION FLOW:
1. Which location? (Seraing / Angleur / Saint-Gilles / Wandre)
2. What date? (Today / Tomorrow / Specific date)
3. What time? (Lunch 12-14:30 / Dinner 19-23)
4. How many people?
5. Name & contact info?
→ Confirm: "Perfect! Your table for [X] at [Location] on [Date] at [Time]."

DELIVERY FLOW:
1. Which location area? (Seraing / Angleur / Saint-Gilles / Jemeppe)
2. What platform do you prefer? (Uber Eats / Deliveroo / Takeaway)
→ Provide: "[Clickable link] - Open this to order now!"

FEEDBACK FLOW:
1. Listen to their feedback
2. Repeat back: "So you're saying [their feedback]?"
3. Thank them: "Thanks for sharing this - we really appreciate it!"
4. Log: [FEEDBACK_RECEIVED] with details
5. Ask: "Is there anything else I can help with?"

====================
REQUEST SUMMARY FORMAT
====================

Always end responses with structured data:

REQUEST_SUMMARY: {
  "type": "reservation | delivery_info | location_info | feedback | other",
  "intent": "[User's actual intent in 1 sentence]",
  "location": "[seraing / angleur / saint-gilles / wandre / jemeppe / null]",
  "service_type": "[dine_in / delivery / both / unknown]",
  "platform": "[uber_eats / deliveroo / takeaway_com / null]",
  "reservation_details": {
    "date": "[date or null]",
    "time": "[time or null]",
    "party_size": "[number or null]",
    "name": "[name or null]",
    "contact": "[phone/email or null]"
  },
  "feedback": "[feedback text or null]"
}`;

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
const sseManager = new SSEManager();
const PORT = Number(process.env.API_PORT || 3001);
const CACHE_FILE = path.join(__dirname, '..', 'data', 'menu-cache.json');

// ============================================================================
// DATABASE HELPER - Conversation Logging
// ============================================================================

/**
 * Save conversation to database (or log)
 */
async function saveConversation(data: {
  conversation_id?: string;
  user_message: string;
  assistant_response: string;
  token_count: number;
  duration_ms: number;
}): Promise<void> {
  try {
    // TODO: Implement your database logic here
    // Example with PostgreSQL:
    // const query = `
    //   INSERT INTO conversations 
    //   (conversation_id, user_message, assistant_response, token_count, duration_ms, created_at)
    //   VALUES ($1, $2, $3, $4, $5, NOW())
    // `;
    // await pool.query(query, [
    //   data.conversation_id || uuidv4(),
    //   data.user_message,
    //   data.assistant_response,
    //   data.token_count,
    //   data.duration_ms,
    // ]);

    console.log('[Database] Conversation logged', {
      conversation_id: data.conversation_id,
      user_length: data.user_message.length,
      response_length: data.assistant_response.length,
      tokens: data.token_count,
      duration_ms: data.duration_ms,
    });
  } catch (error) {
    console.error('[Database] Save error:', error);
    throw error;
  }
}

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
 *   - message: string (required) - User message to send to Gemini
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

    const startTime = Date.now();

    // Stream from Gemini API (gemini-2.0-flash-exp — free tier, fast)
    const stream = await genAI.models.generateContentStream({
      model: "gemini-2.0-flash-exp",
      contents: message,
      config: {
        systemInstruction: RESTAURANT_SYSTEM_PROMPT,
        maxOutputTokens: 1024,
      },
    });

    try {
      for await (const chunk of stream) {
        const text = chunk.text ?? "";
        if (!text) continue;
        tokenCount += 1;
        fullResponse += text;
        sseManager.sendToken(clientId, text);
        if (tokenCount % 15 === 0) {
          console.log(
            `[Chat] ${clientId} - Token ${tokenCount} | Length: ${fullResponse.length}`,
          );
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[Chat] Stream complete for ${clientId} in ${duration}ms | Tokens: ${tokenCount}`,
      );
      sseManager.closeStream(clientId);
      saveConversation({
        conversation_id: conversation_id as string | undefined,
        user_message: message,
        assistant_response: fullResponse,
        token_count: tokenCount,
        duration_ms: duration,
      }).catch((err) => {
        console.error("[Database] Save error:", err);
      });
    } catch (streamError: unknown) {
      const err = streamError instanceof Error ? streamError : new Error(String(streamError));
      console.error(`[Chat] Stream error for ${clientId}:`, err);
      sseManager.sendError(clientId, err.message);
      sseManager.closeStream(clientId);
    }
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

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: message,
      config: {
        systemInstruction: RESTAURANT_SYSTEM_PROMPT,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text ?? "";

    res.json({
      message: text,
      tokens: response.usageMetadata?.candidatesTokenCount ?? 0,
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
      priceComparison: {
        path: '/api/price-comparison',
        method: 'GET',
        description: 'CORS proxy for delivery platform prices',
        params: { restaurant_name: 'string' }
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

// ============================================================================
// PRICE COMPARISON - CORS Proxy for Delivery Platforms
// ============================================================================

/**
 * GET /api/price-comparison - Fetch prices from delivery platforms
 * Query params: restaurant_name (e.g., "Tasty Food")
 * 
 * This endpoint acts as a CORS proxy to avoid browser security issues
 * when fetching data from external APIs.
 */
app.get('/api/price-comparison', async (req: Request, res: Response) => {
  try {
    const { restaurant_name } = req.query;

    if (!restaurant_name || typeof restaurant_name !== 'string') {
      return res.status(400).json({
        error: 'Missing required parameter: restaurant_name',
        status: 400,
      });
    }

    // Timeout for external API calls (prevent hanging)
    const timeout = parseInt(process.env.API_TIMEOUT_MS || '5000');

    console.log(`[PriceComparison] Fetching prices for: ${restaurant_name}`);

    // Fetch from delivery platforms with timeout and error handling
    const [uberEats, deliveroo, takeaway] = await Promise.allSettled([
      axios.get(`https://api.uber.com/v2/eats/search?q=${encodeURIComponent(restaurant_name)}`, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }).catch((err) => {
        console.warn('[PriceComparison] Uber Eats failed:', err.message);
        return null;
      }),

      axios.get(`https://api.deliveroo.com/orderapp/v1/search?query=${encodeURIComponent(restaurant_name)}`, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }).catch((err) => {
        console.warn('[PriceComparison] Deliveroo failed:', err.message);
        return null;
      }),

      axios.get(`https://api.takeaway.com/v1/restaurants?deliveryArea=${encodeURIComponent(restaurant_name)}`, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }).catch((err) => {
        console.warn('[PriceComparison] Takeaway failed:', err.message);
        return null;
      }),
    ]);

    // Return results (even if some failed)
    res.json({
      status: 'ok',
      restaurant: restaurant_name,
      timestamp: new Date().toISOString(),
      data: {
        uberEats: uberEats.status === 'fulfilled' && uberEats.value ? uberEats.value.data : null,
        deliveroo: deliveroo.status === 'fulfilled' && deliveroo.value ? deliveroo.value.data : null,
        takeaway: takeaway.status === 'fulfilled' && takeaway.value ? takeaway.value.data : null,
      },
      errors: {
        uberEats: uberEats.status === 'rejected' ? uberEats.reason?.message || 'Failed to fetch' : null,
        deliveroo: deliveroo.status === 'rejected' ? deliveroo.reason?.message || 'Failed to fetch' : null,
        takeaway: takeaway.status === 'rejected' ? takeaway.reason?.message || 'Failed to fetch' : null,
      },
    });
  } catch (error) {
    console.error('[PriceComparison] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch price comparison data',
      status: 500,
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
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

// ============================================================================// ROUTES - RESERVATIONS
// ============================================================================

/**
 * POST /api/reservations - Create a new restaurant reservation
 * Body: { restaurant_id, date, time, party_size, name, email, phone, notes }
 */
app.post('/api/reservations', async (req: Request, res: Response) => {
  try {
    const {
      restaurant_id,
      date,
      time,
      party_size,
      name,
      email,
      phone,
      notes,
    } = req.body;

    // Validation
    const errors: string[] = [];
    if (!restaurant_id) errors.push('restaurant_id is required');
    if (!date) errors.push('date is required');
    if (!time) errors.push('time is required');
    if (!party_size || party_size < 1) errors.push('party_size must be at least 1');
    if (!name) errors.push('name is required');
    if (!email) errors.push('email is required');
    if (!phone) errors.push('phone is required');

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    // Create reservation object
    const reservation = {
      id: uuidv4(),
      restaurant_id,
      date,
      time,
      party_size: parseInt(party_size),
      name,
      email,
      phone,
      notes: notes || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // TODO: Save to Supabase database
    // Example with Supabase:
    // const { data, error } = await supabase
    //   .from('reservations')
    //   .insert([reservation])
    //   .select()
    //   .single();
    //
    // if (error) throw error;

    console.log('[Reservations] New reservation created:', {
      id: reservation.id,
      restaurant: restaurant_id,
      date,
      time,
      party_size,
      customer: name,
    });

    // TODO: Send confirmation email
    // await sendReservationConfirmationEmail(reservation);

    res.status(201).json({
      success: true,
      reservation,
      message: 'Réservation créée avec succès',
    });
  } catch (error: any) {
    console.error('[Reservations] Error creating reservation:', error);
    res.status(500).json({
      error: 'Failed to create reservation',
      message: error?.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/reservations/:id - Get reservation by ID
 */
app.get('/api/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Fetch from database
    // const { data, error } = await supabase
    //   .from('reservations')
    //   .select('*')
    //   .eq('id', id)
    //   .single();
    //
    // if (error || !data) {
    //   return res.status(404).json({ error: 'Reservation not found' });
    // }

    // Mock response for development
    res.json({
      message: 'Reservation retrieval endpoint - database integration pending',
      id,
    });
  } catch (error: any) {
    console.error('[Reservations] Error fetching reservation:', error);
    res.status(500).json({
      error: 'Failed to fetch reservation',
      message: error?.message || 'Internal server error',
    });
  }
});

/**
 * DELETE /api/reservations/:id - Cancel a reservation
 */
app.delete('/api/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Update status in database
    // const { error } = await supabase
    //   .from('reservations')
    //   .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    //   .eq('id', id);
    //
    // if (error) throw error;

    console.log(`[Reservations] Reservation ${id} cancelled`);

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
    });
  } catch (error: any) {
    console.error('[Reservations] Error cancelling reservation:', error);
    res.status(500).json({
      error: 'Failed to cancel reservation',
      message: error?.message || 'Internal server error',
    });
  }
});

// ============================================================================// ERROR HANDLERS
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
  console.log(`🔑 API Key Set:   ${process.env.GEMINI_API_KEY ? "✓" : "✗"}`);
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
