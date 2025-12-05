import React, { useState } from 'react';
import { ToolType } from '../types';
import { 
  Sparkles, Search, Zap, Network, QrCode, ArrowRight, 
  FileText, Image as ImageIcon, BookOpen, X,
  Crop, Eraser, Move, Palette, Aperture, LayoutGrid, Type, ImagePlus, List
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tool: ToolType) => void;
}

interface ToolItem {
  id: ToolType;
  title: string;
  desc: string;
  icon: any;
  color: string;
  bg: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  tools: ToolItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const seoTools: ToolItem[] = [
    { id: ToolType.META_GEN, title: 'Tạo Meta Description', desc: 'AI tạo mô tả chuẩn SEO.', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: ToolType.OUTLINE_GEN, title: 'Tạo Dàn Ý SEO', desc: 'Lập dàn ý & Gợi ý từ khóa.', icon: List, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: ToolType.KEYWORD_CHECK, title: 'Check Trùng Từ Khóa', desc: 'Phân tích mật độ từ khóa.', icon: Search, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: ToolType.SPEED_ADVISOR, title: 'Tối Ưu Tốc Độ', desc: 'Tư vấn Core Web Vitals.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: ToolType.SITEMAP_GEN, title: 'Tạo Sitemap XML', desc: 'Tạo file sitemap cho Google.', icon: Network, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: ToolType.QR_GEN, title: 'Tạo QR Code', desc: 'Mã QR cho Website/WiFi.', icon: QrCode, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const graphicTools: ToolItem[] = [
    { id: ToolType.IMG_COMPRESS, title: 'Nén Ảnh Pro', desc: 'Giảm dung lượng hàng loạt.', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: ToolType.AVATAR_MAKER, title: 'Tạo Avatar', desc: 'Cắt ảnh tròn/vuông.', icon: Crop, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: ToolType.BG_REMOVER, title: 'Xóa Nền Đơn Giản', desc: 'Tách nền theo màu.', icon: Eraser, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: ToolType.IMG_RESIZER, title: 'Resize & Watermark', desc: 'Đổi kích thước & Đóng dấu.', icon: Move, color: 'text-sky-600', bg: 'bg-sky-50' },
    { id: ToolType.BANNER_GEN, title: 'Tạo Banner', desc: 'FB/YouTube Cover.', icon: Palette, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: ToolType.IMG_FILTER, title: 'Bộ Lọc Màu', desc: 'Vintage, Trắng đen.', icon: Aperture, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  ];

  const textTools: ToolItem[] = [
    { id: ToolType.WORD_COUNTER, title: 'Đếm Từ & Ký Tự', desc: 'Thống kê chi tiết văn bản.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.PLAGIARISM_CHECK, title: 'Kiểm Tra Đạo Văn', desc: 'Phân tích tính nguyên bản AI.', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const categories: Category[] = [
    {
      id: 'seo',
      title: 'Công Cụ SEO',
      description: 'Tối ưu hóa công cụ tìm kiếm, tạo Sitemap, QR và kiểm tra từ khóa.',
      icon: Search,
      gradient: 'from-indigo-500 to-purple-600',
      tools: seoTools
    },
    {
      id: 'graphic',
      title: 'Đồ Họa & Hình Ảnh',
      description: 'Nén ảnh, cắt avatar, xóa nền, resize và tạo banner nhanh chóng.',
      icon: ImagePlus,
      gradient: 'from-pink-500 to-rose-500',
      tools: graphicTools
    },
    {
      id: 'text',
      title: 'Xử Lý Văn Bản',
      description: 'Các tiện ích đếm từ, kiểm tra văn phong và đạo văn.',
      icon: Type,
      gradient: 'from-blue-500 to-cyan-500',
      tools: textTools
    }
  ];

  const renderToolList = (tools: ToolItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left group flex items-start gap-4 h-full"
          >
            <div className={`${card.bg} w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110`}>
              <Icon className={`${card.color} w-6 h-6`} />
            </div>
            <div className="flex-1">
               <h3 className="text-sm font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
               <p className="text-xs text-gray-500 leading-relaxed mb-2">{card.desc}</p>
               <div className="flex items-center text-xs font-bold text-indigo-500 gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  Mở công cụ <ArrowRight className="w-3 h-3" />
               </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Bộ Công Cụ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">SEO Master</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tất cả công cụ bạn cần để tối ưu hóa Website, chỉnh sửa ảnh và xử lý nội dung.
          Chọn một danh mục bên dưới để bắt đầu.
        </p>
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-64 text-left"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
              
              <div className="relative p-8 h-full flex flex-col justify-between z-10 text-white">
                 <div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
                       <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{cat.title}</h2>
                    <p className="text-sm text-white/80 font-medium leading-relaxed">{cat.description}</p>
                 </div>
                 <div className="flex items-center gap-2 font-bold text-sm bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                    Xem {cat.tools.length} công cụ <ArrowRight className="w-4 h-4" />
                 </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-gray-500 text-sm">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <strong className="block text-xl text-gray-900 mb-1">{seoTools.length + graphicTools.length + textTools.length}</strong>
            Công cụ tích hợp
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <strong className="block text-xl text-gray-900 mb-1">AI</strong>
            Hỗ trợ Gemini 2.5
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <strong className="block text-xl text-gray-900 mb-1">100%</strong>
            Miễn phí sử dụng
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <strong className="block text-xl text-gray-900 mb-1">24/7</strong>
            Online & Nhanh chóng
         </div>
      </div>

      {/* Popup Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setSelectedCategory(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
             
             {/* Modal Header */}
             <div className={`p-6 bg-gradient-to-r ${selectedCategory.gradient} text-white flex justify-between items-center flex-shrink-0`}>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                      <selectedCategory.icon className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold">{selectedCategory.title}</h2>
                      <p className="text-xs text-white/80">Chọn một công cụ bên dưới để sử dụng</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
                >
                   <X className="w-5 h-5" />
                </button>
             </div>

             {/* Modal Content */}
             <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                {renderToolList(selectedCategory.tools)}
             </div>
             
             {/* Modal Footer */}
             <div className="p-4 border-t border-gray-200 bg-white text-right text-xs text-gray-500 flex-shrink-0">
                Nhấn ESC hoặc click ra ngoài để đóng
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;