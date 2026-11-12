import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = '_id',
  onRowClick,
  pageSize = 12,
  searchPlaceholder = 'Search records...',
  searchField,
  headerAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchField) {
          return String(item[searchField] || '').toLowerCase().includes(lower);
        }
        return Object.values(item).some((val) =>
          String(val || '').toLowerCase().includes(lower)
        );
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchField, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="bg-wind-panel border border-wind-border flex flex-col">
      {/* Top filter and actions bar */}
      <div className="p-3 border-b border-wind-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-wind-surface">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-wind-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-wind-bg border border-wind-border pl-9 pr-3 py-1.5 text-xs font-mono text-wind-primary placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-mono text-wind-secondary">
            Showing <strong className="text-white">{filteredData.length}</strong> records
          </span>
          {headerAction}
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-wind-border bg-wind-subtle/50 text-[11px] font-mono uppercase tracking-wider text-wind-secondary select-none">
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`p-3 font-semibold ${
                    col.sortable !== false ? 'cursor-pointer hover:text-white transition-colors' : ''
                  } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                >
                  <div className={`flex items-center gap-1.5 ${
                    col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                  }`}>
                    <span>{col.header}</span>
                    {sortField === col.key && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-wind-border/50 text-xs font-mono">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-wind-secondary font-mono">
                  No telemetry or matching records found in data buffer.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row[keyField] || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`border-b border-wind-border/40 hover:bg-wind-surface transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key || col.header}
                      className={`p-3 text-neutral-300 whitespace-nowrap ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '--')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-wind-border flex items-center justify-between text-xs font-mono text-wind-secondary bg-wind-surface">
          <div>
            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-wind-border hover:bg-wind-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-wind-border hover:bg-wind-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
