import React from 'react';
import { BarChart3, History } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

interface ReportsTabProps {
  summaryData: any;
  stats: any;
  soapDurationStats: any[];
  darkMode: boolean;
  setDashboardDetailType: (type: any) => void;
  setModalType: (type: any) => void;
  generatePDFReport: () => void;
}

export default function ReportsTab({
  summaryData,
  stats,
  soapDurationStats,
  darkMode,
  setDashboardDetailType,
  setModalType,
  generatePDFReport
}: ReportsTabProps) {
  return (
    <div className="animate-in fade-in h-full flex flex-col pt-2 max-w-7xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 shrink-0 px-2 gap-4">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
               <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest">Intelligence & Operational Metrics</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
               Laporan Strategis ERP
            </h2>
         </div>
         <div className="flex items-center gap-6 pb-1 border-b border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mb-1">Status Report</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">REAL-TIME</p>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <button onClick={generatePDFReport} className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
               Export PDF
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-2">
         <div onClick={() => { setDashboardDetailType('revenue'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Total Revenue</p>
            <p className="text-3xl font-light text-slate-900 dark:text-white mt-1 leading-none tracking-tight">Rp {summaryData.totalRevenue?.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="w-2.5 h-2.5 bg-[#00A86B] rounded-full animate-pulse" />
               <span className="text-[11px] font-mono font-bold text-[#00A86B] uppercase tracking-widest">Growth Active</span>
            </div>
         </div>
         <div onClick={() => { setDashboardDetailType('totalPatients'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Patient Volume</p>
            <p className="text-4xl font-light text-slate-900 dark:text-white mt-1 leading-none tracking-tighter">{summaryData.patientCount}</p>
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
               <span className="block text-9xl font-black">?</span>
            </div>
            <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Historical Souls</span>
            </div>
         </div>
         <div onClick={() => { setDashboardDetailType('lowStock'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Pharmacy Inventory</p>
            <p className="text-4xl font-light text-slate-900 dark:text-white mt-1 leading-none tracking-tighter">{summaryData.drugCount}</p>
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
               <span className="block text-9xl font-black">8</span>
            </div>
            <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="w-1.5 h-1.5 bg-[#F27D26] rounded-sm" />
               <span className="text-[11px] font-mono font-bold text-[#F27D26] uppercase tracking-widest">Optimized SKUs</span>
            </div>
         </div>
         <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 md:p-8 rounded-[24px] shadow-sm relative overflow-hidden group border border-slate-800 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Avg Processing Time</p>
            <p className="text-4xl font-light mt-1 leading-none tracking-tighter">24.5<span className="text-xl text-slate-500 dark:text-slate-400 ml-1 font-mono tracking-widest uppercase">m</span></p>
            <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-800 dark:border-slate-700">
               <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">TARGET &lt; 20M</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 px-2">
         <div onClick={() => { setDashboardDetailType('revenue'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none h-[400px] flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Revenue Dynamics (Monthly)</h3>
               <span className="text-[10px] uppercase font-mono tracking-widest text-[#00A86B]">Financial Matrix</span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revChartData}>
                  <CartesianGrid strokeDasharray="1 3" vertical={false} stroke={darkMode ? '#1E293B' : '#E2E8F0'} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: darkMode ? '#94A3B8' : '#64748B', fontFamily: 'monospace'}} dy={10} />
                  <YAxis hide />
                  <RechartsTooltip cursor={{fill: darkMode ? '#1E293B' : '#F8FAFC'}} contentStyle={{borderRadius: '0', border: '1px solid ' + (darkMode ? '#334155' : '#E2E8F0'), background: darkMode ? '#0F172A' : '#fff', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="revenue" fill={darkMode ? '#6366F1' : '#0F172A'} radius={[0, 0, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div onClick={() => { setDashboardDetailType('gender'); setModalType('dashboardDetail'); }} className="cursor-pointer bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none h-[400px] flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors hover:shadow-md">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Patient Distribution</h3>
               <History className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>
            <div className="flex-1 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="80%">
                <RePieChart>
                  <Pie
                    data={stats.genderStats}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.genderStats.map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={index === 0 ? (darkMode ? '#6366F1' : '#0F172A') : (darkMode ? '#334155' : '#64748B')} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '0', border: '1px solid ' + (darkMode ? '#334155' : '#E2E8F0'), background: darkMode ? '#0F172A' : '#fff', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)'}} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '20px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none h-[400px] flex flex-col transition-colors hover:border-slate-400 dark:hover:border-slate-600">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Rata-rata Durasi SOAP</h3>
               <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-500">Kinerja Dokter</span>
            </div>
            <div className="flex-1 w-full">
              {soapDurationStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={soapDurationStats}>
                    <CartesianGrid strokeDasharray="1 3" vertical={false} stroke={darkMode ? '#1E293B' : '#E2E8F0'} />
                    <XAxis dataKey="doctorName" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: darkMode ? '#94A3B8' : '#64748B', fontFamily: 'sans-serif', fontWeight: 'bold'}} dy={10} interval={0} />
                    <YAxis hide />
                    <RechartsTooltip 
                       cursor={{fill: darkMode ? '#1E293B' : '#F8FAFC'}} 
                       contentStyle={{borderRadius: '0', border: '1px solid ' + (darkMode ? '#334155' : '#E2E8F0'), background: darkMode ? '#0F172A' : '#fff', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold', boxShadow: '4px 4px 0 rgba(0,0,0,0.05)'}} 
                       formatter={(val: number) => [`${val} Menit`, 'Durasi Rata-rata']}
                    />
                    <Bar dataKey="avgDuration" fill={darkMode ? '#F43F5E' : '#E11D48'} radius={[0, 0, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-[10px] uppercase tracking-widest text-center px-4">
                   Sedang mengkalkulasi matriks durasi dokter.<br/>Belum ada data tersedia.
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}
