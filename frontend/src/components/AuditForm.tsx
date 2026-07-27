import React, { useState } from 'react';
import { Search, Loader2, Globe, AlertCircle, History, ArrowRight } from 'lucide-react';
import { AuditHistoryItem } from '../types/audit';

interface AuditFormProps {
  onAudit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  history: AuditHistoryItem[];
  onSelectHistory: (url: string) => void;
}

export const AuditForm: React.FC<AuditFormProps> = ({
  onAudit,
  isLoading,
  error,
  history,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isLoading) return;
    onAudit(urlInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const presetUrls = [
    'https://digitalheroesco.com',
    'https://example.com',
    'https://wikipedia.org',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-500/20">
          <Globe className="w-3.5 h-3.5" />
          <span>Real-time SEO Audit Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Audit Any Webpage URL in <span className="gradient-text">Seconds</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Get instant technical SEO metrics, HTTP status, response timings, H1 heading analysis, and image accessibility scores.
        </p>
      </div>

      {/* Main Search Bar Card */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex flex-col sm:flex-row items-center gap-3">
            {/* Input */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter website URL (e.g., https://example.com)..."
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm sm:text-base font-medium shadow-inner"
              />
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Webpage</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Quick Chips */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Try example:</span>
            {presetUrls.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setUrlInput(preset);
                  onAudit(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:bg-brand-500/20 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700/50 transition-colors"
              >
                {preset.replace('https://', '')}
              </button>
            ))}
          </div>

          {/* Search History Count */}
          {history.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <History className="w-3.5 h-3.5" />
              <span>{history.length} recent audit{history.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-start gap-3 animate-shake shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Audit Request Failed</h4>
            <p className="text-xs sm:text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
