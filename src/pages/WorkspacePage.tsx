import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Sparkles } from 'lucide-react';
import { Card, EmptyState, IconButton } from '../components/ui';
import { SyllabusExplorer } from '../components/syllabus/SyllabusExplorer';
import { WorkspacePanels } from '../components/workspace/WorkspacePanels';
import { useSyllabusStore } from '../store/syllabusStore';
import { useUIStore } from '../store/uiStore';
import { useAuth } from '../auth/useAuth';
import { useCloudStore } from '../store/cloudStore';

type TopicLabel = {
  id: string;
  title_en: string;
  children: TopicLabel[];
};

function findTitle(topics: TopicLabel[], id: string): string {
  for (const topic of topics) {
    if (topic.id === id) return topic.title_en;
    const nested = findTitle(topic.children, id);
    if (nested) return nested;
  }
  return '';
}

export function WorkspacePage() {
  const { user } = useAuth();
  const cloudOffline = useCloudStore((state) => state.offline);
  const selectedTopic = useSyllabusStore((state) => state.selectedTopic);
  const syllabus = useSyllabusStore((state) => state.exams[state.selectedExam]);
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const setDrawerOpen = useUIStore((state) => state.setDrawerOpen);
  const title = selectedTopic
    ? findTitle(
        syllabus.subjects.flatMap((subject) => subject.topics),
        selectedTopic,
      )
    : '';

  return (
    <div className="min-h-screen bg-canvas pl-[114px] pr-8 max-md:pb-24 max-md:pl-4 max-md:pr-4">
      <header className="flex items-center justify-between py-8">
        <div className="flex items-center gap-3">
          <IconButton
            label="Open syllabus explorer"
            onClick={() => setDrawerOpen(true)}
            className="hidden max-lg:block"
          >
            <Menu size={20} />
          </IconButton>
          <div>
            <p className="text-sm font-semibold text-primary">
              {user
                ? `Good morning, ${user.displayName?.split(' ')[0] || 'there'}`
                : 'Good morning'}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
              Your study workspace
            </h1>
          </div>
        </div>
        <div className="hidden items-center gap-3 rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-soft sm:flex">
          <Sparkles size={16} className="text-primary" />
          {user && !cloudOffline ? 'Sync enabled' : 'offline — saving locally'}
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-150px)] grid-cols-[minmax(300px,25%)_1fr] gap-6 max-lg:grid-cols-1">
        <section className="min-h-0 max-lg:hidden">
          <SyllabusExplorer />
        </section>
        <section className="min-h-0">
          <motion.div
            key={selectedTopic || 'empty'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            <Card
              className={`h-full min-h-[580px] p-6 ${
                selectedTopic ? '' : 'flex items-center justify-center'
              }`}
            >
              {selectedTopic ? (
                <>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
                        Selected topic
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-800">{title}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Your focused workspace will grow here.
                      </p>
                    </div>
                    <button
                      aria-label="Open topic workspace"
                      className="rounded-[14px] bg-violet-50 p-3 text-primary"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <WorkspacePanels topicId={selectedTopic} />
                </>
              ) : (
                <EmptyState
                  icon={<Sparkles size={25} />}
                  title="Ready to conquer this topic?"
                  description="Select a syllabus item to start your workspace."
                />
              )}
            </Card>
          </motion.div>
        </section>
      </main>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              aria-label="Close syllabus drawer"
              className="fixed inset-0 z-30 hidden bg-slate-900/20 max-lg:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed bottom-0 left-0 top-0 z-40 block w-[min(92vw,420px)] p-4 max-lg:block lg:hidden"
            >
              <SyllabusExplorer onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
