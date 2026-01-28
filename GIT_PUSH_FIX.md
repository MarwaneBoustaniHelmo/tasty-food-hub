# Fix Git Push – Remote Not Found

## Current status

- **Remote:** `origin` → `https://github.com/MarwaneBoustaniHelmo/tastyfood-hub.git`
- **Error:** `remote: Repository not found.` (repo missing, renamed, or no access)
- **Local:** 3 commits ahead of `origin/main`

## Fix steps

### 1. Check remote

```bash
git remote -v
```

### 2. Update remote URL (if repo moved)

If the repo was renamed, transferred, or you use a different GitHub user/org:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repo name.

### 3. Push

```bash
git push origin main
```

### 4. Verify

- Open `https://github.com/YOUR_USERNAME/YOUR_REPO` in a browser.
- Confirm the 3 local commits appear on `main`.

## If you create a new repo

1. Create a new repository on GitHub (do **not** initialize with README).
2. Run:

   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/NEW_REPO.git
   git push -u origin main
   ```

## Recent local commits (to push)

- Performance optimization: target score 95+
- feat: integrate Phase 2 support ticket system with chatbot
- Initial commit Tasty Food Hub
