
import React, { useRef, useState } from 'react';
import { Upload, FileCode, CheckCircle2, Lock } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (content: string) => void;
  onDemoLoad: (code: string) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, onDemoLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFile = (file: File) => {
    const isHtml = file.type === 'text/html' || file.name.endsWith('.html');
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');

    if (isHtml || isJson) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onUpload(text);
      };
      reader.readAsText(file);
    } else {
      alert("Vui lòng chọn file HTML hoặc JSON.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDemoLoad(secretCode);
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-8">
        <h2 className="text-xl font-black text-center text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Phân Tích Lịch Giảng Dạy</h2>
        <p className="text-slate-500 text-center mb-8 text-sm">Tải lên file HTML từ hệ thống hoặc file JSON backup để bắt đầu</p>

        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer group border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200
            ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'}
          `}
        >
          <input 
            type="file" 
            ref={inputRef} 
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            accept=".html,.json"
            className="hidden"
          />
          
          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110
            ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}
          `}>
            {file ? <CheckCircle2 size={28} /> : <Upload size={28} />}
          </div>
          
          <p className="text-md font-bold text-slate-700 dark:text-slate-200 mb-1">
            {file ? file.name : "Nhấp hoặc kéo thả file vào đây"}
          </p>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">HTML HOẶC JSON (Max 5MB)</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-8">
          <form onSubmit={handleDemoSubmit} className="w-full sm:w-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
             <div className="pl-3 text-slate-400"><Lock size={14} /></div>
             <input 
               type="text" 
               placeholder="Mã bí mật..." 
               value={secretCode}
               onChange={(e) => setSecretCode(e.target.value)}
               className="bg-transparent text-xs font-bold py-1 outline-none w-24"
             />
             <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-700 transition-colors uppercase">Demo</button>
          </form>

          <div className="flex gap-4">
             <div className="text-center">
                <span className="block text-[10px] font-black text-blue-600 uppercase">Trực quan</span>
             </div>
             <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="block text-[10px] font-black text-amber-600 uppercase">Cảnh báo</span>
             </div>
             <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="block text-[10px] font-black text-emerald-600 uppercase">Xuất file</span>
             </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-950 p-3 text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
        © 2026 TdyPhan
      </div>
    </div>
  );
};

export default UploadZone;
