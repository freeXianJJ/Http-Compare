import React from 'react';

export default function SingleResult({ r }: { r: any }) {
  return (
    <div style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
      <div><strong>{r.apiConfig?.name || r.id}</strong> — {r.tokenType ? `${r.tokenType.toUpperCase()} token` : ''} — {r.diffResult?.identical ? 'PASS' : 'FAIL'}</div>
      <div>状态匹配: {r.diffResult?.summary?.statusMatch ? '是' : '否'}，体匹配: {r.diffResult?.summary?.bodyMatch ? '是' : '否'}</div>
      {r.error && <div style={{ color: 'red' }}>错误: {String(r.error)}</div>}
      <details>
        <summary>查看差异</summary>
        <pre style={{ maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(r.diffResult?.differences || [], null, 2)}</pre>
      </details>
    </div>
  );
}
