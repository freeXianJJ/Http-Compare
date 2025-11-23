import { describe, test, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import writeRun from '../runWriter';
import { Run } from '../../src/types/api';

describe('runWriter', () => {
  const baseDir = path.join('runs', 'test-run-writer');

  test('writes run.json and per-endpoint result files', async () => {
    const sampleRun: Run = {
      id: 'test-run-writer',
      startTime: Date.now(),
      endTime: undefined,
      summary: { passed: 1, failed: 0, skipped: 0 },
      results: [
        {
          id: 'r1',
          apiConfig: { id: 'a1', name: 'a1', url: '/p', method: 'GET' as any, parameters: [], headers: [], createdAt: Date.now(), updatedAt: Date.now() },
          oldService: { request: { url: '', method: 'GET' as any, headers: {}, timestamp: Date.now(), duration: 1 }, response: { status: 200, statusText: 'OK', headers: {}, body: { ok: true }, timestamp: Date.now() } },
          newService: { request: { url: '', method: 'GET' as any, headers: {}, timestamp: Date.now(), duration: 1 }, response: { status: 200, statusText: 'OK', headers: {}, body: { ok: true }, timestamp: Date.now() } },
          diffResult: { identical: true, differences: [], summary: { statusMatch: true, bodyMatch: true, totalDiffs: 0 } },
          timestamp: Date.now()
        }
      ]
    };

    // call writeRun
    await writeRun(sampleRun, 'runs');

    const runJsonPath = path.join('runs', sampleRun.id, 'run.json');
    const resultsDir = path.join('runs', sampleRun.id, 'results');
    const resultFile = path.join(resultsDir, 'r1.json');

    const runExists = await fs.stat(runJsonPath).then(() => true).catch(() => false);
    const resultExists = await fs.stat(resultFile).then(() => true).catch(() => false);

    expect(runExists).toBe(true);
    expect(resultExists).toBe(true);

    // cleanup
    await fs.rm(path.join('runs', sampleRun.id), { recursive: true, force: true });
  });
});
