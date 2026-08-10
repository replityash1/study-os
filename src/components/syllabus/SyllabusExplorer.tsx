import { useEffect, useMemo, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Badge, Button, Card, IconButton, Input, ProgressBar, SegmentedToggle } from '../ui';
import { calculateProgress } from '../../lib/progress';
import { useSyllabusStore } from '../../store/syllabusStore';
import { useProgressStore } from '../../store/progressStore';
import { SubjectRow } from './SubjectRow';

export function SyllabusExplorer({ onClose }: { onClose?: () => void }) {
  const { exams, selectedExam, setExam, searchQuery, setSearchQuery } = useSyllabusStore();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const syllabus = exams[selectedExam];
  const statusMap = useProgressStore((state) => state.statusMap);
  const progress = useMemo(
    () =>
      calculateProgress(
        syllabus.subjects.flatMap((subject) => subject.topics),
        statusMap,
      ),
    [statusMap, syllabus],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(searchInput), 200);
    return () => window.clearTimeout(timeout);
  }, [searchInput, setSearchQuery]);

  useEffect(() => {
    setSearchInput('');
  }, [selectedExam]);

  return (
    <Card className="flex h-full min-h-0 flex-col p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
            Syllabus Explorer
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-800">Your customized study path</h2>
        </div>
        {onClose && (
          <IconButton label="Close syllabus explorer" onClick={onClose}>
            <X size={18} />
          </IconButton>
        )}
      </div>
      <SegmentedToggle
        options={['RAS Pre', '2nd Science', '2nd GK']}
        value={selectedExam}
        onChange={setExam}
      />
      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9"
          />
        </div>
        <IconButton label="Filter topics">
          <Filter size={18} />
        </IconButton>
      </div>
      <div className="mt-4 rounded-[18px] bg-violet-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Overall Progress</span>
          <span className="text-xl font-bold text-primary">{progress.percentage}%</span>
        </div>
        <ProgressBar value={progress.percentage} />
        <p className="mt-2 text-xs text-slate-400">
          {progress.completedLeaves} / {progress.totalLeaves} Topics Completed
        </p>
        <Button className="mt-3 w-full bg-white !text-primary shadow-none hover:bg-violet-100">
          View Analytics
        </Button>
      </div>
      <div
        role="tree"
        aria-label="Syllabus topics"
        className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
      >
        {syllabus.subjects.map((subject, index) => (
          <SubjectRow key={subject.id} subject={subject} index={index} />
        ))}
      </div>
      {searchQuery && <Badge tone="blue">Searching for “{searchQuery}”</Badge>}
    </Card>
  );
}
