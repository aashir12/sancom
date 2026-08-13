# Faster-Whisper HTTP Transcription Server

This minimal FastAPI server accepts audio uploads at `/v1/audio/transcriptions` and returns a JSON `{ "text": "..." }` transcription using `faster-whisper`.

Prereqs:
- Python 3.9+
- `ffmpeg` on PATH (recommended to support webm/other containers)
- Install Python deps:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Run locally:

```bash
venv\Scripts\activate
python server.py
```

Set environment variables to configure:
- `WHISPER_MODEL` (default: `small`)
- `WHISPER_DEVICE` (`cpu` or `cuda`, default: `cpu`)

Point your app's `WHISPER_API_URL` to `http://127.0.0.1:8000`.
