import { promises as fs } from 'fs';
import path from 'path';
import { Run } from '../types/api';

export async function writeRun(run: Run, baseDir = 'runs'): Promise<void> {
  const runDir = path.join(baseDir, run.id);
  const resultsDir = path.join(runDir, 'results');

  // Create directories recursively
  await fs.mkdir(resultsDir, { recursive: true });

  // Write run.json
  const runPath = path.join(runDir, 'run.json');
  await fs.writeFile(runPath, JSON.stringify(run, null, 2), 'utf8');

  // Write individual results
  if (run.results && Array.isArray(run.results)) {
    for (const res of run.results) {
      const id = (res as any).id || (res as any).apiConfig?.id || Math.random().toString(36).slice(2, 10);
      const filePath = path.join(resultsDir, `${id}.json`);
      await fs.writeFile(filePath, JSON.stringify(res, null, 2), 'utf8');
    }
  }
}

export default writeRun;
