import { NextResponse } from "next/server";
import { transcribeAudio } from "../../lib/whisper/transcribe";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob) || file.size === 0) {
      return NextResponse.json(
        { error: "Missing or empty audio file." },
        { status: 400 },
      );
    }

    const text = await transcribeAudio(file);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("[stt route]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Speech-to-text transcription failed.",
      },
      { status: 500 },
    );
  }
}
