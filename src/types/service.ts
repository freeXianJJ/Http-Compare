export enum Protocol {
  HTTP = 'http',
  HTTPS = 'https'
}

export interface ServiceConfig {
  protocol: Protocol;
  host: string;
  port: number;
  token: string;
  tokenPrefix: string;
  tokenHeader: string;
}

export interface ServicesConfig {
  oldService: ServiceConfig;
  newService: ServiceConfig;
}