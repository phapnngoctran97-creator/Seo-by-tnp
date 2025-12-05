import React from 'react';
import { ToolType } from '../types';
import { Sparkles, Search, Zap, Network, QrCode, ArrowRight, FileText, Image as ImageIcon, FileType, BookOpen } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tool: ToolType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const seoTools = [
    { id: ToolType.META_GEN, title: 'Tạo Meta Description', desc: 'AI tạo mô tả chuẩn SEO.', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: ToolType.KEYWORD_CHECK, title: 'Check Trùng Từ Khóa', desc: 'Phân tích mật độ từ khóa.', icon: Search, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: ToolType.SPEED_ADVISOR, title: 'Tối Ưu Tốc Độ', desc: 'Tư vấn Core Web Vitals.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: ToolType.SITEMAP_GEN, title: 'Tạo Sitemap XML', desc: 'Tạo file sitemap cho Google.', icon: Network, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: ToolType.QR_GEN, title: 'Tạo QR Code', desc: 'Mã QR cho Website/WiFi.', icon: QrCode, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const textTools = [
    { id: ToolType.PDF_TOOLS, title: 'Công cụ PDF', desc: 'Chuyển đổi & Ghép file PDF.', icon: FileType, color: 'text-red-600', bg: 'bg-red-50' },
    { id: ToolType.IMG_COMPRESS, title: 'Nén Ảnh', desc: 'Giảm dung lượng JPG/PNG.', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: ToolType.WORD_COUNTER, title: 'Đếm Từ & Ký Tự', desc: 'Thống kê chi tiết văn bản.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.PLAGIARISM_CHECK, title: 'Kiểm Tra Đạo Văn', desc: 'Phân tích tính nguyên bản AI.', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const renderCard = (card: any) => {
    const Icon = card.icon;
    return (
        <button
          key={card.id}
          onClick={() => onNavigate(card.id)}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all text-left group flex flex-col h-full"
        >
          <div className={`${card.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
            <Icon className={`${card.color} w-5 h-5`} />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
          <p className="text-sm text-gray-500 mb-4 flex-1">{card.desc}</p>
          <div className="flex items-center text-xs font-medium text-indigo-500 gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Dùng ngay <ArrowRight className="w-3 h-3" />
          </div>
        </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h2>
        <p className="text-gray-600">Bộ công cụ SEO & Xử lý văn bản tất cả trong một.</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Công Cụ SEO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {seoTools.map(renderCard)}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Công Cụ Văn Bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {textTools.map(renderCard)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;