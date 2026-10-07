#!/usr/bin/env python3
"""
Teachy – lokal server.

Fungerar som `python3 -m http.server`, men kan dessutom läsa upp text med
Macens egna röster (t.ex. Alva Premium) via kommandot `say`. Safari och andra
webbläsare släpper bara fram de enkla standardrösterna till webbsidor, så
Teachy hämtar ljudet härifrån i stället när servern körs på en Mac.

    python3 server.py          # http://localhost:8000
    python3 server.py 8080     # annan port

API:
    GET /api/voices                          -> [{"name": "Alva (Premium)", "lang": "sv-SE"}, ...]
    GET /api/tts?text=Hej&voice=Alva+(Premium)&rate=0.8  -> WAV-ljud
"""

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, '.tts-cache')
HAS_SAY = shutil.which('say') is not None
MAX_TEXT = 500
WORDS_PER_MINUTE = 190  # 'say' vid takt 1.0


def list_voices():
    """Macens röster, t.ex. 'Alva (Premium)    sv_SE    # Hej! Jag heter Alva.'"""
    if not HAS_SAY:
        return []
    out = subprocess.run(['say', '-v', '?'], capture_output=True, text=True).stdout
    voices = []
    for line in out.splitlines():
        m = re.match(r'^(.+?)\s+([a-z]{2,3}_[A-Z0-9]+)\s+#', line)
        if m:
            voices.append({'name': m.group(1).strip(), 'lang': m.group(2).replace('_', '-')})
    return voices


VOICES = list_voices()
VOICE_NAMES = {v['name'] for v in VOICES}


def synthesize(text, voice, rate):
    """Läser in texten som WAV och sparar den, så att samma fras går fort nästa gång."""
    wpm = int(WORDS_PER_MINUTE * rate)
    key = hashlib.sha1(f'{voice}|{wpm}|{text}'.encode('utf-8')).hexdigest()
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        # Texten går via en fil, så att den aldrig kan tolkas som en flagga till 'say'
        with tempfile.NamedTemporaryFile('w', suffix='.txt', encoding='utf-8', delete=False) as f:
            f.write(text)
            text_file = f.name
        tmp = path + '.tmp.wav'
        try:
            subprocess.run(
                ['say', '-v', voice, '-r', str(wpm), '-f', text_file,
                 '-o', tmp, '--file-format=WAVE', '--data-format=LEI16@22050'],
                check=True, timeout=30)
            os.replace(tmp, path)
        finally:
            os.unlink(text_file)
            if os.path.exists(tmp):
                os.unlink(tmp)
    return path


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == '/api/voices':
            self.send_json(VOICES)
        elif url.path == '/api/tts':
            self.send_tts(parse_qs(url.query))
        else:
            super().do_GET()

    def send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_tts(self, query):
        text = query.get('text', [''])[0].strip()[:MAX_TEXT]
        voice = query.get('voice', [''])[0]
        try:
            rate = min(max(float(query.get('rate', ['0.8'])[0]), 0.4), 1.5)
        except ValueError:
            rate = 0.8
        if not text or voice not in VOICE_NAMES:
            self.send_error(400, 'Okänd röst eller tom text')
            return
        try:
            path = synthesize(text, voice, rate)
        except (subprocess.SubprocessError, OSError):
            self.send_error(500, 'Kunde inte läsa upp texten')
            return
        with open(path, 'rb') as f:
            body = f.read()
        self.send_response(200)
        self.send_header('Content-Type', 'audio/wav')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'max-age=31536000')
        self.end_headers()
        self.wfile.write(body)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(('', port), Handler)
    swedish = [v['name'] for v in VOICES if v['lang'].startswith('sv')]
    print(f'Teachy körs på http://localhost:{port}')
    print('Svenska Mac-röster: ' + (', '.join(swedish) if swedish else 'inga (webbläsarens röster används)'))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
