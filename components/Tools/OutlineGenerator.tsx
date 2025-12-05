import React, { useState } from 'react';
import { generateSeoOutline } from '../../services/geminiService';
import { List, Copy, Check, Loader2, AlertCircle, FileText } from 'lucide-react';

const OutlineGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic || !mainKeyword) return;
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const data = await generateSeoOutline(topic, mainKeyword, secondaryKeywords);
      setResult(data);
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <List className="text-emerald-600" /> Tạo Dàn Ý Bài Viết SEO (Outline)
        </h2>
        <p className="text-gray-600 mt-1">Lập dàn ý chi tiết, gợi ý từ khóa LSI và chiến lược content chuẩn SEO.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* INPUT COLUMN */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề bài viết <span className="text-red-500">*</span></label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={3}
                placeholder="VD: Hướng dẫn chăm sóc da dầu mụn tại nhà..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa chính (Main Keyword) <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="VD: chăm sóc da dầu mụn"
                value={mainKeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa phụ / Liên quan (Optional)</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={3}
                placeholder="VD: sữa rửa mặt cho da dầu, cách trị mụn, skincare..."
                value={secondaryKeywords}
                onChange={(e) => setSecondaryKeywords(e.target.value)}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic || !mainKeyword}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all mt-2 ${
                loading || !topic || !mainKeyword
                  ? 'bg-emerald-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-md hover:-translate-y-1'
              }`}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <List className="w-5 h-5" />}
              {loading ? 'Đang phân tích...' : 'Lập Dàn Ý Ngay'}
            </button>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-sm text-emerald-800">
             <h4 className="font-bold flex items-center gap-2 mb-2"><FileText size={16} /> Mẹo</h4>
             <p>Cung cấp càng nhiều từ khóa phụ, AI sẽ càng xây dựng được cấu trúc bài viết bao quát và đầy đủ ý nghĩa (Semantic SEO) hơn.</p>
          </div>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700">Kết quả phân tích</h3>
            {result && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {result ? (
              <div className="prose prose-emerald max-w-none prose-headings:font-bold prose-h2:text-emerald-700 prose-a:text-blue-600 prose-strong:text-gray-900 text-gray-700">
                 {/* Simple render assuming markdown-like structure returned by Gemini */}
                 <div className="whitespace-pre-wrap">{result}</div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <List className="w-16 h-16 mb-4 opacity-20" />
                 <p className="text-center">Dàn ý chi tiết và gợi ý từ khóa<br/>sẽ hiển thị tại đây.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlineGenerator;