import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ensureNotesTable, getSql, type NoteRecord } from "@/lib/db";

const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  content: z.string().max(50000, "Content is too long."),
  imageUrls: z.array(z.string().url()).max(30).default([])
});

type NoteInput = z.infer<typeof noteSchema>;

export function parseNotePayload(payload: unknown): NoteInput {
  return noteSchema.parse(payload);
}

export async function listNotes() {
  await ensureNotesTable();
  const sql = getSql();

  const rows = (await sql`
    SELECT id, title, content, image_urls, created_at, updated_at
    FROM notes
    ORDER BY updated_at DESC;
  `) as NoteRecord[];

  return rows.map(normalizeNote);
}

export async function getNote(id: string) {
  await ensureNotesTable();
  const sql = getSql();

  const rows = (await sql`
    SELECT id, title, content, image_urls, created_at, updated_at
    FROM notes
    WHERE id = ${id}
    LIMIT 1;
  `) as NoteRecord[];

  return rows[0] ? normalizeNote(rows[0]) : null;
}

export async function createNote(input: NoteInput) {
  await ensureNotesTable();
  const sql = getSql();
  const id = randomUUID();

  const rows = (await sql`
    INSERT INTO notes (id, title, content, image_urls)
    VALUES (${id}, ${input.title}, ${input.content}, ${JSON.stringify(input.imageUrls)}::jsonb)
    RETURNING id, title, content, image_urls, created_at, updated_at;
  `) as NoteRecord[];

  return normalizeNote(rows[0]);
}

export async function updateNote(id: string, input: NoteInput) {
  await ensureNotesTable();
  const sql = getSql();

  const rows = (await sql`
    UPDATE notes
    SET
      title = ${input.title},
      content = ${input.content},
      image_urls = ${JSON.stringify(input.imageUrls)}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, title, content, image_urls, created_at, updated_at;
  `) as NoteRecord[];

  return rows[0] ? normalizeNote(rows[0]) : null;
}

export async function deleteNote(id: string) {
  await ensureNotesTable();
  const sql = getSql();

  const rows = (await sql`
    DELETE FROM notes
    WHERE id = ${id}
    RETURNING id;
  `) as { id: string }[];

  return rows.length > 0;
}

function normalizeNote(note: NoteRecord) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    imageUrls: Array.isArray(note.image_urls) ? note.image_urls : [],
    createdAt: note.created_at,
    updatedAt: note.updated_at
  };
}
