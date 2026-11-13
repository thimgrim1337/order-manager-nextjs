import { describe, expect, it } from 'vitest';
import { existingPageIndex } from '@/lib/pagination';

describe('existingPageIndex', () => {
  it('keeps a page that exists', () => {
    expect(existingPageIndex(2, 10, 25)).toBe(2);
  });

  it('gives the last page for one past it', () => {
    expect(existingPageIndex(5, 10, 25)).toBe(2);
  });

  it('counts a full last page as the last', () => {
    expect(existingPageIndex(2, 10, 20)).toBe(1);
  });

  it('gives the one empty page when there are no rows', () => {
    expect(existingPageIndex(3, 10, 0)).toBe(0);
  });
});
