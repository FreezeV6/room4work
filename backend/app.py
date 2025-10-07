import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import jwt as jwt_module
from datetime import datetime, timedelta
import bcrypt
from functools import wraps
from werkzeug.utils import secure_filename

load_dotenv()
app = Flask(__name__)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://192.168.100.7:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SECRET_KEY'] = os.getenv('APP_SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

try:
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host=os.getenv('POSTGRES_HOST'),
        port=os.getenv('POSTGRES_PORT'),
        sslmode='require'
    )
    conn.autocommit = True
except Exception as e:
    print(f'Błąd połączenia z bazą: {e}')
    conn = None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt_module.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('SELECT * FROM users WHERE id = %s', (data['user_id'],))
                current_user = cur.fetchone()
                if not current_user:
                    raise Exception()
        except:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/db_check')
def db_check():
    if conn is None:
        return jsonify({'db_status': 'Brak połączenia z bazą!'}), 500
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT 1;')
            result = cur.fetchone()
        return jsonify({'db_status': 'OK', 'result': result})
    except Exception as e:
        return jsonify({'db_status': f'Błąd: {e}'}), 500

@app.route('/')
def home():
    return jsonify({'message': 'Room4Work API działa!'})

@app.route('/api/offices', methods=['GET'])
def get_offices():
    if conn is None:
        return jsonify({'error': 'Brak połączenia z bazą!'}), 500
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT o.*, oi.image_url, ot.name as type_name
                FROM offices o
                LEFT JOIN office_images oi ON o.id = oi.office_id AND oi.is_main = true
                LEFT JOIN office_types ot ON o.type_id = ot.id
                WHERE o.is_available = true
                ORDER BY o.created_at DESC
            """)
            offices = cur.fetchall()
            return jsonify(offices)
    except Exception as e:
        return jsonify({'error': f'Błąd: {e}'}), 500

@app.route('/api/offices/<int:office_id>', methods=['GET'])
def get_office(office_id):
    if conn is None:
        return jsonify({'error': 'Brak połączenia z bazą!'}), 500
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT o.*, ot.name as type_name
                FROM offices o
                LEFT JOIN office_types ot ON o.type_id = ot.id
                WHERE o.id = %s
            """, (office_id,))
            office = cur.fetchone()

            if not office:
                return jsonify({'error': 'Nie znaleziono oferty'}), 404

            cur.execute("""
                SELECT image_url, is_main
                FROM office_images
                WHERE office_id = %s
                ORDER BY is_main DESC
            """, (office_id,))
            office['images'] = cur.fetchall()

            return jsonify(office)
    except Exception as e:
        return jsonify({'error': f'Błąd: {e}'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM users WHERE email = %s', (data['email'],))
            if cur.fetchone():
                return jsonify({'message': 'User already exists'}), 409

            hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

            cur.execute('''
                INSERT INTO users (email, password_hash, first_name, last_name, company_name)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, email, first_name, last_name, company_name
            ''', (
                data['email'],
                hashed.decode('utf-8'),
                data.get('first_name'),
                data.get('last_name'),
                data.get('company_name')
            ))

            new_user = cur.fetchone()

            token = jwt_module.encode(
                {
                    'user_id': new_user['id'],
                    'exp': datetime.utcnow() + timedelta(days=1)
                },
                app.config['SECRET_KEY'],
                algorithm="HS256"
            )

            return jsonify({
                'token': token,
                'user': new_user
            }), 201

    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'message': 'Error during registration'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM users WHERE email = %s', (data['email'],))
            user = cur.fetchone()

            if not user or not bcrypt.checkpw(data['password'].encode('utf-8'),
                                            user['password_hash'].encode('utf-8')):
                return jsonify({'message': 'Invalid credentials'}), 401

            token = jwt_module.encode(
                {
                    'user_id': user['id'],
                    'exp': datetime.utcnow() + timedelta(days=1)
                },
                app.config['SECRET_KEY'],
                algorithm="HS256"
            )

            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'company_name': user['company_name']
                }
            })

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'Error during login'}), 500

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify(current_user)

