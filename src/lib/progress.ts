import type { Topic, TopicStatus } from '../types';

export function getLeaves(topics: Topic[]): Topic[] {
  return topics.flatMap((topic) => topic.children.length ? getLeaves(topic.children) : [topic]);
}
export function calculateProgress(topics: Topic[]): { completedLeaves: number; totalLeaves: number; percentage: number } {
  const leaves = getLeaves(topics);
  const completedLeaves = leaves.filter((leaf) => leaf.completed).length;
  return { completedLeaves, totalLeaves: leaves.length, percentage: leaves.length ? Math.round(completedLeaves / leaves.length * 100) : 0 };
}
export function cascadeStatus(topic: Topic, status: TopicStatus): Topic {
  const completed = status === 'completed' || status === 'mastered';
  return { ...topic, completed, children: topic.children.map((child) => cascadeStatus(child, status)) };
}
export function clearDescendants(topic: Topic): Topic {
  return { ...topic, completed: false, children: topic.children.map(clearDescendants) };
}
export function updateCompletion(topics: Topic[], id: string, checked: boolean): Topic[] {
  const visit = (items: Topic[]): Topic[] => items.map((topic) => {
    if (topic.id === id) return checked ? cascadeStatus(topic, 'completed') : clearDescendants(topic);
    if (!topic.children.length) return topic;
    const children = visit(topic.children);
    return { ...topic, children, completed: children.length > 0 && children.every((child) => child.completed) };
  });
  return visit(topics);
}
export function statusForTopic(topic: Topic, statusMap: Record<string, TopicStatus>): TopicStatus {
  if (statusMap[topic.id]) return statusMap[topic.id];
  return topic.completed ? 'completed' : topic.progress > 0 ? 'learning' : 'not_started';
}
