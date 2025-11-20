import { create } from 'zustand';
import { TestResult } from '../types/diff';

interface ResultState {
  currentResult: TestResult | null;
  isLoading: boolean;
  setCurrentResult: (result: TestResult) => void;
  setLoading: (loading: boolean) => void;
}

export const useResultStore = create<ResultState>((set) => ({
  currentResult: null,
  isLoading: false,
  setCurrentResult: (result) => set({ currentResult: result }),
  setLoading: (loading) => set({ isLoading: loading })
}));