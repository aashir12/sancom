export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  const response = await fetch("/api/stt", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as { text?: string; error?: string };
  if (!response.ok) {
    throw new Error(result.error ?? "Transcription failed.");
  }

  return String(result.text ?? "").trim();
}
