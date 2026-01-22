# 🚀 QUICK START - Deploy to Hostinger

## Option 1: Automated Deployment (3 minutes)

```bash
# 1. Create credentials file
cp .env.example.deploy .env.deploy

# 2. Edit .env.deploy - add your FTP password
nano .env.deploy
# or
code .env.deploy

# 3. Deploy!
npm run deploy
```

## Option 2: Manual Deployment (10 minutes)

```bash
# 1. Build the project
npm run build

# 2. Follow the detailed guide
cat deploy-manual.md
# or open deploy-manual.md in your editor

# 3. Upload via FileZilla
# - Host: 72.60.93.15
# - User: u487930812_tastyfood.me
# - Upload dist/ to /public_html/dist/
```

## 📚 Full Documentation

- **README-DEPLOY.md** - Complete deployment guide
- **deploy-manual.md** - Step-by-step FileZilla instructions
- **deployment-checklist.txt** - Pre/post deployment checklist

## ⚠️ Important

- Never commit `.env.deploy` (contains password)
- Always test locally before deploying: `npm run preview`
- Keep backups of live site before updating

## 🆘 Need Help?

- Hostinger Support: 24/7 live chat at hpanel.hostinger.com
- Check troubleshooting section in README-DEPLOY.md

---

**Your site:** https://tastyfood.me  
**Server:** 72.60.93.15 (Europe - France)
