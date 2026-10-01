import { useState } from 'react';
import { Building2, Plus, Footprints, Trash2, AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

interface ClinicsTabProps {
  clinicsInfo: any[];
  setEditingItem: (item: any) => void;
  setClinicForm: (form: any) => void;
  setModalType: (type: string | null) => void;
  fetchClinics: () => void;
}

export function ClinicsTab({
  clinicsInfo,
  setEditingItem,
  setClinicForm,
  setModalType,
  fetchClinics
}: ClinicsTabProps) {
  const [clinicToDelete, setClinicToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!clinicToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/clinics/${clinicToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal menghapus protokol klinik.');
      }
      setClinicToDelete(null);
      await fetchClinics();
    } catch (err: any) {
      console.error('Delete clinic error:', err);
      setDeleteError(err.message || 'Terjadi kesalahan sistem saat menghapus protokol.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none">Jaringan Klinik</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Infrastructure Identity</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setClinicForm({ name: '', address: '', phone: '', status: 'Active', latitude: '', longitude: '', sponsor_logo: '', sponsor_name: '', youtube_link: '', support_logo: '', photos: '' }); setModalType('clinic' as any); }}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] transition-all shadow-md uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" /> Registrasi Baru
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 overflow-y-auto">
        {clinicsInfo.map((clinic) => (
          <div key={clinic.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
            
            <div className="flex justify-between items-start mb-4 relative">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${clinic.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 dark:text-slate-500 border-slate-200'}`}>
                {clinic.status}
              </span>
            </div>
            
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base tracking-tight mb-1 leading-none">{clinic.name}</h3>
            <div className="flex items-start gap-2 mb-4">
              <Footprints className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed tracking-wide truncate">{clinic.address || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                 <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">ID</p>
                 <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none mt-1">CL-{clinic.id.toString().padStart(4, '0')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                 <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Nexus</p>
                 <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none mt-1">{clinic.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-50 dark:border-slate-800/50">
              <ActionMenu 
                actions={[
                  {
                    label: "Edit Infrastructure",
                    icon: Building2,
                    onClick: () => { setEditingItem(clinic); setClinicForm({ name: clinic.name, address: clinic.address || '', phone: clinic.phone || '', status: (clinic.status as any), latitude: clinic.latitude || '', longitude: clinic.longitude || '', sponsor_logo: clinic.sponsor_logo || '', sponsor_name: clinic.sponsor_name || '', youtube_link: clinic.youtube_link || '', support_logo: clinic.support_logo || '', photos: clinic.photos || '' }); setModalType('clinic' as any); }
                  },
                  {
                    label: "Hapus Protokol",
                    icon: Trash2,
                    variant: 'danger',
                    onClick: () => {
                      setDeleteError(null);
                      setClinicToDelete(clinic);
                    }
                  }
                ]}
              />
            </div>
          </div>
        ))}
        {clinicsInfo.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">No clinics initialized in neural network.</p>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Klinik */}
      {clinicToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-tight">
                    Hapus Protokol Klinik
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    CL-{clinicToDelete.id.toString().padStart(4, '0')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { if (!isDeleting) setClinicToDelete(null); }}
                disabled={isDeleting}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                  Apakah Anda yakin ingin menghapus protokol untuk klinik <strong className="text-slate-900 dark:text-white font-bold">{clinicToDelete.name}</strong>?
                </p>
                {clinicToDelete.address && (
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5 truncate">
                    <Footprints className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="truncate">{clinicToDelete.address}</span>
                  </p>
                )}
              </div>

              {/* Regulatory Notice Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Sesuai Regulasi Medis:</strong> Seluruh riwayat medis, transaksi pasien, dan rekam medik tidak akan hilang, melainkan diisolasi secara aman dari protokol cabang ini.
                </div>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {deleteError}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setClinicToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-rose-600/20 uppercase tracking-wider"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Protokol</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
