# Architecture

This document describes the system architecture of VoiceScribe.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      End User (Browser)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Frontend (Next.js / Vercel)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pages: Recorder, History, Login, Register             │ │
│  │ Components: Navbar, AudioRecorder, TranscriptList     │ │
│  │ Libs: API client, Auth (JWT), Export (txt/docx)       │ │
│  │ Styles: Tailwind CSS (responsive design)              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST Calls (JSON + Multipart)
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         │
      Audio Blob              ┌─────▼──────────┐
                              │  DeepInfra API │
                              │ (OpenAI Whisper)
                              └─────────────────┘
                                     ▲
                                     │
          ┌──────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│       Backend (Flask / Render)                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Routes:                                            │ │
│  │  • /auth/register, /auth/login        [JWT Auth]     │ │
│  │  • /transcribe  (multipart + JWT)     [DeepInfra]    │ │
│  │  • /transcripts (CRUD + JWT)          [DB Ops]       │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ Modules:                                               │ │
│  │  • auth.py      - User registration & JWT generation  │ │
│  │  • models.py    - SQLAlchemy User & Transcript models │ │
│  │  • transcripts.py - Transcript CRUD routes            │ │
│  │  • speech.py    - DeepInfra API integration           │ │
│  │  • config.py    - Configuration management            │ │
│  │  • extensions.py - Flask extensions (SQLAlchemy, JWT) │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL
                       ▼
┌─────────────────────────────────────────────────────────────┐
│      Database (PostgreSQL / Supabase)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Tables:                                                │ │
│  │  • users (id, email, password_hash, created_at)       │ │
│  │  • transcripts (id, text, user_id, created_at)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Architecture

```
app/
├── page.tsx           # Recorder (main page)
├── layout.tsx         # Root layout with navbar
├── globals.css        # Global styles
├── login/page.tsx     # Login page
├── register/page.tsx  # Register page
└── history/page.tsx   # Transcript history

components/
├── Navbar.tsx         # Navigation header
└── ui/                # Reusable UI components (future)

lib/
├── api.ts            # API client (register, login, transcribe, etc.)
├── auth.ts           # JWT token management (localStorage)
├── types.ts          # TypeScript interfaces
└── export.ts         # File export (txt, docx)
```

### Data Flow: Recording & Transcribing

1. **User Action**: Click "Start Recording" on Recorder page
2. **Audio Capture**: Browser Web Audio API records via MediaRecorder
3. **Stop & Encode**: Audio compressed to WebM format
4. **Upload**: FormData sent to backend `/transcribe` with JWT token
5. **Backend Processing**:
   - Validates JWT token
   - Validates audio file size
   - Sends to DeepInfra API
6. **Transcription**: DeepInfra returns text transcript
7. **Save**: Optional save to database
8. **Response**: JSON sent back with transcript text
9. **Display**: Frontend shows transcript, allows copy/download

### Data Flow: Viewing History

1. **Page Load**: History page fetches `/transcripts` with JWT
2. **Backend Query**: SQLAlchemy queries user's transcripts from DB
3. **Response**: JSON array of transcript objects
4. **Render**: Frontend displays expandable list
5. **Actions**: User can copy, download, or delete

## Authentication Flow

