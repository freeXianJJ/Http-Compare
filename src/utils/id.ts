import { nanoid } from 'nanoid';

export function createId(prefix = ''): string {
  const id = nanoid();
  return prefix ? `${prefix}-${id}` : id;
}

export default createId;
