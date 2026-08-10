import { create } from 'zustand';

interface CloudState {
  offline: boolean;
  setOffline: (offline: boolean) => void;
}

export const useCloudStore = create<CloudState>((set) => ({
  offline: false,
  setOffline: (offline) => set({ offline }),
}));
