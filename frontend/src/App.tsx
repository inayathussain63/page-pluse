import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuditForm } from './components/AuditForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SearchHistory } from './components/SearchHistory';
import { Footer } from './components/Footer';
import { AuditResponse, AuditHistoryItem } from './types/audit';

const HISTORY_KEY = 'page_pulse_audit_history';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('page_pulse_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const [history, setHistory] = useState<AuditHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle dark class on root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('page_pulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('page_pulse_theme', 'light');
    }
  }, [darkMode]);

  // Persist history changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save audit history to localStorage', e);
    }
  }, [history]);

  const handleAudit = async (targetUrl: string) => {
    setIsLoading(true);
    setError(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const endpoint = `${apiBaseUrl}/api/audit`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data: AuditResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete audit for this URL.');
      }

      setAuditResult(data);

      // Save to recent audit history
      if (data.url && data.httpStatus && data.responseTimeMs) {
        const newItem: AuditHistoryItem = {
          id: Date.now().toString(),
          url: data.url,
          timestamp: new Date().toISOString(),
          httpStatus: data.httpStatus,
          responseTimeMs: data.responseTimeMs,
        };

        setHistory((prev) => {
          const filtered = prev.filter((h) => h.url !== data.url);
          return [newItem, ...filtered].slice(0, 6);
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while auditing the page.');
      setAuditResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AuditForm
          onAudit={handleAudit}
          isLoading={isLoading}
          error={error}
          history={history}
          onSelectHistory={(url) => handleAudit(url)}
        />

        {auditResult && <ResultsDashboard result={auditResult} />}

        <SearchHistory
          history={history}
          onSelect={(url) => handleAudit(url)}
          onClear={handleClearHistory}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
