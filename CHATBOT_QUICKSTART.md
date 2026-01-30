# 🚀 Chatbot Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Get Gemini API Key (1 min)
```bash
# Visit: https://makersuite.google.com/app/apikey
# Click "Create API Key"
# Copy the key
```

### 2. Configure Environment (30 sec)
Create/update `.env` in root:
```bash
GEMINI_API_KEY=your_actual_key_here
NODE_ENV=development
```

### 3. Start Backend (1 min)
```bash
cd server
npm install  # If not already done
npm run dev  # Should start on http://localhost:3000
```

### 4. Start Frontend (1 min)
```bash
# In project root
npm run dev  # Should start on http://localhost:5173
```

### 5. Test (1 min)
1. Open http://localhost:5173
2. Look for orange chat button (bottom-right corner)
3. Click it - chat panel should open
4. Type: "Je veux commander un burger à Seraing"
5. Bot should respond with streaming text + Uber Eats button

---

## ✅ What You Should See

### Chat Launcher:
- Orange circular button with message icon
- Bottom-right corner, floating above content
- Smooth scale animation when appearing

### Chat Panel:
- Opens with smooth spring animation
- Gradient header "Crousty by Tasty"
- Welcome message with bot emoji
- Text input at bottom with send button

### Bot Response:
- Text appears word-by-word (streaming)
- Bot avatar (orange gradient circle)
- Formatted with proper line breaks
- Context bar appears if restaurant mentioned
- Action button (e.g., "Commander sur Uber Eats")

### Mobile:
- Full-screen panel (covers entire viewport)
- Large touch targets for buttons
- Smooth slide-up animation
- Backdrop darkens background

---

## 🐛 Common Issues & Fixes

### Chat button doesn't appear:
```bash
# Check browser console for errors
# Verify ChatWidget is imported in App.tsx
# Check z-index conflicts with other components
```

### Bot doesn't respond:
```bash
# 1. Verify Gemini API key
echo $GEMINI_API_KEY  # Should show your key

# 2. Check backend is running
curl http://localhost:3000/api/health  # Should return JSON

# 3. Test chat endpoint directly
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
# Should return bot response JSON
```

### Streaming doesn't work:
```bash
# Check browser Network tab
# Look for /api/chat/stream request
# Should show "text/event-stream" content type
# Check for CORS errors in console
```

### Context bar doesn't show:
```bash
# Bot must mention a restaurant/platform
# Try: "Je veux commander à Wandre"
# Check browser console for JSON parse errors
```

---

## 🎯 Quick Test Commands

Try these messages to test different features:

### Order Help:
```
"Je veux commander un burger"
"Commander à Seraing"
"C'est ouvert maintenant?"
```
**Expected**: Bot suggests platforms, shows action button

### Menu Questions:
```
"C'est quoi vos burgers?"
"Vous avez des frites loaded?"
"C'est halal?"
```
**Expected**: Menu information, no action button

### Restaurant Info:
```
"Adresse de Saint-Gilles?"
"Comment aller à Angleur?"
"Vous avez un parking?"
```
**Expected**: Address info, possible Maps button

### Complaints:
```
"Ma commande était froide"
"Il manquait des frites"
"Service très lent"
```
**Expected**: Apology, request for email, urgency indicator

### Game Info:
```
"C'est quoi le jeu Snake?"
"Comment je gagne un menu gratuit?"
```
**Expected**: Game explanation, no action button

---

## 📊 Verify Everything Works

### Checklist:
- [ ] Chat button visible and clickable
- [ ] Panel opens/closes smoothly
- [ ] Welcome message appears
- [ ] Can type and send messages
- [ ] Bot responds (streaming text)
- [ ] Context bar shows for restaurant mentions
- [ ] Action buttons work (open correct URLs)
- [ ] Mobile view works (full-screen panel)
- [ ] Clear conversation button works
- [ ] Error states work (disconnect internet and retry)
- [ ] Rate limiting works (send 21+ messages rapidly)

---

## 🔧 Advanced Configuration

### Change Bot Name:
`server/config/chatbotPrompt.ts` - Edit first line:
```typescript
export const CHATBOT_SYSTEM_PROMPT = `Tu es "VOTRE_NOM_ICI"...`
```

### Add New Restaurant:
`server/config/chatbotPrompt.ts` - Add to restaurant list:
```
5. **Nouveau Restaurant**
   - Adresse: ...
   - Horaires: ...
   - Commander: ...
```

### Customize Colors:
`src/components/ChatWidget.tsx`:
```tsx
// Launcher button gradient
className="... from-amber-500 to-orange-600"

// Panel header gradient
className="... from-amber-500 to-orange-600"
```

### Adjust Message Limits:
`server/routes/chat.ts`:
```typescript
if (msg.content.length > 2000) { // Increase to 5000
if (body.messages.length > 50) { // Increase to 100
if (limit.count >= 20) { // Increase to 30
```

---

## 📱 Mobile Testing

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select iPhone/Android device
4. Refresh page
5. Test chat - should be full-screen

**Or use real device:**
```bash
# Find your local IP
ifconfig  # or ipconfig on Windows

# Access from phone browser
http://192.168.x.x:5173
```

---

## 🚀 Production Deployment

See `CHATBOT_SETUP.md` for full checklist, but quick steps:

1. **Backend:**
   - Deploy to Node.js host (Heroku, Railway, etc.)
   - Set `GEMINI_API_KEY` env var
   - Enable HTTPS
   - Use Redis for rate limiting

2. **Frontend:**
   - Update API URL in `src/services/chatService.ts`:
     ```typescript
     const API_BASE = 'https://api.tastyfood.be/api';
     ```
   - Build: `npm run build`
   - Deploy dist/ to hosting

3. **Test:**
   - Verify CORS allows your domain
   - Check CSP doesn't block Gemini API
   - Test from production URL

---

## 💡 Pro Tips

1. **Start Simple**: Test with basic messages first before complex scenarios
2. **Check Logs**: Backend logs show all Gemini API calls
3. **Use Streaming**: Much better UX than waiting for full response
4. **Monitor Usage**: Gemini has free tier limits (check usage dashboard)
5. **Iterate Prompt**: Adjust system prompt based on real user interactions
6. **Add Analytics**: Track common intents to improve responses

---

## 🎓 Learning Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React Chat UI Patterns](https://chatscope.io/)

---

## 📞 Need Help?

1. Check `CHATBOT_IMPLEMENTATION.md` for detailed architecture
2. Review `CHATBOT_SETUP.md` for configuration details
3. Look at code comments in files for inline documentation
4. Test backend directly with curl to isolate issues
5. Check browser console and backend logs for errors

---

**That's it! Your chatbot is ready to serve customers! 🍔🤖**
