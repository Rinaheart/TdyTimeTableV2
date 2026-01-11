
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Menu } from 'lucide-react';
import { ScheduleData, TabType, Metrics, Thresholds, CourseType } from './types';
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

const VERSION = '0.009';

const App: React.FC = () => {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.WEEK);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [overrides, setOverrides] = useState<Record<string, CourseType>>({});
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
        setError("Định dạng file không tương thích.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra trong quá trình xử lý.");
    }
  }, []);

  const handleDemoLoad = (code: string) => {
    const validCodes = ['TdyHK1', 'Tdy12345'];
    if (validCodes.includes(code)) {
      // Mocking DEMO data content
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
    if (window.innerWidth < 640 && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  const renderContent = () => {
    if (!data || !metrics) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
          <UploadZone onUpload={handleFileUpload} onDemoLoad={handleDemoLoad} />
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
              <AlertTriangle size={18} />
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
    <div className="min-h-screen flex transition-colors duration-200 bg-white dark:bg-slate-950 overflow-x-hidden">
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

      {/* Floating Menu Button for mobile when sidebar is hidden */}
      {data && sidebarCollapsed && (
        <button 
          onClick={() => setSidebarCollapsed(false)}
          className="sm:hidden fixed top-3 left-4 z-40 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg text-slate-600 dark:text-slate-300 animate-in slide-in-from-left-4 duration-300"
        >
          <Menu size={20} />
        </button>
      )}

      <main 
        ref={mainContentRef}
        onClick={handleClickOutside}
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300`}
      >
        {data && (
          <Header 
            activeTab={activeTab} 
            metadata={data.metadata} 
            darkMode={darkMode} 
            onToggleDarkMode={toggleDarkMode}
            version={VERSION}
          />
        )}
        
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
  );
};

// Mock data function to simulate loading DEMO file
function requireDemoData(): ScheduleData {
  return {
    metadata: {
      teacher: "Phan Đức Thái Duy",
      semester: "2",
      academicYear: "2025-2026",
      extractedDate: "2026-01-10T08:00:00.000Z"
    },
    weeks: [
      {
        weekNumber: 1,
        dateRange: "Từ ngày: 12/01/2026 đến ngày 18/01/2026",
        days: {
          Monday: { morning: [{ courseCode: "MHCĐO1052-LT.005", courseName: "Chăm sóc cộng đồng", group: "Nhóm 5", className: "ĐD 18E", timeSlot: "1-4", periodCount: 4, room: ".B.102", teacher: "Phan Đức Thái Duy", actualHours: 0, type: CourseType.LT, dayOfWeek: "Monday", sessionTime: "morning" }], afternoon: [], evening: [] },
          Tuesday: { morning: [], afternoon: [], evening: [] },
          Wednesday: { morning: [], afternoon: [], evening: [] },
          Thursday: { morning: [], afternoon: [], evening: [] },
          Friday: { morning: [], afternoon: [], evening: [] },
          Saturday: { morning: [], afternoon: [], evening: [] },
          Sunday: { morning: [], afternoon: [], evening: [] }
        }
      }
    ],
    allCourses: [
      { code: "MHCĐO1052-LT.005", name: "Chăm sóc cộng đồng", totalPeriods: 4, totalSessions: 1, groups: ["Nhóm 5"], classes: ["ĐD 18E"], types: [CourseType.LT] }
    ]
  };
}

export default App;
