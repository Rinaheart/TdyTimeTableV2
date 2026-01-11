
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Metrics, ScheduleData, AggregatedCourse, DaySchedule } from '../types';
import { VI_DAYS_OF_WEEK } from '../constants';
import { BookOpen, Layers, Calendar, ChevronUp, ChevronDown, PieChart as PieIcon, ClipboardList, BarChart3, MapPin } from 'lucide-react';

interface StatisticsViewProps {
  metrics: Metrics;
  data: ScheduleData;
}

const SHIFT_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6'];

type SortField = 'code' | 'name' | 'sessions' | 'periods' | 'groups' | 'classes' | 'totalSessions' | 'totalPeriods';
type SortOrder = 'asc' | 'desc';

const StatisticsView: React.FC<StatisticsViewProps> = ({ metrics, data }) => {
  const [detailedSortField, setDetailedSortField] = useState<SortField>('code');
  const [detailedSortOrder, setDetailedSortOrder] = useState<SortOrder>('asc');
  
  const [summarySortField, setSummarySortField] = useState<SortField>('code');
  const [summarySortOrder, setSummarySortOrder] = useState<SortOrder>('asc');

  const dayChartData = Object.entries(metrics.hoursByDay).map(([day, hours], i) => ({
    name: VI_DAYS_OF_WEEK[i],
    hours
  }));

  const weekChartData = Object.entries(metrics.hoursByWeek).map(([week, hours]) => ({
    name: `T${week}`,
    hours
  }));

  const shiftPieData = [
    { name: 'Sáng', value: metrics.shiftStats.morning.sessions },
    { name: 'Chiều', value: metrics.shiftStats.afternoon.sessions },
    { name: 'Tối', value: metrics.shiftStats.evening.sessions },
  ];

  const topRoomsData = useMemo(() => {
    return metrics.topRooms.map(r => ({ name: r.room, periods: r.periods }));
  }, [metrics.topRooms]);

  const coursesBySubject = useMemo(() => {
    const map = new Map<string, { code: string, name: string, sessions: number, periods: number, groups: number, classes: string[] }>();
    data.allCourses.forEach(c => {
      const lastDot = c.code.lastIndexOf('.');
      const subjectCode = lastDot !== -1 ? c.code.substring(0, lastDot) : c.code;
      if (!map.has(subjectCode)) {
        map.set(subjectCode, { code: subjectCode, name: c.name, sessions: 0, periods: 0, groups: 0, classes: [] });
      }
      const existing = map.get(subjectCode)!;
      existing.sessions += c.totalSessions;
      existing.periods += c.totalPeriods;
      existing.groups += 1;
      c.classes.forEach(cls => { if (!existing.classes.includes(cls)) existing.classes.push(cls); });
    });
    
    return Array.from(map.values()).sort((a, b) => {
      let valA: any = a[summarySortField as keyof typeof a];
      let valB: any = b[summarySortField as keyof typeof b];
      if (Array.isArray(valA)) valA = valA.length;
      if (Array.isArray(valB)) valB = valB.length;
      if (typeof valA === 'string') return summarySortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return summarySortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [data.allCourses, summarySortField, summarySortOrder]);

  const sortedDetailed = useMemo(() => {
    return [...data.allCourses].sort((a, b) => {
      let valA: any = a[detailedSortField === 'sessions' ? 'totalSessions' : detailedSortField === 'periods' ? 'totalPeriods' : detailedSortField as keyof AggregatedCourse];
      let valB: any = b[detailedSortField === 'sessions' ? 'totalSessions' : detailedSortField === 'periods' ? 'totalPeriods' : detailedSortField as keyof AggregatedCourse];
      if (Array.isArray(valA)) valA = valA.length;
      if (Array.isArray(valB)) valB = valB.length;
      if (typeof valA === 'string') return detailedSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return detailedSortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [data.allCourses, detailedSortField, detailedSortOrder]);

  const toggleDetailedSort = (field: SortField) => {
    if (detailedSortField === field) setDetailedSortOrder(detailedSortOrder === 'asc' ? 'desc' : 'asc');
    else { setDetailedSortField(field); setDetailedSortOrder('asc'); }
  };

  const toggleSummarySort = (field: SortField) => {
    if (summarySortField === field) setSummarySortOrder(summarySortOrder === 'asc' ? 'desc' : 'asc');
    else { setSummarySortField(field); setSummarySortOrder('asc'); }
  };

  const SortIcon = ({ field, currentField, order }: { field: SortField, currentField: SortField, order: SortOrder }) => {
    if (currentField !== field) return <div className="w-3 h-3 opacity-20"><ChevronUp size={12} /></div>;
    return order === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Tổng tiết dạy', value: metrics.totalHours, color: 'blue' },
          { label: 'Tổng buổi dạy', value: metrics.totalSessions, color: 'indigo' },
          { label: 'Số môn học', value: metrics.totalCourses, color: 'emerald' },
          { label: 'Số nhóm lớp', value: metrics.totalGroups, color: 'amber' },
          { label: 'Số giảng đường', value: metrics.totalRooms, color: 'purple' }
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-xl font-black text-${m.color}-600 dark:text-${m.color}-400`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-xs font-bold mb-6 text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <BarChart3 size={14} className="text-blue-500" /> Phân bổ tiết dạy theo thứ
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(248, 250, 252, 0.05)'}} contentStyle={{borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '10px'}} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <h4 className="text-xs font-bold mb-6 text-slate-700 dark:text-slate-200 w-full flex items-center gap-2 uppercase tracking-wider">
            <PieIcon size={14} className="text-indigo-500" /> Tỷ lệ buổi dạy (%)
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={shiftPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {shiftPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={SHIFT_COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
             {shiftPieData.map((s, i) => (
               <div key={i} className="text-center">
                 <p className="text-[9px] font-bold text-slate-400 uppercase">{s.name}</p>
                 <p className="text-xs font-black" style={{color: SHIFT_COLORS[i]}}>{((s.value/metrics.totalSessions)*100).toFixed(0)}%</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-xs font-bold mb-6 text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Layers size={14} className="text-emerald-500" /> Xu hướng theo tuần
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '10px'}} />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2.5} dot={{r: 4, fill: '#10b981'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-xs font-bold mb-6 text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <MapPin size={14} className="text-purple-500" /> Top 10 giảng đường
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRoomsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} width={70} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(248, 250, 252, 0.05)'}} contentStyle={{fontSize: '10px', background: '#1e293b', color: '#fff', border: 'none'}} />
                <Bar dataKey="periods" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-blue-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Bảng tổng hợp theo môn</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 w-12 text-center">STT</th>
                  {[
                    { id: 'code', label: 'Mã Môn' },
                    { id: 'name', label: 'Tên Môn' },
                    { id: 'classes', label: 'Lớp' },
                    { id: 'groups', label: 'Nhóm' },
                    { id: 'sessions', label: 'Buổi' },
                    { id: 'periods', label: 'Tiết' }
                  ].map((col) => (
                    <th key={col.id} onClick={() => toggleSummarySort(col.id as SortField)} className="px-5 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{col.label}</span>
                        <SortIcon field={col.id as SortField} currentField={summarySortField} order={summarySortOrder} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {coursesBySubject.map((s, idx) => (
                  <tr key={s.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{s.code}</td>
                    <td className="px-5 py-3 font-semibold">{s.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.classes.map(c => <span key={c} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{c}</span>)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{s.groups}</td>
                    <td className="px-5 py-3 text-center font-bold text-indigo-600">{s.sessions}</td>
                    <td className="px-5 py-3 text-center font-black">{s.periods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={16} className="text-blue-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Bảng chi tiết theo nhóm lớp</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 w-12 text-center">STT</th>
                  {['code', 'name', 'classes', 'groups', 'sessions', 'periods'].map((col) => (
                    <th key={col} onClick={() => toggleDetailedSort(col as SortField)} className="px-5 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{col === 'code' ? 'Mã nhóm' : col === 'name' ? 'Tên môn' : col === 'classes' ? 'Lớp' : col === 'groups' ? 'Nhóm' : col === 'sessions' ? 'Buổi' : 'Tiết'}</span>
                        <SortIcon field={col as SortField} currentField={detailedSortField} order={detailedSortOrder} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedDetailed.map((course, idx) => (
                  <tr key={course.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{course.code}</td>
                    <td className="px-5 py-3 font-semibold">{course.name}</td>
                    <td className="px-5 py-3 text-slate-500 font-bold">{course.classes.join(', ')}</td>
                    <td className="px-5 py-3 italic opacity-70">{course.groups.join(', ')}</td>
                    <td className="px-5 py-3 text-center font-bold text-blue-500">{course.totalSessions}</td>
                    <td className="px-5 py-3 text-center font-black">{course.totalPeriods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="text-center text-slate-400 text-[10px] pt-8">
        © 2026 TdyPhan
      </div>
    </div>
  );
};

export default StatisticsView;
