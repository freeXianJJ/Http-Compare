import React from 'react';

export default function ResponseDiff({ results }: { results: any[] }) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!results || results.length === 0) return <div>暂无结果</div>;

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={exportJson}>导出 JSON</button>
      </div>
      <ul>
        {results.map(r => (
          <li key={r.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div><strong>{r.apiConfig.name || r.id}</strong> — {r.diffResult.identical ? 'PASS' : 'FAIL'}</div>
            <div>状态匹配: {r.diffResult.summary.statusMatch ? '是' : '否'}，体匹配: {r.diffResult.summary.bodyMatch ? '是' : '否'}</div>
            <details>
              <summary>查看差异</summary>
              <pre style={{ maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(r.diffResult.differences, null, 2)}</pre>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
