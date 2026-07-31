# AI Voice Calling Agent

A scalable AI Voice Calling Agent built with **Next.js**, **Faster-Whisper**, **Ollama (Qwen)**, and **Piper TTS**.

The goal of this project is to create a low-cost outbound AI calling system that can be integrated with **VICIdial/Asterisk** while keeping infrastructure costs minimal using open-source models.

---

# Architecture

```
Caller
   │
   ▼
Speech (Audio)
   │
   ▼
Faster Whisper
(Speech → Text)
   │
   ▼
Qwen (Ollama)
(Text → Text)
   │
   ▼
Piper
(Text → Speech)
   │
   ▼
Caller hears AI Response
```

---

# Tech Stack

- Next.js 15
- TypeScript
- Faster-Whisper
- Ollama
- Qwen 2.5
- Piper TTS
- Node.js
- REST API

---

# Project Structure

```
voice-agent/

├── app/
│   ├── api/
│   │   ├── stt/
│   │   │   └── route.ts
│   │   │
│   │   ├── llm/
│   │   │   └── route.ts
│   │   │
│   │   ├── tts/
│   │   │   └── route.ts
│   │   │
│   │   └── call/
│   │       └── route.ts
│   │
│   └── page.tsx
│
├── lib/
│   ├── whisper/
│   │   ├── transcribe.ts
│   │   └── index.ts
│   │
│   ├── ollama/
│   │   ├── generate.ts
│   │   └── index.ts
│   │
│   ├── piper/
│   │   ├── speak.ts
│   │   └── index.ts
│   │
│   └── pipeline/
│       └── voicePipeline.ts
│
├── services/
│   ├── stt.service.ts
│   ├── llm.service.ts
│   ├── tts.service.ts
│   └── call.service.ts
│
├── temp/
│   ├── audio/
│   └── output/
│
├── utils/
├── types/
├── public/
└── package.json
```

---

# Pipeline

## Step 1

Receive caller audio.

```
Audio
```

↓

## Step 2

Convert speech into text.

```
Faster Whisper
```

↓

Example:

```
Hello, I want to rent an apartment.
```

↓

## Step 3

Send transcript to the LLM.

```
Ollama
      │
      ▼
Qwen 2.5
```

↓

Example response

```
Sure!

Can I know which city you're interested in?
```

↓

## Step 4

Convert text into speech.

```
Piper TTS
```

↓

Return audio back to the caller.

---

# Module Responsibilities

## Faster Whisper

Responsible only for converting audio into text.

Input

```
Audio
```

Output

```
Text
```

---

## Ollama + Qwen

Responsible only for reasoning and generating responses.

Input

```
Text
```

Output

```
Text
```

---

## Piper

Responsible only for converting text into speech.

Input

```
Text
```

Output

```
Audio
```

---

# Voice Pipeline

```ts
Audio
   │
   ▼
Speech To Text
   │
   ▼
LLM
   │
   ▼
Text To Speech
   │
   ▼
Return Audio
```

---

# Development Roadmap

## Phase 1

Implement Faster Whisper.

Goal:

```
Audio
 ↓
Text
```

---

## Phase 2

Integrate Ollama.

Goal:

```
Audio
 ↓
Whisper
 ↓
Qwen
```

---

## Phase 3

Integrate Piper.

Goal:

```
Audio
 ↓
Whisper
 ↓
Qwen
 ↓
Piper
```

---

## Phase 4

Create complete pipeline.

```
voicePipeline()

↓

Whisper

↓

Qwen

↓

Piper

↓

Return Audio
```

---

## Phase 5

Integrate with VICIdial / Asterisk.

```
Phone Call

↓

Voice Pipeline

↓

AI Response

↓

Caller
```

---

# Future Improvements

- Streaming responses
- Interrupt handling (barge-in)
- Voice Activity Detection (VAD)
- Conversation memory
- RAG support
- CRM integration
- Call recording
- Analytics dashboard
- Multi-language support
- GPU deployment
- Docker support
- Kubernetes deployment

---

# Goal

Build a production-ready AI Voice Calling Agent capable of handling outbound calls using open-source AI models while minimizing infrastructure costs.