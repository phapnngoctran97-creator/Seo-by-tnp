
import React, { useState } from 'react';
import { generateAdsContent } from '../../services/geminiService';
import { Megaphone, Copy, Check, Loader2 } from 'lucide-react';

const AdsContentGen: React.FC = () => {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [angle, setAngle] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!product || !audience) return;
    setLoading(true);
    setResult('');
    try {
      const data = await generateAdsContent(product, audience, angle);
      setResult(data);
    } catch (err) {
      setResult("Lỗi kết nối AI.");
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
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Megaphone className="text-orange-600" /> Tạo Nội Dung Quảng Cáo (Ads Copy)
        </h2>
        <p className="text-gray-600 mt-1">Viết Headline và Primary Text hấp dẫn cho Facebook/Google Ads.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="VD: Giày thể thao chạy bộ..."
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng (Audience)</label>
               <input 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="VD: Nam giới 25-35 tuổi, thích marathon..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Góc độ / Pain Point</label>
               <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="VD: Đau chân khi chạy, giày nhanh hỏng..."
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  rows={3}
               />
             </div>

             <button
              onClick={handleGenerate}
              disabled={loading || !product}
              className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all ${
                loading ? 'bg-orange-300' : 'bg-orange-600 hover:bg-orange-700 shadow-md'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Megaphone size={20} />}
              {loading ? 'Đang viết...' : 'Viết Quảng Cáo'}
            </button>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
           <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Các mẫu quảng cáo gợi ý</h3>
              {result && (
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs bg-white border px-2 py-1 rounded">
                   {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>} {copied ? 'Đã copy' : 'Copy'}
                </button>
              )}
           </div>
           <div className="flex-1 overflow-y-auto p-6 bg-white prose prose-orange max-w-none">
              {result ? (
                 <div className="whitespace-pre-wrap">{result}</div>
              ) : (
                 <div className="text-center text-gray-400 mt-20">
                    Nội dung sẽ hiển thị ở đây
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdsContentGen;
