import React, { useState } from 'react';
import { checkPlagiarismAndStyle } from '../../services/geminiService';
import { BookOpen, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const PlagiarismChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const data = await checkPlagiarismAndStyle(text);
      setResult(data);
    } catch (error) {
      setResult("Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-red-600" /> Kiểm Tra Đạo Văn & Văn Phong
        </h2>
        <p className="text-gray-600 mt-2">Sử dụng AI để phân tích tính nguyên bản và gợi ý cải thiện văn phong (Simulated Check).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col h-[600px]">
          <textarea
            className="flex-1 w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none resize-none mb-4"
            placeholder="Dán văn bản cần kiểm tra vào đây..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={handleCheck}
            disabled={loading || !text}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white flex justify-center items-center gap-2 transition-all ${
              loading || !text ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-md'
            }`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Phân Tích Ngay'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-y-auto h-[600px]">
          {result ? (
            <div className="prose prose-red max-w-none">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Kết quả phân tích
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {result}
                </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <AlertTriangle className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-center">Kết quả phân tích sẽ hiển thị ở đây.<br/>Vui lòng nhập văn bản bên trái.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlagiarismChecker;