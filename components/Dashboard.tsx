
import React, { useState, useEffect, useMemo } from 'react';
import { ToolType } from '../types';
import { 
  Sparkles, Search, Zap, Network, QrCode, ArrowRight, 
  FileText, Image as ImageIcon, BookOpen, X,
  Crop, Eraser, Move, Palette, Aperture, ImagePlus, List, Type,
  Clock, Timer, Users, Globe, Activity, ClipboardCheck,
  Megaphone, Target, Calculator, Layout, PieChart, Presentation, Pipette,
  BarChart3, Link, TrendingUp, DollarSign, History
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
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTools, setRecentTools] = useState<ToolItem[]>([]);

  // --- Real-time Stats State ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [onsiteSeconds, setOnsiteSeconds] = useState(0);
  const [userIp, setUserIp] = useState<string>('Đang tải...');
  const [activeUsers, setActiveUsers] = useState(142); 

  // --- DEFINING TOOLS DATA ---
  const adsTools: ToolItem[] = [
    { id: ToolType.ADS_STRUCTURE, title: 'Tạo Cấu Trúc Camp', desc: 'AI tạo sơ đồ chiến dịch.', icon: Network, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.ADS_CONTENT, title: 'Viết Content Ads', desc: 'Headline & Copywriting.', icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: ToolType.LANDING_LAYOUT, title: 'Layout Landing Page', desc: 'Gợi ý cấu trúc sales page.', icon: Layout, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: ToolType.PLAN_SLIDES, title: 'Tạo Slide Plan', desc: 'Làm Slide kế hoạch HTML.', icon: Presentation, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: ToolType.ADS_CALCULATOR, title: 'Máy Tính Ads', desc: 'Tính ROAS, CPA, CAC.', icon: Calculator, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: ToolType.BUDGET_PLANNER, title: 'Kế Hoạch Ngân Sách', desc: 'Dự tính chi tiêu.', icon: PieChart, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const analyticsTools: ToolItem[] = [
    { id: ToolType.ROI_CALCULATOR, title: 'Tính ROI & P&L', desc: 'Lãi lỗ thực tế & Đa kênh.', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { id: ToolType.COST_PER_RESULT, title: 'So Sánh CPR', desc: 'Cost Per Result đa kênh.', icon: DollarSign, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: ToolType.MINI_DASHBOARD, title: 'Báo Cáo Nhanh', desc: 'Dashboard & Target.', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: ToolType.UTM_BUILDER, title: 'UTM Builder', desc: 'Tạo UTM + Rút gọn + Excel.', icon: Link, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.URL_SHORTENER, title: 'Rút Gọn Link', desc: 'Tạo short-link miễn phí.', icon: Link, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const seoTools: ToolItem[] = [
    { id: ToolType.SEO_GRADER, title: 'Chấm Điểm SEO', desc: 'Chuẩn RankMath/Yoast.', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
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
    { id: ToolType.IMG_COLOR_PICKER, title: 'Lấy Mã Màu', desc: 'Palette & Eyedropper.', icon: Pipette, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  ];

  const textTools: ToolItem[] = [
    { id: ToolType.WORD_COUNTER, title: 'Đếm Từ & Ký Tự', desc: 'Thống kê chi tiết văn bản.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.PLAGIARISM_CHECK, title: 'Kiểm Tra Đạo Văn', desc: 'Phân tích tính nguyên bản AI.', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const allTools = useMemo(() => [
    ...adsTools, ...analyticsTools, ...seoTools, ...graphicTools, ...textTools
  ], []);

  const categories: Category[] = [
    {
      id: 'ads',
      title: 'Quảng Cáo (Ads)',
      description: 'Công cụ hỗ trợ Meta Ads, Google Ads: Cấu trúc, Content, Ngân sách.',
      icon: Megaphone,
      gradient: 'from-orange-500 to-red-600',
      tools: adsTools
    },
    {
      id: 'analytics',
      title: 'Phân Tích & Số Liệu',
      description: 'Đo lường hiệu quả Marketing, Tracking, Lãi lỗ và ROI.',
      icon: BarChart3,
      gradient: 'from-teal-500 to-emerald-600',
      tools: analyticsTools
    },
    {
      id: 'seo',
      title: 'Công Cụ SEO',
      description: 'Tối ưu hóa công cụ tìm kiếm, chấm điểm nội dung, tạo Sitemap.',
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

  // --- Search Logic ---
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQ = searchQuery.toLowerCase();
    return allTools.filter(t => 
      t.title.toLowerCase().includes(lowerQ) || 
      t.desc.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery, allTools]);

  // --- Effects ---
  useEffect(() => {
    // 1. Load Recent Tools
    const loadRecents = () => {
      try {
        const storedRecents = localStorage.getItem('recent_tools');
        if (storedRecents) {
          const ids: ToolType[] = JSON.parse(storedRecents);
          const matched = ids.map(id => allTools.find(t => t.id === id)).filter(Boolean) as ToolItem[];
          setRecentTools(matched);
        }
      } catch (e) { console.error(e); }
    };
    loadRecents();

    // 2. Stats Intervals
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    const storedStart = sessionStorage.getItem('sessionStartTime');
    let startTime = Date.now();
    if (storedStart) startTime = parseInt(storedStart);
    else sessionStorage.setItem('sessionStartTime', startTime.toString());

    const onsiteInterval = setInterval(() => {
      setOnsiteSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Không xác định'));

    const userInterval = setInterval(() => {
      setActiveUsers(prev => Math.max(50, prev + Math.floor(Math.random() * 5) - 2));
    }, 3000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(onsiteInterval);
      clearInterval(userInterval);
    };
  }, [allTools]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

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
      
      {/* Real-time Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={20} />
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">Thời gian thực</p>
              <p className="text-sm font-bold text-gray-800">{currentTime.toLocaleTimeString('vi-VN')}</p>
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
           <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Timer size={20} />
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">Thời gian Onsite</p>
              <p className="text-sm font-bold text-gray-800 font-mono">{formatDuration(onsiteSeconds)}</p>
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
           <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Globe size={20} />
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">IP Của Bạn</p>
              <p className="text-sm font-bold text-gray-800 truncate" title={userIp}>{userIp}</p>
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
           <div className="p-2 bg-orange-50 text-orange-600 rounded-lg relative">
              <Users size={20} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
           </div>
           <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">Đang Truy Cập</p>
              <p className="text-sm font-bold text-gray-800">{activeUsers}</p>
           </div>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Bộ Công Cụ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">SEO Master</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Tất cả công cụ bạn cần để tối ưu hóa Website, chỉnh sửa ảnh và xử lý nội dung.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group z-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
                type="text"
                className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-full leading-5 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                placeholder="Tìm kiếm công cụ (VD: xóa nền, nén ảnh, viết content...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>
            )}
        </div>
      </div>

      {/* SEARCH RESULTS MODE */}
      {searchQuery ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
             <h3 className="font-bold text-gray-700 mb-4 ml-1">Kết quả tìm kiếm cho "{searchQuery}"</h3>
             {filteredTools.length > 0 ? (
                 renderToolList(filteredTools)
             ) : (
                 <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Search className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>Không tìm thấy công cụ nào phù hợp.</p>
                 </div>
             )}
          </div>
      ) : (
        <>
          {/* RECENTLY USED SECTION */}
          {recentTools.length > 0 && (
             <div className="mb-10 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <History size={20} className="text-indigo-500" /> Gần đây
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {recentTools.map(tool => {
                       const Icon = tool.icon;
                       return (
                           <button
                             key={tool.id}
                             onClick={() => onNavigate(tool.id)}
                             className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 text-left"
                           >
                              <div className={`${tool.bg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                 <Icon className={`${tool.color} w-5 h-5`} />
                              </div>
                              <div className="min-w-0">
                                 <h4 className="font-bold text-sm text-gray-800 truncate">{tool.title}</h4>
                                 <p className="text-[10px] text-gray-500 truncate">Truy cập nhanh</p>
                              </div>
                           </button>
                       )
                   })}
                </div>
             </div>
          )}

          {/* MAIN CATEGORIES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  
                  <div className="relative p-6 h-full flex flex-col justify-between z-10 text-white">
                    <div>
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">{cat.title}</h2>
                        <p className="text-xs text-white/80 font-medium leading-relaxed line-clamp-3">{cat.description}</p>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-xs bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                        {cat.tools.length} công cụ <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-gray-500 text-sm">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <strong className="block text-xl text-gray-900 mb-1">{allTools.length}</strong>
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
