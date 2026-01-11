
import { ScheduleData, Metrics, CourseType, DaySchedule, CourseSession } from '../types';
import { DAYS_OF_WEEK } from '../constants';

export const calculateMetrics = (data: ScheduleData): Metrics => {
  let totalHours = 0;
  let totalSessions = 0;
  const hoursByDay: { [key: string]: number } = {};
  const hoursByWeek: { [key: number]: number } = {};
  const typeDistribution = { [CourseType.LT]: 0, [CourseType.TH]: 0 };
  const roomMetrics: { [key: string]: number } = {};
  
  const shiftStats = {
    morning: { hours: 0, sessions: 0 },
    afternoon: { hours: 0, sessions: 0 },
    evening: { hours: 0, sessions: 0 }
  };

  DAYS_OF_WEEK.forEach(d => hoursByDay[d] = 0);

  // First pass: Detect Conflicts
  data.weeks.forEach(w => {
    Object.values(w.days).forEach(day => {
      const parts = day as DaySchedule;
      const allDaySessions = [...parts.morning, ...parts.afternoon, ...parts.evening];
      
      allDaySessions.forEach(s1 => {
        const conflicts = allDaySessions.filter(s2 => 
          s1 !== s2 && 
          s1.teacher === s2.teacher && 
          s1.timeSlot === s2.timeSlot && 
          s1.room !== s2.room
        );
        if (conflicts.length > 0) {
          s1.hasConflict = true;
        }
      });
    });
  });

  data.weeks.forEach(w => {
    let weekTotal = 0;
    Object.entries(w.days).forEach(([day, sessions]) => {
      const parts = sessions as DaySchedule;
      
      const processPart = (part: CourseSession[], shift: 'morning' | 'afternoon' | 'evening') => {
        if (part.length > 0) {
          shiftStats[shift].sessions += part.length;
          totalSessions += part.length;
          part.forEach(s => {
            shiftStats[shift].hours += s.periodCount;
            typeDistribution[s.type] += s.periodCount;
            roomMetrics[s.room] = (roomMetrics[s.room] || 0) + s.periodCount;
            totalHours += s.periodCount;
            hoursByDay[day] += s.periodCount;
            weekTotal += s.periodCount;
          });
        }
      };

      processPart(parts.morning, 'morning');
      processPart(parts.afternoon, 'afternoon');
      processPart(parts.evening, 'evening');
    });
    hoursByWeek[w.weekNumber] = weekTotal;
  });

  let busiestDay = { day: 'Monday', hours: 0 };
  Object.entries(hoursByDay).forEach(([day, hours]) => {
    if (hours > busiestDay.hours) busiestDay = { day, hours };
  });

  let busiestWeek = { week: 1, hours: 0 };
  Object.entries(hoursByWeek).forEach(([week, hours]) => {
    if (hours > busiestWeek.hours) busiestWeek = { week: parseInt(week), hours };
  });

  const uniqueSubjects = new Set(data.allCourses.map(c => {
    const lastDot = c.code.lastIndexOf('.');
    return lastDot !== -1 ? c.code.substring(0, lastDot) : c.code;
  }));

  const topRooms = Object.entries(roomMetrics)
    .map(([room, periods]) => ({ room, periods }))
    .sort((a, b) => b.periods - a.periods)
    .slice(0, 10);

  return {
    totalWeeks: data.weeks.length,
    totalHours,
    totalSessions,
    totalCourses: uniqueSubjects.size,
    totalGroups: data.allCourses.length,
    totalRooms: Object.keys(roomMetrics).length,
    busiestDay,
    busiestWeek,
    hoursByDay,
    hoursByWeek,
    typeDistribution,
    shiftStats,
    topRooms
  };
};
