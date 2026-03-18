# Contributing to VoiceScribe

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Assume good faith
- Focus on the code, not the person
- Help others learn

## How to Contribute

### 1. Report Bugs

Found a bug? Create an issue:

1. Go to [GitHub Issues](https://github.com/yourrepo/issues)
2. Click "New Issue"
3. Select "Bug Report"
4. Fill in:
   - **Title**: Short description
   - **Environment**: OS, browser, versions
   - **Steps to Reproduce**: Clear steps
   - **Expected Behavior**: What should happen
   - **Actual Behavior**: What actually happened
   - **Screenshots**: If applicable

### 2. Suggest Enhancements

Have an idea? Create a feature request:

1. Go to [GitHub Issues](https://github.com/yourrepo/issues)
2. Click "New Issue"
3. Select "Feature Request"
4. Describe:
   - **Use Case**: Why is this needed?
   - **Proposed Solution**: Your idea
   - **Alternatives**: Other approaches considered
   - **Examples**: Reference implementations if possible

### 3. Submit Code Changes

#### Setup Development Environment

Follow the [Setup Guide](./setup.md) to get everything running locally.

#### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `style/` - Code style (formatting)
- `test/` - Test additions

#### Make Your Changes

1. Edit code following the style guide (below)
2. Keep commits small and focused
3. Write clear commit messages

**Good commit message**:
```
feat: Add real-time transcription streaming

- Implement WebSocket connection to backend
- Add TranscriptStream component
- Update API integration for streaming
```

**Bad commit message**:
```
fix stuff
```

#### Code Style

##### Python (Backend)

```bash
# Format code
black app/

# Check style
flake8 app/

# Type check
mypy app/
```

Follow [PEP 8](https://pep8.org/):
- 4 spaces indentation
- Max line length: 88 (Black standard)
- Use type hints
- Docstrings for functions:
  ```python
  def transcribe(audio_bytes: bytes, language: Optional[str] = None) -> str:
      """Transcribe audio to text.
      
      Args:
          audio_bytes: Raw audio data
          language: Optional language code (e.g., 'en-US')
          
      Returns:
          Transcribed text
          
      Raises:
          SpeechTranscriptionError: If transcription fails
      """
  ```

##### TypeScript/JavaScript (Frontend)

```bash
# Format code
npm run format

# Check style
npm run lint
```

Follow our ESLint config:
- 2 spaces indentation
- Semicolons required
- Single quotes for strings
- Type annotations:
  ```typescript
  interface Transcript {
    id: number;
    text: string;
    created_at: string;
    user_id: number;
  }
  
  async function getTranscripts(): Promise<Transcript[]> {
    // Implementation
  }
  ```

#### Testing

Add tests for new features:

**Backend** (pytest):
```python
# tests/test_auth.py
import pytest
from app import create_app

def test_user_registration():
    app = create_app()
    with app.test_client() as client:
        response = client.post('/auth/register', json={
            'email': 'test@example.com',
            'password': 'Test12345'
        })
        assert response.status_code == 201
```

**Frontend** (Jest):
```typescript
// components/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';

jest.mock('@/lib/auth', () => ({
  isAuthenticated: () => false
}));

describe('Navbar', () => {
  it('shows login/register buttons when not authenticated', () => {
    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
```

#### Documentation

Update docs for new features:

- Update [README.md](../README.md) if you change features
- Update [docs/api.md](./api.md) if you add API endpoints
- Update [docs/architecture.md](./architecture.md) if you change system design
- Add code comments for complex logic

#### Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then on GitHub:
1. Create Pull Request
2. Reference any related issues: "Fixes #123"
3. Describe your changes
4. Check PR checklist below

**PR Checklist**:
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented if necessary)
- [ ] Commit messages are clear
- [ ] Works on Windows/macOS/Linux

### 4. Improve Documentation

Documentation is just as important as code!

1. Find typos? Fix them
2. Examples unclear? Clarify them
3. Missing guides? Add them

Create a PR with your improvements.

## Project Structure

```
speechtotext/
├── frontend/       # Next.js React app
│   ├── app/        # Pages (home, login, register, history)
│   ├── components/ # Reusable components
│   ├── lib/        # Utilities (API client, auth, export)
│   └── package.json
├── backend/        # Flask REST API
│   ├── app/
│   │   ├── auth.py         # Authentication logic
│   │   ├── models.py       # Database models
│   │   ├── transcripts.py  # Transcript endpoints
│   │   ├── speech.py       # DeepInfra integration
│   │   ├── config.py       # Configuration
│   │   └── extensions.py   # Flask extensions
│   ├── requirements.txt
│   └── run.py
├── docs/           # Documentation
│   ├── api.md      # API reference
│   ├── architecture.md
│   ├── deployment.md
│   └── setup.md
└── README.md
```

## Development Tips

### Running the Full App

Keep 3 terminals open:

```bash
# Terminal 1: Backend
cd backend && source .venv/bin/activate && python -m flask --app run.py --debug run

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Commands (git, testing, etc.)
```

### Database Changes

If you modify models in `backend/app/models.py`:

1. Backend auto-creates new tables
2. For migrations, we'll use Flask-Migrate (setup coming)
3. For now, delete `speech_to_text.db` and restart

### Testing an API Endpoint

```bash
# Without JWT
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345"}'

# With JWT (get token from login first)
TOKEN="eyJ..."
curl http://localhost:5000/transcripts \
  -H "Authorization: Bearer $TOKEN"
```

### Common Issues

**Issue**: "Changes aren't showing up"
- **Frontend**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Backend**: Server auto-reloads, check terminal for errors

**Issue**: "Can't connect to backend from frontend"
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`
- Check CORS settings in backend `.env`

## Release Process

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: v1.2.3

Releases are tagged in git and documented in CHANGELOG.

## Areas We Need Help With

Looking where to contribute? Consider these:

### Backend
- [ ] Add comprehensive test suite
- [ ] Implement database migrations (Flask-Migrate)
- [ ] Add rate limiting
- [ ] Add caching layer (Redis)
- [ ] Support more speech APIs (Google, Azure)

### Frontend
- [ ] Real-time streaming transcription UI
- [ ] Dark mode theme
- [ ] Internationalization (i18n)
- [ ] Mobile app (React Native)
- [ ] UI component library documentation

### Infrastructure
- [ ] GitHub Actions CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment configs
- [ ] Performance monitoring

### Documentation
- [ ] API SDK/client libraries
- [ ] Video tutorials
- [ ] Architecture diagrams
- [ ] Deployment case studies

### DevOps
- [ ] Database migration strategy
- [ ] Backup/restore procedures
- [ ] Monitoring and alerting
- [ ] Load testing

## Community

- **Discussions**: GitHub Discussions for Q&A
- **Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions
- **Email**: support@voicescribe.com

## Questions?

- Check [docs/setup.md](./setup.md) for development setup
- Check [docs/api.md](./api.md) for API details
- Check [docs/architecture.md](./architecture.md) for system design
- Open a GitHub Discussion

---

Thank you for contributing! Every contribution makes VoiceScribe better. 🙏