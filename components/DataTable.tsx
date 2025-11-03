interface Column<T> {
  key: keyof T | "actions";
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <>
      <style jsx>{`
        .table-wrapper {
          overflow-x: auto;
          border-radius: 8px;
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 14px;
        }
        thead {
          background: linear-gradient(135deg, #0b1220 0%, #1a2332 100%);
        }
        thead th {
          text-align: left;
          padding: 12px 16px;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        thead th:first-child {
          border-radius: 8px 0 0 0;
        }
        thead th:last-child {
          border-radius: 0 8px 0 0;
        }
        tbody tr {
          border-bottom: 1px solid #e2e8f0;
          transition: background-color 0.2s;
        }
        tbody tr:hover {
          background: #f8fafc;
        }
        tbody tr:last-child {
          border-bottom: none;
        }
        tbody td {
          padding: 12px 16px;
          color: #0b1220;
        }
        .action-btns {
          display: flex;
          gap: 8px;
        }
        .action-btns button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .edit-btn {
          background: #e0f2fe;
          color: #0284c7;
        }
        .edit-btn:hover {
          background: #bae6fd;
        }
        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }
        .delete-btn:hover {
          background: #fecaca;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--muted);
          font-size: 14px;
        }
      `}</style>

      <div className="table-wrapper">
        {data.length === 0 ? (
          <div className="empty-state">{emptyMessage}</div>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={String(col.key)}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id ?? index}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.key === "actions" ? (
                        <div className="action-btns">
                          {onEdit && (
                            <button
                              className="edit-btn"
                              onClick={() => onEdit(item)}
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              className="delete-btn"
                              onClick={() => onDelete(item)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ) : col.render ? (
                        col.render(item[col.key as keyof T], item)
                      ) : (
                        String(item[col.key as keyof T] ?? "")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
