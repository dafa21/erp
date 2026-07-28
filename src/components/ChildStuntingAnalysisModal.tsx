import React, { useState, useEffect, useRef } from 'react';
import { Brain, X, Loader2, Sparkles, Printer } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

interface Props {
  child: any;
  setModalType: (type: 'none') => void;
  currentUser: any;
}

export default function ChildStuntingAnalysisModal({ child, setModalType, currentUser }: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handlePrintPDF = async () => {
    window.print();
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const latestGrowth = child.growth?.[child.growth.length - 1];
        const ageMonths = Math.floor((new Date().getTime() - new Date(child.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44));

        const res = await fetch('/api/ai/stunting-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id?.toString() || '',
            'x-user-role': currentUser?.role || ''
          },
          body: JSON.stringify({
            childData: {
              name: child.name,
              gender: child.gender,
              birth_date: child.birth_date,
              ageMonths,
              weight: latestGrowth?.weight,
              height: latestGrowth?.height,
              headCircumference: latestGrowth?.head_circumference
            }
          })
        });

        if (!res.ok) {
           throw new Error(`Gagal terhubung ke API AI (${res.status}). Pastikan backend server terbaru sudah di-deploy.`);
        }
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Server tidak mengembalikan format JSON. Pastikan backend server (server.ts) terbaru sudah berjalan dan ter-deploy di server Anda.");
        }

        const data = await res.json();
        if (data.success) {
          setAnalysis(data.analysis);
        } else {
          setError(data.error || 'Gagal menganalisa data.');
        }
      } catch (err: any) {
        setError(err.message || 'Error koneksi server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [child, currentUser]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-xl flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-r from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                Analisa Tumbuh Kembang AI <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mendeteksi risiko stunting & memberikan rekomendasi untuk <b>{child.name}</b>
              </p>
            </div>
          </div>
          <button 
            onClick={() => setModalType('none')}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow prose prose-sm max-w-none dark:prose-invert prose-indigo prose-headings:font-black prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-table:border-collapse prose-th:border prose-th:border-slate-300 prose-th:p-2 prose-td:border prose-td:border-slate-300 prose-td:p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-bold animate-pulse">AI Dokter sedang menganalisa data kurva WHO...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center font-bold">
              {error}
            </div>
          ) : (
            <>
             <div className="markdown-body p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" ref={pdfRef} id="printable-markdown">
               <div className="mb-6 text-center border-b border-slate-200 dark:border-slate-700 pb-4 printable-header hidden">
                 <h2 className="text-xl font-black mb-1 text-slate-800 dark:text-slate-100">Analisa Tumbuh Kembang AI</h2>
                 <p className="text-sm text-slate-500 font-medium">Pasien: {child.name} | Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
               </div>
               <Markdown remarkPlugins={[remarkGfm]}>{analysis}</Markdown>
             </div>
             
             <style>
               {`
                 @media print {
                   body * {
                     visibility: hidden !important;
                   }
                   #printable-markdown, #printable-markdown * {
                     visibility: visible !important;
                     color: black !important;
                   }
                   #printable-markdown {
                     position: absolute;
                     left: 0;
                     top: 0;
                     width: 100%;
                     padding: 20px;
                   }
                   .printable-header {
                     display: block !important;
                   }
                   .markdown-body {
                     background: white !important;
                   }
                   /* Disable scroll constraints for printing */
                   .fixed, .overflow-y-auto, .max-h-[90vh], .flex-grow {
                     position: static !important;
                     overflow: visible !important;
                     max-height: none !important;
                     height: auto !important;
                   }
                 }
               `}
             </style>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
           {!loading && !error && analysis && (
             <button
               onClick={handlePrintPDF}
               disabled={isGeneratingPdf}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${isGeneratingPdf ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' } text-white`}
             >
               {isGeneratingPdf ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Memproses PDF...
                 </>
               ) : (
                 <>
                   <Printer className="w-4 h-4" />
                   Cetak PDF
                 </>
               )}
             </button>
           )}
           <button
             onClick={() => setModalType('none')}
             className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 transition-all text-sm"
           >
             Tutup Analisa
           </button>
        </div>
      </div>
    </div>
  );
}
