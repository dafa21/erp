import { CreditCard, Receipt, Plus, Printer } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { Pagination } from './Pagination';

interface BillingTabProps {
  patientsInfo: any[];
  billingsData: any[];
  openBillingModal: () => void;
  handleProcessBilling: (p: any) => void;
  getPage: (key: string) => number;
  setPage: (key: string, page: number) => void;
  formatIDTime: (dateString: string) => string;
  openInvoiceDetail: (b: any) => void;
}

export function BillingTab({
  patientsInfo,
  billingsData,
  openBillingModal,
  handleProcessBilling,
  getPage,
  setPage,
  formatIDTime,
  openInvoiceDetail
}: BillingTabProps) {
  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col space-y-4 pb-4">
      <header className="shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none uppercase">Finance & Kasir</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
              <Receipt className="w-3 h-3 text-indigo-500" /> Transaksi Pasien Terpusat
            </p>
          </div>
        </div>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div className="flex items-center gap-3">
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Antrian Pembayaran</p>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={openBillingModal} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                  <Plus className="w-3 h-3" /> Transaksi Bebas
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {patientsInfo.filter(p => p.status === 'Selesai' && !billingsData.find(b => b.patient_id === p.id)).map(p => (
               <div key={p.id} className="group bg-slate-50/50 dark:bg-slate-950/50 hover:bg-white border border-slate-100 dark:border-slate-800 hover:border-emerald-200 rounded-xl p-4 transition-all">
                  <div className="flex justify-between items-start mb-3">
                     <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-black text-[10px] shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {p.name.charAt(0)}
                     </div>
                     <span className="px-1.5 py-0.5 bg-white dark:bg-slate-900 text-emerald-600 border border-emerald-100 text-[8px] font-black rounded uppercase">PENDING</span>
                  </div>
                  <h4 className="font-black text-slate-700 dark:text-slate-200 text-xs mb-0.5 uppercase tracking-tight truncate">{p.name}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter mb-4">RM-{p.rm_number || p.id} • {p.age} Thn</p>
                  
                  <button 
                     onClick={() => handleProcessBilling(p)}
                     className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                  >
                     Bayar
                  </button>
               </div>
            ))}
         </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex-grow min-h-0 flex flex-col">
         <div className="flex items-center justify-between mb-5 shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Riwayat Transaksi Day-Cycle</h3>
         </div>

         <div className="overflow-x-auto min-h-0 flex-grow custom-scrollbar">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-white dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                     <th className="px-4 py-2">Invoice</th>
                     <th className="px-4 py-2">Pasien</th>
                     <th className="px-4 py-2">Waktu</th>
                     <th className="px-4 py-2 text-right">Total</th>
                     <th className="px-4 py-2 text-right">Aksi</th>
                  </tr>
               </thead>
               <tbody className="text-xs">
                  {billingsData
                    .slice((getPage('billings') - 1) * 10, getPage('billings') * 10)
                    .map(b => (
                     <tr key={b.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 text-[10px]">
                           #INV-{b.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-4 py-3">
                           <p className="font-bold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-tight leading-none">{b.patient_name}</p>
                           <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter">RM: {b.patient_id || '-'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-medium font-mono text-[9px]">
                           {formatIDTime(b.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white text-[11px]">
                           Rp {b.total_amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-right">
                           <ActionMenu 
                              actions={[
                                 {
                                    label: "Cetak Invoice",
                                    icon: Printer,
                                    onClick: () => openInvoiceDetail(b)
                                 }
                              ]}
                           />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <Pagination 
            totalItems={billingsData.length}
            itemsPerPage={10}
            currentPage={getPage('billings')}
            onPageChange={(page) => setPage('billings', page)}
         />
      </section>
    </div>
  );
}
