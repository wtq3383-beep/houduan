import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createNote, listNotes, parseNotePayload } from "@/lib/notes";

export async function GET() {
  const notes = await listNotes();
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseNotePayload(body);
    const note = await createNote(input);
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create note." }, { status: 500 });
  }
}
