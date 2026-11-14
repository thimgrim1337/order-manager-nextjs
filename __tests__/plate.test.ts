import { describe, expect, it } from 'vitest';
import { plateMatches } from '@/lib/plate';

describe('plateMatches', () => {
  it.each([
    'WND2839C',
    'WND 2839C',
    'wnd-2839c',
    'wnd 28',
    '2839',
    ' WND\u00a028 ',
  ])('finds the Plate WND2839C by %j', (typed) => {
    expect(plateMatches('WND2839C', typed)).toBe(true);
  });

  it.each([
    '-',
    '- -',
    'WND.28',
    'WND/2839C',
    'WPL',
  ])('does not find the Plate WND2839C by %j', (typed) => {
    expect(plateMatches('WND2839C', typed)).toBe(false);
  });
});
