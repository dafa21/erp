import React from 'react';
import { CalendarClock, Activity, CheckCircle, Users, Bed, Receipt, UserPlus, TrendingUp, Pill, X } from 'lucide-react';
import { formatIDDateTime } from '../../utils/formatters';

interface DashboardDetailModalProps {
  modalType: string;
  setModalType: (type: string) => void;
  dashboardDetailType: string | null;
  patientsInfo: any[];
  bedsInfo: any[];
  billingsData: any[];
  dashboardMetrics: any;
  drugsInfo: any[];
}

export function DashboardDetailModal({
  modalType,
  setModalType,
  dashboardDetailType,
  patientsInfo,
  bedsInfo,
  billingsData,
  dashboardMetrics,
  drugsInfo
}: DashboardDetailModalProps) {
  if (modalType !== 'dashboardDetail' || !dashboardDetailType) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity opacity-100" onClick={() => setModalType('none')} />
      
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-xl w-full max-w-4xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {dashboardDetailType === 'waiting' && <><CalendarClock className="w-5 h-5 text-indigo-500" /> Detail Pasien Menunggu</>}
              {dashboardDetailType === 'inAction' && <><Activity className="w-5 h-5 text-orange-500" /> Detail Pasien Dalam Tindakan</>}
              {dashboardDetailType === 'finished' && <><CheckCircle className="w-5 h-5 text-emerald-500" /> Detail Pasien Selesai/Lunas</>}
              {dashboardDetailType === 'totalPatients' && <><Users className="w-5 h-5 text-blue-500" /> Keseluruhan Data Pasien</>}
              {dashboardDetailType === 'bedOccupied' && <><Bed className="w-5 h-5 text-red-500" /> Detail Bed Terisi</>}
              {dashboardDetailType === 'bedAvailable' && <><Bed className="w-5 h-5 text-emerald-500" /> Detail Bed Tersedia</>}
              {dashboardDetailType === 'revenue' && <><Receipt className="w-5 h-5 text-green-500" /> Detail Trajectory Pendapatan (7 Hari)</>}
              {dashboardDetailType === 'revenueToday' && <><Receipt className="w-5 h-5 text-emerald-600" /> Detail Trajectory Pendapatan (Hari Ini)</>}
              {dashboardDetailType === 'age' && <><Users className="w-5 h-5 text-purple-500" /> Detail Demografi Umur</>}
              {dashboardDetailType === 'gender' && <><UserPlus className="w-5 h-5 text-pink-500" /> Detail Demografi Jenis Kelamin</>}
              {dashboardDetailType === 'growth' && <><TrendingUp className="w-5 h-5 text-blue-500" /> Detail Tren Pertumbuhan Bulanan</>}
              {dashboardDetailType === 'lowStock' && <><Pill className="w-5 h-5 text-amber-500" /> Detail Peringatan Stok Obat Menipis</>}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Data detail berdasarkan data real-time klinik yang dipilih.</p>
          </div>
          <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors outline-none"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 h-full">
           <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
             <table className="w-full text-left text-sm relative">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-200 dark:border-slate-800 sticky top-0 backdrop-blur-sm z-10">
                   {['waiting', 'inAction', 'finished', 'totalPatients'].includes(dashboardDetailType) && (
                      <tr>
                         <th className="px-4 py-3">No. RM</th>
                         <th className="px-4 py-3">Nama Pasien</th>
                         <th className="px-4 py-3">Poli / Kunjungan</th>
                         <th className="px-4 py-3">Status</th>
                         <th className="px-4 py-3">Umur / JK</th>
                      </tr>
                   )}
                   {['bedOccupied', 'bedAvailable'].includes(dashboardDetailType) && (
                      <tr>
                         <th className="px-4 py-3">Nomor / Ruangan</th>
                         <th className="px-4 py-3">Kelas</th>
                         <th className="px-4 py-3">Status Bed</th>
                      </tr>
                   )}
                   {['revenue', 'revenueToday'].includes(dashboardDetailType) && (
                      <tr>
                         <th className="px-4 py-3">Tgl / Waktu</th>
                         <th className="px-4 py-3 whitespace-nowrap">ID Nota / Pasien</th>
                         <th className="px-4 py-3">Item Pembayaran</th>
                         <th className="px-4 py-3 text-right">Total Transaksi (Rp)</th>
                      </tr>
                   )}
                   {dashboardDetailType === 'lowStock' && (
                      <tr>
                         <th className="px-4 py-3">Nama Obat</th>
                         <th className="px-4 py-3">Satuan</th>
                         <th className="px-4 py-3 text-right">Stok Tersisa</th>
                      </tr>
                   )}
                   {['age', 'gender', 'growth'].includes(dashboardDetailType) && (
                      <tr>
                         <th className="px-4 py-3">Kategori Demografi</th>
                         <th className="px-4 py-3 text-right">Total Pasien</th>
                      </tr>
                   )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                   {/* Patients Logic */}
                   {['waiting', 'inAction', 'finished', 'totalPatients'].includes(dashboardDetailType) && patientsInfo
                     .filter(p => {
                         if (dashboardDetailType === 'waiting') return p.status === 'Menunggu';
                         if (dashboardDetailType === 'inAction') return p.status === 'Diperiksa' || p.status === 'Dalam Tindakan';
                         if (dashboardDetailType === 'finished') return p.status === 'Selesai' || p.status === 'Lunas';
                         return true; // totalPatients
                     }).length > 0 ? patientsInfo
                     .filter(p => {
                         if (dashboardDetailType === 'waiting') return p.status === 'Menunggu';
                         if (dashboardDetailType === 'inAction') return p.status === 'Diperiksa' || p.status === 'Dalam Tindakan';
                         if (dashboardDetailType === 'finished') return p.status === 'Selesai' || p.status === 'Lunas';
                         return true; // totalPatients
                     })
                     .map((p, i) => (
                       <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${p.vitals?.triage_level === 'Merah' ? 'bg-rose-50/50 dark:bg-rose-900/10 animate-[pulse_2s_ease-in-out_infinite]' : ''}`}>
                         <td className="px-4 py-3 font-mono font-bold text-[11px] whitespace-nowrap">
                           RM-{p.rm_number || p.id.toString().padStart(6,'0')}
                           {p.vitals?.triage_level === 'Merah' && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" title="Triage: Darurat (Merah)"></span>}
                         </td>
                         <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{p.name}</td>
                         <td className="px-4 py-3 text-xs leading-relaxed max-w-[200px] truncate">{p.complaint || '-'}</td>
                         <td className="px-4 py-3 whitespace-nowrap">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${p.status === 'Menunggu' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : p.status === 'Selesai' || p.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'}`}>{p.status}</span>
                         </td>
                         <td className="px-4 py-3 text-xs whitespace-nowrap">{p.age} th / {p.gender}</td>
                       </tr>
                   )) : (['waiting', 'inAction', 'finished', 'totalPatients'].includes(dashboardDetailType) && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-xs tracking-widest uppercase font-bold">Tidak ada data pasien yang sesuai kriteria</td></tr>)}

                   {/* Beds Logic */}
                   {['bedOccupied', 'bedAvailable'].includes(dashboardDetailType) && bedsInfo
                     .filter(b => dashboardDetailType === 'bedOccupied' ? b.status === 'Terisi' : b.status === 'Tersedia').length > 0 ? bedsInfo
                     .filter(b => dashboardDetailType === 'bedOccupied' ? b.status === 'Terisi' : b.status === 'Tersedia')
                     .map((b, i) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{b.room}</td>
                         <td className="px-4 py-3 text-xs whitespace-nowrap"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">{b.class}</span></td>
                         <td className="px-4 py-3 whitespace-nowrap">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${b.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>{b.status}</span>
                         </td>
                       </tr>
                   )) : (['bedOccupied', 'bedAvailable'].includes(dashboardDetailType) && <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400 text-xs tracking-widest uppercase font-bold">Tidak ada data bed yang sesuai kriteria</td></tr>)}

                   {/* Revenue / Billing Logic */}
                   {['revenue', 'revenueToday'].includes(dashboardDetailType) && (() => {
                      // Filter billings for last 7 days or today relying on data array
                      const todayStr = new Date().toISOString().split('T')[0];
                      let startFilterDate = new Date();
                      if (dashboardDetailType === 'revenue') {
                         startFilterDate.setDate(startFilterDate.getDate() - 6); // 7 days window
                         startFilterDate.setHours(0,0,0,0);
                      } else {
                         startFilterDate = new Date(); // exact today (ignored here since we use todayStr exact match)
                      }
                      
                      const validBillings = billingsData.filter(b => {
                         const bDate = b.created_at?.split('T')[0];
                         if (dashboardDetailType === 'revenueToday') return bDate === todayStr;
                         return new Date(b.created_at) >= startFilterDate;
                      });

                      if (validBillings.length === 0) return (
                          <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-xs tracking-widest uppercase font-bold">Belum ada transaksi.</td></tr>
                      );

                      return validBillings.map((b, i) => {
                         const invoiceTotal = (b.items || []).reduce((sum: number, item: any) => sum + item.amount, 0);
                         const p = patientsInfo.find(px => px.id === b.patient_id) || {name: b.patient_name || 'Umum'};
                         return (
                           <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-500 whitespace-nowrap">{formatIDDateTime(b.created_at || new Date())}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="font-mono text-[9px] text-slate-400">INV-{b.id.toString().padStart(6,'0')}</div>
                                  <div className="font-bold text-slate-900 dark:text-white">{p.name || b.patient_name || 'Umum'}</div>
                              </td>
                              <td className="px-4 py-3 text-[10px] text-slate-500 max-w-[250px] truncate" title={(b.items || []).map((x: any) => x.description).join(', ')}>
                                {(b.items || []).map((x: any) => x.description).join(', ') || '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Rp {invoiceTotal.toLocaleString('id-ID')}</td>
                           </tr>
                         )
                      });
                   })()}

                   {/* Age Dist */}
                   {dashboardDetailType === 'age' && dashboardMetrics?.ageDistribution?.map((a: any, i: number) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 flex items-center gap-3 whitespace-nowrap">
                             <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: a.color }}></div>
                             <span className="font-bold text-slate-900 dark:text-white">{a.range}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold whitespace-nowrap">{a.count} Pasien</td>
                       </tr>
                   ))}

                   {/* Gender Dist */}
                   {dashboardDetailType === 'gender' && dashboardMetrics?.genderStats?.map((g: any, i: number) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 flex items-center gap-3 whitespace-nowrap">
                             <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: g.color }}></div>
                             <span className="font-bold text-slate-900 dark:text-white">{g.name}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold whitespace-nowrap">{g.value} Pasien</td>
                       </tr>
                   ))}

                   {/* Low Stock Dist */}
                   {dashboardDetailType === 'lowStock' && (drugsInfo.filter(d => d.stock < 20).length > 0 ? drugsInfo.filter(d => d.stock < 20).map((d, i) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{d.name}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{d.unit}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap text-red-500">{d.stock}</td>
                       </tr>
                   )) : (<tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400 text-xs tracking-widest uppercase font-bold">Tidak ada obat dengan stok menipis</td></tr>))}

                   {/* Growth Dist */}
                   {dashboardDetailType === 'growth' && (dashboardMetrics?.activeGrowth?.length > 0 ? dashboardMetrics.activeGrowth.map((g: any, i: number) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{g.month}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold whitespace-nowrap">{g.count} Pasien</td>
                       </tr>
                   )) : (<tr><td colSpan={2} className="px-4 py-10 text-center text-slate-400 text-xs tracking-widest uppercase font-bold">Tidak ada data pertumbuhan per bulan</td></tr>))}
                </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
