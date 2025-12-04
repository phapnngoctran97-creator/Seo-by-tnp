import React, { useState } from 'react';
import { analyzeSpeedOptimization } from '../../services/geminiService';
import { Zap, Activity, Server, Layout, Loader2 } from 'lucide-react';

const SpeedAdvisor: React.FC = () => {
  const [input, setInput] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAdvice('');
    try {
      const result = await analyzeSpeedOptimization(input);
      setAdvice(result);
    } catch (error) {
      setAdvice("Đã xảy ra lỗi khi lấy tư vấn. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Zap className="text-yellow-500" /> Tư Vấn Tốc Độ Web & Core Web Vitals
        </h2>
        <p className="text-gray-600 mt-2">Nhận lời khuyên từ chuyên gia AI về cách tối ưu hóa Website của bạn.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Nhập URL website hoặc mô tả công nghệ bạn đang dùng (VD: Wordpress, React, Shopify...)</label>
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            placeholder="VD: https://my-shop.com hoặc 'Website bán hàng dùng Wordpress và Elementor'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !input}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
              loading ? 'bg-yellow-300' : 'bg-yellow-500 hover:bg-yellow-600 shadow-md'
            }`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Phân Tích'}
          </button>
        </div>
      </div>

      {advice && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in">
          <div className="prose prose-yellow max-w-none">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Kết quả tư vấn tối ưu hóa</h3>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-normal">
              {advice}
            </div>
          </div>
        </div>
      )}

      {/* Static Education Section if no result yet */}
      {!advice && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Layout className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">LCP (Loading)</h4>
            <p className="text-sm text-gray-600">Thời gian hiển thị nội dung chính lớn nhất. Nên dưới 2.5s.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">FID / INP (Interactivity)</h4>
            <p className="text-sm text-gray-600">Độ trễ phản hồi khi người dùng tương tác. Nên dưới 200ms.</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Server className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">CLS (Stability)</h4>
            <p className="text-sm text-gray-600">Độ ổn định của giao diện khi tải trang. Nên dưới 0.1.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedAdvisor;