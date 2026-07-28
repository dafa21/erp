import React from 'react';

export const VitalInputField = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon, 
  placeholder, 
  type = "text", 
  step, 
  min, 
  max, 
  required = false,
  className = ""
}: any) => (
  <div className={className}>
    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wider">
      {Icon && <Icon className="w-3 h-3 text-slate-400 dark:text-slate-500" />} {label}
    </label>
    <input 
      required={required} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      type={type} 
      step={step} 
      min={min} 
      max={max} 
      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
      placeholder={placeholder} 
    />
  </div>
);
