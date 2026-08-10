import { create } from 'zustand';
import type { Asset, AssetType, UploadProgress, UploadTask } from '../types';
import { uploadDriveAsset } from '../services/drive';
import { localAssetsAdapter, type AssetsAdapter } from '../services/assetsAdapter';
import { createUploadQueue, type UploadOne } from '../services/uploadQueue';

interface AssetsState {
  assets: Asset[];
  filter: 'All' | AssetType;
  selectedAsset: Asset | null;
  uploadTasks: UploadTask[];
  uploadProgress: UploadProgress;
  adapter: AssetsAdapter;
  activeQueue: ReturnType<typeof createUploadQueue> | null;
  setAdapter: (adapter: AssetsAdapter) => void;
  setFilter: (filter: AssetsState['filter']) => void;
  selectAsset: (asset: Asset | null) => void;
  hydrate: (topicId: string) => Promise<void>;
  startUpload: (files: File[], topicId: string, uploadOne?: UploadOne) => Promise<void>;
  retryUpload: (taskId: string) => Promise<void>;
  cancelUpload: () => void;
}

const emptyProgress: UploadProgress = {
  completed: 0,
  total: 0,
  bytesUploaded: 0,
  bytesTotal: 0,
};

export const useAssetsStore = create<AssetsState>((set, get) => ({
  assets: [],
  filter: 'All',
  selectedAsset: null,
  uploadTasks: [],
  uploadProgress: emptyProgress,
  adapter: localAssetsAdapter,
  activeQueue: null,
  setAdapter: (adapter) => set({ adapter }),
  setFilter: (filter) => set({ filter }),
  selectAsset: (selectedAsset) => set({ selectedAsset }),
  hydrate: async (topicId) => {
    const assets = await get().adapter.list(topicId);
    set({ assets, selectedAsset: null });
  },
  startUpload: async (
    files,
    topicId,
    uploadOne = async (file, id) => uploadDriveAsset(id, file),
  ) => {
    const queue = createUploadQueue(
      files.map((file) => ({ file, topicId })),
      uploadOne,
      {
        concurrency: 3,
        onUpdate: (uploadTasks, uploadProgress) => set({ uploadTasks, uploadProgress }),
      },
    );
    set({ activeQueue: queue });
    await queue.start();
    const uploaded = queue.tasks
      .filter((task) => task.status === 'uploaded' && task.asset)
      .map((task) => task.asset as Asset);
    for (const asset of uploaded) await get().adapter.save(asset);
    if (uploaded.length) {
      set((state) => ({
        assets: [
          ...state.assets.filter(
            (item) => !uploaded.some((asset) => asset.assetId === item.assetId),
          ),
          ...uploaded,
        ],
      }));
    }
    set({ activeQueue: null });
  },
  retryUpload: async (taskId) => {
    await get().activeQueue?.retry(taskId);
  },
  cancelUpload: () => {
    get().activeQueue?.cancel();
    set({ activeQueue: null });
  },
}));
