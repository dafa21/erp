import { Search, Activity, History, Edit2 } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { Pagination } from './Pagination';

interface LisTabProps {
  labOrdersInfo: any[];
  fetchLabOrders: () => void;
  getPage: (key: string) => number;
  setPage: (key: string, page: number) => void;
  formatIDDateTime: (dateString: string) => string;
  setCurrentLabResults: (results: any[]) => void;
  setLabResultsModalOpen: (state: {open: boolean, orderId: number|null}) => void;
}

export function LisTab({
  labOrdersInfo,
  fetchLabOrders,
  getPage,
  setPage,
  formatIDDateTime,
  setCurrentLabResults,
  setLabResultsModalOpen
}: LisTabProps) {
  const activeLabOrders = labOrdersInfo.filter(lo => lo.status !== 'Selesai');
  const historyLabOrders = labOrdersInfo.filter(lo => lo.status === 'Selesai');
  
  const activeLabPatientsMap = new Map();
  activeLabOrders.forEach(lo => {
     if (!activeLabPatientsMap.has(lo.patient_id)) {
        activeLabPatientsMap.set(lo.patient_id, {
           patient_id: lo.patient_id,
           patient_name: lo.patient_name,
           rm_number: lo.rm_number,
           doctor_name: [lo.doctor_name],
           created_at: lo.created_at,
           orders: []
        });
     } else {
        const p = activeLabPatientsMap.get(lo.patient_id);
        if (!p.doctor_name.includes(lo.doctor_name)) p.doctor_name.push(lo.doctor_name);
     }
     activeLabPatientsMap.get(lo.patient_id).orders.push(lo);
  });
  const activeLabPatients = Array.from(activeLabPatientsMap.values());
  
  const historyLabPatientsMap = new Map();
  historyLabOrders.forEach(lo => {
     if (!historyLabPatientsMap.has(lo.patient_id)) {
        historyLabPatientsMap.set(lo.patient_id, {
           patient_id: lo.patient_id,
           patient_name: lo.patient_name,
           rm_number: lo.rm_number,
           doctor_name: [lo.doctor_name],
           created_at: lo.created_at,
           orders: []
        });
     } else {
        const p = historyLabPatientsMap.get(lo.patient_id);
        if (!p.doctor_name.includes(lo.doctor_name)) p.doctor_name.push(lo.doctor_name);
     }
     historyLabPatientsMap.get(lo.patient_id).orders.push(lo);
  });
  const historyLabPatients = Array.from(historyLabPatientsMap.values());
  
  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col space-y-4 pb-4 overflow-y-auto custom-scrollbar">
      <header className="shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase">Laboratorium & Radiologi</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-orange-500" /> CPOE & Test Results
            </p>
          </div>
        </div>
        <button onClick={fetchLabOrders} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 uppercase tracking-widest transition-colors flex items-center gap-2">
          <History className="w-3 h-3" /> Refresh Data
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col mb-4 shrink-0">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Order Aktif (Diproses)</h3>
         </div>
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                     <th className="px-4 py-3">Pasien</th>
                     <th className="px-4 py-3">Waktu Order</th>
                     <th className="px-4 py-3">Total Pemeriksaan</th>
                     <th className="px-4 py-3">Dokter Pengirim</th>
                     <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800">
                  {activeLabPatients
                    .slice((getPage('active_lab') - 1) * 10, getPage('active_lab') * 10)
                    .map((p, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{p.patient_name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">RM-{p.rm_number}</p>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {formatIDDateTime(p.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium inline-block px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-800/50">
                             {p.orders.length} order menunggu
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                          <span className="text-xs text-slate-500">{p.doctor_name.join(', ')}</span>
                        </td>
                        <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                           <ActionMenu 
                              actions={p.orders.map((o: any) => ({
                                 label: 'Isi Hasil: ' + o.test_name + ' (ORD-' + o.id.toString().padStart(6,'0') + ')',
                                 icon: Edit2,
                                 onClick: async () => {
                                    const res = await fetch(`/api/lab-orders/${o.id}/results`);
                                    const data = await res.json();
                                    setCurrentLabResults(data);
                                    setLabResultsModalOpen({open: true, orderId: o.id});
                                 }
                              }))}
                           />
                        </td>
                     </tr>
                  ))}
                  {activeLabPatients.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-xs font-medium uppercase tracking-widest">Tidak ada order aktif.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
         <Pagination 
            totalItems={activeLabPatients.length}
            itemsPerPage={10}
            currentPage={getPage('active_lab')}
            onPageChange={(page) => setPage('active_lab', page)}
         />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Riwayat Histori (Selesai)</h3>
         </div>
                             <div className="overflow-x-auto custom-scrollbar max-h-[400px]">
            <table className="w-full text-left relative">
               <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                     <th className="px-4 py-3">Pasien</th>
                     <th className="px-4 py-3">Waktu Order</th>
                     <th className="px-4 py-3">Total Pemeriksaan</th>
                     <th className="px-4 py-3">Dokter Pengirim</th>
                     <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800">
                  {historyLabPatients
                    .slice((getPage('history_lab') - 1) * 10, getPage('history_lab') * 10)
                    .map((p, i) => (
                     <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-white">{p.patient_name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">RM-{p.rm_number}</p>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {formatIDDateTime(p.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                             {p.orders.length} order selesai
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap">
                          <span className="text-xs text-slate-500">{p.doctor_name.join(', ')}</span>
                        </td>
                        <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                           <ActionMenu 
                              actions={p.orders.map((o: any) => ({
                                 label: 'Lihat Hasil: ' + o.test_name + ' (ORD-' + o.id.toString().padStart(6,'0') + ')',
                                 icon: Search,
                                 onClick: async () => {
                                    const res = await fetch(`/api/lab-orders/${o.id}/results`);
                                    const data = await res.json();
                                    setCurrentLabResults(data);
                                    setLabResultsModalOpen({open: true, orderId: o.id});
                                 }
                              }))}
                           />
                        </td>
                     </tr>
                  ))}
                  {historyLabPatients.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-xs font-medium uppercase tracking-widest">Belum ada riwayat.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
         <Pagination 
            totalItems={historyLabPatients.length}
            itemsPerPage={10}
            currentPage={getPage('history_lab')}
            onPageChange={(page) => setPage('history_lab', page)}
         />
      </div>
    </div>
  );
}
