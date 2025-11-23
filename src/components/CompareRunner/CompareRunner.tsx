import React, { useState } from 'react';
import { RequestService } from '../../services/requestService';
import { DiffService } from '../../services/diffService';
import { ApiConfig } from '../../types/api';
import { ServiceConfig, Protocol } from '../../types/service';
import ResponseDiff from '../ResponseDiff';
import { useServiceStore } from '../../stores/serviceStore';

const requestService = new RequestService();
const diffService = new DiffService();

export default function CompareRunner() {
  const [apiListText, setApiListText] = useState('');
  // read services from global store (App 页面中的服务配置会同步写入这里)
  const { config } = useServiceStore();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [concurrency, setConcurrency] = useState<number>(20);
  const [retries, setRetries] = useState<number>(1);
  const [perRequestTimeoutMs, setPerRequestTimeoutMs] = useState<number>(30000);

  const parseApiList = (): ApiConfig[] => {
    try {
      const parsed = JSON.parse(apiListText);
      if (Array.isArray(parsed)) return parsed as ApiConfig[];
      return [];
    } catch {
      return [];
    }
  };

  // use config.oldService / config.newService from store when running

  const startRun = async () => {
    const apis = parseApiList();
    if (apis.length === 0) return alert('请在文本框中粘贴 ApiConfig 数组（JSON）');

    setRunning(true);
    const oldService = config.oldService;
    const newService = config.newService;

    const runResults: any[] = [];

    // wrapper with retries
    const sendWithRetry = async (api: ApiConfig, tokenType: 'client' | 'user') => {
      let attempt = 0;
      let lastError: any = null;
      while (attempt <= retries) {
        attempt++;
        try {
          // respect per-request timeout by creating a race with a timeout promise
          // request old/new pair with the given tokenType
          const race = await Promise.race([
            (async () => {
              const oldRes = await requestService.sendRequest(oldService, api, tokenType);
              const newRes = await requestService.sendRequest(newService, api, tokenType);
              return { oldService: oldRes, newService: newRes };
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), perRequestTimeoutMs))
          ]);
          return race as any;
        } catch (err: any) {
          lastError = err;
          // exponential backoff
          const backoff = Math.min(2000 * attempt, 10000);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
      throw lastError;
    };

    // simple concurrency pool
    const pool = async (items: ApiConfig[], concurrencyLimit: number) => {
      const resultsArr: any[] = [];
      let i = 0;

      const workers = new Array(concurrencyLimit).fill(null).map(async () => {
        while (true) {
          const idx = i++;
          if (idx >= items.length) break;
          const api = items[idx];
          try {
            // run client-token comparison
            try {
              const dualClient = await sendWithRetry(api, 'client');
              const diffClient = diffService.compare(dualClient.oldService.response, dualClient.newService.response);
              const itemClient = {
                id: `${api.id || api.name}-client-${Date.now()}-${idx}`,
                apiConfig: api,
                tokenType: 'client',
                oldService: dualClient.oldService,
                newService: dualClient.newService,
                diffResult: diffClient,
                timestamp: Date.now()
              };
              resultsArr.push(itemClient);
              setResults(prev => [...prev, itemClient]);
            } catch (errClient) {
              console.error('client-token 请求失败', api, errClient);
              const item = {
                id: `${api.id || api.name}-client-${Date.now()}-${idx}`,
                apiConfig: api,
                tokenType: 'client',
                oldService: null,
                newService: null,
                diffResult: { identical: false, differences: [{ path: 'request', type: 'modified', oldValue: null, newValue: null }], summary: { statusMatch: false, bodyMatch: false, totalDiffs: 1 } },
                timestamp: Date.now(),
                error: String(errClient)
              };
              resultsArr.push(item);
              setResults(prev => [...prev, item]);
            }

            // run user-token comparison
            try {
              const dualUser = await sendWithRetry(api, 'user');
              const diffUser = diffService.compare(dualUser.oldService.response, dualUser.newService.response);
              const itemUser = {
                id: `${api.id || api.name}-user-${Date.now()}-${idx}`,
                apiConfig: api,
                tokenType: 'user',
                oldService: dualUser.oldService,
                newService: dualUser.newService,
                diffResult: diffUser,
                timestamp: Date.now()
              };
              resultsArr.push(itemUser);
              setResults(prev => [...prev, itemUser]);
            } catch (errUser) {
              console.error('user-token 请求失败', api, errUser);
              const item = {
                id: `${api.id || api.name}-user-${Date.now()}-${idx}`,
                apiConfig: api,
                tokenType: 'user',
                oldService: null,
                newService: null,
                diffResult: { identical: false, differences: [{ path: 'request', type: 'modified', oldValue: null, newValue: null }], summary: { statusMatch: false, bodyMatch: false, totalDiffs: 1 } },
                timestamp: Date.now(),
                error: String(errUser)
              };
              resultsArr.push(item);
              setResults(prev => [...prev, item]);
            }
          } catch (err) {
            console.error('请求失败', api, err);
            const item = {
              id: `${api.id || api.name}-${Date.now()}-${idx}`,
              apiConfig: api,
              oldService: null,
              newService: null,
              diffResult: { identical: false, differences: [{ path: 'request', type: 'modified', oldValue: null, newValue: null }], summary: { statusMatch: false, bodyMatch: false, totalDiffs: 1 } },
              timestamp: Date.now(),
              error: String(err)
            };
            resultsArr.push(item);
            setResults(prev => [...prev, item]);
          }
        }
      });

      await Promise.all(workers);
      return resultsArr;
    };

    try {
      await pool(apis, Math.max(1, Math.floor(concurrency)));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>Compare Runner</h3>
      <div style={{ marginBottom: 8 }}>
        <div>Old Service: {config.oldService.host}:{config.oldService.port}</div>
        <div>New Service: {config.newService.host}:{config.newService.port}</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>ApiConfig 列表（JSON 数组）:</label>
        <textarea
          rows={8}
          style={{ width: '100%' }}
          value={apiListText}
          onChange={e => setApiListText(e.target.value)}
          placeholder='[ { "id": "1", "name": "ping", "url": "/ping", "method": "GET", "parameters": [], "headers": [] } ]'
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>并发（Concurrency）: </label>
        <input value={String(concurrency)} onChange={e => setConcurrency(Number(e.target.value))} style={{ width: 80 }} />
        <label style={{ marginLeft: 8 }}>重试次数（Retries）: </label>
        <input value={String(retries)} onChange={e => setRetries(Number(e.target.value))} style={{ width: 80 }} />
        <label style={{ marginLeft: 8 }}>超时 ms: </label>
        <input value={String(perRequestTimeoutMs)} onChange={e => setPerRequestTimeoutMs(Number(e.target.value))} style={{ width: 120 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={startRun} disabled={running}> {running ? '运行中...' : '开始对比'}</button>
      </div>

      <div>
        <h4>结果</h4>
        <ResponseDiff results={results} />
      </div>
    </div>
  );
}
