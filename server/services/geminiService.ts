import { GoogleGenerativeAI } from '@google/generative-ai';
import { CHATBOT_SYSTEM_PROMPT } from '../config/chatbotPrompt';
import type { ChatMessage, RequestSummary } from '../types/chat';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Extract JSON summary from bot response
 */
function extractSummary(text: string): RequestSummary | null {
  try {
    // Look for REQUEST_SUMMARY JSON block
    const match = text.match(/REQUEST_SUMMARY\s*=\s*({[\s\S]*?})/);
    if (match) {
      const jsonStr = match[1];
      return JSON.parse(jsonStr);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse REQUEST_SUMMARY:', error);
    return null;
  }
}

/**
 * Clean bot response by removing JSON summary block
 */
function cleanResponse(text: string): string {
  return text
    .replace(/```json[\s\S]*?REQUEST_SUMMARY[\s\S]*?```/g, '')
    .replace(/REQUEST_SUMMARY\s*=\s*{[\s\S]*?}/g, '')
    .trim();
}

/**
 * Call Gemini with conversation history (non-streaming)
 */
export async function generateChatResponse(messages: ChatMessage[]): Promise<{ text: string; summary: RequestSummary | null }> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: CHATBOT_SYSTEM_PROMPT
  });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const fullText = response.text();

  const summary = extractSummary(fullText);
  const cleanText = cleanResponse(fullText);

  return { text: cleanText, summary };
}

/**
 * Call Gemini with streaming response
 */
export async function* generateChatStreamResponse(messages: ChatMessage[]): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: CHATBOT_SYSTEM_PROMPT
  });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage.content);

  let accumulatedText = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    accumulatedText += chunkText;
    yield chunkText;
  }

  // After streaming completes, extract and send summary as final chunk
  const summary = extractSummary(accumulatedText);
  if (summary) {
    yield `\n__SUMMARY__${JSON.stringify(summary)}`;
  }
}
