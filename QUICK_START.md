# 🚀 Quick Start - 5 Minutes

Get VoiceScribe running on your machine in under 5 minutes.

## Requirements

- Python 3.10+ and Node.js 18+
- A [DeepInfra API key](https://deepinfra.com) (free account)

## ⚡ Lightning Setup

### Terminal 1: Backend

```bash
cd backend
python -m venv .venv

# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env  # Edit: add your DEEPINFRA_API_KEY

python -m flask --app run.py --debug run
```

✅ Backend running at `http://localhost:5000`

### Terminal 2: Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local

npm run dev
```

✅ Frontend running at `http://localhost:3000`

## Production Run (Single VM or Server)

### Backend (Gunicorn)

```bash
cd backend

# Linux/macOS
python3 -m venv .venv
source .venv/bin/activate

# Windows (PowerShell)
# python -m venv .venv
# .\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS

# Required: set strong secrets and production env vars in .env
# FLASK_ENV=production
# SECRET_KEY=<long-random-value>
# JWT_SECRET_KEY=<long-random-value>
# DATABASE_URL=<postgresql-url>
# DEEPINFRA_API_KEY=<your-key>

gunicorn -c gunicorn.conf.py run:app
```

### Frontend (Next.js Production)

```bash
cd frontend
npm install
copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local    # Linux/macOS

# Set NEXT_PUBLIC_API_BASE_URL to your production backend URL
npm run build
npm run start
```

### Recommended Infra

1. Put Nginx or Caddy in front of Flask and Next.js
2. Enable HTTPS with a real certificate
3. Use PostgreSQL (managed or self-hosted)
4. Restrict CORS using FRONTEND_ORIGINS
5. Add logs/metrics and daily DB backups

## 🎤 Test It

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Sign up with any email/password
3. Click **Start Recording**
4. Speak: "Hello, this is a test"
5. Click **Stop Recording**
6. See your transcript appear! ✨

---

## 📚 Next Steps

- **Full setup guide**: [docs/setup.md](docs/setup.md)
- **API reference**: [docs/api.md](docs/api.md)
- **Deployment**: [docs/deployment.md](docs/deployment.md)
- **Architecture**: [docs/architecture.md](docs/architecture.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🆘 Issues?

Check [docs/setup.md#troubleshooting](docs/setup.md#troubleshooting) for common problems.

---

**Ready to build?** See the [full README.md](README.md) for comprehensive information.