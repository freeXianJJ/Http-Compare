import { HttpMethod, ApiConfig } from './api';

export interface RequestInfo {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  duration: number;
}

export interface ResponseInfo {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
  error?: string;
}

export interface TestResult {
  id: string;
  apiConfig: ApiConfig;
  oldService: {
    request: RequestInfo;
    response: ResponseInfo;
  };
  newService: {
    request: RequestInfo;
    response: ResponseInfo;
  };
  diffResult: DiffResult;
  timestamp: number;
}

export interface DiffResult {
  identical: boolean;
  differences: DiffItem[];
  summary: {
    statusMatch: boolean;
    bodyMatch: boolean;
    totalDiffs: number;
  };
}

export interface DiffItem {
  path: string;
  type: 'added' | 'deleted' | 'modified' | 'type-mismatch';
  oldValue?: any;
  newValue?: any;
}