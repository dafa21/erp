import React, { useState, useEffect, useRef } from "react";
import { ICD10_LIST, ICD10Item } from "../data/icd10";
import { Search, Check, ChevronDown, Sparkles } from "lucide-react";

interface Icd10SearchProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function Icd10Search({ value, onChange, required = false }: Icd10SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search query field when active value matches or is updated
  useEffect(() => {
    // If empty value, reset query
    if (!value) {
      setSearchQuery("");
    } else {
      setSearchQuery(value);
    }
  }, [value]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Soft match/filter items from the list
  const filteredItems = React.useMemo(() => {
    if (!searchQuery || searchQuery === value) {
      return ICD10_LIST.slice(0, 15); // Show first 15 default if query is clean
    }

    const q = searchQuery.toLowerCase();
    return ICD10_LIST.filter(item => {
      const matchCode = item.code.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchIndo = item.indonesian ? item.indonesian.toLowerCase().includes(q) : false;
      return matchCode || matchName || matchIndo;
    }).slice(0, 15); // Limit output to 15 fast options
  }, [searchQuery, value]);

  const handleSelect = (item: ICD10Item) => {
    const formatted = `${item.code} - ${item.name}${item.indonesian ? ' (' + item.indonesian + ')' : ''}`;
    onChange(formatted);
    setSearchQuery(formatted);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          required={required}
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          className="w-full px-4 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500"
          placeholder="Cari kode, nama Inggris, atau istilah Indonesia (mis: ISPA, maag)..."
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
          <Search className="w-3.5 h-3.5 pointer-events-none" />
          <ChevronDown 
            className={`w-3.5 h-3.5 cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-55 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto transform origin-top transition-all">
          {filteredItems.length > 0 ? (
            <div className="p-1">
              <div className="px-3 py-1 text-[9px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 dark:border-slate-800/10 flex items-center justify-between">
                <span>Rekomendasi Diagnosis ICD-10</span>
                <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse" /> Auto-Suggest</span>
              </div>
              {filteredItems.map((item) => {
                const itemString = `${item.code} - ${item.name}${item.indonesian ? ' (' + item.indonesian + ')' : ''}`;
                const isSelected = value === itemString;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-[11px] rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      isSelected 
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-350 font-semibold" 
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="shrink-0 scale-90 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-400 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded tracking-wide">
                      {item.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      {item.indonesian && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate italic">{item.indonesian}</p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400 shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-[11px] text-slate-405 dark:text-slate-500 font-medium">Tidak ada kode ICD-10 yang cocok.</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-600 mt-0.5">Anda tetap dapat mengetik diagnosis kustom.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
