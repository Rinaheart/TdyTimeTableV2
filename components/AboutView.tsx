
import React from 'react';
import { Info, ClipboardList, Clock, Github, Mail, Globe } from 'lucide-react';

interface AboutViewProps {
  version: string;
}

const CHANGE_LOG = [
  {
    version: 'v0.011',
    date: '2026-01-15',
    changes: [
      'Dashboard Thống Kê: Thiết kế lại toàn bộ giao diện (Cards, Grid) theo phong cách hiện đại.',
      'Logic: Cập nhật cơ chế xác định LT/TH (-LT, -TH, mặc định).',
      'Logic: Thống kê chỉ tính số liệu cho Giảng viên chính (Lọc GV khác).',
      'Tính năng: Bảng kê "Các GV cùng tham gia giảng dạy" tách biệt.',
      'Tính năng: Tự động sinh Cảnh báo (Quá tải, dạy tối, dạy cuối tuần...)',
      'Tính năng: Tự động sinh Kết luận dựa trên dữ liệu phân tích.',
      'UI: Thêm Heatmap tuần cao điểm và Treemap phân bố học phần.'
    ]
  },
  {
    version: 'v0.010',
    date: '2026-01-14',
    changes: [
      'Giao diện: Header cố định trên cùng, chứa thông tin GV và nút Menu.',
      'Tính năng: Fix lỗi lưu cấu hình loại hình giảng dạy (LT/TH) khi xuất file backup.',
      'Tính năng: Hỗ trợ load dữ liệu DEMO bằng mã bí mật tại trang tải file.',
      'UI Mobile: Sidebar ẩn hoàn toàn khi thu gọn, thay thế bằng nút Menu nổi trên Header.',
      'Thống kê: Thêm biểu đồ Top 10 giảng đường và Bảng tổng hợp theo môn.',
      'Thống kê: Cập nhật Bảng chi tiết nhóm lớp với đầy đủ thông tin Nhóm.',
      'UI: Giảm độ bo tròn các thành phần (Sử dụng rounded-xl).',
      'Lịch Học Kỳ: Làm đậm viền phân tách giữa các tuần, định dạng ngày dd/mm.'
    ]
  },
  {
    version: 'v0.009',
    date: '2026-01-14',
    changes: [
      'UI: Tên GV trên Header gọn gàng hơn.',
      'Tính năng: Chế độ xem Tuần Dọc/Ngang linh hoạt.',
      'Thống Kê: Biểu đồ tỷ lệ buổi dạy (Pie Chart) và Sparklines tuần.'
    ]
  },
  {
    version: 'v0.008',
    date: '2026-01-13',
    changes: [
      'Giao diện: Thiết kế phong cách tối giản Gemini.',
      'Conflict: Tự động phát hiện trùng lịch dạy.'
    ]
  },
  {
    version: 'v0.007',
    date: '2026-01-13',
    changes: [
      'Tính năng: Hỗ trợ xuất Google Calendar (.ics).',
      'Dữ liệu: Bóc tách chi tiết Lớp và Nhóm từ dữ liệu gốc.'
    ]
  },
  {
    version: 'v0.006',
    date: '2026-01-12',
    changes: [
      'Tính năng: Tùy chỉnh LT (45p) và TH (60p) thủ công trong Cài Đặt.'
    ]
  },
  {
    version: 'v0.005',
    date: '2026-01-12',
    changes: [
      'UI: Bổ sung chế độ tối (Dark Mode).',
      'Thống kê: Thêm biểu đồ phân bổ tiết dạy theo tuần.'
    ]
  },
  {
    version: 'v0.004',
    date: '2026-01-11',
    changes: [
      'Tính năng: Bộ lọc dữ liệu theo Lớp, Phòng và Giảng viên.'
    ]
  },
  {
    version: 'v0.003',
    date: '2026-01-11',
    changes: [
      'Tính năng: Phân tích và bóc tách dữ liệu từ file HTML xuất ra từ hệ thống.'
    ]
  },
  {
    version: 'v0.002',
    date: '2026-01-10',
    changes: [
      'Khởi tạo dự án: Cấu trúc cơ bản và hiển thị lịch tuần.'
    ]
  },
  {
    version: 'v0.001',
    date: '2026-01-10',
    changes: [
      'Initial release.'
    ]
  }
];

const AboutView: React.FC<AboutViewProps> = ({ version }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4 pt-8">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg">
          <Clock size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Phân tích Lịch Giảng v{version}</h2>
        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-sm">
          Tiện ích trực quan hóa và quản lý lịch trình giảng dạy thông minh. 
          Thiết kế đặc biệt cho Giảng viên Khối CĐ - Trường ĐHYD, ĐH Huế.
        </p>
        <p className="text-xs font-bold text-slate-400">
           © 2026 TdyPhan | Google AI Studio
        </p>
        <div className="flex justify-center gap-3 pt-2">
           <a href="mailto:tdyphan@gmail.com" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 transition-colors"><Mail size={18}/></a>
           <a href="mailto:tdyphan@gmail.com" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 transition-colors"><Github size={18}/></a>
           <a href="mailto:tdyphan@gmail.com" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 transition-colors"><Globe size={18}/></a>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> Quy chuẩn thời gian tiết giảng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-l-2 border-blue-600 pl-2">Sáng</h4>
            <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex justify-between"><span>Tiết 1:</span> <span>07:00 - 07:45</span></li>
              <li className="flex justify-between"><span>Tiết 2:</span> <span>07:55 - 08:40</span></li>
              <li className="flex justify-between"><span>Tiết 3:</span> <span>08:50 - 09:35</span></li>
              <li className="flex justify-between"><span>Tiết 4:</span> <span>09:45 - 10:30</span></li>
            </ul>
          </div>
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-l-2 border-orange-600 pl-2">Chiều</h4>
            <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex justify-between"><span>Tiết 6:</span> <span>13:30 - 14:15</span></li>
              <li className="flex justify-between"><span>Tiết 7:</span> <span>14:25 - 15:10</span></li>
              <li className="flex justify-between"><span>Tiết 8:</span> <span>15:20 - 16:05</span></li>
              <li className="flex justify-between"><span>Tiết 9:</span> <span>16:15 - 17:00</span></li>
            </ul>
          </div>
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-l-2 border-purple-600 pl-2">Tối</h4>
            <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex justify-between"><span>Tiết 10:</span> <span>17:10 - 17:55</span></li>
              <li className="flex justify-between"><span>Tiết 11:</span> <span>18:00 - 18:45</span></li>
              <li className="flex justify-between"><span>Tiết 12:</span> <span>18:50 - 19:35</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] italic text-slate-400">
          Ghi chú: Lý thuyết (LT) mỗi tiết 45 phút. Thực hành/Tích hợp (TH) mỗi tiết 60 phút.
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <ClipboardList size={16} className="text-emerald-500" /> Nhật ký thay đổi (Changelog)
        </h3>
        <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
          {CHANGE_LOG.map((log) => (
            <div key={log.version} className="relative pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 dark:text-white">{log.version}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{log.date}</span>
              </div>
              <ul className="space-y-1">
                {log.changes.map((change, i) => (
                  <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-500/30 mt-1.5 shrink-0"></span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-medium text-slate-400 tracking-[0.2em]">© 2026 TdyPhan | Google AI Studio</p>
      </div>
    </div>
  );
};

export default AboutView;
