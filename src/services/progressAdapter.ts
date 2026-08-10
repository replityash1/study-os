import type { TopicStatus } from '../types';

export interface ProgressDocument {
  statusMap: Record<string, TopicStatus>;
  updatedAt: string;
  mergedAt?: string;
}

export interface ProgressAdapter {
  load(examId: string): Promise<ProgressDocument | null>;
  save(examId: string, document: ProgressDocument): Promise<void>;
}

export const localProgressAdapter: ProgressAdapter = {
  async load(examId) {
    const raw = localStorage.getItem(`study-os-progress-${examId}`);
    return raw ? (JSON.parse(raw) as ProgressDocument) : null;
  },
  async save(examId, document) {
    localStorage.setItem(`study-os-progress-${examId}`, JSON.stringify(document));
  },
};
