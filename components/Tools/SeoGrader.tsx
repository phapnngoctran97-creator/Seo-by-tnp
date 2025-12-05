import React, { useState, useRef, useEffect } from 'react';
import { gradeSeoContent, SeoScoreResult } from '../../services/geminiService';
import { ClipboardCheck, Link, Type, Image as ImageIcon, CheckCircle, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';

const SeoGrader: React.FC = () => {
  const [mode, setMode] = useState<'editor' | 'url'>('editor');
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<SeoScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [imgCount, setImgCount] = useState(0);

  // Helper to count basic stats client-side
  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const imgs = editorRef.current.getElementsByTagName('img');
    
    setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
    setImgCount(imgs.length);
  };

  useEffect(() => {
    updateStats();
  }, []);

  const handleAnalyze = async () => {
    if (!keyword.trim()) {
      alert("Vui lòng nhập từ khóa tập trung (Focus Keyword).");
      return;
    }

    let contentToAnalyze = '';
    
    if (mode === 'editor' && editorRef.current) {
       contentToAnalyze = editorRef.current.innerHTML;
       if (!editorRef.current.innerText.trim()) {
         alert("Vui lòng nhập hoặc dán nội dung bài viết.");
         return;
       }
    } else if (mode === 'url') {
       if (!url.trim()) {
         alert("Vui lòng nhập URL.");
         return;
       }
       // For URL mode, we pass the URL but also inform the user that pasting content is better
       contentToAnalyze = `Analyze URL: ${url}`;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await gradeSeoContent(contentToAnalyze, keyword, mode === 'url' ? url : undefined);
      setResult(data);
    } catch (error) {
      alert("Có lỗi xảy ra khi phân tích. Vui lòng kiểm tra API Key và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Color helper for score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 50) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="text-indigo-600" /> Chấm Điểm & Tối Ưu SEO
        </h2>
        <p className="text-gray-600 mt-1">Phân tích bài viết chuẩn RankMath/Yoast SEO. Hỗ trợ dán văn bản kèm hình ảnh.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: INPUT AREA */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full">
          
          {/* Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
             <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setMode('editor')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'editor' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                   <Type size={16} /> Nhập Nội Dung
                </button>
                <button 
                  onClick={() => setMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                   <Link size={16} /> Qua URL
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Từ khóa chính (Bắt buộc)</label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="VD: cách làm đẹp da"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                 </div>
                 {mode === 'url' && (
                   <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">URL Bài Viết</label>
                      <input 
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                   </div>
                 )}
             </div>
          </div>

          {/* Editor Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden relative">
             {mode === 'editor' ? (
                <>
                  <div className="p-2 border-b border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                     <span>Hỗ trợ dán văn bản và hình ảnh trực tiếp (Ctrl+V)</span>
                     <div className="flex gap-3">
                        <span className="flex items-center gap-1"><Type size={12} /> {wordCount} từ</span>
                        <span className="flex items-center gap-1"><ImageIcon size={12} /> {imgCount} ảnh</span>
                     </div>
                  </div>
                  <div 
                    ref={editorRef}
                    contentEditable
                    className="flex-1 p-6 overflow-y-auto outline-none prose max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                    data-placeholder="Dán toàn bộ nội dung bài viết (bao gồm cả hình ảnh) vào đây để chấm điểm..."
                    onInput={updateStats}
                  />
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50">
                   <Link className="w-16 h-16 mb-4 opacity-20" />
                   <p className="text-center max-w-md">
                     Nhập URL và Từ Khóa ở trên. <br/>
                     <span className="text-sm italic text-gray-400">(Lưu ý: Chế độ URL có thể không chính xác bằng việc dán trực tiếp nội dung nếu website chặn bot.)</span>
                   </p>
                </div>
             )}
             
             <div className="p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                   {loading ? <Loader2 className="animate-spin" /> : <ClipboardCheck />}
                   {loading ? 'Đang chấm điểm...' : 'Phân Tích SEO'}
                </button>
             </div>
          </div>

        </div>

        {/* RIGHT: RESULTS AREA */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">
              Kết Quả Đánh Giá
           </div>
           
           <div className="flex-1 overflow-y-auto p-6">
              {!result ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center mb-4 text-3xl font-bold text-gray-300">
                       --
                    </div>
                    <p>Kết quả sẽ hiển thị tại đây</p>
                 </div>
              ) : (
                 <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    
                    {/* Score Circle */}
                    <div className="flex justify-center">
                       <div className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${getScoreColor(result.score)}`}>
                          <span className="text-4xl font-extrabold">{result.score}</span>
                          <span className="text-xs font-medium uppercase text-gray-500">/100 Điểm</span>
                       </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                           <RefreshCw size={18} className="text-blue-500" /> Gợi ý tối ưu nhanh
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 space-y-2">
                            {result.suggestions.map((s, i) => (
                               <div key={i} className="flex gap-2">
                                  <span className="font-bold">•</span>
                                  <span>{s}</span>
                               </div>
                            ))}
                        </div>
                    </div>

                    {/* Checklists */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Chi tiết lỗi</h3>
                        
                        {result.criticalErrors.length > 0 && (
                           <div className="space-y-2">
                              {result.criticalErrors.map((err, i) => (
                                 <div key={i} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                    <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{err}</span>
                                 </div>
                              ))}
                           </div>
                        )}

                        {result.warnings.length > 0 && (
                           <div className="space-y-2">
                              {result.warnings.map((warn, i) => (
                                 <div key={i} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{warn}</span>
                                 </div>
                              ))}
                           </div>
                        )}

                        {result.goodPoints.length > 0 && (
                           <div className="space-y-2">
                              {result.goodPoints.map((good, i) => (
                                 <div key={i} className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{good}</span>
                                 </div>
                              ))}
                           </div>
                        )}
                    </div>

                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default SeoGrader;