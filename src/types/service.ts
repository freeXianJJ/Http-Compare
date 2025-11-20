export enum Protocol {
  HTTP = 'http',
  HTTPS = 'https'
}

export interface ServiceConfig {
  protocol: Protocol;
  host: string;
  port: number;
  // 单一令牌向后兼容字段（保留）
  token?: string;
  tokenPrefix?: string;
  tokenHeader?: string;
  // 新增：支持 client / user 两类 token（按服务配置）
  clientToken?: string;
  userToken?: string;
}

export interface ServicesConfig {
  oldService: ServiceConfig;
  newService: ServiceConfig;
}