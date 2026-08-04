import { useState, useEffect, useMemo, useRef, Fragment, useCallback, lazy, Suspense } from 'react';
import { Pagination } from './components/Pagination';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Database, Code2, ShieldAlert, AlertTriangle, FileJson, 
  Stethoscope, Heart, Users, Pill, ChevronRight, Activity, LayoutDashboard,
  UserCog, Bed, CalendarClock, Plus, Edit2, Trash2, X, Lock, User, Banknote, Receipt, CreditCard, Wallet, UserPlus, Baby, History, Download, Upload, UploadCloud,
  Syringe, LineChart, Footprints, Fingerprint, Search, PieChart, BarChart3, Printer, UserCheck, Settings, ShieldCheck,
  MapPin, Phone, Thermometer, Wind, Scale, Brain, ClipboardList, AlertCircle,
  Bot, Sparkles, Send, Moon, Sun, Layout,
  ChevronDown, MoreVertical, Loader2, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, CheckCircle2, TrendingUp,
  Minus, Image as ImageIcon, MessageSquare, Menu, LogOut, Camera, MapPin as MapPinIcon, CalendarDays, Clock, FileText, PackageOpen, EyeOff, Mic, Volume2, VolumeX
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import ReactMarkdown from 'react-markdown';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AttendanceCamera from './components/AttendanceCamera';
import Login from './pages/Login';
import { LoginRequestDto, UserDto } from './types/dto/auth.dto';
import { PatientDto } from './types/dto/patient.dto';
import { ClinicDto } from './types/dto/clinic.dto';
import { AppointmentDto } from './types/dto/appointment.dto';
import { DrugDto } from './types/dto/drug.dto';
import { BedDto } from './types/dto/bed.dto';
import { ShiftDto } from './types/dto/shift.dto';
import { TariffDto } from './types/dto/tariff.dto';
import { MarginDto } from './types/dto/margin.dto';
import { BillingDto } from './types/dto/billing.dto';
import { AttendanceDto } from './types/dto/attendance.dto';
import { CoaDto } from './types/dto/coa.dto';
import { LabOrderDto } from './types/dto/lab-order.dto';
import { LabResultDto } from './types/dto/lab-result.dto';
import { PrescriptionDto } from './types/dto/prescription.dto';
import { PatientHistoryDto } from './types/dto/patient-history.dto';
import { StockLogDto } from './types/dto/stock-log.dto';
import { BackupLogDto } from './types/dto/backup-log.dto';
import { AncDto } from './types/dto/anc.dto';
import { SoapDto } from './types/dto/soap.dto';

// Lazy load heavy components
const LpjReport = lazy(() => import('./components/LpjReport'));
const AccountingPanel = lazy(() => import('./components/AccountingPanel'));
const InventoryPanel = lazy(() => import('./components/InventoryPanel'));
const AppointmentCalendar = lazy(() => import('./components/AppointmentCalendar').then(module => ({ default: module.AppointmentCalendar })));
const RbacPanel = lazy(() => import('./components/RbacPanel').then(module => ({ default: module.RbacPanel })));
const ArchitectureDocs = lazy(() => import('./components/ArchitectureDocs').then(module => ({ default: module.ArchitectureDocs })));
const PatientAnalyticsTab = lazy(() => import('./components/PatientAnalyticsTab').then(module => ({ default: module.PatientAnalyticsTab })));
const ClinicsTab = lazy(() => import('./components/ClinicsTab').then(module => ({ default: module.ClinicsTab })));
const AttendanceTab = lazy(() => import('./components/AttendanceTab').then(module => ({ default: module.AttendanceTab })));
const PatientDatabaseTab = lazy(() => import('./components/PatientDatabaseTab').then(module => ({ default: module.PatientDatabaseTab })));
const DoctorDashboardTab = lazy(() => import('./components/DoctorDashboardTab').then(module => ({ default: module.DoctorDashboardTab })));
const DoctorSoapTab = lazy(() => import('./components/DoctorSoapTab').then(module => ({ default: module.DoctorSoapTab })));
const BillingTab = lazy(() => import('./components/BillingTab').then(module => ({ default: module.BillingTab })));
const LisTab = lazy(() => import('./components/LisTab').then(module => ({ default: module.LisTab })));
const AdminPanelTab = lazy(() => import('./components/AdminPanelTab').then(module => ({ default: module.AdminPanelTab })));
const AppointmentsTab = lazy(() => import('./components/AppointmentsTab').then(module => ({ default: module.AppointmentsTab })));
const Icd10Search = lazy(() => import('./components/Icd10Search').then(module => ({ default: module.Icd10Search })));

import { architectureData } from './data/architectureDoc';

// --- Reusable Components ---
const MapClinics = lazy(() => import('./MapClinics'));
import { createPortal } from 'react-dom';

import { ActionMenu } from './components/ActionMenu';
import { getAgeInMonths, getChildImmunizationStatus, IMMUNIZATION_SCHEDULE } from './utils/immunization';
import { parseDatabaseDate, formatIDDate, formatIDTime, formatIDTimeShort, formatIDDateTime } from './utils/formatters';
import { VitalInputField } from './components/VitalInputField';

type Tab = 'dashboard' | 'rbac' | 'architecture' | 'schema' | 'query' | 'adminPanel' | 'billing' | 'patients' | 'anc' | 'children' | 'patientDatabase' | 'doctorSOAP' | 'doctorDashboard' | 'patientAnalytics' | 'clinics' | 'queue' | 'queueTV' | 'reports' | 'lis' | 'map' | 'attendance' | 'lpj' | 'accounting' | 'inventory' | 'appointments';

const tabRoutes: Record<string, Tab> = {
  '/dashboard': 'dashboard',
  '/dashboard-dokter': 'doctorDashboard',
  '/rbac': 'rbac',
  '/architecture': 'architecture',
  '/schema': 'schema',
  '/query': 'query',
  '/admin': 'adminPanel',
  '/kasir': 'billing',
  '/pasien-harian': 'patients',
  '/anc': 'anc',
  '/anak': 'children',
  '/pasien-database': 'patientDatabase',
  '/soap': 'doctorSOAP',
  '/analitik-pasien': 'patientAnalytics',
  '/klinik': 'clinics',
  '/antrean': 'queue',
  '/antrean-tv': 'queueTV',
  '/layar-antrean': 'queueTV',
  '/laporan': 'reports',
  '/lab': 'lis',
  '/peta': 'map',
  '/absen': 'attendance',
  '/lpj': 'lpj',
  '/akuntansi': 'accounting',
  '/janji-temu': 'appointments'
};

const tabToRoute = (tab: Tab): string => {
  for (const [route, t] of Object.entries(tabRoutes)) {
    if (t === tab) return route;
  }
  return '/dashboard'; // default
};

const getInitialAccountingSubTabState = (path: string): 'coa' | 'journal' | 'ledger' | 'balanceSheet' | 'income' | 'cashReport' | 'sroi' => {
  if (path === '/akuntansi/laba-rugi' || path === '/akuntansi/income') return 'income';
  if (path === '/akuntansi/neraca' || path === '/akuntansi/balance-sheet') return 'balanceSheet';
  if (path === '/akuntansi/coa' || path === '/akuntansi/chart-of-accounts') return 'coa';
  if (path === '/akuntansi/kas' || path === '/akuntansi/cash-report') return 'cashReport';
  if (path === '/akuntansi/sroi') return 'sroi';
  if (path === '/akuntansi/jurnal-umum' || path === '/akuntansi/journal') return 'journal';
  return 'journal';
};

import { 
  WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS, 
  WHO_HEAD_CIRC_BOYS, WHO_HEAD_CIRC_GIRLS, GrowthPoint 
} from './data/growthReference';

import { SortIcon } from './components/SortIcon';
const ChildGrowthChart = lazy(() => import('./components/ChildGrowthChart').then(mod => ({ default: mod.ChildGrowthChart })));
const ReportsTab = lazy(() => import('./components/ReportsTab'));
const DashboardTab = lazy(() => import('./components/DashboardTab'));
const QueueTab = lazy(() => import('./components/QueueTab'));
const QueueTVTab = lazy(() => import('./components/QueueTVTab'));
const PatientsTab = lazy(() => import('./components/PatientsTab'));
const AncTab = lazy(() => import('./components/AncTab'));
const ChildrenTab = lazy(() => import('./components/ChildrenTab'));
const ChildStuntingAnalysisModal = lazy(() => import('./components/ChildStuntingAnalysisModal'));
import { LabResultsModal } from './components/modals/LabResultsModal';
import { StockHistoryModal } from './components/modals/StockHistoryModal';
import { ReferralFormModal } from './components/modals/ReferralFormModal';
import { DashboardDetailModal } from './components/modals/DashboardDetailModal';
import { PatientHistoryModal } from './components/modals/PatientHistoryModal';
import { PatientProfileModal } from './components/modals/PatientProfileModal';
import { MedicalModals } from './components/modals/MedicalModals';
import { ClinicSettingsModals } from './components/modals/ClinicSettingsModals';
import { BillingModals } from './components/modals/BillingModals';
import { ChildrenModals } from './components/modals/ChildrenModals';
import { AttendanceModals } from './components/modals/AttendanceModals';

import { useGoogleLogin } from '@react-oauth/google';

