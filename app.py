from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os

app = Flask(__name__, static_folder='.', static_url_path='')

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                desc TEXT NOT NULL,
                amount REAL NOT NULL,
                type TEXT NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                method TEXT NOT NULL
            )
        ''')
        conn.commit()

# Initialize Database
init_db()

@app.route('/')
def serve_home():
    return send_from_directory('.', 'home.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return "File not found", 404

# --- API ROUTES ---

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    conn = get_db_connection()
    transactions = conn.execute('SELECT * FROM transactions').fetchall()
    conn.close()
    # Convert Row objects to dictionaries
    return jsonify([dict(tx) for tx in transactions])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO transactions (desc, amount, type, category, date, method)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (data['desc'], data['amount'], data['type'], data['category'], data['date'], data['method']))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    data['id'] = new_id
    return jsonify(data), 201

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM transactions WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return '', 204

if __name__ == '__main__':
    print("🚀 Starting PyFin Server on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
