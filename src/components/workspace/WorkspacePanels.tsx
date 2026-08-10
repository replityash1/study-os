import { BookOpen, Layers3 } from 'lucide-react';
import { Card } from '../ui';
import { NotesEditor } from '../notes/NotesEditor';

function PlaceholderPanel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Card className="min-h-[220px] border border-slate-100 p-5">
      <div className="mb-10 inline-flex rounded-[14px] bg-violet-50 p-3 text-primary">{icon}</div>
      <h3 className="font-bold text-slate-700">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">Coming in the next step</p>
    </Card>
  );
}

export function WorkspacePanels({ topicId }: { topicId: string }) {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      <PlaceholderPanel icon={<BookOpen />} title="Smart Viewer" />
      <NotesEditor topicId={topicId} />
      <PlaceholderPanel icon={<Layers3 />} title="Asset Timeline" />
    </div>
  );
}
