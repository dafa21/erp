import React from 'react';
import { CalendarClock, ChevronRight, Users, Activity, MessageSquare, Pill, Tv } from 'lucide-react';

interface QueueTabProps {
  patientsInfo: any[];
  billingsData: any[];
  openPatientProfile: (patient: any) => void;
  triggerWhatsAppNotification: (patient: any) => void;
  handleProcessBilling: (patient: any) => void;
}

export default function QueueTab({
  patientsInfo,
  billingsData,
  openPatientProfile,
  triggerWhatsAppNotification,
  handleProcessBilling
}: QueueTabProps) {
  const openTVMonitor = () => {
    window.history.pushState(null, '', '/antrean-tv');
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="animate-in fade-in h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4 animate-in slide-in-from-top duration-300">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
             <CalendarClock className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Antrian Layanan</h2>
             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Traffic & Patient Flow Management</p>
           </div>
         </div>
               <button 
           onClick={openTVMonitor}
           className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/15 hover:shadow-lg text-white font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer active:scale-[0.98] border border-transparent shrink-0 shadow-md"
         >
           <Tv className="w-3.5 h-3.5" />
           <span>Buka Layar TV Antrean</span>
         </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
         {/* Waiting List */}
         <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Menunggu (Antrian)</h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white px-2 py-0.5 rounded-full text-[9px] font-black">{patientsInfo.filter(p => p.status === 'Menunggu').length}</span>
            </div>
            <div className="p-3 space-y-2.5 overflow-y-auto w-full flex flex-col custom-scrollbar">
              {patientsInfo.filter(p => p.status === 'Menunggu').map(p => (
                <div key={p.id} className={`shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${p.vitals?.triage_level === 'Merah' ? 'border-rose-300 dark:border-rose-900 animate-[pulse_2s_ease-in-out_infinite] shadow-rose-100 dark:shadow-none' : 'border-slate-100 dark:border-slate-700'}`} onClick={() => openPatientProfile(p)}>
                  {p.vitals?.triage_level === 'Merah' && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />}
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-black text-slate-800 dark:text-white text-sm">
                       {p.name}
                       {p.vitals?.triage_level === 'Merah' && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" title="Triage: Darurat (Merah)"></span>}
                     </h4>
                     <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">#{p.id.toString().padStart(4, '0')}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mb-3">{p.complaint || 'No complaint'}</p>
                  <div className="flex justify-between items-center">
                     <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-black rounded-lg uppercase tracking-wider">{p.gender}</span>
                     <button className="p-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              {patientsInfo.filter(p => p.status === 'Menunggu').length === 0 && (
                <div className="py-10 text-center flex flex-col justify-center items-center h-full opacity-30">
                  <Users className="w-8 h-8 mx-auto mb-2 dark:text-white" />
                  <p className="text-[10px] font-black uppercase dark:text-white">No patients waiting</p>
                </div>
              )}
            </div>
         </div>

         {/* In Action */}
         <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-400">Dalam Pemeriksaan</h3>
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-black">{patientsInfo.filter(p => p.status === 'Menunggu Dokter' || p.status === 'Diperiksa' || p.status === 'Dalam Pemeriksaan').length}</span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto w-full flex flex-col custom-scrollbar">
              {patientsInfo.filter(p => p.status === 'Menunggu Dokter' || p.status === 'Diperiksa' || p.status === 'Dalam Pemeriksaan').map(p => (
                <div key={p.id} className={`shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-md cursor-pointer relative overflow-hidden ${p.vitals?.triage_level === 'Merah' ? 'border-rose-400 dark:border-rose-800 animate-[pulse_2s_ease-in-out_infinite]' : 'border-indigo-200 dark:border-indigo-900'}`} onClick={() => openPatientProfile(p)}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${p.vitals?.triage_level === 'Merah' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-black text-slate-800 dark:text-white text-sm">
                       {p.name}
                       {p.vitals?.triage_level === 'Merah' && <span className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" title="Triage: Darurat (Merah)"></span>}
                     </h4>
                     <Activity className={`w-3 h-3 animate-pulse ${p.vitals?.triage_level === 'Merah' ? 'text-rose-500' : 'text-indigo-500'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-3 line-clamp-2">{p.complaint || 'No complaint'}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                     <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-black rounded-lg uppercase tracking-wider">{p.status === 'Menunggu Dokter' ? 'AWAITING DOCTOR' : 'SOAP ACTIVE'}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg uppercase tracking-wider">{p.age} thn</span>
                     </div>
                     <button 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         triggerWhatsAppNotification(p); 
                       }} 
                       className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-850/50 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm focus:outline-none"
                       title="Kirim Pesan WhatsApp Otomatis ke Dokter Shift"
                     >
                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                        <span>Notifikasi Dokter</span>
                     </button>
                  </div>
                </div>
              ))}
            </div>
         </div>

         {/* Billing/Pharmacy */}
         <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-500">Farmasi & Kasir</h3>
              <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black">{patientsInfo.filter(p => p.status === 'Selesai' && !billingsData.find(b => b.patient_id === p.id)).length}</span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto w-full flex flex-col custom-scrollbar">
              {patientsInfo.filter(p => p.status === 'Selesai' && !billingsData.find(b => b.patient_id === p.id)).map(p => (
                <div key={p.id} className="shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors" onClick={() => handleProcessBilling(p)}>
                  <h4 className="font-black text-slate-800 dark:text-white text-sm mb-1">{p.name}</h4>
                  <div className="flex items-center gap-2 mb-3">
                     <Pill className="w-3 h-3 text-emerald-500" />
                     <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ready for Pick-up</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleProcessBilling(p); }} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none">Proses Billing</button>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
