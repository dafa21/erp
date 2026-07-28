import React from 'react';
import { X, Activity, Plus, Minus } from 'lucide-react';
import { formatIDDateTime } from '../../utils/formatters';

interface StockHistoryModalProps {
  modalType: string;
  setModalType: (type: string) => void;
  selectedDrug: any;
  stockHistoryData: any[];
}

export function StockHistoryModal({
  modalType,
  setModalType,
  selectedDrug,
  stockHistoryData
}: StockHistoryModalProps) {
  if (modalType !== 'stockHistory') return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Riwayat Stok: {selectedDrug?.name}</h3>
            <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest text-[#0ea5e9]">
              Total Saat Ini: {selectedDrug?.stock} {selectedDrug?.unit}
            </p>
          </div>
          <button 
            onClick={() => setModalType('none')} 
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
          {stockHistoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada riwayat pergerakan stok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stockHistoryData.map((log: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      log.type === 'IN' 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' 
                        : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
                    }`}>
                      {log.type === 'IN' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{log.reference || 'Manual Adjustment'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                        {formatIDDateTime(log.created_at)} | Tipe: {log.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end text-left sm:text-right pl-14 sm:pl-0">
                    <span className={`text-lg font-bold font-mono ${
                      log.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {log.type === 'IN' ? '+' : '-'}{log.quantity}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {selectedDrug?.unit}
                    </span>
                    {log.user_name && (
                      <span className="text-[10px] text-slate-400 font-medium mt-1">Oleh: {log.user_name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
