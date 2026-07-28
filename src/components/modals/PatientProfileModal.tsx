import React from 'react';
import { X, User, CheckCircle, Clock, AlertTriangle, Calendar, Printer, History, Plus, Heart, ImageIcon, FileText, Settings, Stethoscope, ChevronRight, ClipboardList, Activity, Fingerprint, AlertCircle, MapPin, Search, Pill, Baby, Receipt, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIDDateTime, formatIDDate } from '../../utils/formatters';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function PatientProfileModal({
  modalType, setModalType,
  editingItem,
  patientProfileTab, setPatientProfileTab,
  patientHistoryData,
  historySearch, setHistorySearch,
  selectedVisit, setSelectedVisit,
  patientsInfo, generatePatientPDF,
  generateVisitSummaryPDF, printIndependentPrescription, fetchPatientHistory, currentUser, selectedPatientImages
}: any) {
  return (
    <>
      <AnimatePresence>
        {modalType === 'patientProfile' && editingItem && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-0 md:p-4 z-50 backdrop-blur-sm overflow-hidden">
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white dark:bg-slate-900 md:rounded-[24px] w-full max-w-5xl shadow-2xl flex flex-col h-full md:h-[80vh] overflow-hidden border border-transparent dark:border-slate-800">
                     <header className="relative shrink-0 overflow-hidden bg-[#0F172A] dark:bg-slate-950 p-4 md:p-5 flex items-center justify-between z-10 border-b border-indigo-900/30">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-inner">
                              <User className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h3 className="font-extrabold text-white text-lg md:text-xl uppercase tracking-tight">
                                    {editingItem.name}
                                 </h3>
                                 {editingItem.is_pregnant === 1 && (
                                    <span className="bg-pink-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                       BUMIL
                                    </span>
                                 )}
                              </div>
                              <div className="flex items-center gap-3 text-indigo-200 mt-0.5">
                                 <span className="text-[10px] font-mono flex items-center gap-1"><Fingerprint className="w-3 h-3" /> RM-{editingItem.rm_number || editingItem.id}</span>
                                 <span className="text-[10px] font-medium flex items-center gap-1"><Activity className="w-3 h-3" /> {editingItem.gender} • {editingItem.age} THN</span>
                              </div>
                           </div>
                        </div>
                        <button onClick={() => setModalType('none')} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-red-500 hover:text-white rounded-lg text-indigo-200 transition-colors">
                           <X className="w-4 h-4" />
                        </button>
                     </header>

                     <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
                        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 p-3 md:p-4 space-y-4">
                           <section>
                              <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
                                 <AlertCircle className="w-3 h-3" /> Informasi Triage
                              </h4>
                              <div className="space-y-2">
                                 <div className="bg-orange-50/50 dark:bg-orange-950/20 p-2.5 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                    <p className="text-[8px] font-bold text-orange-600 dark:text-orange-400 uppercase mb-0.5">Keluhan Utama</p>
                                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug">{editingItem.complaint || '-'}</p>
                                 </div>
                                 <div className="bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-0.5">Status Prioritas</p>
                                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug">{editingItem.status || '-'}</p>
                                 </div>
                                 <div className="bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                    <p className="text-[8px] font-bold text-rose-600 dark:text-rose-400 uppercase mb-0.5">Riwayat Alergi</p>
                                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-snug">{editingItem.allergies || 'Tidak Ada'}</p>
                                 </div>
                                 {selectedPatientImages.length > 0 && (
                                   <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                                     <p className="text-[8px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1"><ImageIcon className="w-2.5 h-2.5" /> Foto / Dokumen Awal</p>
                                     <div className="flex flex-col gap-2">
                                       {selectedPatientImages.map((img, idx) => (
                                         <a key={idx} href={img.image_data} target="_blank" rel="noopener noreferrer" className="block relative aspect-video rounded-md overflow-hidden hover:opacity-90 ring-1 ring-slate-200 dark:ring-slate-700 transition-opacity">
                                            <img src={img.image_data} alt={`File ${idx + 1}`} className="w-full h-full object-cover" />
                                         </a>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                              </div>
                           </section>
                           <section>
                              <h4 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1 mt-2">
                                 <MapPin className="w-3 h-3" /> Kontak & Alamat
                              </h4>
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                                 <div>
                                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5">Telepon</p>
                                    <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">{editingItem.phone || '-'}</p>
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5">Detail Alamat</p>
                                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-snug">{editingItem.address || '-'}</p>
                                 </div>
                              </div>
                           </section>
                        </aside>

                        <main className="flex-1 flex flex-col overflow-hidden relative">
                           <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm z-10 hidden-scrollbar overflow-x-auto">
                              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 flex-wrap">
                                 <button onClick={() => setPatientProfileTab('soap')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'soap' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-white'}`}>SOAP</button>
                                 <button onClick={() => setPatientProfileTab('vital')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'vital' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-white'}`}>Vital</button>
                                 <button onClick={() => setPatientProfileTab('resep')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'resep' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-purple-600 dark:hover:text-white'}`}>Resep</button>
                                 <button onClick={() => setPatientProfileTab('lab')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'lab' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 hover:text-orange-600 dark:hover:text-white'}`}>Lab & Rad</button>
                                 {editingItem.is_pregnant === 1 && (
                                   <button onClick={() => setPatientProfileTab('anc')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'anc' ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-500 hover:text-pink-600 dark:hover:text-white'}`}>ANC</button>
                                 )}
                                 <button onClick={() => setPatientProfileTab('billing')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'billing' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-amber-600 dark:hover:text-white'}`}>Billing</button>
                                 <button onClick={() => setPatientProfileTab('referral')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'referral' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-rose-600 dark:hover:text-white'}`}>Rujukan</button>
                                 <button onClick={() => setPatientProfileTab('qrcard')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${patientProfileTab === 'qrcard' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-blue-600 dark:hover:text-white'}`}>QR Card</button>
                              </div>
                              <button onClick={() => generatePatientPDF()} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors shrink-0">
                                 <Printer className="w-3.5 h-3.5" /> PDF
                              </button>
                           </div>

                           <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                              {!patientHistoryData ? (
                                 <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                                    <Activity className="w-8 h-8 animate-pulse mb-3" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Memuat Riwayat...</p>
                                 </div>
                              ) : (
                                 <div className="animate-in fade-in duration-300">
                                    {patientProfileTab === 'soap' && (
                                       <div className="space-y-4">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
                                             <div className="relative flex-1 group">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                <input type="text" placeholder="Cari rekam medis SOAP..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:bg-white dark:focus:bg-slate-750 focus:border-indigo-300 dark:focus:border-indigo-800 dark:text-white transition-colors" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
                                             </div>
                                             <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{patientHistoryData.soap.length}</span> Kunjungan
                                             </div>
                                          </div>
                                          
                                          {selectedVisit && (
                                             <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/35 shadow-md p-4 mb-6 relative overflow-hidden animate-in slide-in-from-top-4">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                                   <button onClick={() => generateVisitSummaryPDF(selectedVisit)} className="p-1.5 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors">
                                                      <Printer className="w-3.5 h-3.5" /> Cetak
                                                   </button>
                                                   <button onClick={() => setSelectedVisit(null)} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><X className="w-4 h-4" /></button>
                                                </div>
                                                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-4">{formatIDDateTime(selectedVisit.created_at)}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                   <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-transparent dark:border-slate-700/50"><span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Subjektif (S)</span><span className="text-slate-700 dark:text-slate-300">{selectedVisit.subjective || '-'}</span></div>
                                                   <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-transparent dark:border-slate-700/50"><span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Objektif (O)</span><span className="text-slate-700 dark:text-slate-300">{selectedVisit.objective || '-'}</span></div>
                                                   <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30"><span className="block text-[9px] font-bold text-indigo-400 dark:text-indigo-500 uppercase mb-1">Assessment (A)</span><span className="text-indigo-900 dark:text-indigo-300 font-medium">{selectedVisit.diagnosis || '-'}</span></div>
                                                   <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-transparent dark:border-slate-700/50"><span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Plan (P)</span><span className="text-slate-700 dark:text-slate-300">{selectedVisit.plan || '-'}</span></div>
                                                </div>
                                                {(selectedVisit.usg_image || selectedVisit.usg_image_notes) && (
                                                  <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                                                    <span className="block text-[9px] font-bold text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-1">
                                                      <ImageIcon className="w-3 h-3" /> Hasil USG / Pencitraan
                                                    </span>
                                                    {selectedVisit.usg_image_notes && <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{selectedVisit.usg_image_notes}</p>}
                                                    {selectedVisit.usg_image && (() => {
                                                      let images: string[] = [];
                                                      try { if (selectedVisit.usg_image.startsWith('[')) images = JSON.parse(selectedVisit.usg_image); else images = [selectedVisit.usg_image]; }
                                                      catch(e) { images = [selectedVisit.usg_image]; }
                                                      return (
                                                        <div className="flex flex-wrap gap-2">
                                                          {images.map((imgSrc, idx) => (
                                                            <img key={idx} src={imgSrc} alt="Lampiran USG" className="h-32 w-auto object-cover rounded-md border border-slate-200 dark:border-slate-800 shadow-sm" />
                                                          ))}
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                )}
                                             </div>
                                          )}

                                          <div className="space-y-3">
                                             {patientHistoryData.soap.filter((s: any) => !historySearch || [s.diagnosis, s.subjective, s.objective].some(str => (str||'').toLowerCase().includes(historySearch.toLowerCase()))).map((s: any, idx: number, arr: any[]) => (
                                                <button key={s.id} onClick={() => setSelectedVisit(s)} className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md dark:shadow-none transition-all flex flex-col md:flex-row md:items-center gap-3 md:gap-6 group outline-none">
                                                   <div className="shrink-0 w-auto md:w-32">
                                                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-[9px] font-mono mb-1">{s.created_at ? formatIDDate(s.created_at) : '-'}</span>
                                                      <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-300">Visit #{arr.length - idx}</p>
                                                   </div>
                                                   <div className="flex-1 min-w-0">
                                                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-0.5">Diagnosis / Observasi</p>
                                                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mb-1">{s.diagnosis || 'Tanpa Diagnosis'}</p>
                                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate italic">Keluhan: {s.subjective || '-'}</p>
                                                   </div>
                                                   <div className="shrink-0 items-center justify-center hidden md:flex w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                                   </div>
                                                </button>
                                             ))}
                                             {patientHistoryData.soap.length === 0 && (
                                                <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                   <ClipboardList className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                                   <p className="text-xs font-medium text-slate-500 dark:text-slate-600">Belum ada catatan SOAP</p>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    )}

                                    {patientProfileTab === 'vital' && (
                                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden whitespace-nowrap">
                                          <div className="overflow-x-auto">
                                             <table className="w-full text-left border-collapse">
                                                <thead>
                                                   <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                                                      <th className="py-3 px-4 font-semibold">Tanggal</th>
                                                      <th className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">Tensi (mmHg)</th>
                                                      <th className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">Nadi & Suhu</th>
                                                      <th className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">SpO2</th>
                                                      <th className="py-3 px-4 font-semibold">Fisik (BB/TB)</th>
                                                   </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                   {patientHistoryData.vitals.map((v: any) => (
                                                      <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                         <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">{v.created_at ? formatIDDate(v.created_at) : '-'}</td>
                                                         <td className="py-3 px-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{v.blood_pressure || '-'}</td>
                                                         <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400"><span className="font-semibold text-emerald-600 dark:text-emerald-500">{v.heart_rate || '-'} bpm</span> • {v.temperature || '-'}°C</td>
                                                         <td className="py-3 px-4 text-xs font-semibold text-blue-600 dark:text-blue-400">{v.oxygen_saturation || '-'}%</td>
                                                         <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-500">{v.weight || '-'}kg / {v.height || '-'}cm</td>
                                                      </tr>
                                                   ))}
                                                   {patientHistoryData.vitals.length === 0 && (
                                                      <tr>
                                                         <td colSpan={5} className="py-8 text-center text-xs text-slate-400 dark:text-slate-600">Log vital sign kosong.</td>
                                                      </tr>
                                                   )}
                                                </tbody>
                                             </table>
                                          </div>
                                       </div>
                                    )}

                                    
                                    {patientProfileTab === 'lab' && (
                                       <div className="space-y-6">
                                          {patientHistoryData.lab_orders?.map((lo: any, idx: number) => {
                                             const results = patientHistoryData.lab_results?.filter((r: any) => r.order_id === lo.id) || [];
                                             return (
                                                <div key={lo.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                                   <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                      <div>
                                                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{formatIDDateTime(lo.created_at)}</p>
                                                         <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{lo.test_name}</h4>
                                                         <p className="text-[10px] text-slate-500 font-medium mt-1">Oleh: Dr. {lo.doctor_name || '-'}</p>
                                                      </div>
                                                      <div className="shrink-0 flex items-center gap-2">
                                                        {lo.order_type === 'Radiologi' && <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-purple-50 text-purple-600 dark:bg-purple-900/30">Radiologi</span>}
                                                        {lo.order_type === 'Laboratorium' && <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-900/30">Laboratorium</span>}
                                                        
                                                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest ${lo.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30'}`}>
                                                          {lo.status}
                                                        </span>
                                                      </div>
                                                   </div>
                                                   {results.length > 0 ? (
                                                      <div className="p-0 overflow-x-auto">
                                                         <table className="w-full text-left border-collapse">
                                                            <thead>
                                                               <tr className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                  <th className="py-3 px-4">Parameter</th>
                                                                  <th className="py-3 px-4">Hasil</th>
                                                                  <th className="py-3 px-4">Nilai Rujukan</th>
                                                               </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                               {results.map((r: any) => (
                                                                  <tr key={r.id} className={`${r.is_abnormal ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'} transition-colors`}>
                                                                     <td className={`py-3 px-4 text-xs font-semibold ${r.is_abnormal ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{r.parameter_name}</td>
                                                                     <td className={`py-3 px-4 text-sm font-mono font-black ${r.is_abnormal ? 'text-red-600 dark:text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                                        {r.result_value} <span className="text-[10px] font-sans font-medium text-slate-400 ml-1">{r.unit}</span>
                                                                     </td>
                                                                     <td className="py-3 px-4 text-xs text-slate-500 font-mono">{r.reference_range} {r.unit}</td>
                                                                  </tr>
                                                               ))}
                                                            </tbody>
                                                         </table>
                                                      </div>
                                                   ) : (
                                                      <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                                                        Belum ada hasil yang diinputkan dari Lab.
                                                      </div>
                                                   )}
                                                </div>
                                             );
                                          })}
                                          {(!patientHistoryData.lab_orders || patientHistoryData.lab_orders.length === 0) && (
                                             <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                <Activity className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                                <p className="text-xs font-medium text-slate-500">Belum ada riwayat laboratorium atau radiologi</p>
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    {patientProfileTab === 'resep' && (
                                       <div className="space-y-4">
                                          <div className="flex justify-between items-center bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/40">
                                             <h5 className="font-bold text-[11px] text-purple-800 dark:text-purple-300 uppercase tracking-widest flex items-center gap-2"><Pill className="w-4 h-4" /> Manajemen Resep</h5>
                                             <div className="flex gap-2">
                                                <button onClick={() => printIndependentPrescription(patientHistoryData.prescriptions, 'a5', editingItem)} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-md text-[10px] font-bold uppercase hover:bg-purple-600 hover:text-white transition-colors">Cetak A5</button>
                                                <button onClick={() => printIndependentPrescription(patientHistoryData.prescriptions, 'a4', editingItem)} className="px-3 py-1.5 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-md text-[10px] font-bold uppercase hover:bg-purple-600 hover:text-white transition-colors">Cetak A4</button>
                                             </div>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                             {patientHistoryData.prescriptions.map((p: any) => (
                                                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                                                   <div className="mt-1 shrink-0 px-2 py-1 bg-purple-50 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400">
                                                      <Pill className="w-4 h-4" />
                                                   </div>
                                                   <div className="min-w-0 flex-1">
                                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{p.drug_name}</p>
                                                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">{p.dosage} • {p.quantity} Unit</p>
                                                      {p.instructions && <p className="text-[10px] mt-1 p-1.5 bg-slate-50 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 italic">"{p.instructions}"</p>}
                                                   </div>
                                                </div>
                                             ))}
                                             {patientHistoryData.prescriptions.length === 0 && (
                                                <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                   <p className="text-xs font-medium text-slate-500 dark:text-slate-600">Belum ada riwayat peresepan obat.</p>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    )}

                                    {patientProfileTab === 'anc' && editingItem.is_pregnant === 1 && (
                                       <div className="space-y-4">
                                          {patientHistoryData.anc?.length > 0 ? (
                                             <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-pink-900/30 p-4 rounded-xl shadow-sm">
                                                <div className="bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg mb-4 flex items-center gap-2">
                                                   <Baby className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                                                   <h5 className="font-bold text-[11px] text-pink-800 dark:text-pink-300 uppercase tracking-widest flex items-center gap-2 font-sans"><Baby className="w-4 h-4" /> Catatan Kehamilan Terakhir</h5>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                                                   <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                                                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 mb-1">Usia Kehamilan</span>
                                                      <span className="font-semibold text-slate-800 dark:text-slate-200">{patientHistoryData.anc[0].gestational_age || '-'} Mgg</span>
                                                   </div>
                                                   <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                                                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 mb-1">HPHT</span>
                                                      <span className="font-semibold text-slate-800 dark:text-slate-200">{patientHistoryData.anc[0].hpht || '-'}</span>
                                                   </div>
                                                   <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                                                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 mb-1">DJJ</span>
                                                      <span className="font-semibold text-pink-600 dark:text-pink-400">{patientHistoryData.anc[0].djj || '-'} x/m</span>
                                                   </div>
                                                   <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                                                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 mb-1">Estimasi Lahir (HPL)</span>
                                                      <span className="font-semibold text-slate-800 dark:text-slate-200">{patientHistoryData.anc[0].estimated_delivery_date || '-'}</span>
                                                   </div>
                                                </div>
                                                <div className="p-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-transparent dark:border-slate-700/50">
                                                   <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">Palpasi Leopold</span>
                                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                                                      <div><span className="text-slate-500 dark:text-slate-500 mr-1">L1:</span><span className="font-medium text-slate-700 dark:text-slate-300">{patientHistoryData.anc[0].leopold_1 || '-'}</span></div>
                                                      <div><span className="text-slate-500 dark:text-slate-500 mr-1">L2:</span><span className="font-medium text-slate-700 dark:text-slate-300">{patientHistoryData.anc[0].leopold_2 || '-'}</span></div>
                                                      <div><span className="text-slate-500 dark:text-slate-500 mr-1">L3:</span><span className="font-medium text-slate-700 dark:text-slate-300">{patientHistoryData.anc[0].leopold_3 || '-'}</span></div>
                                                      <div><span className="text-slate-500 dark:text-slate-500 mr-1">L4:</span><span className="font-medium text-slate-700 dark:text-slate-300">{patientHistoryData.anc[0].leopold_4 || '-'}</span></div>
                                                   </div>
                                                </div>
                                                <div className="mt-3 text-[10px] p-2 dark:text-slate-400">
                                                   <span className="font-semibold text-slate-500 dark:text-slate-400">Catatan Janin: </span> {patientHistoryData.anc[0].fetal_development || '-'}
                                                </div>
                                                
                                                {(patientHistoryData.anc[0].usg_bpd || patientHistoryData.anc[0].usg_tbj || patientHistoryData.anc[0].usg_image) && (
                                                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <span className="block text-[9px] font-bold text-indigo-500 dark:text-indigo-400 mb-3 uppercase tracking-widest flex items-center gap-1">
                                                      <Activity className="w-3 h-3" /> Hasil Angka USG
                                                    </span>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                                                      {patientHistoryData.anc[0].usg_bpd && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">BPD:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_bpd}</span></div>}
                                                      {patientHistoryData.anc[0].usg_hc && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">HC:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_hc}</span></div>}
                                                      {patientHistoryData.anc[0].usg_ac && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">AC:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_ac}</span></div>}
                                                      {patientHistoryData.anc[0].usg_fl && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">FL:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_fl}</span></div>}
                                                      {patientHistoryData.anc[0].usg_tbj && <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800/30"><span className="block text-[9px] text-indigo-500 font-bold uppercase tracking-widest mb-1">TBJ (EFW):</span> <span className="font-black text-indigo-700 dark:text-indigo-400">{patientHistoryData.anc[0].usg_tbj}</span></div>}
                                                      {patientHistoryData.anc[0].usg_afi && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">AFI:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_afi}</span></div>}
                                                      {patientHistoryData.anc[0].usg_placenta && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Placenta:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_placenta}</span></div>}
                                                      {patientHistoryData.anc[0].usg_presentation && <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700/50"><span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Posisi:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{patientHistoryData.anc[0].usg_presentation}</span></div>}
                                                    </div>
                                                    
                                                    {patientHistoryData.anc[0].usg_image && (() => {
                                                      let images: string[] = [];
                                                      try {
                                                        if (patientHistoryData.anc[0].usg_image.startsWith('[')) {
                                                          images = JSON.parse(patientHistoryData.anc[0].usg_image);
                                                        } else {
                                                          images = [patientHistoryData.anc[0].usg_image];
                                                        }
                                                      } catch(e) { images = [patientHistoryData.anc[0].usg_image]; }
                                                      
                                                      return (
                                                        <div className="mt-2">
                                                          <span className="block text-[9px] text-slate-400 mb-2 font-semibold uppercase">Lampiran Foto USG</span>
                                                          <div className="flex flex-wrap gap-2">
                                                            {images.map((imgSrc, idx) => (
                                                              <img key={idx} src={imgSrc} alt="Lampiran USG" className="h-32 w-auto object-cover rounded-md border border-slate-200 dark:border-slate-800 shadow-sm" />
                                                            ))}
                                                          </div>
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                )}
                                             </div>
                                          ) : (
                                             <div className="py-12 bg-pink-50/50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30 rounded-xl text-center">
                                                <Baby className="w-8 h-8 text-pink-200 dark:text-pink-900/50 mx-auto mb-2" />
                                                <p className="text-xs font-medium text-pink-600 dark:text-pink-500">Belum ada data ANC.</p>
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    {patientProfileTab === 'referral' && (
                                       <div className="space-y-4">
                                          {patientHistoryData?.referrals?.map((r: any) => (
                                             <div key={r.id} className="bg-white dark:bg-slate-900 border text-left border-rose-200 dark:border-rose-900/30 rounded-xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                                                <div className="flex justify-between items-start pl-2">
                                                   <div>
                                                      <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                         Rujukan: {r.destination_clinic}
                                                      </h5>
                                                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Dokter: {r.doctor_name || 'UMUM'} • Tujuan: {r.destination_doctor || '-'}</p>
                                                   </div>
                                                   <div className="flex flex-col items-end gap-2">
                                                       <select 
                                                         className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md outline-none border focus:ring-1 transition-colors ${r.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : r.status === 'Rejected' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}
                                                         value={r.status || 'Pending'}
                                                         onChange={async (e) => {
                                                            try {
                                                              const res = await fetch(`/api/referrals/${r.id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ status: e.target.value })
                                                              });
                                                              if (res.ok) {
                                                                 fetchPatientHistory(editingItem?.id);
                                                              }
                                                            } catch (err) {}
                                                         }}
                                                       >
                                                         <option value="Pending">Pending</option>
                                                         <option value="Accepted">Accepted</option>
                                                         <option value="Completed">Completed</option>
                                                         <option value="Rejected">Rejected</option>
                                                       </select>
                                                   </div>
                                                </div>
                                                <div className="pl-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                   <div className="space-y-2">
                                                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                         <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Alasan Rujukan</p>
                                                         <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{r.reason}</p>
                                                      </div>
                                                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                         <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Diagnosis & Terapi</p>
                                                         <p className="text-xs text-slate-700 dark:text-slate-300 mb-1"><span className="font-semibold">Dx:</span> {r.diagnosis || '-'}</p>
                                                         <p className="text-xs text-slate-700 dark:text-slate-300"><span className="font-semibold">Tx:</span> {r.treatment_given || '-'}</p>
                                                      </div>
                                                   </div>
                                                   <div className="flex flex-col h-full bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                                      <p className="text-[9px] font-black uppercase text-indigo-500 mb-2 tracking-widest">Feedback / Status Penerima</p>
                                                      <textarea 
                                                         placeholder="Tuliskan feedback dari RS tujuan (misal: Pasien sudah ditangani, butuh operasi lanjutan)..."
                                                         className="w-full flex-grow min-h-[80px] text-xs p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all dark:text-white"
                                                         defaultValue={r.feedback || ''}
                                                         onBlur={async (e) => {
                                                            if (e.target.value !== r.feedback) {
                                                              try {
                                                                const res = await fetch(`/api/referrals/${r.id}`, {
                                                                  method: 'PATCH',
                                                                  headers: { 'Content-Type': 'application/json' },
                                                                  body: JSON.stringify({ feedback: e.target.value })
                                                                });
                                                                if (res.ok) fetchPatientHistory(editingItem?.id);
                                                              } catch(err) {}
                                                            }
                                                         }}
                                                      />
                                                      <p className="text-[9px] text-slate-400 mt-2 text-right">Data otomatis tersimpan saat tidak fokus</p>
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                          {(!patientHistoryData?.referrals || patientHistoryData.referrals.length === 0) && (
                                             <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                                                <FileText className="w-8 h-8 text-rose-200 dark:text-rose-900/30 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada rujukan</p>
                                                <p className="text-xs text-slate-500 mt-1">Pasien ini belum pernah dirujuk ke faskes lain.</p>
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    {patientProfileTab === 'billing' && (
                                       <div className="space-y-3">
                                          {patientHistoryData.billings.map((b: any) => (
                                             <div key={b.id} className="bg-white dark:bg-slate-900 border text-left border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm">
                                                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg self-start sm:self-center">
                                                   <Receipt className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                   <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none mb-1 text-left">INV-{b.id.toString().padStart(6, '0')}</p>
                                                   <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 text-left">{b.created_at ? formatIDDate(b.created_at) : '-'}</p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                   <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1">Rp {b.total_amount?.toLocaleString() || 0}</p>
                                                   <div className="flex sm:justify-end gap-2">
                                                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-bold uppercase">{b.payment_method}</span>
                                                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold uppercase">Lunas</span>
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                          {patientHistoryData.billings.length === 0 && (
                                             <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                <Banknote className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-600">Tidak ada riwayat tagihan/invoice.</p>
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    {patientProfileTab === 'qrcard' && editingItem && (
                                       <div className="flex flex-col items-center justify-center space-y-6">
                                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl max-w-sm w-full relative overflow-hidden">
                                             <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                                             <div className="text-center mb-6 mt-2">
                                                <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg uppercase tracking-widest">{currentUser?.clinic_name || 'Klinik'}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kartu Registrasi Pasien</p>
                                             </div>
                                             
                                             <div className="flex justify-center mb-6 bg-white p-4 rounded-xl shadow-inner border border-slate-100">
                                                <QRCodeCanvas 
                                                   id="patient-qr-canvas"
                                                   value={editingItem.rm_number || editingItem.id.toString().padStart(6, '0')} 
                                                   size={160}
                                                   level={"H"}
                                                   includeMargin={false}
                                                   fgColor={"#0f172a"}
                                                />
                                             </div>
                                             
                                             <div className="text-center space-y-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">{editingItem.name}</h4>
                                                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">RM: #{editingItem.rm_number || editingItem.id.toString().padStart(6, '0')}</p>
                                                {editingItem.phone && <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{editingItem.phone}</p>}
                                             </div>
                                          </div>
                                          
                                          <button 
                                             onClick={() => {
                                                const canvas = document.getElementById('patient-qr-canvas') as HTMLCanvasElement;
                                                if (!canvas) return;
                                                const imgData = canvas.toDataURL('image/png');
                                                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 85.6] });
                                                doc.rect(0, 0, 54, 85.6, 'F');
                                                doc.setFillColor(255, 255, 255);
                                                
                                                // Blue header
                                                doc.setFillColor(37, 99, 235);
                                                doc.rect(0, 0, 54, 4, 'F');
                                                
                                                doc.setFont("helvetica", "bold");
                                                doc.setFontSize(10);
                                                doc.setTextColor(30, 41, 59);
                                                const cName = currentUser?.clinic_name || 'Klinik';
                                                doc.text(cName.toUpperCase(), 27, 12, { align: "center" });
                                                
                                                doc.setFontSize(6);
                                                doc.setTextColor(148, 163, 184);
                                                doc.text("KARTU REGISTRASI PASIEN", 27, 15, { align: "center" });
                                                
                                                doc.addImage(imgData, 'PNG', 12, 19, 30, 30);
                                                
                                                doc.setFontSize(9);
                                                doc.setTextColor(30, 41, 59);
                                                doc.text(editingItem.name, 27, 55, { align: "center" });
                                                
                                                doc.setFont("courier", "normal");
                                                doc.setFontSize(8);
                                                doc.setTextColor(100, 116, 139);
                                                doc.text(`RM: ${editingItem.rm_number || editingItem.id.toString().padStart(6, '0')}`, 27, 60, { align: "center" });
                                                
                                                if (editingItem.phone) {
                                                   doc.setFont("helvetica", "italic");
                                                   doc.setFontSize(6);
                                                   doc.text(editingItem.phone, 27, 64, { align: "center" });
                                                }
                                                
                                                doc.save(`QR_Card_${editingItem.rm_number || editingItem.id.toString().padStart(6, '0')}.pdf`);
                                             }}
                                             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                                          >
                                             <Printer className="w-4 h-4" /> Cetak Kartu QR (.PDF)
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        </main>
                     </div>
                  </motion.div>
               </motion.div>
            )}
        </AnimatePresence>

    </>
  );
}
