import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TopicStatus } from '../types';
import type { ProgressDocument } from '../services/progressAdapter';
import { localProgressAdapter } from '../services/progressAdapter';

interface ProgressState {
  activeExamId: string;
  statusMap: Record<string, TopicStatus>;
  examStatusMaps: Record<string, ProgressDocument>;
  setActiveExam: (examId: string) => void;
  setStatus: (id: string, status: TopicStatus) => void;
  setStatuses: (updates: Record<string, TopicStatus>) => void;
  replaceExam: (examId: string, document: ProgressDocument) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      activeExamId: '',
      statusMap: {},
      examStatusMaps: {},
      setActiveExam: (activeExamId) =>
        set((state) => ({
          activeExamId,
          statusMap: state.examStatusMaps[activeExamId]?.statusMap ?? {},
        })),
      setStatus: (id, status) =>
        set((state) => {
          const statusMap = { ...state.statusMap, [id]: status };
          void localProgressAdapter.save(state.activeExamId, {
            statusMap,
            updatedAt: new Date().toISOString(),
          });
          return {
            statusMap,
            examStatusMaps: {
              ...state.examStatusMaps,
              [state.activeExamId]: { statusMap, updatedAt: new Date().toISOString() },
            },
          };
        }),
      setStatuses: (updates) =>
        set((state) => {
          const statusMap = { ...state.statusMap, ...updates };
          void localProgressAdapter.save(state.activeExamId, {
            statusMap,
            updatedAt: new Date().toISOString(),
          });
          return {
            statusMap,
            examStatusMaps: {
              ...state.examStatusMaps,
              [state.activeExamId]: { statusMap, updatedAt: new Date().toISOString() },
            },
          };
        }),
      replaceExam: (examId, document) =>
        set((state) => {
          void localProgressAdapter.save(examId, document);
          return {
            activeExamId: state.activeExamId || examId,
            statusMap: state.activeExamId === examId ? document.statusMap : state.statusMap,
            examStatusMaps: { ...state.examStatusMaps, [examId]: document },
          };
        }),
    }),
    {
      name: 'study-os-progress',
      partialize: (state) => ({
        activeExamId: state.activeExamId,
        statusMap: state.statusMap,
        examStatusMaps: state.examStatusMaps,
      }),
    },
  ),
);
