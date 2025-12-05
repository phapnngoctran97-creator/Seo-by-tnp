import React, { useState } from 'react';
import { FileType, ArrowRightLeft, Merge, FileText, Download } from 'lucide-react';

const PdfTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convert' | 'merge'>('convert');
  
  // Dummy states for UI demo
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
        setIsProcessing(false);
        alert("Tính năng này đang được phát triển (Cần Server-side processing). Tuy nhiên, bạn có thể sử dụng tính năng 'In sang PDF' của trình duyệt cho văn bản.");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileType className="text-red-500" /> Công Cụ PDF
        </h2>
        <p className="text-gray-600 mt-2">Chuyển đổi và xử lý file PDF đơn giản.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('convert')}
                className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${activeTab === 'convert' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <ArrowRightLeft size={18} /> Word ↔ PDF
            </button>
            <button 
                onClick={() => setActiveTab('merge')}
                className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${activeTab === 'merge' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Merge size={18} /> Ghép File PDF
            </button>
        </div>

        <div className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-6 relative">
                <input 
                    type="file" 
                    multiple={activeTab === 'merge'} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept={activeTab === 'convert' ? ".doc,.docx,.pdf" : ".pdf"}
                />
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    {activeTab === 'convert' ? <FileText className="w-8 h-8" /> : <Merge className="w-8 h-8" />}
                </div>
                {files.length > 0 ? (
                    <div className="text-center">
                        <p className="font-medium text-gray-800">{files.length} file đã chọn</p>
                        <p className="text-sm text-gray-500">{files.map(f => f.name).join(', ')}</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700">
                            {activeTab === 'convert' ? 'Chọn file Word hoặc PDF' : 'Chọn các file PDF cần ghép'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">Kéo thả hoặc click để tải lên</p>
                    </div>
                )}
            </div>

            <button 
                onClick={handleProcess}
                disabled={files.length === 0 || isProcessing}
                className={`w-full py-3 rounded-lg font-medium text-white transition-all flex justify-center items-center gap-2 ${
                    files.length === 0 || isProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-md'
                }`}
            >
                {isProcessing ? 'Đang xử lý...' : (activeTab === 'convert' ? 'Chuyển Đổi' : 'Ghép File')}
            </button>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 flex gap-2 items-start">
                 <span className="font-bold">Lưu ý:</span> 
                 Đây là phiên bản Demo giao diện. Việc xử lý file PDF/Word phức tạp yêu cầu Server Backend để đảm bảo font chữ và định dạng chính xác.
            </div>
        </div>
      </div>
    </div>
  );
};

export default PdfTools;