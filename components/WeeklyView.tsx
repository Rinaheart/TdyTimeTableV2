
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, AlertCircle, CalendarPlus, LayoutTemplate, Columns, Zap, X, CheckSquare, Square, Download, Copy, Check } from 'lucide-react';
import { WeekSchedule, Thresholds, CourseSession, DaySchedule, FilterState, CourseType } from '../types';
import { VI_DAYS_OF_WEEK, DAYS_OF_WEEK, SESSION_COLORS, PERIOD_TIMES } from '../constants';
import FilterBar from './FilterBar';

interface WeeklyViewProps {
  week: WeekSchedule;
  onNext: () => void;
  onPrev: () => void;
  onCurrent: () => void;
  isFirst: boolean;
  isLast: boolean;
  totalWeeks: number;
  weekIdx: number;
  thresholds: Thresholds;
  allWeeks: WeekSchedule[];
  overrides: Record<string, CourseType>;
  abbreviations: Record<string, string>;
}

// Keep for rendering check (isCurrent)
const SLOT_TIMES_LOOKUP: Record<number, string> = {
  1: "070000", 2: "075500", 3: "085000", 4: "094500",
  5: "104000",
  6: "133000", 7: "142500", 8: "152000", 9: "161500",
  11: "171000", 12: "180000", 13: "185000"
};

