from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from time import perf_counter

from .extensions import db
from .models import Transcript
from .speech import SpeechTranscriptionError, transcribe_with_deepinfra


transcript_bp = Blueprint("transcripts", __name__)


@transcript_bp.post("/transcribe")
@jwt_required()
def transcribe():
    user_id = int(get_jwt_identity())

    if "audio" not in request.files:
        return jsonify({"error": "Missing audio file in form-data"}), 400

    audio_file = request.files["audio"]
    audio_bytes = audio_file.read()

    if not audio_bytes:
        return jsonify({"error": "Audio file is empty"}), 400

    max_size_bytes = current_app.config["MAX_AUDIO_MB"] * 1024 * 1024
    if len(audio_bytes) > max_size_bytes:
        return jsonify({"error": "Audio file is too large"}), 413

    language = request.form.get("language")
    should_save = (request.form.get("save", "true").lower() == "true")
    quality = (request.form.get("quality") or "fast").strip().lower()

    selected_model = (
        current_app.config["DEEPINFRA_FAST_MODEL"]
        if quality == "fast"
        else current_app.config["DEEPINFRA_MODEL"]
    )

    started_at = perf_counter()

    try:
        transcript_text = transcribe_with_deepinfra(
            audio_bytes,
            language=language,
            model=selected_model,
        )
    except SpeechTranscriptionError as exc:
        return jsonify({"error": str(exc)}), 502

    elapsed_ms = int((perf_counter() - started_at) * 1000)

    transcript_id = None
    if should_save:
        transcript = Transcript(text=transcript_text, user_id=user_id)
        db.session.add(transcript)
        db.session.commit()
        transcript_id = transcript.id

    return (
        jsonify(
            {
                "transcript": transcript_text,
                "saved": should_save,
                "transcript_id": transcript_id,
                "quality": quality,
                "elapsed_ms": elapsed_ms,
            }
        ),
        200,
    )


@transcript_bp.get("/transcripts")
@jwt_required()
def list_transcripts():
    user_id = int(get_jwt_identity())
    items = (
        Transcript.query.filter_by(user_id=user_id)
        .order_by(Transcript.created_at.desc())
        .all()
    )
    return jsonify([item.to_dict() for item in items]), 200


@transcript_bp.get("/transcripts/<int:transcript_id>")
@jwt_required()
def get_transcript(transcript_id: int):
    user_id = int(get_jwt_identity())
    transcript = Transcript.query.filter_by(id=transcript_id, user_id=user_id).first()
    if not transcript:
        return jsonify({"error": "Transcript not found"}), 404

    return jsonify(transcript.to_dict()), 200


@transcript_bp.delete("/transcripts/<int:transcript_id>")
@jwt_required()
def delete_transcript(transcript_id: int):
    user_id = int(get_jwt_identity())
    transcript = Transcript.query.filter_by(id=transcript_id, user_id=user_id).first()
    if not transcript:
        return jsonify({"error": "Transcript not found"}), 404

    db.session.delete(transcript)
    db.session.commit()

    return jsonify({"message": "Transcript deleted"}), 200
