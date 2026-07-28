import React from 'react';
import { Footprints, Search, Baby, LineChart, History, Plus, Syringe, Brain } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

interface ChildrenTabProps {
  childrenSearch: string;
  setChildrenSearch: (val: string) => void;
  requestSort: (key: string) => void;
  sortConfig: any;
  SortIcon: React.FC<{ column: string; sortConfig: any }>;
  filteredChildren: any[];
  getSortedData: (data: any[]) => any[];
  formatIDDate: (date: string) => string;
  patientsInfo: any[];
  openChildrenModal: (mother: any) => void;
  setSelectedChild: (child: any) => void;
  setModalType: (type: any) => void;
  getPage: (key: string) => number;
  setPage: (key: string, page: number) => void;
  Pagination: React.FC<any>;
}

export default function ChildrenTab({
  childrenSearch,
  setChildrenSearch,
  requestSort,
  sortConfig,
  SortIcon,
  filteredChildren,
  getSortedData,
  formatIDDate,
  patientsInfo,
  openChildrenModal,
  setSelectedChild,
  setModalType,
  getPage,
  setPage,
  Pagination
}: ChildrenTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
      <header className="mb-4 shrink-0 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Kesehatan Bayi & Anak</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Footprints className="w-3 h-3 text-indigo-500" /> Database Tumbuh Kembang & Imunisasi
          </p>
        </div>
      </header>

      <div className="flex-grow bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 shrink-0 gap-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[13px]">Daftar Bayi & Anak Terdaftar</h3>
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
             <input 
              type="text" 
              placeholder="Cari nama anak / ibu..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={childrenSearch}
              onChange={(e) => setChildrenSearch(e.target.value)}
             />
          </div>
        </div>

        <div className="overflow-auto flex-grow min-h-0">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md">
                <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('name')}>
                  <div className="flex items-center">Nama Anak <SortIcon column="name" sortConfig={sortConfig} /></div>
                </th>
                <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('mother_name')}>
                  <div className="flex items-center">Ibu Kandung <SortIcon column="mother_name" sortConfig={sortConfig} /></div>
                </th>
                <th className="py-4 px-4 font-black cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('birth_date')}>
                  <div className="flex items-center">Tgl Lahir / Usia <SortIcon column="birth_date" sortConfig={sortConfig} /></div>
                </th>
                <th className="py-4 px-4 font-black">Pertumbuhan Terakhir</th>
                <th className="py-4 px-4 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {getSortedData(filteredChildren)
                .slice((getPage('children') - 1) * 10, getPage('children') * 10)
                .map((child: any) => {
                const latestGrowth = child.growth?.[child.growth.length - 1];
                const ageMonths = latestGrowth?.age_months || Math.floor((new Date().getTime() - new Date(child.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                
                return (
                  <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${child.gender === 'Laki-laki' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                          <Baby className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{child.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{child.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                       <div className="font-bold text-indigo-600">{child.mother_name}</div>
                       <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">RM: {child.mother_rm}</div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                       <div className="text-slate-700 dark:text-slate-200">{formatIDDate(child.birth_date)}</div>
                       <div className="text-[10px] text-slate-500 dark:text-slate-400">{ageMonths} Bulan</div>
                    </td>
                    <td className="py-4 px-4">
                       {latestGrowth ? (
                         <div className="flex gap-3">
                           <div className="flex flex-col">
                             <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black">BB</span>
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{latestGrowth.weight} kg</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black">TB</span>
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{latestGrowth.height} cm</span>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black">LK</span>
                             <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{latestGrowth.head_circumference} cm</span>
                           </div>
                         </div>
                       ) : (
                         <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Belum ada data KMS</span>
                       )}
                    </td>
                    <td className="py-4 px-4 text-right">
                       <ActionMenu 
                         actions={[
                           {
                             label: "Analisa AI (Stunting & Tumbuh Kembang)",
                             icon: Brain,
                             onClick: () => {
                                setSelectedChild(child);
                                setModalType('childStuntingAnalysis');
                             }
                           },
                           {
                             label: "Grafik Perkembangan",
                             icon: LineChart,
                             onClick: () => {
                                setSelectedChild(child);
                                setModalType('childGrowthChart');
                             }
                           },
                           {
                             label: "Lihat Detail KMS",
                             icon: History,
                             onClick: () => {
                                const mother = patientsInfo.find(p => p.id === child.mother_id);
                                if (mother) openChildrenModal(mother);
                             }
                           },
                           {
                             label: "Tambah Pertumbuhan",
                             icon: Plus,
                             onClick: () => {
                                setSelectedChild(child);
                                setModalType('addGrowth');
                             }
                           },
                           {
                             label: "Tambah Imunisasi",
                             icon: Syringe,
                             onClick: () => {
                                setSelectedChild(child);
                                setModalType('addImmunization');
                             }
                           }
                         ]}
                       />
                    </td>
                  </tr>
                );
              })}
              {filteredChildren.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">Data bayi atau anak tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          totalItems={filteredChildren.length}
          itemsPerPage={10}
          currentPage={getPage('children')}
          onPageChange={(page: number) => setPage('children', page)}
          className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800"
        />
      </div>
    </div>
  );
}
