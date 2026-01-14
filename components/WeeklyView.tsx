
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, AlertCircle, CalendarPlus, LayoutTemplate, Columns, Zap } from 'lucide-react';
import { WeekSchedule, Thresholds, CourseSession, DaySchedule, FilterState, CourseType } from '../types';
import { VI_DAYS_OF_WEEK, DAYS_OF_WEEK, SESSION_COLORS } from '../constants';
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
}

const SLOT_TIMES: Record<number, string> = {
  1: "070000", 2: "075500", 3: "085000", 4: "094500",
  5: "104000",
  6: "133000", 7: "142500", 8: "152000", 9: "161500",
  10: "171000", 11: "180000", 12: "185000"
};

// Helper to determine if a session is "Current"
const isSessionCurrent = (session: CourseSession, sessionDateStr: string): boolean => {
  const now = new Date();
  
  // 1. Check Date
  // sessionDateStr format: "dd/mm/yyyy"
  const [d, m, y] = sessionDateStr.split('/').map(Number);
  const sessionDate = new Date(y, m - 1, d);
  
  if (now.getDate() !== sessionDate.getDate() || 
      now.getMonth() !== sessionDate.getMonth() || 
      now.getFullYear() !== sessionDate.getFullYear()) {
    return false;
  }

  // 2. Check Time
  const [startP, endP] = session.timeSlot.split('-').map(Number);
  const startStr = SLOT_TIMES[startP]; // "070000"
  
  // Estimate end time based on CourseType
  const durationMin = session.type === CourseType.LT ? 45 : 60;
  
  if (!startStr) return false;

  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const currentTotalM = currentH * 60 + currentM;

  const startH = parseInt(startStr.substring(0, 2));
  const startM = parseInt(startStr.substring(2, 4));
  const startTotalM = startH * 60 + startM;

  // End time of the LAST period in the slot
  const lastStartStr = SLOT_TIMES[endP] || startStr;
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
  overrides
}) => {
  const [filters, setFilters] = useState<FilterState>({ search: '', className: '', room: '', teacher: '', sessionTime: '' });
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');

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

  const exportToICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TdyPhan//Timetable//VN\nCALSCALE:GREGORIAN\n";
    DAYS_OF_WEEK.forEach((dayName, idx) => {
      const day = week.days[dayName];
      const sessions = [...day.morning, ...day.afternoon, ...day.evening];
      const dateStr = getDayDateString(idx);
      const [d, m, y] = dateStr.split('/');
      sessions.forEach(s => {
        const [startP, endP] = s.timeSlot.split('-').map(Number);
        const currentType = overrides[s.courseCode] || s.type;
        const durationMin = currentType === CourseType.LT ? 45 : 60;
        const startTimeStr = SLOT_TIMES[startP] || "000000";
        const lastSlotStartStr = SLOT_TIMES[endP] || startTimeStr;
        const hh = parseInt(lastSlotStartStr.substring(0, 2));
        const mm = parseInt(lastSlotStartStr.substring(2, 4));
        let endH = hh;
        let endM = mm + durationMin;
        if (endM >= 60) { endH += Math.floor(endM / 60); endM = endM % 60; }
        const endHStr = String(endH).padStart(2, '0');
        const endMStr = String(endM).padStart(2, '0');
        const endTimeStr = `${endHStr}${endMStr}00`;
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${s.courseName} (${currentType})\n`;
        icsContent += `LOCATION:${s.room}\n`;
        icsContent += `DESCRIPTION:GV: ${s.teacher}\\nLớp: ${s.className}\\nTiết: ${s.timeSlot}\\nNhóm: ${s.group}\n`;
        icsContent += `DTSTART:${y}${m}${d}T${startTimeStr}\n`;
        icsContent += `DTEND:${y}${m}${d}T${endTimeStr}\n`;
        icsContent += "END:VEVENT\n";
      });
    });
    icsContent += "END:VCALENDAR";
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `LichDay_Tuan${weekIdx + 1}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

          return (
            <div 
              key={`${session.courseCode}-${session.timeSlot}-${sidx}`}
              className={`p-3 rounded-xl border-l-4 shadow-sm text-left ${SESSION_COLORS[session.sessionTime]} dark:bg-opacity-10 dark:border-opacity-60 transition-all 
                ${session.hasConflict ? 'conflict-border' : ''}
                ${isCurrent ? 'ring-2 ring-blue-500 scale-[1.02] shadow-lg z-10' : ''}
              `}
            >
              <div className="flex justify-between items-start gap-1">
                <p className="text-[11px] font-bold leading-tight mb-1 text-slate-800 dark:text-slate-100">
                  {session.courseName}
                </p>
                {session.hasConflict && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                {isCurrent && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-1 leading-tight">
                <span className="font-bold text-slate-700 dark:text-slate-200">{session.className}</span>
                <span className="font-normal opacity-70 ml-1">({session.group})</span>
              </p>
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
    <div className="pb-12 max-w-full animate-in fade-in duration-500">
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
            onClick={exportToICS}
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
