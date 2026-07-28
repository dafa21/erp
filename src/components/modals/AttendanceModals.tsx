import React from 'react';
import { X, UserCog, Camera, MapPin as MapPinIcon, LogOut } from 'lucide-react';
import { formatIDDate, formatIDTime } from '../../utils/formatters';

export function AttendanceModals({
  modalType, setModalType,
  selectedAttendanceUser, attendancesData, attendanceMonth,
  selectedAttendanceDay
}: any) {
  return (
    <>
      {modalType === 'attendanceUserDetail' && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
                <UserCog className="w-5 h-5 text-indigo-500" /> Profil & Riwayat Absen
              </h3>
              <button onClick={() => setModalType('none')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {selectedAttendanceUser && (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                   <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg uppercase tracking-tight">
                      {selectedAttendanceUser.name.substring(0,2)}
                   </div>
                   <div>
                      <h4 className="font-bold text-lg">{selectedAttendanceUser.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{selectedAttendanceUser.role} • {selectedAttendanceUser.status}</p>
                   </div>
                </div>
              )}
              
              <div>
                 <h5 className="font-bold text-sm tracking-widest uppercase mb-4 text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Riwayat Detail (Bulan Ini)</h5>
                 <div className="space-y-4">
                   {attendancesData.filter((a: any) => a.user_id === selectedAttendanceUser?.id && a.created_at.startsWith(attendanceMonth)).length === 0 && (
                      <p className="text-slate-500 text-sm italic py-4 text-center">Belum ada absen di bulan terpilih.</p>
                   )}
                   {attendancesData.filter((a: any) => a.user_id === selectedAttendanceUser?.id && a.created_at.startsWith(attendanceMonth)).map((attn: any) => {
                      const isWarning = attn.status !== 'Hadir';
                      return (
                      <div key={attn.id} className={`flex gap-4 items-start p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${isWarning ? 'border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-100 dark:border-slate-800'}`}>
                         {attn.photo_url ? (
                            <img src={attn.photo_url} alt="Absen" className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700" />
                         ) : (
                            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                               <Camera className="w-6 h-6 text-slate-300" />
                            </div>
                         )}
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                               <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${attn.type === 'Masuk' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                  {attn.type}
                               </span>
                               <span className="font-mono text-[10px] text-slate-400">{formatIDDate(attn.created_at)}</span>
                            </div>
                            <h6 className="font-bold text-sm mb-1">{formatIDTime(attn.created_at)}</h6>
                            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                               <span className={`px-1.5 py-0.5 rounded ${!isWarning ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-transparent dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 text-red-600 border border-red-100 dark:bg-transparent dark:border-red-800 dark:text-red-400'}`}>{attn.status}</span>
                               <span className="font-mono">{attn.distance ? attn.distance.toFixed(1) + 'm' : '-'}</span>
                            </div>
                         </div>
                      </div>
                   )})}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalType === 'attendanceDayDetail' && selectedAttendanceDay && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <h3 className="font-black text-lg tracking-tight flex flex-col">
                Detail Harian
                <span className="text-[10px] text-slate-400 font-medium tracking-normal mt-1">{formatIDDate(selectedAttendanceDay.date)}</span>
              </h3>
              <button onClick={() => setModalType('none')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-950/20">
              <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-tight">
                    {selectedAttendanceDay.user?.name.substring(0,2)}
                 </div>
                 <div className="leading-tight">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedAttendanceDay.user?.name}</p>
                    <p className="text-[10px] font-medium text-slate-500">{selectedAttendanceDay.user?.role}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 {/* Masuk Section */}
                 {(() => {
                    const masuk = selectedAttendanceDay.attendances.find((a: any) => a.type === 'Masuk');
                    if (!masuk) return null;
                    const isWarning = masuk.status !== 'Hadir';
                    return (
                       <div className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm ${isWarning ? 'border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-900/10">
                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" /> Masuk</span>
                             <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{formatIDTime(masuk.created_at)}</span>
                          </div>
                          <div className="p-4 flex flex-col gap-3">
                             {masuk.photo_url ? (
                                <img src={masuk.photo_url} alt="Masuk" className="w-full aspect-[4/3] object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
                             ) : (
                                <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 border-dashed">
                                   <Camera className="w-8 h-8 text-slate-300" />
                                </div>
                             )}
                             <div className="flex gap-2 text-xs font-medium">
                                <span className={`px-2 py-1 rounded w-full text-center ${!isWarning ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>{masuk.status}</span>
                                <span className="px-2 py-1 rounded w-full text-center bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono">Radius: {masuk.distance ? masuk.distance.toFixed(1) + 'm' : '-'}</span>
                             </div>
                          </div>
                       </div>
                    );
                 })()}

                 {/* Keluar Section */}
                 {(() => {
                    const keluar = selectedAttendanceDay.attendances.find((a: any) => a.type === 'Keluar');
                    if (!keluar) return null;
                    const isWarning = keluar.status !== 'Hadir';
                    return (
                       <div className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm ${isWarning ? 'border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50/50 dark:bg-amber-900/10">
                             <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /> Keluar</span>
                             <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{formatIDTime(keluar.created_at)}</span>
                          </div>
                          <div className="p-4 flex flex-col gap-3">
                             {keluar.photo_url ? (
                                <img src={keluar.photo_url} alt="Keluar" className="w-full aspect-[4/3] object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
                             ) : (
                                <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 border-dashed">
                                   <Camera className="w-8 h-8 text-slate-300" />
                                </div>
                             )}
                             <div className="flex gap-2 text-xs font-medium">
                                <span className={`px-2 py-1 rounded w-full text-center ${!isWarning ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>{keluar.status}</span>
                                <span className="px-2 py-1 rounded w-full text-center bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono">Radius: {keluar.distance ? keluar.distance.toFixed(1) + 'm' : '-'}</span>
                             </div>
                          </div>
                       </div>
                    );
                 })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
