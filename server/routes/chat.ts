import { Router, Request, Response } from 'express';
import { generateChatResponse, generateChatStreamResponse } from '../services/geminiService';
import type { ChatRequest, ChatResponse } from '../types/chat';

const router = Router();

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 60 second window
    return true;
  }

  if (limit.count >= 20) {
    // 20 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Validate chat request
 */
function validateChatRequest(body: any): body is ChatRequest {
  if (!body.messages || !Array.isArray(body.messages)) {
    return false;
  }

  if (body.messages.length === 0) {
    return false;
  }

  // Check message format
  for (const msg of body.messages) {
    if (!msg.role || !msg.content) {
      return false;
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      return false;
    }
    if (typeof msg.content !== 'string') {
      return false;
    }
    // Limit message length
    if (msg.content.length > 2000) {
      return false;
    }
  }

  // Limit conversation length
  if (body.messages.length > 50) {
    return false;
  }

  return true;
}

/**
 * POST /api/chat - Non-streaming chat endpoint
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    // Validation
    if (!validateChatRequest(req.body)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const { messages } = req.body as ChatRequest;

    // Call Gemini
    const { text, summary } = await generateChatResponse(messages);

    const response: ChatResponse = {
      message: text,
      summary: summary || undefined,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Chat error:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'Service configuration error' });
    }

    res.status(500).json({ error: 'Failed to generate response. Please try again.' });
  }
});

/**
 * POST /api/chat/stream - Streaming chat endpoint (SSE)
 */
router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    // Validation
    if (!validateChatRequest(req.body)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    const { messages } = req.body as ChatRequest;

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    try {
      // Stream response chunks
      for await (const chunk of generateChatStreamResponse(messages)) {
        // Check if this is the summary chunk
        if (chunk.startsWith('\n__SUMMARY__')) {
          const summaryJson = chunk.replace('\n__SUMMARY__', '');
          res.write(`data: ${JSON.stringify({ type: 'summary', content: summaryJson })}\n\n`);
        } else {
          // Regular text chunk
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        }
      }

      // Send completion message
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (streamError: any) {
      console.error('Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('Chat stream error:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'Service configuration error' });
    }

    res.status(500).json({ error: 'Failed to start stream. Please try again.' });
  }
});

export default router;
