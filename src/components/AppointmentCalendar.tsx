import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Trash2, 
  Edit,
  AlertCircle,
  Baby,
  Heart,
  Eye,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Phone,
  Syringe
} from 'lucide-react';
import { Pagination } from './Pagination';
import { formatIDDate } from '../lib/dateUtils';

const IMMUNIZATION_SCHEDULE = [
  { month: 0, name: 'Hepatitis B0', label: 'Saat Lahir' },
  { month: 0, name: 'BCG', label: '0-1 Bulan' },
  { month: 0, name: 'Polio 0', label: '0-1 Bulan' },
  { month: 2, name: 'DPT-HB-Hib 1', label: '2 Bulan' },
  { month: 2, name: 'Polio 1', label: '2 Bulan' },
  { month: 2, name: 'PCV 1', label: '2 Bulan' },
  { month: 2, name: 'Rotavirus 1', label: '2 Bulan' },
  { month: 3, name: 'DPT-HB-Hib 2', label: '3 Bulan' },
  { month: 3, name: 'Polio 2', label: '3 Bulan' },
  { month: 3, name: 'PCV 2', label: '3 Bulan' },
  { month: 3, name: 'Rotavirus 2', label: '3 Bulan' },
  { month: 4, name: 'DPT-HB-Hib 3', label: '4 Bulan' },
  { month: 4, name: 'Polio 3', label: '4 Bulan' },
  { month: 4, name: 'IPV', label: '4 Bulan' },
  { month: 4, name: 'PCV 3', label: '4 Bulan' },
  { month: 9, name: 'Campak Rubella (MR)', label: '9 Bulan' },
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const date = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${date}`;
};

const toDateString = (y: number, m: number, dNum: number) => {
  const tempDate = new Date(y, m, dNum);
  const yearPart = tempDate.getFullYear();
  const monthPart = (tempDate.getMonth() + 1).toString().padStart(2, '0');
  const dayPart = tempDate.getDate().toString().padStart(2, '0');
  return `${yearPart}-${monthPart}-${dayPart}`;
};

interface AppointmentCalendarProps {
  appointments: any[];
  patientsInfo: any[];
  currentUser: any;
  onRefresh: () => void;
  onRemindPatient?: (patient: any, dateText: string, title: string) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  patientsInfo,
  currentUser,
  onRefresh,
  onRemindPatient
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Left Sidebar tab state: 'appointments' or 'recommendations'
  const [sidebarTab, setSidebarTab] = useState<'appointments' | 'recommendations'>('appointments');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  
  // Detail views for ANC checkups
  const [selectedAncDetail, setSelectedAncDetail] = useState<any | null>(null);
  
  // Day details view
  const [selectedDayDetails, setSelectedDayDetails] = useState<{date: string, dateStr: string, appointments: any[]} | null>(null);

  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [recommendationsPage, setRecommendationsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [form, setForm] = useState({
    patient_id: '',
    title: '',
    appointment_date: getTodayDateString(),
    appointment_time: '09:00',
    notes: '',
    status: 'Scheduled'
  });
  
  const [formError, setFormError] = useState('');

  // Selected Patient inside Form
  const selectedPatientInForm = useMemo(() => {
    return patientsInfo.find(p => String(p.id) === String(form.patient_id)) || null;
  }, [form.patient_id, patientsInfo]);

  // Extract follow-up and return visit schedules recommended by clinical staff
  const followupRecommendations = useMemo(() => {
    const list: any[] = [];
    if (!Array.isArray(patientsInfo)) return list;

    patientsInfo.forEach((p: any) => {
      // 1. SOAP regular recommendations
      if (p.soap && p.soap.followup_recommendations && p.soap.followup_recommendations.trim()) {
        list.push({
          id: `rec-soap-${p.id}`,
          patient: p,
          type: 'Rekomendasi SOAP Dokter',
          title: `Kontrol - ${p.soap.diagnosis || 'Pemeriksaan Umum'}`,
          dateText: 'Sesuai Saran SOAP',
          text: p.soap.followup_recommendations,
          is_anc: false,
          details: p.soap,
        });
      }

      // 2. ANC prenatal checkup date prediction
      if (p.is_pregnant === 1 && p.anc && p.anc.next_checkup_date) {
        list.push({
          id: `rec-anc-${p.id}`,
          patient: p,
          type: 'Kontrol Kembali ANC',
          title: 'Kontrol Kembali Kehamilan',
          dateText: p.anc.next_checkup_date,
          text: p.anc.fetal_development ? `Janin: ${p.anc.fetal_development}` : 'Pemeriksaan rutin berkala',
          is_anc: true,
          details: p.anc,
        });
      }
    });

    return list;
  }, [patientsInfo]);

  // Extract and construct virtual checkup schedules for pregnant patients (ANC)
  const ancAppointments = useMemo(() => {
    const list: any[] = [];
    if (!Array.isArray(patientsInfo)) return list;
    
    patientsInfo.forEach((p: any) => {
      if (p.is_pregnant === 1 && p.anc) {
        // 1. Next control checkup schedule inside anc table
        if (p.anc.next_checkup_date) {
          list.push({
            id: `anc-checkup-${p.id}`,
            patient_id: p.id,
            patient_name: p.name,
            patient_rm: p.rm_number || p.id.toString().padStart(6, '0'),
            title: `Kontrol Kembali ANC`,
            appointment_date: p.anc.next_checkup_date,
            appointment_time: '08:00',
            notes: `Jadwal Pengembalian Kontrol Kehamilan. UK saat ini: ${p.anc.gestational_age || '-'} Minggu.`,
            status: 'Scheduled',
            is_anc: true,
            anc_details: p.anc,
            patient: p
          });
        }
        // 2. Projected delivery date (HPL)
        if (p.anc.estimated_delivery_date) {
          list.push({
            id: `anc-hpl-${p.id}`,
            patient_id: p.id,
            patient_name: p.name,
            patient_rm: p.rm_number || p.id.toString().padStart(6, '0'),
            title: `Perkiraan Lahir (HPL)`,
            appointment_date: p.anc.estimated_delivery_date,
            appointment_time: '00:00',
            notes: `Hari Perkiraan Lahir (HPL) untuk Ibu Hamil. HPHT: ${p.anc.hpht || '-'}, Gestasi Terakhir: ${p.anc.gestational_age || '-'} Minggu.`,
            status: 'Scheduled',
            is_hpl: true,
            anc_details: p.anc,
            patient: p
          });
        }
      }
    });
    return list;
  }, [patientsInfo]);

  // Extract and construct virtual checkup schedules for child immunizations
  const immunizationAppointments = useMemo(() => {
    const list: any[] = [];
    if (!Array.isArray(patientsInfo)) return list;

    patientsInfo.forEach((p: any) => {
      if (p.children && Array.isArray(p.children)) {
        p.children.forEach((child: any) => {
          if (!child.birth_date) return;

          IMMUNIZATION_SCHEDULE.forEach((sched: any) => {
            // Compute expected date: child.birth_date + sched.month months
            const birth = new Date(child.birth_date);
            // Adding months cleanly
            birth.setMonth(birth.getMonth() + sched.month);

            const yearPart = birth.getFullYear();
            const monthPart = (birth.getMonth() + 1).toString().padStart(2, '0');
            const dayPart = birth.getDate().toString().padStart(2, '0');
            const appointmentDateStr = `${yearPart}-${monthPart}-${dayPart}`;

            // Check if this child has already been administered this vaccine
            const givenVaccines = (child.immunizations || []).map((imm: any) => imm.vaccine_name.toLowerCase());
            const isGiven = givenVaccines.some((vName: string) => 
              vName.includes(sched.name.toLowerCase()) || sched.name.toLowerCase().includes(vName)
            );

            list.push({
              id: `immunization-sched-${child.id}-${sched.name}`,
              patient_id: p.id, // parent's patient id for permission verification
              patient_name: `Anak ${child.name} (Ibu: ${p.name})`,
              patient_rm: p.rm_number || p.id.toString().padStart(6, '0'),
              title: `Rencana Imunisasi: ${sched.name}`,
              appointment_date: appointmentDateStr,
              appointment_time: '08:30',
              notes: `Jadwal imunisasi wajib ${sched.label}. Nama Anak: ${child.name}, Lahir: ${child.birth_date}, Berat Lahir: ${child.birth_weight || '-'} kg. Status: ${isGiven ? 'Sudah Diberikan ✅' : 'Belum Diberikan ⏰'}.`,
              status: isGiven ? 'Completed' : 'Scheduled',
              is_immunization: true,
              is_given: isGiven,
              child: child,
              vaccine_name: sched.name,
              patient: p
            });
          });
        });
      }
    });

    return list;
  }, [patientsInfo]);

  // Combine real database appointments with dynamic virtual ANC appointments and child immunization schedules
  const allMergedAppointments = useMemo(() => {
    // If there is any real appointment for patient_id on appointment_date, do not show the virtual one
    const filteredAnc = (ancAppointments || []).filter((anc: any) => {
      const hasReal = (appointments || []).some((real: any) => 
        String(real.patient_id) === String(anc.patient_id) && 
        real.appointment_date === anc.appointment_date
      );
      return !hasReal;
    });

    const combined = [...(appointments || []), ...filteredAnc, ...immunizationAppointments];

    // Guarantee no duplicates of the same patient on the same date reach the UI list
    const seenMap = new Map<string, any>();
    combined.forEach((item: any) => {
      if (!item.patient_id) {
        seenMap.set(`non-patient-${item.id}`, item);
        return;
      }
      
      let key = '';
      if (item.is_immunization) {
        key = `immunization_${item.id}`; // Always keep all immunization schedules distinct!
      } else if (item.is_hpl) {
        key = `hpl_${item.id}`; // Always keep HPL distinct from normal mother checkup appointments!
      } else {
        key = `${item.patient_id}_${item.appointment_date}`;
      }

      const existing = seenMap.get(key);
      if (!existing) {
        seenMap.set(key, item);
      } else {
        // Prioritize actual appointments over virtual trackers, and active over cancelled
        const existingIsVirtual = !!existing.is_anc || !!existing.is_hpl || !!existing.is_immunization;
        const currentIsVirtual = !!item.is_anc || !!item.is_hpl || !!item.is_immunization;
        
        let shouldReplace = false;
        if (existingIsVirtual && !currentIsVirtual) {
          shouldReplace = true;
        } else if (existing.status === 'Cancelled' && item.status !== 'Cancelled') {
          shouldReplace = true;
        }
        
        if (shouldReplace) {
          seenMap.set(key, item);
        }
      }
    });

    return Array.from(seenMap.values());
  }, [appointments, ancAppointments, immunizationAppointments]);

  // Search and Filter records list
  const filteredAppointments = useMemo(() => {
    return allMergedAppointments.filter(appt => {
      const matchSearch = 
        appt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.patient_rm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || appt.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [allMergedAppointments, searchQuery, statusFilter]);

  // Search and Filter recommendations list
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery.trim()) return followupRecommendations;
    const query = searchQuery.toLowerCase();
    return followupRecommendations.filter(rec => 
      rec.patient.name.toLowerCase().includes(query) ||
      (rec.patient.rm_number && rec.patient.rm_number.toLowerCase().includes(query)) ||
      rec.text.toLowerCase().includes(query) ||
      rec.type.toLowerCase().includes(query)
    );
  }, [followupRecommendations, searchQuery]);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (appointmentsPage - 1) * ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, appointmentsPage]);

  const paginatedRecommendations = useMemo(() => {
    const startIndex = (recommendationsPage - 1) * ITEMS_PER_PAGE;
    return filteredRecommendations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRecommendations, recommendationsPage]);

  // Reset pagination on filter or tab change
  React.useEffect(() => {
    setAppointmentsPage(1);
    setRecommendationsPage(1);
  }, [searchQuery, statusFilter, sidebarTab]);

  // Calendar Logic helper
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week index for 1st of month

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  // Generate days array
  const calendarDays = useMemo(() => {
    const days: { date: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    
    // Previous month filler days
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: toDateString(year, month - 1, prevMonthDaysCount - i),
        dayNum: prevMonthDaysCount - i,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: toDateString(year, month, i),
        dayNum: i,
        isCurrentMonth: true
      });
    }

    // Next month filler days (to make nice grid rows)
    const totalSlots = 42; // 6 rows * 7 days
    const nextDaysNeeded = totalSlots - days.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
      days.push({
        date: toDateString(year, month + 1, i),
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Group combined appointments by date
  const appointmentsGroupedByDate = useMemo(() => {
    const map: { [key: string]: any[] } = {};
    allMergedAppointments.forEach(appt => {
      const dateStr = appt.appointment_date;
      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(appt);
    });
    return map;
  }, [allMergedAppointments]);

  const handleOpenCreateModal = (preselectedDate?: string) => {
    setForm({
      patient_id: '',
      title: '',
      appointment_date: preselectedDate || getTodayDateString(),
      appointment_time: '09:00',
      notes: '',
      status: 'Scheduled'
    });
    setFormError('');
    setModalMode('create');
    setSelectedAppointmentId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appt: any) => {
    setForm({
      patient_id: String(appt.patient_id || ''),
      title: appt.title || '',
      appointment_date: appt.appointment_date || '',
      appointment_time: appt.appointment_time || '09:00',
      notes: appt.notes || '',
      status: appt.status || 'Scheduled'
    });
    setFormError('');
    setModalMode('edit');
    setSelectedAppointmentId(appt.id);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) {
      setFormError('Harap pilih pasien terlebih dahulu');
      return;
    }
    if (!form.title.trim()) {
      setFormError('Harap masukkan perihal / tujuan janji temu');
      return;
    }
    if (!form.appointment_date) {
      setFormError('Harap tentukan tanggal kontrol');
      return;
    }

    // Check if duplicate exists clientside for instantaneous feedback (only for active, non-cancelled appointments)
    const hasDuplicate = (appointments || []).some((appt: any) => 
      String(appt.patient_id) === String(form.patient_id) && 
      appt.appointment_date === form.appointment_date &&
      appt.status !== 'Cancelled' &&
      (modalMode === 'create' || appt.id !== selectedAppointmentId)
    );

    if (hasDuplicate && form.status !== 'Cancelled') {
      setFormError('Pasien ini sudah memiliki jadwal kontrol pada tanggal yang ditentukan. Cukup satu jadwal per tanggal.');
      return;
    }

    try {
      const payload = {
        clinic_id: currentUser?.clinic_id,
        patient_id: Number(form.patient_id),
        title: form.title,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        notes: form.notes,
        status: form.status
      };

      let url = '/api/appointments';
      let method = 'POST';

      if (modalMode === 'edit' && selectedAppointmentId) {
        url = `/api/appointments/${selectedAppointmentId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      } else {
        const err = await res.json();
        setFormError(err.error || 'Gagal menyimpan janji temu');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error koneksi ke server');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal janji temu ini?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('[Calendar] Error deleting:', err);
    }
  };

  const handleStatusChangeFast = async (id: number, currentAppt: any, newStatus: string) => {
    try {
      const payload = {
        ...currentAppt,
        status: newStatus
      };
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('[Calendar] Fast Status Update Failed:', err);
    }
  };

  const handleMarkAsDone = async (appt: any) => {
    try {
      if (appt.is_immunization) {
        const payload = {
          vaccine_name: appt.vaccine_name,
          date_administered: getTodayDateString(),
          notes: 'Dicatat dari Jadwal Kunjungan'
        };
        const res = await fetch(`/api/children/${appt.child.id}/immunizations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          onRefresh();
        }
      } else if (appt.is_anc || appt.is_hpl) {
        const payload = {
          clinic_id: currentUser?.clinic_id,
          patient_id: Number(appt.patient_id),
          title: appt.title,
          appointment_date: appt.appointment_date,
          appointment_time: appt.appointment_time,
          notes: appt.notes,
          status: 'Completed'
        };
        const res = await fetch(`/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          onRefresh();
        }
      } else {
        await handleStatusChangeFast(appt.id, appt, 'Completed');
      }
    } catch (err) {
      console.error('Failed to mark as done', err);
    }
  };

  // Status badges mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 animate-pulse">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
            <XCircle className="w-3 h-3" /> Batal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 animate-pulse">
            <Clock3 className="w-3 h-3" /> Terjadwal
          </span>
        );
    }
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row gap-4 h-full overflow-hidden">
      
      {/* LEFT COLUMN: Stat, Search & List */}
      <div className="w-full md:w-80 borer rounded-xl border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-0 bg-white dark:bg-slate-900 p-4 shadow-sm">
        
        {/* UPPER NAVIGATION FOR SIDEBAR */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl gap-1 text-xs font-bold mb-4 shrink-0">
          <button
            onClick={() => setSidebarTab('appointments')}
            className={`flex-1 text-center py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${sidebarTab === 'appointments' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Jadwal Kontrol
          </button>
          <button
            onClick={() => setSidebarTab('recommendations')}
            className={`flex-1 text-center py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${sidebarTab === 'recommendations' ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Rencana Kembali
            {followupRecommendations.length > 0 && (
              <span className="bg-pink-500 text-white text-[9px] px-1 rounded-full">{followupRecommendations.length}</span>
            )}
          </button>
        </div>

        {sidebarTab === 'appointments' ? (
          <>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono font-black">Daftar Kontrol</h3>
              <button
                onClick={() => handleOpenCreateModal()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-200/50"
              >
                <Plus className="w-3.5 h-3.5" /> Kontrol Baru
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pasien / perihal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs placeholder-slate-400 text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Mini Tab Status Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl gap-1 text-[10px] font-bold mb-3 shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 text-center py-1.5 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter('Scheduled')}
                className={`flex-1 text-center py-1.5 rounded-lg transition-all ${statusFilter === 'Scheduled' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
              >
                Jadwal
              </button>
              <button
                onClick={() => setStatusFilter('Completed')}
                className={`flex-1 text-center py-1.5 rounded-lg transition-all ${statusFilter === 'Completed' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
              >
                Selesai
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono font-black">Kembalian Dokter</h3>
              <span className="text-[10px] text-pink-650 dark:text-pink-400 font-extrabold bg-pink-100/65 dark:bg-pink-950/20 px-2 py-0.5 rounded-full">
                Saran Kembali
              </span>
            </div>

            {/* Search Recommendations */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pasien / saran medis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs placeholder-slate-400 text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </>
        )}

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-0">
          {sidebarTab === 'appointments' ? (
            paginatedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Tidak ada jadwal pemeriksaan</p>
              </div>
            ) : (
            paginatedAppointments.map(appt => {
              const apptDate = new Date(appt.appointment_date);
              const formattedDate = formatIDDate(appt.appointment_date);
              
              return (
                <div 
                  key={appt.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-2 group relative ${appt.is_anc ? 'bg-pink-50/20 dark:bg-pink-950/10 border-pink-100 hover:bg-pink-100/30' : appt.is_hpl ? 'bg-purple-50/20 dark:bg-purple-950/10 border-purple-100 hover:bg-purple-100/30' : appt.is_immunization ? 'bg-teal-50/20 dark:bg-teal-950/10 border-teal-100 hover:bg-teal-105/30' : 'bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100/60 dark:hover:bg-slate-850/30 border-slate-100 dark:border-slate-850'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1 flex items-center gap-1">
                        {appt.is_anc && <Baby className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                        {appt.is_hpl && <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                        {appt.is_immunization && <Syringe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                        {appt.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <User className="w-3 h-3 text-slate-400 shrink-0" /> {appt.patient_name || 'Pasien Umum'}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                        RM: {appt.patient_rm || '-'}
                      </p>
                    </div>
                    <div>
                      {appt.is_anc ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-pink-100/60 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200/50">
                          Kembali Cek
                        </span>
                      ) : appt.is_hpl ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-purple-100/60 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/50">
                          HPL Lahir
                        </span>
                      ) : appt.is_immunization ? (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${appt.is_given ? 'bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-250/55' : 'bg-teal-100/60 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/50'}`}>
                          {appt.is_given ? 'Sudah Imun' : 'Saran Imun'}
                        </span>
                      ) : (
                        getStatusBadge(appt.status)
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 border-t border-slate-150 dark:border-slate-800 pt-2 shrink-0">
                    <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                      <CalendarIcon className="w-3 h-3 text-indigo-500" /> {formattedDate}
                      {appt.appointment_time && (
                        <span className="flex items-center gap-0.5 ml-2">
                          <Clock className="w-3 h-3 text-[#00A86B]" /> {appt.appointment_time}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onRemindPatient && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemindPatient(appt.patient, appt.appointment_date || appt.dateText, appt.title || 'Jadwal Kontrol'); }}
                          className="p-1 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-100/50 dark:hover:bg-slate-800 rounded-lg"
                          title="Kirim Pengingat WA Pasien"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                        </button>
                      )}
                      {appt.is_anc || appt.is_hpl ? (
                        <button
                          onClick={() => setSelectedAncDetail(appt)}
                          className="px-2 py-0.5 bg-pink-600 text-white rounded-lg flex items-center gap-0.5 font-bold text-[9px]"
                          title="Lihat Detail ANC"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                      ) : appt.is_immunization ? (
                        <span className="text-[9px] font-black text-teal-600 dark:text-teal-400">Remedial Imun</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(appt)}
                            className="p-1 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Kontrol"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(appt.id)}
                            className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-slate-800 rounded-lg"
                            title="Hapus Kontrol"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="text-[10px] italic text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border-l-2 border-slate-300 dark:border-slate-700 px-2 py-0.5 mt-1 rounded">
                      "{appt.notes}"
                    </div>
                  )}

                  {/* Quick toggle actions if Scheduled */}
                  {appt.status === 'Scheduled' && (
                    <div className="flex justify-end gap-1.5 mt-2 border-t border-slate-100 dark:border-slate-800/50 pt-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsDone(appt); }}
                        className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 px-3 py-1 rounded border border-emerald-200 uppercase tracking-wider"
                      >
                        ✓ Selesai
                      </button>
                      {!appt.is_anc && !appt.is_hpl && !appt.is_immunization && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChangeFast(appt.id, appt, 'Cancelled'); }}
                          className="text-[9px] font-black text-[#FF3B30] dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 px-2 py-1 rounded border border-rose-200 uppercase tracking-wider"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  )}

                  {(appt.is_anc || appt.is_hpl) && (
                    <div className="flex justify-end gap-1.5 mt-1">
                      <button
                        onClick={() => setSelectedAncDetail(appt)}
                        className="text-[9px] font-black text-pink-700 dark:text-pink-400 bg-pink-55 hover:bg-pink-100 px-2 py-0.5 rounded border border-pink-200 flex items-center gap-1 transition-all"
                      >
                        <Heart className="w-3 h-3 text-pink-500 shrink-0" /> Lihat Detail Klinis & USG
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )) : (
            paginatedRecommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">Tidak ada saran kembali dokter</p>
              </div>
            ) : (
              paginatedRecommendations.map(rec => (
                <div 
                  key={rec.id}
                  className="p-3 bg-gradient-to-br from-indigo-50/50 to-pink-50/10 dark:from-slate-900 dark:to-pink-950/10 border border-slate-150 dark:border-slate-800 rounded-xl hover:shadow-md transition-all flex flex-col gap-2 relative group text-left"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-1.5 inline-block ${rec.is_anc ? 'border border-pink-200 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400' : 'border border-indigo-200 bg-indigo-50 dark:bg-slate-950/50 text-indigo-700 dark:text-indigo-400'}`}>
                        {rec.type}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {rec.patient.name}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-450 tracking-tight">
                        RM: {rec.patient.rm_number || rec.patient.id.toString().padStart(6, '0')}
                      </p>
                      {rec.patient.phone && (
                        <p className="text-[9px] font-bold text-slate-450 tracking-tight">
                          No. HP: {rec.patient.phone}
                        </p>
                      )}
                    </div>
                    
                    {rec.dateText !== 'Sesuai Saran SOAP' && (
                      <span className="text-[9px] font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 px-2 py-0.5 rounded-lg border border-pink-100 dark:border-pink-900/30 shrink-0">
                        Saran: {rec.dateText}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] italic text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-950/50 border-l-2 border-pink-500 p-2 rounded-lg">
                    "{rec.text}"
                  </div>

                  <div className="flex justify-end gap-1.5 mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 tracking-tight shrink-0">
                    {rec.patient.phone && (
                      <a
                        href={`https://wa.me/${rec.patient.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo Bapak/Ibu ${rec.patient.name}, kami mengharapkan Anda untuk melakukan kunjungan kembali ke Klinik Nurhealth Bandung sesuai arahan Dokter: \n\n"${rec.text}".\n\nKapan sekiranya Bapak/Ibu ingin kami pesankan jadwal kontrolnya? Terima kasih.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black text-[#00A86B] bg-[#00A86B]/15 hover:bg-[#00A86B]/25 px-2 py-1 rounded-lg border border-[#00A86B]/30 flex items-center gap-1 transition-all"
                      >
                        <Phone className="w-2.5 h-2.5" /> Tanya Kunjungan
                      </a>
                    )}
                    
                    <button
                      onClick={() => {
                        setForm({
                          patient_id: String(rec.patient.id),
                          title: rec.title,
                          appointment_date: rec.is_anc ? rec.dateText : getTodayDateString(),
                          appointment_time: '09:00',
                          notes: rec.text,
                          status: 'Scheduled'
                        });
                        setFormError('');
                        setModalMode('create');
                        setSelectedAppointmentId(null);
                        setIsModalOpen(true);
                      }}
                      className="text-[9px] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Plus className="w-2.5 h-2.5" /> Jadwalkan
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Pagination */}
        <div className="shrink-0 mt-2">
          {sidebarTab === 'appointments' ? (
            <Pagination
              currentPage={appointmentsPage}
              totalItems={filteredAppointments.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setAppointmentsPage}
            />
          ) : (
            <Pagination
              currentPage={recommendationsPage}
              totalItems={filteredRecommendations.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setRecommendationsPage}
            />
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Grid Calendar */}
      <div className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm p-4">
        
        {/* Calendar Navigation header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-lg">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <span className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {monthNames[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-150 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1 px-2 text-slate-600 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-880 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-880 rounded-lg transition-all"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="p-1 px-2 text-slate-600 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-880 rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Days Headers */}
        <div className="grid grid-cols-7 text-center shrink-0 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
          {['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, index) => (
            <div 
              key={d} 
              className={`text-[10px] font-black uppercase tracking-wider ${index === 0 ? 'text-[#FF3B30]' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-grow grid grid-cols-7 grid-rows-6 gap-1 min-h-0 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
          {calendarDays.map((dayObj, idx) => {
            const dayAppts = appointmentsGroupedByDate[dayObj.date] || [];
            
            // Check if today
            const isToday = dayObj.date === getTodayDateString();
            const hasAnc = dayAppts.some(a => a.is_anc);
            const hasHpl = dayAppts.some(a => a.is_hpl);
            const hasImmunization = dayAppts.some(a => a.is_immunization && !a.is_given);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (dayAppts.length > 0) {
                    setSelectedDayDetails({
                      date: dayObj.date,
                      dateStr: formatIDDate(dayObj.date),
                      appointments: dayAppts
                    });
                  } else {
                    handleOpenCreateModal(dayObj.date);
                  }
                }}
                className={`flex flex-col min-h-0 min-w-0 bg-white dark:bg-slate-900 border rounded-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-850/25 cursor-pointer select-none transition-all ${
                  !dayObj.isCurrentMonth ? 'opacity-40' : ''
                } ${
                  isToday 
                    ? 'ring-2 ring-indigo-500 bg-indigo-50/10 border-indigo-400' 
                    : hasAnc 
                      ? 'border-pink-200 dark:border-pink-955/60 bg-gradient-to-br from-pink-50/15 to-transparent' 
                      : hasImmunization
                        ? 'border-teal-200 dark:border-teal-955/60 bg-gradient-to-br from-teal-50/15 to-transparent'
                        : 'border-slate-100 dark:border-slate-850'
                }`}
              >
                {/* Date number */}
                <div className="flex justify-between items-center mb-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <span 
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isToday ? 'bg-indigo-600 text-white font-black' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {dayObj.dayNum}
                    </span>
                    {hasAnc && (
                      <span 
                        className="text-[8px] font-black text-pink-600 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 px-1 py-0.5 rounded flex items-center gap-0.5 shadow-sm animate-pulse"
                        title="Ada Jadwal Kunjungan Kembali ANC (Bidan)"
                      >
                        <Baby className="w-2.5 h-2.5 text-pink-500 fill-pink-150 shrink-0" />
                        <span>ANC</span>
                      </span>
                    )}
                    {hasHpl && (
                      <span 
                        className="text-[8px] font-black text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 px-1 py-0.5 rounded flex items-center gap-0.5 shadow-sm animate-pulse"
                        title="Perkiraan Lahir (HPL)"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                        <span>HPL</span>
                      </span>
                    )}
                    {hasImmunization && (
                      <span 
                        className="text-[8px] font-black text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 px-1 py-0.5 rounded flex items-center gap-0.5 shadow-sm"
                        title="Imunisasi Anak Wajib"
                      >
                        <Syringe className="w-2.5 h-2.5 text-teal-500 shrink-0" />
                        <span>Imun</span>
                      </span>
                    )}
                  </div>
                  {dayAppts.length > 0 && (
                    <span className="text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1 rounded">
                      {dayAppts.length}
                    </span>
                  )}
                </div>

                {/* Day's appointments scroll/list area */}
                <div className="flex-grow overflow-y-auto no-scrollbar space-y-1">
                  {dayAppts.slice(0, 3).map((appt) => {
                    const statusColors: { [key: string]: string } = {
                      Completed: 'bg-emerald-555 text-white hover:bg-emerald-600',
                      Cancelled: 'bg-rose-500 text-white hover:bg-rose-600',
                      Scheduled: 'bg-sky-500 text-white hover:bg-sky-600'
                    };

                    let customClass = statusColors[appt.status] || statusColors.Scheduled;
                    if (appt.is_anc) {
                      customClass = 'bg-pink-605 text-white hover:bg-pink-600 border border-pink-200';
                    } else if (appt.is_hpl) {
                      customClass = 'bg-purple-605 text-white hover:bg-purple-600 border border-purple-200';
                    } else if (appt.is_immunization) {
                      customClass = appt.is_given
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-300'
                        : 'bg-teal-600 text-white hover:bg-teal-700 border border-teal-200';
                    }

                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => {
                          e.stopPropagation(); // Stop parent click trigger
                          if (appt.is_anc || appt.is_hpl) {
                            setSelectedAncDetail(appt);
                          } else if (appt.is_immunization) {
                            // Imunisasi details shown on sidebar list or hover notes
                          } else {
                            handleOpenEditModal(appt);
                          }
                        }}
                        className={`text-[9px] font-bold p-1 rounded border-none leading-none truncate ${customClass} flex flex-col justify-start`}
                        title={`${appt.title} - ${appt.patient_name}`}
                      >
                        {appt.appointment_time && (
                          <span className="font-semibold block opacity-80 text-[8px] tracking-tight">{appt.appointment_time}</span>
                        )}
                        <span className="font-black truncate flex items-center gap-0.5">
                          {appt.is_anc && <Baby className="w-2.5 h-2.5 inline shrink-0 text-white" />}
                          {appt.is_hpl && <Sparkles className="w-2.5 h-2.5 inline shrink-0 text-white" />}
                          {appt.is_immunization && <Syringe className="w-2.5 h-2.5 inline shrink-0 text-white" />}
                          {appt.patient_name || 'Pasien'}
                        </span>
                      </div>
                    );
                  })}
                  
                  {dayAppts.length > 3 && (
                    <div className="text-[8px] font-bold text-center text-slate-500 dark:text-slate-400">
                      + {dayAppts.length - 3} lainnya
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ANC DETAILED METRICS MODAL FOR PREGNANT EXPECTING MOTHERS */}
      {selectedAncDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <Baby className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {selectedAncDetail.is_hpl ? 'Detil Estimasi Kelahiran (HPL)' : 'Detil Jadwal Kontrol Ibu Hamil (ANC)'}
                  </h3>
                  <p className="text-[10px] text-pink-600 dark:text-pink-400 font-extrabold uppercase tracking-widest leading-none mt-1">
                    Profil Layanan Ibu Hamil & Janin Medik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAncDetail(null)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </header>

            <div className="space-y-4">
              {/* Patient Basic Info */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-relaxed">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Nama Pasien</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedAncDetail.patient_name}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">No. Rekam Medis (RM)</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedAncDetail.patient_rm}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Usia</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedAncDetail.patient?.age || '-'} Tahun</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">No. Handphone</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedAncDetail.patient?.phone || '-'}</span>
                </div>
              </div>

              {/* ANC Clinical Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Gestational age & HPL Indicators */}
                <div className="bg-pink-50/10 dark:bg-pink-950/10 p-4 rounded-xl border border-pink-100 dark:border-pink-900/10 flex flex-col justify-between">
                  <span className="text-[9px] font-black text-pink-700 dark:text-pink-400 uppercase tracking-widest flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> Masa Kehamilan & HPL
                  </span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Usia Kehamilan (Gestasi):</span>
                      <span className="font-extrabold text-pink-700 dark:text-pink-400">{selectedAncDetail.anc_details?.gestational_age || '-'} Minggu</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Hari Perkiraan Lahir (HPL):</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {selectedAncDetail.anc_details?.estimated_delivery_date ? formatIDDate(selectedAncDetail.anc_details.estimated_delivery_date) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">HPHT:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {selectedAncDetail.anc_details?.hpht ? formatIDDate(selectedAncDetail.anc_details.hpht) : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Fetal Vitals */}
                <div className="bg-indigo-50/10 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/10 flex flex-col justify-between">
                  <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                     Detail Detak & Ukuran Fisik
                  </span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">DJJ (Denyut Jantung Janin):</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedAncDetail.anc_details?.djj || '-'} bpm</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Tinggi Fundus (TFU):</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">{selectedAncDetail.anc_details?.tfu || '-'} cm</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Skor Risiko Poedji Rochjati:</span>
                      <span className={`font-extrabold px-1.5 py-0.5 rounded ${Number(selectedAncDetail.anc_details?.poedji_rochjati_score || 0) >= 6 ? 'bg-rose-100 text-[#FF3B30]' : 'bg-slate-100 text-slate-700'}`}>
                        {selectedAncDetail.anc_details?.poedji_rochjati_score || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leopold Maneuver Results */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-2.5">Pemeriksaan Palpasi Leopold</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase leading-none mb-1">Leopold I (Fundus)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedAncDetail.anc_details?.leopold_1 || '-'}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase leading-none mb-1">Leopold II (Punggung)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedAncDetail.anc_details?.leopold_2 || '-'}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase leading-none mb-1">Leopold III (Presentasi)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedAncDetail.anc_details?.leopold_3 || '-'}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase leading-none mb-1">Leopold IV (Masuk PAP)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedAncDetail.anc_details?.leopold_4 || '-'}</span>
                  </div>
                </div>
              </div>

              {/* USG Biometry Results */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-2.5">Biometri Ultrasonografi (USG)</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">BPD</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedAncDetail.anc_details?.usg_bpd || '-'} cm</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">HC</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedAncDetail.anc_details?.usg_hc || '-'} cm</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">AC</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedAncDetail.anc_details?.usg_ac || '-'} cm</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">FL</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedAncDetail.anc_details?.usg_fl || '-'} cm</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-center col-span-1">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">TBJ (Berat)</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedAncDetail.anc_details?.usg_tbj || '-'} gr</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800 text-center col-span-1">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">AFI (Air Ketuban)</span>
                    <span className="font-mono font-black text-slate-800 dark:text-slate-200">{selectedAncDetail.anc_details?.usg_afi || '-'} cm</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">Plasenta</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">{selectedAncDetail.anc_details?.usg_placenta || '-'}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-[8px] text-slate-400 font-bold uppercase">Presentasi Janin</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">{selectedAncDetail.anc_details?.usg_presentation || '-'}</span>
                  </div>
                </div>
              </div>

              {/* USG Image Check */}
              {selectedAncDetail.anc_details?.usg_image && (
                <div className="p-4 rounded-xl border border-slate-155 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40">
                  <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-450 uppercase tracking-widest mb-2.5">Lampiran Foto Perkembangan / USG Medik</span>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                    {(() => {
                      let images: string[] = [];
                      try {
                        const imgVal = selectedAncDetail.anc_details.usg_image;
                        if (imgVal.startsWith('[')) {
                          images = JSON.parse(imgVal);
                        } else {
                          images = [imgVal];
                        }
                      } catch (e) {
                        images = [selectedAncDetail.anc_details.usg_image];
                      }
                      return images.map((img, i) => (
                        <img 
                          key={i} 
                          src={img} 
                          referrerPolicy="no-referrer" 
                          alt="USG Patient" 
                          className="h-32 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-slate-900 shrink-0" 
                        />
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Progress and Fetal Development Note */}
              {selectedAncDetail.anc_details?.fetal_development && (
                <div className="p-4 bg-pink-50/10 dark:bg-pink-950/10 border-l-4 border-pink-500 rounded-r-xl">
                  <span className="block text-[8px] font-black text-pink-750 dark:text-pink-400 uppercase">Catatan Perkembangan Janin / Medik</span>
                  <p className="text-xs italic text-slate-700 dark:text-slate-300 mt-1">
                    "{selectedAncDetail.anc_details.fetal_development}"
                  </p>
                </div>
              )}
            </div>

            <footer className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-3 mt-4 gap-2 shrink-0">
              <button
                onClick={() => setSelectedAncDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Tutup Detail
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* DAY DETAILS MODAL */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-none mb-1">
                    Jadwal Kunjungan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedDayDetails.dateStr}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                ✕
              </button>
            </header>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-3">
              {selectedDayDetails.appointments.map(appt => (
                <div key={appt.id} className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {appt.is_anc && <Baby className="w-4 h-4 text-pink-500" />}
                        {appt.is_hpl && <Sparkles className="w-4 h-4 text-purple-500" />}
                        {appt.is_immunization && <Syringe className="w-4 h-4 text-teal-500" />}
                        {appt.patient_name || 'Pasien'}
                      </h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mt-1">
                        {appt.appointment_time || '00:00'} &middot; {appt.title || 'Jadwal Kontrol'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {onRemindPatient && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onRemindPatient(
                              patientsInfo.find(p => String(p.id) === String(appt.patient_id)) || { name: appt.patient_name }, 
                              appt.appointment_date || selectedDayDetails.dateStr, 
                              appt.title || 'Jadwal Kontrol'
                            );
                          }}
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-xl transition-all"
                          title="Kirim WA Terjadwal"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDetails(null);
                          if (appt.is_anc || appt.is_hpl) {
                            setSelectedAncDetail(appt);
                          } else {
                            handleOpenEditModal(appt);
                          }
                        }}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-all"
                        title="Edit / Detail"
                      >
                       <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {appt.notes && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed">
                        "{appt.notes}"
                      </p>
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/50">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                      appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                      appt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                      'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                    }`}>
                      {appt.status === 'Completed' ? 'Selesai' : appt.status === 'Cancelled' ? 'Batal' : 'Jadwal'}
                    </span>

                    {appt.status === 'Scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsDone(appt);
                        }}
                        className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-lg transition-all"
                      >
                        ✓ Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <footer className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
               <button
                 onClick={() => {
                   handleOpenCreateModal(selectedDayDetails.date);
                   setSelectedDayDetails(null);
                 }}
                 className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1.5 shadow-sm"
               >
                 <Plus className="w-4 h-4" /> Tambah Jadwal
               </button>
               <button
                 onClick={() => setSelectedDayDetails(null)}
                 className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
               >
                 Tutup
               </button>
            </footer>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                {modalMode === 'create' ? 'Tulis Jadwal Kontrol Baru' : 'Edit Jadwal Kontrol'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-[#FF3B30] dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* LINK PATIENT */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Hubungkan ke Pasien *</label>
                <select
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold"
                >
                  <option value="">-- Pilih Rekam Medis Pasien --</option>
                  {patientsInfo.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (RM: {p.rm_number || p.id.toString().padStart(6, '0')})
                    </option>
                  ))}
                </select>
              </div>

              {/* AUTOMATIC CLINICAL RETURN RECOMMENDATION PROMPT */}
              {selectedPatientInForm && (
                (selectedPatientInForm.soap?.followup_recommendations && selectedPatientInForm.soap.followup_recommendations.trim()) || 
                (selectedPatientInForm.is_pregnant === 1 && selectedPatientInForm.anc?.next_checkup_date)
              ) && (
                <div className="p-3 bg-gradient-to-r from-pink-50/50 to-indigo-50/10 dark:from-pink-950/20 dark:to-slate-900 border border-pink-200/60 dark:border-pink-900/40 rounded-xl space-y-2 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[9px] font-black text-pink-700 dark:text-pink-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                      Saran Kunjungan Kembali
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const recText = selectedPatientInForm.soap?.followup_recommendations || '';
                        const ancDate = selectedPatientInForm.anc?.next_checkup_date || '';
                        let checkupTitle = 'Pemeriksaan Kontrol';
                        if (selectedPatientInForm.is_pregnant === 1) {
                          checkupTitle = 'Kontrol Kembali ANC';
                        } else if (selectedPatientInForm.soap?.diagnosis) {
                          checkupTitle = `Kontrol - ${selectedPatientInForm.soap.diagnosis}`;
                        }
                        setForm({
                          ...form,
                          title: checkupTitle,
                          appointment_date: ancDate || form.appointment_date,
                          notes: recText || (selectedPatientInForm.anc?.fetal_development ? `Data perkembangan ANC: ${selectedPatientInForm.anc.fetal_development}` : 'Kontrol ulang kehamilan rutin.'),
                        });
                      }}
                      className="px-2 py-1 bg-pink-600 hover:bg-pink-700 text-white text-[9px] font-black rounded-lg transition-all shadow-sm"
                    >
                      Gunakan Saran Ini
                    </button>
                  </div>

                  {selectedPatientInForm.soap?.followup_recommendations && (
                    <div className="text-[10px] text-slate-700 dark:text-slate-300 italic border-l border-pink-400 pl-1.5 text-left">
                      <strong>SOAP Rekomendasi:</strong> "{selectedPatientInForm.soap.followup_recommendations}"
                    </div>
                  )}

                  {selectedPatientInForm.is_pregnant === 1 && selectedPatientInForm.anc?.next_checkup_date && (
                    <div className="text-[10px] text-slate-700 dark:text-slate-300 border-l border-indigo-400 pl-1.5 text-left">
                      <strong>Rencana Target ANC:</strong> {formatIDDate(selectedPatientInForm.anc.next_checkup_date)}
                    </div>
                  )}
                </div>
              )}

              {/* TITLE */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Perihal / Target Kontrol *</label>
                <input
                  type="text"
                  placeholder="Misal: Imunisasi BCG, Checkup ANC 3, Kontrol Gigi"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-semibold"
                />
              </div>

              {/* DATE & TIME */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Kontrol *</label>
                  <input
                    type="date"
                    value={form.appointment_date}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Jam Kontrol</label>
                  <input
                    type="time"
                    value={form.appointment_time}
                    onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Catatan Khusus</label>
                <textarea
                  rows={3}
                  placeholder="Instruksi tambahan bagi petugas medis atau pasien..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Status Janji Temu</label>
                <div className="flex gap-2">
                  {['Scheduled', 'Completed', 'Cancelled'].map(statusName => {
                    const labelStyle: { [key: string]: string } = {
                      Scheduled: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20 border-sky-200',
                      Completed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200',
                      Cancelled: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200',
                    };
                    const selectedStyle: { [key: string]: string } = {
                      Scheduled: 'bg-sky-500 text-white border-transparent',
                      Completed: 'bg-emerald-500 text-white border-transparent',
                      Cancelled: 'bg-rose-500 text-white border-transparent'
                    };

                    const isSelected = form.status === statusName;

                    return (
                      <button
                        key={statusName}
                        type="button"
                        onClick={() => setForm({ ...form, status: statusName })}
                        className={`flex-1 text-center py-2 border rounded-xl text-xs font-black transition-all ${isSelected ? selectedStyle[statusName] : 'text-slate-500 hover:text-slate-700 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                      >
                        {statusName === 'Scheduled' ? 'Jadwal' : statusName === 'Completed' ? 'Selesai' : 'Batal'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 shrink-0 border-t border-slate-200 dark:border-slate-800 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100/50 dark:shadow-none"
                >
                  Simpan Jadwal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
