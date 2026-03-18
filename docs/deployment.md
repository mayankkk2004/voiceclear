# Deployment Guide

Complete guide for deploying VoiceScribe to production.

**Recommended Stack**:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Alternative Hosting](#alternative-hosting)

---

## Prerequisites

- GitHub account with your code pushed
- Vercel account (free tier available)
- Render account (free tier available)
- Supabase account (PostgreSQL database)
- DeepInfra API key

---

## Database Setup (Supabase)

Supabase provides a PostgreSQL database with generous free tier (500 MB).

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it `voicescribe` (or your choice)
4. Set a strong password
5. Select region closest to you
6. Click "Create new project" (wait 2-3 minutes)

### 2. Get Connection String

1. In Supabase dashboard, go to **Project Settings** → **Database**
2. Copy the "Connection string" (URI format)
3. It looks like: `postgresql://postgres:password@host:5432/postgres`
4. Save this — you'll use it for Render

### 3. Verify Connection (Optional)

```bash
# Install psql if you don't have it
brew install postgresql  # macOS
apt install postgresql-client  # Ubuntu

psql postgresql://postgres:password@host:5432/postgres
```

---

## Frontend Deployment (Vercel)

### 1. Prepare Repository

Ensure your GitHub repository structure is:

```
your-repo/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.local.example
├── backend/
│   └── ...
├── docs/
└── README.md
```

Push to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Select your repository
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: `./frontend` (important!)
6. Click "Continue"

### 3. Set Environment Variables

1. Add environment variable:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://your-render-backend.onrender.com` (you'll get this URL after deploying backend, use placeholder for now)
2. Click "Deploy"

### 4. Deployment

- Vercel automatically builds and deploys
- You can view build logs in real-time
- After ~2-3 minutes, your frontend is live at `https://your-project.vercel.app`

### 5. Update Vercel with Backend URL

Once backend is deployed (Render step), update the environment variable:

1. Go to your Vercel project Settings
2. Environment Variables
3. Update `NEXT_PUBLIC_API_BASE_URL` to your actual Render URL
4. Redeploy (Vercel automatically detects changes)

---

## Backend Deployment (Render)

### 1. Prepare for Production

Create `backend/Procfile` (even though Render doesn't strictly need it):

```
web: gunicorn run:app --workers 4 --worker-class sync --bind 0.0.0.0:$PORT --timeout 120
```

Ensure `gunicorn` is in `requirements.txt` (it should be).

### 2. Create Render Web Service

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +"
3. Select "Web Service"
4. Choose your GitHub repository
5. **Name**: `voicescribe-api` (or your project name)
6. **Environment**: Python 3
7. **Region**: Choose closest to your users
8. **Branch**: `main`
9. **Build Command**: `pip install -r requirements.txt`
10. **Start Command**: `gunicorn run:app --workers 2 --worker-class sync --bind 0.0.0.0:$PORT --timeout 120`

### 3. Set Environment Variables

In Render dashboard, go to your service **Environment**:

```bash
# Flask & Security
FLASK_ENV=production
SECRET_KEY=<generate-strong-secret>                    # Use: openssl rand -hex 32
JWT_SECRET_KEY=<generate-strong-jwt-secret>           # Use: openssl rand -hex 32

# Database - From Supabase
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# Speech API
DEEPINFRA_API_KEY=<your-deepinfra-api-key>

# CORS - Will be your Vercel URL
FRONTEND_ORIGIN=https://your-project.vercel.app

# Optional
DEEPINFRA_MODEL=openai/whisper-large-v3
MAX_AUDIO_MB=15
FLASK_DEBUG=0
```

**Generate Strong Secrets**:

```bash
# macOS/Linux
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Deploy

1. Click "Create Web Service"
2. Render builds and deploys (2-5 minutes)
3. Once live, you'll see a URL like: `https://voicescribe-api.onrender.com`
4. Copy this URL

### 5. Update Backend Configuration

1. Go back to your Render service settings
2. Update `FRONTEND_ORIGIN=https://your-project.vercel.app` with actual Vercel URL
3. Render auto-restarts the service

### 6. Test Backend

```bash
# Health check
curl https://your-render-backend.onrender.com/health

# Should return: {"status": "ok", "env": "production"}

# Test registration
curl -X POST https://your-render-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345"}'
```

---

## Post-Deployment

### 1. Update Frontend Environment Variable

In Vercel:

1. Project Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_BASE_URL` to your actual Render backend URL
3. Redeploy

### 2. Test Complete Flow

1. Go to your Vercel frontend URL
2. Register a new account
3. Try recording and transcribing
4. Check history page

### 3. Set Up Monitoring

**Render Dashboard**:
- View logs: Logs tab
- Set up logs streaming for errors

**Vercel Analytics**:
- Build logs auto-saved
- Analytics available on dashboard

### 4. Domain Setup (Optional)

#### Custom Domain on Vercel

1. Vercel Settings → Domains
2. Add your domain (e.g., `voicescribe.com`)
3. Follow DNS configuration steps

#### Custom Domain on Render

1. Render Dashboard → Settings
2. Add custom domain
3. Update DNS records

---

## Scaling Considerations

### Frontend (Vercel)

- Vercel auto-scales globally (no action needed)
- Caching: CDN automatically caches static assets
- No maintenance required

### Backend (Render)

**Free Tier Limitations**:
- Single instance (auto-spins down after 15 min inactivity)
- ~0.5 GB RAM
- Max concurrent connections: ~100

**For Production Scale** (paid plans):
- Use multiple workers: Update `--workers 4` in start command
- Upgrade to Standard tier for dedicated instance
- Monitor memory usage in Render dashboard

**Database (Supabase)**:
- Free tier: 500 MB storage, 2 GB/month egress
- Easy upgrade for more capacity
- Auto-backups included

---

## Continuous Deployment

### Automatic Deployments

Both Vercel and Render automatically deploy when you push to your main branch.

```bash
# Make changes
git add .
git commit -m "Fix bug in recorder"
git push origin main

# Vercel and Render auto-deploy within 1-2 minutes
```

### Preview Deployments (Vercel)

Create a pull request → Vercel auto-creates a preview deployment  
Useful for testing before merging to main.

---

## Troubleshooting

### Frontend Won't Connect to Backend

**Error**: "Failed to call API" or CORS errors

**Solutions**:

1. Verify Render backend is running:
   ```bash
   curl https://your-render-backend.onrender.com/health
   ```

2. Check `NEXT_PUBLIC_API_BASE_URL` in Vercel env vars

3. Verify `FRONTEND_ORIGIN` in Render env vars matches Vercel URL

4. Check Render logs for errors:
   ```
   Render Dashboard → Logs tab
   ```

### Backend Crashes on Startup

1. Check Render logs for error messages
2. Verify database connection string is correct
3. Ensure all required env vars are set
4. Check for syntax errors in code

### Microphone Not Working

This happens when:
- HTTPS is not enabled (use Vercel/Render URLs, not HTTP)
- Browser microphone permissions blocked

**Solution**: Use HTTPS URLs (automatic with Vercel/Render)

### Database Connection Timeout

1. Verify Supabase project is active
2. Check connection string is correct
3. Try connecting with `psql` locally to confirm
4. Supabase may have network restrictions — whitelist IPs if needed

### File Too Large Error

1. Check `MAX_AUDIO_MB` setting in backend env vars
2. Default is 15 MB
3. Verify audio file isn't corrupted

---

## Alternative Hosting

### Frontend Alternatives

| Provider | Pros | Cons |
|----------|------|------|
| **Vercel** | Easiest, free tier great | Limited customization |
| **Netlify** | Great DX, generous free | Slightly slower builds |
| **GitHub Pages** | Ultra free | Static only, no API routes |
| **AWS Amplify** | Scalable, AWS integration | More complex |

### Backend Alternatives

| Provider | Pros | Cons |
|----------|------|------|
| **Render** | Simple, good UX, free tier | Spins down on free tier |
| **Railway** | Fast, generous free tier | Less documentation |
| **Heroku** | Industry standard | Removed free tier ($$) |
| **Fly.io** | Distributed globally | More complex |
| **AWS Lambda** | Serverless, scalable | Cold starts, complex setup |

### Database Alternatives

| Provider | Pros | Cons |
|----------|------|------|
| **Supabase** | Easy setup, free tier | Limited on free tier |
| **Neon** | Fast, generous free | Newer, less documented |
| **AWS RDS** | Scalable, reliable | More expensive |
| **DigitalOcean** | Good value | Not as managed |

---

## Monitoring & Maintenance

### Weekly Checks

1. Test recording & transcription on live app
2. Check error logs in Render
3. Monitor Supabase storage usage
4. Check API quota usage (DeepInfra)

### Monthly Tasks

1. Review user feedback
2. Update dependencies: `npm update`, `pip list --outdated`
3. Check security updates
4. Backup database (Supabase auto-backups)

### Security Best Practices

- [ ] Rotate secrets every 3 months
- [ ] Enable Supabase backups
- [ ] Monitor API key usage
- [ ] Set up rate limiting
- [ ] Use HTTPS everywhere (automatic)
- [ ] Keep dependencies updated

---

## Support

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- DeepInfra Docs: https://deepinfra.com/docs
