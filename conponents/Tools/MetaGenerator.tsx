import React, { useState } from 'react';
import { generateMetaDescriptions } from '../../services/geminiService';
import { GeneratedMeta } from '../../types';
import { Sparkles, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

const MetaGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Chuyên nghiệp');
  const [results, setResults] = useState<GeneratedMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await generateMetaDescriptions(topic, keywords, tone);
      setResults(data);
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-indigo-600" /> Tạo Meta Description Tự Động
        </h2>
        <p className="text-gray-600 mt-2">Sử dụng AI để tạo thẻ tiêu đề và mô tả chuẩn SEO giúp tăng tỷ lệ click.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề bài viết / URL</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
            rows={4}
            placeholder="VD: Cách làm bánh bông lan trứng muối ngon tại nhà..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">Từ khóa chính (cách nhau dấu phẩy)</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
            placeholder="bánh bông lan, công thức làm bánh..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">Giọng văn</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-6"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option>Chuyên nghiệp</option>
            <option>Thân thiện, vui vẻ</option>
            <option>Thuyết phục, bán hàng</option>
            <option>Hài hước</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white flex justify-center items-center gap-2 transition-all ${
              loading || !topic ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Đang tạo...' : 'Tạo Nội Dung'}
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {results.length > 0 ? (
            results.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                     onClick={() => copyToClipboard(item.description, idx)}
                     className="p-2 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-full transition-colors"
                     title="Sao chép Description"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded">Option {idx + 1}</span>
                </div>
                
                <div className="mb-2">
                   <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">{item.title}</h3>
                   <div className="text-green-700 text-sm">www.example.com › category › {keywords.split(',')[0] || 'bai-viet'}</div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                
                <div className="mt-4 pt-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
                  <span>Title: {item.title.length} chars</span>
                  <span>Desc: {item.description.length} chars</span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl min-h-[300px]">
              <Sparkles className="w-12 h-12 mb-3 text-gray-300" />
              <p>Kết quả sẽ hiển thị ở đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaGenerator;