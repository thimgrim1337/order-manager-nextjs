import { describe, expect, it } from 'vitest';
import { driverName } from '@/lib/drivers';

describe('Drivers: driverName', () => {
  it('shows a Driver by first then last name', () => {
    expect(driverName({ firstName: 'Jan', lastName: 'Kowalski' })).toBe('Jan Kowalski');
  });
});
