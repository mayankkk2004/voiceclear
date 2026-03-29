import os
from datetime import timedelta


def _parse_origins(raw_origins: str) -> list[str]:
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or ["http://localhost:3000"]


class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = FLASK_ENV == "development"

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_DAYS", "7"))
    )

    # Flask-SQLAlchemy 3+ resolves relative SQLite paths from app.instance_path,
    # so use just the filename (without "instance/" prefix).
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///speech_to_text.db"
    ).replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }

    FRONTEND_ORIGINS = _parse_origins(
        os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    )

    DEEPINFRA_API_KEY = os.getenv("DEEPINFRA_API_KEY", "")
    DEEPINFRA_MODEL = os.getenv("DEEPINFRA_MODEL", "openai/whisper-large-v3")
    DEEPINFRA_FAST_MODEL = os.getenv("DEEPINFRA_FAST_MODEL", DEEPINFRA_MODEL)
    DEEPINFRA_CONNECT_TIMEOUT_SECONDS = float(
        os.getenv("DEEPINFRA_CONNECT_TIMEOUT_SECONDS", "8")
    )
    DEEPINFRA_TIMEOUT_SECONDS = int(os.getenv("DEEPINFRA_TIMEOUT_SECONDS", "45"))
    DEEPINFRA_MAX_RETRIES = int(os.getenv("DEEPINFRA_MAX_RETRIES", "2"))

    MAX_AUDIO_MB = int(os.getenv("MAX_AUDIO_MB", "15"))
    MAX_CONTENT_LENGTH = MAX_AUDIO_MB * 1024 * 1024
