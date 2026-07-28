import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export const ActionMenu = ({ actions }: { actions: { label: string, onClick: () => void, icon?: any, variant?: 'default' | 'danger' }[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.right - 192 // w-48 is 192px
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      const handleClose = () => setIsOpen(false);
      window.addEventListener('scroll', handleClose, true);
      window.addEventListener('resize', handleClose);
      return () => {
        window.removeEventListener('scroll', handleClose, true);
        window.removeEventListener('resize', handleClose);
      };
    }
  }, [isOpen]);

  return (
    <div className="inline-block" ref={triggerRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
      >
        Aksi <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[990]" 
            onClick={() => setIsOpen(false)}
          ></div>
          {createPortal(
            <div 
              style={{ 
                position: 'fixed', 
                top: coords.top, 
                left: Math.max(10, Math.min(window.innerWidth - 202, coords.left)),
                width: '12rem'
              }}
              className="z-[999] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-black/5"
            >
              <div className="py-1 max-h-[60vh] overflow-y-auto">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-colors flex-shrink-0 ${ action.variant === 'danger' ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80' }`}
                  >
                    {action.icon && <action.icon className="w-4 h-4 opacity-70 shrink-0" />}
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};
