import { CalendarClock } from 'lucide-react';
import { AppointmentCalendar } from './AppointmentCalendar';

export function AppointmentsTab({
  appointments,
  patientsInfo,
  currentUser,
  fetchAppointments,
  triggerPatientWhatsAppNotification
}: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">Jadwal & Janji Temu</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
            <CalendarClock className="w-3 h-3 text-indigo-500" /> Kalender Jadwal Kontrol & Janji Temu Pasien Medik
          </p>
        </div>
      </header>

      <div className="flex-grow min-h-0">
        <AppointmentCalendar 
          appointments={appointments}
          patientsInfo={patientsInfo}
          currentUser={currentUser}
          onRefresh={fetchAppointments}
          onRemindPatient={triggerPatientWhatsAppNotification}
        />
      </div>
    </div>
  );
}
