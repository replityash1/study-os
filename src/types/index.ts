export type TopicStatus = 'not_started' | 'learning' | 'completed' | 'revision_due' | 'mastered';
export interface Topic {
  id: string;
  title_hi: string;
  title_en: string;
  completed: boolean;
  revision: boolean;
  bookmarked: boolean;
  notes: string;
  progress: number;
  children: Topic[];
}
export interface Subject {
  id: string;
  title_hi: string;
  title_en: string;
  completed: boolean;
  progress: number;
  topics: Topic[];
}
export interface Syllabus {
  exam: string;
  subjects: Subject[];
}
export interface Note {
  noteId: string;
  topicId: string;
  content: string;
  updatedAt: string;
}
export interface Asset {
  assetId: string;
  topicId: string;
  type: string;
  title: string;
  driveFileId: string;
  createdAt: string;
}
