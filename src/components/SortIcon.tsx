import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export const SortIcon = ({ column, sortConfig }: { column: string, sortConfig: { key: string, direction: 'asc' | 'desc' } | null }) => {
  if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
  return sortConfig.direction === 'asc' 
    ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" /> 
    : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
};
