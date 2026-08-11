import pineconeIndex from "./client";

const TOP_K = 3;
// Field that Pinecone embeds (see index CONFIGURATION tab → field_map). Default for console indexes is usually "text".
const TEXT_FIELD = process.env.PINECONE_TEXT_FIELD ?? "text";

export async function getRelevantContext(query: string): Promise<string> {
  try {
    if (!query) return "";

    const index = await pineconeIndex();

    const result = await index.searchRecords({
      query: {
        topK: TOP_K,
        inputs: { text: query },
      },
      fields: [TEXT_FIELD, "category"],
    });

    const hits = result.result?.hits ?? [];
    if (!Array.isArray(hits) || hits.length === 0) return "";

    const texts: string[] = [];
    for (const hit of hits.slice(0, TOP_K)) {
      const fields = (hit.fields ?? {}) as Record<string, unknown>;
      const value = fields[TEXT_FIELD];
      if (typeof value === "string" && value.trim()) {
        texts.push(value.trim());
      }
    }

    return texts.join("\n\n");
  } catch (err) {
    console.error("[rag] failed to retrieve context:", err);
    return "";
  }
}

export default getRelevantContext;
