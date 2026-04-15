import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { deleteNote, getNote, parseNotePayload, updateNote } from "@/lib/notes";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const note = await getNote(id);

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = parseNotePayload(body);
    const note = await updateNote(id, input);

    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update note." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  const { id } = await context.params;
  const deleted = await deleteNote(id);

  if (!deleted) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
