import { Users, CheckCircle, CalendarClock, Stethoscope, ChevronRight, CalendarDays, Pill } from 'lucide-react';

interface DoctorDashboardTabProps {
  currentUser: any;
  patientsInfo: any[];
  appointments: any[];
  setActiveTab: (tab: string) => void;
  setPatientSearchQuery: (query: string) => void;
  openSoapModal: (p: any) => void;
  formatIDDate: (dateString: string) => string;
}

export function DoctorDashboardTab({
  currentUser,
  patientsInfo,
  appointments,
  setActiveTab,
  setPatientSearchQuery,
  openSoapModal,
  formatIDDate
}: DoctorDashboardTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col p-2 max-w-6xl mx-auto w-full">
      <header className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Dashboard Medis</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Selamat datang, dr. {currentUser?.name}. Berikut ringkasan aktivitas Anda hari ini.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">Antrean Menunggu</h3>
            </div>
          </div>
          <div className="text-4xl font-black text-indigo-700 dark:text-indigo-400">
            {patientsInfo.filter((p: any) => p.status === 'Menunggu Cek Dokter' && (currentUser?.role === 'Superadmin' || p.handled_by === currentUser?.name || !p.handled_by)).length}
          </div>
          <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-2 font-medium">Pasien siap diperiksa saat ini</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-300">Selesai Hari Ini</h3>
            </div>
          </div>
          <div className="text-4xl font-black text-emerald-700 dark:text-emerald-400">
            {patientsInfo.filter((p: any) => p.status === 'Selesai Tindakan' && (currentUser?.role === 'Superadmin' || p.handled_by === currentUser?.name)).length}
          </div>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-2 font-medium">Telah melalui proses SOAP</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-300">Janji Temu Hari Ini</h3>
            </div>
          </div>
          <div className="text-4xl font-black text-blue-700 dark:text-blue-400">
            {appointments.filter((a: any) => (currentUser?.role === 'Superadmin' || a.doctor_id === currentUser?.id?.toString() || a.doctor_id === currentUser?.name)).length}
          </div>
          <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-2 font-medium">Jadwal reservasi konsultasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm"><Stethoscope className="w-4 h-4 text-indigo-500" /> Pasien Membutuhkan Perhatian</h3>
            <button onClick={() => setActiveTab('doctorSOAP')} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Lihat Semua di SOAP &rarr;</button>
          </div>
          <div className="overflow-auto p-2 custom-scrollbar">
            {patientsInfo.filter((p: any) => p.status === 'Menunggu Cek Dokter' && (currentUser?.role === 'Superadmin' || p.handled_by === currentUser?.name || !p.handled_by)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">Tidak ada pasien yang menunggu saat ini.</div>
            ) : (
              <div className="space-y-2">
                 {patientsInfo.filter((p: any) => p.status === 'Menunggu Cek Dokter' && (currentUser?.role === 'Superadmin' || p.handled_by === currentUser?.name || !p.handled_by)).slice(0, 5).map((p: any) => (
                    <div key={p.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex justify-between items-center cursor-pointer group" onClick={() => { setActiveTab('doctorSOAP'); setPatientSearchQuery(p.name); openSoapModal(p); }}>
                       <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p.name} {p.priority === 'High' && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Urgent</span>}</h4>
                          <p className="text-xs text-slate-500 mt-1">RM: {p.record_id} • Keluhan: {p.complaint?.substring(0,40)}...</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm"><CalendarDays className="w-4 h-4 text-blue-500" /> Jadwal Reservasi</h3>
            <button onClick={() => setActiveTab('appointments')} className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">KelKelola &rarr;</button>
          </div>
          <div className="overflow-auto p-2 custom-scrollbar flex-grow">
            {appointments.filter((a: any) => (currentUser?.role === 'Superadmin' || a.doctor_id === currentUser?.id?.toString() || a.doctor_id === currentUser?.name)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">Belum ada jadwal reservasi dibuat untuk Anda.</div>
            ) : (
              <div className="space-y-2">
                 {appointments.filter((a: any) => (currentUser?.role === 'Superadmin' || a.doctor_id === currentUser?.id?.toString() || a.doctor_id === currentUser?.name)).slice(0, 5).map((a: any) => (
                    <div key={a.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[10px] bg-slate-200 dark:bg-slate-700 w-fit px-2 py-0.5 rounded">{formatIDDate(a.appointment_date)} • Pukul {a.appointment_time}</h4>
                         <span className="text-[9px] uppercase font-black tracking-widest text-[#8b9bb4]">
                           {a.status}
                         </span>
                       </div>
                       <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.title}</p>
                       {a.notes && <p className="text-[10px] text-slate-500 italic mt-0.5">{a.notes}</p>}
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm"><Pill className="w-4 h-4 text-emerald-500" /> Riwayat Resep / SOAP Selesai</h3>
            <button onClick={() => setActiveTab('doctorSOAP')} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Semua Riwayat &rarr;</button>
          </div>
          <div className="overflow-auto p-2 custom-scrollbar flex-grow">
            {patientsInfo.filter((p: any) => p.status === 'Selesai Tindakan' && (currentUser?.role === 'Superadmin' || p.handled_by === currentUser?.name)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">Belum ada pasien selesai hari ini.</div>
            ) : (
              <div className="space-y-2">
                 {patientsInfo.filter((p: any) => p.status === 'Selesai Tindakan' && (currentUser?.role === 'Superadmin' || p.handled_by === currentUser?.name)).slice(0, 5).map((p: any) => (
                    <div key={p.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 flex flex-col gap-1.5 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors" onClick={() => { setActiveTab('doctorSOAP'); setPatientSearchQuery(p.name); openSoapModal(p); }}>
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] group-hover:text-emerald-600 transition-colors">{p.name}</h4>
                         <span className="text-[8px] uppercase font-black tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                           Selesai
                         </span>
                       </div>
                       <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Dx: {p.soap?.diagnosis || 'Belum diisi'}</p>
                       {p.soap?.medication && <p className="text-[9px] text-slate-500 italic mt-0.5">{p.soap?.medication}</p>}
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
