# 🚀 Deployment Guide - Tasty Food Hub

## ⚠️ IMPORTANT: FTP Credentials Issue Detected

The deployment is failing with **"530 Login incorrect"**. This means either:
1. The FTP password `Cometenarabe1589.` is incorrect or has changed
2. The FTP username format is wrong (should it be `u487930812.TasyFoodLiege` or `u487930812_tastyfood.me`?)
3. The FTP server settings have changed on Hostinger

**ACTION REQUIRED**: 
1. Log into **Hostinger cPanel** → **FTP Accounts**
2. Verify the correct FTP username (exact format with dots/underscores)
3. If needed, reset the FTP password
4. Update the command below with the correct credentials

---

## Quick Start (Once Credentials Are Fixed)

To deploy the latest changes to https://tastyfood.me:

```bash
# 1. Set FTP password (use the CORRECT password from Hostinger)
export FTP_PASSWORD="YOUR_ACTUAL_PASSWORD_HERE"

# 2. Run deployment
npm run deploy:hostinger
```

---

## Testing FTP Credentials

Before running the full deployment, test if FTP login works:

```bash
# Test with curl (replace with your actual username/password)
curl --ftp-pasv ftp://USERNAME:PASSWORD@ftp.tastyfood.me/
```

If you get "530 Login incorrect", the credentials are wrong. Fix them before deploying.

---

## Environment Setup

### Linux / Mac / WSL
```bash
export FTP_PASSWORD="Cometenarabe1589."
npm run deploy:hostinger
```

### Windows PowerShell
```powershell
$env:FTP_PASSWORD="Cometenarabe1589."
npm run deploy:hostinger
```

### Windows CMD
```cmd
set FTP_PASSWORD=Cometenarabe1589.
npm run deploy:hostinger
```

---

## FTP Configuration

The deployment uses these credentials (managed in `deploy.js`):

- **Host**: `ftp.tastyfood.me`
- **Username**: `u487930812.TasyFoodLiege`
- **Password**: Set via `FTP_PASSWORD` environment variable
- **Remote Path**: `/public_html/` (contents of `dist/` uploaded here)
- **Port**: 21 (standard FTP)

---

## Deployment Process

When you run `npm run deploy:hostinger`, the script:

1. **Builds** the Vite project → creates `dist/` folder
2. **Verifies** `dist/` contains `index.html` and `assets/`
3. **Connects** to Hostinger FTP server
4. **Clears** old files from `/public_html/` (except important files)
5. **Uploads** all files from `dist/` to `/public_html/`
6. **Verifies** remote structure (checks for index.html, assets/js, assets/css)
7. **Reports** success or failure with detailed logs

---

## Verifying Deployment

After deployment succeeds:

1. **Hard refresh** the site: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. **Check browser tab** - should show new TastyFoodLogo favicon
3. **Open DevTools Console** - verify no errors
4. **Test navigation** - visit /commander, /restaurants, etc.

If you made a specific change (e.g., changed hero text), verify it appears on https://tastyfood.me.

---

## Troubleshooting

### "FTP password not found"
- Solution: Set `export FTP_PASSWORD="..."` before running deploy

### "Build failed"
- Check for TypeScript errors: `npm run lint`
- Fix errors, then try deploying again

### "Connection timeout"
- Hostinger FTP may be temporarily down
- Wait 1 minute and retry: `npm run deploy:hostinger`

### "Deployment succeeded but changes not visible"
- Do a **hard refresh**: `Ctrl+F5`
- Clear browser cache
- Check deployment report JSON for warnings

### "Nested dist/dist/ detected"
- Delete `dist/` folder: `rm -rf dist`
- Rebuild: `npm run build`
- Deploy again: `npm run deploy:hostinger`

---

## Deployment Reports

Every deployment creates a JSON report in the root folder:

```
deployment-report-1234567890.json
```

This contains:
- Timestamp of deployment
- All steps executed
- Errors and warnings
- Files uploaded
- Duration

Use this to debug issues or track deployment history.

---

## Manual Deployment (Fallback)

If automated deployment fails, you can deploy manually:

```bash
# 1. Build the project
npm run build

# 2. Use FileZilla or another FTP client:
#    - Host: ftp.tastyfood.me
#    - Username: u487930812.TasyFoodLiege
#    - Password: Cometenarabe1589.
#    - Upload dist/ contents to /public_html/
```

---

## Important Notes

### ✅ DO
- Always run from project root: `cd /home/ous/projects/lovable-tastyfood`
- Set `FTP_PASSWORD` before deploying
- Use `deploy:hostinger` for production
- Hard refresh browser after deployment

### ❌ DON'T
- Don't use `deploy:old` (deprecated, points to wrong path)
- Don't upload to `/public_html/dist/` (wrong path)
- Don't hard-code password in scripts
- Don't skip the build step

---

## Scripts Reference

- `npm run deploy:hostinger` - **Main deployment command** (recommended)
- `npm run build` - Build Vite app only
- `npm run deploy:old` - Old/deprecated FTP script (DO NOT USE)
- `npm run deploy:manual` - Builds but requires manual FTP upload

---

## Contact

For deployment issues:
- Check deployment-report-*.json files
- Verify FTP credentials are correct
- Contact Hostinger support if FTP is down
