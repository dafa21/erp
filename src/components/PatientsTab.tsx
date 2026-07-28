import React from 'react';
import { UserPlus, Search, Plus, History } from 'lucide-react';

interface PatientsTabProps {
  patientSearchQuery: string;
  setPatientSearchQuery: (val: string) => void;
  triageDateFilter: string;
  setTriageDateFilter: (val: string) => void;
  openPatientModal: () => void;
  requestSort: (key: string) => void;
  sortConfig: any;
  SortIcon: React.FC<{ column: string; sortConfig: any }>;
  filteredTriagePatients: any[];
  getSortedData: (data: any[]) => any[];
  renderPatientRow: (p: any, showActions?: boolean) => React.ReactNode;
  triageHistoryPage: number;
  setTriageHistoryPage: (page: number) => void;
  openPatientProfile: (p: any) => void;
  getPage: (key: string) => number;
  Pagination: React.FC<any>;
}

export default function PatientsTab({
  patientSearchQuery,
  setPatientSearchQuery,
  triageDateFilter,
  setTriageDateFilter,
  openPatientModal,
  requestSort,
  sortConfig,
  SortIcon,
  filteredTriagePatients,
  getSortedData,
  renderPatientRow,
  triageHistoryPage,
  setTriageHistoryPage,
  openPatientProfile,
  getPage,
  Pagination
}: PatientsTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Pasien Masuk</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
            <UserPlus className="w-3 h-3 text-blue-500" /> Rekam Medis & Pendaftaran Awal
          </p>
        </div>
      </header>

      <div className="flex-grow flex flex-col gap-4 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col transition-colors shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Antrian Pendaftaran</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-52">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau no. RM..." 
                  className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 transition-all outline-none"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tanggal:</span>
                <input 
                  type="date" 
                  className="px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={triageDateFilter}
                  onChange={(e) => setTriageDateFilter(e.target.value)}
                />
                {triageDateFilter && (
                  <button 
                    onClick={() => setTriageDateFilter('')}
                    className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/20 px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <button onClick={() => openPatientModal()} className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors whitespace-nowrap shadow-md w-full sm:w-auto justify-center">
                <Plus className="w-3 h-3" /> Tambah Pasien
              </button>
            </div>
          </div>
          <div className="overflow-auto min-h-[220px] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 transition-colors">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md">
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('name')}>
                    <div className="flex items-center">Nama Pasien <SortIcon column="name" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('age')}>
                    <div className="flex items-center">Info Demografi <SortIcon column="age" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black w-1/3">Keluhan Masuk</th>
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('status')}>
                    <div className="flex items-center">Status <SortIcon column="status" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                {getSortedData(filteredTriagePatients.filter(p => p.status === 'Menunggu')).length > 0 && (
                  <tr className="sticky top-[40px] z-[9] bg-slate-200/90 dark:bg-slate-800/90 backdrop-blur-sm">
                    <td colSpan={5} className="py-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 pl-4 border-b dark:border-slate-700">Antrian Pemeriksaan (Belum Diperiksa)</td>
                  </tr>
                )}
                {getSortedData(filteredTriagePatients.filter(p => p.status === 'Menunggu')).map((p: any) => renderPatientRow(p))}
                
                {getSortedData(filteredTriagePatients.filter(p => (p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' || p.status === 'Dalam Pemeriksaan'))).length > 0 && (
                  <tr className="sticky top-[40px] z-[9] bg-blue-100/90 dark:bg-blue-900/60 backdrop-blur-sm">
                    <td colSpan={5} className="py-2 font-black text-[10px] uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 pl-4 border-t border-blue-200 dark:border-blue-800">Selesai Triage (Menunggu Dokter)</td>
                  </tr>
                )}
                {getSortedData(filteredTriagePatients.filter(p => (p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' || p.status === 'Dalam Pemeriksaan'))).map((p: any) => renderPatientRow(p))}
                
                {filteredTriagePatients.filter(p => (p.status === 'Menunggu' || p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' || p.status === 'Dalam Pemeriksaan')).length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium italic">Belum ada pasien terdaftar di antrian pada tanggal ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Separate Triage Patient History Card */}
        {filteredTriagePatients.filter(p => p.status === 'Selesai' || p.status === 'Lunas').length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col transition-colors shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4 bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500 font-bold" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm italic">History & Data Kunjungan Selesai</h3>
              </div>
            </div>
            <div className="overflow-auto max-h-[300px] custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-2.5 px-4 font-semibold">Nama Pasien / RM</th>
                    <th className="py-2.5 px-4 font-semibold">Demografi</th>
                    <th className="py-2.5 px-4 font-semibold">Status Kunjungan</th>
                    <th className="py-2.5 px-4 font-semibold">TTV Terakhir</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 transition-colors text-xs text-slate-700 dark:text-slate-300">
                {getSortedData(filteredTriagePatients.filter(p => p.status === 'Selesai' || p.status === 'Lunas'))
                  .slice((getPage('triage_history') - 1) * 10, getPage('triage_history') * 10)
                  .map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block">{p.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">RM: #{p.rm_number || p.id.toString().padStart(6, '0')}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-slate-600 dark:text-slate-400">{p.gender} • {p.age} Thn</span>
                        </td>
                        <td className="py-3 px-4">
                           <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono font-bold">
                              {p.status}
                           </span>
                        </td>
                        <td className="py-3 px-4">
                           {p.vitals ? (
                             <div className="text-[10px] text-slate-500 dark:text-slate-450 space-y-0.5">
                               TD: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{p.vitals.blood_pressure}</span>mmHg | T: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{p.vitals.temperature}</span>°C
                             </div>
                           ) : (
                             <span className="text-[10px] text-slate-400 italic font-medium">Tidak ada TTV</span>
                           )}
                        </td>
                        <td className="py-3 px-4 text-right">
                           <button onClick={() => openPatientProfile(p)} className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] hover:text-[#3B32C0] cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors font-bold">Lihat History</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            <Pagination 
              totalItems={filteredTriagePatients.filter(p => p.status === 'Selesai' || p.status === 'Lunas').length} 
              itemsPerPage={5} 
              currentPage={triageHistoryPage} 
              onPageChange={setTriageHistoryPage} 
              className="rounded-b-2xl border-x border-b border-slate-200 dark:border-slate-800"
            />
          </div>
        )}
      </div>
    </div>
  );
}
