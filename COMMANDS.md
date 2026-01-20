# ⚡ Quick Command Reference

## 🚀 Development

```bash
# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Start production server (after build)
npm start

# Check for TypeScript errors
npm run lint
```

## 📦 Package Management

```bash
# Install dependencies
npm install

# Add a new package
npm install package-name

# Remove a package
npm uninstall package-name

# Update all packages
npm update
```

## 🗄️ Supabase

```bash
# Install Supabase CLI (one-time)
npm install -g supabase

# Login to Supabase
supabase login

# Link to remote project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Push local schema
supabase db push
```

## 🐳 Docker (n8n)

```bash
# Run n8n in Docker
docker run -d -p 5678:5678 --name n8n n8nio/n8n

# Stop n8n
docker stop n8n

# Start n8n again
docker start n8n

# View n8n logs
docker logs n8n -f
```

## 🧹 Cleanup

```bash
# Clean build artifacts
rm -rf .next

# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean all (reset to fresh state)
rm -rf .next node_modules package-lock.json
npm install
```

## 🔍 Debugging

```bash
# Check Next.js version
npx next --version

# Check for outdated packages
npm outdated

# Audit for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## 📂 File Operations

```bash
# List all files (including hidden)
ls -la

# Check file sizes
du -sh *

# Find specific files
find . -name "*.tsx"

# Count lines of code
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l
```

## 🌐 Network & Ports

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000 (if stuck)
kill -9 $(lsof -t -i:3000)

# Check all running node processes
ps aux | grep node
```

## 🔑 Environment Variables

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit env file (Mac/Linux)
nano .env.local

# Edit env file (Windows)
notepad .env.local

# Print current env (for debugging)
printenv | grep NEXT_PUBLIC
```

## 📊 Git (if using version control)

```bash
# Initialize git repo
git init

# Add all files
git add .

# Commit with message
git commit -m "Initial commit: Insu-Brain KB Pilot MVP"

# Add remote
git remote add origin https://github.com/username/insu-brain.git

# Push to remote
git push -u origin main

# Check status
git status

# View commit history
git log --oneline
```

## 🚢 Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

## 🧪 Testing (if you add tests later)

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

## 📱 Mobile Testing

```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile device
http://YOUR_LOCAL_IP:3000
```

## 🔄 Useful Aliases (add to .bashrc or .zshrc)

```bash
# Quick start
alias dev="npm run dev"

# Quick build
alias build="npm run build"

# Quick clean
alias clean="rm -rf .next node_modules && npm install"

# Quick deploy
alias deploy="npm run build && vercel --prod"
```

---

## 💡 Most Used Commands (Top 5)

1. `npm run dev` - Start development
2. `npm run build` - Test production build
3. `npm install` - Install dependencies
4. `supabase db push` - Update database
5. `vercel --prod` - Deploy to production

---

## 🆘 Emergency Commands

### Server won't start?
```bash
rm -rf .next
npm run dev
```

### Build failing?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port 3000 already in use?
```bash
kill -9 $(lsof -t -i:3000)
npm run dev
```

### Supabase connection issues?
```bash
# Check env variables
cat .env.local | grep SUPABASE

# Test connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/
```

---

**Bookmark this file for quick access!** 🔖
