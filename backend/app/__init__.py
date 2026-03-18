import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from sqlalchemy import text

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app() -> Flask:
    app = Flask(__name__)
    
    # Basic configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-this')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///backend/instance/speech_to_text.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_AUDIO_MB'] = int(os.getenv('MAX_AUDIO_MB', '25'))
    
    # Frontend origins for CORS
    app.config['FRONTEND_ORIGINS'] = os.getenv('FRONTEND_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    
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
    try:
        from .auth import auth_bp
        from .transcripts import transcript_bp
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(transcript_bp)
    except ImportError as e:
        print(f"Warning: Could not import blueprints: {e}")
        print("Make sure auth.py and transcripts.py exist in the app directory")
    
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
