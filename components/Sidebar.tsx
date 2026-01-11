
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu,
  LogOut,
  Info
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onReset: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onReset, collapsed, toggleCollapse }) => {
  const menuItems = [
    { id: TabType.WEEK, label: 'Lịch Tuần', icon: Calendar },
    { id: TabType.OVERVIEW, label: 'Lịch Học Kỳ', icon: LayoutDashboard },
    { id: TabType.STATS, label: 'Thống Kê', icon: BarChart3 },
    { id: TabType.SETTINGS, label: 'Cài Đặt', icon: SettingsIcon },
    { id: TabType.ABOUT, label: 'Thông Tin', icon: Info },
  ];

  // Mobile special logic: hidden when collapsed
  const isHiddenOnMobile = collapsed ? 'w-0 sm:w-16 overflow-hidden sm:overflow-visible' : 'w-64';

  return (
    <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 z-50 ${isHiddenOnMobile}`}>
      <div className="p-4 flex items-center gap-4">
        <button onClick={toggleCollapse} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
          <Menu size={20} />
        </button>
        {!collapsed && <span className="font-bold text-slate-700 dark:text-slate-200 truncate">Timetable</span>}
      </div>

      <nav className={`flex-1 px-2 mt-4 space-y-1 ${collapsed ? 'hidden sm:block' : 'block'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (window.innerWidth < 640) toggleCollapse();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`p-2 border-t border-slate-200 dark:border-slate-800 ${collapsed ? 'hidden sm:block' : 'block'}`}>
        <button 
          onClick={onReset}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Đổi file khác</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
