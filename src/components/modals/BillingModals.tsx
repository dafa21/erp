import React from 'react';
import { X, Receipt, Printer, Edit2, History, AlertCircle, Plus, FileText, Download, Trash2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIDDateTime, formatIDDate } from '../../utils/formatters';

export function BillingModals({
  modalType, setModalType,
  selectedInvoice,
  billingsData, patientsInfo, usersInfo,
  generateInvoicePDF,
  setEditingItem,
  billingForm, setBillingForm, saveBilling,
  drugsInfo,
  printFormat, setPrintFormat, isSponsorCovered, setIsSponsorCovered,
  currentUser, clinicsInfo, groupedPatients, tariffsInfo, coa, calculateTotalBilling
}: any) {
  return (
    <>
      {modalType === 'invoiceDetail' && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 no-print">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                      <Receipt className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight">Kuitansi Pembayaran</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">#INV-{selectedInvoice.id.toString().padStart(6, '0')}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                      <button 
                         onClick={() => setPrintFormat('a4')}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${printFormat === 'a4' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                      >
                         A4
                      </button>
                      <button 
                         onClick={() => setPrintFormat('thermal')}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${printFormat === 'thermal' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                      >
                         Thermal
                      </button>
                   </div>
                   <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 no-print shadow-sm z-10 relative">
                 <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <input type="checkbox" checked={isSponsorCovered} onChange={(e) => setIsSponsorCovered(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900" />
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Ditanggung Sponsor</span>
                 </label>
              </div>
              
              <div className={`overflow-y-auto custom-scrollbar flex-grow bg-white dark:bg-slate-900 ${printFormat === 'thermal' ? 'px-4 py-6 text-[10px]' : 'p-8'}`}>
                <div id="print-area" className={`${printFormat === 'a4' ? 'print-a4' : 'print-thermal'} dark:text-slate-900`}>
                   {/* Header Kuitansi */}
                   <div className={`text-center border-b border-slate-100 dark:border-slate-800 ${printFormat === 'thermal' ? 'pb-4 mb-4' : 'pb-8 mb-8'}`}>
                      
 

                      <h2 className={`${printFormat === 'thermal' ? 'text-sm' : 'text-xl'} font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter`}>{currentUser?.clinic_name || 'NURHEALTH CONNECTION'}</h2>
                      <p className={`${printFormat === 'thermal' ? 'text-[8px]' : 'text-[10px]'} text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-relaxed`}>
                         Jl. Raya Terusan Jakarta No. 123, Bandung<br/>
                         Telp: (022) 123-4567
                      </p>
                   </div>

                   {/* Info Pasien */}
                   <div className={`grid ${printFormat === 'thermal' ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-6'} text-[11px]`}>
                      <div className="space-y-1">
                         <p className={`${printFormat === 'thermal' ? 'text-[7px]' : 'text-[10px]'} font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest`}>Diterima Dari:</p>
                         <p className={`${printFormat === 'thermal' ? 'text-xs' : 'text-sm'} font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight`}>{selectedInvoice.patient_name}</p>
                         <p className="font-bold text-slate-500 dark:text-slate-400">RM-{selectedInvoice.patient_id || '-'}</p>
                      </div>
                      <div className={`${printFormat === 'thermal' ? 'text-left' : 'text-right'} space-y-1`}>
                         <p className={`${printFormat === 'thermal' ? 'text-[7px]' : 'text-[10px]'} font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest`}>Waktu:</p>
                         <p className={`${printFormat === 'thermal' ? 'text-[9px]' : 'text-sm'} font-bold text-slate-800 dark:text-slate-100`}>{formatIDDateTime(selectedInvoice.created_at)}</p>
                         <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[8px] font-black rounded-lg uppercase">LUNAS</span>
                      </div>
                   </div>

                   {/* Rincian Items */}
                   <div className={printFormat === 'thermal' ? 'mt-4' : 'mt-8'}>
                      <table className="w-full">
                         <thead>
                            <tr className={`${printFormat === 'thermal' ? 'text-[8px]' : 'text-[10px]'} font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800`}>
                               <th className="py-2 text-left">Deskripsi</th>
                               <th className="py-2 text-right">Total</th>
                            </tr>
                         </thead>
                         <tbody className={`${printFormat === 'thermal' ? 'text-[9px]' : 'text-[11px]'} font-medium text-slate-700 dark:text-slate-200`}>
                            {selectedInvoice.items.map((item: any, idx: number) => (
                               <tr key={idx} className="border-b border-slate-50">
                                  <td className="py-3 font-bold">{item.description}</td>
                                  <td className="py-3 text-right font-mono">Rp {item.amount.toLocaleString('id-ID')}</td>
                               </tr>
                            ))}
                         </tbody>
                         <tfoot>
                            <tr className="text-slate-900 dark:text-white border-t-2 border-slate-900">
                               <td className={`py-4 font-black uppercase ${printFormat === 'thermal' ? 'text-xs' : 'text-sm'}`}>Total</td>
                               <td className={`py-4 text-right font-mono font-black ${printFormat === 'thermal' ? 'text-sm' : 'text-lg'}`}>Rp {isSponsorCovered ? '0' : selectedInvoice.total_amount.toLocaleString('id-ID')}</td>
                            </tr>
                            {isSponsorCovered && (
                               <tr className="text-emerald-600 dark:text-emerald-400">
                                  <td colSpan={2} className={`py-2 text-right italic font-bold ${printFormat === 'thermal' ? 'text-[9px]' : 'text-xs'}`}>
                                     Telah dibayar oleh {(clinicsInfo.find(c => String(c.id) === String(selectedInvoice.clinic_id)) || clinicsInfo.find(c => String(c.id) === String(currentUser?.clinic_id)))?.sponsor_name || 'Sponsor'}
                                  </td>
                               </tr>
                            )}
                         </tfoot>
                      </table>
                   </div>

                   {/* Footer Kuitansi */}
                   <div className={`${printFormat === 'thermal' ? 'mt-6 text-center' : 'mt-12 flex justify-between items-end'} border-t border-slate-100 dark:border-slate-800 pt-6`}>
                      <div className={`${printFormat === 'thermal' ? 'mb-4' : 'max-w-[250px]'} text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl italic`}>
                         * Bukti pembayaran sah digital.
                      </div>
                      
                     {(() => {
                         let parsed = [];
                         try {
                           const active = clinicsInfo.find(c => String(c.id) === String(selectedInvoice?.clinic_id || currentUser?.clinic_id));
                           if (active?.sponsor_logo) {
                               parsed = active.sponsor_logo.startsWith('[') ? JSON.parse(active.sponsor_logo) : [active.sponsor_logo];
                           }
                         } catch(e) {}
                         if(parsed.length === 0) return null;
                         return (
                             <div className="flex justify-start items-center gap-4 mb-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                {parsed.map((lg, idx) => (
                                   <img key={idx} src={lg} alt="Logo" className={printFormat === 'thermal' ? 'h-8 object-contain grayscale mix-blend-multiply dark:mix-blend-normal' : 'h-12 object-contain mix-blend-multiply dark:mix-blend-normal'} />
                                ))}
                             </div>
                         );
                     })()}

                      <div className={printFormat === 'thermal' ? 'text-center' : 'text-center px-8'}>
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-12 uppercase tracking-[0.2em]">Kasir</p>
                         <div className="w-32 h-0.5 bg-slate-100 dark:bg-slate-800 mx-auto mb-1"></div>
                         <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{currentUser?.name}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3 shrink-0 no-print">
                 <button 
                  onClick={generateInvoicePDF}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                 >
                    <Download className="w-4 h-4" /> Simpan PDF ({printFormat === 'a4' ? 'A4' : 'Thermal'})
                 </button>
                 <button 
                  onClick={() => window.print()} 
                  className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
                 >
                    <Printer className="w-4 h-4" /> Print Langsung
                 </button>
                 <button onClick={() => setModalType('none')} className="sm:flex-none flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                    Tutup
                 </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
        {modalType === 'billing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Receipt className="w-5 h-5 text-blue-600" /> Buat Kuitansi Pembayaran</h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={saveBilling} className="p-5 overflow-y-auto flex-grow custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama Pasien</label>
                    <select 
                      required 
                      value={billingForm.patient_id || ''} 
                      onChange={e => {
                        const pId = parseInt(e.target.value);
                        const p = groupedPatients.find(p => p.id === pId);
                        setBillingForm({...billingForm, patient_id: p?.id || null, patient_name: p?.name || ''})
                      }} 
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>Pilih Pasien...</option>
                      {groupedPatients.map((p: any) => (
                        <option value={p.id} key={p.id}>{p.name} (RM: #{p.rm_number || p.id.toString().padStart(6, '0')})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Kelas Perawatan</label>
                    <select required value={billingForm.patient_class} onChange={e => setBillingForm({...billingForm, patient_class: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Reguler">Reguler</option>
                      <option value="Kelas 3">Kelas 3</option>
                      <option value="Kelas 2">Kelas 2</option>
                      <option value="Kelas 1">Kelas 1</option>
                      <option value="VIP">VIP</option>
                      <option value="VVIP">VVIP</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4 flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Rincian Tindakan / Obat</h4>
                  <button type="button" onClick={() => setBillingForm({...billingForm, items: [...billingForm.items, {description: '', amount: 0}]})} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase tracking-widest hover:bg-blue-100 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Tambah Baris
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  {billingForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                      <select onChange={e => {
                        const val = e.target.value;
                        if (!val) return;
                        const tariff = tariffsInfo.find(t => t.id === Number(val));
                        if (tariff) {
                          const newItems = [...billingForm.items];
                          newItems[index].description = tariff.action_name;
                          newItems[index].amount = tariff.price;
                          setBillingForm({...billingForm, items: newItems})
                        }
                        e.target.value = ''; // Reset
                      }} className="w-full sm:w-32 px-2 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">+ Dari Master</option>
                        {tariffsInfo.filter(t => t.patient_class === billingForm.patient_class || t.patient_class === 'Reguler').map(t => (
                          <option key={t.id} value={t.id}>{t.action_name} - Rp{t.price.toLocaleString('id-ID')}</option>
                        ))}
                      </select>
                      <input required value={item.description} onChange={e => {
                        const newItems = [...billingForm.items];
                        newItems[index].description = e.target.value;
                        setBillingForm({...billingForm, items: newItems})
                      }} type="text" className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Misal: Biaya Pendaftaran / Paracetamol" />
                      <input required value={item.amount || ''} onChange={e => {
                        const newItems = [...billingForm.items];
                        newItems[index].amount = Number(e.target.value);
                        setBillingForm({...billingForm, items: newItems})
                      }} type="number" min="0" className="w-full sm:w-32 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rp" />
                      <button type="button" onClick={() => {
                        const newItems = [...billingForm.items];
                        newItems.splice(index, 1);
                        setBillingForm({...billingForm, items: newItems});
                      }} className="text-red-400 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-lg shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {billingForm.items.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada rincian tindakan ditambahkan.</p>}
                </div>

                <div className="flex gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex-1 flex gap-4">
                     <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Metode Pembayaran</label>
                        <select value={billingForm.payment_method} onChange={e => setBillingForm({...billingForm, payment_method: e.target.value})} className="w-full max-w-[200px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                           <option value="Cash">Tunai (Cash)</option>
                           <option value="Credit Card">Kartu Kredit</option>
                           <option value="Debit Card">Debit / Transfer</option>
                           <option value="BPJS">ASURANSI / BPJS</option>
                        </select>
                     </div>
                     <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Rekening / Akun Penerima</label>
                        <select value={billingForm.payment_account_id} onChange={e => setBillingForm({...billingForm, payment_account_id: e.target.value})} className="w-full max-w-[200px] px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                           <option value="">-- Pilih Akun --</option>
                           {coa.filter((c: any) => c.account_code.startsWith('1.1.1') || c.account_code.startsWith('1.1.2')).map((c: any) => (
                              <option key={c.id} value={c.id} disabled={c.level !== 'Child'} className={c.level !== 'Child' ? 'font-bold bg-slate-100 text-slate-500' : 'pl-4 text-slate-800'}>{c.account_code} - {c.account_name}</option>
                           ))}
                        </select>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity mb-2">
                       <input type="checkbox" checked={isSponsorCovered} onChange={(e) => setIsSponsorCovered(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white" />
                       <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Ditanggung Sponsor</span>
                    </label>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">Total Kuitansi</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">Rp {isSponsorCovered ? '0' : calculateTotalBilling().toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6 shrink-0">
                  <button type="button" onClick={() => setModalType('none')} className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Simpan & Cetak Kuitansi
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

    </>
  );
}
