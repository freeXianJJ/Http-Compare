import { DiffResult, DiffItem, ResponseInfo } from '../types/diff';

export class DiffService {
  compare(oldResponse: ResponseInfo, newResponse: ResponseInfo): DiffResult {
    const statusMatch = oldResponse.status === newResponse.status;
    const bodyDiffs = this.compareBody(oldResponse.body, newResponse.body);

    return {
      identical: statusMatch && bodyDiffs.length === 0,
      differences: [
        ...this.getStatusDiffs(oldResponse, newResponse),
        ...bodyDiffs
      ],
      summary: {
        statusMatch,
        bodyMatch: bodyDiffs.length === 0,
        totalDiffs: bodyDiffs.length + (statusMatch ? 0 : 1)
      }
    };
  }

  private getStatusDiffs(old: ResponseInfo, new_: ResponseInfo): DiffItem[] {
    if (old.status === new_.status) return [];
    return [{
      path: 'status',
      type: 'modified',
      oldValue: old.status,
      newValue: new_.status
    }];
  }

  private compareBody(oldBody: any, newBody: any): DiffItem[] {
    const diffs: DiffItem[] = [];
    this.deepCompare(oldBody, newBody, '', diffs);
    return diffs;
  }

  private deepCompare(oldVal: any, newVal: any, path: string, diffs: DiffItem[]): void {
    const oldType = this.getType(oldVal);
    const newType = this.getType(newVal);

    if (oldType !== newType) {
      diffs.push({
        path: path || 'root',
        type: 'type-mismatch',
        oldValue: oldVal,
        newValue: newVal
      });
      return;
    }

    if (oldVal === null || oldVal === undefined) {
      if (oldVal !== newVal) {
        diffs.push({
          path: path || 'root',
          type: 'modified',
          oldValue: oldVal,
          newValue: newVal
        });
      }
      return;
    }

    if (Array.isArray(oldVal)) {
      this.compareArrays(oldVal, newVal, path, diffs);
      return;
    }

    if (oldType === 'object') {
      this.compareObjects(oldVal, newVal, path, diffs);
      return;
    }

    if (oldVal !== newVal) {
      diffs.push({
        path: path || 'root',
        type: 'modified',
        oldValue: oldVal,
        newValue: newVal
      });
    }
  }

  private compareArrays(oldArr: any[], newArr: any[], path: string, diffs: DiffItem[]): void {
    if (oldArr.length === 0 && newArr.length === 0) return;

    // 简化：基本类型数组使用Set对比
    if (oldArr.length > 0 && this.isPrimitive(oldArr[0])) {
      const oldSet = new Set(oldArr.map(v => JSON.stringify(v)));
      const newSet = new Set(newArr.map(v => JSON.stringify(v)));

      const added = [...newSet].filter(v => !oldSet.has(v));
      const deleted = [...oldSet].filter(v => !newSet.has(v));

      if (added.length > 0 || deleted.length > 0) {
        diffs.push({
          path: path,
          type: 'modified',
          oldValue: oldArr,
          newValue: newArr
        });
      }
    } else {
      // 对象数组：简化对比
      if (JSON.stringify(oldArr) !== JSON.stringify(newArr)) {
        diffs.push({
          path: path,
          type: 'modified',
          oldValue: oldArr,
          newValue: newArr
        });
      }
    }
  }

  private compareObjects(oldObj: any, newObj: any, path: string, diffs: DiffItem[]): void {
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      const oldHas = key in oldObj;
      const newHas = key in newObj;

      if (!oldHas) {
        diffs.push({
          path: newPath,
          type: 'added',
          oldValue: undefined,
          newValue: newObj[key]
        });
      } else if (!newHas) {
        diffs.push({
          path: newPath,
          type: 'deleted',
          oldValue: oldObj[key],
          newValue: undefined
        });
      } else {
        this.deepCompare(oldObj[key], newObj[key], newPath, diffs);
      }
    }
  }

  private getType(val: any): string {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  private isPrimitive(val: any): boolean {
    return val === null || val === undefined ||
           typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
  }
}