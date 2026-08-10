import DOMPurify from 'dompurify';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Underline,
  Undo2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useNotesStore } from '../../store/notesStore';
import { firestoreNotesAdapter } from '../../services/firestoreNotesAdapter';
import { localNotesAdapter } from '../../services/notesAdapter';
import { clearDraft, recoverDraft, saveDraft } from '../../services/notesDraft';
import type { Note } from '../../types';
import { Button, Card, IconButton } from '../ui';

type Tool = { label: string; icon: React.ReactNode; value: string };
const tools: Tool[] = [
  { label: 'H1', icon: <Heading1 size={15} />, value: '# ' },
  { label: 'H2', icon: <Heading2 size={15} />, value: '## ' },
  { label: 'H3', icon: <Heading3 size={15} />, value: '### ' },
  { label: 'Bold', icon: <Bold size={15} />, value: '**text**' },
  { label: 'Italic', icon: <Italic size={15} />, value: '*text*' },
  { label: 'Underline', icon: <Underline size={15} />, value: '<u>text</u>' },
  { label: 'Bullet list', icon: <List size={15} />, value: '- ' },
  { label: 'Numbered list', icon: <ListOrdered size={15} />, value: '1. ' },
  { label: 'Quote', icon: <Quote size={15} />, value: '> ' },
  { label: 'Link', icon: <Link size={15} />, value: '[text](https://)' },
];

export function NotesEditor({ topicId }: { topicId: string }) {
  const { user } = useAuth();
  const cachedNote = useNotesStore((state) => state.notes[topicId]);
  const setNote = useNotesStore((state) => state.setNote);
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [restored, setRestored] = useState(false);
  const [modified, setModified] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<number | null>(null);
  const contentRef = useRef('');
  const topicRef = useRef(topicId);

  function applyContent(next: string, track = true) {
    if (track && next !== contentRef.current) {
      setHistory((items) => [...items.slice(-30), contentRef.current]);
      setFuture([]);
    }
    contentRef.current = next;
    setContent(next);
    saveDraft(topicId, next);
  }

  async function saveNow(id = topicRef.current, value = contentRef.current) {
    const note: Note = {
      noteId: `note-${id}`,
      topicId: id,
      content: value,
      updatedAt: new Date().toISOString(),
    };
    const adapter = user ? firestoreNotesAdapter(user.uid) : localNotesAdapter;
    try {
      await adapter.save(note);
      setNote(note);
      clearDraft(id);
      if (id === topicRef.current) setModified(note.updatedAt);
    } catch (error) {
      console.warn('Note save unavailable; keeping the draft locally.', error);
    }
  }

  function scheduleSave() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void saveNow(), 1000);
  }

  function insert(value: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contentRef.current.slice(start, end);
    const insertion = value.includes('text') ? value.replace('text', selected || 'text') : value;
    applyContent(contentRef.current.slice(0, start) + insertion + contentRef.current.slice(end));
    scheduleSave();
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + insertion.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  useEffect(() => {
    const previousId = topicRef.current;
    if (previousId !== topicId) {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      void saveNow(previousId);
      topicRef.current = topicId;
      setHistory([]);
      setFuture([]);
    }
    let cancelled = false;
    async function load() {
      const adapter = user ? firestoreNotesAdapter(user.uid) : localNotesAdapter;
      const note = cachedNote ?? (await adapter.load(topicId));
      if (cancelled) return;
      const saved = note?.content ?? '';
      const draft = recoverDraft(topicId, saved);
      applyContent(draft ?? saved, false);
      setRestored(Boolean(draft));
      setModified(note?.updatedAt ?? null);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [topicId, user]);

  return (
    <Card className="min-h-[360px] border border-slate-100 p-4 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-700">Notes Editor</h3>
          <p className="text-xs text-slate-400">Markdown notes, saved as you think.</p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            label="Undo"
            disabled={!history.length}
            onClick={() => {
              const previous = history[history.length - 1];
              setHistory((items) => items.slice(0, -1));
              setFuture((items) => [...items, contentRef.current]);
              applyContent(previous, false);
            }}
          >
            <Undo2 size={15} />
          </IconButton>
          <IconButton
            label="Redo"
            disabled={!future.length}
            onClick={() => {
              const next = future[future.length - 1];
              setFuture((items) => items.slice(0, -1));
              setHistory((items) => [...items, contentRef.current]);
              applyContent(next, false);
            }}
          >
            <Redo2 size={15} />
          </IconButton>
          <Button
            onClick={() => void saveNow()}
            className="ml-2 flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Save size={14} /> Save
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1 border-y border-slate-100 py-2">
        {tools.map((tool) => (
          <IconButton key={tool.label} label={tool.label} onClick={() => insert(tool.value)}>
            {tool.icon}
          </IconButton>
        ))}
        <IconButton label="Code" onClick={() => insert('`code`')}>
          <Code size={15} />
        </IconButton>
        <button
          onClick={() => setPreview((value) => !value)}
          className="ml-auto rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-violet-50"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {restored && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Restored unsaved draft
        </p>
      )}
      {preview ? (
        <article className="prose prose-sm mt-4 min-h-[180px] max-w-none text-slate-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })}
          </ReactMarkdown>
        </article>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            applyContent(event.target.value);
            scheduleSave();
          }}
          placeholder="Write your notes in Markdown…"
          className="mt-4 min-h-[180px] w-full resize-y rounded-[14px] border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
        />
      )}
      <p className="mt-2 text-right text-[11px] text-slate-400">
        {modified ? `Last modified ${new Date(modified).toLocaleString()}` : 'Not saved yet'}
      </p>
    </Card>
  );
}
