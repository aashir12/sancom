import { Pinecone, type Index } from "@pinecone-database/pinecone";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

let _index: Index | null = null;

export async function pineconeIndex() {
  if (_index) return _index;

  if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
    throw new Error(
      "Pinecone configuration missing. Set PINECONE_API_KEY and PINECONE_INDEX_NAME in the server environment.",
    );
  }

  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  _index = pc.index({ name: PINECONE_INDEX_NAME });
  return _index;
}

export default pineconeIndex;
