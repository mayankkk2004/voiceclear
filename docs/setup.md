# Development Setup Guide

Step-by-step guide to get VoiceScribe running locally.

## Prerequisites

### System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk**: 2 GB free space

### Software

Install these first:

1. **Python 3.10+**
   ```bash
   python --version  # Should be 3.10 or higher
   ```
   [Download Python](https://www.python.org/downloads/)

2. **Node.js 18+**
   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 9.x or higher
   ```
   [Download Node.js](https://nodejs.org/)

3. **Git**
   ```bash
   git --version
   ```
   [Download Git](https://git-scm.com/)

4. **Text Editor** (VS Code recommended)
   [Download VS Code](https://code.visualstudio.com/)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/speechtotext.git
cd speechtotext
```

### 2. Create Backend Directory Structure

The directories should already exist, but verify:

```bash
tree /F backend   # Windows
tree -L 2 backend # macOS/Linux
```

Should show:
```
backend/
├── app/
├── requirements.txt
├── run.py
└── .env.example
```

### 3. Create Frontend Directory Structure

```bash
tree /F frontend  # Windows
tree -L 2 frontend # macOS/Linux
```

Should show:
```
frontend/
├── app/
├── components/
├── lib/
├── package.json
└── .env.local.example
```

## Backend Setup (Flask)

### Step 1: Create Virtual Environment

**Windows (PowerShell)**:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt)**:
```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
```

**macOS/Linux**:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

After activation, your prompt should show `(.venv)` prefix.

### Step 2: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Expected packages:
- Flask
- Flask-CORS
- Flask-JWT-Extended
- Flask-SQLAlchemy
- python-dotenv
- requests
- psycopg2-binary
- gunicorn

### Step 3: Configure Environment

```bash
copy .env.example .env         # Windows
cp .env.example .env           # macOS/Linux
```

Edit `.env` with your settings:

```bash
FLASK_ENV=development
SECRET_KEY=dev-secret-key-12345
JWT_SECRET_KEY=dev-jwt-secret-12345
DATABASE_URL=sqlite:///speech_to_text.db
DEEPINFRA_API_KEY=your-actual-api-key-here
FRONTEND_ORIGIN=http://localhost:3000
MAX_AUDIO_MB=15
```

