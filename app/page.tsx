import { NoteShell } from "@/components/note-shell";
import { listNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const notes = await listNotes();
  return <NoteShell initialNotes={notes} />;
}
