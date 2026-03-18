# API Documentation

Complete reference for the VoiceScribe REST API.

**Base URL**: `http://localhost:5000` (development)  
**Base URL**: `https://your-backend.render.com` (production)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Transcripts](#transcripts)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Examples](#examples)

---

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

### POST /auth/register

Create a new user account.

**Request**

```bash
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (201 Created)

```json
{
  "message": "User created successfully"
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 201 | User created successfully |
| 400 | Email/password missing or invalid |
| 409 | Email already exists |

**Validation Rules**

- Email must be valid format
- Password must be at least 8 characters
- Email must be unique

---

### POST /auth/login

Authenticate and receive JWT token.

**Request**

```bash
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Login successful |
| 400 | Email/password missing |
| 401 | Invalid credentials |

**Using the Token**

Include the token in all authenticated request headers:

```bash
Authorization: Bearer <access_token>
```

Token expires in 30 days (configurable).

---

## Transcripts

### POST /transcribe

Upload audio file and receive transcription.

**Authentication Required**: Yes  
**Content-Type**: `multipart/form-data`

**Request**

```bash
POST /transcribe HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

[Form Data]
audio: <file>           # Required: WebM, WAV, MP3, or M4A
save: true              # Optional: Save to history (default: true)
language: en-US         # Optional: Language code (default: auto-detect)
```

**Response** (200 OK)

```json
{
  "transcript": "Hello, this is a test transcript.",
  "saved": true,
  "transcript_id": 42
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Transcription successful |
| 400 | Missing audio file |
| 401 | Unauthorized |
| 413 | File too large (> 15MB) |
| 502 | Transcription service error |

**File Requirements**

- **Formats**: WebM, WAV, MP3, M4A
- **Max Size**: 15 MB (configurable)
- **Duration**: Up to 1 hour
- **Sample Rate**: 8 kHz - 48 kHz

**Language Codes**

Common codes: `en-US`, `es-ES`, `fr-FR`, `de-DE`, `zh-CN`, `ja-JP`  
[Full list of supported languages](https://github.com/openai/whisper#language-identifiers)

**Example with cURL**

```bash
curl -X POST http://localhost:5000/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.webm" \
  -F "save=true" \
  -F "language=en-US"
```

**Example with JavaScript Fetch**

```typescript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('save', 'true');
formData.append('language', 'en-US');

const response = await fetch('http://localhost:5000/transcribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data.transcript);
```

---

### GET /transcripts

Retrieve all transcripts for authenticated user.

**Authentication Required**: Yes

**Request**

```bash
GET /transcripts HTTP/1.1
Authorization: Bearer <access_token>
```

**Response** (200 OK)

```json
[
  {
    "id": 42,
    "text": "Hello, this is a test transcript.",
    "created_at": "2024-01-15T10:30:00Z",
    "user_id": 1
  },
  {
    "id": 41,
    "text": "Another transcript.",
    "created_at": "2024-01-14T15:45:00Z",
    "user_id": 1
  }
]
```

**Query Parameters**

Currently: None (returns all user transcripts sorted by date)

**Future Enhancements**

- `?limit=10` - Pagination
- `?search=query` - Full-text search
- `?sort=-created_at` - Sorting

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized |

---

### GET /transcripts/{id}

Retrieve a single transcript by ID.

**Authentication Required**: Yes

**Request**

```bash
GET /transcripts/42 HTTP/1.1
Authorization: Bearer <access_token>
```

**Response** (200 OK)

```json
{
  "id": 42,
  "text": "Hello, this is a test transcript.",
  "created_at": "2024-01-15T10:30:00Z",
  "user_id": 1
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized |
| 404 | Transcript not found |

**Security Note**: User can only access their own transcripts.

---

### DELETE /transcripts/{id}

Delete a transcript permanently.

**Authentication Required**: Yes

**Request**

```bash
DELETE /transcripts/42 HTTP/1.1
Authorization: Bearer <access_token>
```

**Response** (200 OK)

```json
{
  "message": "Transcript deleted"
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Deleted successfully |
| 401 | Unauthorized |
| 404 | Transcript not found |

**Security Note**: Only the transcript owner can delete.

---

## Error Handling

All errors follow this JSON format:

```json
{
  "error": "Error description"
}
```

### Common Error Responses

**401 Unauthorized**

```json
{
  "error": "Missing Authorization header"
}
```

**404 Not Found**

```json
{
  "error": "Transcript not found"
}
```

**400 Bad Request**

```json
{
  "error": "Missing audio file in form-data"
}
```

**502 Service Unavailable**

```json
{
  "error": "Failed to call DeepInfra: Connection timeout"
}
```

---

## Rate Limiting

Current Limits (per user):

- **Transcription**: 100 requests/hour
- **List Transcripts**: 1000 requests/hour
- **Delete**: 1000 requests/hour

Rate limit headers in response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705330200
```

---

## Examples

### Complete Flow: Register → Record → Save

**1) Register**

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secure123"}'
```

**2) Login**

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Secure123"}'

# Response: {"access_token": "eyJ..."}
TOKEN="eyJ..."
```

**3) Transcribe**

```bash
curl -X POST http://localhost:5000/transcribe \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@recording.webm" \
  -F "save=true"

# Response: {"transcript":"...", "saved":true, "transcript_id":1}
```

**4) List Transcripts**

```bash
curl -X GET http://localhost:5000/transcripts \
  -H "Authorization: Bearer $TOKEN"
```

**5) Delete Transcript**

```bash
curl -X DELETE http://localhost:5000/transcripts/1 \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript SDK Example

```typescript
import { register, login, transcribeAudio, getTranscripts } from '@/lib/api';
import { setToken } from '@/lib/auth';

// 1. Register
await register('user@example.com', 'Secure123');

// 2. Login
const token = await login('user@example.com', 'Secure123');
setToken(token);

// 3. Transcribe
const result = await transcribeAudio(audioBlob, true, 'en-US');
console.log(result.transcript);

// 4. Get history
const transcripts = await getTranscripts();
transcripts.forEach(t => console.log(t.text));
```

---

## Changelog

### v1.0.0 (Current)
- ✅ User authentication (register, login)
- ✅ Audio transcription via DeepInfra
- ✅ Transcript CRUD operations
- ✅ JWT token-based auth

### v1.1.0 (Planned)
- 🔄 Real-time streaming transcription
- 🔄 Multi-language support improvements
- 🔄 Transcript search/filter
- 🔄 Batch operations

---

## Support

For issues or questions:
- Email: support@voicescribe.com
- GitHub Issues: [VoiceScribe/issues](https://github.com/yourrepo/issues)
- Documentation: [docs/](../)

```json
{
  "message": "User created successfully"
}
```

### POST /auth/login

Request JSON:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "access_token": "jwt-token"
}
```

## Transcription

### POST /transcribe

Headers:

- `Authorization: Bearer <jwt>`
- `Content-Type: multipart/form-data`

Form data:

- `audio`: file blob (`audio/webm`, `audio/wav`, etc.)
- `language` (optional): BCP-47 code (e.g. `en-US`)
- `save` (optional): `true` or `false`

Response:

```json
{
  "transcript": "recognized text",
  "saved": true,
  "transcript_id": 1
}
```

## Transcript History

### GET /transcripts

Headers:

- `Authorization: Bearer <jwt>`

Response:

```json
[
  {
    "id": 1,
    "text": "sample transcript",
    "created_at": "2026-03-18T12:00:00Z"
  }
]
```

### GET /transcripts/<id>

Headers:

- `Authorization: Bearer <jwt>`

### DELETE /transcripts/<id>

Headers:

- `Authorization: Bearer <jwt>`

Response:

```json
{
  "message": "Transcript deleted"
}
```
