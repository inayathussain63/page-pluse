import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Heading,
  Image,
  FileText,
  Copy,
  Download,
  Code,
  Globe2,
  Check,
  CheckCircle,
} from 'lucide-react';
import { AuditResponse } from '../types/audit';
import { StatCard } from './StatCard';

interface ResultsDashboardProps {
  result: AuditResponse;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  if (!result || !result.success) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const domain = result.url ? new URL(result.url).hostname.replace(/[^a-z0-9]/gi, '_') : 'audit';
    downloadAnchor.setAttribute('download', `page_pulse_audit_${domain}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper status calculations
  const getHttpStatusInfo = (status?: number) => {
    if (!status) return { text: 'Unknown', type: 'info' as const, badge: 'N/A' };
    if (status >= 200 && status < 300) return { text: `${status} OK`, type: 'success' as const, badge: 'Healthy' };
    if (status >= 300 && status < 400) return { text: `${status} Redirect`, type: 'warning' as const, badge: 'Redirect' };
    return { text: `${status} Error`, type: 'error' as const, badge: 'Client/Server Error' };
  };

  const getResponseTimeInfo = (ms?: number) => {
    if (!ms) return { text: 'N/A', type: 'info' as const, badge: 'N/A' };
    if (ms < 300) return { text: `${ms} ms`, type: 'success' as const, badge: 'Lightning Fast' };
    if (ms < 1000) return { text: `${ms} ms`, type: 'info' as const, badge: 'Good Speed' };
    return { text: `${ms} ms`, type: 'warning' as const, badge: 'Slow Load' };
  };

  const getH1Info = (count?: number) => {
    if (count === undefined) return { type: 'info' as const, badge: 'N/A' };
    if (count === 1) return { type: 'success' as const, badge: 'Optimal SEO' };
    if (count === 0) return { type: 'error' as const, badge: 'Missing H1' };
    return { type: 'warning' as const, badge: 'Multiple H1s' };
  };

  const getAltInfo = (missing?: number) => {
    if (missing === undefined) return { type: 'info' as const, badge: 'N/A' };
    if (missing === 0) return { type: 'success' as const, badge: '100% Accessible' };
    return { type: 'warning' as const, badge: `${missing} Missing Alt` };
  };

  const statusInfo = getHttpStatusInfo(result.httpStatus);
  const timeInfo = getResponseTimeInfo(result.responseTimeMs);
  const h1Info = getH1Info(result.h1Count);
  const altInfo = getAltInfo(result.imagesWithoutAlt);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pt-4 animate-fadeIn">
      {/* Result Header & Actions */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Audit Overview
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate max-w-xl">
            Target URL: <span className="text-slate-900 dark:text-slate-200 font-mono font-semibold">{result.url}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyJson}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Grid of 8 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: HTTP Status */}
        <StatCard
          title="HTTP Status"
          value={result.httpStatus || 'N/A'}
          description="Server HTTP response code for this URL request."
          icon={CheckCircle2}
          status={statusInfo.type}
          badgeText={statusInfo.badge}
        />

        {/* Card 2: Response Time */}
        <StatCard
          title="Response Time"
          value={`${result.responseTimeMs || 0} ms`}
          description="Time required to establish connection & download HTML payload."
          icon={Clock}
          status={timeInfo.type}
          badgeText={timeInfo.badge}
        />

        {/* Card 3: H1 Count */}
        <StatCard
          title="H1 Heading Count"
          value={result.h1Count ?? 0}
          description="Search engines recommend exactly one <h1> tag per document."
          icon={Heading}
          status={h1Info.type}
          badgeText={h1Info.badge}
        />

        {/* Card 4: Images Missing Alt */}
        <StatCard
          title="Images Missing Alt"
          value={result.imagesWithoutAlt ?? 0}
          description="Image tags without descriptive alt attributes for accessibility."
          icon={Image}
          status={altInfo.type}
          badgeText={altInfo.badge}
        />

        {/* Card 5: Word Count */}
        <StatCard
          title="Word Count"
          value={(result.wordCount || 0).toLocaleString()}
          description="Approximate visible word content length extracted from HTML body."
          icon={FileText}
          status="info"
          badgeText="Body Words"
        />

        {/* Card 6: Content Type */}
        <StatCard
          title="Content Type"
          value={result.contentType?.split(';')[0] || 'text/html'}
          description="MIME header returned by the web server."
          icon={Code}
          status="info"
          badgeText="MIME Header"
        />

        {/* Card 7: Page Title (Full Width 2 cols) */}
        <StatCard
          title="Page Title"
          value={result.title ? `"${result.title}"` : 'Missing HTML Title'}
          description={`Title length: ${result.title?.length || 0} characters. Recommended length is 50-60 chars.`}
          icon={Globe2}
          status={result.title ? 'success' : 'error'}
          badgeText={result.title ? `${result.title.length} chars` : 'No Title'}
          fullWidth
        />

        {/* Card 8: Meta Description (Full Width 2 cols) */}
        <StatCard
          title="Meta Description"
          value={result.metaDescription ? `"${result.metaDescription}"` : 'Missing Meta Description'}
          description={`Description length: ${result.metaDescription?.length || 0} characters. Recommended length is 150-160 chars.`}
          icon={FileText}
          status={result.metaDescription ? 'success' : 'warning'}
          badgeText={result.metaDescription ? `${result.metaDescription.length} chars` : 'No Meta Desc'}
          fullWidth
        />
      </div>
    </div>
  );
};
