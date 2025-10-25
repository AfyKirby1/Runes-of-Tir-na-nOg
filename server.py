import http.server
import socketserver
import os
import threading
import subprocess
import time

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            # Serve landing page at root
            self.path = '/landing.html'
        return super().do_GET()

    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def start_multiplayer_server():
    """Start the multiplayer WebSocket server in a separate process"""
    try:
        server_dir = os.path.join(os.path.dirname(__file__), 'server')
        subprocess.Popen(['python', 'multiplayer_server.py'], cwd=server_dir)
        print("Multiplayer server started on ws://localhost:1234")
    except Exception as e:
        print(f"Failed to start multiplayer server: {e}")

PORT = 8000
Handler = CustomHTTPRequestHandler

print("Starting Runes of Tir na nÓg Server...")
print(f"HTTP server: http://localhost:{PORT}")
print("Multiplayer server: ws://localhost:1234")
print()

# Start multiplayer server
start_multiplayer_server()

# Start HTTP server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server started at http://localhost:{PORT}")
    httpd.serve_forever()
