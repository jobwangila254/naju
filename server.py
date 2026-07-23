import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
DIR = sys.argv[2] if len(sys.argv) > 2 else "naju-main"

class SecureHTTP(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parts = [p for p in self.path.split("/") if p]
        if ".git" in parts or ".env" in parts:
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Forbidden")
            return
        return super().do_GET()

os.chdir(os.path.join(os.path.dirname(__file__), DIR))
http.server.HTTPServer(("0.0.0.0", PORT), SecureHTTP).serve_forever()
