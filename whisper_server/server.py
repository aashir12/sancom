from fastapi import FastAPI, File, UploadFile
import tempfile
import os
import subprocess
from faster_whisper import WhisperModel
import asyncio
import uvicorn

app = FastAPI()

# Model selection: set WHISPER_MODEL (e.g. "small") and WHISPER_DEVICE ("cpu" or "cuda")
MODEL_NAME = os.environ.get("WHISPER_MODEL", "base")
DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")

_model = None


async def get_model():
    global _model
    if _model is None:
        # Load model in thread to avoid blocking the event loop
        def load():
            return WhisperModel(MODEL_NAME, device=DEVICE)

        _model = await asyncio.to_thread(load)
    return _model


def to_wav(input_path: str) -> str:
    """Convert input audio to a WAV file using ffmpeg. Returns path to wav file."""
    base, _ = os.path.splitext(input_path)
    out_path = base + ".wav"
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        input_path,
        "-ar",
        "16000",
        "-ac",
        "1",
        out_path,
    ]
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out_path


@app.post("/v1/audio/transcriptions")
async def transcribe(file: UploadFile = File(...)):
    # Save upload to temporary file
    suffix = os.path.splitext(file.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp.flush()
        tmp_path = tmp.name

    wav_path = tmp_path
    try:
        # If uploaded file is not a wav, convert to wav for best compatibility
        if not tmp_path.lower().endswith(".wav"):
            try:
                wav_path = to_wav(tmp_path)
            except Exception:
                # Fallback: if ffmpeg not available or conversion fails, proceed with original file
                wav_path = tmp_path

        # ensure model is loaded (lazy); run transcription in thread
        model = await get_model()
        segments, _ = await asyncio.to_thread(model.transcribe, wav_path)
        text = "".join([s.text for s in segments])
        return {"text": text}
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
        if wav_path != tmp_path:
            try:
                os.remove(wav_path)
            except Exception:
                pass


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.environ.get("PORT", 8000)))
