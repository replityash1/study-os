import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { IconButton } from '../components/ui';
import { SyllabusExplorer } from '../components/syllabus/SyllabusExplorer';
import { WorkspacePanels } from '../components/workspace/WorkspacePanels';
import { useAuth } from '../auth/useAuth';
import { useCloudStore } from '../store/cloudStore';
import { useSyllabusStore } from '../store/syllabusStore';
import { useUIStore } from '../store/uiStore';

export function WorkspacePage() {
  const { user } = useAuth();
  const cloudOffline = useCloudStore((state) => state.offline);
  const selectedTopic = useSyllabusStore((state) => state.selectedTopic);
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const setDrawerOpen = useUIStore((state) => state.setDrawerOpen);

  return (
    <div className="min-h-screen bg-canvas pl-[114px] pr-8 pt-5 max-md:pb-24 max-md:pl-4 max-md:pr-4">
      <div className="fixed bottom-5 left-[114px] z-10 hidden rounded-full bg-white px-3 py-2 text-[10px] font-semibold text-slate-500 shadow-soft sm:block">
        {user ? (cloudOffline ? 'Offline — saving locally' : 'Sync enabled') : 'Local mode'}
      </div>
      <main className="grid min-h-[calc(100vh-40px)] grid-cols-[minmax(300px,340px)_1fr] gap-5 max-lg:grid-cols-1">
        <section className="min-h-0 max-lg:hidden">
          <SyllabusExplorer />
        </section>
        <section className="min-h-0">
          <div className="flex min-h-[calc(100vh-40px)] flex-col gap-4">
            <div className="flex items-center justify-between lg:hidden">
              <IconButton label="Open syllabus explorer" onClick={() => setDrawerOpen(true)}>
                <Menu size={20} />
              </IconButton>
              <SyncStatus />
            </div>
            <WorkspacePanels topicId={selectedTopic ?? undefined} />
          </div>
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

function SyncStatus() {
  const { user } = useAuth();
  const offline = useCloudStore((state) => state.offline);
  return (
    <span className="rounded-full bg-white px-3 py-2 text-xs text-slate-500 shadow-soft">
      {user ? (offline ? 'Offline — saving locally' : 'Sync enabled') : 'Local mode'}
    </span>
  );
}
