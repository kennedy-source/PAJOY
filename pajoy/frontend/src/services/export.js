export function downloadCsv(filename, rows, columns) {
  if (!rows || rows.length === 0) return;
  const header = columns.map(col => JSON.stringify(col.label || col.key));
  const lines = rows.map(row => {
    return columns.map(col => {
      const value = typeof col.value === 'function' ? col.value(row) : row[col.key];
      const text = value == null ? '' : String(value);
      return JSON.stringify(text);
    }).join(',');
  });
  const csv = [header.join(','), ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
