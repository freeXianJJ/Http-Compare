export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export enum ParamType {
  QUERY = 'query',
  PATH = 'path',
  BODY = 'body',
  FORM = 'form'
}

export interface Parameter {
  id: string;
  name: string;
  type: ParamType;
  value: string;
  enabled: boolean;
}

export interface ApiConfig {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  parameters: Parameter[];
  headers: Parameter[];
  createdAt: number;
  updatedAt: number;
}

import { TestResult, DiffResult } from './diff';

export interface RunSummary {
  passed: number;
  failed: number;
  skipped: number;
}

export interface Run {
  id: string;
  startTime: number;
  endTime?: number;
  summary: RunSummary;
  results: TestResult[];
}

// 比较结果的别名，便于 API 层引用
export type ComparisonResult = DiffResult;