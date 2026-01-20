# SSE Streaming Deployment Guide

Complete guide for deploying the Server-Sent Events (SSE) streaming system to production.

## Architecture Overview

```
Frontend (Vite)          Backend (Express)         LLM API
Port 8080               Port 3001                 Claude
     │                       │                        │
     ├─ StreamingChat       ├─ /api/chat/stream     │
     ├─ useStreamingChat    ├─ Rate Limiting        │
     └─ streamManager ─────►└─ serverStreamManager ─►│
        (SSE Client)           (SSE Server)           │
```

## Prerequisites

### Environment Variables

**Backend (`server/.env`):**
```env
# Required
ANTHROPIC_API_KEY=sk-ant-api03-...
API_PORT=3001

# Optional
NODE_ENV=production
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
```

**Frontend (`.env`):**
```env
VITE_API_URL=https://api.tastyfood.be
```

## Local Development

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install
```

### 2. Start Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 3. Test Streaming

Open browser: `http://localhost:8080/streaming-demo`

## Production Deployment

### Option 1: Separate Deployments

**Backend (Express):**
- Deploy to: Railway, Render, Fly.io, or VPS
- Configure environment variables
- Ensure CORS allows frontend origin
- Set up health checks: `GET /health`

**Frontend (Vite):**
- Deploy to: Netlify, Vercel, Cloudflare Pages
- Build: `npm run build`
- Set `VITE_API_URL` to backend URL
- Configure redirects for SPA routing

### Option 2: Unified Deployment

Serve frontend from Express backend:

```typescript
// server/index.ts
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.post('/api/chat/stream', ...);
app.get('/api/menu', ...);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

Build process:
```bash
# 1. Build frontend
npm run build

# 2. Copy dist to server
cp -r dist server/

# 3. Deploy server
cd server
npm start
```

## Configuration Details

### Rate Limiting

Current implementation uses in-memory storage (single server):

```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
```

**For production with multiple servers**, use Redis:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const key = `rate_limit:${ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 60 seconds
  }
  
  return { allowed: count <= 10 };
}
```

### CORS Configuration

For production, specify exact origins:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://tastyfood.be',
    'https://www.tastyfood.be',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
}));
```

### Timeout Configuration

Adjust based on expected response times:

```typescript
// server/streaming/serverStreamManager.ts
export class ServerStreamManager {
  private timeout: number = 60000; // 60 seconds
  
  // For faster responses
  private timeout: number = 30000; // 30 seconds
}
```

## Monitoring & Logging

### Add Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// In streaming endpoint
app.post('/api/chat/stream', async (req, res) => {
  logger.info('Streaming request', { 
    ip: req.ip, 
    message: req.body.message?.substring(0, 50) 
  });
  
  try {
    await serverStreamManager.streamToSSE(res, req.body.message);
    logger.info('Stream completed');
  } catch (error) {
    logger.error('Streaming error', { error });
  }
});
```

### Add Performance Metrics

```typescript
// Track streaming performance
let totalRequests = 0;
let totalTokens = 0;
let totalDuration = 0;

app.get('/api/metrics', (req, res) => {
  res.json({
    totalRequests,
    totalTokens,
    avgTokensPerRequest: totalTokens / totalRequests,
    avgDurationMs: totalDuration / totalRequests,
  });
});
```

## Health Checks

Implement comprehensive health checks:

```typescript
app.get('/health', async (req, res) => {
  const checks = {
    server: 'ok',
    anthropic: 'unknown',
    timestamp: Date.now(),
  };

  // Test Anthropic API
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }],
    });
    checks.anthropic = 'ok';
  } catch (error) {
    checks.anthropic = 'error';
  }

  const status = checks.anthropic === 'ok' ? 200 : 503;
  res.status(status).json(checks);
});
```

## Scaling Considerations

### Horizontal Scaling

When running multiple server instances:

1. **Shared Rate Limiting**: Use Redis
2. **Session Affinity**: Not required (stateless)
3. **Load Balancer**: Any (Nginx, AWS ALB, etc.)

### Vertical Scaling

Memory usage per streaming connection: ~1-2 MB

**Recommendations:**
- 512 MB RAM: ~200 concurrent streams
- 1 GB RAM: ~400 concurrent streams
- 2 GB RAM: ~800 concurrent streams

### SSE Connection Limits

Most browsers limit SSE connections per domain to 6.

**Solution**: Use HTTP/2 which removes this limit:

```typescript
import http2 from 'http2';
import fs from 'fs';

const server = http2.createSecureServer({
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem'),
});

server.on('stream', (stream, headers) => {
  // Handle HTTP/2 streams
});
```

## Troubleshooting

### Issue: Connections Timeout

**Symptoms:** SSE connections close after 30-60 seconds

**Solutions:**
1. Check proxy/load balancer timeout settings
2. Send periodic keepalive messages:

```typescript
// In serverStreamManager.ts
stream.on('text', (text: string) => {
  this.sendSSE(res, chunk);
  
  // Reset keepalive timer
  clearTimeout(keepaliveTimer);
  keepaliveTimer = setTimeout(() => {
    res.write(':keepalive\n\n');
  }, 15000);
});
```

### Issue: Rate Limit False Positives

**Symptoms:** Legitimate users getting 429 errors

**Solutions:**
1. Use user auth instead of IP
2. Implement sliding window algorithm
3. Increase limits for authenticated users

### Issue: Memory Leaks

**Symptoms:** Memory usage increases over time

**Solutions:**
1. Clean up rate limit map periodically:

```typescript
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Every minute
```

2. Ensure proper stream cleanup:

```typescript
req.on('close', () => {
  stream.abort(); // Cancel Anthropic stream
  clearTimeout(timeoutId);
});
```

## Performance Optimization

### 1. Connection Pooling

Reuse HTTP connections to Anthropic:

```typescript
import https from 'https';

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  httpAgent: httpsAgent,
});
```

### 2. Response Compression

Enable gzip for non-streaming routes:

```typescript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    // Don't compress SSE streams
    if (req.path === '/api/chat/stream') {
      return false;
    }
    return compression.filter(req, res);
  },
}));
```

### 3. Buffer Size Tuning

Adjust buffer size based on network conditions:

```typescript
// Fast networks: smaller buffer (faster updates)
private bufferSize: number = 256;

// Slow networks: larger buffer (fewer packets)
private bufferSize: number = 2048;
```

## Security Checklist

- [ ] API key stored in server environment only
- [ ] Rate limiting enabled
- [ ] CORS configured for specific origins
- [ ] HTTPS enabled in production
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Logging doesn't include user message content
- [ ] Health check doesn't expose API keys
- [ ] Proper HTTP security headers (Helmet.js)
- [ ] Request size limits configured

## Next Steps

1. ✅ Replace client-side streaming with SSE
2. 🔄 Apply database migrations for RAG system
3. 🔄 Configure production environment variables
4. 🔄 Deploy backend to production server
5. 🔄 Deploy frontend with production API URL
6. 🔄 Set up monitoring and alerting
7. 🔄 Load test streaming endpoint
8. 🔄 Document any custom configurations

---

For questions or issues, refer to the main [STREAMING_GUIDE.md](./STREAMING_GUIDE.md).
