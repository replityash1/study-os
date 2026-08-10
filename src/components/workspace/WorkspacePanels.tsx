import { useMemo } from 'react';
import { FileStack } from 'lucide-react';
import { useSyllabusStore } from '../../store/syllabusStore';
import { NotesEditor } from '../notes/NotesEditor';
import { AssetsPanel } from './AssetsPanel';
import { MediaViewer } from './MediaViewer';

export function WorkspacePanels({ topicId }: { topicId: string }) {
  const syllabus = useSyllabusStore((state) => state.exams[state.selectedExam]);
  const title = useMemo(() => {
    function find(topics: (typeof syllabus.subjects)[number]['topics']): string {
      for (const topic of topics) {
        if (topic.id === topicId) return topic.title_en;
        const nested = find(topic.children);
        if (nested) return nested;
      }
      return '';
    }
    return find(syllabus.subjects.flatMap((subject) => subject.topics));
  }, [syllabus, topicId]);

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[minmax(280px,1fr)_minmax(270px,0.9fr)] gap-4">
      <MediaViewer title={title || 'Perspective Basics'} />
      <div className="grid min-h-0 grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] gap-4 max-xl:grid-cols-1">
        <NotesEditor topicId={topicId} />
        <AssetsPanel icon={<FileStack size={17} />} />
      </div>
    </div>
  );
}
