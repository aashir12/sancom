import { PineconeClient } from "@pinecone-database/pinecone";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT ?? process.env.PINECONE_ENV;

let _index: ReturnType<PineconeClient["Index"]> | null = null;

export async function pineconeIndex() {
  if (_index) return _index;

  if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
    throw new Error(
      "Pinecone configuration missing. Set PINECONE_API_KEY and PINECONE_INDEX_NAME in the server environment.",
    );
  }

  const client = new PineconeClient();
  // Initialize with environment when provided. If not provided, Pinecone SDK may still work
  // depending on environment configuration. Keep init minimal and let errors surface.
  await client.init({ apiKey: PINECONE_API_KEY, environment: PINECONE_ENVIRONMENT });

  _index = client.Index(PINECONE_INDEX_NAME);
  return _index;
}

export default pineconeIndex;
