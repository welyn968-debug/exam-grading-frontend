import { ReactNode } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="dashboard-panel w-full overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-border/80 bg-muted/55">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-10 text-center text-sm text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[rowKey])} className="transition-colors hover:bg-muted/35">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-5 py-4 text-sm text-foreground">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                  </td>
                ))}
                {actions && <td className="px-5 py-4 text-sm">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
