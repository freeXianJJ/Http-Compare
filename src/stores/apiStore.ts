import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiConfig, HttpMethod } from '../types/api';
import { nanoid } from 'nanoid';

interface ApiState {
  currentApi: ApiConfig | null;
  createNewApi: () => void;
  updateCurrentApi: (updates: Partial<ApiConfig>) => void;
}

export const useApiStore = create<ApiState>()(
  persist(
    (set) => ({
      currentApi: null,
      
      createNewApi: () => set({
        currentApi: {
          id: nanoid(),
          name: '新建接口',
          url: '/api/test',
          method: HttpMethod.GET,
          parameters: [],
          headers: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      }),
      
      updateCurrentApi: (updates) => set((state) => ({
        currentApi: state.currentApi
          ? { ...state.currentApi, ...updates, updatedAt: Date.now() }
          : null
      }))
    }),
    { name: 'api-storage' }
  )
);