import { Database, Search, Download, Baby, ShieldAlert, AlertTriangle, CreditCard, History, Footprints, Plus, Edit2, Trash2 } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { Pagination } from './Pagination';

interface PatientDatabaseTabProps {
  patientSearchQuery: string;
  setPatientSearchQuery: (query: string) => void;
  dbDateFilter: string;
  setDbDateFilter: (date: string) => void;
  handleExportPatientsExcel: () => void;
  filteredGroupedPatients: any[];
  dbCurrentPage: number;
  dbItemsPerPage: number;
  setDbCurrentPage: (page: number) => void;
  groupedPatients: any[];
  openPatientProfile: (p: any) => void;
  generatePatientCardPDF: (p: any) => void;
  setHistoryVisits: (visits: any[]) => void;
  setModalType: (type: string | null) => void;
  openChildrenModal: (p: any) => void;
  openPatientModal: (p: any, isNewVisit?: boolean) => void;
  deletePatient: (id: number) => void;
}

export function PatientDatabaseTab({
  patientSearchQuery,
  setPatientSearchQuery,
  dbDateFilter,
  setDbDateFilter,
  handleExportPatientsExcel,
  filteredGroupedPatients,
  dbCurrentPage,
  dbItemsPerPage,
  setDbCurrentPage,
  groupedPatients,
  openPatientProfile,
  generatePatientCardPDF,
  setHistoryVisits,
  setModalType,
  openChildrenModal,
  openPatientModal,
  deletePatient
}: PatientDatabaseTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">Database Pasien</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-500" /> Pusat Data Rekam Medis Pasien (Superadmin)
          </p>
        </div>
      </header>

      <div className="flex-grow bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 shrink-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[13px]">Master Database Pasien</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari nama atau no. RM..." 
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 focus:bg-white transition-all text-slate-800 dark:text-slate-100 outline-none"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Reg:</span>
              <input 
                type="date" 
                className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={dbDateFilter}
                onChange={(e) => setDbDateFilter(e.target.value)}
              />
              {dbDateFilter && (
                <button 
                  onClick={() => setDbDateFilter('')}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <button 
              onClick={handleExportPatientsExcel}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>
        <div className="overflow-auto flex-grow min-h-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4 font-semibold">Nama Pasien / RM</th>
                <th className="py-3 px-4 font-semibold">Demografi</th>
                <th className="py-3 px-4 font-semibold w-1/3">Anamnesis / Riwayat</th>
                <th className="py-3 px-4 font-semibold">Cek Vital & ANC</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/10">
              {filteredGroupedPatients.slice((dbCurrentPage - 1) * dbItemsPerPage, dbCurrentPage * dbItemsPerPage).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => openPatientProfile(p)}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.name}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">RM: #{p.rm_number || p.id.toString().padStart(6, '0')}</div>
                    {p.is_pregnant === 1 && (
                      <div className="mt-2 text-[10px] text-pink-600 font-bold flex items-center gap-1 bg-pink-50 px-1.5 py-0.5 rounded w-max border border-pink-200">
                        <Baby className="w-3 h-3" /> Pasien Ibu Hamil
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">{p.gender}</span> • {p.age} Thn
                    {p.phone && <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">📱 {p.phone}</div>}
                    {p.allergies && p.allergies.trim() !== '' && (
                      <div className="mt-1 text-[10px] text-red-600 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded w-max border border-red-200"><ShieldAlert className="w-3 h-3" /> Alergi: {p.allergies}</div>
                    )}
                    {p.fall_risk && p.fall_risk !== 'Rendah' && (
                      <div className="mt-1 text-[10px] text-orange-600 font-bold flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded w-max border border-orange-200"><AlertTriangle className="w-3 h-3" /> Risiko Jatuh: {p.fall_risk}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
                    <span className="line-clamp-2 text-xs leading-relaxed">{p.complaint || '-'}</span>
                    <div className="mt-2 text-[10px] text-indigo-600 font-semibold flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded w-max border border-indigo-200">
                      Status Saat Ini: {p.status}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {p.vitals && (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <strong>TTV Terakhir:</strong>
                        <br/>TD: <span className="font-mono">{p.vitals.blood_pressure}</span>mmHg | Suhu: <span className="font-mono">{p.vitals.temperature}</span>°C
                        <br/>Nadi: <span className="font-mono">{p.vitals.heart_rate}</span>/mnt | O2: <span className="font-mono">{p.vitals.oxygen_saturation}</span>%
                      </div>
                    )}
                    {!p.vitals && <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Belum ada data TTV</div>}
                    
                    {p.is_pregnant === 1 && p.anc && (
                      <div className="text-[10px] text-pink-700 space-y-0.5">
                        <strong>Riwayat ANC:</strong>
                        <br/>Usia Kandungan: {p.anc.gestational_age} Minggu
                        <br/>HPL: {p.anc.estimated_delivery_date}
                        {(p.anc.usg_tbj || p.anc.usg_bpd) && (
                          <><br/><span className="bg-pink-100 px-1 py-0.5 mt-0.5 inline-block rounded font-bold border border-pink-200">USG ✓</span></>
                        )}
                        <br/>Catatan: {p.anc.fetal_development}
                      </div>
                    )}
                    {p.is_pregnant === 1 && !p.anc && (
                      <div className="text-[10px] text-pink-400 italic">Belum ada pemeriksaan ANC</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <ActionMenu 
                      actions={[
                        {
                          label: "Cetak Kartu",
                          icon: CreditCard,
                          onClick: () => {
                            generatePatientCardPDF(p);
                          }
                        },
                        {
                          label: "Lihat Riwayat",
                          icon: History,
                          onClick: () => { setHistoryVisits(p.visits); setModalType('patientHistory'); }
                        },
                        ...(p.gender === 'Perempuan' ? [{
                          label: "Daftar Anak",
                          icon: Footprints,
                          onClick: () => openChildrenModal(p)
                        }] : []),
                        {
                          label: "Kunjungan Baru",
                          icon: Plus,
                          onClick: () => openPatientModal(p, true)
                        },
                        {
                          label: "Edit Data",
                          icon: Edit2,
                          onClick: () => openPatientModal(p)
                        },
                        {
                          label: "Hapus Master",
                          icon: Trash2,
                          variant: 'danger',
                          onClick: () => deletePatient(p.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {groupedPatients.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">Belum ada data pasien dalam sistem.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Client-Side Pagination controls */}
        {filteredGroupedPatients.length > 0 && (
            <Pagination 
              totalItems={filteredGroupedPatients.length}
              itemsPerPage={dbItemsPerPage}
              currentPage={dbCurrentPage}
              onPageChange={setDbCurrentPage}
            />
        )}
      </div>
    </div>
  );
}
