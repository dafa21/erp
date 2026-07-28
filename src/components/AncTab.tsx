import React from 'react';
import { Baby, History } from 'lucide-react';

interface AncTabProps {
  ancDateFilter: string;
  setAncDateFilter: (val: string) => void;
  filteredAncPatients: any[];
  renderAncRow: (p: any) => React.ReactNode;
  getSortedData: (data: any[]) => any[];
  ancHistoryPage: number;
  setAncHistoryPage: (page: number) => void;
  openPatientProfile: (p: any) => void;
  getPage: (key: string) => number;
  Pagination: React.FC<any>;
}

export default function AncTab({
  ancDateFilter,
  setAncDateFilter,
  filteredAncPatients,
  renderAncRow,
  getSortedData,
  ancHistoryPage,
  setAncHistoryPage,
  openPatientProfile,
  getPage,
  Pagination
}: AncTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Ibu Hamil (ANC)</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Baby className="w-3 h-3 text-pink-500" /> Rekam Medis & Pendaftaran ANC
          </p>
        </div>
      </header>

      <div className="flex-grow flex flex-col gap-4 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col transition-colors shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Daftar Pasien Ibu Hamil</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tanggal:</span>
              <input 
                type="date" 
                className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
                value={ancDateFilter}
                onChange={(e) => setAncDateFilter(e.target.value)}
              />
              {ancDateFilter && (
                <button 
                  onClick={() => setAncDateFilter('')}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="overflow-auto min-h-[220px] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 transition-colors">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md">
                  <th className="py-3 px-4 font-semibold">Nama Pasien</th>
                  <th className="py-3 px-4 font-semibold">Info Demografi</th>
                  <th className="py-3 px-4 font-semibold w-1/3">Data ANC</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 transition-colors">
                {filteredAncPatients.filter(p => p.status === 'Menunggu').length > 0 && (
                  <tr className="sticky top-[40px] z-[9] bg-pink-50/90 dark:bg-pink-900/40 backdrop-blur-sm">
                    <td colSpan={4} className="py-2 font-bold text-xs uppercase tracking-widest text-pink-600 dark:text-pink-300 pl-4 border-t border-b border-pink-100 dark:border-pink-905/50">Antrian Pemeriksaan (Belum Diperiksa Bidan)</td>
                  </tr>
                )}
                {filteredAncPatients.filter(p => p.status === 'Menunggu').map((p: any) => renderAncRow(p))}
                
                {filteredAncPatients.filter(p => (p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' || p.status === 'Dalam Pemeriksaan')).length > 0 && (
                  <tr className="sticky top-[40px] z-[9] bg-blue-50/90 dark:bg-blue-900/40 backdrop-blur-sm">
                    <td colSpan={4} className="py-2 font-bold text-xs uppercase tracking-widest text-blue-600 dark:text-blue-300 pl-4 border-t border-b border-blue-100 dark:border-blue-900/50">Selesai Pemeriksaan (Menunggu Dokter Spesialis)</td>
                  </tr>
                )}
                {filteredAncPatients.filter(p => (p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' || p.status === 'Dalam Pemeriksaan')).map((p: any) => renderAncRow(p))}

                {filteredAncPatients.filter(p => (p.status === 'Menunggu' || p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' || p.status === 'Dalam Pemeriksaan')).length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium italic">Belum ada pasien ibu hamil (ANC) yang terdaftar di antrian pada tanggal ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Separate ANC Patient History Card */}
        {filteredAncPatients.filter(p => (p.status === 'Selesai' || p.status === 'Lunas' || (p.anc && Object.values(p.anc).some(v => v !== '')))).length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col transition-colors shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4 bg-slate-50 dark:bg-slate-800/10 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-pink-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm italic">History & Data ANC Tersimpan</h3>
              </div>
            </div>
            <div className="overflow-auto max-h-[300px] custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-2.5 px-4 font-semibold">Nama Pasien</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Ringkasan ANC</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 transition-colors">
                {getSortedData(filteredAncPatients.filter(p => (p.status === 'Selesai' || p.status === 'Lunas' || (p.anc && Object.values(p.anc).some(v => v !== '')))))
                  .slice((getPage('anc_history') - 1) * 10, getPage('anc_history') * 10)
                  .map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">{p.name}</div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">RM: {p.rm_number || p.id.toString().padStart(6, '0')}</div>
                        </td>
                        <td className="py-3 px-4">
                           <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${p.status === 'Selesai' || p.status === 'Lunas' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'} font-bold`}>
                              {p.status}
                           </span>
                        </td>
                        <td className="py-3 px-4">
                           <div className="text-[10px] text-slate-600 dark:text-slate-300 italic">
                              {p.anc?.gestational_age ? `UK: ${p.anc.gestational_age} Mgg | DJJ: ${p.anc.djj || '-'}` : 'Data ANC Terisi'}
                           </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                           <button onClick={() => openPatientProfile(p)} className="text-[10px] font-black uppercase tracking-widest text-pink-600 hover:text-pink-800 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors font-bold font-sans">Lihat History</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <Pagination 
              totalItems={filteredAncPatients.filter(p => (p.status === 'Selesai' || p.status === 'Lunas' || (p.anc && Object.values(p.anc).some(v => v !== '')))).length} 
              itemsPerPage={5} 
              currentPage={ancHistoryPage} 
              onPageChange={setAncHistoryPage} 
              className="rounded-b-2xl border-x border-b border-slate-200 dark:border-slate-800"
            />
          </div>
        )}
      </div>
    </div>
  );
}
