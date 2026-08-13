const WHISPER_API_URL = (
  process.env.WHISPER_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function transcribeAudio(audio: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audio, "recording.webm");

  const response = await fetch(`${WHISPER_API_URL}/v1/audio/transcriptions`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Whisper server error (${response.status}). Is it running on ${WHISPER_API_URL}? ${detail}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await response.json()) as { text?: string };
    return String(data.text ?? "").trim();
  }

  return (await response.text()).trim();
}
