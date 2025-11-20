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