const getTeacherColor = (name: string) => {
  const colors = [
    'bg-red-100 text-red-700 border-red-200',
    'bg-orange-100 text-orange-700 border-orange-200', 
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-lime-100 text-lime-700 border-lime-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'bg-pink-100 text-pink-700 border-pink-200'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const isSessionCurrent = (session: CourseSession, sessionDateStr: string): boolean => {
  const now = new Date();
  const [d, m, y] = sessionDateStr.split('/').map(Number);
  const sessionDate = new Date(y, m - 1, d);
  
  if (now.getDate() !== sessionDate.getDate() || 
      now.getMonth() !== sessionDate.getMonth() || 
      now.getFullYear() !== sessionDate.getFullYear()) {
    return false;
  }

  const [startP, endP] = session.timeSlot.split('-').map(Number);
  const startStr = SLOT_TIMES_LOOKUP[startP];
  
  const durationMin = session.type === CourseType.LT ? 45 : 60;
  
  if (!startStr) return false;

  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const currentTotalM = currentH * 60 + currentM;

  const startH = parseInt(startStr.substring(0, 2));
  const startM = parseInt(startStr.substring(2, 4));
  const startTotalM = startH * 60 + startM;

  const lastStartStr = SLOT_TIMES_LOOKUP[endP] || startStr;
  const lastStartH = parseInt(lastStartStr.substring(0, 2));
  const lastStartM = parseInt(lastStartStr.substring(2, 4));
  const endTotalM = (lastStartH * 60 + lastStartM) + durationMin;

  return currentTotalM >= startTotalM && currentTotalM <= endTotalM;
};


const WeeklyView: React.FC<WeeklyViewProps> = ({ 
  week, 
  onNext, 
  onPrev, 
  onCurrent,
  isFirst, 
  isLast, 
  totalWeeks, 
  weekIdx,
  thresholds,
  allWeeks,
  overrides,
  abbreviations
}) => {
  const [filters, setFilters] = useState<FilterState>({ search: '', className: '', room: '', teacher: '', sessionTime: '' });
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  const getDayDateString = (dayIndex: number) => {
    try {
      const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
      const match = week.dateRange.match(dateRegex);
      if (!match) return "";
      const d = parseInt(match[1]);
      const m = parseInt(match[2]);
      const y = parseInt(match[3]);
      const startDate = new Date(y, m - 1, d);
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + dayIndex);
      return targetDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) { return ""; }
  };

  const uniqueData = useMemo(() => {
    const rooms = new Set<string>();
    const teachers = new Set<string>();
    const classes = new Set<string>();
    allWeeks.forEach(w => {
      Object.values(w.days).forEach(d => {
        const day = d as DaySchedule;
        [...day.morning, ...day.afternoon, ...day.evening].forEach(s => {
          rooms.add(s.room);
          teachers.add(s.teacher);
          if (s.className) classes.add(s.className);
        });
      });
    });
    return { 
      rooms: Array.from(rooms).sort(), 
      teachers: Array.from(teachers).sort(), 
      classes: Array.from(classes).sort() 
    };
  }, [allWeeks]);

  // Handle Opening Export Modal
  const openExportModal = () => {
    // Collect teachers for the current week
    const teachers = new Set<string>();
    DAYS_OF_WEEK.forEach((dayName) => {
      const day = week.days[dayName];
      [...day.morning, ...day.afternoon, ...day.evening].forEach(s => {
        teachers.add(s.teacher);
      });
    });
    const sortedTeachers = Array.from(teachers).sort();
    setAvailableTeachers(sortedTeachers);
    setSelectedTeachers(new Set(sortedTeachers)); // Default select all
    setCopySuccess(false);
    setIsExportModalOpen(true);
  };

  const toggleTeacherSelection = (teacher: string) => {
    const newSet = new Set(selectedTeachers);
    if (newSet.has(teacher)) newSet.delete(teacher);
    else newSet.add(teacher);
    setSelectedTeachers(newSet);
  };

  const toggleAllTeachers = () => {
    if (selectedTeachers.size === availableTeachers.length) {
      setSelectedTeachers(new Set());
    } else {
      setSelectedTeachers(new Set(availableTeachers));
    }
  };

  const generateICSContent = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TdyPhan//Timetable//VN\nCALSCALE:GREGORIAN\n";
    
    DAYS_OF_WEEK.forEach((dayName, idx) => {
      const day = week.days[dayName];
      const sessions = [...day.morning, ...day.afternoon, ...day.evening];
      const dateStr = getDayDateString(idx); // dd/mm/yyyy
      if(!dateStr) return;

      const [d, m, y] = dateStr.split('/');
      
      sessions.forEach(s => {
        // Filter by selected teacher
        if (!selectedTeachers.has(s.teacher)) return;

        const [startP, endP] = s.timeSlot.split('-').map(Number);
        
        // Use PERIOD_TIMES for exact start/end
        const startTimeInfo = PERIOD_TIMES[startP];
        const endTimeInfo = PERIOD_TIMES[endP];

        if (!startTimeInfo || !endTimeInfo) return;

        const [startH, startM] = startTimeInfo.start;
        const [endH, endM] = endTimeInfo.end;

        const startHStr = String(startH).padStart(2, '0');
        const startMStr = String(startM).padStart(2, '0');
        const endHStr = String(endH).padStart(2, '0');
        const endMStr = String(endM).padStart(2, '0');

        const currentType = overrides[s.courseCode] || s.type;
        
        // Use abbreviation for Export if available
        const displayName = abbreviations[s.courseName] || s.courseName;

        // Formatted Description: Replace newline with " / "
        const description = `GV: ${s.teacher} / Lớp: ${s.className} / Tiết: ${s.timeSlot} (${currentType}) / Nhóm: ${s.group} / Phòng: ${s.room}`;
        
        // Summary Format: [Name/Abbr] - [Class]
        const summary = `${displayName} - ${s.className}`;

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${summary}\n`;
        icsContent += `LOCATION:${s.room}\n`;
        icsContent += `DESCRIPTION:${description}\n`;
        icsContent += `DTSTART:${y}${m}${d}T${startHStr}${startMStr}00\n`;
        icsContent += `DTEND:${y}${m}${d}T${endHStr}${endMStr}00\n`;
        icsContent += "END:VEVENT\n";
      });
    });

    icsContent += "END:VCALENDAR";
    return icsContent;
  };

  const handleDownloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `LichDay_Tuan${weekIdx + 1}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  const handleCopyICS = async () => {
    const icsContent = generateICSContent();
    try {
      await navigator.clipboard.writeText(icsContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const filterSession = (s: CourseSession) => {
    if (filters.search && !s.courseName.toLowerCase().includes(filters.search.toLowerCase()) && !s.courseCode.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.className && s.className !== filters.className) return false;
    if (filters.room && s.room !== filters.room) return false;
    if (filters.teacher && s.teacher !== filters.teacher) return false;
    return true;
  };

  const renderSessionCell = (sessions: CourseSession[], dayIdx: number, isVertical: boolean = false) => {
    const filtered = sessions.filter(filterSession);
    const dateStr = getDayDateString(dayIdx);

    if (filtered.length === 0) return isVertical ? <div className="text-[10px] text-slate-300 dark:text-slate-700 italic">Trống</div> : null;
    return (
      <div className={`flex flex-col gap-2 ${isVertical ? 'w-full' : ''}`}>
        {filtered.map((session, sidx) => {
          const currentType = overrides[session.courseCode] || session.type;
          const isCurrent = isSessionCurrent(session, dateStr);
          // Hide teacher tag if filtered by teacher
          const showTeacher = !filters.teacher; 
          
          // Use abbreviation if available
          const displayName = abbreviations[session.courseName] || session.courseName;

          return (
            <div 
              key={`${session.courseCode}-${session.timeSlot}-${sidx}`}
              className={`p-3 rounded-xl border-l-4 shadow-sm text-left ${SESSION_COLORS[session.sessionTime]} dark:bg-opacity-10 dark:border-opacity-60 transition-all 
                ${session.hasConflict ? 'conflict-border' : ''}
                ${isCurrent ? 'ring-2 ring-blue-500 scale-[1.02] shadow-lg z-10' : ''}
              `}
            >
              <div className="flex justify-between items-start gap-1">
                <p className="text-[11px] font-bold leading-tight mb-1 text-slate-800 dark:text-slate-100" title={session.courseName}>
                  {displayName}
                </p>
                {session.hasConflict && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                {isCurrent && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-1 leading-tight">
                <span className="font-bold text-slate-700 dark:text-slate-200">{session.className}</span>
                <span className="font-normal opacity-70 ml-1">({session.group})</span>
              </p>
              
              {showTeacher && (
                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mb-1.5 truncate max-w-full ${getTeacherColor(session.teacher)}`}>
                  {session.teacher}
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-medium opacity-70 uppercase tracking-tight">Tiết {session.timeSlot}</span>
                <span className={`text-[8px] font-bold px-1 rounded ${currentType === CourseType.LT ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {currentType}
                </span>
              </div>
              <div className="highlight-room inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold">
                <MapPin size={10} />
                <span>{session.room}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-12 max-w-full animate-in fade-in duration-500 relative">
      
      {/* EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <CalendarPlus size={20} className="text-blue-500"/> Xuất Lịch Google
               </h3>
               <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 <X size={20} />
               </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                 Chọn giảng viên để xuất lịch cho <strong>Tuần {weekIdx + 1}</strong>.
               </p>
               
               <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase text-slate-400">Danh sách giảng viên ({availableTeachers.length})</span>
                  <button onClick={toggleAllTeachers} className="text-xs font-bold text-blue-600 hover:underline">
                    {selectedTeachers.size === availableTeachers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
               </div>

               <div className="space-y-2">
                 {availableTeachers.map(teacher => (
                   <div 
                      key={teacher} 
                      onClick={() => toggleTeacherSelection(teacher)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                   >
                      <div className={`flex-shrink-0 ${selectedTeachers.has(teacher) ? 'text-blue-500' : 'text-slate-300'}`}>
                        {selectedTeachers.has(teacher) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{teacher}</span>
                   </div>
                 ))}
                 {availableTeachers.length === 0 && (
                   <div className="text-center py-8 text-slate-400 text-sm italic">Không có dữ liệu giảng viên trong tuần này.</div>
                 )}
               </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex items-center justify-between gap-3">
               <button 
                 onClick={handleCopyICS}
                 disabled={selectedTeachers.size === 0}
                 className={`px-4 py-2.5 font-bold text-xs rounded-xl shadow-sm border transition-all flex items-center gap-2 flex-1 justify-center
                   ${copySuccess 
                     ? 'bg-green-100 text-green-700 border-green-200' 
                     : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                   } disabled:opacity-50`}
               >
                 {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                 {copySuccess ? 'Đã copy!' : 'Copy nội dung'}
               </button>

               <button 
                 onClick={handleDownloadICS}
                 disabled={selectedTeachers.size === 0}
                 className="px-6 py-2.5 bg-blue-600 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
               >
                 <Download size={16} /> Tải file .ics
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tuần {weekIdx + 1}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{week.dateRange}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onCurrent}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Zap size={14} className="fill-current" />
            <span>Tuần hiện tại</span>
          </button>

          <button 
            onClick={() => setViewMode(viewMode === 'horizontal' ? 'vertical' : 'horizontal')}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {viewMode === 'horizontal' ? <LayoutTemplate size={14} /> : <Columns size={14} />}
            <span>{viewMode === 'horizontal' ? 'Tuần Dọc' : 'Tuần Ngang'}</span>
          </button>

          <button 
            onClick={openExportModal}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CalendarPlus size={14} className="text-blue-500" />
            <span>Google Calendar</span>
          </button>

          <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <button onClick={onPrev} disabled={isFirst} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 border-r border-slate-200 dark:border-slate-800 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={onNext} disabled={isLast} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <FilterBar 
        filters={filters} 
        onChange={setFilters} 
        uniqueRooms={uniqueData.rooms} 
        uniqueTeachers={uniqueData.teachers} 
        uniqueClasses={uniqueData.classes}
      />

      {viewMode === 'horizontal' ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="w-20 p-4 border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">Buổi</th>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <th key={day} className="p-4 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{VI_DAYS_OF_WEEK[idx]}</p>
                      <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1">{getDayDateString(idx)}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'morning', label: 'Sáng', time: '07:00' },
                  { key: 'afternoon', label: 'Chiều', time: '13:30' },
                  { key: 'evening', label: 'Tối', time: '17:10' }
                ].map((shift) => (
                  <tr key={shift.key}>
                    <td className="p-4 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{shift.label}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{shift.time}</p>
                    </td>
                    {DAYS_OF_WEEK.map((day, dayIdx) => (
                      <td key={`${day}-${shift.key}`} className="p-3 border border-slate-100 dark:border-slate-800 align-top min-h-[140px]">
                        {renderSessionCell(week.days[day][shift.key as keyof DaySchedule], dayIdx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS_OF_WEEK.map((day, idx) => {
             const dayData = week.days[day];
             const hasAny = [...dayData.morning, ...dayData.afternoon, ...dayData.evening].some(filterSession);
             if (!hasAny && (filters.search || filters.className || filters.room || filters.teacher)) return null;
             
             return (
               <div key={day} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                 <div className="md:w-32 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{VI_DAYS_OF_WEEK[idx]}</p>
                    <p className="text-sm font-black mt-1">{getDayDateString(idx)}</p>
                 </div>
                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                    <div className="p-4">
                      <div className="text-[9px] font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">Sáng <span>07:00</span></div>
                      {renderSessionCell(dayData.morning, idx, true)}
                    </div>
                    <div className="p-4">
                      <div className="text-[9px] font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">Chiều <span>13:30</span></div>
                      {renderSessionCell(dayData.afternoon, idx, true)}
                    </div>
                    <div className="p-4">
                      <div className="text-[9px] font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">Tối <span>17:10</span></div>
                      {renderSessionCell(dayData.evening, idx, true)}
                    </div>
                 </div>
               </div>
             )
          })}
        </div>
      )}
      <div className="text-center text-slate-400 text-[10px] mt-8">
        © 2026 TdyPhan | Google AI Studio
      </div>
    </div>
  );
};

export default WeeklyView;