export default function App() {
  const [realTimeClock, setRealTimeClock] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNewVisit, setIsNewVisit] = useState(false);
  const [innerPatientSearch, setInnerPatientSearch] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Routing Initial State
  const initialPath = window.location.pathname;
  const initialTab = (initialPath.startsWith('/akuntansi') ? 'accounting' : (Object.keys(tabRoutes).find(k => k === initialPath) ? tabRoutes[initialPath as keyof typeof tabRoutes] : null) || 'dashboard');

  const [activeTabState, setActiveTabState] = useState<Tab>(initialTab);
  const [accountingSubTab, setAccountingSubTab] = useState<'coa' | 'journal' | 'ledger' | 'balanceSheet' | 'income' | 'cashReport' | 'sroi'>(getInitialAccountingSubTabState(initialPath));

  const setAccountingSubTabWithUrl = useCallback((sub: 'coa' | 'journal' | 'ledger' | 'balanceSheet' | 'income' | 'cashReport' | 'sroi') => {
    setAccountingSubTab(sub);
    let path = '/akuntansi';
    if (sub === 'income') path = '/akuntansi/laba-rugi';
    else if (sub === 'balanceSheet') path = '/akuntansi/neraca';
    else if (sub === 'coa') path = '/akuntansi/coa';
    else if (sub === 'cashReport') path = '/akuntansi/kas';
    else if (sub === 'sroi') path = '/akuntansi/sroi';
    else if (sub === 'journal') path = '/akuntansi/jurnal-umum';
    
    window.history.pushState(null, '', path);
  }, []);

  const setActiveTab = useCallback((tab: Tab) => {
    setActiveTabState(tab);
    if (tab === 'accounting') {
      let subPath = '/akuntansi/jurnal-umum';
      if (accountingSubTab === 'income') subPath = '/akuntansi/laba-rugi';
      else if (accountingSubTab === 'balanceSheet') subPath = '/akuntansi/neraca';
      else if (accountingSubTab === 'coa') subPath = '/akuntansi/coa';
      else if (accountingSubTab === 'cashReport') subPath = '/akuntansi/kas';
      else if (accountingSubTab === 'sroi') subPath = '/akuntansi/sroi';
      window.history.pushState(null, '', subPath);
    } else {
      window.history.pushState(null, '', tabToRoute(tab));
    }
  }, [accountingSubTab]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/akuntansi')) {
        setActiveTabState('accounting');
        setAccountingSubTab(getInitialAccountingSubTabState(path));
      } else {
        const tab = (Object.keys(tabRoutes).find(k => k === path) ? tabRoutes[path as keyof typeof tabRoutes] : 'dashboard') as Tab;
        setActiveTabState(tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const activeTab = activeTabState;
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'beds' | 'shifts' | 'billingMaster' | 'drugs' | 'backup'>('users');
  const [backupLogsInfo, setBackupLogsInfo] = useState<BackupLogDto[]>([]);

  const [isDriveSyncing, setIsDriveSyncing] = useState(false);

  const googleBackupLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsDriveSyncing(true);
        const res = await fetch('/api/settings/backup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser?.id}`,
            'X-User-Id': String(currentUser?.id),
            'X-User-Role': currentUser?.role || '',
            'x-drive-token': tokenResponse.access_token
          }
        });
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('Non-JSON response from server, status: ' + res.status);
        }
        fetchBackupLogs();
        if (data.success) {
          alert(`Backup Berhasil! ${data.driveFileId ? '\nTersimpan di Google Drive.' : '\nHanya tersimpan di Server Lokal.'}`);
        } else {
          alert('Gagal Backup: ' + data.error);
        }
      } catch (e: any) {
        alert('Error Server: ' + e.message);
      } finally {
        setIsDriveSyncing(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
    onError: error => alert('Google Auth Failed: ' + error)
  });

  const handleLocalBackupOnly = async () => {
    try {
      setIsDriveSyncing(true);
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser?.id}`,
          'X-User-Id': String(currentUser?.id),
          'X-User-Role': currentUser?.role || '',
        }
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Non-JSON response from server, status: ' + res.status);
      }
      fetchBackupLogs();
      if (data.success) {
        alert('Backup Lokal Berhasil disimpan di folder /backups server.');
      } else {
        alert('Gagal Backup: ' + data.error);
      }
    } catch (e: any) {
      alert('Error Server: ' + e.message);
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleManualBackup = async () => {
    if (!(import.meta as any).env.VITE_GOOGLE_CLIENT_ID) {
      alert('Fitur Backup ke Drive belum dikonfigurasi. Silakan tambahkan VITE_GOOGLE_CLIENT_ID di pengaturan sistem atau gunakan "Backup Lokal Saja".');
      return;
    }
    googleBackupLogin();
  };

  // Handled by the deep-linking bootstrap useEffect below openPatientProfile
  // to avoid lexical scoping issues with handleDeepLinkPatient and state setters.

  // --- States for Admin Panel & Billing ---
  const [clinicsInfo, setClinicsInfo] = useState<ClinicDto[]>([]);
  const [usersInfo, setUsersInfo] = useState<UserDto[]>([]);
  const [bedsInfo, setBedsInfo] = useState<BedDto[]>([]);
  const [shiftsInfo, setShiftsInfo] = useState<ShiftDto[]>([]);
  const [tariffsInfo, setTariffsInfo] = useState<TariffDto[]>([]);
  const [marginsInfo, setMarginsInfo] = useState<MarginDto[]>([]);
  const [billingsData, setBillingsData] = useState<BillingDto[]>([]);
  const [coa, setCoa] = useState<CoaDto[]>([]);
  const [labOrdersInfo, setLabOrdersInfo] = useState<LabOrderDto[]>([]);
  const [labResultsModalOpen, setLabResultsModalOpen] = useState<{open: boolean, orderId: number|null}>({open: false, orderId: null});
  const [currentLabResults, setCurrentLabResults] = useState<LabResultDto[]>([]);
  const [patientsInfo, setPatientsInfo] = useState<PatientDto[]>([]);
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [appointmentForm, setAppointmentForm] = useState<{
    id?: number;
    patient_id: string;
    title: string;
    appointment_date: string;
    appointment_time: string;
    notes: string;
    status: string;
  }>({
    patient_id: '',
    title: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    status: 'Scheduled'
  });
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [drugsInfo, setDrugsInfo] = useState<DrugDto[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDto[]>([]);
  const [patientHistoryData, setPatientHistoryData] = useState<PatientHistoryDto | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingDto | null>(null);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<SoapDto | AncDto | null>(null);
  const [summaryData, setSummaryData] = useState<{ patientCount: number, drugCount: number, totalRevenue: number }>({ patientCount: 0, drugCount: 0, totalRevenue: 0 });
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [isChatbotDismissed, setIsChatbotDismissed] = useState(() => {
    return localStorage.getItem('nhc_chatbot_dismissed') === 'true';
  });
  const [aiMessages, setAiMessages] = useState<{role: string, text: string}[]>([
    { role: 'assistant', text: 'Halo! Saya AI Copilot Nurhealth. Ada yang bisa saya bantu terkait data statistik, stok obat, atau pendapatan klinik hari ini?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiChatOpen, isAiTyping]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    
    stopSpeaking();
    
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#`]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, stopSpeaking]);

  // Clean up speech when closing
  useEffect(() => {
    if (!aiChatOpen) {
      stopSpeaking();
      setIsListening(false);
    }
  }, [aiChatOpen, stopSpeaking]);

  const sendAiMessage = async (customMessage?: string) => {
    const textToSend = customMessage !== undefined ? customMessage : aiInput;
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user', text: textToSend };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiTyping(true);

    try {
      const headersValue: Record<string, string> = { 
        'Content-Type': 'application/json' 
      };
      if (currentUser?.id) {
        headersValue['X-User-Id'] = String(currentUser.id);
      }
      if (currentUser?.role) {
        headersValue['X-User-Role'] = String(currentUser.role);
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: headersValue,
        body: JSON.stringify({ message: textToSend, history: aiMessages })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server AI.');
      }
      
      if (data && data.text) {
        setAiMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
        speakText(data.text);
      } else {
        setAiMessages(prev => [...prev, { role: 'assistant', text: 'Maaf, server AI tidak mengembalikan respons yang valid.' }]);
      }
    } catch (e: any) {
      const errMsg = e.message || 'Maaf, terjadi kesalahan saat menghubungi server AI.';
      setAiMessages(prev => [...prev, { role: 'assistant', text: errMsg }]);
      speakText(errMsg);
    } finally {
      setIsAiTyping(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert("Maaf, browser Anda tidak mendukung fitur Voice Note (Speech Recognition). Gunakan Chrome atau peramban modern lainnya.");
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiInput(prev => prev ? prev + ' ' + transcript : transcript);
      // Auto-send when speaking finishes?
      setIsListening(false);
      // Uncomment the line below to auto-send on voice input completion
      sendAiMessage(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data: any[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle string comparison case-insensitively
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const [modalType, setModalType] = useState<'none'|'user'|'bed'|'shift'|'tariff'|'margin'|'billing'|'patient'|'vitals'|'anc'|'soap'|'childrenList'|'newChild'|'addImmunization'|'addGrowth'|'drug'|'patientHistory'|'patientProfile'|'prescription'|'clinic'|'invoiceDetail'|'childGrowthChart'|'childStuntingAnalysis'|'dashboardDetail'|'stockHistory'|'attendanceCamera'|'attendanceUserDetail'|'attendanceDayDetail'|'referralForm'>('none');
  const [stockHistoryData, setStockHistoryData] = useState<StockLogDto[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugDto | null>(null);
  const [editingAncRecord, setEditingAncRecord] = useState<AncDto | null>(null);
  
  const [attendancesData, setAttendancesData] = useState<AttendanceDto[]>([]);
  const [attendanceType, setAttendanceType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [attendanceFilterClinic, setAttendanceFilterClinic] = useState<string>('all');
  const [attendanceMonth, setAttendanceMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [selectedAttendanceUser, setSelectedAttendanceUser] = useState<any>(null);
  const [selectedAttendanceDay, setSelectedAttendanceDay] = useState<{user: UserDto | null, date: string, attendances: AttendanceDto[]}>({user: null, date: '', attendances: []});

  const exportAttendancePDF = () => {
    const doc = new jsPDF('portrait');
    const [y, m] = attendanceMonth.split('-');
    
    // Header
    doc.setFontSize(16);
    doc.text('Laporan Riwayat Absensi', 14, 20);
    doc.setFontSize(11);
    doc.text(`Bulan: ${attendanceMonth}`, 14, 28);
    const clinicName = attendanceFilterClinic === 'all' ? 'Semua Klinik' : clinicsInfo.find((c: any) => String(c.id) === String(attendanceFilterClinic))?.name || '-';
    doc.text(`Klinik: ${clinicName}`, 14, 34);
    
    const filteredUsers = usersInfo.filter(u => attendanceFilterClinic === 'all' || String(u.clinic_id) === String(attendanceFilterClinic));
    const daysInMonth = new Date(parseInt(y), parseInt(m), 0).getDate();
    const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

    // 1. Summary Table Data
    const summaryHead = [['No', 'Nama Staf', 'Jabatan', 'Total Kehadiran', 'Total Peringatan']];
    const summaryBodyStr = filteredUsers.map((user, idx) => {
        let totalPresent = 0;
        let totalWarnings = 0;
        
        daysArray.forEach(day => {
            const dayAttendances = attendancesData.filter((a: any) => {
                const d = new Date(a.created_at);
                const aMonth = (d.getMonth() + 1).toString().padStart(2, '0');
                const aYear = d.getFullYear();
                return a.user_id === user.id && d.getDate() === day && `${aYear}-${aMonth}` === attendanceMonth;
            });
            if (dayAttendances.length > 0) totalPresent++;
            if (dayAttendances.some((a: any) => a.status === 'Late' || a.status === 'Outside Radius')) totalWarnings++;
        });

        return [
            String(idx + 1),
            user.name,
            user.role,
            `${totalPresent} Hari`,
            totalWarnings > 0 ? `${totalWarnings} Insiden` : '-'
        ];
    });

    autoTable(doc, {
      startY: 42,
      head: summaryHead,
      body: summaryBodyStr,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }, // indigo-600
      margin: { left: 14, right: 14 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // 2. Detail Table Data
    doc.setFontSize(14);
    doc.text('Log Kehadiran Detail', 14, currentY);
    
    const detailHead = [['Tanggal', 'Nama Staf', 'Masuk', 'Keluar', 'Radius (Masuk/Keluar)', 'Status']];
    const detailBody: any[] = [];

    daysArray.forEach(day => {
        // Find if there is any attendance for this day among all filtered users
        filteredUsers.forEach(user => {
            const dayAttendances = attendancesData.filter((a: any) => {
                const d = new Date(a.created_at);
                const aMonth = (d.getMonth() + 1).toString().padStart(2, '0');
                const aYear = d.getFullYear();
                return a.user_id === user.id && d.getDate() === day && `${aYear}-${aMonth}` === attendanceMonth;
            });

            if (dayAttendances.length > 0) {
                const masuk = dayAttendances.find((a: any) => a.type === 'Masuk');
                const keluar = dayAttendances.find((a: any) => a.type === 'Keluar');
                
                const timeMasuk = masuk ? new Date(masuk.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : '-';
                const timeKeluar = keluar ? new Date(keluar.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : '-';
                const radiusText = `${masuk?.distance ? masuk.distance.toFixed(1) + 'm' : '-' } / ${keluar?.distance ? keluar.distance.toFixed(1) + 'm' : '-'}`;
                
                // Determine combined status
                let combinedStatus = 'Hadir';
                if ((masuk && masuk.status !== 'Hadir') || (keluar && keluar.status !== 'Hadir')) {
                    combinedStatus = 'Peringatan';
                }

                detailBody.push([
                    `${String(day).padStart(2, '0')}/${m}/${y}`,
                    user.name,
                    timeMasuk,
                    timeKeluar,
                    radiusText,
                    combinedStatus
                ]);
            }
        });
    });

    if (detailBody.length === 0) {
        detailBody.push([{ content: 'Tidak ada data kehadiran', colSpan: 6, styles: { halign: 'center', fontStyle: 'italic', textColor: [150, 150, 150] } }]);
    }

    autoTable(doc, {
        startY: currentY + 6,
        head: detailHead,
        body: detailBody,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [51, 65, 85] }, // slate-700
        margin: { left: 14, right: 14 }
    });
    
    doc.save(`Laporan_Absensi_Detail_${attendanceMonth}_${new Date().getTime()}.pdf`);
  };

  const [dashboardDetailType, setDashboardDetailType] = useState<'waiting' | 'inAction' | 'finished' | 'totalPatients' | 'bedOccupied' | 'bedAvailable' | 'revenue' | 'revenueToday' | 'age' | 'gender' | 'growth' | 'lowStock' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [patientProfileTab, setPatientProfileTab] = useState<'soap'|'vital'|'resep'|'anc'|'billing'|'lab'|'qrcard'|'referral'>('soap');

  // Form states
  const [clinicForm, setClinicForm] = useState({ name: '', address: '', phone: '', status: 'Active', latitude: '', longitude: '', sponsor_logo: '', sponsor_name: '', youtube_link: '', support_logo: '' });
  const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'Suster', clinic_id: '', status: 'Active', phone: '', accessible_menus: '' });
  const [whatsappPrompt, setWhatsappPrompt] = useState<{
    show: boolean;
    patientName: string;
    rmNumber: string;
    complaint: string;
    doctorName: string;
    doctorPhone: string;
    doctorUsername?: string;
    patientId?: number;
    vitals?: {
      blood_pressure?: string;
      temperature?: string;
      heart_rate?: string;
      respiratory_rate?: string;
      oxygen_saturation?: string;
      weight?: string;
      height?: string;
      pain_score?: string;
    } | null;
    fallRisk?: string;
    allergies?: string;
  } | null>(null);
  const [patientWaPrompt, setPatientWaPrompt] = useState<{
    show: boolean;
    patientName: string;
    patientPhone: string;
    appointmentDateText: string;
    appointmentTitle: string;
  } | null>(null);
  const [bedForm, setBedForm] = useState({ id: '', room: '', class: 'Kelas 1', status: 'KOSONG' });
  const [shiftForm, setShiftForm] = useState({ date: '', user: '', shift: 'Pagi (07:00-15:00)' });
  const [tariffForm, setTariffForm] = useState({ action_name: '', patient_class: 'Reguler', price: 0, coa_account_id: '' });
  const [marginForm, setMarginForm] = useState({ patient_class: 'Reguler', margin_percentage: 0 });
  const [billingForm, setBillingForm] = useState({ patient_name: '', patient_id: null as number | null, patient_class: 'Reguler', payment_method: 'Cash', payment_account_id: '', items: [] as {description: string, amount: number}[] });
  const [patientForm, setPatientForm] = useState<{rm_number?: string; name: string; age: string; gender: string; address: string; phone: string; complaint: string; status: string; allergies: string; fall_risk: string; is_pregnant: boolean; is_child?: boolean; child_birth_date?: string; clinic_id?: string | number; registration_images?: string[]}>({ name: '', age: '', gender: 'Laki-laki', address: '', phone: '', complaint: '', status: 'Menunggu', allergies: '', fall_risk: 'Rendah', is_pregnant: false, is_child: false, child_birth_date: '', clinic_id: '', registration_images: [] });
  const [selectedPatientImages, setSelectedPatientImages] = useState<{id: number, image_data: string, notes: string}[]>([]);
  const [drugForm, setDrugForm] = useState({ name: '', unit: 'Tablet', stock: 0, price: 0, clinic_id: '' as string | number, purchase_price: 0, revenue_coa_id: '', inventory_coa_id: '', mfg_date: '', exp_date: '' });
  
  const [isSponsorCovered, setIsSponsorCovered] = useState(false);

  const [isAiTriageLoading, setIsAiTriageLoading] = useState(false);
  const handleAiTriage = async () => {
    setIsAiTriageLoading(true);
    try {
      const hasEnteredVitals = vitalsForm.blood_pressure || vitalsForm.temperature || vitalsForm.heart_rate || vitalsForm.respiratory_rate || vitalsForm.oxygen_saturation || vitalsForm.pain_score;
      
      let targetVitals;
      if (hasEnteredVitals) {
        targetVitals = {
          blood_pressure: vitalsForm.blood_pressure || '',
          temperature: vitalsForm.temperature || '',
          heart_rate: vitalsForm.heart_rate || '',
          respiratory_rate: vitalsForm.respiratory_rate || '',
          oxygen_saturation: vitalsForm.oxygen_saturation || '',
          pain_score: vitalsForm.pain_score || '',
          weight: vitalsForm.weight || '65',
          height: vitalsForm.height || '165',
          triage_level: '',
          triage_notes: ''
        };
      } else {
        targetVitals = {
          blood_pressure: Math.floor(Math.random()*(150-100)+105) + '/' + Math.floor(Math.random()*(100-60)+60),
          temperature: (Math.random() * (39.5 - 36.5) + 36.5).toFixed(1),
          heart_rate: Math.floor(Math.random() * (120 - 70) + 70).toString(),
          respiratory_rate: Math.floor(Math.random() * (24 - 14) + 14).toString(),
          oxygen_saturation: Math.floor(Math.random() * (100 - 92) + 92).toString(),
          pain_score: Math.floor(Math.random() * 8).toString(),
          weight: vitalsForm.weight || '65',
          height: vitalsForm.height || '165',
          triage_level: '',
          triage_notes: ''
        };
        setVitalsForm(targetVitals);
      }

      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vitals: targetVitals, complaint: editingItem?.complaint })
      });

      if (res.ok) {
        const aiResult = await res.json();
        setVitalsForm({
         ...targetVitals,
         triage_level: aiResult.triage_level,
         triage_notes: aiResult.summary
        });
      }
    } catch(e) { console.error(e); }
    setIsAiTriageLoading(false);
  };

  const [vitalsForm, setVitalsForm] = useState({ blood_pressure: '', temperature: '', heart_rate: '', respiratory_rate: '', oxygen_saturation: '', weight: '', height: '', pain_score: '', triage_level: '', triage_notes: '' });
  const [soapForm, setSoapForm] = useState({ subjective: '', objective: '', assessment: '', plan: '', diagnosis: '', medication: '', lab_orders: '', radiology_orders: '', lab_results: '', radiology_results: '', usg_image: '', usg_image_notes: '', followup_recommendations: '' });
  const [prescriptionForm, setPrescriptionForm] = useState({ drug_id: '', dosage: '', quantity: 1, notes: '' });
  const [ancForm, setAncForm] = useState({ 
    hpht: '',
    gestational_age: '', 
    estimated_delivery_date: '', 
    tfu: '',
    leopold_1: '',
    leopold_2: '',
    leopold_3: '',
    leopold_4: '',
    djj: '',
    poedji_rochjati_score: '',
    fetal_development: '', 
    next_checkup_date: '',
    usg_bpd: '',
    usg_hc: '',
    usg_ac: '',
    usg_fl: '',
    usg_tbj: '',
    usg_afi: '',
    usg_placenta: '',
    usg_presentation: '',
    usg_image: '',
    usg_image_notes: ''
  });
  const [historyVisits, setHistoryVisits] = useState<PatientDto[]>([]);
  const [historyVisitFilter, setHistoryVisitFilter] = useState<string>('all');
  const [dbCurrentPage, setDbCurrentPage] = useState<number>(1);
  const [dbItemsPerPage, setDbItemsPerPage] = useState<number>(10);
  const [triageHistoryPage, setTriageHistoryPage] = useState<number>(1);
  const [ancHistoryPage, setAncHistoryPage] = useState<number>(1);
  const [triageDateFilter, setTriageDateFilter] = useState<string>('');
  const [ancDateFilter, setAncDateFilter] = useState<string>('');
  const [dbDateFilter, setDbDateFilter] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<any>(null);
  
  const [tablePages, setTablePages] = useState<Record<string, number>>({});
  const getPage = (key: string) => tablePages[key] || 1;
  const setPage = (key: string, page: number) => setTablePages(prev => ({ ...prev, [key]: page }));

  
  const [childForm, setChildForm] = useState({ name: '', gender: 'Laki-laki', birth_date: '', birth_time: '', birth_weight: '', birth_height: '', apgar_1min: '', apgar_5min: '', footprint_captured: false });
  const [immunizationForm, setImmunizationForm] = useState({ vaccine_name: '', date_administered: '', notes: '' });
  const [growthForm, setGrowthForm] = useState({ date_measured: '', age_months: '', weight: '', height: '', head_circumference: '', notes: '' });

  const [confirmAction, setConfirmAction] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const requestSave = (onConfirm: () => void) => {
    setConfirmAction({
      message: "Apakah data yang di isi sudah benar?",
      onConfirm: async () => {
        await onConfirm();
        setConfirmAction(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    });
  };

  const icons: Record<string, React.ReactNode> = {
    Heart: <Heart className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    Stethoscope: <Stethoscope className="w-5 h-5" />,
    Pill: <Pill className="w-5 h-5" />,
    ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  };

  const [forcedClinicFilter, setForcedClinicFilter] = useState<number | null>(null);

  const fetchClinics = async () => {
    try {
      const res = await fetch('/api/clinics');
      if (!res.ok) throw new Error('Failed to fetch clinics');
      const data = await res.json();
      setClinicsInfo(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Error fetching clinics', e); setClinicsInfo([]); }
  };
  const fetchUsers = () => fetch(`/api/users?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setUsersInfo(Array.isArray(data) ? data : []))
    .catch(() => setUsersInfo([]));
  const fetchBeds = () => fetch(`/api/beds?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setBedsInfo(Array.isArray(data) ? data : []))
    .catch(() => setBedsInfo([]));
  const fetchShifts = () => fetch(`/api/shifts?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setShiftsInfo(Array.isArray(data) ? data : []))
    .catch(() => setShiftsInfo([]));
  const fetchTariffs = () => fetch(`/api/tariffs?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setTariffsInfo(Array.isArray(data) ? data : []))
    .catch(() => setTariffsInfo([]));
  const fetchMargins = () => fetch(`/api/margins?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setMarginsInfo(Array.isArray(data) ? data : []))
    .catch(() => setMarginsInfo([]));
  const fetchBillings = () => fetch(`/api/billings?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setBillingsData(Array.isArray(data) ? data : []))
    .catch(() => setBillingsData([]));
  const fetchCoa = () => fetch(`/api/coa?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setCoa(Array.isArray(data) ? data : []))
    .catch(() => setCoa([]));
  const fetchLabOrders = () => fetch(`/api/lab-orders?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setLabOrdersInfo(Array.isArray(data) ? data : []))
    .catch(() => setLabOrdersInfo([]));
  const fetchPatients = () => fetch(`/api/patients?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setPatientsInfo(Array.isArray(data) ? data : []))
    .catch(() => setPatientsInfo([]));
  const fetchAppointments = () => fetch(`/api/appointments?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setAppointments(Array.isArray(data) ? data : []))
    .catch(() => setAppointments([]));
  const fetchBackupLogs = () => fetch('/api/settings/backup/logs')
    .then(res => res.ok ? res.json() : [])
    .then(data => setBackupLogsInfo(Array.isArray(data) ? data : []))
    .catch(() => setBackupLogsInfo([]));
  const fetchDrugs = () => fetch(`/api/drugs?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setDrugsInfo(Array.isArray(data) ? data : []))
    .catch(() => setDrugsInfo([]));

  const fetchAttendances = () => fetch(`/api/attendance?role=${currentUser?.role}`)
    .then(res => res.ok ? res.json() : [])
    .then(data => setAttendancesData(Array.isArray(data) ? data : []))
    .catch(() => setAttendancesData([]));
  
  const allChildren = useMemo(() => {
    return patientsInfo.flatMap(p => 
      (p.children || []).map(c => ({
        ...c,
        mother_name: p.name,
        mother_rm: p.rm_number || p.id.toString().padStart(6, '0'),
        mother_id: p.id
      }))
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [patientsInfo]);

  const [childrenSearch, setChildrenSearch] = useState('');
  const filteredChildren = useMemo(() => {
    const q = childrenSearch.toLowerCase();
    return allChildren.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.mother_name.toLowerCase().includes(q) ||
      c.mother_rm.toLowerCase().includes(q)
    );
  }, [allChildren, childrenSearch]);

  const [soapDurationStats, setSoapDurationStats] = useState<{doctorName: string, avgDuration: number, soapCount: number}[]>([]);

  const fetchSummary = async () => {
    try {
      const isAdminValue = currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter';
      let clinicIdParam = (forcedClinicFilter === null && isAdminValue) ? '' : (forcedClinicFilter || currentUser?.clinic_id || '');
      if (clinicIdParam === 'undefined' || clinicIdParam === 'null') {
        clinicIdParam = '';
      }
      const roleParam = currentUser?.role || '';
      const res = await fetch(`/api/summary?clinicId=${encodeURIComponent(clinicIdParam)}&role=${encodeURIComponent(roleParam)}`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      if (data) {
        setSummaryData(data);
      }

      // Fetch SOAP duration stats
      const soapRes = await fetch(`/api/reports/soap-duration?clinicId=${encodeURIComponent(clinicIdParam)}`);
      if (soapRes.ok) {
         setSoapDurationStats(await soapRes.json());
      }
    } catch (e) {
      // Graceful fallback for initial loading states
    }
  };

  const triggerWhatsAppNotification = (patient: any) => {
    const targetClinicId = patient.clinic_id || currentUser?.clinic_id;
    
    // 1. Try to find doctors/admins in the same clinic
    const sameClinicDocs = usersInfo.filter((u: any) => 
      (u.role === 'Dokter' || u.role === 'Admin') && 
      (!targetClinicId || Number(u.clinic_id) === Number(targetClinicId))
    );

    // 2. Fallback to any doctors/admins in any clinic if sameClinicDocs is empty
    const allDocs = sameClinicDocs.length > 0 ? sameClinicDocs : usersInfo.filter((u: any) => u.role === 'Dokter' || u.role === 'Admin');

    // 3. Prefer doctor with a phone number
    const doctorWithPhone = allDocs.find((u: any) => u.phone && u.phone.trim() !== '');
    const doctor = doctorWithPhone || (allDocs.length > 0 ? allDocs[0] : { name: '', phone: '', username: '' });

    setWhatsappPrompt({
      show: true,
      patientName: patient.name,
      rmNumber: patient.rm_number || '-',
      complaint: patient.complaint || '-',
      doctorName: doctor.name || '',
      doctorPhone: doctor.phone || '',
      doctorUsername: doctor.username || '',
      patientId: patient.id,
      vitals: patient.vitals || null,
      fallRisk: patient.fall_risk || patient.fallRisk || '-',
      allergies: patient.allergies || '-',
    });
  };

  const triggerPatientWhatsAppNotification = (patient: any, dateText: string, title: string) => {
    setPatientWaPrompt({
      show: true,
      patientName: patient.name,
      patientPhone: patient.phone || '', // Using phone if available in patient data model
      appointmentDateText: dateText,
      appointmentTitle: title,
    });
  };

  const updatePatientStatus = async (id: number, status: string) => {
    try {
      const p = patientsInfo.find((x: any) => x.id === id);
      if (!p) return;
      const res = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, status })
      });
      if (res.ok) {
        fetchPatients();
        if (status === 'Menunggu Dokter') {
          triggerWhatsAppNotification(p);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPrescriptions = async (patientId: number) => {
    const res = await fetch(`/api/patients/${patientId}/prescriptions`);
    const data = await res.json();
    setPrescriptions(data);
  };
  
  const fetchPatientHistory = async (patientId: number) => {
    try {
      if (!patientId) {
        setPatientHistoryData({ soap: [], vitals: [], billings: [], prescriptions: [] });
        return;
      }
      setPatientHistoryData(null);
      const res = await fetch(`/api/patients/${patientId}/history`);
      if (!res.ok) {
        const text = await res.text();
        console.error('Fetch history error:', text);
        return;
      }
      const data = await res.json();
      setPatientHistoryData(data);
    } catch (e) { 
      console.error('Error fetching patient history', e); 
    }
  };

  const openPatientProfile = (patient: any) => {
    setEditingItem(patient);
    setSelectedVisit(null);
    fetchPatientHistory(patient.id);
    setModalType('patientProfile');
  };

  const handleDeepLinkPatient = async (patientId: number, targetUserClinicId: any, role: string) => {
    try {
      const url = `/api/patients?clinicId=${targetUserClinicId || ''}&role=${role || ''}`;
      const response = await fetch(url);
      if (!response.ok) return;
      const patients = await response.json();
      const patient = patients.find((p: any) => p.id === patientId);
      if (patient) {
        openSoapModal(patient);
        setActiveTab('patients');
      }
    } catch (e) {
      console.error("Deep link patient loading failed:", e);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const magicUser = urlParams.get('magic_login');
    const handlePatientId = urlParams.get('handle_patient');

    const initializeAuth = async () => {
      if (magicUser) {
        try {
          const res = await fetch(`/api/auth/magic?username=${encodeURIComponent(magicUser)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              setCurrentUser(data.user);
              setIsAuthenticated(true);
              localStorage.setItem('nhc_user', JSON.stringify(data.user));

              // Clean url search params without reload
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);

              if (handlePatientId) {
                const patId = parseInt(handlePatientId, 10);
                if (!isNaN(patId)) {
                  handleDeepLinkPatient(patId, data.user.clinic_id, data.user.role);
                }
              }
              return;
            }
          }
        } catch (err) {
          console.error("Magic login failed:", err);
        }
      }

      const storedUser = localStorage.getItem('nhc_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);

          if (handlePatientId) {
            const patId = parseInt(handlePatientId, 10);
            if (!isNaN(patId)) {
              handleDeepLinkPatient(patId, user.clinic_id, user.role);
            }
          }
        } catch (e) {
          localStorage.removeItem('nhc_user');
        }
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('nhc_user');
      }, 5 * 60 * 1000); // 5 minutes
    };

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'
    ];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);
  
  const groupedPatients = useMemo(() => {
    return patientsInfo.reduce((acc: any[], p: any) => {
      const rm = p.rm_number || p.id.toString().padStart(6, '0');
      const existing = acc.find(g => (g.rm_number || g.id.toString().padStart(6, '0')) === rm);
      if (existing) {
        existing.visits.push(p);
      } else {
        acc.push({ ...p, visits: [p] });
      }
      return acc;
    }, []);
  }, [patientsInfo]);

  const filteredPatientsInfo = useMemo(() => {
    if (!patientSearchQuery.trim()) return patientsInfo;
    const lowerQuery = patientSearchQuery.toLowerCase();
    return patientsInfo.filter(p => 
      p.name?.toLowerCase().includes(lowerQuery) || 
      (p.rm_number || p.id.toString().padStart(6, '0')).toLowerCase().includes(lowerQuery)
    );
  }, [patientsInfo, patientSearchQuery]);

  const notificationCounts = useMemo(() => {
    const triageCount = patientsInfo.filter(p => p.status === 'Menunggu' && !p.vitals).length;
    const soapList = patientsInfo.filter(p => !p.soap && (p.status === 'Menunggu' || p.status === 'Menunggu Dokter' || p.status === 'Diperiksa' || p.status === 'Dalam Pemeriksaan'));
    const soapEmergencyCount = soapList.filter(p => p.vitals?.triage_level === 'Merah').length;
    const soapNormalCount = soapList.length - soapEmergencyCount;
    const labPendingCount = labOrdersInfo?.filter((o: any) => o.status === 'Menunggu' || o.status === 'Diproses').length || 0;
    const billingPendingCount = billingsData?.filter((b: any) => b.status === 'Pending').length || 0;
    const queueActiveCount = patientsInfo.filter(p => p.status === 'Menunggu').length;
    
    return {
      triage: triageCount,
      soapEmergency: soapEmergencyCount,
      soapNormal: soapNormalCount,
      lab: labPendingCount,
      billing: billingPendingCount,
      queue: queueActiveCount
    };
  }, [patientsInfo, labOrdersInfo, billingsData]);

  const filteredGroupedPatients = useMemo(() => {
    let result = groupedPatients;
    if (patientSearchQuery.trim()) {
      const lowerQuery = patientSearchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(lowerQuery) || 
        (p.rm_number || p.id.toString().padStart(6, '0')).toLowerCase().includes(lowerQuery)
      );
    }
    if (dbDateFilter) {
      result = result.filter(p => p.created_at && p.created_at.split('T')[0] === dbDateFilter);
    }
    return result;
  }, [groupedPatients, patientSearchQuery, dbDateFilter]);

  const filteredTriagePatients = useMemo(() => {
    let result = filteredPatientsInfo.filter(p => !p.is_pregnant);
    if (triageDateFilter) {
      result = result.filter(p => p.created_at && p.created_at.split('T')[0] === triageDateFilter);
    }
    return result;
  }, [filteredPatientsInfo, triageDateFilter]);

  const filteredAncPatients = useMemo(() => {
    let result = filteredPatientsInfo.filter(p => p.is_pregnant === 1);
    if (ancDateFilter) {
      result = result.filter(p => p.created_at && p.created_at.split('T')[0] === ancDateFilter);
    }
    return result;
  }, [filteredPatientsInfo, ancDateFilter]);

  useEffect(() => {
    setDbCurrentPage(1);
  }, [patientSearchQuery, dbDateFilter]);

  useEffect(() => {
    setTriageHistoryPage(1);
  }, [triageDateFilter]);

  useEffect(() => {
    setAncHistoryPage(1);
  }, [ancDateFilter]);

  const stats = useMemo(() => {
    const revChartData = Array.from({length: 12}, (_, i) => {
      const month = new Date(0, i).toLocaleString('en', { month: 'short' }).toUpperCase();
      return { month, revenue: 0 };
    });
    
    billingsData.forEach(b => {
      const g = new Date(b.created_at).getMonth();
      if(g >= 0 && g < 12) revChartData[g].revenue += b.total_amount || 0;
    });

    const m = patientsInfo.filter(p => p.gender === 'Laki-laki').length;
    const f = patientsInfo.filter(p => p.gender === 'Perempuan').length;
    const genderStats = [
      { name: 'MALE', value: m || 1 },
      { name: 'FEMALE', value: f || 1 }
    ];

    return { revChartData, genderStats };
  }, [billingsData, patientsInfo]);

  
    const getLogos = (clinic) => {
       if (!clinic?.sponsor_logo) return [];
       try {
           if (clinic.sponsor_logo.startsWith('[')) return JSON.parse(clinic.sponsor_logo);
           return [clinic.sponsor_logo];
       } catch(e) { return [clinic.sponsor_logo]; }
    };

  const generatePatientCardPDF = (patient: any) => {
    // CR80 dimensions: 85.6 mm x 53.98 mm, landscape
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98]
    });

    const activeClinicSponsor = clinicsInfo.find(c => String(c.id) === String(patient.clinic_id)) || clinicsInfo.find(c => String(c.id) === String(currentUser?.clinic_id)) || clinicsInfo[0];
    const logos = getLogos(activeClinicSponsor);

    // Background - Crisp White
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 85.6, 53.98, 'F');

    // Decorative geometric shapes for modern look (Top Right)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.circle(85.6, 0, 30, 'F');
    doc.setFillColor(241, 245, 249); // slate-100
    doc.circle(85.6, 0, 20, 'F');
    
    // Bottom Graphic
    doc.setFillColor(248, 250, 252); 
    doc.circle(85.6, 53.98, 15, 'F');

    // Left Accent Lines
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 2.5, 53.98, 'F');
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(2.5, 0, 1.2, 53.98, 'F');
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(3.7, 0, 0.5, 53.98, 'F');

    // Logos Placement - Top Right
    let maxLogoX = 85.6; // We will use this to limit clinic name width
    if (logos.length > 0) {
      let logoX = 85.6 - 6; 
      let logoMaxHeight = 8;
      let logoY = 6;
      logos.forEach(logoStr => {
        try {
           const props = doc.getImageProperties(logoStr);
           const ratio = props.width / props.height;
           const drawW = logoMaxHeight * ratio;
           logoX -= drawW; 
           doc.addImage(logoStr, 'PNG', logoX, logoY, drawW, logoMaxHeight);
           maxLogoX = logoX;
           logoX -= 4; // spacing
        } catch(e) {}
      });
    }

    // Clinic Name - Top Left
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    const clinicName = activeClinicSponsor?.name || 'Klinik Nurhealth';
    let displayClinicName = clinicName.toUpperCase();
    
    // Dynamically adjust font size to avoid overlapping logos
    let fontSize = 10;
    doc.setFontSize(fontSize);
    while (doc.getTextWidth(displayClinicName) > (maxLogoX - 12) && fontSize > 6) {
      fontSize -= 0.5;
      doc.setFontSize(fontSize);
    }
    doc.text(displayClinicName, 9, 10);
    
    // Subtitle
    doc.setTextColor(99, 102, 241); // indigo-500
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.text('KARTU IDENTITAS PASIEN / PATIENT ID CARD', 9, 13.5);

    // RM Number Bar - Sharp corners for modern feel
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(9, 18, 43, 10, 'F'); 
    
    // Tiny blue accent on the RM badge
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(9, 18, 1, 10, 'F');
    
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(4);
    doc.text('NO. REKAM MEDIS', 12, 21.5);

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(11);
    doc.text(`RM-${patient.rm_number || patient.id.toString().padStart(6, '0')}`, 12, 26);

    // Patient Information Section
    const startY = 34;

    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(4);
    doc.text('NAMA PASIEN / PATIENT NAME', 9, startY);
    
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(8);
    let pName = patient.name.toUpperCase();
    if (doc.getTextWidth(pName) > 65) {
       pName = pName.substring(0, 30) + '...';
    }
    doc.text(pName, 9, startY + 3.5);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(4);
    doc.text('TANGGAL LAHIR', 9, startY + 8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6.5);
    const dob = patient.birth_date ? formatIDDate(patient.birth_date) : '-';
    doc.text(`${dob}`, 9, startY + 12);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(4);
    doc.text('USIA PADA DAFTAR', 35, startY + 8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6.5);
    doc.text(`${patient.age || '-'} Thn`, 35, startY + 12);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(4);
    doc.text('JENIS KELAMIN', 55, startY + 8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6.5);
    doc.text(patient.gender.toUpperCase(), 55, startY + 12);

    // Decorative separator line
    doc.setDrawColor(241, 245, 249);
    doc.line(9, startY + 15, 79.6, startY + 15);

    // Footer
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(3.5);
    doc.setFont('helvetica', 'italic');
    doc.text('Harap bawa kartu ini setiap kali berobat. Kartu ini tidak dapat dipindahtangankan.', 9, startY + 17.5);

    doc.save(`Kartu_Pasien_${patient.name.replace(/\s+/g, '_')}_${patient.id}.pdf`);
  };

  const generatePatientPDF = (visitsInput?: any[], historyDataInput?: any) => {
    // Determine visits to print safely
    let visitsToPrint = visitsInput || historyVisits;
    if (!visitsToPrint || visitsToPrint.length === 0) {
      if (editingItem) {
        const pg = groupedPatients.find((x: any) => {
          const xRm = x.rm_number || (x.id ? x.id.toString().padStart(6, '0') : '');
          const editRm = editingItem.rm_number || (editingItem.id ? editingItem.id.toString().padStart(6, '0') : '');
          return xRm && editRm && xRm === editRm;
        });
        if (pg && pg.visits) visitsToPrint = pg.visits;
        else visitsToPrint = [editingItem];
      } else {
        return;
      }
    }
    
    // Sort visits descending safely
    visitsToPrint = [...visitsToPrint].sort((a: any, b: any) => {
      const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    const doc = new jsPDF();
    const patientName = (visitsToPrint && visitsToPrint[0] && visitsToPrint[0].name) ? visitsToPrint[0].name : (editingItem?.name || 'Pasien');
    const rmNumber = (visitsToPrint && visitsToPrint[0]) ? (visitsToPrint[0].rm_number || (visitsToPrint[0].id ? visitsToPrint[0].id.toString().padStart(6, '0') : '-')) : (editingItem?.rm_number || '-');
    const pdfHistoryData = historyDataInput || patientHistoryData;
    
    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    
    const patientP = visitsInput ? { clinic_id: visitsInput[0]?.clinic_id } : editingItem;
    const targetClinicId = patientP?.clinic_id || currentUser?.clinic_id;
    const activeClinic = clinicsInfo.find(c => String(c.id) === String(targetClinicId));
    

    doc.setFontSize(24);
    doc.text(currentUser?.clinic_name?.toUpperCase() || 'KLINIK NURHEALTH', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Rekam Medis Lengkap Pasien", 105, 30, { align: "center" });
    
    // Patient Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMASI PASIEN", 14, 50);
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 53, 196, 53);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama: ${patientName}`, 14, 60);
    doc.text(`No. RM: ${rmNumber}`, 14, 66);
    doc.text(`Tgl Lahir / Umur: ${visitsToPrint[0]?.age || '-'} Tahun`, 14, 72);
    doc.text(`Jenis Kelamin: ${visitsToPrint[0]?.gender || '-'}`, 14, 78);
    
    doc.text(`Total Kunjungan: ${visitsToPrint.length}`, 120, 60);
    doc.text(`Dicetak pd: ${formatIDDateTime(new Date())}`, 120, 66);

    let startY = 90;

    visitsToPrint.forEach((visit: any, index: number) => {
      if (!visit) return;
      
      let visitDay = '';
      let visitDateFormatted = '-';
      try {
        if (visit.created_at) {
          visitDay = formatIDDate(visit.created_at);
          visitDateFormatted = formatIDDateTime(visit.created_at);
        }
      } catch (e) {
        console.error("Error formatting visit date", e);
      }
      
      // Get visit-specific data safely
      let vVitals = visit.vitals;
      if (!vVitals && pdfHistoryData?.vitals && visitDay) {
        try {
          vVitals = pdfHistoryData.vitals.find((v: any) => v && v.created_at && formatIDDate(v.created_at) === visitDay);
        } catch (e) { }
      }
      
      let vSoap = visit.soap;
      if (!vSoap && pdfHistoryData?.soap && visitDay) {
        try {
          vSoap = pdfHistoryData.soap.find((s: any) => s && s.created_at && formatIDDate(s.created_at) === visitDay);
        } catch (e) { }
      }
      
      let vAnc = visit.anc;
      if (!vAnc && pdfHistoryData?.anc && visitDay) {
        try {
          vAnc = pdfHistoryData.anc.find((a: any) => a && a.created_at && formatIDDate(a.created_at) === visitDay);
        } catch (e) { }
      }

      if (startY > 250) { doc.addPage(); startY = 20; }

      // Visit Header Divider
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, 182, 10, 'F');
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`Kunjungan #${visitsToPrint.length - index} - ${visitDateFormatted}`, 16, startY + 7);
      
      startY += 18;
      
      // Complaints / Triage
      if (visit.complaint || visit.subjective) {
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.text("KELUHAN / TRIAGE", 14, startY);
        doc.setFont("helvetica", "normal");
        const keluhanTextVal = visit.complaint || visit.subjective || '-';
        const keluhanText = doc.splitTextToSize(`${keluhanTextVal}`, 182);
        doc.text(keluhanText, 14, startY + 6);
        startY += 6 + (keluhanText.length * 5) + 4;
      }

      // Vitals
      if (vVitals) {
        if (startY > 250) { doc.addPage(); startY = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("TANDA TANDA VITAL", 14, startY);
        
        const vitalsData = [
          [
            { content: 'Tekanan Darah:', styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] as [number, number, number] } }, vVitals.blood_pressure ? vVitals.blood_pressure + ' mmHg' : '-',
            { content: 'Suhu Tubuh:', styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] as [number, number, number] } }, vVitals.temperature ? vVitals.temperature + ' °C' : '-'
          ],
          [
            { content: 'Detak Jantung:', styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] as [number, number, number] } }, vVitals.heart_rate ? vVitals.heart_rate + ' x/menit' : '-',
            { content: 'Laju Pernapasan:', styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] as [number, number, number] } }, vVitals.respiratory_rate ? vVitals.respiratory_rate + ' x/menit' : '-'
          ],
          [
            { content: 'Saturasi O2:', styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] as [number, number, number] } }, vVitals.oxygen_saturation ? vVitals.oxygen_saturation + ' %' : '-',
            { content: 'Berat Badan:', styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] as [number, number, number] } }, vVitals.weight ? vVitals.weight + ' kg' : '-'
          ]
        ];

        autoTable(doc, {
          startY: startY + 2,
          body: vitalsData,
          theme: 'plain',
          styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 40 }, 2: { cellWidth: 35 }, 3: { cellWidth: 40 } },
          margin: { left: 14 }
        });
        startY = (doc as any).lastAutoTable.finalY + 6;
      }

      // SOAP
      if (vSoap) {
        if (startY > 250) { doc.addPage(); startY = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("PEMERIKSAAN KLINIS (SOAP)", 14, startY);
        
        const soapData = [
          [{ content: 'Subjective (S):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vSoap.subjective || '-'],
          [{ content: 'Objective (O):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vSoap.objective || '-'],
          [{ content: 'Assessment (A):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vSoap.assessment || vSoap.diagnosis || '-'],
          [{ content: 'Plan (P):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vSoap.plan || '-']
        ];

        autoTable(doc, {
          startY: startY + 2,
          body: soapData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
          columnStyles: { 0: { cellWidth: 35, fillColor: [248, 250, 252] }, 1: { cellWidth: 'auto' } },
          margin: { left: 14, right: 14 }
        });
        startY = (doc as any).lastAutoTable.finalY + 6;
      }

      // ANC
      if (vAnc) {
        if (startY > 250) { doc.addPage(); startY = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("PEMERIKSAAN ANC", 14, startY);
        
        const ancData = [
          [
            { content: 'Usia Kehamilan:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.gestational_age ? vAnc.gestational_age + ' Mgg' : '-',
            { content: 'HPL:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.estimated_delivery_date || '-'
          ],
          [
            { content: 'TFU:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.tfu || '-',
            { content: 'DJJ:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.djj || '-'
          ],
          [
            { content: 'Leopold 1:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.leopold_1 || '-',
            { content: 'Leopold 2:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.leopold_2 || '-'
          ],
          [
            { content: 'Leopold 3:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.leopold_3 || '-',
            { content: 'Leopold 4:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.leopold_4 || '-'
          ],
          [
            { content: 'Skor P.R:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.poedji_rochjati_score || '-',
            { content: 'Cek Up Berikutnya:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.next_checkup_date || '-'
          ]
        ];

        autoTable(doc, {
          startY: startY + 2,
          body: ancData,
          theme: 'plain',
          styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 40 }, 2: { cellWidth: 35 }, 3: { cellWidth: 40 } },
          margin: { left: 14 }
        });
        startY = (doc as any).lastAutoTable.finalY + 6;

        // USG
        if (vAnc.usg_bpd || vAnc.usg_tbj || vAnc.usg_image) {
          if (startY > 250) { doc.addPage(); startY = 20; }
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("HASIL USG", 14, startY);
          
          const usgData = [
            [
              { content: 'BPD (Kepala):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_bpd || '-',
              { content: 'HC:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_hc || '-',
              { content: 'AC:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_ac || '-',
              { content: 'FL (Paha):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_fl || '-'
            ],
            [
              { content: 'EFW/TBJ:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_tbj || '-',
              { content: 'AFI:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_afi || '-',
              { content: 'Plasenta:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_placenta || '-',
              { content: 'Posisi:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, vAnc.usg_presentation || '-'
            ]
          ];
          
          autoTable(doc, {
            startY: startY + 2,
            body: usgData,
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
            columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 20 }, 2: { cellWidth: 15 }, 3: { cellWidth: 20 }, 4: { cellWidth: 15 }, 5: { cellWidth: 20 }, 6: { cellWidth: 25 }, 7: { cellWidth: 20 } },
            margin: { left: 14 }
          });
          startY = (doc as any).lastAutoTable.finalY + 6;

          if (vAnc.usg_image) {
             let images: string[] = [];
             try {
               if (vAnc.usg_image.startsWith('[')) {
                 images = JSON.parse(vAnc.usg_image);
               } else {
                 images = [vAnc.usg_image];
               }
             } catch(e) { images = [vAnc.usg_image]; }

             for (const imgSrc of images) {
               try {
                  if (startY > 230) { doc.addPage(); startY = 20; }
                  const imgProps = doc.getImageProperties(imgSrc);
                  const pdfWidth = 80;
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  doc.addImage(imgSrc, 'JPEG', 14, startY, pdfWidth, pdfHeight);
                  startY += pdfHeight + 6;
               } catch(e) { }
             }
          }
        }
      }
      
      // Prescriptions safely retrieved
      let rxs: any[] = [];
      try {
        if (pdfHistoryData?.prescriptions) {
          rxs = pdfHistoryData.prescriptions.filter((p: any) => {
            if (!p) return false;
            const soapMatch = vSoap && p.soap_id && p.soap_id === vSoap.id;
            let dateMatch = false;
            if (p.created_at && visitDay) {
              try {
                dateMatch = formatIDDate(p.created_at) === visitDay;
              } catch (e) { }
            }
            return soapMatch || dateMatch;
          });
        }
      } catch (e) {
        console.error("Error filtering prescriptions", e);
      }

      if (rxs && rxs.length > 0) {
        if (startY > 250) { doc.addPage(); startY = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("DAFTAR RESEP OBAT", 14, startY);
        
        const rxTableBody = rxs.map((r: any, idx: number) => [
          idx + 1,
          r.drug_name || 'Obat',
          `${r.quantity || 0} ${r.drug_unit || 'Pcs'}`,
          r.dosage || '-',
          r.notes || '-'
        ]);

        autoTable(doc, {
          startY: startY + 2,
          head: [['No', 'Nama Obat/Alkes', 'Jumlah', 'Aturan Pakai', 'Keterangan']],
          body: rxTableBody,
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
          margin: { left: 14, right: 14 }
        });
        startY = (doc as any).lastAutoTable.finalY + 10;
      } else {
        startY += 2;
      }
    });

    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Dicetak pada ${formatIDDateTime(new Date())} | Halaman ${i} dari ${pageCount}`,
            105,
            285,
            { align: 'center' }
        );
    }
    const sanitizedPatientName = patientName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const sanitizedRm = rmNumber.replace(/[^a-zA-Z0-9_\-]/g, '_');
    
    let logos = [];
    try {
      if (activeClinic?.sponsor_logo) {
         logos = activeClinic.sponsor_logo.startsWith('[') ? JSON.parse(activeClinic.sponsor_logo) : [activeClinic.sponsor_logo];
      }
    } catch(e) {}
    
    if (logos.length > 0) {
      let logoX = 14; 
      let logoMaxHeight = 15;
      let bottomY = 270;
      
      logos.forEach(logoStr => {
         try {
            const props = doc.getImageProperties(logoStr);
            const ratio = props.width / props.height;
            const drawW = logoMaxHeight * ratio;
            doc.addImage(logoStr, 'PNG', logoX, bottomY, drawW, logoMaxHeight);
            logoX += drawW + 5; 
         } catch(e) {}
      });
    }
    doc.save(`Rekam_Medis_${sanitizedPatientName}_${sanitizedRm}.pdf`);;

  };


  const printIndependentPrescription = (rxs: any[], format: 'a4' | 'a5', patient: any) => {
    if (!rxs || rxs.length === 0) {
      alert("Belum ada resep untuk pasien ini.");
      return;
    }
    const doc = new jsPDF({ format: format, orientation: 'portrait' });
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const clinicName = currentUser?.clinic_name || 'Klinik / Rumah Sakit';
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(clinicName.toUpperCase(), pageWidth / 2, 14, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Dokumen Peresepan Resmi`, pageWidth / 2, 18, { align: 'center' });
    
    doc.line(14, 22, pageWidth - 14, 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SALINAN RESEP MANDIRI", pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Pasien : ${patient?.name || '-'}`, 14, 40);
    doc.text(`No. RM      : ${patient?.rm_number || '-'}`, 14, 44);
    doc.text(`Usia        : ${patient?.age || '-'} Thn`, 14, 48);
    
    doc.text(`Tgl Cetak   : ${formatIDDateTime(new Date())}`, pageWidth - 14, 40, { align: 'right' });

    const rxTableBody = rxs.map((r: any, idx: number) => [
      idx + 1,
      r.drug_name || 'Obat',
      `${r.quantity || 0} ${r.drug_unit || 'Pcs'}`,
      r.dosage || '-',
      r.instructions || r.notes || '-'
    ]);

    autoTable(doc, {
      startY: 56,
      head: [['No', 'Deskripsi Obat/Alkes', 'Jumlah', 'Aturan Pakai', 'Keterangan']],
      body: rxTableBody,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
      columnStyles: { 0: { cellWidth: 10 }, 2: { halign: 'center' } },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text("Pihak Penyerah (Farmasi)", 14, finalY);
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 15, 60, finalY + 15);
    
    doc.text("Penerima", pageWidth - 14, finalY, { align: 'right' });
    doc.line(pageWidth - 60, finalY + 15, pageWidth - 14, finalY + 15);

    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text(`Dicetak pada ${formatIDDateTime(new Date())} - Halaman ${i}/${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    doc.save(`Resep_${patient?.name?.replace(/\s+/g, '_')}_${format.toUpperCase()}.pdf`);
  };

  const handleExportPatientsExcel = () => {
    if (filteredGroupedPatients.length === 0) {
      alert("Tidak ada data pasien untuk diekspor.");
      return;
    }

    const headers = [
      "No. RM",
      "Nama Pasien",
      "Jenis Kelamin",
      "Usia (Tahun)",
      "No. Telepon",
      "Alamat",
      "Alergi",
      "Risiko Jatuh",
      "Ibu Hamil (ANC)",
      "Keluhan Utama",
      "Status Terakhir",
      "TD Terakhir (mmHg)",
      "Suhu Terakhir (C)",
      "Nadi Terakhir (bpm)",
      "Saturasi O2 (%)",
      "Tanggal Registrasi"
    ];

    const rows = filteredGroupedPatients.map((p) => {
      const isPregnantStr = p.is_pregnant === 1 ? "Ya" : "Tidak";
      const regDate = p.created_at ? formatIDDateTime(p.created_at) : '-';
      
      return [
        p.rm_number || p.id.toString().padStart(6, '0'),
        p.name || '-',
        p.gender || '-',
        p.age || '0',
        p.phone || '-',
        p.address || '-',
        p.allergies || 'Tidak Ada',
        p.fall_risk || 'Rendah',
        isPregnantStr,
        p.complaint || '-',
        p.status || '-',
        p.vitals?.blood_pressure || '-',
        p.vitals?.temperature || '-',
        p.vitals?.heart_rate || '-',
        p.vitals?.oxygen_saturation || '-',
        regDate
      ];
    });

    const formatCSVCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      let cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    };

    const csvContent = [
      headers.map(formatCSVCell).join(','),
      ...rows.map(row => row.map(formatCSVCell).join(','))
    ].join('\r\n');

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Laporan_Database_Pasien_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateVisitSummaryPDF = (visit: any) => {
    if (!editingItem || !visit) return;
    const doc = new jsPDF();
    const patientName = editingItem.name;
    const rmNumber = editingItem.rm_number || editingItem.id.toString().padStart(6, '0');
    const visitDate = formatIDDateTime(visit.created_at);
    
    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    
    doc.setFontSize(24);
    doc.text(currentUser?.clinic_name?.toUpperCase() || 'KLINIK NURHEALTH', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Ringkasan Kunjungan Pasien", 105, 30, { align: "center" });
    
    // Patient Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMASI PASIEN", 14, 50);
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 53, 196, 53);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama: ${patientName}`, 14, 60);
    doc.text(`No. RM: ${rmNumber}`, 14, 66);
    doc.text(`Tgl Lahir / Umur: ${editingItem.age} Tahun`, 14, 72);
    doc.text(`Jenis Kelamin: ${editingItem.gender}`, 14, 78);
    
    doc.text(`Tanggal Kunjungan: ${visitDate}`, 120, 60);
    doc.text(`Status: Selesai`, 120, 66);

    let startY = 88;

    // Triage / Keluhan
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TRIAGE & KELUHAN AWAL", 14, startY);
    doc.line(14, startY + 3, 196, startY + 3);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const keluhanText = doc.splitTextToSize(`Keluhan: ${visit.subjective || editingItem.complaint || '-'}`, 182);
    doc.text(keluhanText, 14, startY + 9);
    startY += 9 + (keluhanText.length * 5) + 5;

    // TTV (Vitals) - Try to find matching vitals for this day
    const visitDay = formatIDDate(visit.created_at);
    const v = patientHistoryData?.vitals?.find((vit: any) => vit.created_at && formatIDDate(vit.created_at) === visitDay);
    
    if (v) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TANDA TANDA VITAL", 14, startY);
      doc.line(14, startY + 3, 196, startY + 3);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      const vitalsData: any[][] = [
        [{ content: 'Tensi Darah', styles: { fontStyle: 'bold' as const } }, v.blood_pressure ? `${v.blood_pressure} mmHg` : '-'],
        [{ content: 'Nadi / Heart Rate', styles: { fontStyle: 'bold' as const } }, v.heart_rate ? `${v.heart_rate} bpm` : '-'],
        [{ content: 'Suhu Tubuh', styles: { fontStyle: 'bold' as const } }, v.temperature ? `${v.temperature} °C` : '-'],
        [{ content: 'SpO2', styles: { fontStyle: 'bold' as const } }, v.oxygen_saturation ? `${v.oxygen_saturation} %` : '-'],
        [{ content: 'Tinggi/Berat', styles: { fontStyle: 'bold' as const } }, `${v.height || '-'} cm / ${v.weight || '-'} kg`]
      ];
      
      autoTable(doc, {
        startY: startY + 7,
        body: vitalsData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 } },
        margin: { left: 14 }
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // SOAP
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PEMERIKSAAN KLINIS (SOAP)", 14, startY);
    doc.line(14, startY + 3, 196, startY + 3);
    
    const soapData = [
      [{ content: 'Subjective (S):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, visit.subjective || '-'],
      [{ content: 'Objective (O):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, visit.objective || '-'],
      [{ content: 'Assessment (A):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, visit.diagnosis || '-'],
      [{ content: 'Plan (P):', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } }, visit.plan || '-']
    ];

    autoTable(doc, {
      startY: startY + 7,
      body: soapData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 40, fillColor: [248, 250, 252] }, 1: { cellWidth: 'auto' } },
      margin: { left: 14, right: 14 }
    });
    startY = (doc as any).lastAutoTable.finalY + 10;

    // ANC & USG
    const vAnc = patientHistoryData?.anc?.find((a: any) => a.created_at && formatIDDate(a.created_at) === visitDay);
    if (vAnc) {
      if (startY > 250) { doc.addPage(); startY = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("PEMERIKSAAN ANC", 14, startY);
      doc.line(14, startY + 3, 196, startY + 3);
      
      const ancData = [
        [{ content: 'Usia Kehamilan:', styles: { fontStyle: 'bold' as const } }, vAnc.gestational_age ? vAnc.gestational_age + ' Mgg' : '-', { content: 'HPL:', styles: { fontStyle: 'bold' as const } }, vAnc.estimated_delivery_date || '-'],
        [{ content: 'TFU:', styles: { fontStyle: 'bold' as const } }, vAnc.tfu || '-', { content: 'DJJ:', styles: { fontStyle: 'bold' as const } }, vAnc.djj || '-'],
        [{ content: 'Leopold 1:', styles: { fontStyle: 'bold' as const } }, vAnc.leopold_1 || '-', { content: 'Leopold 2:', styles: { fontStyle: 'bold' as const } }, vAnc.leopold_2 || '-'],
        [{ content: 'Leopold 3:', styles: { fontStyle: 'bold' as const } }, vAnc.leopold_3 || '-', { content: 'Leopold 4:', styles: { fontStyle: 'bold' as const } }, vAnc.leopold_4 || '-']
      ];

      autoTable(doc, {
        startY: startY + 7,
        body: ancData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 14 }
      });
      startY = (doc as any).lastAutoTable.finalY + 10;

      // Tabulated USG
      if (vAnc.usg_bpd || vAnc.usg_tbj || vAnc.usg_image) {
        if (startY > 250) { doc.addPage(); startY = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("HASIL USG (TABULASI)", 14, startY);
        doc.line(14, startY + 3, 196, startY + 3);
        
        const usgData = [
          ['BPD', vAnc.usg_bpd || '-', 'HC', vAnc.usg_hc || '-'],
          ['AC', vAnc.usg_ac || '-', 'FL', vAnc.usg_fl || '-'],
          ['TBJ (EFW)', vAnc.usg_tbj || '-', 'AFI', vAnc.usg_afi || '-'],
          ['Placenta', vAnc.usg_placenta || '-', 'Posisi', vAnc.usg_presentation || '-']
        ];
        
        autoTable(doc, {
          startY: startY + 7,
          head: [['Parameter', 'Hasil', 'Parameter', 'Hasil']],
          body: usgData,
          theme: 'grid',
          headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold' as const },
          styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
          margin: { left: 14, right: 14 }
        });
        startY = (doc as any).lastAutoTable.finalY + 10;

        if (vAnc.usg_image) {
           let images: string[] = [];
           try {
             if (vAnc.usg_image.startsWith('[')) images = JSON.parse(vAnc.usg_image);
             else images = [vAnc.usg_image];
           } catch(e) { images = [vAnc.usg_image]; }

           for (const imgSrc of images) {
             try {
                if (startY > 230) { doc.addPage(); startY = 20; }
                const imgProps = doc.getImageProperties(imgSrc);
                const pdfWidth = 80;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                doc.addImage(imgSrc, 'JPEG', 14, startY, pdfWidth, pdfHeight);
                startY += pdfHeight + 6;
             } catch(e) { }
           }
        }
      }
    }

    if (visit.usg_image_notes || (visit.usg_image && !vAnc)) {
      if (startY > 250) { doc.addPage(); startY = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("HASIL USG / PENCITRAAN", 14, startY);
      doc.line(14, startY + 3, 196, startY + 3);
      startY += 8;

      if (visit.usg_image_notes) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const notesText = doc.splitTextToSize(visit.usg_image_notes, 182);
        doc.text(notesText, 14, startY);
        startY += (notesText.length * 5) + 5;
      }

      if (visit.usg_image) {
         let images: string[] = [];
         try {
           if (visit.usg_image.startsWith('[')) images = JSON.parse(visit.usg_image);
           else images = [visit.usg_image];
         } catch(e) { images = [visit.usg_image]; }

         for (const imgSrc of images) {
           try {
              if (startY > 230) { doc.addPage(); startY = 20; }
              const imgProps = doc.getImageProperties(imgSrc);
              const pdfWidth = 80;
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
              doc.addImage(imgSrc, 'JPEG', 14, startY, pdfWidth, pdfHeight);
              startY += pdfHeight + 6;
           } catch(e) { }
         }
      }
    }

    // Resep
    const rxs = patientHistoryData?.prescriptions?.filter((p: any) => p.soap_id === visit.id || (p.created_at && formatIDDate(p.created_at) === visitDay));
    if (rxs && rxs.length > 0) {
      if (startY > 250) { doc.addPage(); startY = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DAFTAR RESEP OBAT", 14, startY);
      doc.line(14, startY + 3, 196, startY + 3);
      
      const rxTableBody = rxs.map((r: any, idx: number) => [
        idx + 1,
        r.drug_name || 'Obat',
        `${r.quantity} ${r.drug_unit || 'Pcs'}`,
        r.dosage || '-',
        r.notes || '-'
      ]);

      autoTable(doc, {
        startY: startY + 6,
        head: [['No', 'Nama Obat/Alkes', 'Jumlah', 'Aturan Pakai', 'Keterangan']],
        body: rxTableBody,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Billing
    const bill = patientHistoryData?.billings?.find((b: any) => b.created_at && formatIDDate(b.created_at) === visitDay);
    if (bill && bill.items) {
      let items = [];
      try { items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items; } catch(e){}
      
      if (items.length > 0) {
        if (startY > 250) { doc.addPage(); startY = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("RINGKASAN BIAYA", 14, startY);
        doc.line(14, startY + 3, 196, startY + 3);

        const billTableBody = items.map((item: any, idx: number) => [
          idx + 1,
          item.description,
          `Rp. ${item.amount.toLocaleString('id-ID')}`
        ]);
        
        billTableBody.push([
          { content: 'TOTAL PEMBAYARAN', colSpan: 2, styles: { fontStyle: 'bold' as const, halign: 'right' as const } },
          { content: `Rp. ${bill.total_amount.toLocaleString('id-ID')}`, styles: { fontStyle: 'bold' as const } }
        ]);

        autoTable(doc, {
          startY: startY + 6,
          head: [['No', 'Deskripsi Layanan / Obat', 'Biaya']],
          body: billTableBody,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 40, halign: 'right' } },
          margin: { left: 14, right: 14 }
        });
        startY = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    const targetClinicId = visit?.clinic_id || currentUser?.clinic_id;
    let logos = [];
    try {
      const activeClinic = clinicsInfo.find(c => String(c.id) === String(targetClinicId));
      if (activeClinic?.sponsor_logo) {
         logos = activeClinic.sponsor_logo.startsWith('[') ? JSON.parse(activeClinic.sponsor_logo) : [activeClinic.sponsor_logo];
      }
    } catch(e) {}
    
    if (logos.length > 0) {
      let logoX = 14; 
      let logoMaxHeight = 15;
      let bottomY = 270;
      
      logos.forEach(logoStr => {
         try {
            const props = doc.getImageProperties(logoStr);
            const ratio = props.width / props.height;
            const drawW = logoMaxHeight * ratio;
            doc.addImage(logoStr, 'PNG', logoX, bottomY, drawW, logoMaxHeight);
            logoX += drawW + 5; 
         } catch(e) {}
      });
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text(`Dicetak pada ${formatIDDateTime(new Date())} | Dokumen ini valid tanpa tanda tangan fisik`, 105, 285, { align: 'center' });

    doc.save(`Ringkasan_Kunjungan_${patientName.replace(/\s+/g, '_')}_${visitDate.replace(/[\/:]/g, '-')}.pdf`);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // slate-900
    doc.text(currentUser?.clinic_name?.toUpperCase() || "KLINIK NURHEALTH", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Laporan Strategis ERP", 105, 28, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    
    const targetClinicId = forcedClinicFilter || currentUser?.clinic_id;
    const activeClinic = clinicsInfo.find(c => String(c.id) === String(targetClinicId));
    

    doc.text(`Generated: ${formatIDDateTime(new Date())}`, 105, 34, { align: "center" });
    
    if (currentUser?.clinic_name) {
      doc.text(`Clinic: ${currentUser.clinic_name}`, 105, 40, { align: "center" });
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 45, 196, 45);

    // Summary Metrics
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Executive Summary", 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `Rp ${summaryData.totalRevenue?.toLocaleString()}`],
        ["Patient Volume", `${summaryData.patientCount} Souls`],
        ["Pharmacy Inventory", `${summaryData.drugCount} SKUs`],
        ["Avg Processing Time", "24.5 m (Target < 20m)"]
      ],
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 100 },
        1: { cellWidth: 80 }
      },
      theme: "grid"
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Monthly Revenue Breakdown Data
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Revenue Dynamics (Monthly)", 14, finalY);

    const revenueBody = stats.revChartData
      .filter((data: any) => data.revenue > 0)
      .map((data: any) => [data.month, `Rp ${data.revenue.toLocaleString()}`]);
    
    if(revenueBody.length === 0) {
      revenueBody.push(["No data", "Rp 0"]);
    }

    autoTable(doc, {
      startY: finalY + 5,
      head: [["Month", "Revenue"]],
      body: revenueBody,
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      theme: "striped"
    });

    const nextY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Demographics (Gender Distribution)", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Gender", "Volume"]],
      body: stats.genderStats.map((data: any) => [data.name, data.value]),
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      theme: "striped"
    });

    // Footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Nurhealth Systems \u00A9 2024 - Page ${i} of ${pageCount}`,
            105,
            290,
            { align: 'center' }
        );
    }
    
    // Add logos at the bottom of the last page
    let logos = [];
    try {
      const activeClinic = clinicsInfo.find(c => String(c.id) === String(targetClinicId));
      if (activeClinic?.sponsor_logo) {
         logos = activeClinic.sponsor_logo.startsWith('[') ? JSON.parse(activeClinic.sponsor_logo) : [activeClinic.sponsor_logo];
      }
    } catch(e) {}
    
    if (logos.length > 0) {
      let logoX = 14; 
      let logoMaxHeight = 15;
      let bottomY = 270;
      
      logos.forEach(logoStr => {
         try {
            const props = doc.getImageProperties(logoStr);
            const ratio = props.width / props.height;
            const drawW = logoMaxHeight * ratio;
            doc.addImage(logoStr, 'PNG', logoX, bottomY, drawW, logoMaxHeight);
            logoX += drawW + 5; 
         } catch(e) {}
      });
    }

    doc.save(`Laporan_Strategis_${currentUser?.clinic_name || 'NURHEALTH'}.pdf`);
  };

  const dashboardMetrics = useMemo(() => {
    const pStats = {
      waiting: patientsInfo.filter(p => p.status === 'Menunggu').length,
      inAction: patientsInfo.filter(p => p.status === 'Diperiksa' || p.status === 'Dalam Tindakan').length,
      finished: patientsInfo.filter(p => p.status === 'Selesai' || p.status === 'Lunas').length,
      total: patientsInfo.length
    };

    const bStats = {
      total: bedsInfo.length,
      occupied: bedsInfo.filter(b => b.status === 'Terisi').length,
      available: bedsInfo.filter(b => b.status === 'Tersedia').length,
      rate: bedsInfo.length > 0 ? Math.round((bedsInfo.filter(b => b.status === 'Terisi').length / bedsInfo.length) * 100) : 0
    };

    // Revenue by date (last 7 days)
    const revMap: {[key: string]: number} = {};
    let todayRevenue = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    billingsData.forEach(b => {
      const date = b.created_at?.split('T')[0] || 'Unknown';
      const total = (b.items || []).reduce((sum: number, item: any) => sum + item.amount, 0);
      revMap[date] = (revMap[date] || 0) + total;
      if (date === todayStr) {
        todayRevenue += total;
      }
    });

    const revChartData = Object.entries(revMap)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, amount]) => ({
        day: date.split('-').slice(1).join('/'),
        revenue: amount
      }));

    // --- PATIENT ANALYTICS CALCULATION ---
    const calculateAge = (dob: string) => {
      if (!dob) return 0;
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    };

    const ageDistribution = [
      { range: 'Pediatrik (0-12)', count: 0, color: '#3B82F6' },
      { range: 'Remaja (13-18)', count: 0, color: '#6366F1' },
      { range: 'Dewasa Muda (19-35)', count: 0, color: '#8B5CF6' },
      { range: 'Dewasa Matang (36-55)', count: 0, color: '#EC4899' },
      { range: 'Lansia (55+)', count: 0, color: '#F43F5E' },
    ];

    const genderStats = [
      { name: 'Laki-laki', value: 0, color: '#0EA5E9' },
      { name: 'Perempuan', value: 0, color: '#D946EF' }
    ];

    patientsInfo.forEach(p => {
      const age = parseInt(p.age);
      if (!isNaN(age)) {
        if (age <= 12) ageDistribution[0].count++;
        else if (age <= 18) ageDistribution[1].count++;
        else if (age <= 35) ageDistribution[2].count++;
        else if (age <= 55) ageDistribution[3].count++;
        else ageDistribution[4].count++;
      }

      if (p.gender === 'Laki-laki') genderStats[0].value++;
      else if (p.gender === 'Perempuan') genderStats[1].value++;
    });

    // Monthly trends from database
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const realGrowthMap: {[key: string]: number} = {};
    patientsInfo.forEach(p => {
       const d = new Date(p.created_at || Date.now());
       const m = months[d.getMonth()];
       realGrowthMap[m] = (realGrowthMap[m] || 0) + 1;
    });

    const activeGrowth = months.map(m => ({ 
      month: m, 
      count: (realGrowthMap[m] || 0)
    }));

    // Child Clinical Coverage
    const totalChildren = groupedPatients.reduce((sum, parent) => sum + (parent.children?.length || 0), 0);
    const avgChildren = groupedPatients.length > 0 ? (totalChildren / groupedPatients.length).toFixed(1) : 0;

    // Simulated Retention based on status (e.g., % patients who finished)
    const retentionRate = patientsInfo.length > 0 ? Math.round((patientsInfo.filter(p => p.status === 'Selesai' || p.status === 'Lunas').length / patientsInfo.length) * 100) : 0;

    // Diagnosis proportion calculation
    const diagnosisCounts: {[key: string]: number} = {};
    patientsInfo.forEach(p => {
      let diag = p.diagnosis || 'Umum';
      if (p.soap && p.soap.diagnosis) {
        diag = p.soap.diagnosis;
      } else if (p.anc) {
        diag = 'Pemeriksaan ANC (Kehamilan)';
      }
      diagMapKey: // Let's simplify diagnosis format
      diag = diag.trim();
      if (!diag) diag = 'Umum';
      diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
    });

    const diagColors = ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'];
    const diagnosisStats = Object.entries(diagnosisCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((item, index) => ({
        ...item,
        color: diagColors[index % diagColors.length]
      }));

    return { pStats, bStats, revChartData, ageDistribution, genderStats, activeGrowth, totalChildren, avgChildren, todayRevenue, retentionRate, diagnosisStats };
  }, [patientsInfo, bedsInfo, billingsData, groupedPatients]);

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const targetDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // H-3 (3 days from now)

    const isWithin3Days = (dateStr: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      d.setHours(0,0,0,0);
      return d >= today && d <= targetDate;
    };

    const reminders: any[] = [];
    
    // Add regular appointments
    appointments.forEach(appt => {
      if (appt.status !== 'Completed' && appt.status !== 'Cancelled' && isWithin3Days(appt.appointment_date)) {
        const patient = patientsInfo.find(p => String(p.id) === String(appt.patient_id));
        if (patient) {
          reminders.push({
            id: `appt-${appt.id}`,
            patient: patient,
            dateText: formatIDDateTime(appt.appointment_date),
            title: appt.title || 'Jadwal Kontrol',
            type: 'Jadwal Reguler',
            dateValue: new Date(appt.appointment_date)
          });
        }
      }
    });

    // Add predicted ANC control
    patientsInfo.forEach(p => {
      if (p.is_pregnant === 1 && p.anc && p.anc.next_checkup_date) {
         if (isWithin3Days(p.anc.next_checkup_date)) {
            // make sure we don't have exactly the same appointment booked already
            const existing = appointments.find(a => 
              String(a.patient_id) === String(p.id) && a.appointment_date === p.anc.next_checkup_date
            );
            if (!existing) {
              reminders.push({
                 id: `anc-${p.id}`,
                 patient: p,
                 dateText: formatIDDateTime(p.anc.next_checkup_date),
                 title: 'Kontrol Kembali Kehamilan',
                 type: 'Kontrol ANC',
                 dateValue: new Date(p.anc.next_checkup_date)
              });
            }
         }
      }
    });

    // Sort ascending by date
    reminders.sort((a, b) => a.dateValue.getTime() - b.dateValue.getTime());

    return reminders;
  }, [appointments, patientsInfo]);

  const displayedClinicName = useMemo(() => {
    if (!currentUser) return 'Medical ERP';
    const found = clinicsInfo.find(c => String(c.id) === String(currentUser.clinic_id));
    return found ? found.name : (currentUser.clinic_name || 'Medical ERP');
  }, [clinicsInfo, currentUser]);

  useEffect(() => {
    if (editingItem && (modalType === 'childrenList' || modalType === 'newChild' || modalType === 'addImmunization' || modalType === 'addGrowth')) {
      const updated = patientsInfo.find((p: any) => p.id === editingItem.id);
      if (updated) setEditingItem(updated);
      
      if (selectedChild) {
        const updatedChild = updated?.children?.find((c: any) => c.id === selectedChild.id);
        if (updatedChild) setSelectedChild(updatedChild);
      }
    }
  }, [patientsInfo]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadInitial = async () => {
        if (!hasLoadedInitial) setIsDataLoading(true);
        const promises: (void | Promise<any>)[] = [];
        const add = (fetchFn: any) => { const p = fetchFn(); if(p instanceof Promise) promises.push(p); };
        
        add(fetchClinics);
        add(fetchPatients);
        add(fetchBeds);
        add(fetchBillings);
        add(fetchShifts);
        add(fetchSummary);
        add(fetchUsers);
        add(fetchAttendances);
        add(fetchCoa);
        add(fetchTariffs);
        add(fetchMargins);
        add(fetchDrugs);
        add(fetchAppointments);

        await Promise.allSettled(promises);
        if (!hasLoadedInitial) {
           setIsDataLoading(false);
           setHasLoadedInitial(true);
        }
      };
      
      loadInitial();
    }
  }, [isAuthenticated, adminSubTab, activeTab, currentUser, forcedClinicFilter]);

  // Polling mechanism (10s) for patients (queue, vitals, dashboard)
  useEffect(() => {
    let pollingTimer: any;
    if (isAuthenticated && (activeTab === 'dashboard' || activeTab === 'doctorDashboard' || activeTab === 'queue' || activeTab === 'patients' || activeTab === 'doctorSOAP')) {
      pollingTimer = setInterval(() => {
        // Poll for updates in real-time
        fetch(`/api/patients?clinicId=${forcedClinicFilter === null && (currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin' || currentUser?.role === 'Dokter') ? '' : (forcedClinicFilter || currentUser?.clinic_id || '')}&role=${currentUser?.role}`)
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            if (Array.isArray(data)) {
               setPatientsInfo(data);
            }
          })
          .catch(() => {});
      }, 10000);
    }
    return () => clearInterval(pollingTimer);
  }, [isAuthenticated, activeTab, currentUser, forcedClinicFilter]);

  const handleLogin = async (data: LoginRequestDto): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        if (resData.success) {
          setIsAuthenticated(true);
          setCurrentUser(resData.user);
          localStorage.setItem('nhc_user', JSON.stringify(resData.user));
          resolve();
        } else {
          reject(new Error('Username atau password salah.'));
        }
      } catch(err) {
        reject(new Error('Gagal terhubung ke server'));
      }
    });
  };

      const handleClinicLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        alert('Logo file path too large. Use max 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
         let existing = [];
         try {
             if (clinicForm.sponsor_logo) {
                 if (clinicForm.sponsor_logo.startsWith('[')) {
                     existing = JSON.parse(clinicForm.sponsor_logo);
                 } else {
                     existing = [clinicForm.sponsor_logo];
                 }
             }
         } catch(e){}
         existing.push(reader.result as string);
         setClinicForm({ ...clinicForm, sponsor_logo: JSON.stringify(existing) });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      if (editingItem) {
        const res = await fetch(`/api/clinics/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clinicForm)
        });
        if (res.ok && currentUser && Number(editingItem.id) === Number(currentUser.clinic_id)) {
          const updatedUser = { ...currentUser, clinic_name: clinicForm.name };
          setCurrentUser(updatedUser);
          localStorage.setItem('nhc_user', JSON.stringify(updatedUser));
        }
      } else {
        await fetch('/api/clinics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clinicForm)
        });
      }
      fetchClinics();
      setModalType('none');
    });
  };

  const saveDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...drugForm, clinic_id: drugForm.clinic_id || forcedClinicFilter || currentUser?.clinic_id };
      if (!payload.clinic_id && currentUser?.clinic_id) payload.clinic_id = currentUser.clinic_id;
      if (editingItem) {
        await fetch('/api/drugs/' + editingItem.id, {
          method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/drugs', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
      }
      fetchDrugs();
      setModalType('none');
    });
  };

  const openUserModal = (user: any = null) => {
    if (user) {
      setEditingItem(user);
      setUserForm({ username: user.username, password: '', name: user.name, role: user.role, clinic_id: user.clinic_id?.toString() || '', status: user.status, phone: user.phone || '', accessible_menus: user.accessible_menus || '' });
    } else {
      setEditingItem(null);
      setUserForm({ username: '', password: '', name: '', role: 'Suster', clinic_id: currentUser?.clinic_id?.toString() || '', status: 'Active', phone: '', accessible_menus: '' });
    }
    setModalType('user');
  };

  const openBedModal = (bed: any = null) => {
    if (bed) {
      setEditingItem(bed);
      setBedForm({ id: bed.id, room: bed.room, class: bed.class, status: bed.status });
    } else {
      setEditingItem(null);
      setBedForm({ id: '', room: '', class: 'Kelas 1', status: 'KOSONG' });
    }
    setModalType('bed');
  };

  const openShiftModal = (shift: any = null) => {
    if (shift) {
      setEditingItem(shift);
      setShiftForm({ date: shift.date, user: shift.user, shift: shift.shift });
    } else {
      setEditingItem(null);
      setShiftForm({ date: '', user: '', shift: 'Pagi (07:00-15:00)' });
    }
    setModalType('shift');
  };

  const openTariffModal = (tariff: any = null) => {
    if (tariff) {
      setEditingItem(tariff);
      setTariffForm({ action_name: tariff.action_name, patient_class: tariff.patient_class, price: tariff.price, coa_account_id: tariff.coa_account_id || '' });
    } else {
      setEditingItem(null);
      setTariffForm({ action_name: '', patient_class: 'Reguler', price: 0, coa_account_id: '' });
    }
    setModalType('tariff');
  };

  const openMarginModal = (margin: any = null) => {
    if (margin) {
      setEditingItem(margin);
      setMarginForm({ patient_class: margin.patient_class, margin_percentage: margin.margin_percentage });
    } else {
      setEditingItem(null);
      setMarginForm({ patient_class: 'Reguler', margin_percentage: 10 });
    }
    setModalType('margin');
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...userForm };
      if (!payload.password) delete (payload as any).password;
      if (!payload.clinic_id && currentUser?.clinic_id) payload.clinic_id = currentUser.clinic_id.toString();

      if (editingItem) {
        const res = await fetch(`/api/users/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok && currentUser && Number(editingItem.id) === Number(currentUser.id)) {
          const updatedUser = await res.json();
          setCurrentUser(updatedUser);
          localStorage.setItem('nhc_user', JSON.stringify(updatedUser));
        }
      } else {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchUsers();
      setModalType('none');
    });
  };

  const saveBed = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...bedForm, clinic_id: currentUser?.clinic_id };
      if (editingItem) {
        await fetch(`/api/beds/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/beds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchBeds();
      setModalType('none');
    });
  };

  const saveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...shiftForm, clinic_id: currentUser?.clinic_id };
      if (editingItem) {
        await fetch(`/api/shifts/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchShifts();
      setModalType('none');
    });
  };

  const saveTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...tariffForm, clinic_id: currentUser?.clinic_id };
      if (editingItem) {
        await fetch(`/api/tariffs/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/tariffs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchTariffs();
      setModalType('none');
    });
  };

  const saveMargin = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...marginForm, clinic_id: currentUser?.clinic_id };
      if (editingItem) {
        await fetch(`/api/margins/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/margins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      fetchMargins();
      setModalType('none');
    });
  };

  const deleteUser = async (id: number) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };
  const deleteBed = async (id: string) => {
    await fetch(`/api/beds/${id}`, { method: 'DELETE' });
    fetchBeds();
  };
  const deleteShift = async (id: number) => {
    await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
    fetchShifts();
  };
  const deleteTariff = async (id: number) => {
    await fetch(`/api/tariffs/${id}`, { method: 'DELETE' });
    fetchTariffs();
  };
  const deleteMargin = async (id: number) => {
    await fetch(`/api/margins/${id}`, { method: 'DELETE' });
    fetchMargins();
  };
  const deletePatient = async (id: number) => {
    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    fetchPatients();
  };


  const fetchStockHistory = async (drug: any) => {
    setSelectedDrug(drug);
    setStockHistoryData([]);
    setModalType('stockHistory');
    try {
      const res = await fetch(`/api/drugs/${drug.id}/logs`);
      const data = await res.json();
      setStockHistoryData(data);
    } catch (e) {
      console.error(e);
    }
  };
  const openBillingModal = () => {
    setEditingItem(null);
    setBillingForm({ patient_name: '', patient_id: null, patient_class: 'Reguler', payment_method: 'Cash', payment_account_id: '', items: [{description: 'Pendaftaran', amount: 0}] });
    setModalType('billing');
  };

  const handleProcessBilling = async (patient: any) => {
     setEditingItem(patient);
     // Default items
     let items = [
       { description: 'Biaya Konsultasi Dokter', amount: 50000 },
       { description: 'Biaya Administrasi', amount: 10000 }
     ];

     // Fetch prescriptions for this patient
     try {
        const res = await fetch(`/api/patients/${patient.id}/history`);
        const history = await res.json();
        // Match prescriptions from today or latest soap encounter
        if (history.soap && history.soap.length > 0) {
           const latestSoap = history.soap[0];
           const rx = history.prescriptions?.filter((p: any) => p.soap_id === latestSoap.id);
           if (rx && rx.length > 0) {
              rx.forEach((r: any) => {
                 // Try to find drug price
                 const drug = drugsInfo.find(d => d.id === r.drug_id);
                 const price = drug ? drug.price : 0;
                 items.push({
                    description: `Obat: ${r.drug_name || 'Obat'} (${r.quantity} ${r.drug_unit || 'Unit'})`,
                    amount: price * r.quantity
                 });
              });
           }
        }
     } catch (e) {
        console.error("Error fetching prescriptions for billing:", e);
     }

     setBillingForm({
        patient_name: patient.name,
        patient_id: patient.id,
        patient_class: 'Reguler',
        payment_method: 'Cash',
        payment_account_id: '',
        items: items
     });
     setModalType('billing');
  };

  const openPatientModal = (patient: any = null, newVisit: boolean = false) => {
    setIsNewVisit(newVisit);
    setInnerPatientSearch('');
    if (patient) {
      if (newVisit) {
        setEditingItem(null);
        setPatientForm({ rm_number: patient.rm_number || patient.id.toString().padStart(6, '0'), name: patient.name, age: patient.age || '', gender: patient.gender || 'Laki-laki', address: patient.address || '', phone: patient.phone || '', complaint: '', status: 'Menunggu', allergies: patient.allergies || '', fall_risk: patient.fall_risk || 'Rendah', is_pregnant: !!patient.is_pregnant, is_child: false, child_birth_date: '', clinic_id: patient.clinic_id || currentUser?.clinic_id || '', registration_images: [] });
        setVitalsForm({ blood_pressure: '', temperature: '', heart_rate: '', respiratory_rate: '', oxygen_saturation: '', weight: '', height: '', pain_score: '', triage_level: '', triage_notes: '' });
        
        const existingHpht = patient.anc?.hpht || '';
        setAncForm({ 
          hpht: existingHpht, 
          gestational_age: existingHpht ? calculateGestationalAge(existingHpht) : (patient.anc?.gestational_age || ''), 
          estimated_delivery_date: existingHpht ? calculateHPL(existingHpht) : (patient.anc?.estimated_delivery_date || ''), 
          tfu: '', leopold_1: '', leopold_2: '', leopold_3: '', leopold_4: '', djj: '', poedji_rochjati_score: '', fetal_development: '', next_checkup_date: '', usg_bpd: '', usg_hc: '', usg_ac: '', usg_fl: '', usg_tbj: '', usg_afi: '', usg_placenta: '', usg_presentation: '', usg_image: '', usg_image_notes: '' 
        });
      } else {
        setEditingItem(patient);
        setPatientForm({ rm_number: patient.rm_number || patient.id.toString().padStart(6, '0'), name: patient.name, age: patient.age || '', gender: patient.gender || 'Laki-laki', address: patient.address || '', phone: patient.phone || '', complaint: patient.complaint || '', status: patient.status || 'Menunggu', allergies: patient.allergies || '', fall_risk: patient.fall_risk || 'Rendah', is_pregnant: !!patient.is_pregnant, is_child: false, child_birth_date: '', clinic_id: patient.clinic_id || currentUser?.clinic_id || '', registration_images: [] });
        
        const existingHpht = patient.anc?.hpht || '';
        setVitalsForm(patient.vitals || { blood_pressure: '', temperature: '', heart_rate: '', respiratory_rate: '', oxygen_saturation: '', weight: '', height: '', pain_score: '', triage_level: '', triage_notes: '' });
        setAncForm(patient.anc || { 
          hpht: '', 
          gestational_age: '', 
          estimated_delivery_date: '', 
          tfu: '', leopold_1: '', leopold_2: '', leopold_3: '', leopold_4: '', djj: '', poedji_rochjati_score: '', fetal_development: '', next_checkup_date: '', usg_bpd: '', usg_hc: '', usg_ac: '', usg_fl: '', usg_tbj: '', usg_afi: '', usg_placenta: '', usg_presentation: '', usg_image: '', usg_image_notes: '' 
        });

        fetch(`/api/patients/${patient.id}/images`)
          .then(res => res.json())
          .then(images => {
             if (Array.isArray(images)) {
               setPatientForm(prev => ({...prev, registration_images: images.map(img => img.image_data)}));
             }
          }).catch(console.error);
        
        if (existingHpht) {
          setAncForm(prev => ({
            ...prev,
            gestational_age: calculateGestationalAge(existingHpht),
            estimated_delivery_date: calculateHPL(existingHpht)
          }));
        }
      }
    } else {
      setEditingItem(null);
      setPatientForm({ rm_number: '', name: '', age: '', gender: 'Laki-laki', address: '', phone: '', complaint: '', status: 'Menunggu', allergies: '', fall_risk: 'Rendah', is_pregnant: false, is_child: false, child_birth_date: '', clinic_id: currentUser?.role === 'Superadmin' ? forcedClinicFilter || '' : currentUser?.clinic_id || '', registration_images: [] });
      setVitalsForm({ blood_pressure: '', temperature: '', heart_rate: '', respiratory_rate: '', oxygen_saturation: '', weight: '', height: '', pain_score: '', triage_level: '', triage_notes: '' });
      setAncForm({ hpht: '', gestational_age: '', estimated_delivery_date: '', tfu: '', leopold_1: '', leopold_2: '', leopold_3: '', leopold_4: '', djj: '', poedji_rochjati_score: '', fetal_development: '', next_checkup_date: '', usg_bpd: '', usg_hc: '', usg_ac: '', usg_fl: '', usg_tbj: '', usg_afi: '', usg_placenta: '', usg_presentation: '', usg_image: '', usg_image_notes: '' });
    }
    setModalType('patient');
  };

  const openVitalsModal = (patient: any) => {
    setEditingItem(patient);
    if (patient.vitals) {
      setVitalsForm({
        blood_pressure: patient.vitals.blood_pressure || '',
        temperature: patient.vitals.temperature || '',
        heart_rate: patient.vitals.heart_rate || '',
        respiratory_rate: patient.vitals.respiratory_rate || '',
        oxygen_saturation: patient.vitals.oxygen_saturation || '',
        weight: patient.vitals.weight || '',
        height: patient.vitals.height || '',
        pain_score: patient.vitals.pain_score || '',
        triage_level: patient.vitals.triage_level || '',
        triage_notes: patient.vitals.triage_notes || ''
      });
    } else {
      setVitalsForm({ blood_pressure: '', temperature: '', heart_rate: '', respiratory_rate: '', oxygen_saturation: '', weight: '', height: '', pain_score: '', triage_level: '', triage_notes: '' });
    }
    setModalType('vitals');
  };

   const openAncModal = (patient: any) => {
    setEditingItem(patient);
    setEditingAncRecord(null);
    
    // Find latest ANC data from grouped history if not directly on patient
    let ancData = patient.anc;
    if (!ancData) {
      const pg = groupedPatients.find(x => (x.rm_number || x.id.toString().padStart(6, '0')) === (patient.rm_number || patient.id.toString().padStart(6, '0')));
      if (pg && pg.visits) {
        const visitWithAnc = pg.visits.find((v: any) => v.anc);
        if (visitWithAnc) ancData = visitWithAnc.anc;
      }
    }

    if (ancData) {
      const existingHpht = ancData.hpht || '';
      setAncForm({
        hpht: existingHpht,
        gestational_age: existingHpht ? calculateGestationalAge(existingHpht) : (ancData.gestational_age?.toString() || ''),
        estimated_delivery_date: existingHpht ? calculateHPL(existingHpht) : (ancData.estimated_delivery_date || ''),
        tfu: ancData.tfu || '',
        leopold_1: ancData.leopold_1 || '',
        leopold_2: ancData.leopold_2 || '',
        leopold_3: ancData.leopold_3 || '',
        leopold_4: ancData.leopold_4 || '',
        djj: ancData.djj || '',
        poedji_rochjati_score: ancData.poedji_rochjati_score || '',
        fetal_development: ancData.fetal_development || '',
        next_checkup_date: ancData.next_checkup_date || '',
        usg_bpd: ancData.usg_bpd || '',
        usg_hc: ancData.usg_hc || '',
        usg_ac: ancData.usg_ac || '',
        usg_fl: ancData.usg_fl || '',
        usg_tbj: ancData.usg_tbj || '',
        usg_afi: ancData.usg_afi || '',
        usg_placenta: ancData.usg_placenta || '',
        usg_presentation: ancData.usg_presentation || '',
        usg_image: ancData.usg_image || '',
        usg_image_notes: ancData.usg_image_notes || ''
      });
    } else {
      setAncForm({ 
         hpht: '',
         gestational_age: '', 
         estimated_delivery_date: '', 
         tfu: '',
         leopold_1: '',
         leopold_2: '',
         leopold_3: '',
         leopold_4: '',
         djj: '',
         poedji_rochjati_score: '',
         fetal_development: '', 
         next_checkup_date: '',
         usg_bpd: '',
         usg_hc: '',
         usg_ac: '',
         usg_fl: '',
         usg_tbj: '',
         usg_afi: '',
         usg_placenta: '',
         usg_presentation: '',
         usg_image: '',
         usg_image_notes: ''
      });
    }
    setModalType('anc');
  };

  const openEditAncModal = (record: any, patient: any) => {
    setEditingItem(patient);
    setEditingAncRecord(record);
    setAncForm({
      hpht: record.hpht || '',
      gestational_age: record.gestational_age?.toString() || '',
      estimated_delivery_date: record.estimated_delivery_date || '',
      tfu: record.tfu || '',
      leopold_1: record.leopold_1 || '',
      leopold_2: record.leopold_2 || '',
      leopold_3: record.leopold_3 || '',
      leopold_4: record.leopold_4 || '',
      djj: record.djj?.toString() || '',
      poedji_rochjati_score: record.poedji_rochjati_score?.toString() || '',
      fetal_development: record.fetal_development || '',
      next_checkup_date: record.next_checkup_date || '',
      usg_bpd: record.usg_bpd || '',
      usg_hc: record.usg_hc || '',
      usg_ac: record.usg_ac || '',
      usg_fl: record.usg_fl || '',
      usg_tbj: record.usg_tbj || '',
      usg_afi: record.usg_afi || '',
      usg_placenta: record.usg_placenta || '',
      usg_presentation: record.usg_presentation || '',
      usg_image: record.usg_image || '',
      usg_image_notes: record.usg_image_notes || ''
    });
    setModalType('anc');
  };

  const deleteAncRecord = async (recordId: number, patientId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan kunjungan ANC ini?')) {
      requestSave(async () => {
        await fetch(`/api/anc/${recordId}`, {
          method: 'DELETE'
        });
        fetchPatientHistory(patientId);
        fetchPatients();
      });
    }
  };

  const saveAnc = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      if (editingAncRecord) {
        await fetch(`/api/anc/${editingAncRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ancForm)
        });
        if (editingItem) {
          fetchPatientHistory(editingItem.id);
        }
      } else if (editingItem) {
        await fetch(`/api/patients/${editingItem.id}/anc`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ancForm)
        });
        await updatePatientStatus(editingItem.id, 'Menunggu Dokter');
      }
      fetchPatients();
      setEditingAncRecord(null);
      setModalType('none');
    });
  };

  const calculateHPL = (hphtDate: string) => {
    if (!hphtDate) return '';
    const date = new Date(hphtDate);
    date.setDate(date.getDate() + 280); // 40 weeks
    return date.toISOString().split('T')[0];
  };

  const calculateGestationalAge = (hphtDate: string) => {
    if (!hphtDate) return '';
    const hpht = new Date(hphtDate);
    const now = new Date();
    const diffTime = now.getTime() - hpht.getTime();
    if (diffTime < 0) return '0';
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7).toString();
  };

  const openInvoiceDetail = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsSponsorCovered(!!invoice.is_sponsor_covered);
    setModalType('invoiceDetail');
  };

  const generateInvoicePDF = () => {
    if (!selectedInvoice) return;

    const isThermal = printFormat === 'thermal';
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isThermal ? [80, 200] : 'a4'
    });

    const pageWidth = isThermal ? 80 : 210;
    const margin = isThermal ? 5 : 20;
    const centerX = pageWidth / 2;
    let currentY = 15;

    const targetClinicId = selectedInvoice?.clinic_id || currentUser?.clinic_id;
    const activeClinic = clinicsInfo.find(c => String(c.id) === String(targetClinicId));
    
    // Add logos at the top
    let logos = [];
    try {
      if (activeClinic?.sponsor_logo) {
         logos = activeClinic.sponsor_logo.startsWith('[') ? JSON.parse(activeClinic.sponsor_logo) : [activeClinic.sponsor_logo];
      }
    } catch(e) {}
    
    if (logos.length > 0) {
      if (isThermal) {
         let logoMaxHeight = 8;
         let logoX = centerX - (logos.length * 15) / 2;
         let logoY = currentY;
         logos.forEach(logoStr => {
            try {
               const props = doc.getImageProperties(logoStr);
               const ratio = props.width / props.height;
               const drawW = logoMaxHeight * ratio;
               doc.addImage(logoStr, 'PNG', logoX, logoY, drawW, logoMaxHeight);
               logoX += drawW + 2; 
            } catch(e) {}
         });
         currentY += logoMaxHeight + 5;
      }
    }

    // Clinic Logo / Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isThermal ? 14 : 22);
    doc.setTextColor(15, 23, 42); // slate-900
    const clinicName = currentUser?.clinic_name || 'NURHEALTH CONNECTION';
    doc.text(clinicName.toUpperCase(), centerX, currentY, { align: 'center' });
    
    currentY += isThermal ? 6 : 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isThermal ? 8 : 10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('JL. RAYA TERUSAN JAKARTA NO. 123, BANDUNG', centerX, currentY, { align: 'center' });
    currentY += isThermal ? 4 : 5;
    doc.text('TELP: (022) 123-4567 | EMAIL: CARE@NURHEALTH.ID', centerX, currentY, { align: 'center' });

    currentY += isThermal ? 6 : 12;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    currentY += isThermal ? 10 : 15;

    // Document Title & ID
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isThermal ? 10 : 16);
    doc.setTextColor(15, 23, 42);
    doc.text('KUITANSI PEMBAYARAN RESMI', isThermal ? centerX : margin, currentY, isThermal ? { align: 'center' } : undefined);
    
    if (!isThermal) {
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`#INV-${selectedInvoice.id.toString().padStart(6, '0')}`, pageWidth - margin, currentY, { align: 'right' });
    } else {
      currentY += 5;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`#INV-${selectedInvoice.id.toString().padStart(6, '0')}`, centerX, currentY, { align: 'center' });
    }

    currentY += isThermal ? 10 : 20;

    // Billing info (Left Column)
    doc.setFontSize(isThermal ? 8 : 10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    
    if (!isThermal) {
      doc.text('DITERIMA DARI:', margin, currentY);
      doc.text('INFORMASI TRANSAKSI:', pageWidth / 2 + 10, currentY);
      
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(selectedInvoice.patient_name.toUpperCase(), margin, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Waktu: ${formatIDDateTime(selectedInvoice.created_at)}`, pageWidth / 2 + 10, currentY);
      
      currentY += 5;
      doc.text(`No. Rekam Medis: RM-${selectedInvoice.patient_id || 'N/A'}`, margin, currentY);
      doc.text(`Metode: ${selectedInvoice.payment_method}`, pageWidth / 2 + 10, currentY);
      
      currentY += 5;
      doc.text(`Kelas Layanan: ${selectedInvoice.patient_class}`, margin, currentY);
      doc.text(`Petugas: ${currentUser?.name || 'ADMIN'}`, pageWidth / 2 + 10, currentY);
    } else {
      doc.text('PENERIMA:', margin, currentY);
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(selectedInvoice.patient_name.toUpperCase(), margin, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`RM-${selectedInvoice.patient_id || '-'} | ${selectedInvoice.patient_class}`, margin, currentY);
      
      currentY += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('DETAIL TRANSAKSI:', margin, currentY);
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`${formatIDDateTime(selectedInvoice.created_at)}`, margin, currentY);
      currentY += 4;
      doc.text(`Metode: ${selectedInvoice.payment_method} | Kasir: ${currentUser?.name}`, margin, currentY);
    }

    currentY += isThermal ? 10 : 20;

    // Service Description Table
    autoTable(doc, {
      startY: currentY,
      head: [['DESKRIPSI LAYANAN / OBAT', 'HARGA SATUAN']],
      body: selectedInvoice.items.map((item: any) => [
        item.description.toUpperCase(),
        `Rp ${item.amount.toLocaleString('id-ID')}`
      ]),
      theme: 'grid',
      styles: {
        fontSize: isThermal ? 7 : 10,
        cellPadding: isThermal ? 2 : 5,
        font: 'helvetica',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: isThermal ? 50 : undefined },
        1: { halign: 'right', font: 'helvetica', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Summary Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isThermal ? 10 : 14);
    doc.setTextColor(15, 23, 42);
    const totalLabel = 'TOTAL PEMBAYARAN:';
    const totalValue = `Rp ${isSponsorCovered ? '0' : selectedInvoice.total_amount.toLocaleString('id-ID')}`;
    
    // determine sponsor_name
    let computedSponsorName = 'Sponsor';
    const activeClinicSponsor = clinicsInfo.find(c => String(c.id) === String(selectedInvoice.clinic_id)) || clinicsInfo.find(c => String(c.id) === String(currentUser?.clinic_id));
    if (activeClinicSponsor?.sponsor_name) {
       computedSponsorName = activeClinicSponsor.sponsor_name;
    }

    if (isThermal) {
      doc.line(margin, finalY - 5, pageWidth - margin, finalY - 5);
      doc.text(totalLabel, margin, finalY);
      doc.text(totalValue, pageWidth - margin, finalY + 7, { align: 'right' });
      if (isSponsorCovered) {
         doc.setFontSize(8);
         doc.setTextColor(16, 185, 129); // emerald-500
         doc.text(`Telah dibayar oleh ${computedSponsorName}`, pageWidth - margin, finalY + 14, { align: 'right' });
      }
    } else {
      doc.text(totalLabel, pageWidth - 110, finalY);
      doc.text(totalValue, pageWidth - margin, finalY, { align: 'right' });
      if (isSponsorCovered) {
         doc.setFontSize(10);
         doc.setTextColor(16, 185, 129); // emerald-500
         doc.text(`Telah dibayar oleh ${computedSponsorName}`, pageWidth - margin, finalY + 6, { align: 'right' });
      }
    }

    // Signatures and Bottom Logos
    const sigY = finalY + (isThermal ? 20 : 40);
    if (!isThermal) {
      if (logos.length > 0) {
        let logoX = margin; 
        let logoMaxHeight = 25;
        let logoY = sigY - 10;
        
        logos.forEach(logoStr => {
           try {
              const props = doc.getImageProperties(logoStr);
              const ratio = props.width / props.height;
              const drawW = logoMaxHeight * ratio;
              doc.addImage(logoStr, 'PNG', logoX, logoY, drawW, logoMaxHeight);
              logoX += drawW + 5; 
           } catch(e) {}
        });
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Tertanda,', pageWidth - 60, sigY, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(currentUser?.name?.toUpperCase() || 'BAGIAN KASIR', pageWidth - 60, sigY + 25, { align: 'center' });
      doc.setDrawColor(226, 232, 240);
      doc.line(pageWidth - 90, sigY + 26, pageWidth - 30, sigY + 26);
      doc.setFontSize(8);
      doc.text('VERIFIKASI DIGITAL KUITANSI', pageWidth - 60, sigY + 31, { align: 'center' });
    } else {
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('KASIR:', centerX, sigY, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(currentUser?.name?.toUpperCase() || 'ADMIN', centerX, sigY + 12, { align: 'center' });
    }

    // Footer
    const footerY = sigY + (isThermal ? 25 : 50);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(isThermal ? 7 : 9);
    doc.setTextColor(148, 163, 184);
    const note = '* Bukti pembayaran ini sah dan dikeluarkan secara elektronik melalui Nurhealth ERP.';
    doc.text(note, centerX, footerY, { align: 'center' });

    doc.save(`Kuitansi_${selectedInvoice.patient_name.replace(/\s+/g, '_')}_${selectedInvoice.id}.pdf`);
  };

  const calculateTotalBilling = () => billingForm.items.reduce((sum, item) => sum + item.amount, 0);

  const openChildrenModal = (patient: any) => {
    setEditingItem(patient);
    setModalType('childrenList');
  };

  const openNewChildModal = () => {
    setChildForm({ name: '', gender: 'Laki-laki', birth_date: '', birth_time: '', birth_weight: '', birth_height: '', apgar_1min: '', apgar_5min: '', footprint_captured: false });
    setModalType('newChild');
  };

  const saveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    requestSave(async () => {
      await fetch(`/api/patients/${editingItem.id}/children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childForm)
      });
      fetchPatients();
      setModalType('childrenList'); // go back to list
    });
  };

  const saveImmunization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    requestSave(async () => {
      await fetch(`/api/children/${selectedChild.id}/immunizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(immunizationForm)
      });
      fetchPatients();
      setImmunizationForm({ vaccine_name: '', date_administered: '', notes: '' });
    });
  };

  const saveGrowth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    requestSave(async () => {
      await fetch(`/api/children/${selectedChild.id}/growth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(growthForm)
      });
      fetchPatients();
      setGrowthForm({ date_measured: '', age_months: '', weight: '', height: '', head_circumference: '', notes: '' });
    });
  };

  const saveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const total_amount = calculateTotalBilling();
      await fetch('/api/billings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...billingForm, total_amount, clinic_id: forcedClinicFilter || currentUser?.clinic_id || 1, is_sponsor_covered: isSponsorCovered })
      });
      if (billingForm.patient_id) {
         await updatePatientStatus(billingForm.patient_id, 'Lunas');
      }
      fetchBillings();
      setModalType('none');
    });
  };

  const savePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      const payload = { ...patientForm, clinic_id: patientForm.clinic_id || forcedClinicFilter || currentUser?.clinic_id };
      if (!payload.clinic_id && currentUser?.clinic_id) payload.clinic_id = currentUser.clinic_id;
      let patientId = editingItem?.id;

      if (editingItem) {
        await fetch(`/api/patients/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        patientId = data.id;
      }

      if (patientId) {
        // Save Vitals if any field is filled
        if (vitalsForm.blood_pressure || vitalsForm.temperature || vitalsForm.weight) {
          await fetch(`/api/patients/${patientId}/vitals`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vitalsForm)
          });
        }

        // Save ANC if pregnant and any field is filled
        if (patientForm.is_pregnant && (ancForm.hpht || ancForm.gestational_age)) {
          await fetch(`/api/patients/${patientId}/anc`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ancForm)
          });
        }
      }

      fetchPatients();
      setModalType('none');
      if (payload.status === 'Menunggu Dokter') {
        const hasVitals = vitalsForm.blood_pressure || vitalsForm.temperature || vitalsForm.weight || vitalsForm.heart_rate || vitalsForm.respiratory_rate || vitalsForm.oxygen_saturation;
        const fullPatient = {
          ...payload,
          id: patientId,
          vitals: hasVitals ? { ...vitalsForm } : null
        };
        triggerWhatsAppNotification(fullPatient);
      }
    });
  };

  const [referralForm, setReferralForm] = useState({
    destination_clinic: '',
    destination_doctor: '',
    reason: '',
    diagnosis: '',
    treatment_given: '',
    notes: ''
  });

  const openReferralModal = (patient: any) => {
    setEditingItem(patient);
    setReferralForm({
      destination_clinic: '',
      destination_doctor: '',
      reason: '',
      diagnosis: patient.soap?.diagnosis || '',
      treatment_given: patient.soap?.medication || '',
      notes: patient.soap?.subjective ? `Keluhan:\n${patient.soap.subjective}` : ''
    });
    setModalType('referralForm');
  };

  const generateReferralPDF = (patient: any, referral: any) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const activeClinic = clinicsInfo.find(c => String(c.id) === String(patient.clinic_id)) || clinicsInfo.find(c => String(c.id) === String(currentUser?.clinic_id)) || null;
    const clinicName = activeClinic?.name || 'Klinik Nurhealth';
    const clinicAddress = activeClinic?.address || 'Alamat Klinik';

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(clinicName, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(clinicAddress, 105, 26, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SURAT RUJUKAN MEDIS", 105, 45, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Content
    const startY = 60;
    const lineHeight = 7;
    doc.text(`Tujuan: ${referral.destination_clinic}`, 20, startY);
    if (referral.destination_doctor) {
      doc.text(`Kepada Yth. Dokter: ${referral.destination_doctor}`, 20, startY + lineHeight);
    }
    
    doc.text(`Bersama surat ini, kami merujuk pasien berikut:`, 20, startY + lineHeight * 3);
    
    doc.text(`Nama Pasien: ${patient.name}`, 30, startY + lineHeight * 4);
    doc.text(`No. Rekam Medis: ${patient.rm_number || patient.id.toString().padStart(6, '0')}`, 30, startY + lineHeight * 5);
    doc.text(`Umur: ${patient.age} Tahun`, 30, startY + lineHeight * 6);
    doc.text(`Jenis Kelamin: ${patient.gender}`, 30, startY + lineHeight * 7);

    doc.text(`Data Pemeriksaan Klinis:`, 20, startY + lineHeight * 9);
    
    // Auto-wrap text
    const diagnosisLines = doc.splitTextToSize(`Diagnosis: ${referral.diagnosis || '-'}`, 160);
    doc.text(diagnosisLines, 30, startY + lineHeight * 10);
    let currentY = startY + lineHeight * 10 + (diagnosisLines.length * lineHeight);

    const treatmentLines = doc.splitTextToSize(`Terapi yang telah diberikan: ${referral.treatment_given || '-'}`, 160);
    doc.text(treatmentLines, 30, currentY);
    currentY += treatmentLines.length * lineHeight;

    const reasonLines = doc.splitTextToSize(`Alasan Dirujuk: ${referral.reason}`, 160);
    doc.text(reasonLines, 30, currentY);
    currentY += reasonLines.length * lineHeight;

    if (referral.notes) {
      const notesLines = doc.splitTextToSize(`Catatan Tambahan: ${referral.notes}`, 160);
      doc.text(notesLines, 30, currentY);
      currentY += notesLines.length * lineHeight;
    }

    doc.text(`Mohon bantuan penanganan selanjutnya untuk pasien kami.`, 20, currentY + lineHeight);
    doc.text(`Atas bantuan dan kerjasamanya, kami ucapkan terima kasih.`, 20, currentY + lineHeight * 2);

    currentY += lineHeight * 4;
    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(dateStr, 140, currentY);
    doc.text(`Dokter Perujuk,`, 140, currentY + lineHeight);
    
    doc.setFont("helvetica", "bold");
    doc.text(currentUser?.name || 'Dokter', 140, currentY + lineHeight * 4);

    doc.save(`Rujukan_${patient.name.replace(/\\s+/g, '_')}_${new Date().getTime()}.pdf`);
  };

  const saveReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const resp = await fetch(`/api/patients/${editingItem.id}/referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...referralForm,
          doctor_id: currentUser?.id,
          soap_id: editingItem.soap?.id,
          clinic_id: editingItem.clinic_id
        })
      });
      if (resp.ok) {
        const result = await resp.json();
        setModalType('none');
        alert('Rujukan berhasil dibuat');
        generateReferralPDF(editingItem, result);
        fetchPatients();
      } else {
        const errorData = await resp.json();
        alert('Gagal membuat rujukan: ' + errorData.error);
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan rujukan');
    }
  };

  const openSoapModal = (patient: any) => {
    setEditingItem(patient);
    setPrescriptions([]);
    fetchPrescriptions(patient.id);
    setSelectedPatientImages([]);
    fetch(`/api/patients/${patient.id}/images`)
      .then(res => res.json())
      .then(images => {
         if (Array.isArray(images)) setSelectedPatientImages(images);
      }).catch(console.error);

    if (patient.soap) {
      setSoapForm({
        subjective: patient.soap.subjective || '',
        objective: patient.soap.objective || '',
        assessment: patient.soap.assessment || '',
        plan: patient.soap.plan || '',
        diagnosis: patient.soap.diagnosis || '',
        medication: patient.soap.medication || '',
        lab_orders: patient.soap.lab_orders || '',
        radiology_orders: patient.soap.radiology_orders || '',
        lab_results: patient.soap.lab_results || '',
        radiology_results: patient.soap.radiology_results || '',
        followup_recommendations: patient.soap.followup_recommendations || '',
        usg_image: patient.soap.usg_image || patient.anc?.usg_image || '',
        usg_image_notes: patient.soap.usg_image_notes || patient.anc?.usg_image_notes || ''
      });
    } else {
      // Auto-prefill subjective & objective from triage info if creating a new SOAP form
      const defaultSubjective = patient.complaint && patient.complaint !== '-' ? `Keluhan Triage: ${patient.complaint}` : '';
      
      let defaultObjective = '';
      if (patient.vitals) {
        const v = patient.vitals;
        const parts = [];
        if (v.blood_pressure) parts.push(`TD: ${v.blood_pressure} mmHg`);
        if (v.temperature) parts.push(`Suhu: ${v.temperature} °C`);
        if (v.heart_rate) parts.push(`Nadi: ${v.heart_rate} bpm`);
        if (v.respiratory_rate) parts.push(`Nafas: ${v.respiratory_rate} x/m`);
        if (v.oxygen_saturation) parts.push(`SpO2: ${v.oxygen_saturation} %`);
        if (v.weight || v.height) parts.push(`BB/TB: ${v.weight || '-'} kg / ${v.height || '-'} cm`);
        if (parts.length > 0) {
          defaultObjective = `Tanda Vital Triage:\n${parts.map(p => `• ${p}`).join('\n')}`;
        }
      }

      setSoapForm({ 
        subjective: defaultSubjective, 
        objective: defaultObjective, 
        assessment: '', 
        plan: '', 
        diagnosis: '', 
        medication: '', 
        lab_orders: '', 
        radiology_orders: '', 
        lab_results: '', 
        radiology_results: '', 
        followup_recommendations: '', 
        usg_image: patient.anc?.usg_image || '', 
        usg_image_notes: patient.anc?.usg_image_notes || '' 
      });
    }
    setModalType('soap');
  };

  const saveSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      if (editingItem) {
        try {
          const res = await fetch(`/api/patients/${editingItem.id}/soap`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...soapForm, doctor_id: currentUser?.id, clinic_id: currentUser?.clinic_id})
          });
          const data = await res.json();
          
          if (data.success && data.id) {
            const soapId = data.id;
            // Save staged prescriptions
            for (const rx of prescriptions) {
              if (!rx.id) { // Only save if it's new (staged)
                await fetch(`/api/patients/${editingItem.id}/prescriptions`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...rx, soap_id: soapId })
                });
              }
            }
          }

          await updatePatientStatus(editingItem.id, 'Selesai');
          fetchPatients();
          setModalType('none');
          setPrescriptions([]);
        } catch (err) {
          console.error("Error saving SOAP and prescriptions:", err);
          alert("Gagal menyimpan rekam medis");
        }
      }
    });
  };

  const handleAddPrescription = () => {
    if (!prescriptionForm.drug_id || !prescriptionForm.dosage || prescriptionForm.quantity < 1) {
      alert("Harap lengkapi data resep, termasuk obat, dosis, dan jumlah.");
      return;
    }
    
    const drug = drugsInfo.find(d => d.id === Number(prescriptionForm.drug_id));
    if (!drug) return;

    const currentQtyInPrescription = prescriptions
      .filter(p => Number(p.drug_id) === drug.id)
      .reduce((sum, p) => sum + Number(p.quantity), 0);

    const totalRequestedQty = currentQtyInPrescription + Number(prescriptionForm.quantity);

    if (drug.stock < totalRequestedQty) {
      alert(`Stok tidak mencukupi. Tersisa: ${drug.stock} ${drug.unit} keseluruhan. Anda sudah menambahkan ${currentQtyInPrescription} ${drug.unit} ke dalam list resep, sehingga request sisa ditolak.`);
      return;
    }

    // Add to staged prescriptions (local state)
    const newRx = {
      ...prescriptionForm,
      drug_name: drug.name,
      drug_unit: drug.unit,
      id: Date.now(), // temporary ID for rendering
      temp_id: Date.now()
    } as any as PrescriptionDto;

    setPrescriptions([...prescriptions, newRx]);
    setPrescriptionForm({ drug_id: '', dosage: '', quantity: 1, notes: '' });
  };

  const handleDeletePrescription = async (id: any, isStaged: boolean) => {
    if (confirm("Hapus resep ini?")) {
      if (isStaged) {
        setPrescriptions(prescriptions.filter(p => (p.id || p.temp_id) !== id));
      } else {
        await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' });
        fetchPrescriptions(editingItem.id);
        fetchDrugs(); // Refresh stock
      }
    }
  };

  const saveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    requestSave(async () => {
      if (editingItem) {
        await fetch(`/api/patients/${editingItem.id}/vitals`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vitalsForm)
        });
      }
      fetchPatients();
      setModalType('none');
    });
  };

  const isPublicRoute = window.location.pathname === '/antrean-tv' || window.location.pathname === '/layar-antrean';

  if ((!isAuthenticated || isDataLoading) && !isPublicRoute) {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-36 h-36 mx-auto flex items-center justify-center mb-2">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
              NURHEALTH<span className="text-blue-600 dark:text-blue-400">.</span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
              Menginisialisasi Workspace...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderPatientRow = (p: any, showActions: boolean = true) => (
    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => openPatientProfile(p)}>
      <td className="py-3 px-4">
        <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{formatIDTime(p.created_at)} • RM: #{p.rm_number || p.id.toString().padStart(6, '0')}</p>
      </td>
      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold">{p.gender}</span> • {p.age} Thn
        {p.phone && <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">📱 {p.phone}</div>}
        {p.allergies && p.allergies.trim() !== '' && (
          <div className="mt-1 text-[10px] text-red-600 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded w-max border border-red-200"><ShieldAlert className="w-3 h-3" /> Alergi: {p.allergies}</div>
        )}
        {p.fall_risk && p.fall_risk !== 'Rendah' && (
          <div className="mt-1 text-[10px] text-orange-600 font-bold flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded w-max border border-orange-200"><AlertTriangle className="w-3 h-3" /> Risiko Jatuh: {p.fall_risk}</div>
        )}
        {p.is_pregnant === 1 && (
          <div className="mt-1 text-[10px] text-pink-600 font-bold flex items-center gap-1 bg-pink-50 px-1.5 py-0.5 rounded w-max border border-pink-200"><Baby className="w-3 h-3" /> Ibu Hamil</div>
        )}
      </td>
      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
        <span className="line-clamp-2 text-xs leading-relaxed">{p.complaint || '-'}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${p.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : (p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200')}`}>
          {p.status}
        </span>
        {p.vitals?.triage_level && (
          <span className={`ml-2 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border shadow-sm ${p.vitals.triage_level === 'Merah' ? 'bg-rose-100 text-rose-700 border-rose-300' : p.vitals.triage_level === 'Kuning' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300'}`}>
            {p.vitals.triage_level}
          </span>
        )}
        {p.vitals && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800" title="Tekanan Darah">BP: {p.vitals.blood_pressure}</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800" title="Suhu">T: {p.vitals.temperature}°C</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800" title="Detak Nadi">HR: {p.vitals.heart_rate}</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800" title="SpO2">O2: {p.vitals.oxygen_saturation}%</span>
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {showActions && (
          <ActionMenu 
            actions={[
              ...(p.status === 'Menunggu' ? [{
                label: "Triage Selesai",
                icon: UserCheck,
                onClick: () => updatePatientStatus(p.id, 'Menunggu Dokter')
              }] : []),
              {
                label: "Cetak Kartu",
                icon: CreditCard,
                onClick: () => {
                  generatePatientCardPDF(p);
                }
              },
              {
                label: "Lihat Riwayat",
                icon: History,
                onClick: () => {
                  const pg = groupedPatients.find(x => (x.rm_number || x.id.toString().padStart(6, '0')) === (p.rm_number || p.id.toString().padStart(6, '0')));
                  setHistoryVisits(pg ? pg.visits : [p]);
                  setModalType('patientHistory');
                }
              },
              {
                label: "Kunjungan Baru",
                icon: Plus,
                onClick: () => openPatientModal(p, true)
              },
              {
                label: "Periksa Vital",
                icon: Activity,
                onClick: () => openVitalsModal(p)
              },
              {
                label: "Edit Data",
                icon: Edit2,
                onClick: () => openPatientModal(p)
              },
              {
                label: "Hapus Antrian",
                icon: Trash2,
                variant: 'danger',
                onClick: () => deletePatient(p.id)
              }
            ]}
          />
        )}
      </td>
    </tr>
  );

  const renderAncRow = (p: any) => (
    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
      <td className="py-3 px-4">
        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{p.name}</div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{formatIDTime(p.created_at)} • RM: #{p.rm_number || p.id.toString().padStart(6, '0')}</div>
      </td>
      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold">{p.gender}</span> • {p.age} Thn
        {p.phone && <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">📱 {p.phone}</div>}
        {p.allergies && p.allergies.trim() !== '' && (
          <div className="mt-1 text-[10px] text-red-600 font-bold flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded w-max border border-red-200"><ShieldAlert className="w-3 h-3" /> Alergi: {p.allergies}</div>
        )}
      </td>
      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
        <div className="mb-2">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${p.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : (p.status === 'Diperiksa' || p.status === 'Menunggu Dokter' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200')}`}>
            {p.status}
          </span>
        </div>
        {p.anc ? (
          <div className="text-xs space-y-1">
            <div className="flex flex-wrap gap-1">
              {p.anc.hpht && <span className="text-[10px] bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 flex items-center gap-1">HPHT: {p.anc.hpht}</span>}
              <span className="text-[10px] bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded border border-pink-200 flex items-center gap-1"><Baby className="w-3 h-3" /> UK: {p.anc.gestational_age} Mgg</span>
              <span className="text-[10px] bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded border border-pink-200 flex items-center gap-1"><CalendarClock className="w-3 h-3" /> HPL: {p.anc.estimated_delivery_date}</span>
              {p.anc.next_checkup_date && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">Cek: {p.anc.next_checkup_date}</span>}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {p.anc.tfu && <span className="text-[10px] bg-blue-50 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">TFU: {p.anc.tfu}</span>}
              {p.anc.djj && <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1"><Activity className="w-3 h-3"/> DJJ: {p.anc.djj}</span>}
              {p.anc.poedji_rochjati_score && <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Skor P.R: {p.anc.poedji_rochjati_score}</span>}
              {(p.anc.usg_tbj || p.anc.usg_bpd) && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">USG ✓</span>}
            </div>
            <p className="line-clamp-2 leading-relaxed text-slate-500 dark:text-slate-400 mt-1">Catatan: {p.anc.fetal_development}</p>
          </div>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">Data ANC belum diisi pada kunjungan ini</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <ActionMenu 
          actions={[
            ...(p.status === 'Menunggu' ? [{
              label: "Triage Selesai",
              icon: UserCheck,
              onClick: () => updatePatientStatus(p.id, 'Menunggu Dokter')
            }] : []),
            {
              label: "Cetak Kartu",
              icon: CreditCard,
              onClick: () => {
                generatePatientCardPDF(p);
              }
            },
            {
              label: "Lihat Riwayat",
              icon: History,
              onClick: () => {
                const pg = groupedPatients.find(x => (x.rm_number || x.id.toString().padStart(6, '0')) === (p.rm_number || p.id.toString().padStart(6, '0')));
                setHistoryVisits(pg ? pg.visits : [p]);
                setModalType('patientHistory');
              }
            },
            {
              label: "Pemeriksaan ANC",
              icon: Baby,
              onClick: () => openAncModal(p)
            },
            {
              label: "Edit Demografi",
              icon: Edit2,
              onClick: () => openPatientModal(p)
            }
          ]}
        />
      </td>
    </tr>
  );

  
  const hasMenuAccess = (menuKey: string, allowedRoles: string[]) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Superadmin') return true;
    if (currentUser.accessible_menus) {
      let parsed: string[] = [];
      try {
        parsed = typeof currentUser.accessible_menus === 'string' 
          ? JSON.parse(currentUser.accessible_menus) 
          : currentUser.accessible_menus;
      } catch(e) {}
      if (parsed.length > 0) return parsed.includes(menuKey);
    }
    return allowedRoles.includes(currentUser.role);
  };

  const renderSidebarContent = () => (
    <>
      <div className="px-5 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0 font-sans">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img src="/nur.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none truncate">ERP Medical <span className="text-[#00A86B]">Nurhealth</span></h1>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest truncate">{displayedClinicName}</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="hidden md:flex p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 outline-none" onClick={() => setIsSidebarCollapsed(true)} title="Sembunyikan Sidebar">
            <X className="w-4 h-4" />
          </button>
          <button className="md:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Real-time Ticking Clock */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/40 flex items-center gap-3 font-sans">
        <div className="w-8 h-8 rounded-full bg-[#00A86B]/15 border border-[#00A86B]/30 flex items-center justify-center shrink-0">
           <CalendarClock className="w-4 h-4 text-[#00A86B] animate-pulse" />
        </div>
        <div className="min-w-0">
           <p className="text-[8px] text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase">Waktu Real-time</p>
           <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono tracking-tight leading-none mt-0.5" id="live-time-display">
              {formatIDTime(realTimeClock)}
           </p>
           <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 font-semibold" id="live-date-display">
              {formatIDDate(realTimeClock)}
           </p>
        </div>
      </div>

      <nav className="p-4 flex-1 space-y-1 overflow-y-auto custom-scrollbar font-sans">
        
        <div className="px-3 py-2">
           <p className="text-[9px] font-bold uppercase tracking-widest text-[#00A86B] dark:text-[#00A86B] mb-1">Operasional Klinik</p>
        </div>

        {hasMenuAccess('dashboard', ['Superadmin', 'Admin', 'Dokter', 'Suster', 'Bidan', 'Laboran', 'Apoteker', 'Kasir']) && (
        <button 
          onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Live Dashboard</span>
        </button>
        )}

        {hasMenuAccess('queue', ['Superadmin', 'Admin', 'Dokter', 'Suster', 'Bidan', 'Kasir']) && (
        <button 
          onClick={() => { setActiveTab('queue'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'queue' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
        >
          <div className="flex items-center gap-3">
            <CalendarClock className={`w-4 h-4 ${activeTab === 'queue' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Antrian Layanan</span>
          </div>
          {notificationCounts.queue > 0 && <span className="bg-indigo-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{notificationCounts.queue}</span>}
        </button>
        )}

        {hasMenuAccess('appointments', ['Superadmin', 'Admin', 'Suster', 'Bidan']) && (
        <button 
          onClick={() => { setActiveTab('appointments'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'appointments' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
        >
          <CalendarDays className={`w-4 h-4 ${activeTab === 'appointments' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Jadwal & Janji Temu</span>
        </button>
        )}

        {hasMenuAccess('patients', ['Superadmin', 'Admin', 'Suster', 'Bidan']) && (
          <button 
            onClick={() => { setActiveTab('patients'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'patients' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <UserPlus className={`w-4 h-4 ${activeTab === 'patients' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Pasien Masuk (Triage)</span>
            </div>
            {notificationCounts.triage > 0 && <span className="bg-indigo-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{notificationCounts.triage}</span>}
          </button>
        )}

        {hasMenuAccess('doctorDashboard', ['Superadmin', 'Dokter', 'Bidan']) && (
          <>
            <button 
              onClick={() => { setActiveTab('doctorDashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'doctorDashboard' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <Activity className={`w-4 h-4 ${activeTab === 'doctorDashboard' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Dashboard Dokter</span>
            </button>
            <button 
              onClick={() => { setActiveTab('doctorSOAP'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'doctorSOAP' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Stethoscope className={`w-4 h-4 ${activeTab === 'doctorSOAP' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span>Rekam Medis (SOAP)</span>
              </div>
              <div className="flex items-center gap-1">
                {notificationCounts.soapEmergency > 0 && <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold animate-pulse">{notificationCounts.soapEmergency} Darurat</span>}
                {notificationCounts.soapNormal > 0 && <span className="bg-indigo-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{notificationCounts.soapNormal}</span>}
              </div>
            </button>
          </>
        )}

        {hasMenuAccess('anc', ['Superadmin', 'Admin', 'Bidan']) && (
          <button 
            onClick={() => { setActiveTab('anc'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'anc' ? 'bg-pink-50 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400 shadow-sm border border-pink-100 dark:border-pink-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <Baby className={`w-4 h-4 ${activeTab === 'anc' ? 'text-pink-600 dark:text-pink-400' : ''}`} />
            <span>Ibu Hamil (ANC)</span>
          </button>
        )}

        {hasMenuAccess('children', ['Superadmin', 'Admin', 'Bidan', 'Suster']) && (
          <button 
            onClick={() => { setActiveTab('children'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'children' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <Footprints className={`w-4 h-4 ${activeTab === 'children' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            <span>Bayi & Anak</span>
          </button>
        )}

        {hasMenuAccess('lis', ['Superadmin', 'Admin', 'Dokter', 'Suster', 'Bidan', 'Laboran']) && (
        <button 
          onClick={() => { setActiveTab('lis'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'lis' ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
        >
          <div className="flex items-center gap-3">
            <Search className={`w-4 h-4 ${activeTab === 'lis' ? 'text-orange-600 dark:text-orange-400' : ''}`} />
            <span>Laboratorium & Rad</span>
          </div>
          {notificationCounts.lab > 0 && <span className="bg-orange-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{notificationCounts.lab}</span>}
        </button>
        )}
        
        {hasMenuAccess('billing', ['Superadmin', 'Admin', 'Kasir']) && (
        <button 
          onClick={() => { setActiveTab('billing'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'billing' ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
        >
          <div className="flex items-center gap-3">
            <Receipt className={`w-4 h-4 ${activeTab === 'billing' ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>Kasir & Pembayaran</span>
          </div>
          {notificationCounts.billing > 0 && <span className="bg-emerald-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold">{notificationCounts.billing}</span>}
        </button>
        )}
        
        <div className="px-3 pt-4 pb-2">
           <p className="text-[9px] font-bold uppercase tracking-widest text-[#00A86B] dark:text-[#00A86B] mb-1">Manajemen & Laporan</p>
        </div>
        
        {hasMenuAccess('reports', ['Superadmin', 'Admin']) && (
        <button 
          onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'reports' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
        >
          <BarChart3 className={`w-4 h-4 ${activeTab === 'reports' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Laporan Strategis</span>
        </button>
        )}

        {hasMenuAccess('accounting', ['Superadmin', 'Admin']) && (
        <div className="space-y-1">
          <button 
            onClick={() => { 
              setActiveTab('accounting'); 
              setAccountingSubTabWithUrl('journal');
              setIsMobileMenuOpen(false); 
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'accounting' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <Wallet className={`w-4 h-4 ${activeTab === 'accounting' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Manajemen Keuangan</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeTab === 'accounting' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeTab === 'accounting' && (
            <div className="mt-1 ml-4 pl-3 border-l border-indigo-100 dark:border-indigo-900/50 space-y-1">
              <button
                onClick={() => { setAccountingSubTabWithUrl('journal'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-lg ${accountingSubTab === 'journal' ? 'bg-indigo-100/60 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${accountingSubTab === 'journal' ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span>Jurnal Umum</span>
              </button>
              <button
                onClick={() => { setAccountingSubTabWithUrl('income'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-lg ${accountingSubTab === 'income' ? 'bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${accountingSubTab === 'income' ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span>Laba Rugi</span>
              </button>
              <button
                onClick={() => { setAccountingSubTabWithUrl('balanceSheet'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-lg ${accountingSubTab === 'balanceSheet' ? 'bg-teal-100/60 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-905 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${accountingSubTab === 'balanceSheet' ? 'bg-teal-600 dark:bg-teal-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span>Neraca / Inventaris</span>
              </button>
              <button
                onClick={() => { setAccountingSubTabWithUrl('coa'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-lg ${accountingSubTab === 'coa' ? 'bg-orange-100/60 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${accountingSubTab === 'coa' ? 'bg-orange-600 dark:bg-orange-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span>Chart of Accounts</span>
              </button>
              <button
                onClick={() => { setAccountingSubTabWithUrl('cashReport'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-lg ${accountingSubTab === 'cashReport' ? 'bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${accountingSubTab === 'cashReport' ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span>Catatan Laporan Kas</span>
              </button>
              <button
                onClick={() => { setAccountingSubTabWithUrl('sroi'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium transition-all rounded-lg ${accountingSubTab === 'sroi' ? 'bg-pink-100/60 dark:bg-pink-900/40 text-pink-700 dark:text-pink-350 font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${accountingSubTab === 'sroi' ? 'bg-pink-600 dark:bg-pink-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                <span>Analisis SROI</span>
              </button>
            </div>
          )}
        </div>
        )}
        
        {hasMenuAccess('patientDatabase', ['Superadmin', 'Admin']) && (
              <>
              <button 
                onClick={() => { setActiveTab('patientDatabase'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'patientDatabase' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <Database className={`w-4 h-4 ${activeTab === 'patientDatabase' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Database Pasien</span>
            </button>

            <button 
              onClick={() => { setActiveTab('patientAnalytics'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'patientAnalytics' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <PieChart className={`w-4 h-4 ${activeTab === 'patientAnalytics' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Analitik & Demografi</span>
            </button>

            {hasMenuAccess('clinics', ['Superadmin']) && (
                <>
                  <button 
                    onClick={() => { setActiveTab('clinics'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'clinics' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'clinics' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Manajemen Klinik</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('lpj'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'lpj' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'lpj' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>LPJ Klinik</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('inventory'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'inventory' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <PackageOpen className={`w-4 h-4 ${activeTab === 'inventory' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Inventaris Klinik</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'attendance' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-[#00A86B] dark:hover:text-white border border-transparent'}`}
                >
                  <CalendarDays className={`w-4 h-4 ${activeTab === 'attendance' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Riwayat Absensi</span>
                </button>
              </>
            )}

            {hasMenuAccess('map', ['Superadmin']) && (
                <button 
              onClick={() => { setActiveTab('map'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'map' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'map' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Peta Sebaran</span>
            </button>
            )}

            {hasMenuAccess('adminPanel', ['Superadmin', 'Admin']) && (
              <>
                <div className="px-3 pt-4 pb-2">
                   <p className="text-[9px] font-bold uppercase tracking-widest text-[#00A86B] dark:text-[#00A86B] mb-1">Pengaturan Sistem</p>
                </div>

                <button 
                  onClick={() => { setActiveTab('adminPanel'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'adminPanel' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <UserCog className={`w-4 h-4 ${activeTab === 'adminPanel' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Hak Akses & Resource</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('rbac'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'rbac' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <Fingerprint className={`w-4 h-4 ${activeTab === 'rbac' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Matriks RBAC</span>
                </button>
              </>
            )}

            {hasMenuAccess('architecture', ['Superadmin']) && (
              <>
                <div className="pt-4 pb-2 px-3 border-t border-slate-100 dark:border-slate-800/30 mt-2">
                   <p className="text-[9px] font-mono uppercase tracking-widest text-[#00A86B] dark:text-[#00A86B] font-bold">Spesifikasi & Teknis</p>
                </div>

                <button 
                  onClick={() => { setActiveTab('architecture'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'architecture' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <ShieldAlert className={`w-4 h-4 ${activeTab === 'architecture' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Arsitektur & Keamanan</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('schema'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'schema' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <Database className={`w-4 h-4 ${activeTab === 'schema' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Skema DDL SQL</span>
                </button>

                <button 
                  onClick={() => { setActiveTab('query'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold transition-all rounded-xl ${activeTab === 'query' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                >
                  <Code2 className={`w-4 h-4 ${activeTab === 'query' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>Complex Query</span>
                </button>
              </>
            )}
          </>
        )}
      </nav>
    </>
  );

  if (activeTab === 'queueTV') {
    return (
      <QueueTVTab 
        patientsInfo={patientsInfo}
        clinicsInfo={clinicsInfo}
        onBackToERP={isAuthenticated ? () => setActiveTab('queue') : undefined}
      />
    );
  }

  return (
    <div id="app-container" className="min-h-screen bg-transparent flex flex-col md:flex-row text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full z-50 bg-amber-500 text-white text-center py-1.5 px-4 text-xs font-semibold shadow-md flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Anda sedang offline. Beberapa fitur mungkin tidak berfungsi, tetapi Anda masih bisa melihat data Pasien dan Form tersimpan dari cache.
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3.5 flex justify-between items-center sticky top-0 z-30 select-none shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-550 dark:hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent outline-none shrink-0"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-350" />
          </button>
          <div className="w-10 h-10 flex items-center justify-center shrink-0 mx-1">
            <img src="/nur.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none truncate">
              ERP Medical <span className="text-[#00A86B]">Nurhealth</span>
            </h1>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate uppercase">
              {displayedClinicName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xs:flex flex-col text-right leading-none shrink-0 mr-1.5">
            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400" id="mobile-live-time">
              {formatIDTime(realTimeClock)}
            </span>
            <span className="text-[7px] text-slate-400 dark:text-slate-500 font-mono scale-[0.9] origin-right mt-0.5">
              {formatIDDate(realTimeClock)}
            </span>
          </div>

          {/* Mobile AI Chatbot Button */}
          <button 
            onClick={() => {
              setIsChatbotDismissed(false);
              localStorage.setItem('nhc_chatbot_dismissed', 'false');
              setAiChatOpen(prev => !prev);
            }}
            className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-indigo-650 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all outline-none"
            title="Chatbot AI"
          >
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </button>

          {/* Dark Mode Icon Button */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all outline-none"
            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* User Profile Initial */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center font-bold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-tight shrink-0 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
              title={`Profil: ${currentUser?.name || ''} (${currentUser?.role || ''})`}
            >
              {currentUser?.name ? currentUser.name.substring(0, 2) : 'US'}
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                <button 
                  onClick={() => {
                    setAttendanceType('Masuk');
                    setModalType('attendanceCamera');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2"
                >
                  <MapPinIcon className="w-4 h-4" /> Absen Masuk
                </button>
                <button 
                  onClick={() => {
                    setAttendanceType('Keluar');
                    setModalType('attendanceCamera');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Absen Keluar
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => { setIsAuthenticated(false); setCurrentUser(null); localStorage.removeItem('nhc_user'); }} 
            className="p-1.5 text-red-650 hover:text-red-750 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all outline-none shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar & Overlay under AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Drawer (Slide-in) */}
            <motion.aside 
              id="sidebar-nav-mobile"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="md:hidden fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 h-screen w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Navigation */}
      <aside 
        id="sidebar-nav" 
        className={`hidden md:flex fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 h-screen border-r border-slate-200 dark:border-slate-800 flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none border-r-0' : 'w-64 opacity-100 font-sans'}`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Right-Side Dashboard Wrapper */}
      <div className={`flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-0' : 'md:ml-64'}`}>
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 select-none sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 outline-none"
              title={isSidebarCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {isSidebarCollapsed && (
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <img src="/nur.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">ERP Medical <span className="text-[#00A86B]">Nurhealth</span></span>
                  <div className="w-px h-4 bg-slate-200 dark:border-slate-800 mx-2" />
                </div>
              )}
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Klinik: {displayedClinicName}</span>
              <span className="text-slate-300 dark:text-slate-700 text-xs">/</span>
              <span className="text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-tight">
                {activeTab === 'dashboard' && 'Live Dashboard'}
                {activeTab === 'queue' && 'Antrian Layanan'}
                {activeTab === 'appointments' && 'Jadwal & Janji Temu'}
                {activeTab === 'reports' && 'Laporan Strategis'}
                {activeTab === 'patients' && 'Pasien Masuk (Triage)'}
                {activeTab === 'anc' && 'Ibu Hamil (ANC)'}
                {activeTab === 'children' && 'Bayi & Anak'}
                {activeTab === 'doctorDashboard' && 'Dashboard Medis'}
                {activeTab === 'doctorSOAP' && 'Rekam Medis (SOAP)'}
                {activeTab === 'billing' && 'Kasir & Pembayaran'}
                {activeTab === 'lis' && 'Laboratorium & Rad'}
                {activeTab === 'patientDatabase' && 'Database Pasien'}
                {activeTab === 'patientAnalytics' && 'Analitik & Demografi'}
                {activeTab === 'clinics' && 'Manajemen Klinik'}
                {activeTab === 'map' && 'Peta Sebaran'}
                {activeTab === 'lpj' && 'Laporan Pertanggungjawaban (LPJ)'}
                {activeTab === 'accounting' && (
                  accountingSubTab === 'journal' ? 'Jurnal Umum Keuangan' :
                  accountingSubTab === 'balanceSheet' ? 'Neraca (Posisi Keuangan)' :
                  accountingSubTab === 'income' ? 'Laporan Laba Rugi' :
                  accountingSubTab === 'coa' ? 'Chart of Accounts' :
                  accountingSubTab === 'cashReport' ? 'Catatan Laporan Kas' :
                  accountingSubTab === 'sroi' ? 'Analisis SROI (Social Return)' : 'Manajemen Keuangan'
                )}
                {activeTab === 'inventory' && 'Inventaris & Aset'}
                {activeTab === 'adminPanel' && 'Hak Akses & Resource'}
                {activeTab === 'rbac' && 'Matriks RBAC'}
                {activeTab === 'architecture' && 'Arsitektur & Keamanan'}
                {activeTab === 'schema' && 'Skema DDL SQL'}
                {activeTab === 'query' && 'Complex Query'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Chatbot Header Button */}
            <button 
              onClick={() => {
                setIsChatbotDismissed(false);
                localStorage.setItem('nhc_chatbot_dismissed', 'false');
                setAiChatOpen(prev => !prev);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-all text-xs font-semibold outline-none shadow-sm shadow-indigo-100/50 dark:shadow-none"
              title="Konsultasi AI Copilot"
            >
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse shrink-0" />
              <span>AI Copilot</span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center font-bold text-[10px] text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                  {currentUser?.name ? currentUser.name.substring(0, 2) : 'US'}
                </div>
                <div className="text-left leading-none">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{currentUser?.name}</p>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{currentUser?.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                  <button 
                    onClick={() => {
                      setAttendanceType('Masuk');
                      setModalType('attendanceCamera');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2"
                  >
                    <MapPinIcon className="w-4 h-4" /> Absen Masuk
                  </button>
                  <button 
                    onClick={() => {
                      setAttendanceType('Keluar');
                      setModalType('attendanceCamera');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Absen Keluar
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Icon Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-350 dark:hover:border-slate-700 transition-all outline-none"
              title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => { setIsAuthenticated(false); setCurrentUser(null); localStorage.removeItem('nhc_user'); }} 
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 font-bold uppercase tracking-widest rounded-xl transition-all outline-none"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-2 md:p-6 lg:p-8 overflow-y-auto relative bg-transparent transition-colors duration-300">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>}>
        
        {activeTab === 'accounting' && (
          <AccountingPanel 
            currentUser={currentUser} 
            clinics={clinicsInfo} 
            subTab={accountingSubTab} 
            setSubTab={setAccountingSubTabWithUrl} 
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            summaryData={summaryData}
            stats={stats}
            soapDurationStats={soapDurationStats}
            darkMode={darkMode}
            setDashboardDetailType={setDashboardDetailType as any}
            setModalType={setModalType as any}
            generatePDFReport={generatePDFReport}
          />
        )}

        {activeTab === 'queue' && (
          <QueueTab
            patientsInfo={patientsInfo}
            billingsData={billingsData}
            openPatientProfile={openPatientProfile}
            triggerWhatsAppNotification={triggerWhatsAppNotification}
            handleProcessBilling={handleProcessBilling}
          />
        )}


        {activeTab === 'dashboard' && (
          <DashboardTab
            currentUser={currentUser}
            clinicsInfo={clinicsInfo}
            forcedClinicFilter={forcedClinicFilter}
            setForcedClinicFilter={setForcedClinicFilter}
            dashboardMetrics={dashboardMetrics}
            drugsInfo={drugsInfo}
            upcomingReminders={upcomingReminders}
            shiftsInfo={shiftsInfo}
            setActiveTab={setActiveTab as any}
            setDashboardDetailType={setDashboardDetailType as any}
            setModalType={setModalType as any}
            triggerPatientWhatsAppNotification={triggerPatientWhatsAppNotification as any}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsTab
            patientSearchQuery={patientSearchQuery}
            setPatientSearchQuery={setPatientSearchQuery}
            triageDateFilter={triageDateFilter}
            setTriageDateFilter={setTriageDateFilter}
            openPatientModal={openPatientModal}
            requestSort={requestSort}
            sortConfig={sortConfig}
            SortIcon={SortIcon}
            filteredTriagePatients={filteredTriagePatients}
            getSortedData={getSortedData}
            renderPatientRow={renderPatientRow}
            triageHistoryPage={triageHistoryPage}
            setTriageHistoryPage={setTriageHistoryPage}
            openPatientProfile={openPatientProfile}
            getPage={getPage}
            Pagination={Pagination}
          />
        )}

        {activeTab === 'anc' && (
          <AncTab
            ancDateFilter={ancDateFilter}
            setAncDateFilter={setAncDateFilter}
            filteredAncPatients={filteredAncPatients}
            renderAncRow={renderAncRow}
            getSortedData={getSortedData}
            ancHistoryPage={ancHistoryPage}
            setAncHistoryPage={setAncHistoryPage}
            openPatientProfile={openPatientProfile}
            getPage={getPage}
            Pagination={Pagination}
          />
        )}

        {activeTab === 'children' && (
          <ChildrenTab
            childrenSearch={childrenSearch}
            setChildrenSearch={setChildrenSearch}
            requestSort={requestSort}
            sortConfig={sortConfig}
            SortIcon={SortIcon}
            filteredChildren={filteredChildren}
            getSortedData={getSortedData}
            formatIDDate={formatIDDate}
            patientsInfo={patientsInfo}
            openChildrenModal={openChildrenModal}
            setSelectedChild={setSelectedChild as any}
            setModalType={setModalType as any}
            getPage={getPage}
            setPage={setPage}
            Pagination={Pagination}
          />
        )}

        {activeTab === 'patientAnalytics' && (
          <PatientAnalyticsTab
            patientsInfo={patientsInfo}
            dashboardMetrics={dashboardMetrics}
            setDashboardDetailType={setDashboardDetailType as any}
            setModalType={setModalType as any}
            clinicsInfo={clinicsInfo}
          />
        )}
         {activeTab === 'clinics' && hasMenuAccess('clinics', ['Superadmin']) && (
          <ClinicsTab
            clinicsInfo={clinicsInfo}
            setEditingItem={setEditingItem}
            setClinicForm={setClinicForm}
            setModalType={setModalType as any}
            fetchClinics={fetchClinics}
          />
        )}
        {activeTab === 'attendance' && hasMenuAccess('attendance', ['Superadmin']) && (
          <AttendanceTab
            currentUser={currentUser}
            attendanceMonth={attendanceMonth}
            setAttendanceMonth={setAttendanceMonth}
            attendanceFilterClinic={attendanceFilterClinic}
            setAttendanceFilterClinic={setAttendanceFilterClinic}
            clinicsInfo={clinicsInfo}
            exportAttendancePDF={exportAttendancePDF}
            fetchAttendances={fetchAttendances}
            fetchUsers={fetchUsers}
            usersInfo={usersInfo}
            attendancesData={attendancesData}
            setSelectedAttendanceUser={setSelectedAttendanceUser}
            setModalType={setModalType as any}
            setSelectedAttendanceDay={setSelectedAttendanceDay}
            formatIDTime={formatIDTime}
          />
        )}
        {activeTab === 'map' && (
          <MapClinics 
             clinicsInfo={clinicsInfo} 
             patientsInfo={patientsInfo} 
             billingsData={billingsData} 
          />
        )}

        {activeTab === 'lpj' && (
          <LpjReport 
             clinicsInfo={clinicsInfo}
             patientsInfo={patientsInfo}
             billingsData={billingsData}
             drugsInfo={drugsInfo}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPanel clinicId={forcedClinicFilter} currentUser={currentUser} clinics={clinicsInfo} />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab
            appointments={appointments}
            patientsInfo={patientsInfo}
            currentUser={currentUser}
            fetchAppointments={fetchAppointments}
            triggerPatientWhatsAppNotification={triggerPatientWhatsAppNotification as any}
          />
        )}

        {activeTab === 'patientDatabase' && (
          <PatientDatabaseTab
            patientSearchQuery={patientSearchQuery}
            setPatientSearchQuery={setPatientSearchQuery}
            dbDateFilter={dbDateFilter}
            setDbDateFilter={setDbDateFilter}
            handleExportPatientsExcel={handleExportPatientsExcel}
            filteredGroupedPatients={filteredGroupedPatients}
            dbCurrentPage={dbCurrentPage}
            dbItemsPerPage={dbItemsPerPage}
            setDbCurrentPage={setDbCurrentPage}
            groupedPatients={groupedPatients}
            openPatientProfile={openPatientProfile}
            generatePatientCardPDF={generatePatientCardPDF}
            setHistoryVisits={setHistoryVisits}
            setModalType={setModalType as any}
            openChildrenModal={openChildrenModal}
            openPatientModal={openPatientModal}
            deletePatient={deletePatient}
          />
        )}

        {activeTab === 'doctorDashboard' && (
          <DoctorDashboardTab
            currentUser={currentUser}
            patientsInfo={patientsInfo}
            appointments={appointments}
            setActiveTab={setActiveTab as any}
            setPatientSearchQuery={setPatientSearchQuery}
            openSoapModal={openSoapModal}
            formatIDDate={formatIDDate}
          />
        )}

        {activeTab === 'doctorSOAP' && (
          <DoctorSoapTab
            patientsInfo={patientsInfo}
            getPage={getPage}
            setPage={setPage}
            openSoapModal={openSoapModal}
            setHistoryVisits={setHistoryVisits}
            setModalType={setModalType as any}
            groupedPatients={groupedPatients}
            openPatientProfile={openPatientProfile}
            openReferralModal={openReferralModal}
          />
        )}

        {activeTab === 'billing' && (
          <BillingTab
            patientsInfo={patientsInfo}
            billingsData={billingsData}
            openBillingModal={openBillingModal}
            handleProcessBilling={handleProcessBilling}
            getPage={getPage}
            setPage={setPage}
            formatIDTime={formatIDTime}
            openInvoiceDetail={openInvoiceDetail}
          />
        )}

                {activeTab === 'lis' && (
          <LisTab
            labOrdersInfo={labOrdersInfo}
            fetchLabOrders={fetchLabOrders}
            getPage={getPage}
            setPage={setPage}
            formatIDDateTime={formatIDDateTime}
            setCurrentLabResults={setCurrentLabResults}
            setLabResultsModalOpen={setLabResultsModalOpen}
          />
        )}
        {activeTab === 'adminPanel' && (
          <AdminPanelTab
            adminSubTab={adminSubTab}
            setAdminSubTab={setAdminSubTab}
            drugSearchQuery={drugSearchQuery}
            setDrugSearchQuery={setDrugSearchQuery}
            setEditingItem={setEditingItem}
            setDrugForm={setDrugForm}
            currentUser={currentUser}
            setModalType={setModalType as any}
            requestSort={requestSort}
            sortConfig={sortConfig}
            getSortedData={getSortedData}
            drugsInfo={drugsInfo}
            coa={coa}
            fetchStockHistory={fetchStockHistory}
            fetchDrugs={fetchDrugs}
            isDriveSyncing={isDriveSyncing}
            handleLocalBackupOnly={handleLocalBackupOnly}
            handleManualBackup={handleManualBackup}
            backupLogsInfo={backupLogsInfo}
            formatIDDateTime={formatIDDateTime}
            formatIDDate={formatIDDate}
            userSearchQuery={userSearchQuery}
            setUserSearchQuery={setUserSearchQuery}
            openUserModal={openUserModal}
            usersInfo={usersInfo}
            deleteUser={deleteUser}
            bedsInfo={bedsInfo}
            openBedModal={openBedModal}
            deleteBed={deleteBed}
            shiftsInfo={shiftsInfo}
            openShiftModal={openShiftModal}
            deleteShift={deleteShift}
            tariffsInfo={tariffsInfo}
            openTariffModal={openTariffModal}
            deleteTariff={deleteTariff}
            marginsInfo={marginsInfo}
            openMarginModal={openMarginModal}
            deleteMargin={deleteMargin}
          />
        )}
              {activeTab === 'rbac' && (
          <RbacPanel icons={icons} />
        )}

        {['architecture', 'schema', 'query'].includes(activeTab) && (
          <ArchitectureDocs activeTab={activeTab} />
        )}
        </Suspense>

                <PatientProfileModal
          modalType={modalType}
          setModalType={setModalType as any}
          editingItem={editingItem}
          patientProfileTab={patientProfileTab}
          setPatientProfileTab={setPatientProfileTab}
          patientHistoryData={patientHistoryData}
          historySearch={historySearch}
          setHistorySearch={setHistorySearch}
          selectedVisit={selectedVisit}
          setSelectedVisit={setSelectedVisit}
          patientsInfo={patientsInfo}
          generatePatientPDF={generatePatientPDF}
          generateVisitSummaryPDF={generateVisitSummaryPDF}
          printIndependentPrescription={printIndependentPrescription}
          fetchPatientHistory={fetchPatientHistory}
          currentUser={currentUser}
          selectedPatientImages={selectedPatientImages}
        />
        {modalType === 'attendanceCamera' && (
          <AttendanceCamera 
            type={attendanceType} 
            userId={Number(currentUser?.id) || 0} 
            onClose={() => { setModalType('none'); fetchAttendances(); }} 
          />
        )}
        <AttendanceModals
          modalType={modalType}
          setModalType={setModalType}
          selectedAttendanceUser={selectedAttendanceUser}
          attendancesData={attendancesData}
          attendanceMonth={attendanceMonth}
          selectedAttendanceDay={selectedAttendanceDay}
        />
                <ClinicSettingsModals
          modalType={modalType}
          setModalType={setModalType as any}
          editingItem={editingItem}
          clinicForm={clinicForm}
          setClinicForm={setClinicForm}
          saveClinic={saveClinic}
          handleClinicLogoUpload={handleClinicLogoUpload}
          userForm={userForm}
          setUserForm={setUserForm}
          saveUser={saveUser}
          clinicsInfo={clinicsInfo}
          usersInfo={usersInfo}
          bedForm={bedForm}
          setBedForm={setBedForm}
          saveBed={saveBed}
          shiftForm={shiftForm}
          setShiftForm={setShiftForm}
          saveShift={saveShift}
          tariffForm={tariffForm}
          setTariffForm={setTariffForm}
          saveTariff={saveTariff}
          marginForm={marginForm}
          setMarginForm={setMarginForm}
          saveMargin={saveMargin}
          whatsappPrompt={whatsappPrompt}
          setWhatsappPrompt={setWhatsappPrompt}
          patientWaPrompt={patientWaPrompt}
          setPatientWaPrompt={setPatientWaPrompt}
          displayedClinicName={displayedClinicName}
          currentUser={currentUser}
          coa={coa}
        />
                <BillingModals
          modalType={modalType}
          setModalType={setModalType as any}
          selectedInvoice={selectedInvoice}
          billingsData={billingsData}
          patientsInfo={patientsInfo}
          usersInfo={usersInfo}
          generateInvoicePDF={generateInvoicePDF}
          setEditingItem={setEditingItem}
          billingForm={billingForm}
          setBillingForm={setBillingForm}
          saveBilling={saveBilling}
          drugsInfo={drugsInfo}
          printFormat={printFormat}
          setPrintFormat={setPrintFormat}
          isSponsorCovered={isSponsorCovered}
          setIsSponsorCovered={setIsSponsorCovered}
          currentUser={currentUser}
          clinicsInfo={clinicsInfo}
          groupedPatients={groupedPatients}
          tariffsInfo={tariffsInfo}
          coa={coa}
          calculateTotalBilling={calculateTotalBilling}
        />
        <AnimatePresence>
        {modalType === 'patient' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shrink-0">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 
                  {editingItem ? 'Edit Data Pasien' : (isNewVisit ? 'Registrasi Kunjungan Pasien' : 'Registrasi Pasien Baru')}
                </h3>
                <button onClick={() => setModalType('none')} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition-colors outline-none"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={savePatient} className="p-5 overflow-y-auto flex-grow custom-scrollbar bg-white dark:bg-slate-900">
                <div className="space-y-4">
                  {currentUser?.role === 'Superadmin' && (!editingItem || !isNewVisit) && (
                     <div>
                       <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Tujuan Klinik Pendaftaran</label>
                       <select value={patientForm.clinic_id} onChange={e => setPatientForm({...patientForm, clinic_id: e.target.value})} required className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                         <option value="">Pilih Cabang Klinik...</option>
                         {clinicsInfo.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                     </div>
                  )}
                  {!editingItem && !isNewVisit && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-6">
                      <label className="block text-xs font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5" /> Cari Pasien Lama (Sudah Terdaftar)
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={innerPatientSearch}
                          onChange={(e) => setInnerPatientSearch(e.target.value)}
                          placeholder="Cari Nama / No. RM..." 
                          className="w-full px-3 py-2 bg-white dark:bg-slate-850 border border-blue-200 dark:border-blue-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 pr-10 dark:text-white transition-all shadow-sm"
                        />
                        <div className="absolute right-3 top-2.5 text-blue-400">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      
                      {innerPatientSearch.length >= 2 && (
                        <div className="mt-2 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 rounded-lg shadow-sm max-h-[150px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700 custom-scrollbar">
                          {(() => {
                            const term = innerPatientSearch.toLowerCase();
                            
                            // 1. Cari di groupedPatients (Pasien Umum)
                            const matchedPatients = groupedPatients
                              .filter(p => 
                                p.name.toLowerCase().includes(term) || 
                                (p.rm_number && p.rm_number.toLowerCase().includes(term)) ||
                                p.id.toString().includes(term)
                              ).map(p => ({
                                type: 'patient',
                                id: p.id,
                                data: p
                              }));
                              
                            // 2. Cari di allChildren (Bayi & Anak)
                            const matchedChildren = allChildren
                              .filter(c => 
                                c.name.toLowerCase().includes(term) ||
                                (c.mother_rm && c.mother_rm.toLowerCase().includes(term))
                              ).map(c => ({
                                type: 'child',
                                id: `child-${c.id}`,
                                data: c
                              }));
                              
                            const combined = [...matchedPatients, ...matchedChildren].slice(0, 5);
                            
                            if (combined.length === 0) {
                              return <div className="p-3 text-[10px] text-slate-400 dark:text-slate-600 text-center italic">Pasien/Anak tidak ditemukan. Lanjutkan input baru di bawah.</div>;
                            }
                            
                            return combined.map(item => {
                              const isChild = item.type === 'child';
                              const p = item.data;
                              
                              if (isChild) {
                                const mother = groupedPatients.find(g => g.id === p.mother_id);
                                const calculateAge = (dob: string) => {
                                  if (!dob) return 0;
                                  const diff = Date.now() - new Date(dob).getTime();
                                  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                                };
                                
                                return (
                                  <button 
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      setPatientForm({
                                        rm_number: p.mother_rm + '-A', // Menandakan RM Anak dari RM Ibu
                                        name: p.name,
                                        age: calculateAge(p.birth_date),
                                        gender: p.gender,
                                        address: mother?.address || '',
                                        phone: mother?.phone || '',
                                        complaint: '',
                                        status: 'Menunggu',
                                        allergies: '',
                                        fall_risk: 'Rendah',
                                        is_pregnant: false,
                                        is_child: true,
                                        child_birth_date: p.birth_date
                                      });
                                      setIsNewVisit(true);
                                      setInnerPatientSearch('');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors flex justify-between items-center"
                                  >
                                    <div>
                                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                        <Baby className="w-3.5 h-3.5 text-emerald-500" /> {p.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">Ibu: {p.mother_name} (RM: #{p.mother_rm})</div>
                                    </div>
                                    <div className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Pilih Anak</div>
                                  </button>
                                );
                              }
                              
                              return (
                                <button 
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setPatientForm({
                                      rm_number: p.rm_number || p.id.toString().padStart(6, '0'),
                                      name: p.name,
                                      age: p.age,
                                      gender: p.gender,
                                      address: p.address || '',
                                      phone: p.phone || '',
                                      complaint: '',
                                      status: 'Menunggu',
                                      allergies: p.allergies || '',
                                      fall_risk: p.fall_risk || 'Rendah',
                                      is_pregnant: !!p.is_pregnant,
                                      is_child: !!p.is_child,
                                      child_birth_date: p.child_birth_date || ''
                                    });
                                    if (p.anc) {
                                      const existingHpht = p.anc.hpht || '';
                                      setAncForm({
                                        hpht: existingHpht,
                                        gestational_age: existingHpht ? calculateGestationalAge(existingHpht) : (p.anc.gestational_age || ''),
                                        estimated_delivery_date: existingHpht ? calculateHPL(existingHpht) : (p.anc.estimated_delivery_date || ''),
                                        tfu: '', leopold_1: '', leopold_2: '', leopold_3: '', leopold_4: '', djj: '', poedji_rochjati_score: '', fetal_development: '', next_checkup_date: '', usg_bpd: '', usg_hc: '', usg_ac: '', usg_fl: '', usg_tbj: '', usg_afi: '', usg_placenta: '', usg_presentation: '', usg_image: '', usg_image_notes: ''
                                      });
                                    }
                                    setIsNewVisit(true);
                                    setInnerPatientSearch('');
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex justify-between items-center"
                                >
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{p.name}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">RM: #{p.rm_number || p.id.toString().padStart(6, '0')} • {p.age} Thn</div>
                                  </div>
                                  <div className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Pilih</div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Nama Lengkap Pasien *</label>
                    <input required value={patientForm.name} onChange={e => setPatientForm({...patientForm, name: e.target.value})} type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama sesuai identitas" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Umur *</label>
                      <input required value={patientForm.age} onChange={e => setPatientForm({...patientForm, age: e.target.value})} type="number" min="0" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tahun" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Jenis Kelamin</label>
                      <select required value={patientForm.gender} onChange={e => {
                        const newGender = e.target.value;
                        setPatientForm({...patientForm, gender: newGender, is_pregnant: newGender === 'Laki-laki' ? false : patientForm.is_pregnant});
                      }} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {patientForm.gender === 'Perempuan' && (
                      <div className="flex items-center gap-2">
                         <input 
                           type="checkbox" 
                           id="is_pregnant" 
                           checked={patientForm.is_pregnant} 
                           onChange={e => setPatientForm({...patientForm, is_pregnant: e.target.checked})}
                           className="w-4 h-4 text-pink-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-pink-500"
                         />
                         <label htmlFor="is_pregnant" className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none flex items-center gap-1">
                           <Baby className="w-4 h-4 text-pink-600" /> Pasien adalah Ibu Hamil
                         </label>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                         <input 
                           type="checkbox" 
                           id="is_child" 
                           checked={patientForm.is_child} 
                           onChange={e => setPatientForm({...patientForm, is_child: e.target.checked, child_birth_date: e.target.checked ? patientForm.child_birth_date : ''})}
                           className="w-4 h-4 text-emerald-600 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-emerald-500"
                         />
                         <label htmlFor="is_child" className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none flex items-center gap-1">
                           <Baby className="w-4 h-4 text-emerald-600" /> Pasien adalah Bayi/Anak (Otomatis masuk menu Bayi & Anak)
                         </label>
                      </div>
                      
                      {patientForm.is_child && (
                        <div className="ml-6">
                           <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tanggal Lahir Anak *</label>
                           <input 
                             type="date" 
                             required={patientForm.is_child}
                             value={patientForm.child_birth_date} 
                             onChange={e => setPatientForm({...patientForm, child_birth_date: e.target.value})}
                             className="w-full sm:w-1/2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                           />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">No. Telepon / HP</label>
                      <input value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} type="tel" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08xx..." />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Status Pelayanan</label>
                      <select required value={patientForm.status} onChange={e => setPatientForm({...patientForm, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diperiksa">Diperiksa</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Alamat Lengkap</label>
                    <textarea value={patientForm.address} onChange={e => setPatientForm({...patientForm, address: e.target.value})} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jalan, RT/RW, dll" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none">Keluhan & Rekam Medis Awal</label>
                    <textarea required value={patientForm.complaint} onChange={e => setPatientForm({...patientForm, complaint: e.target.value})} rows={3} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Anamnesis singkat saat pendaftaran..." />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none text-red-600 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Riwayat Alergi (Obat/Makanan)</label>
                    <input value={patientForm.allergies} onChange={e => setPatientForm({...patientForm, allergies: e.target.value})} type="text" className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-red-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Kosongkan jika tidak ada" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 pointer-events-none text-orange-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Penilaian Risiko Jatuh</label>
                    <select value={patientForm.fall_risk} onChange={e => setPatientForm({...patientForm, fall_risk: e.target.value})} className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-orange-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="Rendah">Rendah (Aman)</option>
                      <option value="Sedang">Sedang (Perlu Perhatian)</option>
                      <option value="Tinggi">Tinggi (Butuh Kursi Roda/Pengawasan)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 pointer-events-none flex items-center gap-1">
                      <Camera className="w-4 h-4 text-indigo-500" /> Foto Pasien Masuk / Dokumen Pendukung
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-normal italic">Opsional - max 1200px</span>
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                      {(patientForm.registration_images || []).map((imgUrl, i) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm group">
                          <img src={imgUrl} className="w-full h-full object-cover" alt="Registration Document" />
                          <button 
                            type="button"
                            onClick={() => setPatientForm(prev => ({ ...prev, registration_images: (prev.registration_images || []).filter((_, index) => index !== i) }))}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-video flex flex-col justify-center items-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 uppercase tracking-widest text-center px-2">Tambah Foto</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX = 1200;
                                let width = img.width;
                                let height = img.height;
                                if (width > height && width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
                                else if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
                                canvas.width = width; canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = '#FFFFFF';
                                  ctx.fillRect(0, 0, width, height);
                                  ctx.drawImage(img, 0, 0, width, height);
                                }
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                setPatientForm(prev => ({ ...prev, registration_images: [...(prev.registration_images || []), dataUrl] }));
                              };
                              img.src = ev.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          });
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* Integrated Vitals Section */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                       <Activity className="w-4 h-4 text-indigo-600" /> Pemeriksaan Vital (TTV)
                       <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded italic">Opsional</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <VitalInputField 
                        label="Tensi" 
                        unit="mmHg" 
                        value={vitalsForm.blood_pressure} 
                        onChange={(val: any) => setVitalsForm({...vitalsForm, blood_pressure: val})} 
                        placeholder="120/80" 
                      />
                      <VitalInputField 
                        label="Suhu" 
                        unit="°C" 
                        type="number" 
                        step="0.1" 
                        value={vitalsForm.temperature} 
                        onChange={(val: any) => setVitalsForm({...vitalsForm, temperature: val})} 
                        placeholder="36.5" 
                      />
                      <VitalInputField 
                        label="Nadi" 
                        unit="bpm" 
                        type="number" 
                        value={vitalsForm.heart_rate} 
                        onChange={(val: any) => setVitalsForm({...vitalsForm, heart_rate: val})} 
                        placeholder="80" 
                      />
                      <VitalInputField 
                        label="BB" 
                        unit="kg" 
                        type="number" 
                        step="0.1" 
                        value={vitalsForm.weight} 
                        onChange={(val: any) => setVitalsForm({...vitalsForm, weight: val})} 
                        placeholder="60" 
                      />
                      <VitalInputField 
                        label="TB" 
                        unit="cm" 
                        type="number" 
                        step="0.1" 
                        value={vitalsForm.height} 
                        onChange={(val: any) => setVitalsForm({...vitalsForm, height: val})} 
                        placeholder="165" 
                      />
                      <VitalInputField 
                        label="Napas" 
                        unit="x/m" 
                        type="number" 
                        value={vitalsForm.respiratory_rate} 
                        onChange={(val: any) => setVitalsForm({...vitalsForm, respiratory_rate: val})} 
                        placeholder="20" 
                      />
                    </div>
                  </div>

                  {/* Integrated ANC Section */}
                  {patientForm.is_pregnant && (
                    <div className="pt-4 border-t border-pink-100 dark:border-pink-900/30 bg-pink-50/30 dark:bg-pink-950/10 -mx-5 px-5 pb-4">
                      <h4 className="text-sm font-bold text-pink-800 dark:text-pink-400 mb-3 flex items-center gap-2">
                         <Baby className="w-4 h-4 text-pink-600 dark:text-pink-400" /> Pemeriksaan ANC (Ibu Hamil)
                         <span className="text-[10px] font-normal text-pink-400 dark:text-pink-500 bg-pink-100 dark:bg-pink-800 px-1.5 py-0.5 rounded italic">Opsional</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <VitalInputField 
                          label="HPHT" 
                          unit="Haid Terakhir" 
                          type="date" 
                          value={ancForm.hpht} 
                          onChange={(val: any) => setAncForm({...ancForm, hpht: val, estimated_delivery_date: calculateHPL(val), gestational_age: calculateGestationalAge(val)})} 
                        />
                        <VitalInputField 
                          label="Usia Kehamilan" 
                          unit="Minggu" 
                          type="number" 
                          value={ancForm.gestational_age} 
                          onChange={(val: any) => setAncForm({...ancForm, gestational_age: val})} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <VitalInputField 
                          label="Tinggi Fundus" 
                          unit="cm" 
                          value={ancForm.tfu} 
                          onChange={(val: any) => setAncForm({...ancForm, tfu: val})} 
                          placeholder="TFU" 
                        />
                        <VitalInputField 
                          label="Djj" 
                          unit="x/menit" 
                          value={ancForm.djj} 
                          onChange={(val: any) => setAncForm({...ancForm, djj: val})} 
                          placeholder="Jantung Janin" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex justify-end gap-3 mt-4 shrink-0 border-t dark:border-slate-800">
                  <button type="button" onClick={() => setModalType('none')} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all outline-none">Batal</button>
                  <button type="submit" className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-100 dark:shadow-none transition-all outline-none">
                    {editingItem ? 'Update Data' : (isNewVisit ? 'Konfirmasi Kunjungan' : 'Simpan & Daftar Pasien')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

                <MedicalModals
          modalType={modalType}
          setModalType={setModalType as any}
          editingItem={editingItem}
          vitalsForm={vitalsForm}
          setVitalsForm={setVitalsForm}
          saveVitals={saveVitals}
          handleAiTriage={handleAiTriage}
          isAiTriageLoading={isAiTriageLoading}
          drugForm={drugForm}
          setDrugForm={setDrugForm}
          saveDrug={saveDrug}
          clinicsInfo={clinicsInfo}
          coa={coa}
          currentUser={currentUser}
          soapForm={soapForm}
          setSoapForm={setSoapForm}
          saveSoap={saveSoap}
          selectedPatientImages={selectedPatientImages}
          Icd10Search={Icd10Search}
          prescriptionForm={prescriptionForm}
          setPrescriptionForm={setPrescriptionForm}
          handleAddPrescription={handleAddPrescription}
          handleDeletePrescription={handleDeletePrescription}
          prescriptions={prescriptions}
          drugsInfo={drugsInfo}
          ancForm={ancForm}
          setAncForm={setAncForm}
          saveAnc={saveAnc}
          calculateHPL={calculateHPL}
          calculateGestationalAge={calculateGestationalAge}
        />

        
      <StockHistoryModal
        modalType={modalType}
        setModalType={setModalType as any}
        selectedDrug={selectedDrug}
        stockHistoryData={stockHistoryData}
      />

      <ReferralFormModal
        modalType={modalType}
        setModalType={setModalType as any}
        editingItem={editingItem}
        referralForm={referralForm}
        setReferralForm={setReferralForm}
        saveReferral={saveReferral}
      />

      <PatientHistoryModal
        modalType={modalType}
        setModalType={setModalType as any}
        historyVisits={historyVisits}
        generatePatientPDF={generatePatientPDF}
        openChildrenModal={openChildrenModal}
        historyVisitFilter={historyVisitFilter}
        setHistoryVisitFilter={setHistoryVisitFilter}
        billingsData={billingsData}
      />

      <ChildrenModals
        modalType={modalType}
        setModalType={setModalType as any}
        editingItem={editingItem}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild as any}
        childForm={childForm}
        setChildForm={setChildForm}
        saveChild={saveChild}
        immunizationForm={immunizationForm}
        setImmunizationForm={setImmunizationForm}
        saveImmunization={saveImmunization}
        growthForm={growthForm}
        setGrowthForm={setGrowthForm}
        saveGrowth={saveGrowth}
        darkMode={darkMode}
        currentUser={currentUser}
        getChildImmunizationStatus={getChildImmunizationStatus}
        openNewChildModal={openNewChildModal}
      />
      </main>
      </div>


      {/* DASHBOARD DETAILS MODAL */}
      <DashboardDetailModal
        modalType={modalType}
        setModalType={setModalType as any}
        dashboardDetailType={dashboardDetailType}
        patientsInfo={patientsInfo}
        bedsInfo={bedsInfo}
        billingsData={billingsData}
        dashboardMetrics={dashboardMetrics}
        drugsInfo={drugsInfo}
      />

      {/* --- CONFIRMATION & SUCCESS OVERLAYS --- */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 flex items-center justify-center p-4 z-[100] backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 uppercase tracking-tight">Konfirmasi Simpan</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 pr-2 pl-2">
                {confirmAction.message}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-750 transition-all active:scale-95 outline-none"
                >
                  Belum
                </button>
                <button 
                  onClick={confirmAction.onConfirm}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all active:scale-95 outline-none"
                >
                  Ya, Benar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110]"
          >
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-emerald-500/50 backdrop-blur-md">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-0.5">Success Protocol</p>
                <p className="text-sm font-black tracking-tight leading-none">Data Berhasil Tersimpan</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Copilot Bubble */}
      {!isChatbotDismissed && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] flex flex-col items-end gap-3 pointer-events-none">
          <AnimatePresence>
            {aiChatOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="w-[300px] sm:w-[400px] h-[480px] sm:h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden pointer-events-auto"
              >
                <div className="bg-indigo-600 p-4 sm:p-5 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">AI Copilot</h4>
                      <p className="text-white/60 text-[8px] sm:text-[9px] font-medium italic">Clinical Intelligence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setIsChatbotDismissed(true);
                        localStorage.setItem('nhc_chatbot_dismissed', 'true');
                        setAiChatOpen(false);
                      }} 
                      className="text-white/70 hover:bg-white/10 hover:text-white p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[8px] font-black uppercase tracking-wider shrink-0"
                      title="Sembunyikan Widget Melayang"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Sembunyikan</span>
                    </button>
                    <button onClick={() => setAiChatOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors">
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-grow overflow-auto p-4 sm:p-5 flex flex-col gap-5 custom-scrollbar bg-slate-50 dark:bg-slate-950/20">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] px-4 sm:px-5 py-3 sm:py-4 rounded-3xl text-xs leading-relaxed shadow-sm ring-1 ring-black/5 ${ msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none' }`}>
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 px-4 sm:px-5 py-3 sm:py-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-600 rounded-full animate-bounce [animation-duration:0.8s]" />
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-600 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-600 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <button 
                      onClick={() => setTtsEnabled(!ttsEnabled)}
                      className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${ttsEnabled ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      title={ttsEnabled ? "Matikan Suara AI" : "Nyalakan Suara AI"}
                    >
                      {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{ttsEnabled ? 'Suara Aktif' : 'Suara Bisu'}</span>
                    </button>
                    {isSpeaking && (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-indigo-500 animate-pulse rounded-full"></span>
                        <span className="w-1 h-4 bg-indigo-500 animate-pulse delay-75 rounded-full"></span>
                        <span className="w-1 h-2 bg-indigo-500 animate-pulse delay-150 rounded-full"></span>
                      </div>
                    )}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                        placeholder="Tanya stok, performa, rekam medis..."
                        className="w-full pl-4 sm:pl-5 pr-12 py-3 sm:py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-[1.5rem] text-[11px] focus:ring-2 focus:ring-indigo-600 transition-all outline-none dark:text-white font-medium"
                      />
                      <button 
                        onClick={() => sendAiMessage()}
                        disabled={!aiInput.trim() || isAiTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-[1rem] flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={toggleListen}
                      className={`shrink-0 w-10 sm:w-12 h-10 sm:h-12 rounded-[1.5rem] flex items-center justify-center transition-all ${
                        isListening 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={isListening ? "Sedang Mendengarkan... Klik untuk berhenti" : "Voice Note (Bicara ke AI)"}
                    >
                      <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${isListening ? 'scale-110' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group/launcher pointer-events-auto">
            {/* Tiny Launcher Dismiss X Icon */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsChatbotDismissed(true);
                localStorage.setItem('nhc_chatbot_dismissed', 'true');
                setAiChatOpen(false);
              }}
              className="absolute -top-2 -right-2 z-[1010] w-6 h-6 bg-red-600/95 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg border border-white dark:border-slate-800 transition-all cursor-pointer pointer-events-auto hover:scale-110 active:scale-95"
              title="Sembunyikan tombol melayang"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <motion.button 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAiChatOpen(!aiChatOpen)}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-xl sm:rounded-[1.5rem] shadow-2xl flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-all ring-4 sm:ring-8 ring-indigo-50 dark:ring-indigo-900/30 relative overflow-hidden outline-none"
            >
              {aiChatOpen ? <X className="w-5 h-5 sm:w-7 sm:h-7" /> : <Bot className="w-6 h-6 sm:w-8 sm:h-8" />}
              {!aiChatOpen && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-emerald-500 border border-white dark:border-slate-800"></span>
                </span>
              )}
              <div className="absolute right-full mr-4 sm:mr-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/launcher:opacity-100 transition-all scale-90 group-hover/launcher:scale-100 hidden sm:block shadow-xl border border-white/10">
                Ada yang bisa dibantu?
              </div>
            </motion.button>
          </div>
        </div>
      )}

      <style>{`
        /* Global & Custom Scrollbar Stylings - Theme Responsive */
        ::-webkit-scrollbar {
          width: 8px !important;
          height: 8px !important;
        }
        ::-webkit-scrollbar-track {
          background: transparent !important;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 9999px !important;
          border: 2px solid transparent !important;
          background-clip: padding-box !important;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
          border: 2px solid transparent !important;
          background-clip: padding-box !important;
        }

        /* Custom scrollbar class responsive overrides */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 9999px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }

        /* Dark mode overrides (applied via root dark class) */
        .dark ::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .dark ::-webkit-scrollbar-thumb {
          background: #475569 !important;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b !important;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569 !important;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b !important;
        }
      `}</style>
      <AnimatePresence>
        <LabResultsModal 
          labResultsModalOpen={labResultsModalOpen}
          setLabResultsModalOpen={setLabResultsModalOpen}
          currentLabResults={currentLabResults}
          setCurrentLabResults={setCurrentLabResults}
          fetchLabOrders={fetchLabOrders}
        />
      </AnimatePresence>
    </div>
  );
}
