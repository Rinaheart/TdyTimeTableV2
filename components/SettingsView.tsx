
import React, { useState, useMemo } from 'react';
import { Thresholds, ScheduleData, CourseType } from '../types';
import { Shield, AlertTriangle, Save, RefreshCw, Info, FileJson, FileSpreadsheet, ChevronUp, ChevronDown, ListChecks, Check } from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '../constants';

interface SettingsViewProps {
  thresholds: Thresholds;
  onSave: (t: Thresholds) => void;
  version: string;
  data: ScheduleData;
  overrides: Record<string, CourseType>;
  onSaveOverrides: (o: Record<string, CourseType>) => void;
}

type SortField = 'code' | 'name' | 'classes' | 'groups';

const SettingsView: React.FC<SettingsViewProps> = ({ thresholds, onSave, data, overrides, onSaveOverrides }) => {
  const [tempThresholds, setTempThresholds] = useState<Thresholds>(thresholds);
  const [tempOverrides, setTempOverrides] = useState<Record<string, CourseType>>(overrides);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedCourses = useMemo(() => {
    return [...data.allCourses].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (Array.isArray(valA)) valA = valA.join(', ');
      if (Array.isArray(valB)) valB = valB.join(', ');
      const comparison = (valA as string).localeCompare(valB as string);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data.allCourses, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const handleSetAll = (type: CourseType) => {
    const newOverrides = { ...tempOverrides };
    data.allCourses.forEach(c => { newOverrides[c.code] = type; });
    setTempOverrides(newOverrides);
  };

  const exportCSV = () => {
    let csv = "Mã môn,Tên môn,Lớp,Nhóm,Loại hình,Tổng tiết,Tổng buổi\n";
    data.allCourses.forEach(c => {
      const type = tempOverrides[c.code] || (c.code.includes('-LT') ? CourseType.LT : CourseType.TH);
      csv += `"${c.code}","${c.name}","${c.classes.join(', ')}","${c.groups.join(', ')}","${type}",${c.totalPeriods},${c.totalSessions}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ThongKe_LichDay_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportBackup = () => {
    const backup = { ...data, overrides: tempOverrides };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Timetable_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="opacity-20" />;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-300 pb-20">
      {/* Tùy chỉnh LT/TH */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">Tùy chỉnh hình thức giảng dạy</h3>
            <p className="text-xs text-slate-500 mt-1">Gán LT (45p) hoặc TH (60p) cho từng nhóm lớp.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSetAll(CourseType.LT)}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-2"
            >
              <ListChecks size={14} /> Tất cả LT
            </button>
            <button 
              onClick={() => handleSetAll(CourseType.TH)}
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-2"
            >
              <ListChecks size={14} /> Tất cả TH
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-400 uppercase w-12 text-center">STT</th>
                {[
                  { id: 'code', label: 'Mã Nhóm Lớp' },
                  { id: 'name', label: 'Môn' },
                  { id: 'classes', label: 'Lớp' },
                  { id: 'groups', label: 'Nhóm' }
                ].map(col => (
                  <th 
                    key={col.id}
                    onClick={() => handleSort(col.id as SortField)}
                    className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">{col.label} <SortIcon field={col.id as SortField} /></div>
                  </th>
                ))}
                <th className="px-4 py-3 font-bold text-slate-400 uppercase text-center w-20">LT</th>
                <th className="px-4 py-3 font-bold text-slate-400 uppercase text-center w-20">TH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedCourses.map((c, idx) => {
                const currentType = tempOverrides[c.code] || (c.code.includes('-LT') ? CourseType.LT : CourseType.TH);
                const isLT = currentType === CourseType.LT;
                return (
                  <tr 
                    key={c.code} 
                    className={`transition-colors duration-150 ${
                      isLT ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : 'bg-emerald-50/40 dark:bg-emerald-900/10'
                    }`}
                  >
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{c.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.classes.join(', ')}</td>
                    <td className="px-4 py-3 text-slate-500">{c.groups.join(', ')}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setTempOverrides({ ...tempOverrides, [c.code]: CourseType.LT })}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto ${isLT ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                      >
                        {isLT && <Check size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setTempOverrides({ ...tempOverrides, [c.code]: CourseType.TH })}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto ${!isLT ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                      >
                        {!isLT && <Check size={16} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={() => { onSaveOverrides(tempOverrides); alert("Đã lưu cấu hình!"); }}
             className="px-12 py-3 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
           >
             <Save size={18} /> Lưu cấu hình
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4"><Shield size={18} className="text-blue-500" /> Ngưỡng cảnh báo Ngày</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Cảnh báo (Tiết)</label>
              <input type="number" value={tempThresholds.daily.warning} onChange={e => setTempThresholds({...tempThresholds, daily: {...tempThresholds.daily, warning: Number(e.target.value)}})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nguy hiểm (Tiết)</label>
              <input type="number" value={tempThresholds.daily.danger} onChange={e => setTempThresholds({...tempThresholds, daily: {...tempThresholds.daily, danger: Number(e.target.value)}})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4"><AlertTriangle size={18} className="text-amber-500" /> Ngưỡng cảnh báo Tuần</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Cảnh báo (Tiết)</label>
              <input type="number" value={tempThresholds.weekly.warning} onChange={e => setTempThresholds({...tempThresholds, weekly: {...tempThresholds.weekly, warning: Number(e.target.value)}})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Nguy hiểm (Tiết)</label>
              <input type="number" value={tempThresholds.weekly.danger} onChange={e => setTempThresholds({...tempThresholds, weekly: {...tempThresholds.weekly, danger: Number(e.target.value)}})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
         <button onClick={() => { onSave(tempThresholds); alert("Đã lưu ngưỡng cảnh báo!"); }} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"><Save size={16}/> Lưu thay đổi</button>
         <div className="flex gap-4">
           <button onClick={exportCSV} className="text-xs font-bold text-emerald-600 flex items-center gap-2 hover:underline"><FileSpreadsheet size={16}/> Excel</button>
           <button onClick={exportBackup} className="text-xs font-bold text-blue-600 flex items-center gap-2 hover:underline"><FileJson size={16}/> Backup</button>
           <button onClick={() => setTempThresholds(DEFAULT_THRESHOLDS)} className="text-xs font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600"><RefreshCw size={16}/> Reset</button>
         </div>
      </div>
    </div>
  );
};

export default SettingsView;
