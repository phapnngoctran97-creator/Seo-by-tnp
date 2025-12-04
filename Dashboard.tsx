import React from 'react';
import { ToolType } from '../types';
import { Sparkles, Search, Zap, Network, QrCode, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tool: ToolType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const cards = [
    { id: ToolType.META_GEN, title: 'Tạo Meta Description', desc: 'Sử dụng AI tạo mô tả chuẩn SEO tăng tỷ lệ click.', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: ToolType.KEYWORD_CHECK, title: 'Check Trùng Từ Khóa', desc: 'Phát hiện spam từ khóa và phân tích mật độ.', icon: Search, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: ToolType.SPEED_ADVISOR, title: 'Tối Ưu Tốc Độ', desc: 'Nhận tư vấn cải thiện Core Web Vitals từ chuyên gia AI.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: ToolType.SITEMAP_GEN, title: 'Tạo Sitemap XML', desc: 'Tạo file sitemap gửi Google Search Console.', icon: Network, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: ToolType.QR_GEN, title: 'Tạo QR Code', desc: 'Tạo mã QR cho link website hoặc danh thiếp.', icon: QrCode, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Chào mừng trở lại!</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Bộ công cụ toàn diện giúp doanh nghiệp nhỏ tối ưu hóa sự hiện diện trực tuyến, cải thiện SEO và tăng trưởng marketing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all text-left group"
            >
              <div className={`${card.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <Icon className={`${card.color} w-6 h-6`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
              <p className="text-sm text-gray-500 mb-4 h-10">{card.desc}</p>
              <div className="flex items-center text-sm font-medium text-indigo-500 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Dùng ngay <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;