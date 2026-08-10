import { getRelevantContext } from "../lib/pinecone/rag";

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
  // Attempt to retrieve relevant company context from Pinecone RAG
  let context = "";
  try {
    context = await getRelevantContext(message);
  } catch (err) {
    console.error("[llm.service] RAG context retrieval failed:", err);
    context = "";
  }

  const systemPrompt = `You are a professional AI voice calling agent for Versace, a software development agency.\n\nAnswer naturally and concisely in 1–2 short sentences because your response will be converted to speech.\n\nUse the company context below when it is relevant.\n\nIMPORTANT:\n- Do not invent company information.\n- Do not invent prices.\n- Do not invent features.\n- Do not invent discounts.\n- Do not make unsupported promises.\n- If the information is not available, say that it needs to be confirmed with the team.\n- Do not mention RAG, Pinecone, embeddings, vector databases, or internal implementation details to the customer.\n- Speak like a professional human sales representative.\n\n[COMPANY CONTEXT]\n${context || 'No specific company information was retrieved.'}\n\n[USER MESSAGE]`;

  const payload: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    stream: false,
  };

  if (OLLAMA_MODEL.toLowerCase().startsWith("qwen")) {
    payload.messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];
  } else {
    // Non-Qwen models: concatenate system prompt + user message into prompt
    payload.prompt = `${systemPrompt}\n${message}`;
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
