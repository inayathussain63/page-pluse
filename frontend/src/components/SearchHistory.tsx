import React from 'react';
import { History, Trash2, ExternalLink, Clock } from 'lucide-react';
import { AuditHistoryItem } from '../types/audit';

interface SearchHistoryProps {
  history: AuditHistoryItem[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto pt-6">
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Audit History
            </h3>
          </div>

          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition-colors font-medium"
            title="Clear all search history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.url)}
              className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {item.url}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    {item.responseTimeMs}ms
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                    HTTP {item.httpStatus}
                  </span>
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
