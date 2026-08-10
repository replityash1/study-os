import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { syllabi } from '../store/syllabusStore';
import { useProgressStore } from '../store/progressStore';
import { firestoreProgressAdapter } from '../services/firestoreProgressAdapter';
import { localProgressAdapter } from '../services/progressAdapter';
import { mergeProgress } from '../services/mergePolicy';
import { useCloudStore } from '../store/cloudStore';

let reportedCloudError = false;

export function useCloudSync() {
  const { user } = useAuth();
  const replaceExam = useProgressStore((state) => state.replaceExam);
  const setOffline = useCloudStore((state) => state.setOffline);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const remote = firestoreProgressAdapter(user.uid);

    async function sync() {
      for (const syllabus of syllabi) {
        try {
          const [local, remoteDocument] = await Promise.all([
            localProgressAdapter.load(syllabus.exam),
            remote.load(syllabus.exam),
          ]);
          if (cancelled) return;
          const existing = useProgressStore.getState().examStatusMaps[syllabus.exam];
          const merged = mergeProgress(
            local ?? existing ?? null,
            remoteDocument,
            Boolean(existing?.mergedAt),
          );
          replaceExam(syllabus.exam, merged);
          await remote.save(syllabus.exam, merged);
          setOffline(false);
        } catch (error) {
          if (!reportedCloudError) {
            console.warn('Study OS cloud sync unavailable; continuing locally.', error);
            reportedCloudError = true;
          }
          setOffline(true);
        }
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [replaceExam, user]);

  useEffect(() => {
    if (!user) return;
    const remote = firestoreProgressAdapter(user.uid);
    let timer: number | null = null;
    const unsubscribe = useProgressStore.subscribe((state, previous) => {
      if (state.activeExamId === previous.activeExamId) {
        const next = state.examStatusMaps[state.activeExamId];
        const before = previous.examStatusMaps[previous.activeExamId];
        if (next === before || !next) return;
      }
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const current = useProgressStore.getState();
        const document = current.examStatusMaps[current.activeExamId];
        if (document) {
          void remote.save(current.activeExamId, document).catch((error) => {
            if (!reportedCloudError) {
              console.warn('Study OS cloud sync unavailable; continuing locally.', error);
              reportedCloudError = true;
            }
            setOffline(true);
          });
        }
      }, 800);
    });
    return () => {
      unsubscribe();
      if (timer) window.clearTimeout(timer);
    };
  }, [setOffline, user]);
}
