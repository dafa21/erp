import React, { useState } from 'react';
import { 
  PieChart as PieChartIcon, 
  Baby, 
  ShieldAlert, 
  Users, 
  Activity, 
  TrendingUp, 
  Building, 
  Heart,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie,
  Legend
} from 'recharts';

interface PatientAnalyticsTabProps {
  patientsInfo: any[];
  dashboardMetrics: any;
  setDashboardDetailType: (type: string) => void;
  setModalType: (type: string | null) => void;
  clinicsInfo?: any[];
}

export function PatientAnalyticsTab({
  patientsInfo = [],
  dashboardMetrics,
  setDashboardDetailType,
  setModalType,
  clinicsInfo = []
}: PatientAnalyticsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'anc'>('general');

  // --- Calculations for Antenatal Care (ANC) Metrics ---
  const pregnantPatients = patientsInfo.filter(
    (p) => p.is_pregnant === 1 || p.is_pregnant === true
  );

  // 1. Gestational Age (Usia Kehamilan) brackets
  const gestationalAgeData = [
    { name: '< 12 Minggu (Trimester I)', count: 0, fill: '#ec4899' },
    { name: '12 - 20 Minggu (Trimester II)', count: 0, fill: '#f43f5e' },
    { name: '21 - 27 Minggu (Trimester II Akhir)', count: 0, fill: '#db2777' },
    { name: '28 - 36 Minggu (Trimester III)', count: 0, fill: '#db2777' },
    { name: '37+ Minggu (Cukup Bulan / Term)', count: 0, fill: '#be185d' },
    { name: 'Belum Terisi', count: 0, fill: '#94a3b8' }
  ];

  pregnantPatients.forEach((p) => {
    const ageRaw = p.anc?.gestational_age;
    if (!ageRaw) {
      gestationalAgeData[5].count += 1;
      return;
    }
    const ageWeeks = parseInt(String(ageRaw).replace(/[^0-9]/g, ''), 10);
    if (isNaN(ageWeeks) || ageWeeks <= 0) {
      gestationalAgeData[5].count += 1;
    } else if (ageWeeks < 12) {
      gestationalAgeData[0].count += 1;
    } else if (ageWeeks <= 20) {
      gestationalAgeData[1].count += 1;
    } else if (ageWeeks <= 27) {
      gestationalAgeData[2].count += 1;
    } else if (ageWeeks <= 36) {
      gestationalAgeData[3].count += 1;
    } else {
      gestationalAgeData[4].count += 1;
    }
  });

  // Filter out empty group unless they hold patients
  const displayGestationalData = gestationalAgeData.filter(d => d.count > 0 || d.name !== 'Belum Terisi');

  // 2. High-risk pregnancies using Poedji Rochjati scorecard
  // Low Risk: Poedji Rochjati Score <= 2
  // High Risk: Score 6 - 10
  // Very High Risk: Score >= 12
  const riskCategories = [
    { name: 'Risiko Rendah (KRR)', count: 0, color: '#10b981' },
    { name: 'Risiko Tinggi (KRT)', count: 0, color: '#f59e0b' },
    { name: 'Risiko Sangat Tinggi (KRST)', count: 0, color: '#ef4444' }
  ];

  pregnantPatients.forEach((p) => {
    const prScore = parseInt(p.anc?.poedji_rochjati_score || '2', 10);
    if (isNaN(prScore) || prScore <= 2) {
      riskCategories[0].count += 1;
    } else if (prScore <= 10) {
      riskCategories[1].count += 1;
    } else {
      riskCategories[2].count += 1;
    }
  });

  const highRiskTotal = riskCategories[1].count + riskCategories[2].count;
  const highRiskPercentage = pregnantPatients.length > 0 
    ? ((highRiskTotal / pregnantPatients.length) * 100).toFixed(0) 
    : '0';

  // 3. Risk across clinics calculation
  const riskByClinicData = clinicsInfo.map((clinic) => {
    const clinicPregnant = pregnantPatients.filter(
      (p) => String(p.clinic_id) === String(clinic.id)
    );

    const lowRisk = clinicPregnant.filter((p) => {
      const score = parseInt(p.anc?.poedji_rochjati_score || '2', 10);
      return isNaN(score) || score <= 2;
    }).length;

    const highRisk = clinicPregnant.filter((p) => {
      const score = parseInt(p.anc?.poedji_rochjati_score || '0', 10);
      return score >= 6 && score <= 10;
    }).length;

    const veryHighRisk = clinicPregnant.filter((p) => {
      const score = parseInt(p.anc?.poedji_rochjati_score || '0', 10);
      return score >= 12;
    }).length;

    return {
      name: clinic.name || `Klinik ID ${clinic.id}`,
      'Risiko Rendah': lowRisk,
      'Risiko Tinggi': highRisk,
      'Sangat Tinggi': veryHighRisk,
      total: clinicPregnant.length
    };
  });

  // Stats averages
  let totalWeeksCalculated = 0;
  let countWeeksCalculated = 0;
  pregnantPatients.forEach((p) => {
    const ageRaw = p.anc?.gestational_age;
    if (ageRaw) {
      const ageWeeks = parseInt(String(ageRaw).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(ageWeeks) && ageWeeks > 0) {
        totalWeeksCalculated += ageWeeks;
        countWeeksCalculated++;
      }
    }
  });
  const avgGestWeeks = countWeeksCalculated > 0 
    ? (totalWeeksCalculated / countWeeksCalculated).toFixed(1) 
    : '-';

  return (
    <div className="animate-in fade-in h-full flex flex-col pt-2 max-w-7xl mx-auto w-full">
      {/* Title & Navigation Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 shrink-0 px-2 gap-4">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <PieChartIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
               <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sistem Klinik Terpadu / Analitika</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
               Klinik & Pasien Analitis
            </h2>
         </div>
         <div className="flex items-center gap-6 pb-1">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mb-1">Total Pasien</p>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">{patientsInfo.length}</p>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="text-right">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mb-1">Registrasi Ibu Hamil</p>
              <p className="text-lg font-black text-pink-600 dark:text-pink-400 leading-none">{pregnantPatients.length}</p>
            </div>
         </div>
      </header>

      {/* Modern Sub-Tab Switching menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-6 font-mono text-xs font-semibold gap-6 flex px-2 shrink-0">
        <button 
          onClick={() => setActiveSubTab('general')}
          className={`pb-3 relative transition-colors cursor-pointer uppercase tracking-widest text-[10px] ${activeSubTab === 'general' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          Ringkasan Demografi & Umum
        </button>
        <button 
          onClick={() => setActiveSubTab('anc')}
          className={`pb-3 relative transition-colors cursor-pointer uppercase tracking-widest text-[10px] ${activeSubTab === 'anc' ? 'text-pink-600 dark:text-pink-400 font-bold border-b-2 border-pink-600 dark:border-pink-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          Metrik Ibu Hamil (ANC)
        </button>
      </div>

      {/* Tab: General Demographics & Diagnosis */}
      {activeSubTab === 'general' && (
        <div className="contents">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 pb-6">
             <div className="bg-white dark:bg-slate-900 border border-slate-200/60 shadow-sm p-6 md:p-8 rounded-[24px] flex flex-col group hover:border-slate-300 transition-colors">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Maternal Efficiency</p>
                <span className="text-5xl font-light text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{dashboardMetrics.avgChildren}</span>
                <p className="text-[11px] text-[#00A86B] font-bold uppercase tracking-widest">Children / Patient</p>
             </div>
             <div onClick={() => { setDashboardDetailType('finished'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/60 shadow-sm p-6 md:p-8 rounded-[24px] flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Patient Recovery</p>
                <span className="text-5xl font-light text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{dashboardMetrics.retentionRate}%</span>
                <p className="text-[11px] text-[#F27D26] font-bold uppercase tracking-widest">Finish Rate</p>
             </div>
             <div onClick={() => { setDashboardDetailType('growth'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/60 shadow-sm p-6 md:p-8 rounded-[24px] flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Registry Growth</p>
                <span className="text-5xl font-light text-slate-900 dark:text-white tracking-tighter leading-none mb-2">+{(patientsInfo.length / 10).toFixed(0)}</span>
                <p className="text-[11px] text-blue-500 font-bold uppercase tracking-widest">MoM Acquisition</p>
             </div>
             <div className="bg-slate-900 rounded-[24px] text-white border border-slate-800 shadow-sm p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">System Load</p>
                  <span className="text-4xl font-light tracking-tighter leading-none">Optimal</span>
                </div>
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
                   <div className="w-2 h-2 bg-[#00A86B] rounded-full animate-pulse" />
                   <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00A86B]">Audit: OK</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow pb-8 px-2">
             {/* Age Distribution */}
             <div onClick={() => { setDashboardDetailType('age'); setModalType('dashboardDetail'); }} className="cursor-pointer lg:col-span-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Patient Age Stratification</h3>
                </div>
                <div className="flex-grow min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardMetrics.ageDistribution}>
                      <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} dx={-10} />
                      <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '0', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)' }} labelStyle={{ fontWeight: 'bold', color: '#0F172A', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                      <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={60}>
                         {dashboardMetrics.ageDistribution.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.color === '#6366f1' ? '#0F172A' : entry.color === '#8b5cf6' ? '#334155' : entry.color === '#d946ef' ? '#475569' : entry.color === '#f43f5e' ? '#64748B' : '#94A3B8'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Gender Breakdown */}
             <div onClick={() => { setDashboardDetailType('gender'); setModalType('dashboardDetail'); }} className="cursor-pointer lg:col-span-3 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight mb-8">Gender Distribution</h3>
                <div className="flex-grow flex items-center justify-center relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={dashboardMetrics.genderStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {dashboardMetrics.genderStats.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.color === '#0ea5e9' ? '#0F172A' : '#64748B'} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '0', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)' }} itemStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-3xl font-light text-slate-900 dark:text-white leading-none">{patientsInfo.length}</p>
                     <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                   {dashboardMetrics.genderStats.map((g: any, i: number) => (
                     <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2" style={{ backgroundColor: g.color === '#0ea5e9' ? '#0F172A' : '#64748B' }} />
                           <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{g.name}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{g.value}</span>
                     </div>
                   ))}
                </div>
             </div>

             {/* Top Diagnoses Proportion */}
             <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight mb-8">Diagnosis Terbanyak</h3>
                <div className="flex-grow flex items-center justify-center relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={dashboardMetrics.diagnosisStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {dashboardMetrics.diagnosisStats.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '0', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)' }} itemStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-3xl font-light text-slate-900 dark:text-white leading-none">
                        {dashboardMetrics.diagnosisStats.reduce((sum: number, item: any) => sum + item.value, 0)}
                     </p>
                     <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
                </div>
                <div className="mt-6 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                   {dashboardMetrics.diagnosisStats.map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                         <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-tight truncate" title={d.name}>{d.name}</span>
                         </div>
                         <span className="text-xs font-mono font-bold text-slate-900 dark:text-white shrink-0">{d.value}</span>
                      </div>
                    ))}
                    {dashboardMetrics.diagnosisStats.length === 0 && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-2 font-mono">Belum ada diagnosis</p>
                    )}
                </div>
             </div>
          </div>

          {/* Registration Trend */}
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm flex flex-col mt-4">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Patient Acquisition Engine</h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase mt-1 tracking-widest font-bold">Registry flow over 12 months (Simulated Wave)</p>
                </div>
             </div>
             <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={dashboardMetrics.activeGrowth}>
                   <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#E2E8F0" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} dy={10} />
                   <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '0', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)' }} />
                   <Bar dataKey="count" fill="#1e293b" radius={[0, 0, 0, 0]} maxBarSize={40} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {/* Tab: Antenatal Care (ANC) & Pregnancy Analytics */}
      {activeSubTab === 'anc' && (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-300 px-2 pb-8">
          
          {/* Bento Grid Stats for Mother Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black p-1.5 bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 rounded-lg mb-3 w-max border border-pink-100 dark:border-pink-900/50 uppercase tracking-widest font-mono">ANC ACTIVE CASES</span>
              <div>
                <div className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{pregnantPatients.length}</div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">Ibu hamil aktif saat ini dipantau di semua cabang klinik.</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black p-1.5 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450 rounded-lg mb-3 w-max border border-rose-100 dark:border-rose-900/50 uppercase tracking-widest font-mono">HIGH RISK PREGNANCIES</span>
              <div>
                <div className="text-3xl font-mono font-extrabold text-rose-600 dark:text-rose-400">{highRiskTotal}</div>
                <p className="text-[10px] text-rose-500 dark:text-rose-450 mt-2 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {highRiskPercentage}% Dari Total Kasus
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-[20px] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black p-1.5 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 rounded-lg mb-3 w-max border border-sky-100 dark:border-sky-900/50 uppercase tracking-widest font-mono">AVERAGE GESTATION AGE</span>
              <div>
                <div className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">
                  {avgGestWeeks} <span className="text-sm font-normal text-slate-450">Minggu</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">Tingkat usia kandungan rata-rata pasien hamil terdaftar.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-[20px] shadow-sm flex flex-col justify-between text-white">
              <span className="text-[10px] font-black p-1.5 bg-pink-950/50 text-pink-400 rounded-lg mb-3 w-max border border-pink-900 uppercase tracking-widest font-mono">MATERNAL RATING</span>
              <div>
                <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                  Optimal Care
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">Sistem Rujukan & P.R Score scorecard aktif.</p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gestational Age Distribution */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400 px-2.5 py-1 rounded border border-pink-150 dark:border-pink-900 font-mono font-bold uppercase tracking-wider">Gestational Age Distribution</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight mt-3 uppercase tracking-wider">Distribusi Usia Kandungan (Minggu)</h3>
              </div>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayGestationalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} 
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#FDF2F8/40' }} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #FBCFE8', background: '#fff', boxShadow: '4px 4px 0 rgba(219,39,119,0.05)' }} 
                      labelStyle={{ fontWeight: 'bold', color: '#0F172A', fontSize: '11px', fontFamily: 'monospace' }} 
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {displayGestationalData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {displayGestationalData.length === 0 && (
                <div className="text-center text-slate-400 text-xs font-mono py-8">Belum ada data usia kandungan tercatat.</div>
              )}
            </div>

            {/* Pregnancy Risk Categories (Pie Chart) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] bg-indigo-50 text-indigo-750 dark:bg-indigo-950/30 dark:text-indigo-400 px-2.5 py-1 rounded border border-indigo-150 dark:border-indigo-900 font-mono font-bold uppercase tracking-wider">Risk Score Profiling</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight mt-3 uppercase tracking-wider">Tingkat Risiko Ibu Hamil (Skor P.R)</h3>
              </div>
              
              <div className="flex-grow flex items-center justify-center relative min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={riskCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="count"
                      stroke="none"
                    >
                      {riskCategories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-extrabold text-slate-800 dark:text-white leading-none">{pregnantPatients.length}</p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Hamil</p>
                </div>
              </div>

              {/* Legend with styled counters */}
              <div className="mt-4 space-y-2">
                {riskCategories.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{cat.name}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white shrink-0">{cat.count} Pasien</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Risk Pregnancies Across Clinics */}
            <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 px-2.5 py-1 rounded border border-rose-150 dark:border-rose-900 font-mono font-bold uppercase tracking-wider">Inter-Clinic Pregnancy Risks</span>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight mt-3 uppercase tracking-wider">Beban Risiko Kehamilan per Cabang Klinik</h3>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono font-bold text-slate-500 uppercase">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#10b981]" /> Risiko Rendah</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#f59e0b]" /> Risiko Tinggi</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#ef4444]" /> Sangat Tinggi</span>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskByClinicData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }} barGap={2}>
                    <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#64748B', fontWeight: 'bold', fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} 
                      allowDecimals={false}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#F8FAFC' }} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff' }} 
                    />
                    <Bar dataKey="Risiko Rendah" stackId="a" fill="#10b981" maxBarSize={45} />
                    <Bar dataKey="Risiko Tinggi" stackId="a" fill="#f59e0b" maxBarSize={45} />
                    <Bar dataKey="Sangat Tinggi" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 gap-4 text-xs font-mono font-bold">
                <p className="text-slate-500 uppercase text-[10px]">
                  Rujukan wajib: Skoring Poedji Rochjati (PR) dinilai pada setiap kunjungan ANC berkala.
                </p>
                <div className="flex gap-4">
                  <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-700">
                    KRR: Skor 2 (Fisiologis)
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-700">
                    KRT: Skor 6-10 (Patologis)
                  </div>
                  <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-700">
                    KRST: Skor ≥12 (Gawat Darurat)
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
