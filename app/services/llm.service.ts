const OLLAMA_API_URL = process.env.OLLAMA_API_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

type OlamaData = string | Record<string, unknown> | { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }>; choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }> };

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (OLLAMA_API_KEY) {
    headers.Authorization = `Bearer ${OLLAMA_API_KEY}`;
  }

  return headers;
}

function parseOlamaResponse(data: OlamaData): string {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  if (Array.isArray(data.output) && data.output[0]?.content?.[0]?.text) {
    return data.output[0].content[0].text;
  }

  if (Array.isArray(data.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (Array.isArray(data.choices) && data.choices[0]?.delta?.content) {
    return data.choices[0].delta.content;
  }

  return String(data);
}

export async function getQwenReply(message: string): Promise<string> {
  const payload: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    stream: false,
  };

  if (OLLAMA_MODEL.toLowerCase().startsWith("qwen")) {
    payload.messages = [{ role: "user", content: message }];
  } else {
    payload.prompt = message;
  }

  const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Olama request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const parsed = parseOlamaResponse(data.message.content);
  return parsed.trim();
}
