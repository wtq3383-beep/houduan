import { neon } from "@neondatabase/serverless";

export type NoteRecord = {
  id: string;
  title: string;
  content: string;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
};

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  return neon(databaseUrl);
}

export async function ensureNotesTable() {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}
