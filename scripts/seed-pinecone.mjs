/**
 * One-time script to load agency knowledge into your Pinecone index.
 *
 * Usage (from project root):
 *   npm run seed:pinecone
 *   node --env-file=.env scripts/seed-pinecone.mjs
 *
 * Required env vars: PINECONE_API_KEY, PINECONE_INDEX_NAME
 * Optional: PINECONE_TEXT_FIELD (default: "text")
 */

import { Pinecone } from "@pinecone-database/pinecone";

const TEXT_FIELD = process.env.PINECONE_TEXT_FIELD ?? "text";

const AGENCY_KNOWLEDGE = [
  {
    id: "about-1",
    category: "about",
    text: "Sancom Digital is a website creation agency founded in 2019. We design and build modern, fast, mobile-friendly websites for small businesses, startups, and e-commerce brands. Our team is based in Karachi, Pakistan, and we serve clients worldwide remotely.",
  },
  {
    id: "services-1",
    category: "services",
    text: "Our core services include custom website design, WordPress and Next.js development, landing pages, e-commerce stores (Shopify and WooCommerce), website redesign, and ongoing maintenance and support.",
  },
  {
    id: "services-2",
    category: "services",
    text: "We also offer SEO setup, Google Analytics integration, contact forms, live chat widgets, payment gateway setup, and basic branding help such as logo placement and color palette selection.",
  },
  {
    id: "process-1",
    category: "process",
    text: "Our typical project process: (1) free discovery call, (2) proposal and quote within 48 hours, (3) design mockup approval, (4) development, (5) testing on mobile and desktop, (6) launch, (7) 30 days of post-launch support.",
  },
  {
    id: "timeline-1",
    category: "timeline",
    text: "A simple business website usually takes 2 to 3 weeks. A landing page can be ready in 5 to 7 days. E-commerce projects typically take 4 to 6 weeks depending on product count and custom features.",
  },
  {
    id: "pricing-1",
    category: "pricing",
    text: "Starter landing page packages start from approximately 25,000 PKR. Business websites start from approximately 75,000 PKR. E-commerce websites start from approximately 150,000 PKR. Exact pricing depends on pages, features, and integrations — we provide a custom quote after the discovery call.",
  },
  {
    id: "pricing-2",
    category: "pricing",
    text: "Monthly maintenance plans start from approximately 8,000 PKR per month and include security updates, backups, minor content changes, and uptime monitoring. We do not lock clients into long-term contracts.",
  },
  {
    id: "tech-1",
    category: "technology",
    text: "We build with modern tools including Next.js, React, WordPress, Tailwind CSS, Shopify, and WooCommerce. All sites are optimized for speed, SEO basics, and responsive design on phones, tablets, and desktops.",
  },
  {
    id: "portfolio-1",
    category: "portfolio",
    text: "Recent work includes a restaurant ordering site with online menu and reservations, a law firm corporate website with blog, a fashion e-commerce store with 200+ products, and a SaaS landing page with lead capture forms.",
  },
  {
    id: "contact-1",
    category: "contact",
    text: "Contact Sancom Digital at hello@sancomdigital.com or call +92-300-1234567. Office hours are Monday to Friday, 10 AM to 6 PM PKT. You can also book a free 20-minute consultation on our website.",
  },
  {
    id: "faq-1",
    category: "faq",
    text: "Do you provide hosting? We can set up hosting on Vercel, Netlify, or your preferred provider, or manage it for you on our maintenance plan. Do you provide content writing? We can recommend copywriters or use content you supply. Do you offer revisions? Yes, two rounds of design revisions are included in every project.",
  },
  {
    id: "faq-2",
    category: "faq",
    text: "What do you need from the client to start? Your logo (if available), brand colors, example websites you like, page list, and any text or images you want on the site. We can help fill gaps with stock images and placeholder copy during development.",
  },
];

async function main() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;

  if (!apiKey || !indexName) {
    console.error("Missing PINECONE_API_KEY or PINECONE_INDEX_NAME.");
    console.error("Create .env with those values, then run:");
    console.error("  npm run seed:pinecone");
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey });
  const index = pc.index({ name: indexName });

  const records = AGENCY_KNOWLEDGE.map((item) => ({
    id: item.id,
    category: item.category,
    [TEXT_FIELD]: item.text,
  }));

  console.log(`Upserting ${records.length} records into index "${indexName}"...`);
  console.log(`Using text field: "${TEXT_FIELD}"`);

  await index.upsertRecords({ records });

  console.log("Done! Refresh your Pinecone dashboard — record count should update shortly.");
  console.log("Test by asking your voice agent: 'What services do you offer?' or 'How much does a website cost?'");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
