"use client";

import { useState } from "react";
import VoiceHandler from "./voiceHandler";

export default function VoiceWrapper() {
  const [inputValue, setInputValue] = useState("");

  return (
    <main className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Next.js Voice Form</h1>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Speak or type something..."
          className="border p-2 rounded w-full text-black"
        />
        <VoiceHandler onTranscript={(text) => setInputValue(text)} />
      </div>
    </main>
  );
}
