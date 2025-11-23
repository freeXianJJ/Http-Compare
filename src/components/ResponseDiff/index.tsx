import React from 'react';
import SingleResult from './SingleResult';

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
      <div>
        {results.map(r => (
          <SingleResult key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}
