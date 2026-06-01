import os
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'secret-key')
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')

@app.route('/')
def index():
    return '<h1>Smart Academic Hub</h1><p>Server is running!</p>'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 22234))
    socketio.run(app, host='0.0.0.0', port=port)
