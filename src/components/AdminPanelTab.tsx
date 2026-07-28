import React, { useRef, useState } from 'react';
import { Settings, UserCog, Bed, CalendarClock, Banknote, Pill, Database, Search, Plus, Activity, Edit2, Trash2, User, AlertTriangle, Clock, Upload } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { SortIcon } from './SortIcon';
import * as XLSX from 'xlsx';

export function AdminPanelTab({
  adminSubTab,
  setAdminSubTab,
  drugSearchQuery,
  setDrugSearchQuery,
  setEditingItem,
  setDrugForm,
  currentUser,
  setModalType,
  requestSort,
  sortConfig,
  getSortedData,
  drugsInfo,
  coa,
  fetchStockHistory,
  fetchDrugs,
  isDriveSyncing,
  handleLocalBackupOnly,
  handleManualBackup,
  backupLogsInfo,
  formatIDDateTime,
  formatIDDate,
  userSearchQuery,
  setUserSearchQuery,
  openUserModal,
  usersInfo,
  deleteUser,
  bedsInfo,
  openBedModal,
  deleteBed,
  shiftsInfo,
  openShiftModal,
  deleteShift,
  tariffsInfo,
  openTariffModal,
  deleteTariff,
  marginsInfo,
  openMarginModal,
  deleteMargin
}: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const res = await fetch('/api/drugs/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            drugs: data,
            clinic_id: currentUser?.clinic_id 
          }),
        });
        
        if (res.ok) {
          const resData = await res.json();
          alert(`Berhasil mengupload ${resData.count} obat!`);
          fetchDrugs();
        } else {
          alert('Gagal upload data');
        }
      } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan saat memproses file Excel');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // We need to implement sorting and mapping here the same way...
  // We'll trust the main component props passed in
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none">Admin Control</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Resource Management</p>
            </div>
         </div>
        
         <div className="flex gap-2 mt-5 border-b border-slate-100 dark:border-slate-800 pb-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {[
            { id: 'users', label: 'Hak Akses', icon: UserCog },
            { id: 'beds', label: 'Beds', icon: Bed },
            { id: 'shifts', label: 'Shifts', icon: CalendarClock },
            { id: 'billingMaster', label: 'Finance', icon: Banknote },
            { id: 'drugs', label: 'Farmasi', icon: Pill },
            { id: 'backup', label: 'Backup & Sync', icon: Database }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setAdminSubTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all ${adminSubTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
            >
               <span className="flex items-center gap-2">
                 <tab.icon className="w-3.5 h-3.5" />
                 {tab.label}
               </span>
            </button>
          ))}
         </div>
      </header>

      <div className="flex-grow overflow-auto min-h-0">
          {adminSubTab === 'drugs' && (() => {
            const expiringDrugs = [...(drugsInfo || [])]
              .filter(d => d.exp_date && new Date(d.exp_date).getTime() > 0)
              .sort((a, b) => new Date(a.exp_date).getTime() - new Date(b.exp_date).getTime());
            
            const nextExpiring = expiringDrugs.slice(0, 5);

            return (
              <div className="flex flex-col gap-4 h-full min-h-0">
                {nextExpiring.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest">Peringatan Expired Date Mendekati</h4>
                    </div>
                    <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                      {nextExpiring.map(drug => (
                        <div key={drug.id} className="bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-800/50 p-3 rounded-xl min-w-[200px] shrink-0 shadow-sm flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{drug.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{drug.stock} {drug.unit}</p>
                          </div>
                          <div className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Exp: {new Date(drug.exp_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col flex-grow min-h-0 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Inventaris Apotek</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Stok & Manajemen Harga Obat</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Cari obat..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750"
                    value={drugSearchQuery}
                    onChange={(e) => setDrugSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={() => {
                    setEditingItem(null);
                    setDrugForm({ name: '', unit: 'Tablet', stock: 10, price: 1000, clinic_id: (currentUser?.role === 'Superadmin' ? '' : currentUser?.clinic_id) || '', purchase_price: 700, revenue_coa_id: '', inventory_coa_id: '', mfg_date: '', exp_date: '' });
                    setModalType('drug');
                  }} className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none transition-all">
                  <Plus className="w-3.5 h-3.5" /> Tambah Obat
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" /> {isUploading ? 'Loading...' : 'Upload Excel'}
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-grow min-h-0 border border-slate-100 dark:border-slate-800 rounded-xl custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 transition-colors">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('name')}>
                    <div className="flex items-center">Nama Obat <SortIcon column="name" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('stock')}>
                    <div className="flex items-center justify-center">Stok <SortIcon column="stock" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('purchase_price')}>
                    <div className="flex items-center justify-end">Harga Beli <SortIcon column="purchase_price" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('price')}>
                    <div className="flex items-center justify-end">Harga Jual <SortIcon column="price" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-center">Akun COA (Persediaan / Pendapatan)</th>
                  <th className="py-4 px-4 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                {getSortedData(drugsInfo.filter((d: any) => d.name.toLowerCase().includes(drugSearchQuery.toLowerCase()))).map((d: any) => {
                  const iCoa = coa.find((a: any) => String(a.id) === String(d.inventory_coa_id));
                  const rCoa = coa.find((a: any) => String(a.id) === String(d.revenue_coa_id));
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-4 text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs">{d.name}</div>
                            <div className="text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-widest font-black">Unit: {d.unit}</div>
                            
                            {(d.mfg_date || d.exp_date) && (
                              <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                {d.mfg_date && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-400 dark:text-slate-500 text-[8px] uppercase">Prod:</span>
                                    <span>{d.mfg_date}</span>
                                  </div>
                                )}
                                {d.exp_date && (() => {
                                  const isExpired = new Date(d.exp_date) < new Date();
                                  const isNearExpiry = (new Date(d.exp_date).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000);
                                  return (
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-400 dark:text-slate-500 text-[8px] uppercase">Exp:</span>
                                      <span className={isExpired ? 'text-red-500 dark:text-red-400 font-bold' : isNearExpiry ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-slate-500'}>
                                        {d.exp_date} {isExpired ? '(KADALUARSA)' : isNearExpiry ? '(Segera Kadaluarsa)' : ''}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${d.stock > 50 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : d.stock > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {d.stock} {d.unit}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400 font-mono text-xs font-semibold">Rp {(d.purchase_price || 0).toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400 font-mono text-xs font-bold">Rp {d.price.toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4 text-center text-xs">
                        <div className="inline-flex flex-col gap-0.5 text-left font-medium">
                          <span className="text-[10px] text-slate-500"><b className="text-slate-400 font-normal">Aset:</b> {iCoa ? `${iCoa.account_code} - ${iCoa.account_name}` : '1-1200 Persediaan Obat (Default)'}</span>
                          <span className="text-[10px] text-slate-500"><b className="text-slate-400 font-normal">Revenue:</b> {rCoa ? `${rCoa.account_code} - ${rCoa.account_name}` : '4-1100 Pendapatan Obat (Default)'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right col-span-1">
                      <ActionMenu 
                        actions={[
                          {
                            label: "Riwayat Stok",
                            icon: Activity,
                            onClick: () => fetchStockHistory(d)
                          },
                          {
                            label: "Edit Obat",
                            icon: Edit2,
                            onClick: () => {
                              setEditingItem(d);
                              setDrugForm({ name: d.name, unit: d.unit, stock: d.stock, price: d.price, clinic_id: d.clinic_id || '', purchase_price: d.purchase_price || 0, revenue_coa_id: d.revenue_coa_id || '', inventory_coa_id: d.inventory_coa_id || '', mfg_date: d.mfg_date || '', exp_date: d.exp_date || '' });
                              setModalType('drug');
                            }
                          },
                          {
                            label: "Hapus Obat",
                            icon: Trash2,
                            variant: 'danger',
                            onClick: async () => {
                              if (confirm('Hapus obat ini? Stok dan riwayat resep yang terhubung akan ikut terpengaruh.')) {
                                await fetch('/api/drugs/' + d.id, { method: 'DELETE' });
                                fetchDrugs();
                              }
                            }
                          }
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
              {drugsInfo.filter((d: any) => d.name.toLowerCase().includes(drugSearchQuery.toLowerCase())).length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">Bahan obat tidak ditemukan.</td></tr>
              )}
              </tbody>
              </table>
            </div>
          </div>
          </div>
          );
        })()}

        {adminSubTab === 'backup' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col transition-colors">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                 <Database className="w-5 h-5 text-indigo-500" /> Database Backup & Google Drive Sync
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Aplikasi telah dijadwalkan secara otomatis untuk mencadangkan database Anda secara lokal (di server) setiap malam pukul 00:00 ke folder `backups/`. Gunakan menu ini untuk mencadangkan data sekarang dan sinkronisasi otomatis ke Google Drive (dikirimkan ke email dafa394@gmail.com).
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Google Drive Status Wrapper */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Status Sinkronisasi Drive</h4>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Membutuhkan Autentikasi Saat Backup
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed block">
                  <b>Info Penting OAUTH:</b> Untuk menggunakan fitur "Backup ke Drive", Anda wajib mendaftarkan domain Anda ke Google Cloud Console dan memasukkan konfigurasi <code>VITE_GOOGLE_CLIENT_ID</code>. Jika saat login Google Anda mendapati error <b>"403: access_denied"</b>, pastikan Anda telah memasukkan email Google yang Anda gunakan ke dalam daftar <b>"Test Users"</b> di halaman OAuth Consent Screen Google Cloud Anda, atau ubah status publikasi menjadi "In production".
                </p>
              </div>
          
               {/* Backup Control Wrapper */}
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-850 p-5 rounded-2xl flex flex-col gap-4">
                 <div>
                   <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">Manual Backup</h4>
                   <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">Pilih "Lokal" untuk backup database ke server saja. Pilih "Drive" untuk upload file backup langsung ke akun Google Drive Anda.</p>
                 </div>
                 
                 <div className="flex gap-2">
                   <button
                     onClick={handleLocalBackupOnly}
                     disabled={isDriveSyncing}
                     className={`w-1/2 font-bold uppercase tracking-widest transition-all text-xs py-3 rounded-xl shadow-md ${isDriveSyncing ? 'bg-slate-300 dark:bg-slate-800 text-slate-50 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-700 text-white shadow-slate-200 dark:shadow-none'}`}
                   >
                     Backup Lokal Saja
                   </button>
                   <button
                     onClick={handleManualBackup}
                     disabled={isDriveSyncing}
                     className={`w-1/2 font-bold uppercase tracking-widest transition-all text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 ${isDriveSyncing ? 'bg-indigo-300 dark:bg-indigo-800 text-indigo-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'}`}
                   >
                     Backup ke Drive
                   </button>
                 </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-4">Riwayat Backup SQL & Drive</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 min-h-0 bg-white dark:bg-slate-900">
                 <table className="w-full text-left border-collapse custom-scrollbar text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                       <tr>
                          <th className="py-3 px-4 font-black uppercase tracking-widest text-[#8b9bb4]">Waktu Backup</th>
                          <th className="py-3 px-4 font-black uppercase tracking-widest text-[#8b9bb4]">Status</th>
                          <th className="py-3 px-4 font-black uppercase tracking-widest text-[#8b9bb4]">Detail / Keterangan</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {backupLogsInfo.length === 0 ? (
                          <tr>
                             <td colSpan={3} className="py-6 text-center text-slate-400 font-medium italic">Belum ada riwayat backup tercatat.</td>
                          </tr>
                       ) : backupLogsInfo.map((l: any) => (
                          <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                             <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap">{formatIDDateTime(l.created_at)}</td>
                             <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                                   l.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                   l.status === 'PARTIAL' ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' :
                                   'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                   {l.status}
                                </span>
                             </td>
                             <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{l.details}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>
        )}

        {adminSubTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col h-full min-h-0 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Daftar Pengguna & Akses</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">Manajemen Hak Akses Sistem</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Cari user..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={() => openUserModal()} className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Tambah User
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-grow min-h-0 border border-slate-100 dark:border-slate-800 rounded-xl custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 transition-colors">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('name')}>
                    <div className="flex items-center">Nama Pengguna <SortIcon column="name" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('role')}>
                    <div className="flex items-center">Role <SortIcon column="role" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('status')}>
                    <div className="flex items-center">Status <SortIcon column="status" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                {getSortedData(usersInfo.filter((u: any) => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.role.toLowerCase().includes(userSearchQuery.toLowerCase()))).map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{u.name}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">@{u.username}</span>
                            {u.phone && (
                              <span className="text-[10px] text-green-600 dark:text-green-500 font-bold flex items-center gap-0.5">
                                <span className="w-1 h-1 rounded-full bg-green-500 inline-block"></span>
                                {u.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${ u.role === 'Superadmin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50' : u.role === 'Admin' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' : u.role === 'Dokter' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700' }`}>{u.role}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className={`text-[10px] font-bold ${u.status === 'Active' ? 'text-green-700 dark:text-green-500' : 'text-slate-500 dark:text-slate-500'}`}>{u.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <ActionMenu 
                        actions={[
                          {
                            label: "Edit User",
                            icon: Edit2,
                            onClick: () => openUserModal(u)
                          },
                          {
                            label: "Hapus User",
                            icon: Trash2,
                            variant: 'danger',
                            onClick: () => deleteUser(u.id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {usersInfo.filter((u: any) => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.role.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-600 text-xs italic">Pengguna tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminSubTab === 'beds' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Manajemen Kapasitas Rawat Inap</h3>
              <button onClick={() => openBedModal()} className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-4 h-4" /> Tambah Bed
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bedsInfo.map((b: any) => (
                <div key={b.id} className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.room}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 font-mono mt-0.5">{b.class}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] border font-bold tracking-tight ${ b.status === 'TERISI' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' : b.status === 'KOSONG' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' : b.status === 'DIBERSIHKAN' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' }`}>{b.status}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-auto">
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> {b.id}</p>
                    <div className="flex gap-1">
                      <button onClick={() => openBedModal(b)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteBed(b.id)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {bedsInfo.length === 0 && <p className="text-slate-500 dark:text-slate-600 py-4 col-span-full italic">Tidak ada data bed.</p>}
            </div>
          </div>
        )}

        {adminSubTab === 'shifts' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col h-full min-h-0 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">Jadwal Shift Pegawai</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Alokasi Waktu Kerja Staf</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => openShiftModal()} className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none transition-all whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Alokasikan Shift
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-grow min-h-0 border border-slate-100 dark:border-slate-800 rounded-xl custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 transition-colors">
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('date')}>
                    <div className="flex items-center">Tanggal <SortIcon column="date" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('user')}>
                    <div className="flex items-center">Pegawai <SortIcon column="user" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => requestSort('shift')}>
                    <div className="flex items-center">Shift Tipe <SortIcon column="shift" sortConfig={sortConfig} /></div>
                  </th>
                  <th className="py-4 px-4 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-800/50 transition-colors">
                {getSortedData(shiftsInfo).map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-mono text-[10px] font-bold tracking-tight">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> 
                        {formatIDDate(s.date)}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-300 text-xs">{s.user}</td>
                    <td className="py-4 px-4">
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                        {s.shift}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <ActionMenu 
                        actions={[
                          {
                            label: "Edit Shift",
                            icon: Edit2,
                            onClick: () => openShiftModal(s)
                          },
                          {
                            label: "Hapus Shift",
                            icon: Trash2,
                            variant: 'danger',
                            onClick: () => deleteShift(s.id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {shiftsInfo.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-600 text-xs font-medium italic">Tidak ada jadwal shift terdaftar.</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {adminSubTab === 'billingMaster' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6 transition-colors">
            {/* Tariffs Master */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Master Tarif Tindakan</h3>
                <button onClick={() => openTariffModal()} className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors">
                  <Plus className="w-3 h-3" /> Tambah Tarif
                </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-4 font-semibold w-1/3">Nama Tindakan</th>
                      <th className="py-3 px-4 font-semibold">Kelas Pasien</th>
                      <th className="py-3 px-4 font-semibold">Tarif Dasar</th>
                      <th className="py-3 px-4 font-semibold">Akun COA Pendapatan</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {tariffsInfo.map((t: any) => {
                      const matchedCoa = coa.find((a: any) => String(a.id) === String(t.coa_account_id));
                      return (
                        <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{t.action_name}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-700">{t.patient_class}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold">
                            Rp {t.price.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                              {matchedCoa ? (
                                <span className="bg-emerald-50 dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-semibold">
                                  {matchedCoa.account_code} {matchedCoa.account_name}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">4-1000 Pendapatan Jasa Medis (Default)</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <ActionMenu 
                              actions={[
                                {
                                  label: "Edit Tarif",
                                  icon: Edit2,
                                  onClick: () => openTariffModal(t)
                                },
                                {
                                  label: "Hapus Tarif",
                                  icon: Trash2,
                                  variant: 'danger',
                                  onClick: () => deleteTariff(t.id)
                                }
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {tariffsInfo.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-slate-500 dark:text-slate-600 italic">Tidak ada master tarif.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Margins Master */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Master Margin Obat / BHP</h3>
                <button onClick={() => openMarginModal()} className="flex items-center gap-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-colors">
                  <Plus className="w-3 h-3" /> Tambah Margin
                </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-4 font-semibold">Kelas Pasien</th>
                      <th className="py-3 px-4 font-semibold">Persentase Margin</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {marginsInfo.map((m: any) => (
                      <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-700">{m.patient_class}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 dark:bg-purple-600" style={{ width: `${(m.margin_percentage / 50) * 100}%` }}></div>
                            </div>
                            <span className="text-purple-700 dark:text-purple-400 font-mono text-xs font-bold">{m.margin_percentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 flex justify-end gap-2 text-slate-400 dark:text-slate-500">
                          <button onClick={() => openMarginModal(m)} className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteMargin(m.id)} className="p-1.5 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {marginsInfo.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-slate-500 dark:text-slate-600 italic">Tidak ada konfigurasi margin.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
