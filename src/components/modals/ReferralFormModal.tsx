import React from 'react';
import { X, FileText, Send } from 'lucide-react';

interface ReferralFormModalProps {
  modalType: string;
  setModalType: (type: string) => void;
  editingItem: any;
  referralForm: any;
  setReferralForm: (form: any) => void;
  saveReferral: (e: React.FormEvent) => void;
}

export function ReferralFormModal({
  modalType,
  setModalType,
  editingItem,
  referralForm,
  setReferralForm,
  saveReferral
}: ReferralFormModalProps) {
  if (modalType !== 'referralForm' || !editingItem) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-tight">
            <FileText className="w-5 h-5 text-indigo-600" /> Form Rujukan Eksternal
          </h3>
          <button type="button" onClick={() => setModalType('none')} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors outline-none"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={saveReferral} className="p-5 overflow-y-auto max-h-[75vh] custom-scrollbar flex flex-col gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-xs">
            Pasien rujukan: <strong>{editingItem.name}</strong> (RM: {editingItem.rm_number})
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tujuan Klinik / RS <span className="text-red-500">*</span></label>
                <input type="text" value={referralForm.destination_clinic} onChange={e => setReferralForm({...referralForm, destination_clinic: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Contoh: RSUD Kota" required />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Dokter Tujuan (Opsional)</label>
                <input type="text" value={referralForm.destination_doctor} onChange={e => setReferralForm({...referralForm, destination_doctor: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Contoh: dr. Spesialis Anak" />
             </div>
          </div>

          <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Diagnosis / Hasil Pemeriksaan Klinis</label>
              <input type="text" value={referralForm.diagnosis} onChange={e => setReferralForm({...referralForm, diagnosis: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
          </div>

          <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Terapi / Tindakan yang Sudah Diberikan</label>
              <input type="text" value={referralForm.treatment_given} onChange={e => setReferralForm({...referralForm, treatment_given: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" />
          </div>

          <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Alasan Dirujuk / Mohon Bantuan <span className="text-red-500">*</span></label>
              <textarea value={referralForm.reason} onChange={e => setReferralForm({...referralForm, reason: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[80px]" placeholder="Contoh: Mohon penanganan lebih lanjut terkait..." required />
          </div>

          <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Catatan Tambahan (Keluhan, dll)</label>
              <textarea value={referralForm.notes} onChange={e => setReferralForm({...referralForm, notes: e.target.value})} className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium min-h-[80px]" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
             <button type="button" onClick={() => setModalType('none')} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all outline-none">Batal</button>
             <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm shadow-indigo-200 dark:shadow-none transition-all outline-none flex items-center gap-2">
                <Send className="w-4 h-4" /> Simpan Rujukan
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
