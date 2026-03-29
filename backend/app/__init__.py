import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import text

# Load environment variables
load_dotenv()

from .config import Config
from .extensions import db, jwt


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS
    CORS(
        app,
        origins=app.config['FRONTEND_ORIGINS'],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)

    # Import and register blueprints
    from .auth import auth_bp
    from .transcripts import transcript_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(transcript_bp)

    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {e}")
    
    # Simple test route
    @app.route('/api/test', methods=['GET'])
    def test():
        return jsonify({
            "status": "success", 
            "message": "Backend is working!",
            "routes": [str(rule) for rule in app.url_map.iter_rules()]
        })
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health():
        db_status = "ok"
        try:
            db.session.execute(text("SELECT 1"))
        except Exception as e:
            db_status = f"degraded: {str(e)}"
        
        return jsonify({
            "status": "ok",
            "message": "Server is running",
            "env": os.getenv('FLASK_ENV', 'development'),
            "database": db_status
        })
    
    # Security headers
    @app.after_request
    def apply_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "microphone=(self)"
        return response
    
    # Error handlers
    @app.errorhandler(413)
    def payload_too_large(_error):
        return jsonify({
            "error": f"Audio file is too large. Maximum supported size is {app.config['MAX_AUDIO_MB']} MB."
        }), 413
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500
    
    return app
