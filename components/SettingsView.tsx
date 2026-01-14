
import React, { useState, useMemo, useEffect } from 'react';
import { Thresholds, ScheduleData, CourseType } from '../types';
import { 
  Shield, AlertTriangle, Save, RefreshCw, 
  FileJson, FileSpreadsheet, ChevronUp, ChevronDown, 
  ListChecks, Check, Download, BellRing 
} from 'lucide-react';
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
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

  const handleSaveOverrides = () => {
    onSaveOverrides(tempOverrides);
    setToast({ message: "Đã lưu tùy chỉnh giảng dạy thành công!", type: "success" });
  };

  const handleSaveThresholds = () => {
    onSave(tempThresholds);
    setToast({ message: "Đã lưu ngưỡng cảnh báo thành công!", type: "success" });
  };

  const handleResetThresholds = () => {
    setTempThresholds(DEFAULT_THRESHOLDS);
    // User must click save to apply, so we just reset the form state
    setToast({ message: "Đã khôi phục mặc định (Hãy bấm Lưu để áp dụng)", type: "success" });
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-300 pb-20 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1 text-white">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* CARD 1: Tùy chỉnh hình thức giảng dạy */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ListChecks size={20} className="text-blue-600" /> Tùy chỉnh hình thức giảng dạy
            </h3>
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
        
        <div className="overflow-x-auto custom-scrollbar max-h-[400px]">
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
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={handleSaveOverrides}
             className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
           >
             <Save size={16} /> Lưu Tùy chỉnh
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 2: Ngưỡng cảnh báo */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BellRing size={20} className="text-amber-500" /> Ngưỡng cảnh báo
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cấu hình giới hạn tiết dạy để hệ thống cảnh báo quá tải.</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            {/* Daily */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                 <Shield size={16} className="text-blue-500"/> Theo Ngày
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Cảnh báo</label>
                    <input type="number" value={tempThresholds.daily.warning} onChange={e => setTempThresholds({...tempThresholds, daily: {...tempThresholds.daily, warning: Number(e.target.value)}})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Nguy hiểm</label>
                    <input type="number" value={tempThresholds.daily.danger} onChange={e => setTempThresholds({...tempThresholds, daily: {...tempThresholds.daily, danger: Number(e.target.value)}})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                  </div>
               </div>
            </div>
            {/* Weekly */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                 <AlertTriangle size={16} className="text-orange-500"/> Theo Tuần
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Cảnh báo</label>
                    <input type="number" value={tempThresholds.weekly.warning} onChange={e => setTempThresholds({...tempThresholds, weekly: {...tempThresholds.weekly, warning: Number(e.target.value)}})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Nguy hiểm</label>
                    <input type="number" value={tempThresholds.weekly.danger} onChange={e => setTempThresholds({...tempThresholds, weekly: {...tempThresholds.weekly, danger: Number(e.target.value)}})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                  </div>
               </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
             <button 
               onClick={handleResetThresholds} 
               className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center gap-2"
             >
               <RefreshCw size={14} /> Reset
             </button>
             <button 
               onClick={handleSaveThresholds} 
               className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-xl shadow hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
             >
               <Save size={14} /> Lưu ngưỡng cảnh báo
             </button>
          </div>
        </div>

        {/* CARD 3: Xuất dữ liệu */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Download size={20} className="text-emerald-500" /> Xuất dữ liệu
            </h3>
            <p className="text-xs text-slate-500 mt-1">Tải xuống dữ liệu hiện tại để lưu trữ hoặc xử lý.</p>
          </div>
          
          <div className="p-6 flex flex-col gap-3 flex-1 justify-center">
            <button 
              onClick={exportCSV} 
              className="w-full py-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={18} /> Xuất Excel (.csv)
            </button>
            <button 
              onClick={exportBackup} 
              className="w-full py-3 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <FileJson size={18} /> Backup (.json)
            </button>
          </div>
        </div>

      </div>
      <div className="text-center text-slate-400 text-[10px] mt-8">
        © 2026 TdyPhan | Google AI Studio
      </div>
    </div>
  );
};

export default SettingsView;
