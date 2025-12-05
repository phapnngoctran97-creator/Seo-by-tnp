import React, { useState, useMemo } from 'react';
import { FileText, AlignLeft, Type, Quote, Trash2 } from 'lucide-react';

const WordCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0 };

    return {
      words: trimmed.split(/\s+/).length,
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, '').length,
      sentences: text.split(/[.!?]+/).filter(Boolean).length,
      paragraphs: text.split(/\n+/).filter(Boolean).length
    };
  }, [text]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" /> Đếm Từ & Ký Tự
        </h2>
        <p className="text-gray-600 mt-2">Công cụ thống kê số lượng từ, ký tự, câu và đoạn văn chính xác.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-600">{stats.words}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold mt-1">Số từ</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-indigo-600">{stats.chars}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold mt-1">Ký tự</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-teal-600">{stats.sentences}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold mt-1">Số câu</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-orange-600">{stats.paragraphs}</span>
            <span className="text-xs text-gray-500 uppercase font-semibold mt-1">Đoạn văn</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
        <textarea
          className="w-full h-80 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-base leading-relaxed"
          placeholder="Nhập hoặc dán văn bản của bạn vào đây..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="absolute top-8 right-8 flex gap-2">
            <button 
                onClick={() => setText('')}
                className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                title="Xóa hết"
            >
                <Trash2 size={18} />
            </button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
                <Type size={14} /> Ký tự (không khoảng trắng): <span className="font-semibold text-gray-800">{stats.charsNoSpace}</span>
            </div>
            <div className="flex items-center gap-1">
                <AlignLeft size={14} /> Tốc độ đọc ước tính: <span className="font-semibold text-gray-800">{Math.ceil(stats.words / 200)} phút</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WordCounter;