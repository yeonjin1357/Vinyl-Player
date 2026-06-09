import { describe, expect, it } from 'vitest';
import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('formats whole minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(215)).toBe('3:35');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(65.9)).toBe('1:05');
  });

  it('guards invalid input', () => {
    expect(formatTime(Number.NaN)).toBe('0:00');
    expect(formatTime(-10)).toBe('0:00');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});
