import { describe, expect, it } from 'vitest';
import { timelineColor } from '@/features/OrdersTimeline/lib/timeline-color';

describe('Timeline: timelineColor', () => {
  it('gives an Order its colour by its id, so the Driver filter does not change it', () => {
    expect(timelineColor(7)).toBe('border-chart-3');
    expect(timelineColor(12)).toBe('border-chart-3');
  });

  it('gives consecutive Orders different colours', () => {
    expect(new Set([1, 2, 3, 4, 5].map(timelineColor)).size).toBe(5);
  });
});
