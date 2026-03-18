# VoiceScribe - Real-Time Speech-to-Text Web Application

A modern, full-stack web application that converts spoken language into written text in real-time. Built with Next.js (frontend) and Flask (backend), featuring real-time audio recording, transcript management, and export capabilities.

**Live Demo** (deployed): [Coming Soon]

## Features

✨ **Core Features**
- 🎤 Real-time audio recording with visual feedback
- 📝 Instant speech-to-text transcription via DeepInfra
- 💾 Transcript history with create/read/delete operations
- 🔐 Secure user authentication with JWT
- 📥 Export transcripts as `.txt` or `.docx` files
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🌐 Cross-browser compatibility (Chrome, Firefox, Safari)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Flask 3.x, SQLAlchemy, Flask-JWT-Extended |
| **Database** | PostgreSQL (via Supabase or self-hosted) |
| **Speech API** | DeepInfra (OpenAI Whisper Large v3) |
| **Deployment** | Vercel (frontend), Render (backend) |

## Project Structure

```
speechtotext/
├── frontend/              # Next.js application
│   ├── app/               # Pages and layouts
│   ├── components/        # React components
│   ├── lib/               # Utilities (API, auth, export)
│   ├── package.json
│   └── tailwind.config.ts
├── backend/               # Flask API
│   ├── app/
│   │   ├── __init__.py    # App factory
│   │   ├── auth.py        # JWT authentication
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── config.py      # Configuration
│   │   ├── extensions.py  # Flask extensions
│   │   ├── transcripts.py # Transcript CRUD endpoints
│   │   └── speech.py      # DeepInfra integration
│   ├── requirements.txt
│   ├── run.py             # Entry point
│   └── .env.example
├── docs/
│   ├── api.md             # API documentation
│   └── deployment.md      # Deployment guide
└── README.md

## Quick Start

### Prerequisites

- **Python 3.10+** (backend)
- **Node.js 18+** (frontend)
- **PostgreSQL 12+** (optional; SQLite for development)
- **DeepInfra API Key** (from https://deepinfra.com)

### One-Click Start (Windows)

```bash
start-dev.bat
```

Both backend/frontend auto-start!

### Manual Backend
```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
Backend: **localhost:5000**

### 2) Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
copy .env.local.example .env.local
# Edit .env.local if using a custom backend URL

# Run development server
npm run dev
```

Frontend will be available at **http://localhost:3000**

## Environment Variables

### Backend (`.env`)

```bash
# Flask configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///speech_to_text.db
# postgresql://user:password@localhost:5432/speech_to_text

# Speech-to-Text via DeepInfra
DEEPINFRA_API_KEY=your-api-key-from-deepinfra.com
DEEPINFRA_MODEL=openai/whisper-large-v3

# CORS
FRONTEND_ORIGIN=http://localhost:3000

# File size limits
MAX_AUDIO_MB=15
```

### Frontend (`.env.local`)

```bash
# API base URL (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# For production deployment:
# NEXT_PUBLIC_API_BASE_URL=https://your-backend.render.com
```

## Getting an API Key

1. Visit [DeepInfra](https://deepinfra.com)
2. Sign up for a free account
3. Go to your API keys section
4. Create a new API key
5. Add it to your backend `.env` file as `DEEPINFRA_API_KEY`

## Usage

### Creating an Account

1. Navigate to the **Register** page
2. Enter email and password (min 8 characters)
3. Click **Register** (auto-login after signup)

### Recording & Transcribing

1. On the **Recorder** page, click **Start Recording**
2. Speak clearly into your microphone
3. Click **Stop Recording** when done
4. Wait for transcription to complete (~3-5 seconds)
5. Copy, download as TXT/DOCX, or save to history

### Managing Transcripts

1. Visit the **History** page
2. Click on any transcript to expand and view full text
3. Copy, download, or delete transcripts

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Get JWT access token |

### Transcripts (Requires Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transcribe` | Upload audio & get transcription |
| GET | `/transcripts` | List user's transcripts |
| GET | `/transcripts/<id>` | Get specific transcript |
| DELETE | `/transcripts/<id>` | Delete transcript |

See [docs/api.md](docs/api.md) for detailed endpoint documentation.

## Deployment

### Frontend (Vercel)

```bash
# Vercel handles deployment from GitHub automatically
# Just push to your repository, connect to Vercel, and deploy
```

