
import React, { useState } from 'react';
import { ScheduleData, WeekSchedule, FilterState, DaySchedule, CourseSession } from '../types';
import { VI_DAYS_OF_WEEK, DAYS_OF_WEEK, SESSION_COLORS } from '../constants';
import FilterBar from './FilterBar';

interface SemesterViewProps {
  data: ScheduleData;
}

const SemesterView: React.FC<SemesterViewProps> = ({ data }) => {
  const [filters, setFilters] = useState<FilterState>({ search: '', className: '', room: '', teacher: '', sessionTime: '' });

  const uniqueData = React.useMemo(() => {
    const rooms = new Set<string>();
    const teachers = new Set<string>();
    const classes = new Set<string>();
    data.weeks.forEach(w => {
      Object.values(w.days).forEach(d => {
        const day = d as DaySchedule;
        [...day.morning, ...day.afternoon, ...day.evening].forEach(s => {
          rooms.add(s.room);
          teachers.add(s.teacher);
          if (s.className) classes.add(s.className);
        });
      });
    });
    return { rooms: Array.from(rooms).sort(), teachers: Array.from(teachers).sort(), classes: Array.from(classes).sort() };
  }, [data]);

  const filterSession = (s: CourseSession) => {
    if (filters.search && !s.courseName.toLowerCase().includes(filters.search.toLowerCase()) && !s.courseCode.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.className && s.className !== filters.className) return false;
    if (filters.room && s.room !== filters.room) return false;
    if (filters.teacher && s.teacher !== filters.teacher) return false;
    return true;
  };

  const getDayDateString = (week: WeekSchedule, dayIndex: number) => {
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
      return targetDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch (e) { return ""; }
  };

  return (
    <div className="pb-12">
      <FilterBar 
        filters={filters} 
        onChange={setFilters} 
        uniqueRooms={uniqueData.rooms} 
        uniqueTeachers={uniqueData.teachers}
        uniqueClasses={uniqueData.classes}
      />

      <div className="space-y-12">
        {data.weeks.map((week, wIdx) => {
          const hasData = Object.values(week.days).some(d => {
            const day = d as DaySchedule;
            return [...day.morning, ...day.afternoon, ...day.evening].some(filterSession);
          });

          if (!hasData && (filters.search || filters.className || filters.room || filters.teacher)) return null;

          return (
            <div key={wIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900/40 rounded-xl border-2 border-slate-300 dark:border-slate-700 p-6 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">
                  {week.weekNumber}
                </div>
                <div>
                  <h4 className="text-md font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Tuần {week.weekNumber}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{week.dateRange}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative z-10">
                {DAYS_OF_WEEK.map((dayName, dIdx) => {
                  const day = week.days[dayName];
                  const sessions = [...day.morning, ...day.afternoon, ...day.evening].filter(filterSession);
                  
                  return (
                    <div key={dayName} className="min-h-[120px] flex flex-col group">
                      <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{VI_DAYS_OF_WEEK[dIdx]}</span>
                        <span className="text-[11px] font-black text-slate-400 mt-1 tracking-tighter">{getDayDateString(week, dIdx)}</span>
                      </div>
                      <div className="space-y-3 flex-1">
                        {sessions.map((s, sidx) => (
                          <div key={sidx} className={`p-2.5 rounded-xl border-l-4 ${SESSION_COLORS[s.sessionTime]} dark:bg-opacity-10 shadow-sm group-hover:shadow-md transition-shadow ${s.hasConflict ? 'conflict-border' : ''}`}>
                            <p className="text-[10px] font-bold leading-tight mb-1" title={s.courseName}>{s.courseName}</p>
                            <p className="text-[9px] font-black text-slate-700 dark:text-slate-300 opacity-80">{s.className}</p>
                            <div className="flex justify-between items-center mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                              <span className="text-[8px] font-mono opacity-60">T{s.timeSlot}</span>
                              <span className="text-[8px] font-black bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md uppercase tracking-tight">{s.room}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center text-slate-400 text-[10px] mt-12 pt-4 border-t border-slate-100 dark:border-slate-900">
        © 2026 TdyPhan | Gg AI Studio
      </div>
    </div>
  );
};

export default SemesterView;
