import ReactMarkdown from 'react-markdown';
import { Database, Code2 } from 'lucide-react';
import { architectureData } from '../data/architectureDoc';

export function ArchitectureDocs({ activeTab }: { activeTab: string }) {
  if (activeTab === 'architecture') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full transition-colors">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase text-xs tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-indigo-500"></span>
            {architectureData.analysis.title}
          </h2>
          
          <div className="prose prose-slate dark:prose-invert max-w-none prose-h3:text-blue-700 dark:prose-h3:text-indigo-400 prose-h3:font-semibold prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest prose-li:text-xs prose-p:text-sm overflow-y-auto custom-scrollbar">
            <ReactMarkdown>{architectureData.analysis.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'schema') {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col overflow-hidden relative flex-1 border border-slate-800">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-10 shrink-0">
            <h3 className="font-bold text-blue-400 dark:text-indigo-400 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Database className="w-4 h-4" />
              {architectureData.ddl.title}
            </h3>
            <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[9px] font-mono text-slate-400 dark:text-slate-500">001_init_schema.sql</span>
          </div>
          <div className="flex-1 overflow-auto p-5 custom-scrollbar z-10 bg-slate-950">
            <pre className="text-[11px] md:text-sm font-mono text-slate-300 leading-relaxed">
              <code>{architectureData.ddl.code}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'query') {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col overflow-hidden relative flex-1 border border-slate-800">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center z-10 shrink-0">
            <h3 className="font-bold text-blue-400 dark:text-indigo-400 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Code2 className="w-4 h-4" />
              {architectureData.query.title}
            </h3>
            <span className="px-2 py-0.5 bg-slate-800 rounded-md text-[9px] font-mono text-slate-400 dark:text-slate-500">discharge_summary.sql</span>
          </div>
          <div className="p-4 bg-slate-900 border-b border-slate-800 z-10 shrink-0">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">{architectureData.query.desc}</p>
          </div>
          <div className="flex-1 overflow-auto p-5 custom-scrollbar z-10 bg-slate-950">
            <pre className="text-[11px] md:text-sm font-mono text-blue-300 dark:text-indigo-300 leading-relaxed">
              <code>{architectureData.query.code}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