[Full guide in docs/deployment.md](docs/deployment.md#vercel-frontend)

### Backend (Render)

1. Push your code to GitHub
2. Go to [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo (backend folder)
5. Set environment variables
6. Deploy!

[Full guide in docs/deployment.md](docs/deployment.md#render-backend)

## Development Workflow

### Project Setup

```bash
# Initial setup (one time)
git clone <your-repo>
cd speechtotext
# Follow Quick Start above for both frontend and backend
```

### Development Commands

```bash
# Backend
cd backend
python -m flask --app run.py --debug run   # Dev server with hot reload
python -m flask db upgrade                  # Database migrations (if using Alembic)

# Frontend
cd frontend
npm run dev                                  # Dev server with hot reload
npm run build                               # Production build
npm run lint                                # Check code quality
```

### Database

For PostgreSQL in development:

```bash
# Install PostgreSQL locally or use Supabase
# Update DATABASE_URL in .env to PostgreSQL connection string
# SQLAlchemy will auto-create tables

# For migrations (optional, using Flask-Migrate):
flask db init       # One-time setup
flask db migrate    # After model changes
flask db upgrade    # Apply migrations
```

## Production Checklist

- [ ] Use strong, random `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Set `FLASK_ENV=production`
- [ ] Use PostgreSQL (not SQLite) in production
- [ ] Configure CORS origins for your domain
- [ ] Enable HTTPS everywhere
- [ ] Set up database backups
- [ ] Monitor API logs and errors
- [ ] Use Gunicorn + Nginx (or similar) for Flask
- [ ] Set up CI/CD pipeline (GitHub Actions, etc.)

## Troubleshooting

### "Microphone permission denied"

- Check browser microphone permissions (Settings → Privacy)
- HTTPS is required for microphone access in production

### "Invalid credentials" on login

- Ensure email is registered
- Check password is correct (minimum 8 characters)

### "DeepInfra API error"

- Verify `DEEPINFRA_API_KEY` is correct in `.env`
- Check API key has sufficient quota
- Ensure audio file is in valid format (WebM/WAV)

### CORS errors in browser

- Verify `FRONTEND_ORIGIN` in backend `.env` matches actual frontend URL
- Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env`

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source under the MIT License. See LICENSE file for details.

## Support

- 📧 Email: [your-email]
- 💬 Issues: GitHub Issues
- 📚 Docs: [docs/](docs/)

## Roadmap

### Phase 1 (Done)
- ✅ Basic audio recording
- ✅ Speech-to-text transcription
- ✅ User authentication
- ✅ Transcript history

### Phase 2 (In Progress)
- 🔄 Real-time streaming transcription
- 🔄 Language selection (multi-language support)
- 🔄 Transcript editing and annotations

### Phase 3 (Planned)
- ⬜ Voice activity detection (crop silence)
- ⬜ Batch processing multiple files
- ⬜ Webhook integrations
- ⬜ API rate limiting dashboard
- ⬜ User preferences (theme, language, etc.)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Tailwind CSS](https://tailwindcss.com)
- [DeepInfra API Docs](https://deepinfra.com/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [SQLAlchemy](https://docs.sqlalchemy.org)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io)

---

Built with ❤️ by the VoiceScribe team

## Core Features Implemented

- Browser microphone recording (MediaRecorder)
- Audio upload to `/transcribe`
- DeepInfra transcription integration
- JWT register/login
- Transcript CRUD for authenticated users
- Transcript history + search
- Export as `.txt` and `.docx`
- Responsive UI

## Architecture (Mermaid)

```mermaid
flowchart LR
  U[User Browser] --> F[Next.js Frontend]
  F -->|JWT + REST| B[Flask API]
  B --> D[(PostgreSQL / Supabase)]
  B --> S[DeepInfra Speech API]
```

## API Summary

- `POST /auth/register`
- `POST /auth/login`
- `POST /transcribe`
- `GET /transcripts`
- `GET /transcripts/<id>`
- `DELETE /transcripts/<id>`

Detailed endpoint docs are in `docs/api.md`.

## Deployment Notes

- Deploy `frontend/` to Vercel
- Deploy `backend/` to Render
- Configure CORS to allow frontend origin
- Use managed PostgreSQL URL from Supabase in backend env

## Success Criteria Support

- Cross-browser recording via MediaRecorder API where supported
- Persistence via PostgreSQL
- Export utilities implemented in client
- Mobile-first responsive screens
- Structured error handling and loading states