```
┌──────────────────────────────────────┐
│ User enters email & password         │
└──────────────┬───────────────────────┘
               │
               ▼
       ┌─────────────────┐
       │  POST /auth/... │
       └────────┬────────┘
                │
        ┌───────┴────────┐
        │                │
    /register         /login
        │                │
        ▼                ▼
   Create User    Check Credentials
        │                │
        └────────┬───────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Generate JWT Token  │
        │ (HS256 algorithm)   │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │  Return to Client   │  {"access_token": "..."}
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Store in localStorage│
        └────────┬────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │ Include in API requests:   │
        │ Authorization: Bearer <JWT>│
        └────────────────────────────┘
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Transcripts Table

```sql
CREATE TABLE transcripts (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  text TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Security Considerations

### Frontend Security

- ✅ JWT tokens stored in localStorage (not cookies to avoid CSRF)
- ✅ HTTPS only (enforced by hosting platforms)
- ✅ Input validation (email format, password length)
- ✅ No sensitive data in Redux/Context
- ✅ CORS headers prevent cross-site API access

### Backend Security

- ✅ Password hashing with Werkzeug (pbkdf2)
- ✅ JWT signature verification (HS256)
- ✅ User isolation (users can only access own transcripts)
- ✅ Input validation (email format, file size)
- ✅ Rate limiting (future enhancement)
- ✅ CORS whitelist (only specific frontend origin)
- ✅ HTTPS only (via Render)

### API Security

- ✅ All endpoints (except /auth/*) require JWT
- ✅ Token expiration (30 days)
- ✅ File size limits (15 MB max audio)
- ✅ Error messages don't leak sensitive info

## Performance Optimizations

### Frontend

- Next.js App Router (server components by default)
- Automatic code splitting per route
- Image optimization (future)
- CSS-in-JS eliminated (pure Tailwind)
- Web Audio API for efficient recording

### Backend

- Connection pooling (SQLAlchemy)
- Database indexes on user_id, email
- External API calls (DeepInfra) don't block DB
- Gunicorn workers for concurrent requests

### Database

- PostgreSQL with proper indexing
- Supabase replication for redundancy
- Automatic backups

## Scalability

### Current Bottlenecks

1. **Single Render instance** (free tier)
   - Solution: Upgrade to Standard tier for horizontal scaling
   
2. **DeepInfra API rate limits**
   - Solution: Implement queue system (Redis/Celery)
   
3. **Database connections**
   - Solution: Connection pooling (already implemented)

### Scaling Strategy

**Phase 1** (Current): Single instance, ~100 concurrent users  
**Phase 2**: Multiple Render instances, load balancer  
**Phase 3**: Async job queue for transcription  
**Phase 4**: Microservices architecture (separate transcription service)

## Deployment Architecture

```
┌─────────────────────┐
│   GitHub (Code)     │
│  (with branches)    │
└──────────┬──────────┘
           │
      ┌────┴─────────────────┬──────────────┐
      │                      │              │
      ▼                      ▼              ▼
┌──────────────┐      ┌──────────────┐  ┌──────────────┐
│ Vercel Auto  │      │ Render Auto  │  │ Manual DB    │
│ Deploy Fronte│      │ Deploy Backend   │ Setup Supabase
└──────┬───────┘      └──────┬───────┘  └──────┬───────┘
       │                     │                 │
       ▼                     ▼                 ▼
┌──────────────┐      ┌──────────────┐  ┌──────────────┐
│ CDN Global   │      │ Render Server│  │ PostgreSQL   │
│              │      │ (us-east)    │  │ (Supabase)   │
└──────────────┘      └──────────────┘  └──────────────┘
       │                     │                 │
       └─────────────────────┼─────────────────┘
                             │
                    ┌────────▼────────┐
                    │   End Users     │
                    │   (Global CDN)  │
                    └─────────────────┘
```

## Technology Decisions

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend Framework | Next.js 14 | App Router, TypeScript support, great DX |
| Backend Framework | Flask | Lightweight, easy to learn, great for APIs |
| ORM | SQLAlchemy | Most popular, flexible, type-safe with mypy |
| Auth | JWT | Stateless, scales well, simple to implement |
| CSS | Tailwind | Utility-first, no build step, great defaults |
| Deployment Frontend | Vercel | Made by Next.js creators, seamless integration |
| Deployment Backend | Render | Easy, generous free tier, good DX |
| Database | PostgreSQL | Reliable, ACID transactions, great for JSON |
| Speech API | DeepInfra | Good accuracy, generous free tier, simple API |

## Development Tools & Stack

- **Code Editor**: VS Code
- **Language**: TypeScript (frontend), Python (backend)
- **Package Managers**: npm (frontend), pip (backend)
- **Build Tools**: Next.js (frontend), Gunicorn (backend)
- **Testing**: Jest (frontend, future), pytest (backend, future)
- **Linting**: ESLint, Prettier (frontend), Black, Flake8 (backend)
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (future)

## Error Handling

### Frontend

- Try/catch for all API calls
- User-friendly error messages
- Fallback UI states (loading, error, empty)

### Backend

- Try/catch for DeepInfra API calls
- Request validation with jsonify errors
- Proper HTTP status codes (400, 401, 404, 502)
- Logging for debugging (stdout on Render)

### Database

- Foreign key constraints
- Cascading deletes (user deletion removes transcripts)
- Transaction rollback on errors

## Future Architecture Improvements

1. **Async Processing**: Use Celery + Redis for long-running transcriptions
2. **Caching**: Redis for frequently accessed transcripts
3. **Microservices**: Separate transcription service with autoscaling
4. **WebSockets**: Real-time streaming transcription
5. **Message Queue**: Event-driven architecture for scalability
6. **Monitoring**: Sentry for error tracking, Datadog for metrics