#!/usr/bin/env python3
"""Dev server for the portfolio — serves with no-cache headers so edits always show."""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4317
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


http.server.ThreadingHTTPServer(("", PORT), NoCacheHandler).serve_forever()
