import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowLeft, Tv, Clock, Calendar, Play, Sparkles, User, ChevronRight, Activity, Pill, HelpCircle, RefreshCw } from 'lucide-react';

interface QueueTVTabProps {
  patientsInfo: any[];
  clinicsInfo: any[];
  onBackToERP?: () => void;
}

export default function QueueTVTab({ patientsInfo: initialPatientsInfo, clinicsInfo, onBackToERP }: QueueTVTabProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<number | 'all'>('all');
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastCalledPatient, setLastCalledPatient] = useState<any>(null);
  
  // Real-time local state for patient data
  const [localPatients, setLocalPatients] = useState<any[]>(initialPatientsInfo || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Ref to track patient status combinations that have already been auto-announced
  const announcedKeys = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Sync with initial prop changes from context
  useEffect(() => {
    if (initialPatientsInfo && initialPatientsInfo.length > 0) {
      setLocalPatients(initialPatientsInfo);
    }
  }, [initialPatientsInfo]);

  // Keep time updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Soft real-time silent background fetch
  const fetchLocalPatients = async (silent = true) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/patients?role=Superadmin');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocalPatients(data);
          setLastUpdated(new Date());
        }
      }
    } catch (e) {
      console.error('[QueueTV] Soft-refresh failed:', e);
    } finally {
      if (!silent) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  // Poll for updates every 4 seconds silently to catch backend changes without refreshing the entire screen
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchLocalPatients(true);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, []);

  // Filter patients based on clinic selection
  const activePatients = localPatients.filter(p => {
    if (selectedClinicId === 'all') return true;
    return p.clinic_id === Number(selectedClinicId);
  });

  // Split patients into queue segments
  const waitingPatients = activePatients.filter(p => p.status === 'Menunggu');
  const examiningPatients = activePatients.filter(p => 
    p.status === 'Menunggu Dokter' || 
    p.status === 'Diperiksa' || 
    p.status === 'Dalam Pemeriksaan'
  );
  const pharmacyPatients = activePatients.filter(p => 
    p.status === 'Selesai'
  );

  // Helper to determine patient clinic department based on age, pregnancy, and complaints
  const getPatientDepartment = (p: any): { name: string; room: string; color: string; prefix: string } => {
    if (p.is_pregnant === 1 || (p.complaint && p.complaint.toLowerCase().includes('anc'))) {
      return { name: 'Poli Ibu Hamil (ANC)', room: 'Ruang KIA & Bidan', color: 'pink', prefix: 'KIA' };
    }
    if (p.age !== undefined && p.age <= 12) {
      return { name: 'Poli Anak & Tumbuh Kembang', room: 'Ruang Pediatrik', color: 'indigo', prefix: 'ANK' };
    }
    if (p.status === 'Selesai') {
      return { name: 'Loket Kasir & Farmasi', room: 'Farmasi Medika', color: 'emerald', prefix: 'KAS' };
    }
    return { name: 'Poli Umum & Gigi', room: 'Ruang Dokter 1', color: 'blue', prefix: 'UMM' };
  };

  // Speaks aloud the designated text
  const announcePatient = (p: any) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const dept = getPatientDepartment(p);
    const text = `Panggilan kepada pasien, ${p.name}. Nomor antrian, ${dept.prefix}-${p.id.toString().slice(-3)}. Silakan menuju ke ${dept.room}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    
    // Find an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    window.speechSynthesis.speak(utterance);
    setLastCalledPatient({ ...p, dept, timeCalled: new Date() });
  };

  // Auto-announce status change transitions safely (saat sudah pindah suaranya juga pindah!)
  useEffect(() => {
    if (!isUnlocked) return;

    // Identify active queue patients (those who can be called)
    const activeCandidates = localPatients.filter(p => 
      p.status === 'Menunggu Dokter' || 
      p.status === 'Diperiksa' || 
      p.status === 'Dalam Pemeriksaan' ||
      p.status === 'Selesai'
    );

    if (activeCandidates.length > 0) {
      if (isInitialLoad.current) {
        // Build initial set of announced keys to avoid blast sound on mount or unlock
        activeCandidates.forEach(p => {
          const key = `${p.id}-${p.status}`;
          announcedKeys.current.add(key);
        });
        isInitialLoad.current = false;
        
        // Spotlight the latest in-progress single candidate
        const latestCand = activeCandidates[activeCandidates.length - 1];
        const dept = getPatientDepartment(latestCand);
        setLastCalledPatient({ ...latestCand, dept, timeCalled: new Date() });
      } else {
        // Look for any candidate with a state-transition key not yet in announcedKeys
        // Only trigger within the scope of the selected clinic (or any clinic if all is selected)
        const transitionCandidate = activeCandidates.find(p => {
          if (selectedClinicId !== 'all' && p.clinic_id !== Number(selectedClinicId)) {
            return false;
          }
          const key = `${p.id}-${p.status}`;
          return !announcedKeys.current.has(key);
        });

        if (transitionCandidate) {
          const key = `${transitionCandidate.id}-${transitionCandidate.status}`;
          announcedKeys.current.add(key);
          announcePatient(transitionCandidate);
        }
      }
    }
  }, [localPatients, isUnlocked, selectedClinicId]);

  // Unlock audio engine using greeting pattern on click
  const handleUnlockAudio = () => {
    setIsUnlocked(true);
    
    if ('speechSynthesis' in window) {
      const greeting = new SpeechSynthesisUtterance("Layar monitor suara pemanggil diaktifkan.");
      greeting.lang = 'id-ID';
      greeting.rate = 1.0;
      window.speechSynthesis.speak(greeting);
    }
  };

  // Format clinic filter names
  const getClinicName = () => {
    if (selectedClinicId === 'all') return 'Semua Cabang Klinik';
    const c = clinicsInfo.find(item => item.id === Number(selectedClinicId));
    return c ? c.name : 'Cabang Klinik';
  };

  const activeClinic = selectedClinicId === 'all' 
    ? (clinicsInfo[0] || null) 
    : clinicsInfo.find(c => c.id === Number(selectedClinicId));

  let logos: string[] = [];
  if (activeClinic?.sponsor_logo) {
    try {
      logos = activeClinic.sponsor_logo.startsWith('[') ? JSON.parse(activeClinic.sponsor_logo) : [activeClinic.sponsor_logo];
    } catch(e) {
      logos = [activeClinic.sponsor_logo];
    }
  }

  let youtubeUrl = activeClinic?.youtube_link;
  if (youtubeUrl) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s,]+)/g;
    let match;
    const videoIds: string[] = [];
    while ((match = regex.exec(youtubeUrl)) !== null) {
      if (match[1]) videoIds.push(match[1]);
    }
    
    if (videoIds.length > 0) {
      const firstId = videoIds[0];
      if (videoIds.length > 1) {
        const playlist = videoIds.slice(1).join(',') + ',' + firstId;
        youtubeUrl = `https://www.youtube.com/embed/${firstId}?autoplay=1&loop=1&playlist=${playlist}&controls=1&modestbranding=1&rel=0`;
      } else {
        youtubeUrl = `https://www.youtube.com/embed/${firstId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
      }
    } else {
      youtubeUrl = null;
    }
  }

  // Render the starter unlock card in stunning Light-Theme style
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans border-t-2 border-indigo-600">
        {/* Abstract modern minimalist mesh/grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-60" />
        
        <div className="absolute top-10 left-10 flex items-center gap-3 z-10">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Tv className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <span className="font-extrabold text-[#00A86B] tracking-wider uppercase text-xs">MedixaCore TV Console</span>
        </div>

        {onBackToERP && (
          <button 
            onClick={onBackToERP}
            className="absolute top-10 right-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all z-10 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ERP Dashboard</span>
          </button>
        )}

        <div className="w-full max-w-lg z-10 relative mt-10">
          {/* Main Card Grid - Soft Premium Glassmorphism inside light theme */}
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-slate-200/80 p-10 text-center shadow-xl shadow-slate-200/40">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
              <Tv className="w-10 h-10 animate-bounce" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none uppercase mb-3">
              LAYAR ANTREAN PASIEN
            </h1>
            <p className="text-[10px] text-[#00A86B] font-extrabold uppercase tracking-[0.25em] mb-6">
              Sistem Suara Pemanggil Medis • TTS Online Auto-Call
            </p>

            <div className="h-px bg-slate-100 my-6" />

            <p className="text-xs text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
              Klik tombol di bawah ini untuk mengaktifkan mesin audio pemanggil otomatis (<span className="text-indigo-600 font-bold">Text-to-Speech</span>) dan membuka monitor antrean langsung Anda.
            </p>

            {/* Selector for multi-clinic monitoring */}
            {clinicsInfo && clinicsInfo.length > 0 && (
              <div className="mb-6 text-left max-w-xs mx-auto">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Monitoring Cabang Klinik</label>
                <select 
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="all">Semua Cabang Klinik</option>
                  {clinicsInfo.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleUnlockAudio}
              className="w-full max-w-md bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 text-white font-black py-4.5 rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 relative shadow-lg shadow-indigo-100 active:scale-[0.98] outline-none cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>MULAI ANTREAN LIVE</span>
            </button>
          </div>
          
          <p className="text-center text-[7.5px] text-slate-400 font-mono mt-8 uppercase tracking-[0.4em]">
            Medixa Core Labs &copy; 2026. All rights secured.
          </p>
        </div>
      </div>
    );
  }

  // Active TV Dashboard Layout after click - Vibrant elegant interactive Light Theme
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-8 flex flex-col relative overflow-hidden select-none">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-45 pointer-events-none" />

      {/* Top Banner Header */}
      <header className="shrink-0 bg-white border border-slate-200/80 rounded-[2rem] p-5 mb-6 flex flex-col xl:flex-row justify-between items-center gap-4 shadow-sm backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00A86B]/10 text-[#00A86B] rounded-2xl flex items-center justify-center shadow-sm border border-[#00A86B]/20">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">MONITOR ANTREAN PASIEN</h1>
              <span className="bg-emerald-50 text-emerald-600 font-bold text-[8.5px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                Live / Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
              {getClinicName()} {activeClinic?.sponsor_name ? `• SPONSORED BY ${activeClinic.sponsor_name}` : '• MEDIXA MEDICAL NETWORK'}
            </p>
          </div>
        </div>

        {logos.length > 0 && (
          <div className="hidden xl:flex items-center justify-center mx-auto h-12 gap-5 shrink-0 overflow-hidden">
            <div className="flex items-center gap-3">
              {logos.map((lg, idx) => (
                <img key={idx} src={lg} alt={`Sponsor ${idx+1}`} className="h-full max-w-[150px] object-contain drop-shadow-sm" />
              ))}
              {activeClinic?.sponsor_name && (
                <div className="flex flex-col justify-center ml-2 border-l-2 border-slate-200 pl-4 h-8">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Supported By</span>
                  <span className="text-sm font-black text-slate-700 tracking-tight leading-none">{activeClinic.sponsor_name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real-time date time widgets */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/60">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">HARI INI</span>
              <span className="text-xs font-bold text-slate-700 mt-0.5 font-mono leading-none">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/60">
            <Clock className="w-4 h-4 text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">WAKTU AKTIF</span>
              <span className="text-xs font-black text-emerald-600 mt-0.5 font-mono tracking-widest leading-none">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Soft Refresh Sync Indicator widget */}
          <div className="flex items-center gap-2.5 bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">AUTO SYNC</span>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5 font-mono leading-none">
                {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={() => fetchLocalPatients(false)}
              disabled={isRefreshing}
              className={`ml-1.5 p-1.5 px-3 text-[9px] font-bold uppercase tracking-widest rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-sm active:scale-95 ${isRefreshing ? 'opacity-80' : ''}`}
              title="Refresh Antrean"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{isRefreshing ? 'SYNCING' : 'REFRESH'}</span>
            </button>
          </div>

          {/* Controller Operations */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                isMuted 
                  ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100/40' 
                  : 'bg-indigo-50 border-indigo-150 text-indigo-600 hover:bg-indigo-100/50'
              }`}
              title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
            </button>

            {onBackToERP && (
              <button 
                onClick={onBackToERP}
                className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Screen content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 z-10 relative overflow-hidden">
        
        {/* Left Side: Spotlight Large Screen Calling Panel (7 Columns) */}
        <div className="xl:col-span-7 flex flex-col gap-4 overflow-hidden">
          
          {youtubeUrl && (
            <div className="w-full aspect-video bg-black rounded-[2.5rem] border border-slate-200/80 shadow-md relative overflow-hidden shrink-0 group">
              <iframe 
                src={youtubeUrl} 
                className="absolute inset-0 w-full h-full" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}

          {/* Spotlight calling card */}
          <div className="bg-white rounded-[2.5rem] border-2 border-indigo-50/70 flex-1 flex flex-col justify-center items-center p-6 text-center relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 min-h-[350px]">
            {/* Ambient indicator glowing line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#00A86B] to-transparent" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-45 h-45 bg-[#00A86B]/5 rounded-full blur-3xl opacity-60 pointer-events-none" />
            
            <div className="px-5 py-2 bg-indigo-50 text-indigo-650 text-[10.5px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-100/80 mb-8 max-w-max flex items-center gap-2.5 shadow-sm leading-none animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>SEDANG DIPANGGIL • NOW CALLING</span>
            </div>

            {lastCalledPatient ? (
              <div className="space-y-6 w-full animate-in zoom-in-95 duration-300">
                <div className="space-y-1">
                  <h2 className="text-7xl md:text-9xl font-black text-indigo-950 tracking-widest font-mono drop-shadow-sm">
                    {lastCalledPatient.dept.prefix}-{lastCalledPatient.id.toString().slice(-3)}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono tracking-widest uppercase font-extrabold">
                    NOMOR REKAM MEDIS: #{lastCalledPatient.rm_number || lastCalledPatient.id.toString().padStart(6, '0')}
                  </p>
                </div>

                <div className="space-y-1 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 max-w-lg mx-auto md:shadow-inner">
                  <h3 className="text-3xl md:text-5xl font-black text-[#00A86B] tracking-tight truncate capitalize px-4">
                    {lastCalledPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold tracking-wide mt-2">
                    Langkah Medis: {lastCalledPatient.age} Thn • Kelamin: {lastCalledPatient.gender}
                  </p>
                </div>

                {/* Destination banner */}
                <div className="max-w-md mx-auto rounded-3xl bg-slate-50 border border-slate-200/80 p-5 mt-6 relative shadow-sm">
                  <p className="text-[10px] font-extrabold text-[#00A86B] tracking-[0.2em] uppercase">TUJUAN RUANGAN KLINIK</p>
                  <h4 className="text-2xl font-black text-slate-800 mt-2 font-sans tracking-tight leading-none">
                    {lastCalledPatient.dept.name}
                  </h4>
                  <p className="text-xs text-indigo-600 mt-1.5 font-mono uppercase tracking-widest font-extrabold">
                    ({lastCalledPatient.dept.room})
                  </p>
                </div>

                <div className="flex justify-center items-center gap-3 pt-6">
                  {/* Recall button */}
                  <button 
                    onClick={() => announcePatient(lastCalledPatient)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer shadow-md shadow-indigo-150 active:scale-[0.98]"
                    title="Panggil Ulang Pasien"
                  >
                    <Volume2 className="w-4 h-4 text-white" />
                    <span>PANGGIL ULANG</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-slate-400 max-w-sm mx-auto flex flex-col justify-center items-center">
                <Tv className="w-16 h-16 text-slate-300 animate-pulse mb-6" />
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Belum Ada Panggilan</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5 font-medium">
                  Menunggu petugas klinik memperbarui status tindakan medis pasien untuk melakukan panggilan suara interaktif pertama.
                </p>
              </div>
            )}
          </div>
          
          {/* Sub banner widget info */}
          <div className="bg-white border border-slate-200 p-4.5 rounded-[1.5rem] flex justify-between items-center text-xs shrink-0 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Engine Suara</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-600">
                {isMuted ? 'BISU (MUTED)' : 'AKTIF • TEXT TO SPEECH (BAHASA INDONESIA)'}
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Grid of Departments Monitoring Boards (5 Columns) */}
        <div className="xl:col-span-5 flex flex-col gap-6 overflow-hidden">
          
          <div className="text-xs font-black text-slate-400 tracking-wider flex justify-between items-center px-2 shrink-0">
            <span className="uppercase">DAFTAR AKTIVITAS POLIKLINIK</span>
            <span className="text-[11px] font-bold text-[#00A86B] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">{localPatients.length} Pasien Terdaftar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
            
            {/* 1. POLI UMUM */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col overflow-hidden hover:border-slate-300 transition-all shadow-sm">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">POLI UMUM</h3>
                </div>
                <span className="text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md font-extrabold uppercase">UMM</span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                {examiningPatients.filter(p => getPatientDepartment(p).prefix === 'UMM').length > 0 ? (
                  examiningPatients.filter(p => getPatientDepartment(p).prefix === 'UMM').map(p => (
                    <div key={p.id} className="bg-blue-50/60 hover:bg-blue-50 border border-blue-100 p-3 rounded-2xl relative overflow-hidden transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-blue-950 font-mono">UMM-{p.id.toString().slice(-3)}</span>
                        <button 
                          onClick={() => announcePatient(p)}
                          className="p-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer hover:shadow"
                        >
                          <Play className="w-2.5 h-2.5" /> Call
                        </button>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#00A86B] mt-1.5 truncate capitalize">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 lines-clamp-1">{p.complaint || 'Pemeriksaan Dokter'}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                    Poli Kosong
                  </div>
                )}
                
                {/* Awaiting patients list under department */}
                {waitingPatients.filter(p => getPatientDepartment(p).prefix === 'UMM').length > 0 && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Antrean Menunggu:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {waitingPatients.filter(p => getPatientDepartment(p).prefix === 'UMM').slice(0, 3).map(p => (
                        <span key={p.id} className="text-[9px] px-2 py-1 bg-slate-50 text-slate-600 rounded-lg font-mono border border-slate-200">
                          UMM-{p.id.toString().slice(-3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. POLI KIA & IBU HAMIL (ANC) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col overflow-hidden hover:border-slate-300 transition-all shadow-sm">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">POLI KIA (ANC)</h3>
                </div>
                <span className="text-[9px] font-mono bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-md font-extrabold uppercase">KIA</span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                {examiningPatients.filter(p => getPatientDepartment(p).prefix === 'KIA').length > 0 ? (
                  examiningPatients.filter(p => getPatientDepartment(p).prefix === 'KIA').map(p => (
                    <div key={p.id} className="bg-pink-50/60 hover:bg-pink-50 border border-pink-100 p-3 rounded-2xl relative overflow-hidden transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-pink-950 font-mono">KIA-{p.id.toString().slice(-3)}</span>
                        <button 
                          onClick={() => announcePatient(p)}
                          className="p-1 px-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer hover:shadow"
                        >
                          <Play className="w-2.5 h-2.5" /> Call
                        </button>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#00A86B] mt-1.5 truncate capitalize">{p.name}</h4>
                      <p className="text-[10px] text-pink-650 mt-1 lines-clamp-1">Asuhan Kehamilan ANC</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                    KIA Kosong
                  </div>
                )}
                
                {/* Awaiting list */}
                {waitingPatients.filter(p => getPatientDepartment(p).prefix === 'KIA').length > 0 && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Antrean Menunggu:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {waitingPatients.filter(p => getPatientDepartment(p).prefix === 'KIA').slice(0, 3).map(p => (
                        <span key={p.id} className="text-[9px] px-2 py-1 bg-slate-50 text-slate-600 rounded-lg font-mono border border-slate-200">
                          KIA-{p.id.toString().slice(-3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. POLI ANAK & IMPLANT (PEDIATRIK/TUMBUH) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col overflow-hidden hover:border-slate-300 transition-all shadow-sm">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">POLI ANAK</h3>
                </div>
                <span className="text-[9px] font-mono bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md font-extrabold uppercase">ANK</span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                {examiningPatients.filter(p => getPatientDepartment(p).prefix === 'ANK').length > 0 ? (
                  examiningPatients.filter(p => getPatientDepartment(p).prefix === 'ANK').map(p => (
                    <div key={p.id} className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 p-3 rounded-2xl relative overflow-hidden transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-indigo-950 font-mono">ANK-{p.id.toString().slice(-3)}</span>
                        <button 
                          onClick={() => announcePatient(p)}
                          className="p-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer hover:shadow"
                        >
                          <Play className="w-2.5 h-2.5" /> Call
                        </button>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#00A86B] mt-1.5 truncate capitalize">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 lines-clamp-1 font-medium">Tumbuh Kembang & Imunisasi</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                    Anak Kosong
                  </div>
                )}
                
                {/* Awaiting list */}
                {waitingPatients.filter(p => getPatientDepartment(p).prefix === 'ANK').length > 0 && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Antrean Menunggu:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {waitingPatients.filter(p => getPatientDepartment(p).prefix === 'ANK').slice(0, 3).map(p => (
                        <span key={p.id} className="text-[9px] px-2 py-1 bg-slate-50 text-slate-600 rounded-lg font-mono border border-slate-200">
                          ANK-{p.id.toString().slice(-3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. FARMASI & KASIR */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col overflow-hidden hover:border-slate-300 transition-all shadow-sm">
              <div className="flex justify-between items-center mb-4 shrink-0 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">FARMASI & KASIR</h3>
                </div>
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md font-extrabold uppercase">KAS</span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                {pharmacyPatients.length > 0 ? (
                  pharmacyPatients.slice(0, 2).map(p => (
                    <div key={p.id} className="bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 p-3 rounded-2xl relative overflow-hidden transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-emerald-950 font-mono">KAS-{p.id.toString().slice(-3)}</span>
                        <button 
                          onClick={() => announcePatient(p)}
                          className="p-1 px-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer hover:shadow"
                        >
                          <Play className="w-2.5 h-2.5" /> Call
                        </button>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#00A86B] mt-1.5 truncate capitalize">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 leading-none font-semibold"><Pill className="w-3.5 h-3.5 text-emerald-500" /> Pengembalian Obat / Kasir</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                    Kasir Kosong
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
}
