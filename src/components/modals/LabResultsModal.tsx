import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, Trash2 } from 'lucide-react';

interface LabResultsModalProps {
  labResultsModalOpen: { open: boolean; orderId: number | null };
  setLabResultsModalOpen: (val: { open: boolean; orderId: number | null }) => void;
  currentLabResults: any[];
  setCurrentLabResults: (val: any[]) => void;
  fetchLabOrders: () => void;
}

export function LabResultsModal({
  labResultsModalOpen,
  setLabResultsModalOpen,
  currentLabResults,
  setCurrentLabResults,
  fetchLabOrders
}: LabResultsModalProps) {
  if (!labResultsModalOpen.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setLabResultsModalOpen({open: false, orderId: null})} />
      <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Input Hasil Laboratorium</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-bold">Order ID: ORD-{labResultsModalOpen.orderId?.toString().padStart(6,'0')}</p>
          </div>
          <button onClick={() => setLabResultsModalOpen({open: false, orderId: null})} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-xl p-4 mb-6">
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-3 h-3"/> Flagging Sistem</p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Centang "Abnormal" jika nilai di luar nilai rujukan. Sistem otomatis akan mewarnai merah nilai tersebut.</p>
          </div>

          {currentLabResults.map((r, i) => (
            <div key={i} className={`mb-3 p-4 border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-colors ${r.is_abnormal ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex-grow">
                <p className={`text-xs font-bold ${r.is_abnormal ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{r.parameter_name}</p>
                <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${r.is_abnormal ? 'text-red-500 dark:text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>Ref: {r.reference_range} {r.unit}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm font-black ${r.is_abnormal ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>{r.result_value} <span className="text-xs text-slate-400 font-sans">{r.unit}</span></span>
                <button onClick={async () => {
                    if (window.confirm('Hapus hasil ini?')) {
                      await fetch(`/api/lab-results/${r.id}`, {method: 'DELETE'});
                      const req = await fetch(`/api/lab-orders/${labResultsModalOpen.orderId}/results`);
                      setCurrentLabResults(await req.json());
                    }
                }} className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

          <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const res = await fetch(`/api/lab-orders/${labResultsModalOpen.orderId}/results`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  parameter_name: (form.elements.namedItem('parameter') as HTMLInputElement).value,
                  result_value: (form.elements.namedItem('result') as HTMLInputElement).value,
                  unit: (form.elements.namedItem('unit') as HTMLInputElement).value,
                  reference_range: (form.elements.namedItem('reference') as HTMLInputElement).value,
                  is_abnormal: (form.elements.namedItem('abnormal') as HTMLInputElement).checked
                })
              });
              if (res.ok) {
                form.reset();
                const req = await fetch(`/api/lab-orders/${labResultsModalOpen.orderId}/results`);
                setCurrentLabResults(await req.json());
              }
          }} className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-widest">Tambah Parameter Baru</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Parameter</label>
                <input type="text" id="parameter" name="parameter" required placeholder="Mis. Hemoglobin, SGOT, GDS..." className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 dark:text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Hasil</label>
                <input type="text" id="result" name="result" required placeholder="Nilai..." className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 dark:text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Satuan</label>
                <input type="text" id="unit" name="unit" placeholder="g/dL, mg/dL..." className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 dark:text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">Nilai Rujukan (Opsional)</label>
                <input type="text" id="reference" name="reference" placeholder="Mis. 13 - 17" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 dark:text-white outline-none" />
              </div>
              <div className="col-span-2 md:col-span-2 flex items-center h-full pt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" id="abnormal" name="abnormal" className="w-4 h-4 text-red-500 border-slate-300 rounded focus:ring-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-red-500 transition-colors">Tandai Abnormal (Nilai di luar rujukan)</span>
                </label>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">Simpan Parameter</button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button onClick={async () => {
                await fetch(`/api/lab-orders/${labResultsModalOpen.orderId}/status`, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({status: 'Selesai'})
                });
                fetchLabOrders();
                setLabResultsModalOpen({open: false, orderId: null});
            }} className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">Tandai Order Selesai</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
