import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, RefreshCw, Clipboard, Play, Trash2, CheckCircle, FileText } from 'lucide-react';

interface CompressedFile {
  id: string;
  file: File;
  originalPreview: string;
  originalSize: number;
  compressedUrl: string | null;
  compressedSize: number | null;
  status: 'pending' | 'processing' | 'done';
}

const ImageCompressor: React.FC = () => {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Helper to get active file for preview
  const activeFile = files.find(f => f.id === selectedFileId) || files[0];

  const processFiles = (incomingFiles: FileList | File[]) => {
    const currentCount = files.length;
    const validFiles = Array.from(incomingFiles).filter(f => f.type.match(/image.*/));
    const limitedFiles = validFiles.slice(0, 20 - currentCount);
    
    if (limitedFiles.length === 0) {
       if (files.length >= 20) alert("Đã đạt giới hạn tối đa 20 file.");
       return;
    }

    const newFiles: CompressedFile[] = limitedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      originalPreview: URL.createObjectURL(file),
      originalSize: file.size,
      compressedUrl: null,
      compressedSize: null,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    if (!selectedFileId && newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) processFiles(pastedFiles);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [files.length]);

  const compressBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const processed = await Promise.all(files.map(async (item) => {
        // Reuse existing result if nothing changed (optimization can be added here), 
        // but for now we re-compress to ensure quality setting is applied.
        return new Promise<CompressedFile>((resolve) => {
            const img = new Image();
            img.src = item.originalPreview;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    // Compress
                    const newBase64 = canvas.toDataURL('image/jpeg', quality / 100);
                    
                    // Calculate size
                    const head = 'data:image/jpeg;base64,';
                    const size = Math.round((newBase64.length - head.length) * 3 / 4);

                    resolve({
                        ...item,
                        compressedUrl: newBase64,
                        compressedSize: size,
                        status: 'done'
                    });
                } else {
                    resolve(item);
                }
            };
        });
    }));

    setFiles(processed);
    setIsProcessing(false);
  };

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavings = (original: number, compressed: number | null) => {
      if (!compressed) return 0;
      return Math.round(((original - compressed) / original) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon className="text-pink-600" /> Nén Ảnh Hàng Loạt
        </h2>
        <p className="text-gray-600 mt-2">Giảm dung lượng tối đa 20 ảnh cùng lúc (JPG/PNG/WEBP).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Controls */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-pink-50 transition-colors cursor-pointer relative">
                    <input type="file" multiple id="compress-upload" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                    <div className="flex flex-col items-center pointer-events-none">
                        <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-gray-700">Thêm ảnh (Tối đa 20)</span>
                        <span className="text-xs text-gray-500 mt-1">Hoặc dán Ctrl+V</span>
                    </div>
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <span>Đã chọn: {files.length}/20</span>
                    {files.length > 0 && (
                        <button onClick={() => setFiles([])} className="text-red-500 hover:underline">Xóa tất cả</button>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Cấu hình nén</h3>
                
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Chất lượng ảnh</span>
                        <span className="text-sm font-bold text-pink-600">{quality}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="95" 
                        value={quality} 
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>Nhỏ hơn</span>
                        <span>Đẹp hơn</span>
                    </div>
                </div>

                <button 
                    onClick={compressBatch}
                    disabled={files.length === 0 || isProcessing}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                        files.length === 0 || isProcessing
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-pink-600 hover:bg-pink-700 hover:-translate-y-1'
                    }`}
                >
                    {isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    {isProcessing ? 'Đang nén...' : 'Bắt Đầu Nén'}
                </button>
            </div>
        </div>

        {/* RIGHT: List & Preview */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
            {/* Preview Selected */}
            <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 flex-1 mb-4 flex items-center justify-center relative overflow-hidden bg-[url('https://media.istockphoto.com/id/1226505703/vector/transparent-background-seamless-pattern-vector-stock-illustration.jpg?s=612x612&w=0&k=20&c=J9_e3T_u6sYq5t0VqA-L9p9Z9y-j7Z5Z9y-j7Z5Z9y.jpg')]">
                {files.length === 0 ? (
                    <div className="text-center text-gray-400">
                        <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p>Chưa có ảnh nào được chọn</p>
                    </div>
                ) : (
                    <div className="relative max-w-full max-h-full flex flex-col items-center">
                        <img 
                            src={activeFile?.compressedUrl || activeFile?.originalPreview} 
                            alt="Preview" 
                            className="max-w-full max-h-[450px] object-contain shadow-lg rounded"
                        />
                        {activeFile?.status === 'done' && (
                             <div className="mt-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-sm font-medium flex gap-4">
                                <span className="text-gray-500 line-through">{formatSize(activeFile.originalSize)}</span>
                                <span className="text-pink-600">➜ {formatSize(activeFile.compressedSize || 0)}</span>
                                <span className="bg-pink-100 text-pink-700 px-2 rounded text-xs flex items-center">
                                    -{getSavings(activeFile.originalSize, activeFile.compressedSize)}%
                                </span>
                             </div>
                        )}
                    </div>
                )}
            </div>

            {/* File List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-72">
                 <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 text-sm">Danh sách file ({files.length})</h3>
                    {files.some(f => f.status === 'done') && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Hoàn tất
                        </span>
                    )}
                 </div>
                 <div className="overflow-y-auto p-2 space-y-2 flex-1">
                    {files.map((file) => (
                        <div 
                           key={file.id}
                           onClick={() => setSelectedFileId(file.id)}
                           className={`flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer ${
                              selectedFileId === file.id ? 'bg-pink-50 border-pink-300 ring-1 ring-pink-200' : 'bg-white border-gray-100 hover:border-gray-300'
                           }`}
                        >
                           <img src={file.originalPreview} className="w-10 h-10 object-cover rounded bg-gray-100" alt="thumb" />
                           
                           <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-gray-800 truncate">{file.file.name}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-xs text-gray-500">{formatSize(file.originalSize)}</span>
                                   {file.status === 'done' && (
                                       <>
                                         <span className="text-gray-300 text-xs">➜</span>
                                         <span className="text-xs font-bold text-green-600">{formatSize(file.compressedSize || 0)}</span>
                                         <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">
                                            -{getSavings(file.originalSize, file.compressedSize)}%
                                         </span>
                                       </>
                                   )}
                               </div>
                           </div>

                           {file.status === 'done' && file.compressedUrl ? (
                              <a 
                                 href={file.compressedUrl} 
                                 download={`compressed_${file.file.name}`}
                                 onClick={(e) => e.stopPropagation()}
                                 className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                 title="Tải xuống"
                              >
                                 <Download size={16} />
                              </a>
                           ) : (
                              <button 
                                 onClick={(e) => removeFile(file.id, e)}
                                 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                 <Trash2 size={16} />
                              </button>
                           )}
                        </div>
                    ))}
                    {files.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                           Danh sách trống. Kéo thả ảnh vào đây.
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;