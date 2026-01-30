# Chatbot Configuration Checklist

## ✅ Environment Variables

Add these to your `.env` file (backend):

```bash
# Required
GEMINI_API_KEY=AIzaSyBhCBOUD5bjOQEbk1N3LyV9MfbFjJbMaJc

# Optional (for production)
NODE_ENV=production
FRONTEND_URL=https://tastyfood.be
```

### Get Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env` file

---

## ✅ CORS Configuration

Update your Express server CORS settings:

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true,
}));
```

---

## ✅ Content Security Policy (CSP)

Add to your public `_headers` file or server config:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;
```

Or in Vite config for dev:

```typescript
server: {
  headers: {
    'Content-Security-Policy': "connect-src 'self' http://localhost:* https://generativelanguage.googleapis.com"
  }
}
```

---

## ✅ Rate Limiting (Production)

For production, replace the in-memory rate limiter with Redis:

```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 60 second window
  }
  
  return current <= 20; // 20 requests per minute
}
```

---

## ✅ Server Setup

1. **Install dependencies:**
```bash
npm install express @google/generative-ai cors
npm install -D @types/express @types/cors
```

2. **Mount chat routes in server/index.ts:**
```typescript
import chatRoutes from './routes/chat';

app.use('/api', chatRoutes);
```

3. **Start server:**
```bash
npm run dev:server
```

---

## ✅ Frontend Integration

1. **Install dependencies:**
```bash
npm install zustand date-fns
```

2. **Add ChatWidget to App.tsx:**
```typescript
import { ChatWidget } from '@/components/ChatWidget';

function App() {
  return (
    <>
      <Router>
        {/* ... your routes */}
      </Router>
      <ChatWidget />
    </>
  );
}
```

3. **Ensure Framer Motion is installed** (already done):
```bash
npm install framer-motion
```

---

## ✅ API Proxy (Development)

Update `vite.config.ts` to proxy API requests:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
```

---

## ✅ Production Deployment

### Backend:
- Deploy server to Node.js hosting (Heroku, Railway, DigitalOcean)
- Set `GEMINI_API_KEY` environment variable
- Set `FRONTEND_URL` to your production domain
- Enable HTTPS
- Use a proper rate limiting solution (Redis)

### Frontend:
- Update API_BASE in `src/services/chatService.ts` to your backend URL:
```typescript
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.tastyfood.be/api'
  : '/api';
```

- Build and deploy:
```bash
npm run build
```

---

## ✅ Testing Checklist

- [ ] Chat opens when clicking launcher button
- [ ] Messages send and receive responses
- [ ] Streaming works (text appears word-by-word)
- [ ] Context bar shows restaurant/platform when bot recommends
- [ ] Action buttons work (open Uber Eats, Deliveroo, Google Maps)
- [ ] Mobile UI works (full-screen panel, touch-friendly)
- [ ] Error handling works (try disconnecting internet)
- [ ] Rate limiting works (send 21+ messages in 1 minute)
- [ ] Clear conversation button works
- [ ] Close/reopen chat preserves conversation

---

## ✅ Privacy & Logging

**What we log:**
- Server logs: timestamps, IP addresses (for rate limiting), request/response errors
- NO full conversation history stored permanently
- NO personal data (email/phone) stored without user consent

**Recommendations:**
- Add privacy notice in chat footer
- Implement conversation history DB only if needed for customer support
- Add GDPR-compliant data retention policy
- Consider end-to-end encryption for sensitive conversations

---

## 🚀 Optional Enhancements

1. **Conversation persistence:**
   - Save chat history to localStorage
   - Sync across devices with user accounts

2. **Analytics:**
   - Track common intents (menu_info, order_help, etc.)
   - Monitor response quality
   - A/B test different prompts

3. **Multilingual:**
   - Auto-detect language from browser
   - Switch between FR/EN/NL seamlessly

4. **Advanced features:**
   - Voice input/output
   - Image upload for menu questions
   - Proactive suggestions based on page context

---

## ❓ Troubleshooting

### Chat doesn't open:
- Check browser console for errors
- Verify Framer Motion is installed
- Check z-index conflicts with other components

### No responses from bot:
- Verify `GEMINI_API_KEY` is set
- Check backend logs for API errors
- Test backend directly: `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"test"}]}'`

### Streaming doesn't work:
- Check CORS settings
- Verify SSE headers are set correctly
- Try non-streaming endpoint first (`/api/chat`)

### Rate limiting too strict:
- Adjust limits in `server/routes/chat.ts`
- Implement user-based limits instead of IP-based
- Use Redis for distributed rate limiting
