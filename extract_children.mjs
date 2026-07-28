import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = code.indexOf("{modalType === 'childrenList' && (");
const endStr = "        {modalType === 'drug' && (";
const endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let block = code.substring(startIdx, endIdx);
  
  // replace ChildStuntingAnalysisModal to avoid name collision or just rename the import
  // wait, ChildStuntingAnalysisModal is in src/components/ChildStuntingAnalysisModal.tsx
  
  const componentCode = `import React from 'react';
import { X, Baby, Plus, Calendar, Activity, Syringe, ClipboardList, Shield, LineChart, BarChart3, Brain, AlertTriangle, CheckCircle, Scale, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line } from 'recharts';
import ChildStuntingAnalysisModal from '../ChildStuntingAnalysisModal';
import { WHO_WEIGHT_BOYS, WHO_WEIGHT_GIRLS, WHO_HEIGHT_BOYS, WHO_HEIGHT_GIRLS } from '../../utils/constants';

function VitalInputField({ label, unit, icon: Icon, required, type, step, value, onChange }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-slate-400" />} {label}
      </label>
      <div className="relative">
        <input 
          required={required} 
          type={type} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
        />
        <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">{unit}</span>
      </div>
    </div>
  );
}

export function ChildrenModals({
  modalType, setModalType,
  editingItem,
  selectedChild, setSelectedChild,
  childForm, setChildForm, saveChild,
  immunizationForm, setImmunizationForm, saveImmunization,
  growthForm, setGrowthForm, saveGrowth,
  darkMode, currentUser
}: any) {
  return (
    <>
      ${block}
    </>
  );
}
`;

  fs.writeFileSync('src/components/modals/ChildrenModals.tsx', componentCode);

  const newAppCode = code.substring(0, startIdx) + 
`        <ChildrenModals
          modalType={modalType}
          setModalType={setModalType}
          editingItem={editingItem}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
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
        />\n` + code.substring(endIdx);

  fs.writeFileSync('src/App.tsx', newAppCode);
  console.log("Successfully replaced");
} else {
  console.log("Could not find boundaries", startIdx, endIdx);
}
