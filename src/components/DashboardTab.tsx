import React from 'react';
import { Building2, Pill, CalendarDays, MessageSquare, UserPlus, Banknote } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line } from 'recharts';

interface DashboardTabProps {
  currentUser: any;
  clinicsInfo: any[];
  forcedClinicFilter: number | null;
  setForcedClinicFilter: (id: number | null) => void;
  dashboardMetrics: any;
  drugsInfo: any[];
  upcomingReminders: any[];
  shiftsInfo: any[];
  setActiveTab: (tab: any) => void;
  setDashboardDetailType: (type: any) => void;
  setModalType: (type: any) => void;
  triggerPatientWhatsAppNotification: (patient: any, dateText: string, title: string) => void;
}

export default function DashboardTab({
  currentUser,
  clinicsInfo,
  forcedClinicFilter,
  setForcedClinicFilter,
  dashboardMetrics,
  drugsInfo,
  upcomingReminders,
  shiftsInfo,
  setActiveTab,
  setDashboardDetailType,
  setModalType,
  triggerPatientWhatsAppNotification
}: DashboardTabProps) {
  return (
    <div className="animate-in fade-in h-full flex flex-col pt-2 max-w-7xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 shrink-0 px-2 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest">Live Dashboard System</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            Overview
          </h2>
        </div>
        <div className="flex items-center gap-6 pb-1 border-b border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mb-1">Current User</p>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{currentUser?.name}</p>
          </div>
          {(currentUser?.role === 'Superadmin' || currentUser?.role === 'Admin') && clinicsInfo.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <select 
                value={forcedClinicFilter || ''} 
                onChange={(e) => setForcedClinicFilter(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:text-black dark:hover:text-white focus:border-b-2 focus:border-black dark:focus:border-white"
              >
                <option value="" className="dark:bg-slate-900">All Clinics</option>
                {clinicsInfo.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pb-8 custom-scrollbar px-2">
        {/* Top Row: Key Metrics */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => { setDashboardDetailType('waiting'); setModalType('dashboardDetail'); }} className="cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Patient Queue</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-light text-slate-900 dark:text-white tracking-tighter leading-none">{dashboardMetrics.pStats.waiting}</span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-1">waiting</span>
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
               <span className="block text-9xl font-black">?</span>
            </div>
          </div>
          
          <div onClick={() => { setDashboardDetailType('inAction'); setModalType('dashboardDetail'); }} className="cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">In Progress</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-light text-slate-900 dark:text-white tracking-tighter leading-none">{dashboardMetrics.pStats.inAction}</span>
              <span className="text-xs font-mono text-[#F27D26] mb-1">active</span>
            </div>
          </div>

          <div onClick={() => { setDashboardDetailType('finished'); setModalType('dashboardDetail'); }} className="cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Finished</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-light text-slate-900 dark:text-white tracking-tighter leading-none">{dashboardMetrics.pStats.finished}</span>
              <span className="text-xs font-mono text-[#00A86B] mb-1">cleared</span>
            </div>
          </div>
        </div>

        {/* Main Analytics Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div onClick={() => { setDashboardDetailType('revenue'); setModalType('dashboardDetail'); }} className="cursor-pointer border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] flex-grow flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Revenue Trajectory</h3>
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">7 Day Window</p>
              </div>
              <div className="text-right cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setDashboardDetailType('revenueToday'); setModalType('dashboardDetail'); }}>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Today's Gross (Rp)</p>
                <p className="text-3xl font-light text-slate-900 dark:text-white tracking-tight">{dashboardMetrics.todayRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex-grow min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={dashboardMetrics.revChartData}>
                  <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} dx={-10} width={40} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '0', border: '1px solid #E2E8F0', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)', background: '#fff' }}
                    labelStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#0F172A' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: '#0F172A', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#0F172A', stroke: '#0F172A' }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="cursor-pointer border border-slate-200/60 shadow-sm shadow-slate-200/50 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bed Utilization</h3>
                    <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{dashboardMetrics.bStats.rate}%</span>
                  </div>
                  <div className="flex gap-1.5 h-8 mb-4">
                     {Array.from({ length: 10 }).map((_, i) => (
                       <div key={i} className={`flex-1 rounded-sm ${i < Math.round(dashboardMetrics.bStats.rate / 10) ? 'bg-[#0f172a] dark:bg-slate-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                     ))}
                  </div>
                  <div className="flex justify-between mb-6">
                     <span onClick={(e) => { e.stopPropagation(); setDashboardDetailType('bedOccupied'); setModalType('dashboardDetail'); }} className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:hover:text-white border-b border-transparent hover:border-slate-400">{dashboardMetrics.bStats.occupied} IN USE</span>
                     <span onClick={(e) => { e.stopPropagation(); setDashboardDetailType('bedAvailable'); setModalType('dashboardDetail'); }} className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest cursor-pointer hover:text-slate-900 dark:hover:text-white border-b border-transparent hover:border-slate-400">{dashboardMetrics.bStats.available} FREE</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Occupancy Trends</span>
                    <button className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold uppercase">View Trends</button>
                  </div>
                  <div className="h-12 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={[
                        { date: 'Day 1', rate: Math.max(0, dashboardMetrics.bStats.rate - 20) },
                        { date: 'Day 2', rate: Math.max(0, dashboardMetrics.bStats.rate - 15) },
                        { date: 'Day 3', rate: Math.max(0, dashboardMetrics.bStats.rate - 5) },
                        { date: 'Day 4', rate: Math.max(0, dashboardMetrics.bStats.rate - 10) },
                        { date: 'Day 5', rate: Math.max(0, dashboardMetrics.bStats.rate + 5) },
                        { date: 'Day 6', rate: dashboardMetrics.bStats.rate },
                        { date: 'Day 7', rate: dashboardMetrics.bStats.rate }
                      ]}>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: '#fff', fontSize: '10px' }}
                          labelStyle={{ display: 'none' }}
                          itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value}%`, 'Occupancy']}
                        />
                        <Line type="monotone" dataKey="rate" stroke="#0F172A" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
             </div>

             <div onClick={() => { setDashboardDetailType('lowStock'); setModalType('dashboardDetail'); }} className="cursor-pointer border border-slate-200/60 shadow-sm shadow-slate-200/50 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Low Stock Alert</h3>
                  <Pill className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[120px]">
                   {drugsInfo.filter(d => d.stock < 20).length > 0 ? (
                      drugsInfo.filter(d => d.stock < 20).slice(0, 4).map(d => (
                        <div key={d.id} className="flex justify-between text-xs items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 last:border-0">
                           <span className="font-medium text-slate-800 dark:text-slate-100 max-w-[140px] truncate">{d.name}</span>
                           <span className={`font-mono font-bold ${d.stock <= 5 ? 'text-red-500' : 'text-orange-500'}`}>{d.stock}</span>
                        </div>
                      ))
                   ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">No critical items</span>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-6 rounded-[24px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight">Jadwal Pengingat Pasien</h3>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">H-3 (Dalam 3 Hari Ke Depan)</p>
              </div>
            </div>
            <div className="space-y-3">
              {upcomingReminders.length > 0 ? (
                upcomingReminders.map(rem => (
                  <div key={rem.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                         <CalendarDays className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{rem.patient.name}</p>
                         <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">{rem.dateText} &middot; <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase">{rem.title}</span></p>
                       </div>
                    </div>
                    <button
                      onClick={() => triggerPatientWhatsAppNotification(rem.patient, rem.dateText, rem.title)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none transition-transform hover:scale-105"
                      title="Kirim WA Pengingat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tidak ada jadwal dalam 3 hari ke depan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Metrics / HR */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-[24px] border border-slate-800 bg-slate-900 text-white p-6 md:p-8 shadow-sm">
             <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Active Floor Roster</h3>
             <div className="space-y-5">
               {shiftsInfo.length > 0 ? (
                  shiftsInfo.slice(0, 4).map((s, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                       <div className="flex justify-between items-end">
                          <span className="text-base font-semibold tracking-tight">{s.user_name}</span>
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{s.start_time}-{s.end_time}</span>
                       </div>
                       <span className="text-[10px] uppercase tracking-widest text-[#00A86B] font-bold">{s.role}</span>
                    </div>
                  ))
               ) : (
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">No staff on active shift</span>
               )}
             </div>
          </div>

          <div className="border border-slate-200/60 shadow-sm shadow-slate-200/50 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px]">
             <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">System Status</h3>
             <div className="flex items-center gap-3 mb-4">
               <div className="w-2.5 h-2.5 bg-[#00A86B] rounded-full animate-pulse" />
               <span className="text-base font-medium text-slate-800 dark:text-slate-100 tracking-tight">Database Connected</span>
             </div>
             <div className="pl-6 space-y-1">
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Latency: <span className="text-slate-600 dark:text-slate-300 font-bold">12ms</span></p>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Uptime: <span className="text-slate-600 dark:text-slate-300 font-bold">99.9%</span></p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto border-t border-slate-200 dark:border-slate-800 pt-6">
             <button onClick={() => setActiveTab('patients')} className="border border-slate-200/60 rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm bg-white dark:bg-slate-900 transition-all flex flex-col items-center gap-3 group">
                <UserPlus className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300">Walk-in</span>
             </button>
             <button onClick={() => setActiveTab('billing')} className="border border-slate-200/60 rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm bg-white dark:bg-slate-900 transition-all flex flex-col items-center gap-3 group">
                <Banknote className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 transition-colors" />
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300">Checkout</span>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