**Getting DeepInfra API Key**:
1. Go to [deepinfra.com](https://deepinfra.com)
2. Sign up (free account)
3. Go to API Keys section
4. Create a new API key
5. Copy it to `DEEPINFRA_API_KEY=`

### Step 4: Start Backend Server

```bash
python -m flask --app run.py --debug run
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Step 5: Test Backend

In a new terminal:

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status":"ok","env":"development"}

# Test registration
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345"}'

# Should return:
# {"message":"User created successfully"}
```

✅ **Backend is ready!**

## Frontend Setup (Next.js)

### Step 1: Install Dependencies

Open **new terminal** (keep backend running in first terminal):

```bash
cd frontend
npm install
```

Takes 2-3 minutes. Expected packages:
- next
- react
- tailwindcss
- docx
- file-saver

### Step 2: Configure Environment

```bash
copy .env.local.example .env.local     # Windows
cp .env.local.example .env.local       # macOS/Linux
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Step 3: Start Frontend Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 14.2.x
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### Step 4: Test Frontend

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see the **VoiceScribe** app
3. Click **Register** to create an account

✅ **Frontend is ready!**

## Complete Flow Test

### 1. Register Account

1. Go to `/register`
2. Enter email: `test@example.com`
3. Enter password: `Test12345`
4. Click **Register**
5. Auto-login and redirect to home

### 2. Test Recording

1. On home page (Recorder)
2. Click **Start Recording**
3. Speak into your microphone: "Hello, this is a test"
4. Click **Stop Recording**
5. Wait 3-5 seconds for transcription
6. You should see your transcript

### 3. Save to History

1. With active transcript, click **Save**
2. Go to `/history` page
3. You should see your transcript in the list

### 4. Export Transcript

1. On History page, click your transcript
2. Click **Download TXT** or **Download DOCX**
3. File should download to your computer

✅ **Complete flow works!**

## Troubleshooting

### Issues Starting Backend

**Error**: `ModuleNotFoundError: No module named 'flask'`

**Solution**:
```bash
# Ensure virtual environment is activated
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
```

**Error**: `Address already in use`

**Solution**:
Port 5000 is already in use. Kill existing process:

```bash
# macOS/Linux
lsof -i :5000      # Find process ID
kill -9 <PID>      # Kill the process

# Windows (PowerShell)
netstat -ano | findstr :5000     # Find process ID
taskkill /PID <PID> /F           # Kill the process
```

### Issues Starting Frontend

**Error**: `npm: not found`

**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

**Error**: `Port 3000 already in use`

**Solution**:
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Microphone Not Working

**Error**: "Permission denied" or no microphone

**Solutions**:
1. Check browser microphone permissions
   - Chrome: Settings → Privacy → Microphone → Allow localhost:3000
   - Firefox: Check browser notification permissions
   - Safari: System Preferences → Security & Privacy → Microphone

2. Test microphone in system settings first

3. For HTTPS (production), microphone access requires HTTPS

### Cannot Connect Backend to Frontend

**Error**: "Failed to fetch" or "Cannot POST /transcribe"

**Solutions**:

1. Verify both servers are running:
   ```bash
   curl http://localhost:5000/health    # Backend
   curl http://localhost:3000           # Frontend
   ```

2. Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`

3. Verify CORS settings in backend `.env`:
   ```bash
   FRONTEND_ORIGIN=http://localhost:3000
   ```

### Audio Transcription Fails

**Error**: "Failed to call DeepInfra" or "Invalid API key"

**Solution**:

1. Verify API key in backend `.env`:
   ```bash
   DEEPINFRA_API_KEY=your-actual-key
   ```

2. Check DeepInfra account has credit/quota:
   - Go to [deepinfra.com/dashboard](https://deepinfra.com/dashboard)
   - Check "Usage"

3. Test API key manually:
   ```bash
   curl -X POST https://api.deepinfra.com/v1/inference/openai/whisper-large-v3 \
     -H "Authorization: Bearer YOUR_KEY" \
     -F "audio=@test.wav"
   ```

### Database Errors

**Error**: `sqlite3.OperationalError: no such table: users`

**Solution**:

Backend auto-creates tables on startup. If this fails:

```bash
# Delete .db file to reset
rm speech_to_text.db     # macOS/Linux
del speech_to_text.db    # Windows

# Restart backend
python -m flask --app run.py --debug run
```

### JWT Token Issues

**Error**: `Missing Authorization header` or `Invalid token`

**Solution**:

Frontend stores JWT in localStorage. If you need to clear:

```javascript
// In browser console
localStorage.removeItem('stt_access_token')
// Then login again
```

## Development Workflow

### During Development

Keep 3 terminals open:

**Terminal 1** (Backend):
```bash
cd backend
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1
python -m flask --app run.py --debug run
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

**Terminal 3** (For git commands, testing, etc.):
```bash
# Whatever you need
git add .
git commit -m "Feature: Add recording"
```

### Making Changes

1. **Edit code** in VS Code
2. **Save file** (Ctrl+S or Cmd+S)
3. Both backend and frontend auto-reload
4. **Refresh browser** to see frontend changes
5. **Test your changes**

### Database Inspection

For SQLite (development):

```bash
# Install sqlite3 CLI
# macOS: brew install sqlite
# Ubuntu: apt install sqlite3
# Windows: Download from sqlite.org

sqlite3 speech_to_text.db

# In SQLite CLI:
.tables         # Show tables
.schema users   # Show users table structure
SELECT * FROM users;      # View all users
SELECT * FROM transcripts;  # View all transcripts
.exit           # Exit
```

## Useful Commands

### Backend

```bash
# Activate virtual environment
source .venv/bin/activate        # macOS/Linux
.\.venv\Scripts\Activate.ps1     # Windows PowerShell

# Install new package
pip install package-name
pip freeze > requirements.txt    # Update requirements

# Run tests (when added)
pytest

# Code formatting
black app/

# Linting
flake8 app/

# Deactivate virtual environment
deactivate
```

### Frontend

```bash
# Install new package
npm install package-name

# Update dependencies
npm update
npm outdated                # Check for updates

# Run tests (when added)
npm test

# Code formatting
npm run lint

# Build for production
npm run build

# Check build size
npm run build && npm run analyze
```

### Git

```bash
# Check status
git status

# Stage changes
git add .
git add app/*.tsx          # Specific files

# Commit
git commit -m "Feature description"

# Push
git push origin main

# Create branch
git checkout -b feature/my-feature

# Switch branch
git checkout main

# Delete branch
git branch -d feature/my-feature
```

## Next Steps

After successful setup:

1. **Read documentation**:
   - [docs/api.md](../docs/api.md) - API endpoints
   - [docs/architecture.md](../docs/architecture.md) - System design

2. **Make your first contribution**:
   - Fix a small bug
   - Add a feature
   - Improve documentation

3. **Deploy** to production
   - Follow [docs/deployment.md](../docs/deployment.md)

## Getting Help

- 📝 Check [troubleshooting section](#troubleshooting) above
- 📚 Read relevant documentation in `docs/`
- 💬 GitHub Issues
- 🐍 Python docs: https://docs.python.org/3/
- ⚛️ React docs: https://react.dev/
- 🔗 Next.js docs: https://nextjs.org/docs
- 🌶️ Flask docs: https://flask.palletsprojects.com/

---

Happy coding! 🎉