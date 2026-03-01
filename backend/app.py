# ============================================
# APP.PY - Flask Backend with Authentication
# Cognitive load prediction + User profiles
# ============================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import sqlite3
import bcrypt
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_db():
    """Initialize SQLite database with users and profiles tables"""
    conn = sqlite3.connect('neuroadaptive.db')
    c = conn.cursor()
    
    # Users table: authentication
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Profiles table: accessibility preferences
    c.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            user_id INTEGER PRIMARY KEY,
            preferred_scale REAL DEFAULT 1.0,
            preferred_line_height REAL DEFAULT 1.5,
            preferred_letter_spacing REAL DEFAULT 0.0,
            preferred_contrast REAL DEFAULT 1.0,
            dyslexia_font_enabled INTEGER DEFAULT 0,
            attention_assist_level TEXT DEFAULT 'none',
            onboarding_completed INTEGER DEFAULT 0,
            questionnaire_data TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized")

# Initialize database on startup
init_db()

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/signup', methods=['POST'])
def signup():
    """Register new user with hashed password"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    try:
        conn = sqlite3.connect('neuroadaptive.db')
        c = conn.cursor()
        
        # Check if username exists
        c.execute('SELECT id FROM users WHERE username = ?', (username,))
        if c.fetchone():
            conn.close()
            return jsonify({'error': 'Username already exists'}), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Insert user
        c.execute('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
                  (username, password_hash, datetime.now().isoformat()))
        user_id = c.lastrowid
        
        # Create empty profile
        c.execute('INSERT INTO profiles (user_id) VALUES (?)', (user_id,))
        
        conn.commit()
        conn.close()
        
        print(f"New user registered: {username}")
        return jsonify({'success': True, 'user_id': user_id, 'username': username})
        
    except Exception as e:
        print(f"❌ Signup error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/login', methods=['POST'])
def login():
    """Authenticate user and return profile"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    try:
        conn = sqlite3.connect('neuroadaptive.db')
        c = conn.cursor()
        
        # Get user
        c.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,))
        user = c.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'Invalid credentials'}), 401
        
        user_id, password_hash = user
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), password_hash):
            conn.close()
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Get profile
        c.execute('SELECT * FROM profiles WHERE user_id = ?', (user_id,))
        profile = c.fetchone()
        
        conn.close()
        
        if profile:
            profile_data = {
                'user_id': user_id,
                'username': username,
                'preferred_scale': profile[1],
                'preferred_line_height': profile[2],
                'preferred_letter_spacing': profile[3],
                'preferred_contrast': profile[4],
                'dyslexia_font_enabled': bool(profile[5]),
                'attention_assist_level': profile[6],
                'onboarding_completed': bool(profile[7]),
                'questionnaire_data': json.loads(profile[8]) if profile[8] else None
            }
        else:
            profile_data = {
                'user_id': user_id,
                'username': username,
                'onboarding_completed': False
            }
        
        print(f"User logged in: {username}")
        return jsonify({'success': True, 'profile': profile_data})
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/profile', methods=['POST'])
def save_profile():
    """Save user profile after onboarding"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    try:
        conn = sqlite3.connect('neuroadaptive.db')
        c = conn.cursor()
        
        # Update profile
        c.execute('''
            UPDATE profiles SET
                preferred_scale = ?,
                preferred_line_height = ?,
                preferred_letter_spacing = ?,
                preferred_contrast = ?,
                dyslexia_font_enabled = ?,
                attention_assist_level = ?,
                onboarding_completed = ?,
                questionnaire_data = ?
            WHERE user_id = ?
        ''', (
            data.get('preferred_scale', 1.0),
            data.get('preferred_line_height', 1.5),
            data.get('preferred_letter_spacing', 0.0),
            data.get('preferred_contrast', 1.0),
            1 if data.get('dyslexia_font_enabled') else 0,
            data.get('attention_assist_level', 'none'),
            1 if data.get('onboarding_completed') else 0,
            json.dumps(data.get('questionnaire_data', {})),
            user_id
        ))
        
        conn.commit()
        conn.close()
        
        print(f"Profile saved for user_id: {user_id}")
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"❌ Profile save error: {e}")
        return jsonify({'error': 'Failed to save profile'}), 500

# ============================================
# /predict ENDPOINT
# ============================================

@app.route('/predict', methods=['POST'])
def predict():
    """
    Receives a feature vector from the extension and returns a cognitive load score.
    """
    
    # Get JSON data from request
    features = request.get_json()
    
    if not features:
        return jsonify({'error': 'No data received'}), 400
    
    # Extract features with defaults
    scroll_rate = features.get('scroll_rate', 0)
    click_rate = features.get('click_rate', 0)
    rage_clicks = features.get('rage_click_count', 0)
    tab_switches = features.get('tab_switch_count', 0)
    read_time = features.get('avg_paragraph_read_time', 3.0)
    
    # Log received features
    print("\n📊 Features received:")
    print(f"   Scroll rate: {scroll_rate:.2f} scrolls/sec")
    print(f"   Click rate: {click_rate:.2f} clicks/sec")
    print(f"   Rage clicks: {rage_clicks}")
    print(f"   Tab switches: {tab_switches}")
    print(f"   Avg read time: {read_time:.2f}s")
    
    # ============================================
    # SIMPLE HEURISTIC MODEL (better than random)
    # ============================================
    
    # Calculate cognitive load based on behavior patterns
    # High scroll rate = scanning/searching = higher load
    scroll_score = min(1.0, scroll_rate / 3.0)  # Normalize to 0-1
    
    # High click rate = frustration = higher load
    click_score = min(1.0, click_rate / 2.0)
    
    # Rage clicks = strong frustration signal
    rage_score = min(1.0, rage_clicks / 5.0)
    
    # Tab switches = distraction = higher load
    tab_score = min(1.0, tab_switches / 3.0)
    
    # Very short or very long read times = difficulty
    if read_time < 2.0:
        read_score = 0.7  # Too fast = skimming/struggling
    elif read_time > 8.0:
        read_score = 0.8  # Too slow = difficulty comprehending
    else:
        read_score = 0.3  # Normal reading pace
    
    # Weighted combination
    overload_score = (
        scroll_score * 0.25 +
        click_score * 0.20 +
        rage_score * 0.30 +
        tab_score * 0.15 +
        read_score * 0.10
    )
    
    # Ensure score is between 0 and 1
    overload_score = max(0.0, min(1.0, overload_score))
    
    print(f"🧠 Calculated overload score: {overload_score:.2f}")
    print(f"   Components: scroll={scroll_score:.2f}, click={click_score:.2f}, rage={rage_score:.2f}, tab={tab_score:.2f}, read={read_score:.2f}\n")
    
    # Return prediction to extension
    return jsonify({
        'overload_score': overload_score,
        'features_received': features
    })

# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@app.route('/health', methods=['GET'])
def health():
    """Simple health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'NeuroAdaptiveOS backend is running'})

# ============================================
# START SERVER
# ============================================

if __name__ == '__main__':
    print("Starting NeuroAdaptiveOS backend...")
    print("Listening on http://localhost:5000")
    print("Ready to receive feature vectors\n")
    
    app.run(debug=True, port=5000)
