import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, RotateCcw, FileText } from 'lucide-react';
import { KeywordData } from '../../types';

const KeywordChecker: React.FC = () => {
  const [text, setText] = useState('');
  
  const analyzeKeywords = useMemo(() => {
    if (!text.trim()) return [];

    // Basic Vietnamese stop words to filter out noise
    const stopWords = new Set([
      'và', 'của', 'là', 'có', 'được', 'cho', 'trong', 'một', 'các', 'với', 'không', 'những', 'để', 'này', 'khi', 'đã', 'sẽ', 'tại', 'cũng', 'theo', 'như', 'từ', 'về', 'người', 'ra', 'đến', 'vào', 'làm', 'hay', 'nhưng', 'bạn', 'tôi', 'rất', 'cái', 'đó'
    ]);

    // Normalize text: lowercase, remove special chars
    const cleanText = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "").replace(/\s{2,}/g, " ");
    const words = cleanText.split(' ');
    const totalWords = words.length;
    const frequency: Record<string, number> = {};

    words.forEach(word => {
      if (word.length > 1 && !stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    const data: KeywordData[] = Object.keys(frequency).map(word => ({
      word,
      count: frequency[word],
      density: parseFloat(((frequency[word] / totalWords) * 100).toFixed(2))
    }));

    // Sort by count desc and take top 10
    return data.sort((a, b) => b.count - a.count).slice(0, 10);
  }, [text]);

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="text-orange-500" /> Kiểm Tra Mật Độ Từ Khóa
        </h2>
        <p className="text-gray-600 mt-2">Phân tích văn bản để tìm các từ khóa lặp lại quá nhiều (Keyword Stuffing).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">Nội dung bài viết</label>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">
              <FileText className="w-3 h-3" /> {wordCount} từ
            </span>
          </div>
          <textarea
            className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
            placeholder="Dán nội dung bài viết của bạn vào đây để kiểm tra..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setText('')}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Xóa nội dung
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           {/* Chart Section */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Từ Khóa Xuất Hiện</h3>
              {analyzeKeywords.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyzeKeywords} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="word" type="category" width={80} tick={{fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}>
                        {analyzeKeywords.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.density > 2.5 ? '#ef4444' : '#f97316'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Chưa có dữ liệu phân tích
                </div>
              )}
           </div>

           {/* Warnings Section */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto">
             <h3 className="text-lg font-semibold text-gray-800 mb-2">Cảnh báo SEO</h3>
             <ul className="space-y-2">
                {analyzeKeywords.length === 0 && <li className="text-gray-500 text-sm">Nhập văn bản để xem phân tích.</li>}
                {analyzeKeywords.filter(k => k.density > 2.5).map((k, i) => (
                  <li key={i} className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-start gap-2">
                    <span className="font-bold mt-0.5">!</span>
                    Từ khóa "{k.word}" xuất hiện {k.count} lần ({k.density}%), có thể bị coi là spam từ khóa (Khuyến nghị {'<'} 2.5%).
                  </li>
                ))}
                {analyzeKeywords.length > 0 && analyzeKeywords.every(k => k.density <= 2.5) && (
                  <li className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                    <Check className="w-4 h-4" /> Mật độ từ khóa ổn định.
                  </li>
                )}
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

// Simple check icon for the warning section
const Check = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default KeywordChecker;