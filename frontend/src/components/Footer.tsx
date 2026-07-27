import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 py-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Built for</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-semibold underline underline-offset-4 decoration-brand-500/40 hover:decoration-brand-600 transition-colors"
          >
            Digital Heroes Training Task
          </a>
        </div>

        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-500">
          <span>Page Pulse &copy; {new Date().getFullYear()}</span>
          <span>&bull;</span>
          <span>REST API Audit Engine</span>
          <span>&bull;</span>
          <span>Node.js &bull; Express &bull; React</span>
        </div>
      </div>
    </footer>
  );
};
