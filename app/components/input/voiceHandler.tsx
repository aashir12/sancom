"use client";
import { useState, useEffect, useRef } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

// --- Minimal Web Speech API types (not in default TS DOM lib) ---
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
// --- End Web Speech API types ---

export default function VoiceHandler({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    // Initialize MediaRecorder-based capture for sending audio to the server
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setTimeout(() => {
        setError("Media capture is not supported in this browser.");
      }, 200);
      return;
    }

    // Cleanup on unmount
    return () => {
      try {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        // ignore
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [onTranscript]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const options: MediaRecorderOptions = {
        mimeType: "audio/webm;codecs=opus",
      };
      const recorder = new MediaRecorder(stream, options);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstart = () => {
        setIsListening(true);
      };

      recorder.onstop = async () => {
        setIsListening(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // send to server
        try {
          const form = new FormData();
          form.append("file", blob, "recording.webm");
          const res = await fetch("/api/stt", { method: "POST", body: form });
          console.log("response received from stt:", res);
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || "Transcription failed");
          const text = String(data.text ?? "").trim();
          if (text) onTranscript(text);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const stopRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    } catch (e) {
      // ignore
    }
  };

  const toggleListening = () => {
    if (isListening) stopRecording();
    else startRecording();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleListening}
        className={`px-4 py-2 rounded-full font-medium transition-all ${
          isListening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isListening ? "🛑 Stop Listening" : "🎙️ Start Voice Input"}
      </button>
      {error && (
        <p className="text-xs text-red-500">
          {error.toLowerCase() == "error occurred: aborted"
            ? "Voice input was aborted."
            : error}
        </p>
      )}
    </div>
  );
}
