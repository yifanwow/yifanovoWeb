"""Serve the local personal-site preview with direct URL support."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def route(self):
        path = urlsplit(self.path).path
        if path == '/' or path.split('/')[1] in {'home', 'poetry', 'article', 'project', 'photos'}:
            self.path = '/index.html'

    def do_GET(self):
        self.route()
        super().do_GET()

    def do_HEAD(self):
        self.route()
        super().do_HEAD()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(ROOT)))
    print(f'Local: http://localhost:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
