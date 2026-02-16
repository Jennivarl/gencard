# GenCard Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Import Repository
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import `Jennivarl/gencard`

### Step 2: Configure Project
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend` ⚠️ **IMPORTANT!**
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### Step 3: Environment Variables
Add these environment variables in Vercel:

```
GENLAYER_RPC_URL=https://genlayer-testnet.rpc.caldera.xyz/http
GENLAYER_CONTRACT_ADDRESS=0x250d18985aEd716A9d98c84dbcDf9353FcacacBa
```

### Step 4: Deploy
Click "Deploy" and wait ~2 minutes for build to complete.

---

## 🔧 Local Development

### Prerequisites
- Docker Desktop running
- GenLayer CLI installed
- OpenAI API key set: `$env:OPENAIKEY = "your-key"`

### Setup
```powershell
# Start GenLayer localnet
genlayer up

# Install frontend dependencies
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Access at: http://localhost:3000

---

## 📝 Contract Information

**Deployed Contract:** `0x250d18985aEd716A9d98c84dbcDf9353FcacacBa`
**Network:** GenLayer Asimov Testnet
**Explorer:** https://explorer-asimov.genlayer.com/

### Features
- Lenient name validation (accepts initials like "JK", "DJ")
- GenLayer-themed nickname generation
- 5 validator consensus mechanism
- Real AI verification using OpenAI GPT-4
