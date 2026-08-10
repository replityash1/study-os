import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TopicStatus } from '../types';
interface ProgressState { statusMap: Record<string, TopicStatus>; setStatus: (id: string, status: TopicStatus) => void; }
export const useProgressStore = create<ProgressState>()(persist((set) => ({
  statusMap: {}, setStatus: (id, status) => set((state) => ({ statusMap: { ...state.statusMap, [id]: status } })),
}), { name: 'study-os-progress' }));
