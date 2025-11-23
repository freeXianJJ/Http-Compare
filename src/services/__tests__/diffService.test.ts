import { describe, test, expect } from 'vitest';
import { DiffService } from '../diffService';

describe('DiffService', () => {
  const svc = new DiffService();

  test('identical simple objects', () => {
    const a = { x: 1, y: 'ok' };
    const res = svc.compare({ status: 200, statusText: 'OK', headers: {}, body: a, timestamp: 1 }, { status: 200, statusText: 'OK', headers: {}, body: a, timestamp: 2 });
    expect(res.identical).toBe(true);
    expect(res.summary.totalDiffs).toBe(0);
  });

  test('detect modified primitive', () => {
    const a = { x: 1 };
    const b = { x: 2 };
    const res = svc.compare({ status: 200, statusText: 'OK', headers: {}, body: a, timestamp: 1 }, { status: 200, statusText: 'OK', headers: {}, body: b, timestamp: 2 });
    expect(res.identical).toBe(false);
    expect(res.differences.length).toBeGreaterThan(0);
  });
});
