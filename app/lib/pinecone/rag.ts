import pineconeIndex from "./client";
import { OllamaEmbeddings } from "@langchain/ollama";

const EMBEDDING_MODEL = "nomic-embed-text";
const TOP_K = 3;

export async function getRelevantContext(query: string): Promise<string> {
  try {
    if (!query) return "";

    // Generate embedding using Ollama via LangChain bindings
    const embedder = new OllamaEmbeddings({ model: EMBEDDING_MODEL });
    const vector = await embedder.embedQuery(query);

    if (!vector || !Array.isArray(vector) || vector.length === 0) {
      console.error("[rag] Empty embedding generated for query.");
      return "";
    }

    const index = await pineconeIndex();

    // Query Pinecone for nearest neighbors
    // The official client supports a `query` method. Use a compact request.
    // Type differences across SDK versions may exist; keep call simple.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await index.query({
      topK: TOP_K,
      vector,
      includeMetadata: true,
    });

    const matches = result?.matches ?? result?.matches ?? [];
    if (!Array.isArray(matches) || matches.length === 0) return "";

    const texts: string[] = [];
    for (const m of matches.slice(0, TOP_K)) {
      const meta = m.metadata ?? m?.metadata ?? {};
      const t = typeof meta.text === "string" ? meta.text : undefined;
      if (t) texts.push(t.trim());
    }

    if (texts.length === 0) return "";

    // Join into a concise context string
    const context = texts.join("\n\n");
    return context;
  } catch (err) {
    console.error("[rag] failed to retrieve context:", err);
    return "";
  }
}

export default getRelevantContext;
