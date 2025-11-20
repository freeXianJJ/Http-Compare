import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ServicesConfig, ServiceConfig, Protocol } from '../types/service';

interface ServiceState {
  config: ServicesConfig;
  updateOldService: (updates: Partial<ServiceConfig>) => void;
  updateNewService: (updates: Partial<ServiceConfig>) => void;
  useProxy: boolean;
  proxyPrefix: string;
  setUseProxy: (use: boolean) => void;
  setProxyPrefix: (prefix: string) => void;
}

const defaultConfig: ServiceConfig = {
  protocol: Protocol.HTTP,
  host: 'localhost',
  port: 8080,
  token: '',
  tokenPrefix: 'Bearer',
  tokenHeader: 'Authorization'
};

export const useServiceStore = create<ServiceState>()(
  persist(
    (set) => ({
      config: {
        oldService: { ...defaultConfig },
        newService: { ...defaultConfig, port: 8081 }
      },
      useProxy: false,
      proxyPrefix: '/api',
      
      updateOldService: (updates) => set((state) => ({
        config: {
          ...state.config,
          oldService: { ...state.config.oldService, ...updates }
        }
      })),
      
      updateNewService: (updates) => set((state) => ({
        config: {
          ...state.config,
          newService: { ...state.config.newService, ...updates }
        }
      }))
      ,
      setUseProxy: (use) => set((state) => ({ ...state, useProxy: use })),
      setProxyPrefix: (prefix) => set((state) => ({ ...state, proxyPrefix: prefix }))
    }),
    { name: 'service-storage' }
  )
);