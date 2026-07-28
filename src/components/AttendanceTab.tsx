import { CalendarDays, Building2, Download, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceTabProps {
  currentUser: any;
  attendanceMonth: string;
  setAttendanceMonth: (m: string) => void;
  attendanceFilterClinic: string;
  setAttendanceFilterClinic: (c: string) => void;
  clinicsInfo: any[];
  exportAttendancePDF: () => void;
  fetchAttendances: () => void;
  fetchUsers: () => void;
  usersInfo: any[];
  attendancesData: any[];
  setSelectedAttendanceUser: (u: any) => void;
  setModalType: (t: string | null) => void;
  setSelectedAttendanceDay: (d: any) => void;
  formatIDTime: (d: string) => string;
}

export function AttendanceTab({
  currentUser,
  attendanceMonth,
  setAttendanceMonth,
  attendanceFilterClinic,
  setAttendanceFilterClinic,
  clinicsInfo,
  exportAttendancePDF,
  fetchAttendances,
  fetchUsers,
  usersInfo,
  attendancesData,
  setSelectedAttendanceUser,
  setModalType,
  setSelectedAttendanceDay,
  formatIDTime
}: AttendanceTabProps) {
  return (
    <div className="animate-in fade-in h-full flex flex-col pt-2 max-w-7xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 shrink-0 px-2 gap-4">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg mb-3">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Riwayat Absensi</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Log absensi kehadiran staff menggunakan verifikasi wajah dan GPS.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <input 
            type="month"
            value={attendanceMonth}
            onChange={e => setAttendanceMonth(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none h-[36px] sm:h-auto"
          />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 flex items-center shadow-sm h-[36px] sm:h-auto min-w-[150px]">
            <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select 
              value={attendanceFilterClinic} 
              onChange={e => setAttendanceFilterClinic(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none appearance-none"
            >
              <option value="all">Semua Klinik</option>
              {clinicsInfo.map((clinic: any) => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
          <button onClick={exportAttendancePDF} className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 hover:dark:bg-emerald-900/60 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-sm transition-all focus:outline-none">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => { fetchAttendances(); fetchUsers(); }} className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-sm transition-all focus:outline-none">
            <Activity className="w-4 h-4" /> Refresh
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4 px-6 border-r border-slate-100 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-950 z-20 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]">TANGGAL</th>
                {(() => {
                  const [y, m] = attendanceMonth.split('-');
                  const daysInMonth = new Date(parseInt(y), parseInt(m), 0).getDate();
                  return Array.from({length: daysInMonth}, (_, i) => i + 1).map(day => (
                    <th key={day} className="p-4 px-2 text-center border-r border-slate-100 dark:border-slate-800 min-w-[70px]">{day}</th>
                  ));
                })()}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersInfo.filter(u => attendanceFilterClinic === 'all' || String(u.clinic_id) === String(attendanceFilterClinic)).map(user => {
                const [y, m] = attendanceMonth.split('-');
                const daysInMonth = new Date(parseInt(y), parseInt(m), 0).getDate();
                const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td 
                      onClick={() => {
                        setSelectedAttendanceUser(user);
                        setModalType('attendanceUserDetail');
                      }}
                      className="p-4 px-6 border-r border-slate-100 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{user.name}</span><br/>
                      <span className="text-[10px] font-medium text-slate-500">{user.role}</span>
                    </td>
                    {daysArray.map(day => {
                      const dayAttendances = attendancesData.filter((a: any) => {
                        const d = new Date(a.created_at);
                        const aMonth = (d.getMonth() + 1).toString().padStart(2, '0');
                        const aYear = d.getFullYear();
                        return a.user_id === user.id && d.getDate() === day && `${aYear}-${aMonth}` === attendanceMonth;
                      });
                      
                      const masuk = dayAttendances.find((a: any) => a.type === 'Masuk');
                      const keluar = dayAttendances.find((a: any) => a.type === 'Keluar');
                      
                      return (
                        <td 
                          key={day} 
                          onClick={() => {
                            if (dayAttendances.length > 0) {
                              setSelectedAttendanceDay({ user, date: `${attendanceMonth}-${String(day).padStart(2, '0')}`, attendances: dayAttendances });
                              setModalType('attendanceDayDetail');
                            }
                          }}
                          className={`p-2 border-r border-slate-100 dark:border-slate-800 text-center align-top relative group ${dayAttendances.length > 0 ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors' : ''}`}>
                          <div className="flex flex-col gap-1 items-center justify-center h-full min-h-[40px]">
                            {masuk ? (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded block w-full truncate ${masuk.status === 'Hadir' ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30'}`} title={`Masuk: ${formatIDTime(masuk.created_at)}`}>
                                M: {formatIDTime(masuk.created_at)}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-300 dark:text-slate-600">-</span>
                            )}
                            
                            {keluar ? (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded block w-full truncate ${keluar.status === 'Hadir' ? 'text-indigo-700 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30' : 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30'}`} title={`Keluar: ${formatIDTime(keluar.created_at)}`}>
                                K: {formatIDTime(keluar.created_at)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {usersInfo.filter(u => attendanceFilterClinic === 'all' || String(u.clinic_id) === String(attendanceFilterClinic)).length === 0 && (
                <tr>
                  <td colSpan={32} className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                    Belum ada data staf yang ditampilkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
