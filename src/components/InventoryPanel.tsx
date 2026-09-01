import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PackageOpen, Plus, Search, MapPin, Tag, ArrowRightLeft, Trash2, Edit2, Building2, TrendingUp, AlertTriangle, CheckCircle2, Box, Upload, Download } from 'lucide-react';
import { Pagination } from './Pagination';
import { formatIDDate } from '../lib/dateUtils';
import * as XLSX from 'xlsx';

export default function InventoryPanel({ clinicId, currentUser, clinics = [] }: { clinicId: number | null | undefined, currentUser: any, clinics?: any[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState<string>(clinicId ? String(clinicId) : 'all');
  
  const [coa, setCoa] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null as null|number,
    clinic_id: clinicId || '',
    item_code: '',
    name: '',
    category: 'Alat Medis',
    condition: 'Baik',
    quantity: 0,
    unit: 'Pcs',
    location: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 0,
    notes: '',
    generate_journal: false,
    asset_coa_id: '',
    payment_account_id: '',
    expense_coa_id: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        'Nama Aset': 'Kursi Roda',
        'Kode Barang (Opsional)': 'INV-001',
        'Kategori': 'Alat Medis',
        'Kondisi': 'Baik',
        'Jumlah': 5,
        'Satuan': 'Pcs',
        'Lokasi': 'Gudang 1',
        'Harga Beli Satuan': 500000,
        'Tanggal Beli (YYYY-MM-DD)': '2024-01-01',
        'Catatan': 'Pembelian baru'
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Inventaris');
    XLSX.writeFile(wb, 'template_inventaris.xlsx');
  };

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
        
        const res = await fetch('/api/inventory/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            items: data,
            clinic_id: selectedClinicId !== 'all' ? selectedClinicId : (clinicId || '')
          }),
        });
        
        if (res.ok) {
          const resData = await res.json();
          alert(`Berhasil mengupload ${resData.count} aset!`);
          fetchItems();
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

  const targetClinicFilter = selectedClinicId !== 'all' ? selectedClinicId : (clinicId || '');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?clinicId=${targetClinicFilter}&role=${currentUser?.role || ''}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      
      const coaRes = await fetch('/api/coa');
      if(coaRes.ok) {
        const coaData = await coaRes.json();
        setCoa(Array.isArray(coaData) ? coaData : []);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
      setCoa([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [clinicId, currentUser, selectedClinicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemToSubmit = {
         ...formData,
         clinic_id: formData.clinic_id ? Number(formData.clinic_id) : (clinicId || null)
      };

      if (formData.id) {
        await fetch(`/api/inventory/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemToSubmit)
        });
      } else {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemToSubmit)
        });
      }
      setShowForm(false);
      resetForm();
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, clinic_id: clinicId || (selectedClinicId !== 'all' ? selectedClinicId : ''), item_code: '', name: '', category: 'Alat Medis', condition: 'Baik', quantity: 0, unit: 'Pcs', location: '', purchase_date: new Date().toISOString().split('T')[0], purchase_price: 0, notes: '', generate_journal: false, asset_coa_id: '', payment_account_id: '', expense_coa_id: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus barang ini dari inventaris?')) return;
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };
  
  const filteredItems = (Array.isArray(items) ? items : []).filter(i => 
    (i.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (i.item_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const totalAssets = filteredItems.length;
    const totalValue = filteredItems.reduce((acc, curr) => acc + ((curr.purchase_price * curr.quantity) || 0), 0);
    const goodCondition = filteredItems.filter(i => i.condition === 'Baik').length;
    const brokenItems = totalAssets - goodCondition;
    
    return { totalAssets, totalValue, goodCondition, brokenItems };
  }, [filteredItems]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mb-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <PackageOpen className="w-5 h-5" />
               </div>
               Manajemen Inventaris
            </h2>
            <p className="text-sm text-slate-500 mt-2">Kelola aset, alat medis, farmasi, ATK, dan perlengkapan lainnya.</p>
         </div>
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
           {!clinicId && currentUser?.role === 'Superadmin' && !showForm && (
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select 
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none w-full"
                >
                  <option value="all">Semua Cabang Klinik</option>
                  {clinics?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
             </div>
           )}
           {!showForm && (
             <>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                  title="Download Template Excel"
                >
                  <Download className="w-4 h-4" /> Template
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
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" /> {isUploading ? 'Loading...' : 'Upload Excel'}
                </button>
             </>
           )}
           <button 
             onClick={() => {
                resetForm();
                setShowForm(!showForm);
             }}
             className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all"
           >
             {showForm ? 'Kembali ke Daftar' : <><Plus className="w-4 h-4" /> Beli / Tambah Aset</>}
           </button>
         </div>
      </div>

      {showForm ? (
         <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none max-w-4xl mx-auto w-full mb-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
               <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
               </div>
               <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-slate-200">
                    {formData.id ? 'Perbarui Informasi Aset' : 'Registrasi Aset Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Formulir Perekaman Data</p>
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
               {!clinicId && currentUser?.role === 'Superadmin' && (
                 <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 mb-2">
                    <label className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">Penempatan Klinik / Cabang *</label>
                    <select required value={formData.clinic_id} onChange={e => setFormData({...formData, clinic_id: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold transition-shadow">
                       <option value="" disabled>-- Pilih Cabang Klinik --</option>
                       {clinics?.map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                 </div>
               )}
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kode Barang (Opsional)</label>
                  <input type="text" value={formData.item_code} onChange={e => setFormData({...formData, item_code: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" placeholder="Contoh: INV-001" />
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Barang *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" required placeholder="Nama alat/barang" />
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors cursor-pointer">
                     <option>Alat Medis / Klinis</option>
                     <option>Peralatan Elektronik IT</option>
                     <option>Furniture / Mebel / Interior</option>
                     <option>ATK & Administrasi</option>
                     <option>Bahan Habis Pakai Non-Medis</option>
                     <option>Lainnya</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kondisi Fisik Saat Ini</label>
                  <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors cursor-pointer font-medium">
                     <option>Baik</option>
                     <option>Rusak Ringan</option>
                     <option>Rusak Berat / Afkir</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah</label>
                     <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" min="0" required />
                  </div>
                  <div className="space-y-1.5">
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Satuan</label>
                     <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" placeholder="Contoh: Pcs, Unit" required />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lokasi Penempatan</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" placeholder="Contoh: Poli Umum, Gudang" />
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Pengadaan</label>
                  <input type="date" value={formData.purchase_date} onChange={e => setFormData({...formData, purchase_date: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors cursor-pointer" />
               </div>
               <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harga Beli Satuan (Rp)</label>
                  <input type="number" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors" min="0" placeholder="0" />
               </div>
               <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan Tambahan Spesifikasi</label>
                  <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm h-28 resize-none outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors leading-relaxed" placeholder="Masukkan pabrikan, tipe, SN (Serial Number) atau keterangan lainnya..."></textarea>
               </div>
               
               <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 mt-2 space-y-4">
                 <h4 className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2 border-b border-indigo-100 dark:border-indigo-800/50 pb-2">Integrasi Akuntansi (COA)</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Akun Persediaan / Aset / HPP</label>
                     <select 
                       value={formData.asset_coa_id || ''} 
                       onChange={(e) => setFormData({...formData, asset_coa_id: e.target.value})}
                       className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                     >
                       <option value="">-- Pilih Akun Aset / HPP --</option>
                       {(Array.isArray(coa) ? coa : []).filter(a => a.account_code?.startsWith('1') || a.account_code?.startsWith('5')).map(a => (
                         <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Akun Beban / Penyusutan</label>
                     <select 
                       value={formData.expense_coa_id || ''} 
                       onChange={(e) => setFormData({...formData, expense_coa_id: e.target.value})}
                       className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                     >
                       <option value="">-- Pilih Akun Beban --</option>
                       {(Array.isArray(coa) ? coa : []).filter(a => a.account_type === 'Expense' && a.level === 'Child').map(a => (
                         <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                       ))}
                     </select>
                   </div>
                 </div>
               </div>

               {!formData.id && (
                 <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                   <label className="flex items-center gap-2 cursor-pointer mb-4">
                     <input 
                       type="checkbox" 
                       checked={formData.generate_journal} 
                       onChange={(e) => setFormData({...formData, generate_journal: e.target.checked})}
                       className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                     />
                     <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Catat Pembelian ini ke Jurnal Keuangan Automatis</span>
                   </label>
                   
                   {formData.generate_journal && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                       <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Akun Pembayaran Kas/Bank (Kredit)</label>
                          <select 
                            value={formData.payment_account_id || ''} 
                            onChange={(e) => setFormData({...formData, payment_account_id: e.target.value})}
                            className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                          >
                            <option value="">-- Pilih Akun Kas --</option>
                            {(Array.isArray(coa) ? coa : []).filter(a => a.account_code?.startsWith('1.1.1') && a.level === 'Child').map(a => (
                              <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                            ))}
                          </select>
                       </div>
                     </div>
                   )}
                 </div>
               )}

               <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">Batal</button>
                  <button type="submit" className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all focus:ring-4 focus:ring-indigo-500/20 active:scale-95">Simpan Data Aset</button>
               </div>
            </form>
         </div>
      ) : (
         <div className="flex flex-col gap-6 h-full pb-8">
            {/* Stats Area */}
            {!loading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aset</span>
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <PackageOpen className="w-4 h-4" />
                       </div>
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white font-mono">{stats.totalAssets}</div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kondisi Baik</span>
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                       </div>
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white font-mono">{stats.goodCondition}</div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perlu Perbaikan</span>
                       <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-4 h-4" />
                       </div>
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white font-mono">{stats.brokenItems}</div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Nilai</span>
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="w-4 h-4" />
                       </div>
                    </div>
                    <div className="text-xl font-black text-slate-800 dark:text-white font-mono text-emerald-600 dark:text-emerald-400">
                       Rp {stats.totalValue.toLocaleString('id-ID')}
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[400px]">
               <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="relative max-w-md">
                     <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="text" 
                       value={search} 
                       onChange={e => setSearch(e.target.value)} 
                       placeholder="Cari berdasarkan nama, kode, atau kategori barang..." 
                       className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                     />
                  </div>
               </div>
               
               <div className="overflow-x-auto flex-1">
                  {loading ? (
                     <div className="flex flex-col justify-center items-center h-full min-h-[300px]">
                       <div className="animate-spin text-indigo-500 mb-4"><PackageOpen className="w-8 h-8" /></div>
                       <p className="text-slate-500 text-sm font-medium">Memuat data inventaris...</p>
                     </div>
                  ) : filteredItems.length === 0 ? (
                     <div className="flex flex-col justify-center items-center h-full min-h-[300px] text-slate-400">
                       <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                         <PackageOpen className="w-10 h-10 opacity-30" />
                       </div>
                       <p className="text-base font-bold text-slate-600 dark:text-slate-400">Buku registrasi aset kosong.</p>
                       <p className="text-sm mt-1">Belum ada barang yang didaftarkan atau tidak sesuai filter pencarian.</p>
                     </div>
                  ) : (
                     <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                           <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                              <th className="px-6 py-4 font-bold">Identifikasi Barang / Aset</th>
                              <th className="px-6 py-4 font-bold">Kategori & Penempatan</th>
                              <th className="px-6 py-4 font-bold">Kuantitas & Kondisi</th>
                              <th className="px-6 py-4 font-bold text-right">Nilai Harga Beli</th>
                              <th className="px-6 py-4 font-bold text-center">Tindakan</th>
                           </tr>
                        </thead>
                        <tbody className="align-top">
                           {filteredItems
                              .slice((currentPage - 1) * 10, currentPage * 10)
                              .map(item => (
                              <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div className="font-black text-base text-slate-900 dark:text-white capitalize mb-1">
                                       {item.name}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                       <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 font-bold">{item.item_code || 'Tanpa Kode'}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                           <Tag className="w-3 h-3 text-slate-400" /> 
                                        </div>
                                        {item.category}
                                     </div>
                                     <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 mb-2">
                                        <MapPin className="w-3.5 h-3.5" /> {item.location || 'Lokasi Belum Diset'}
                                     </div>
                                     {(!clinicId && currentUser?.role === 'Superadmin') && (
                                        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-widest">
                                           <Building2 className="w-3 h-3" />
                                           {clinics?.find(c => c.id === item.clinic_id)?.name || 'Multi/Unknown'}
                                        </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="flex flex-col gap-2 items-start">
                                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-mono font-bold text-sm rounded-lg border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                                           {item.quantity} {item.unit}
                                        </div>
                                        <div className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest shadow-sm ${item.condition === 'Baik' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : item.condition === 'Rusak Ringan' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'}`}>
                                           <div className={`w-1.5 h-1.5 rounded-full ${item.condition === 'Baik' ? 'bg-emerald-500' : item.condition === 'Rusak Ringan' ? 'bg-orange-500' : 'bg-rose-500'}`} />
                                           {item.condition}
                                        </div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700 dark:text-slate-300 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                       <span>{item.purchase_price > 0 ? `Rp ${item.purchase_price.toLocaleString('id-ID')}` : '-'}</span>
                                       {item.purchase_date && <span className="text-[10px] font-sans font-medium text-slate-400">Per: {formatIDDate(item.purchase_date)}</span>}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => {
                                         setFormData(item);
                                         setShowForm(true);
                                       }} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg shadow-sm transition-all" title="Edit Data"><Edit2 className="w-4 h-4" /></button>
                                       <button onClick={() => handleDelete(item.id)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg shadow-sm transition-all" title="Hapus Barang"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
               <Pagination 
                  totalItems={filteredItems.length}
                  itemsPerPage={10}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  className="rounded-b-[24px] border-x border-b border-slate-200 dark:border-slate-800"
               />
            </div>
         </div>
      )}
    </div>
  );
}
