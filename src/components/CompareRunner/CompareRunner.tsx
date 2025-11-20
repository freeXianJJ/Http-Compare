import React, { useState } from 'react';
import { RequestService } from '../../services/requestService';
import { DiffService } from '../../services/diffService';
import { ApiConfig } from '../../types/api';
import { ServiceConfig, Protocol } from '../../types/service';
import ResponseDiff from '../ResponseDiff';

const requestService = new RequestService();
const diffService = new DiffService();

export default function CompareRunner() {
  const [apiListText, setApiListText] = useState('');
  const [oldHost, setOldHost] = useState('localhost');
  const [oldPort, setOldPort] = useState(80);
  const [newHost, setNewHost] = useState('localhost');
  const [newPort, setNewPort] = useState(8080);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const parseApiList = (): ApiConfig[] => {
    try {
      const parsed = JSON.parse(apiListText);
      if (Array.isArray(parsed)) return parsed as ApiConfig[];
      return [];
    } catch {
      return [];
    }
  };

  const buildServiceConfig = (host: string, port: number): ServiceConfig => ({
    protocol: Protocol.HTTP,
    host,
    port,
    token: '',
    tokenPrefix: '',
    tokenHeader: 'Authorization'
  });

  const startRun = async () => {
    const apis = parseApiList();
    if (apis.length === 0) return alert('请在文本框中粘贴 ApiConfig 数组（JSON）');

    setRunning(true);
    const oldService = buildServiceConfig(oldHost, Number(oldPort));
    const newService = buildServiceConfig(newHost, Number(newPort));

    const runResults: any[] = [];

    for (const api of apis) {
      // 逐条运行以保持简单（可在后续替换为并发池）
      try {
        const dual = await requestService.sendDualRequests(oldService, newService, api);
        const diff = diffService.compare(dual.oldService.response, dual.newService.response);
        const item = {
          id: `${api.id || api.name}-${Date.now()}`,
          apiConfig: api,
          oldService: dual.oldService,
          newService: dual.newService,
          diffResult: diff,
          timestamp: Date.now()
        };
        runResults.push(item);
        setResults(prev => [...prev, item]);
      } catch (e: any) {
        console.error('运行失败', e);
      }
    }

    setRunning(false);
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>Compare Runner</h3>
      <div style={{ marginBottom: 8 }}>
        <label>Old Host: </label>
        <input value={oldHost} onChange={e => setOldHost(e.target.value)} />
        <label style={{ marginLeft: 8 }}>Port: </label>
        <input value={String(oldPort)} onChange={e => setOldPort(Number(e.target.value))} style={{ width: 80 }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>New Host: </label>
        <input value={newHost} onChange={e => setNewHost(e.target.value)} />
        <label style={{ marginLeft: 8 }}>Port: </label>
        <input value={String(newPort)} onChange={e => setNewPort(Number(e.target.value))} style={{ width: 80 }} />
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
