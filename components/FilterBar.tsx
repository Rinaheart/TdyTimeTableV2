
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  uniqueRooms: string[];
  uniqueTeachers: string[];
  uniqueClasses: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, uniqueRooms, uniqueTeachers, uniqueClasses }) => {
  const reset = () => onChange({ search: '', className: '', room: '', teacher: '', sessionTime: '' });

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Tìm tên môn hoặc mã nhóm..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select 
          value={filters.className}
          onChange={(e) => onChange({ ...filters, className: e.target.value })}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none"
        >
          <option value="">Tất cả Lớp</option>
          {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select 
          value={filters.room}
          onChange={(e) => onChange({ ...filters, room: e.target.value })}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none"
        >
          <option value="">Tất cả Giảng đường</option>
          {uniqueRooms.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select 
          value={filters.teacher}
          onChange={(e) => onChange({ ...filters, teacher: e.target.value })}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none"
        >
          <option value="">Tất cả Giảng viên</option>
          {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {(filters.search || filters.className || filters.room || filters.teacher) && (
          <button 
            onClick={reset}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
            title="Xóa bộ lọc"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
