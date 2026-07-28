import { ShieldCheck, ChevronRight } from 'lucide-react';
import { architectureData } from '../data/architectureDoc';

export function RbacPanel({ icons }: { icons: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col transition-colors">
      <header className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 border-l-4 border-l-blue-600 dark:border-l-indigo-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none">{architectureData.rbac.title}</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Authority Cluster Layer</p>
          </div>
        </div>
      </header>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar min-h-0 pb-8">
        {architectureData.rbac.roles.map((role: any, idx: number) => (
          <div key={idx} className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col group hover:border-blue-300 dark:hover:border-indigo-500 transition-all`}>
            <div className="flex justify-between items-center mb-3 shrink-0">
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${role.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                   {icons[role.icon]}
                 </div>
                 <h3 className="font-black text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-widest leading-none">
                   {role.name}
                 </h3>
              </div>
            </div>
            
            <div className="mt-4 space-y-1.5 flex-grow">
              {role.features.map((feature: string, fIdx: number) => {
                const isMenu = feature.startsWith("Menu:");
                const displayText = isMenu ? feature.replace("Menu:", "").trim() : feature;
                
                if (isMenu) {
                  return (
                    <div key={fIdx} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between group/btn cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-100 dark:hover:border-indigo-800 transition-all">
                       <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter group-hover/btn:text-indigo-700 dark:group-hover/btn:text-indigo-300">{displayText}</span>
                       <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400" />
                    </div>
                  );
                }

                return (
                  <div key={fIdx} className="flex gap-2.5 px-1 py-1">
                    <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${role.name.includes('Suster') ? 'bg-blue-400' : role.name.includes('Bidan') ? 'bg-pink-400' : role.name.includes('Dokter') ? 'bg-emerald-400' : role.name.includes('Apoteker') ? 'bg-purple-400' : 'bg-slate-400'}`}></div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-500 leading-tight group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors uppercase tracking-tight">{displayText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
