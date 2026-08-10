import { describe, expect, it } from 'vitest';
import { calculateProgress, updateCompletion } from './progress';
import type { Topic } from '../types';
const leaf = (id: string, completed = false): Topic => ({ id, title_hi: id, title_en: id, completed, revision: false, bookmarked: false, notes: '', progress: 0, children: [] });
describe('progress rules', () => {
  it('counts only leaves', () => expect(calculateProgress([{ ...leaf('parent'), children: [leaf('a', true), leaf('b')] }]).percentage).toBe(50));
  it('cascades completion down and up', () => { const tree = [{ ...leaf('parent'), children: [leaf('a'), leaf('b')] }]; const completed = updateCompletion(tree, 'parent', true); expect(completed[0].completed).toBe(true); expect(completed[0].children.every((x) => x.completed)).toBe(true); });
  it('clears descendants when unchecking a parent', () => { const tree = [{ ...leaf('p', true), children: [leaf('a', true)] }]; expect(updateCompletion(tree, 'p', false)[0].children[0].completed).toBe(false); });
});
