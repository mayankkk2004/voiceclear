import json
from typing import Optional

import requests
from flask import current_app
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class SpeechTranscriptionError(Exception):
    pass


_http_session: Optional[requests.Session] = None


def _get_http_session(max_retries: int) -> requests.Session:
    global _http_session
    if _http_session is not None:
        return _http_session

    retry = Retry(
        total=max_retries,
        connect=max_retries,
        read=max_retries,
        status=max_retries,
        backoff_factor=0.3,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods={"POST"},
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=20)

    session = requests.Session()
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    _http_session = session
    return session


def transcribe_with_deepinfra(
    audio_bytes: bytes,
    language: Optional[str] = None,
    model: Optional[str] = None,
) -> str:
    api_key = current_app.config["DEEPINFRA_API_KEY"]
    model_name = model or current_app.config["DEEPINFRA_MODEL"]
    connect_timeout = current_app.config["DEEPINFRA_CONNECT_TIMEOUT_SECONDS"]
    read_timeout = current_app.config["DEEPINFRA_TIMEOUT_SECONDS"]
    max_retries = current_app.config["DEEPINFRA_MAX_RETRIES"]

    if not api_key:
        raise SpeechTranscriptionError(
            "DEEPINFRA_API_KEY is not configured on the backend."
        )

    url = f"https://api.deepinfra.com/v1/inference/{model_name}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    files = {
        "audio": ("recording.webm", audio_bytes, "audio/webm"),
    }

    payload = {}
    if language:
        payload["language"] = language
    payload["task"] = "transcribe"

    try:
        response = _get_http_session(max_retries).post(
            url,
            headers=headers,
            files=files,
            data={"input": json.dumps(payload)} if payload else None,
            timeout=(connect_timeout, read_timeout),
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        raise SpeechTranscriptionError(f"Failed to call DeepInfra: {exc}") from exc

    transcript = (
        data.get("text")
        or data.get("transcript")
        or data.get("results", {}).get("text")
        or data.get("output", {}).get("text")
        or ""
    )

    transcript = transcript.strip()
    if not transcript:
        raise SpeechTranscriptionError(
            "No transcript returned by the speech-to-text provider."
        )

    return transcript
