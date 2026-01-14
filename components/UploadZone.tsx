
import React, { useRef, useState } from 'react';
import { Upload, FileCode, CheckCircle2, Lock, ArrowLeft, ClipboardPaste, Play } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (content: string) => void;
  onDemoLoad: (code: string) => void;
  onCancel?: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, onDemoLoad, onCancel }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const [pasteContent, setPasteContent] = useState('');
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

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;
    onUpload(pasteContent);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDemoLoad(secretCode);
  };

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in fade-in zoom-in duration-300">
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          title="Hủy bỏ & Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <div className="p-8 md:p-10">
        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Phân Tích Lịch Giảng Dạy</h2>
        <p className="text-slate-500 text-center mb-8 text-sm max-w-lg mx-auto">
          Hệ thống hỗ trợ phân tích từ file HTML (UMS) hoặc JSON backup. Bạn có thể tải file hoặc dán trực tiếp mã nguồn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột 1: Drag & Drop */}
          <div className="flex flex-col h-full">
             <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Upload size={16} className="text-blue-500"/> Cách 1: Tải file lên
             </div>
             <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                flex-1 relative cursor-pointer group border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200 min-h-[200px]
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
                w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110
                ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}
              `}>
                {file ? <CheckCircle2 size={24} /> : <Upload size={24} />}
              </div>
              
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 text-center">
                {file ? file.name : "Kéo thả hoặc chọn file"}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">HTML / JSON</p>
            </div>
          </div>

          {/* Cột 2: Paste Text */}
          <div className="flex flex-col h-full">
             <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <ClipboardPaste size={16} className="text-orange-500"/> Cách 2: Dán mã nguồn
             </div>
             <div className="flex-1 flex flex-col relative">
                <textarea 
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste nội dung HTML hoặc JSON vào đây..."
                  className="w-full h-full min-h-[160px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
                ></textarea>
                <button 
                  onClick={handlePasteSubmit}
                  disabled={!pasteContent.trim()}
                  className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                   <Play size={14} fill="currentColor" /> Phân tích nội dung
                </button>
             </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-8">
          <form onSubmit={handleDemoSubmit} className="w-full sm:w-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
             <div className="pl-3 text-slate-400"><Lock size={14} /></div>
             <input 
               type="text" 
               placeholder="Mã bí mật..." 
               value={secretCode}
               onChange={(e) => setSecretCode(e.target.value)}
               className="bg-transparent text-xs font-bold py-1 outline-none w-24 text-slate-700 dark:text-slate-200"
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
        © 2026 TdyPhan | Google AI Studio
      </div>
    </div>
  );
};

export default UploadZone;
