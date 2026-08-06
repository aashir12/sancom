"use client";

import { useState } from "react";
import VoiceHandler from "./voiceHandler";
import { speakText } from "../../services/tts.service";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function VoiceWrapper() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const handleSend = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setError(null);
    setLoading(true);
    addMessage({ role: "user", text: trimmed });
    setInputValue("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Unable to fetch reply from Olama.");
      }

      const replyText = String(result.reply ?? "");
      addMessage({ role: "assistant", text: replyText });
      speakText(replyText);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch response from Olama.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTranscript = async (text: string) => {
    setInputValue(text);
    await handleSend(text);
  };

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Voice Chat with Qwen</h1>

        <div className="flex gap-2 items-center mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Speak or type something..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-black outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={() => handleSend(inputValue)}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Thinking…" : "Send"}
          </button>
        </div>

        <VoiceHandler onTranscript={handleTranscript} />

        {error ? (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <section className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-3xl px-5 py-4 shadow-sm ${
              message.role === "assistant"
                ? "bg-slate-900 text-white self-start"
                : "bg-slate-100 text-slate-900 self-end"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.2em] opacity-70 mb-2">
              {message.role === "assistant" ? "Qwen" : "You"}
            </p>
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
