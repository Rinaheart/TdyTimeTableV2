
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LabelList
} from 'recharts';
import { Metrics, ScheduleData, CourseType } from '../types';
import { VI_DAYS_OF_WEEK } from '../constants';
import { 
  AlertTriangle, Calendar, Layers, MapPin, Users, Activity, 
  Lightbulb, GraduationCap, LayoutGrid, Clock, Briefcase, User
} from 'lucide-react';

interface StatisticsViewProps {
  metrics: Metrics;
  data: ScheduleData;
}

const COLORS = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#8b5cf6',
  slate: '#64748b'
};

const PIE_COLORS = [COLORS.blue, COLORS.amber, COLORS.purple];
const TYPE_COLORS = { [CourseType.LT]: COLORS.indigo, [CourseType.TH]: COLORS.emerald };

// Generates consistent colors for subjects
const getSubjectColor = (index: number) => {
  const palette = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  return palette[index % palette.length];
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ metrics, data }) => {
  // Chart Data Preparation
  const weeklyData = Object.entries(metrics.hoursByWeek).map(([w, h]) => ({ name: `T${w}`, value: h }));
  const dailyData = Object.entries(metrics.hoursByDay).map(([d, h], i) => ({ name: VI_DAYS_OF_WEEK[i], value: h }));
  
  const typeData = [
    { name: 'Lý thuyết', value: metrics.typeDistribution[CourseType.LT] },
    { name: 'Thực hành', value: metrics.typeDistribution[CourseType.TH] }
  ];

  const shiftData = [
    { name: 'Sáng', value: metrics.shiftStats.morning.sessions },
    { name: 'Chiều', value: metrics.shiftStats.afternoon.sessions },
    { name: 'Tối', value: metrics.shiftStats.evening.sessions }
  ];

  const peakWeekHeatmapData = metrics.peakWeekHeatmap.map((d, i) => ({ 
    name: VI_DAYS_OF_WEEK[i].replace('Thứ ', 'T').replace('Chủ nhật', 'CN'), 
    value: d.count 
  }));

  // Improved Logic for Subjects (Sorted Descending)
  const subjectWeights = React.useMemo(() => {
    const map = new Map<string, number>();
    data.allCourses.forEach(c => {
      const current = map.get(c.name) || 0;
      map.set(c.name, current + c.totalPeriods);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [data.allCourses]);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 font-sans">
      
      {/* 1. HEADER CARD (BLUE TONE) */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-900/10 border border-blue-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
           <User size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{data.metadata.teacher}</h2>
          <div className="flex flex-wrap items-center gap-6 text-blue-50 text-sm font-medium">
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full"><Briefcase size={14} /> Học kỳ: {data.metadata.semester}</span>
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full"><Calendar size={14} /> Năm học: {data.metadata.academicYear}</span>
          </div>
        </div>
      </div>

      {/* 2. REDESIGNED OVERVIEW CARD (HIGHLIGHT) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Section: High Impact Metrics */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
           
           <h3 className="relative z-10 text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Activity size={16} /> Tổng quan hoạt động
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="flex flex-col">
                 <span className="text-5xl font-black tracking-tighter text-blue-400">{metrics.totalHours}</span>
                 <span className="text-sm font-bold text-slate-400 uppercase mt-1">Tổng tiết giảng</span>
              </div>
              <div className="flex flex-col md:border-l border-slate-700 md:pl-8">
                 <span className="text-4xl font-black tracking-tighter">{metrics.totalSessions}</span>
                 <span className="text-sm font-bold text-slate-400 uppercase mt-1">Buổi lên lớp</span>
              </div>
              <div className="flex flex-col md:border-l border-slate-700 md:pl-8">
                 <span className="text-4xl font-black tracking-tighter">{metrics.totalWeeks}</span>
                 <span className="text-sm font-bold text-slate-400 uppercase mt-1">Tuần thực dạy</span>
              </div>
           </div>
        </div>

        {/* Bottom Section: Scope Breakdown */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-colors">
                 <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{metrics.totalCourses}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Môn học</p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-500 flex items-center justify-center">
                    <Briefcase size={16} />
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-colors">
                 <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{metrics.classDistribution.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Lớp SV</p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-slate-700 text-emerald-500 flex items-center justify-center">
                    <GraduationCap size={16} />
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-purple-500 transition-colors">
                 <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-purple-600 transition-colors">{metrics.totalGroups}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Nhóm HP</p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-slate-700 text-purple-500 flex items-center justify-center">
                    <Users size={16} />
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-orange-500 transition-colors">
                 <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-orange-600 transition-colors">{metrics.totalRooms}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phòng</p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-slate-700 text-orange-500 flex items-center justify-center">
                    <MapPin size={16} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Line Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
           <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-4">Biến động theo Tuần</h4>
           <div className="h-56">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={weeklyData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                 <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                 <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                 <Line type="monotone" dataKey="value" stroke={COLORS.blue} strokeWidth={3} dot={{r: 3}} activeDot={{r: 5}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
        {/* Daily Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
           <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-4">Mật độ Giảng dạy theo Thứ</h4>
           <div className="h-56">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dailyData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" tick={{fontSize: 10}} width={60} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                 <Bar dataKey="value" fill={COLORS.indigo} radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 4. PEAK WEEK ANALYSIS (Moved Up) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
               <h3 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                 <Activity size={16} /> Phân tích Tuần Trọng điểm
               </h3>
               <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">Tuần {metrics.busiestWeek.week}</p>
               <p className="text-xs text-slate-400 font-mono">{metrics.busiestWeek.range}</p>
            </div>
            <div className="text-right">
               <p className="text-3xl font-black text-red-500">{metrics.busiestWeek.hours}</p>
               <p className="text-[10px] text-slate-400 uppercase font-bold">Tổng tiết</p>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Bản đồ Nhiệt Lịch giảng Chi tiết</p>
               <div className="flex gap-1 h-24 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  {peakWeekHeatmapData.map((d, i) => {
                     const height = Math.max((d.value / 15) * 100, 5); // Scale
                     const intensity = d.value > 8 ? 'bg-red-500' : d.value > 4 ? 'bg-orange-400' : 'bg-blue-300';
                     return (
                       <div key={i} className="flex-1 flex flex-col items-center gap-1 group justify-end h-full">
                         <div className={`w-full ${intensity} rounded-sm relative transition-all duration-300 group-hover:opacity-80`} style={{ height: `${height}%`, opacity: d.value > 0 ? 0.9 : 0.2 }}>
                           <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10">{d.value} tiết</div>
                         </div>
                         <span className="text-[9px] font-bold text-slate-500">{d.name}</span>
                       </div>
                     )
                  })}
               </div>
            </div>
            <div>
               <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Cường độ theo Buổi</p>
               <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-500 font-bold">Sáng</span>
                     <span className="font-black text-blue-600">{metrics.peakWeekShiftStats.morning} buổi</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                     <div className="bg-blue-500 h-full transition-all duration-500" style={{width: `${(metrics.peakWeekShiftStats.morning / 7)*100}%`}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-500 font-bold">Chiều</span>
                     <span className="font-black text-amber-600">{metrics.peakWeekShiftStats.afternoon} buổi</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                     <div className="bg-amber-500 h-full transition-all duration-500" style={{width: `${(metrics.peakWeekShiftStats.afternoon / 7)*100}%`}}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-500 font-bold">Tối</span>
                     <span className="font-black text-purple-600">{metrics.peakWeekShiftStats.evening} buổi</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                     <div className="bg-purple-500 h-full transition-all duration-500" style={{width: `${(metrics.peakWeekShiftStats.evening / 7)*100}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 5. PIE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-4 w-full text-left">Cơ cấu Loại hình Học phần</h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                    <Cell fill={TYPE_COLORS[CourseType.LT]} />
                    <Cell fill={TYPE_COLORS[CourseType.TH]} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-2">
               {typeData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: i === 0 ? TYPE_COLORS[CourseType.LT] : TYPE_COLORS[CourseType.TH]}}></div>
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{d.name}: {metrics.totalHours > 0 ? Math.round(d.value/metrics.totalHours*100) : 0}%</span>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-4 w-full text-left">Phân bổ theo Buổi</h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={shiftData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                    {shiftData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-2">
               {shiftData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: PIE_COLORS[i]}}></div>
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{d.name}: {metrics.totalSessions > 0 ? Math.round(d.value/metrics.totalSessions*100) : 0}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 6. TOP ROOMS & CLASS DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-4">Top 10 Giảng đường</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topRooms} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="room" type="category" tick={{fontSize: 10}} width={60} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                  <Bar dataKey="periods" fill={COLORS.emerald} radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500" /> Chi tiết theo Lớp
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-56 custom-scrollbar">
               {metrics.classDistribution.map((c, i) => (
                 <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{c.className}</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{c.periods}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 7. SUBJECT DETAILS - BAR CHART (SORTED & OPTIMIZED) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
         <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
           <Layers size={16} className="text-indigo-500" /> Chi tiết theo môn
         </h3>
         {/* Dynamic Height */}
         <div style={{ height: Math.max(subjectWeights.length * 50, 200) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectWeights} layout="vertical" margin={{ left: 20, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{fontSize: 10}} 
                  width={150} 
                  axisLine={false} 
                  tickLine={false}
                  interval={0}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{borderRadius: '8px', fontSize: '12px'}} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {subjectWeights.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSubjectColor(index)} />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    formatter={(val: number) => `${val} tiết`}
                    style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 8. WARNINGS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
         <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           <AlertTriangle size={16} /> Chỉ số cần Lưu ý & Tối ưu
         </h3>
         {metrics.warnings.length > 0 ? (
           <ul className="space-y-2">
             {metrics.warnings.map((w, i) => (
               <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                 <span className="text-amber-500">⚠</span> {w}
               </li>
             ))}
           </ul>
         ) : (
           <p className="text-sm text-emerald-500 font-bold flex items-center gap-2"><span className="text-lg">✓</span> Không có cảnh báo nào. Lịch dạy hợp lý.</p>
         )}
      </div>

      {/* 9. CO-TEACHERS */}
      {metrics.coTeachers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Users size={16} className="text-slate-500" /> GV phối hợp chuyên môn
           </h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400">
                    <tr>
                       <th className="pb-2 font-bold">Giảng viên</th>
                       <th className="pb-2 font-bold text-center">Số tiết</th>
                       <th className="pb-2 font-bold">Môn học liên quan</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {metrics.coTeachers.map((t, i) => (
                      <tr key={i}>
                         <td className="py-2 font-bold text-slate-700 dark:text-slate-200">{t.name}</td>
                         <td className="py-2 text-center font-black text-slate-800 dark:text-slate-100">{t.periods}</td>
                         <td className="py-2 text-slate-500 text-xs italic">{t.subjects.join(', ')}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* 10. CONCLUSION - UPDATED UI */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 shadow-md">
         <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
           <Lightbulb size={16} className="text-yellow-500" /> Nhận định & Đề xuất Tối ưu
         </h3>
         <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.conclusions.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                 <span className="text-blue-500 mt-0.5">•</span> {c}
              </li>
            ))}
         </ul>
      </div>

      <div className="text-center text-slate-400 text-[10px] mt-12 pt-4 border-t border-slate-100 dark:border-slate-900">
        © 2026 TdyPhan | Google AI Studio
      </div>
    </div>
  );
};

export default StatisticsView;