@app.route('/api/user/bookings', methods=['GET'])
@token_required
def get_user_bookings(current_user):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT b.*, o.title, o.address, o.city, o.price_per_month,
                       oi.image_url as office_image
                FROM bookings b
                JOIN offices o ON b.office_id = o.id
                LEFT JOIN office_images oi ON o.id = oi.office_id AND oi.is_main = true
                WHERE b.user_id = %s
                ORDER BY b.created_at DESC
            ''', (current_user['id'],))
            bookings = cur.fetchall()
            return jsonify(bookings)
    except Exception as e:
        print(f"Error fetching bookings: {e}")
        return jsonify({'message': 'Error fetching bookings'}), 500

@app.route('/api/bookings', methods=['POST'])
@token_required
def create_booking(current_user):
    data = request.get_json()

    if not data or not data.get('office_id') or not data.get('start_date') or not data.get('end_date'):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT * FROM bookings
                WHERE office_id = %s
                AND status != 'cancelled'
                AND (
                    (start_date <= %s AND end_date >= %s)
                    OR (start_date <= %s AND end_date >= %s)
                    OR (start_date >= %s AND end_date <= %s)
                )
            ''', (
                data['office_id'],
                data['start_date'], data['start_date'],
                data['end_date'], data['end_date'],
                data['start_date'], data['end_date']
            ))

            if cur.fetchone():
                return jsonify({'message': 'Office is not available for these dates'}), 409

            cur.execute('SELECT price_per_month FROM offices WHERE id = %s', (data['office_id'],))
            office = cur.fetchone()

            if not office:
                return jsonify({'message': 'Office not found'}), 404

            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
            days = (end_date - start_date).days + 1
            total_price = (office['price_per_month'] / 30) * days

            cur.execute('''
                INSERT INTO bookings (office_id, user_id, start_date, end_date, total_price, status)
                VALUES (%s, %s, %s, %s, %s, 'pending')
                RETURNING id
            ''', (
                data['office_id'],
                current_user['id'],
                data['start_date'],
                data['end_date'],
                total_price
            ))

            booking_id = cur.fetchone()['id']

            cur.execute('''
                SELECT b.*, o.title, o.address, o.city
                FROM bookings b
                JOIN offices o ON b.office_id = o.id
                WHERE b.id = %s
            ''', (booking_id,))

            new_booking = cur.fetchone()
            return jsonify(new_booking), 201

    except Exception as e:
        print(f"Booking error: {e}")
        return jsonify({'message': 'Error creating booking'}), 500

@app.route('/api/offices/<int:office_id>/images', methods=['POST'])
@token_required
def upload_office_images(current_user, office_id):
    if 'images' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    files = request.files.getlist('images')
    uploaded_files = []

    try:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                new_filename = f"{timestamp}_{filename}"

                file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
                file.save(file_path)

                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute('''
                        INSERT INTO office_images (office_id, image_url, is_main)
                        VALUES (%s, %s, %s)
                        RETURNING id, image_url
                    ''', (
                        office_id,
                        f"/uploads/{new_filename}",
                        len(uploaded_files) == 0  # pierwsze zdjęcie jako główne
                    ))

                    uploaded_files.append(cur.fetchone())

        return jsonify({
            'message': 'Images uploaded successfully',
            'files': uploaded_files
        }), 201

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': 'Error uploading files'}), 500

@app.route('/uploads/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/bookings/office/<int:office_id>', methods=['GET'])
def get_office_bookings(office_id):
    if conn is None:
        return jsonify({'error': 'Brak połączenia z bazą!'}), 500
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT b.id, b.start_date, b.end_date, b.status,
                       u.first_name, u.last_name, u.company_name
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                WHERE b.office_id = %s AND b.status != 'cancelled'
                ORDER BY b.start_date ASC
            """, (office_id,))
            bookings = cur.fetchall()
            return jsonify(bookings)
    except Exception as e:
        return jsonify({'error': f'Błąd: {e}'}), 500

@app.route('/api/bookings/<int:booking_id>', methods=['DELETE'])
@token_required
def cancel_booking(current_user, booking_id):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT * FROM bookings
                WHERE id = %s AND user_id = %s
            ''', (booking_id, current_user['id']))

            booking = cur.fetchone()
            if not booking:
                return jsonify({'message': 'Booking not found or unauthorized'}), 404

            cur.execute('''
                UPDATE bookings
                SET status = 'cancelled'
                WHERE id = %s
                RETURNING *
            ''', (booking_id,))

            updated_booking = cur.fetchone()
            return jsonify(updated_booking)

    except Exception as e:
        print(f"Cancel booking error: {e}")
        return jsonify({'message': 'Error cancelling booking'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
