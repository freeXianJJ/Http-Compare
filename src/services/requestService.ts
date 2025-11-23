import axios, { AxiosInstance } from 'axios';
import { ApiConfig, HttpMethod, ParamType } from '../types/api';
import { ServiceConfig } from '../types/service';
import { RequestInfo, ResponseInfo } from '../types/diff';

export interface RequestConfig {
  concurrency?: number;
  retries?: number;
  timeout?: number;
}

export const defaultRequestConfig: RequestConfig = {
  concurrency: 20,
  retries: 1,
  timeout: 30000
};

export class RequestService {
  private axiosInstance: AxiosInstance;
  private useProxy: boolean = false;
  private proxyPrefix: string = '/api';
  private config: RequestConfig;

  constructor(config: RequestConfig = defaultRequestConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      timeout: config.timeout ?? defaultRequestConfig.timeout,
      validateStatus: () => true
    });
  }
  
  setUseProxy(useProxy: boolean) {
    this.useProxy = useProxy;
  }

  setProxyPrefix(prefix: string) {
    this.proxyPrefix = prefix || '/api';
  }

  private buildUrl(service: ServiceConfig, apiConfig: ApiConfig): string {
    const { protocol, host, port } = service;
    let url = apiConfig.url;

    // 替换路径参数
    apiConfig.parameters
      .filter(p => p.type === ParamType.PATH && p.enabled)
      .forEach(param => {
        url = url.replace(`{${param.name}}`, encodeURIComponent(param.value));
      });

    // 添加Query参数
    const queryParams = apiConfig.parameters
      .filter(p => p.type === ParamType.QUERY && p.enabled);
    
    if (queryParams.length > 0) {
      const queryString = queryParams
        .map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`)
        .join('&');
      url += `?${queryString}`;
    }

    // 如果使用代理模式，只返回路径（并确保以 proxyPrefix 起始）
    if (this.useProxy) {
      let path = url.startsWith('/') ? url : '/' + url;
      if (!path.startsWith(this.proxyPrefix)) {
        // avoid double slash
        path = this.proxyPrefix.replace(/\/$/, '') + path;
      }
      return path;
    }

    return `${protocol}://${host}:${port}${url}`;
  }

  private buildHeaders(service: ServiceConfig, apiConfig: ApiConfig, tokenType?: 'client' | 'user'): Record<string, string> {
    const headers: Record<string, string> = {};

    // tokenType determines which token to attach (client/user). Backward-compatible: if tokenType not provided, use legacy `service.token`.
    if (tokenType === 'client' && service.clientToken) {
      headers['X-Client-Token'] = `Bearer ${service.clientToken}`;
    } else if (tokenType === 'user' && service.userToken) {
      headers['Authorization'] = `Bearer ${service.userToken}`;
    } else if (service.token) {
      const tokenValue = service.tokenPrefix 
        ? `${service.tokenPrefix} ${service.token}`
        : service.token;
      const headerName = service.tokenHeader || 'Authorization';
      headers[headerName] = tokenValue;
    }

    apiConfig.headers
      .filter(h => h.enabled)
      .forEach(h => {
        headers[h.name] = h.value;
      });

    return headers;
  }

  private buildBody(apiConfig: ApiConfig): any {
    const bodyParams = apiConfig.parameters
      .filter(p => p.type === ParamType.BODY && p.enabled);
    
    if (bodyParams.length > 0) {
      try {
        return JSON.parse(bodyParams[0].value);
      } catch {
        return bodyParams[0].value;
      }
    }

    const formParams = apiConfig.parameters
      .filter(p => p.type === ParamType.FORM && p.enabled);
    
    if (formParams.length > 0) {
      const formData = new URLSearchParams();
      formParams.forEach(p => formData.append(p.name, p.value));
      return formData.toString();
    }

    return undefined;
  }

  async sendRequest(
    service: ServiceConfig,
    apiConfig: ApiConfig,
    tokenType?: 'client' | 'user'
  ): Promise<{ request: RequestInfo; response: ResponseInfo }> {
    const startTime = Date.now();
    const url = this.buildUrl(service, apiConfig);
    const headers = this.buildHeaders(service, apiConfig, tokenType);
    const body = this.buildBody(apiConfig);

    console.log('发送请求到:', url);
    console.log('请求头:', headers);
    console.log('请求体:', body);

    const requestInfo: RequestInfo = {
      url,
      method: apiConfig.method,
      headers,
      body,
      timestamp: startTime,
      duration: 0
    };

    try {
      // 自动设置 Content-Type（如果未显式设置）
      const normalizedHeaders = { ...headers };
      const methodHasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(apiConfig.method);

      if (methodHasBody && body !== undefined && body !== null) {
        if (!Object.keys(normalizedHeaders).some(k => k.toLowerCase() === 'content-type')) {
          if (typeof body === 'object') {
            normalizedHeaders['Content-Type'] = 'application/json;charset=utf-8';
          } else if (typeof body === 'string') {
            // URLSearchParams 或手动表单字符串
            normalizedHeaders['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
          }
        }
      }

      const response = await this.axiosInstance.request({
        method: apiConfig.method,
        url,
        headers: normalizedHeaders,
        data: methodHasBody ? body : undefined,
        // 如果后端依赖 cookie，可在全局或 UI 中开启
        withCredentials: false
      });

      const endTime = Date.now();
      requestInfo.duration = endTime - startTime;

      console.log('响应状态:', response.status);
      console.log('响应数据:', response.data);

      return {
        request: requestInfo,
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
          body: response.data,
          timestamp: endTime
        }
      };
    } catch (error: any) {
      const endTime = Date.now();
      requestInfo.duration = endTime - startTime;

      console.error('请求错误:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        response: error.response
      });

      return {
        request: requestInfo,
        response: {
          status: 0,
          statusText: 'Error',
          headers: {},
          body: null,
          timestamp: endTime,
          error: error.message
        }
      };
    }
  }

  async sendDualRequests(
    oldService: ServiceConfig,
    newService: ServiceConfig,
    apiConfig: ApiConfig
  ) {
    // default: no tokenType — legacy behavior
    const [oldResult, newResult] = await Promise.all([
      this.sendRequest(oldService, apiConfig),
      this.sendRequest(newService, apiConfig)
    ]);

    return {
      oldService: oldResult,
      newService: newResult
    };
  }
}

// 兼容导出：简单函数，直接使用默认配置的 RequestService
export async function sendRequest(service: ServiceConfig, apiConfig: ApiConfig, tokenType?: 'client' | 'user') {
  const svc = new RequestService();
  return svc.sendRequest(service, apiConfig, tokenType);
}