from app import app, db
from flask import request, jsonify
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models import User
from datetime import timedelta

# Test route
@app.route('/api/test', methods=['GET'])
@cross_origin()
def test():
    return jsonify({"status": "success", "message": "Backend is working!"})

# Health check
@app.route('/api/health', methods=['GET'])
@cross_origin()
def health():
    return jsonify({"status": "healthy", "message": "Server is running"})

# Register route
@app.route('/api/register', methods=['POST', 'OPTIONS'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def register():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        print("Register data:", data)  # Debug log
        
        email = data.get('email')
        password = data.get('password')
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        # Check if user exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 400
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            email=email,
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=email,
            expires_delta=timedelta(days=1)
        )
        
        return jsonify({
            "message": "User created successfully",
            "access_token": access_token,
            "user": {"email": email}
        }), 201
        
    except Exception as e:
        print("Error in register:", str(e))  # Debug log
        return jsonify({"error": str(e)}), 500

# Login route
@app.route('/api/login', methods=['POST', 'OPTIONS'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401
        
        access_token = create_access_token(
            identity=email,
            expires_delta=timedelta(days=1)
        )
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {"email": email}
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500