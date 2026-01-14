
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ScheduleData, TabType, Metrics, Thresholds, CourseType, CourseSession } from './types';
import { DEFAULT_THRESHOLDS } from './constants';
import { parseScheduleHTML } from './services/parser';
import { calculateMetrics } from './services/analyzer';

// Views
import WeeklyView from './components/WeeklyView';
import SemesterView from './components/SemesterView';
import StatisticsView from './components/StatisticsView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadZone from './components/UploadZone';

const VERSION = '0.010';

const App: React.FC = () => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.WEEK);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [overrides, setOverrides] = useState<Record<string, CourseType>>({});
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Default expanded on desktop (false), collapsed on mobile (true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : true);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('last_schedule_data');
    if (saved) {
      try {
        const parsed: ScheduleData = JSON.parse(saved);
        setData(parsed);
        setOverrides(parsed.overrides || {});
        setMetrics(calculateMetrics(parsed));
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    if (savedDark) document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (data) {
      const updatedData = { ...data, overrides };
      setMetrics(calculateMetrics(updatedData));
    }
  }, [overrides, data]);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('darkMode', String(newDark));
    if (newDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleFileUpload = useCallback((content: string) => {
    try {
      // Check if it's JSON
      if (content.trim().startsWith('{')) {
        const parsedJson = JSON.parse(content) as ScheduleData;
        if (parsedJson.weeks && parsedJson.metadata) {
          setData(parsedJson);
          setOverrides(parsedJson.overrides || {});
          setMetrics(calculateMetrics(parsedJson));
          setError(null);
          localStorage.setItem('last_schedule_data', JSON.stringify(parsedJson));
          return;
        }
      }

      // Default to HTML
      const parsedData = parseScheduleHTML(content);
      if (parsedData && parsedData.weeks.length > 0) {
        setData(parsedData);
        setOverrides({});
        setMetrics(calculateMetrics(parsedData));
        setError(null);
        localStorage.setItem('last_schedule_data', JSON.stringify(parsedData));
      } else {
        throw new Error("Dữ liệu không hợp lệ.");
      }
    } catch (err: any) {
      setError(err.message || "File không đúng định dạng hoặc thiếu cấu trúc HTML hợp lệ.");
    }
  }, []);

  const handleDemoLoad = (code: string) => {
    const validCodes = ['TdyHK1', 'Tdy12345'];
    if (validCodes.includes(code)) {
      const demoData = requireDemoData(); 
      setData(demoData);
      setOverrides({});
      setMetrics(calculateMetrics(demoData));
      setError(null);
      localStorage.setItem('last_schedule_data', JSON.stringify(demoData));
    } else {
      alert("Mã bí mật không chính xác.");
    }
  };

  const handleSaveOverrides = (newOverrides: Record<string, CourseType>) => {
    setOverrides(newOverrides);
    if (data) {
      const updatedData = { ...data, overrides: newOverrides };
      localStorage.setItem('last_schedule_data', JSON.stringify(updatedData));
    }
  };

  // Close sidebar on mobile when clicking outside
  const handleClickOutside = () => {
    if (window.innerWidth < 1024 && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  const renderContent = () => {
    if (!data || !metrics) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
          <UploadZone onUpload={handleFileUpload} onDemoLoad={handleDemoLoad} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm max-w-lg">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    const dataWithOverrides = { ...data, overrides };

    switch (activeTab) {
      case TabType.WEEK:
        return (
          <WeeklyView 
            week={data.weeks[currentWeekIndex]} 
            allWeeks={data.weeks}
            onNext={() => setCurrentWeekIndex(prev => Math.min(prev + 1, data.weeks.length - 1))}
            onPrev={() => setCurrentWeekIndex(prev => Math.max(prev - 1, 0))}
            isFirst={currentWeekIndex === 0}
            isLast={currentWeekIndex === data.weeks.length - 1}
            totalWeeks={data.weeks.length}
            weekIdx={currentWeekIndex}
            thresholds={thresholds}
            overrides={overrides}
          />
        );
      case TabType.OVERVIEW:
        return <SemesterView data={dataWithOverrides} />;
      case TabType.STATS:
        return <StatisticsView metrics={metrics} data={dataWithOverrides} />;
      case TabType.SETTINGS:
        return (
          <SettingsView 
            thresholds={thresholds} 
            onSave={setThresholds} 
            version={VERSION} 
            data={dataWithOverrides}
            overrides={overrides}
            onSaveOverrides={handleSaveOverrides}
          />
        );
      case TabType.ABOUT:
        return <AboutView version={VERSION} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-slate-950 overflow-x-hidden">
      {data && (
        <Header 
          activeTab={activeTab} 
          metadata={data.metadata} 
          darkMode={darkMode} 
          onToggleDarkMode={toggleDarkMode}
          version={VERSION}
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}
      
      <div className={`flex ${data ? 'pt-14' : ''}`}>
        {data && (
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            collapsed={sidebarCollapsed}
            toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onReset={() => {
              setData(null);
              setOverrides({});
              localStorage.removeItem('last_schedule_data');
            }}
          />
        )}

        <main 
          ref={mainContentRef}
          onClick={handleClickOutside}
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            data ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto w-full">
              {renderContent()}
            </div>
          </div>
          
          {!data && (
            <div className="p-4 text-center text-[11px] text-slate-400 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
              © 2026 TdyPhan
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Data construction helpers for DEMO
const createSession = (
  code: string, name: string, group: string, className: string, 
  room: string, timeSlot: string, day: string, session: 'morning'|'afternoon'|'evening',
  teacher: string = "Demo"
): CourseSession => {
  const [start, end] = timeSlot.split('-').map(Number);
  return {
    courseCode: code, courseName: name, group, className,
    timeSlot, periodCount: (end - start) + 1, room, teacher,
    actualHours: 0, type: code.includes('-LT') ? CourseType.LT : CourseType.TH,
    dayOfWeek: day, sessionTime: session
  };
};

function requireDemoData(): ScheduleData {
  const courses = [
    { code: "MHCĐO1052-LT.005", name: "CSSKCĐ", group: "Nhóm 5", class: "ĐD 1E" },
    { code: "MHCĐO1052-LT.002", name: "CSSKCĐ", group: "Nhóm 2", class: "ĐD 1B" },
    { code: "MHCĐO1052-LT.001", name: "CSSKCĐ", group: "Nhóm 1", class: "ĐD 1A" },
    { code: "MHCĐO1052-LT.004", name: "CSSKCĐ", group: "Nhóm 4", class: "ĐD 1D" },
    { code: "MHCĐO1092.001", name: "TH NCKH", group: "Nhóm 1", class: "DS 1A" },
    { code: "MHCĐO1092.002", name: "TH NCKH", group: "Nhóm 2", class: "DS 1B" },
    { code: "MHCĐO1092.003", name: "TH NCKH", group: "Nhóm 3", class: "DS 1C" },
    { code: "MHCĐO1092.004", name: "TH NCKH", group: "Nhóm 4", class: "DS 1D" },
    { code: "MHLSG1292.001", name: "QL HS & CSSK SSCĐ", group: "Nhóm 1", class: "HS 1" },
  ];

  // Helper to quickly find course info
  const getC = (code: string) => courses.find(c => c.code === code) || courses[0];

  return {
    metadata: {
      teacher: "Demo",
      semester: "2",
      academicYear: "2025-2026",
      extractedDate: new Date().toISOString()
    },
    weeks: [
      {
        weekNumber: 1,
        dateRange: "Từ ngày: 12/01/2026 đến ngày 18/01/2026",
        days: {
          Monday: {
            morning: [createSession("MHCĐO1052-LT.005", getC("MHCĐO1052-LT.005").name, "Nhóm 5", "ĐD 1E", ".B.102", "1-4", "Monday", "morning")],
            afternoon: [createSession("MHCĐO1092.002", getC("MHCĐO1092.002").name, "Nhóm 2", "DS 1B", ".B.106", "6-9", "Monday", "afternoon", "Demo 2")],
            evening: []
          },
          Tuesday: {
            morning: [createSession("MHCĐO1052-LT.002", getC("MHCĐO1052-LT.002").name, "Nhóm 2", "ĐD 1B", ".B.102", "1-4", "Tuesday", "morning")],
            afternoon: [createSession("MHCĐO1052-LT.001", getC("MHCĐO1052-LT.001").name, "Nhóm 1", "ĐD 1A", ".B.102", "6-9", "Tuesday", "afternoon", "Demo 2")],
            evening: []
          },
          Wednesday: {
            morning: [createSession("MHCĐO1052-LT.005", getC("MHCĐO1052-LT.005").name, "Nhóm 5", "ĐD 1E", ".B.102", "1-4", "Wednesday", "morning")],
            afternoon: [createSession("MHCĐO1052-LT.004", getC("MHCĐO1052-LT.004").name, "Nhóm 4", "ĐD 1D", ".B.102", "6-9", "Wednesday", "afternoon")],
            evening: []
          },
          Thursday: {
            morning: [createSession("MHCĐO1052-LT.002", getC("MHCĐO1052-LT.002").name, "Nhóm 2", "ĐD 1B", ".B.102", "1-4", "Thursday", "morning")],
            afternoon: [
              createSession("MHCĐO1052-LT.004", getC("MHCĐO1052-LT.004").name, "Nhóm 4", "ĐD 1D", ".B.102", "6-9", "Thursday", "afternoon"),
              createSession("MHLSG1292.001", getC("MHLSG1292.001").name, "Nhóm 1", "HS 1", ".B.105", "6-9", "Thursday", "afternoon", "Demo 2")
            ],
            evening: [createSession("MHCĐO1092.001", getC("MHCĐO1092.001").name, "Nhóm 1", "DS 1A", ".B.101", "11-13", "Thursday", "evening")]
          },
          Friday: {
            morning: [createSession("MHCĐO1052-LT.001", getC("MHCĐO1052-LT.001").name, "Nhóm 1", "ĐD 1A", ".B.102", "1-4", "Friday", "morning")],
            afternoon: [createSession("MHCĐO1092.004", getC("MHCĐO1092.004").name, "Nhóm 4", "DS 1D", ".B.104", "6-9", "Friday", "afternoon", "Demo 2")],
            evening: []
          },
          Saturday: {
            morning: [createSession("MHCĐO1092.001", getC("MHCĐO1092.001").name, "Nhóm 1", "DS 1A", ".B.102", "1-4", "Saturday", "morning")],
            afternoon: [],
            evening: []
          },
          Sunday: { morning: [], afternoon: [], evening: [] }
        }
      },
      {
        weekNumber: 2,
        dateRange: "Từ ngày: 19/01/2026 đến ngày 25/01/2026",
        days: {
          Monday: {
            morning: [createSession("MHCĐO1052-LT.005", getC("MHCĐO1052-LT.005").name, "Nhóm 5", "ĐD 1E", ".B.102", "1-4", "Monday", "morning")],
            afternoon: [createSession("MHCĐO1092.002", getC("MHCĐO1092.002").name, "Nhóm 2", "DS 1B", ".B.106", "6-9", "Monday", "afternoon", "Demo 2")],
            evening: []
          },
          Tuesday: {
            morning: [createSession("MHCĐO1052-LT.002", getC("MHCĐO1052-LT.002").name, "Nhóm 2", "ĐD 1B", ".B.102", "1-4", "Tuesday", "morning")],
            afternoon: [createSession("MHCĐO1052-LT.001", getC("MHCĐO1052-LT.001").name, "Nhóm 1", "ĐD 1A", ".B.102", "6-9", "Tuesday", "afternoon", "Demo 2")],
            evening: []
          },
          Wednesday: {
            morning: [createSession("MHCĐO1052-LT.005", getC("MHCĐO1052-LT.005").name, "Nhóm 5", "ĐD 1E", ".B.102", "1-3", "Wednesday", "morning")],
            afternoon: [createSession("MHCĐO1052-LT.004", getC("MHCĐO1052-LT.004").name, "Nhóm 4", "ĐD 1D", ".B.102", "6-9", "Wednesday", "afternoon")],
            evening: []
          },
          Thursday: {
            morning: [createSession("MHCĐO1052-LT.002", getC("MHCĐO1052-LT.002").name, "Nhóm 2", "ĐD 1B", ".B.102", "1-3", "Thursday", "morning")],
            afternoon: [
              createSession("MHCĐO1052-LT.004", getC("MHCĐO1052-LT.004").name, "Nhóm 4", "ĐD 1D", ".B.102", "6-8", "Thursday", "afternoon"),
              createSession("MHLSG1292.001", getC("MHLSG1292.001").name, "Nhóm 1", "HS 1", ".B.105", "6-9", "Thursday", "afternoon", "Demo 2")
            ],
            evening: [createSession("MHCĐO1092.001", getC("MHCĐO1092.001").name, "Nhóm 1", "DS 1A", ".B.101", "11-13", "Thursday", "evening")]
          },
          Friday: {
            morning: [createSession("MHCĐO1052-LT.001", getC("MHCĐO1052-LT.001").name, "Nhóm 1", "ĐD 1A", ".B.102", "1-3", "Friday", "morning")],
            afternoon: [createSession("MHCĐO1092.004", getC("MHCĐO1092.004").name, "Nhóm 4", "DS 1D", ".B.104", "6-9", "Friday", "afternoon", "Demo 2")],
            evening: []
          },
          Saturday: {
            morning: [createSession("MHCĐO1092.001", getC("MHCĐO1092.001").name, "Nhóm 1", "DS 1A", ".B.102", "1-4", "Saturday", "morning")],
            afternoon: [],
            evening: []
          },
          Sunday: { morning: [], afternoon: [], evening: [] }
        }
      },
      {
        weekNumber: 3,
        dateRange: "Từ ngày: 26/01/2026 đến ngày 01/02/2026",
        days: {
          Monday: {
            morning: [],
            afternoon: [createSession("MHCĐO1092.002", getC("MHCĐO1092.002").name, "Nhóm 2", "DS 1B", ".B.106", "6-9", "Monday", "afternoon", "Demo 2")],
            evening: []
          },
          Tuesday: {
            morning: [createSession("MHCĐO1092.003", getC("MHCĐO1092.003").name, "Nhóm 3", "DS 1C", ".B.105", "1-4", "Tuesday", "morning")],
            afternoon: [],
            evening: []
          },
          Wednesday: { morning: [], afternoon: [], evening: [] },
          Thursday: {
            morning: [],
            afternoon: [createSession("MHLSG1292.001", getC("MHLSG1292.001").name, "Nhóm 1", "HS 1", ".B.105", "6-9", "Thursday", "afternoon", "Demo 2")],
            evening: []
          },
          Friday: {
            morning: [createSession("MHCĐO1092.001", getC("MHCĐO1092.001").name, "Nhóm 1", "DS 1A", ".B.102", "1-4", "Friday", "morning")],
            afternoon: [createSession("MHCĐO1092.004", getC("MHCĐO1092.004").name, "Nhóm 4", "DS 1D", ".B.104", "6-9", "Friday", "afternoon", "Demo 2")],
            evening: []
          },
          Saturday: { morning: [], afternoon: [], evening: [] },
          Sunday: { morning: [], afternoon: [], evening: [] }
        }
      }
    ],
    allCourses: courses.map(c => ({
      code: c.code, name: c.name,
      totalPeriods: 0, totalSessions: 0, // Calculated by analyzer
      groups: [c.group], classes: [c.class],
      types: [c.code.includes('-LT') ? CourseType.LT : CourseType.TH]
    }))
  };
}

export default App;
