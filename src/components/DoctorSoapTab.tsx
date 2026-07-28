import { Stethoscope, History, User, Edit2, FileText } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { Pagination } from './Pagination';

interface DoctorSoapTabProps {
  patientsInfo: any[];
  getPage: (key: string) => number;
  setPage: (key: string, page: number) => void;
  openSoapModal: (p: any) => void;
  setHistoryVisits: (visits: any[]) => void;
  setModalType: (type: string | null) => void;
  groupedPatients: any[];
  openPatientProfile: (p: any) => void;
  openReferralModal: (p: any) => void;
}

export function DoctorSoapTab({
  patientsInfo,
  getPage,
  setPage,
  openSoapModal,
  setHistoryVisits,
  setModalType,
  groupedPatients,
  openPatientProfile,
  openReferralModal
}: DoctorSoapTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Rekam Medis (SOAP)</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Stethoscope className="w-3 h-3 text-indigo-500" /> Modul Dokter Spesialis
          </p>
        </div>
      </header>

      <div className="flex-grow flex flex-col gap-4 overflow-y-auto min-h-0 custom-scrollbar pr-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[13px]">Antrian Pasien Pemeriksaan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  <th className="p-3 w-16 text-center">No</th>
                  <th className="p-3">RM / Nama Pasien</th>
                  <th className="p-3">Keluhan Utama</th>
                  <th className="p-3">TTV (Suster)</th>
                  <th className="p-3">Cek Klinis (SOAP)</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/10 bg-white dark:bg-slate-900">
                {patientsInfo.filter(p => !p.soap && (p.status === 'Menunggu' || p.status === 'Menunggu Dokter' || p.status === 'Diperiksa' || p.status === 'Dalam Pemeriksaan'))
                  .slice((getPage('antrian_periksa') - 1) * 10, getPage('antrian_periksa') * 10)
                  .map((p, idx) => (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3 text-center text-xs font-semibold text-slate-300">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{p.name}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">RM: #{p.rm_number || p.id.toString().padStart(6, '0')} • {p.age} thn</div>
                    </td>
                    <td className="p-3 max-w-[200px]">
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{p.complaint || "Tidak ada keluhan"}</p>
                    </td>
                    <td className="p-3 relative">
                      {p.vitals ? (
                         <div className="text-[9px] space-y-0.5 text-slate-500 dark:text-slate-400 font-medium">
                           <p><span className="text-slate-300">BP:</span> {p.vitals.blood_pressure} <span className="text-[8px]">mmHg</span></p>
                           <p><span className="text-slate-300">HR:</span> {p.vitals.heart_rate} <span className="text-[8px]">x/m</span></p>
                         </div>
                      ) : (
                         <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">Pending TTV</span>
                      )}
                    </td>
                    <td className="p-3 relative group">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Antrian Dokter</span>
                    </td>
                    <td className="p-3 text-center">
                       <ActionMenu 
                         actions={[
                           {
                             label: "Isi SOAP",
                             icon: Stethoscope,
                             onClick: () => openSoapModal(p)
                           },
                           {
                             label: "Lihat Riwayat",
                             icon: History,
                             onClick: () => {
                                const pg = groupedPatients.find(x => (x.rm_number || x.id.toString().padStart(6, '0')) === (p.rm_number || p.id.toString().padStart(6, '0')));
                                setHistoryVisits(pg ? pg.visits : [p]);
                                setModalType('patientHistory');
                             }
                           }
                         ]}
                       />
                    </td>
                  </tr>
                ))}
                {patientsInfo.filter(p => !p.soap && (p.status === 'Menunggu Dokter' || p.status === 'Diperiksa' || p.status === 'Dalam Pemeriksaan')).length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-widest font-bold">Semua pasien di antrian sudah diperiksa dokter</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            totalItems={patientsInfo.filter(p => !p.soap && (p.status === 'Menunggu' || p.status === 'Menunggu Dokter' || p.status === 'Diperiksa' || p.status === 'Dalam Pemeriksaan')).length}
            itemsPerPage={10}
            currentPage={getPage('antrian_periksa')}
            onPageChange={(page) => setPage('antrian_periksa', page)}
            className="rounded-b-[2rem] border-x border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/10 dark:bg-slate-900/50"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[13px]">Riwayat Selesai Hari Ini</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  <th className="p-3 w-16 text-center">No</th>
                  <th className="p-3">RM / Nama Pasien</th>
                  <th className="p-3">Ringkasan Diagnosis</th>
                  <th className="p-3">TTV Terakhir</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/10 bg-white dark:bg-slate-900">
                {patientsInfo.filter(p => p.status === 'Selesai' || p.status === 'Lunas' || p.soap)
                  .slice((getPage('riwayat_selesai_today') - 1) * 10, getPage('riwayat_selesai_today') * 10)
                  .map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                    <td className="p-3 text-center text-xs font-semibold text-slate-300">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-700 dark:text-slate-200 text-xs">{p.name}</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">RM: #{p.rm_number || p.id.toString().padStart(6, '0')}</div>
                    </td>
                    <td className="p-3 relative group">
                      <div className="text-[9px] space-y-0.5">
                         <div className="flex gap-1.5 font-bold"><span className="text-indigo-600">Diag:</span> <span className="text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{p.soap?.diagnosis || '-'}</span></div>
                         <div className="flex gap-1.5"><span className="text-indigo-600 font-bold w-3">S:</span> <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{p.soap?.subjective || '-'}</span></div>
                      </div>
                    </td>
                    <td className="p-3 relative">
                      {p.vitals ? (
                         <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                           <p>{p.vitals.blood_pressure} <span className="text-slate-300">/</span> {p.vitals.temperature}°C</p>
                         </div>
                      ) : (
                         <span className="text-[9px] text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                       <ActionMenu 
                         actions={[
                           {
                             label: "Detail Profil",
                             icon: User,
                             onClick: () => openPatientProfile(p)
                           },
                           {
                             label: "Edit SOAP",
                             icon: Edit2,
                             onClick: () => openSoapModal(p)
                           },
                           {
                             label: "Rujuk Pasien",
                             icon: FileText,
                             onClick: () => openReferralModal(p)
                           }
                         ]}
                       />
                    </td>
                  </tr>
                ))}
                {patientsInfo.filter(p => p.status === 'Selesai' || p.status === 'Lunas' || p.soap).length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-widest font-bold italic">Belum ada riwayat selesai</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            totalItems={patientsInfo.filter(p => p.status === 'Selesai' || p.status === 'Lunas' || p.soap).length}
            itemsPerPage={10}
            currentPage={getPage('riwayat_selesai_today')}
            onPageChange={(page) => setPage('riwayat_selesai_today', page)}
            className="rounded-b-[2rem] border-x border-b border-slate-100 dark:border-slate-800/60"
          />
        </div>
      </div>
    </div>
  );
}
