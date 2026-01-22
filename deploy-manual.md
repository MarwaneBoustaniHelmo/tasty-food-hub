# 📦 Manual Deployment Guide - Tasty Food Hub

Complete step-by-step guide for deploying your React Vite site to Hostinger using FileZilla.

---

## 🎯 Prerequisites

- ✅ FileZilla Client installed ([Download here](https://filezilla-project.org/))
- ✅ FTP credentials for tastyfood.me
- ✅ Node.js 18+ installed
- ✅ Project source code at `/home/ous/projects/lovable-tastyfood`

---

## 📝 Step-by-Step Instructions

### **STEP 1: Build the Project** ⚙️

1. Open terminal/command prompt
2. Navigate to project directory:
   ```bash
   cd /home/ous/projects/lovable-tastyfood
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Build the production version:
   ```bash
   npm run build
   ```

5. **Verify build output:**
   - Check that `dist/` folder exists
   - Confirm `dist/index.html` is present
   - Confirm `dist/assets/` folder contains `.js` and `.css` files
   - ⚠️ **IMPORTANT:** Ensure there's NO nested `dist/dist/` folder!

**Expected structure:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images and other assets]
└── favicon.ico (if exists)
```

---

### **STEP 2: Configure FileZilla** 🔧

1. Open FileZilla Client

2. Go to **File → Site Manager** (Ctrl+S / Cmd+S)

3. Click **"New Site"** and name it: `Tasty Food - Hostinger`

4. Enter connection details:
   ```
   Protocol:   FTP - File Transfer Protocol
   Host:       72.60.93.15
   Port:       21
   Encryption: Use explicit FTP over TLS if available
   Logon Type: Normal
   User:       u487930812_tastyfood.me
   Password:   [Your FTP Password]
   ```

5. Click **"Connect"**

6. **If certificate warning appears:**
   - Check "Always trust this certificate"
   - Click "OK"

---

### **STEP 3: Navigate to Upload Directory** 📂

1. In the **right panel** (remote server), navigate to:
   ```
   /public_html/
   ```

2. **Check if `dist/` folder exists:**
   - ✅ **If it exists:** Right-click → Delete (to remove old files)
   - ❌ **If it doesn't exist:** Right-click → Create directory → Name it `dist`

3. Double-click `dist` folder to enter it

4. You should now see:
   ```
   Remote site: /public_html/dist
   ```

---

### **STEP 4: Upload Files** ⬆️

1. In the **left panel** (local computer), navigate to:
   ```
   /home/ous/projects/lovable-tastyfood/dist/
   ```

2. **Select ALL files and folders** inside `dist/`:
   - index.html
   - assets/ folder
   - Any other files (favicon, robots.txt, etc.)

3. **Right-click → Upload**

4. **Monitor the upload:**
   - Bottom panel shows transfer queue
   - Wait until "Transfer finished" appears
   - Check for any failed transfers (red X marks)

5. **Typical upload time:** 2-5 minutes depending on connection

---

### **STEP 5: Verify File Permissions** 🔐

1. In FileZilla, right-click on `index.html` (remote side)
2. Select **"File permissions..."**
3. Set numeric value to: **644**
4. Check boxes: `Read` for Owner/Group/Public, `Write` for Owner only
5. Click "OK"

6. Right-click on `assets` folder
7. Select **"File permissions..."**
8. Set to: **755** for folders
9. Check "Recurse into subdirectories"
10. Select "Apply to directories only"
11. Click "OK"

---

### **STEP 6: Verify Remote Structure** ✅

Ensure your remote structure looks like this:

```
/public_html/
├── dist/
│   ├── index.html (644)
│   ├── assets/ (755)
│   │   ├── index-[hash].js
│   │   ├── index-[hash].css
│   │   └── [other assets]
│   └── [other files]
├── default.php
└── [other Hostinger files]
```

**⚠️ CRITICAL:** Make sure there's NO `/public_html/dist/dist/` structure!

---

### **STEP 7: Configure .htaccess (if needed)** ⚙️

If your site is in a subdirectory (`/dist/`), you need to redirect traffic:

1. In `/public_html/`, check if `.htaccess` exists
2. If not, create it (Right-click → Create file → Name it `.htaccess`)
3. Right-click `.htaccess` → View/Edit
4. Add this content:

```apache
# Redirect all traffic to /dist/ folder
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/dist/
RewriteRule ^(.*)$ /dist/$1 [L]

# SPA Routing - Redirect all non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^dist/(.*)$ /dist/index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

5. Save and close

---

### **STEP 8: Test Your Deployment** 🧪

1. **Clear your browser cache:**
   - Chrome/Edge: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
   - Select "Cached images and files"
   - Click "Clear data"

2. **Visit your site:**
   ```
   https://tastyfood.me
   ```

3. **Check for issues:**
   - ✅ Homepage loads correctly
   - ✅ Images display
   - ✅ Navigation works
   - ✅ No console errors (F12 → Console)
   - ✅ Styles applied correctly

4. **Test multiple pages:**
   - `/` (Home)
   - `/restaurants`
   - `/commander` (Order)
   - `/menu`
   - `/contact`

5. **Test on mobile:**
   - Open on your phone
   - Check responsive design
   - Test mobile menu

---

## 🚨 Common Issues & Solutions

### **Issue 1: Blank White Screen**
**Cause:** Incorrect base path or missing files

**Solution:**
1. Check browser console (F12) for 404 errors
2. Verify all files uploaded successfully
3. Check `.htaccess` redirects correctly
4. Ensure `index.html` is in `/public_html/dist/`

---

### **Issue 2: 404 on Page Refresh**
**Cause:** SPA routing not configured

**Solution:**
1. Add `.htaccess` with SPA routing rules (see Step 7)
2. Verify RewriteEngine is enabled on server
3. Contact Hostinger support to enable `mod_rewrite`

---

### **Issue 3: CSS/JS Not Loading**
**Cause:** Wrong base path in built files

**Solution:**
1. Check `vite.config.ts` for correct base path
2. Rebuild with: `npm run build`
3. Re-upload all files

---

### **Issue 4: Images Not Displaying**
**Cause:** Incorrect file permissions or missing files

**Solution:**
1. Check file permissions: 644 for files, 755 for folders
2. Verify all images uploaded to `assets/` folder
3. Check browser console for 403/404 errors

---

### **Issue 5: Old Version Still Showing**
**Cause:** Browser or CDN cache

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. Try incognito/private mode
4. Wait 5-10 minutes for CDN cache to expire

---

## 🔄 Rollback Instructions

If deployment fails or breaks the site:

1. **Keep a backup:** Before uploading, download current `/public_html/dist/` to your computer

2. **To rollback:**
   - Delete current `dist/` folder on remote
   - Upload backup files from your computer
   - Refresh site

3. **Alternative:** Use Hostinger's backup feature:
   - Go to hPanel → Backups
   - Restore previous backup

---

## 📋 Pre-Deployment Checklist

Before uploading, verify:

- [ ] Project builds successfully (`npm run build`)
- [ ] `dist/` folder contains `index.html`
- [ ] `dist/assets/` contains JS and CSS files
- [ ] No nested `dist/dist/` folder
- [ ] All images and assets present
- [ ] FileZilla connected successfully
- [ ] Remote directory cleared of old files
- [ ] Backup of current site saved (if updating)

---

## 📋 Post-Deployment Checklist

After uploading, verify:

- [ ] https://tastyfood.me loads successfully
- [ ] All pages accessible
- [ ] Images display correctly
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] No console errors (F12)
- [ ] Forms work (contact, order)
- [ ] Chatbot functional
- [ ] Language switcher works
- [ ] SEO meta tags present (view source)

---

## 🆘 Need Help?

**Hostinger Support:**
- 24/7 Live Chat: [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
- Knowledge Base: [https://support.hostinger.com](https://support.hostinger.com)
- Email: support@hostinger.com

**FileZilla Documentation:**
- [https://wiki.filezilla-project.org/](https://wiki.filezilla-project.org/)

**Common Hostinger Issues:**
- [FTP Connection Guide](https://support.hostinger.com/en/articles/1583245-how-to-upload-files-using-ftp)
- [.htaccess Tutorial](https://support.hostinger.com/en/articles/1583275-how-to-use-htaccess)

---

## 📞 Contact

- **Domain:** tastyfood.me
- **Server:** server2067 (Europe - France)
- **FTP User:** u487930812_tastyfood.me
- **Support:** Hostinger 24/7 Chat

---

**Last Updated:** January 22, 2026  
**Version:** 1.0.0
