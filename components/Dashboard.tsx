
import React, { useState, useEffect, useMemo } from 'react';
import { ToolType } from '../types';
import { 
  Sparkles, Search, Zap, Network, QrCode, ArrowRight, 
  FileText, Image as ImageIcon, BookOpen, X,
  Eraser, Move, Palette, Aperture, ImagePlus, List, Type,
  Clock, Timer, Users, Globe, Activity, ClipboardCheck,
  Megaphone, Target, Calculator, Layout, PieChart, Presentation, Pipette,
  BarChart3, Link, TrendingUp, DollarSign, History, Facebook, FileType, BarChartBig,
  Briefcase, Rocket, PenTool, Wrench, PlayCircle, Star, LineChart, AlertTriangle, Key
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tool: ToolType) => void;
  onOpenKeyModal: () => void;
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
  colorClass: string;
  tools: ToolItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenKeyModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTools, setRecentTools] = useState<ToolItem[]>([]);
  const [greeting, setGreeting] = useState('');

  // --- Real-time Stats ---
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Check API Key Status (Env or LocalStorage)
  const hasApiKey = !!process.env.API_KEY || (typeof window !== 'undefined' && !!localStorage.getItem('gemini_api_key'));
  
  // --- DEFINING TOOLS DATA (Grouped by Marketing Function) ---
  
  const strategyTools: ToolItem[] = [
    { id: ToolType.PLAN_SLIDES, title: 'Tạo Slide Kế Hoạch', desc: 'AI làm slide từ dữ liệu thô.', icon: Presentation, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: ToolType.BUDGET_PLANNER, title: 'Lập Ngân Sách', desc: 'Dự tính chi phí đa kênh.', icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.ADS_STRUCTURE, title: 'Cấu Trúc Ads', desc: 'Sơ đồ chiến dịch tối ưu.', icon: Network, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: ToolType.ADS_CALCULATOR, title: 'Máy Tính KPI', desc: 'Tính ROAS, CPA, CAC.', icon: Calculator, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  const creativeTools: ToolItem[] = [
    { id: ToolType.ADS_CONTENT, title: 'Viết Content Ads', desc: 'Headline & Copywriting.', icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: ToolType.FB_CREATOR, title: 'Thiết Kế Ảnh FB', desc: 'Post, Story, Ads studio.', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.BANNER_GEN, title: 'Tạo Banner Nhanh', desc: 'Cover & Thumbnail.', icon: Palette, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: ToolType.META_GEN, title: 'Tạo Meta SEO', desc: 'Title & Desc chuẩn SEO.', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: ToolType.OUTLINE_GEN, title: 'Dàn Ý Bài Viết', desc: 'Outline & Keyword LSI.', icon: List, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: ToolType.LANDING_LAYOUT, title: 'Layout Landing', desc: 'Gợi ý cấu trúc Sales Page.', icon: Layout, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  const growthTools: ToolItem[] = [
    { id: ToolType.SEO_GRADER, title: 'Chấm Điểm SEO', desc: 'Audit On-page Content.', icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { id: ToolType.KEYWORD_CHECK, title: 'Check Từ Khóa', desc: 'Kiểm tra mật độ.', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.SPEED_ADVISOR, title: 'Tư Vấn Tốc Độ', desc: 'Core Web Vitals.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: ToolType.SITEMAP_GEN, title: 'Tạo Sitemap', desc: 'XML cho Google.', icon: Network, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const performanceTools: ToolItem[] = [
    { id: ToolType.CHART_GEN, title: 'Tạo Biểu Đồ', desc: 'Vẽ chart báo cáo.', icon: BarChartBig, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: ToolType.ROI_CALCULATOR, title: 'Tính P&L / ROI', desc: 'Lãi lỗ thực tế.', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { id: ToolType.COST_PER_RESULT, title: 'So Sánh Kênh', desc: 'Tìm kênh rẻ nhất.', icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: ToolType.MINI_DASHBOARD, title: 'Báo Cáo Nhanh', desc: 'Daily Report Template.', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: ToolType.UTM_BUILDER, title: 'UTM Tracking', desc: 'Tạo link đo lường.', icon: Link, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const utilityTools: ToolItem[] = [
    { id: ToolType.FANCY_TEXT, title: 'Tạo Chữ Kiểu', desc: 'YayText Generator.', icon: Type, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { id: ToolType.QR_GEN, title: 'Tạo QR Code', desc: 'Link, WiFi, Contact.', icon: QrCode, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: ToolType.URL_SHORTENER, title: 'Rút Gọn Link', desc: 'TinyURL service.', icon: Link, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: ToolType.IMG_COMPRESS, title: 'Nén Ảnh', desc: 'Giảm dung lượng.', icon: ImageIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: ToolType.BG_REMOVER, title: 'Xóa Nền', desc: 'Tách nền màu.', icon: Eraser, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: ToolType.IMG_RESIZER, title: 'Resize Ảnh', desc: 'Đổi kích thước.', icon: Move, color: 'text-slate-600', bg: 'bg-slate-100' },
    { id: ToolType.PDF_TO_WORD, title: 'PDF to Word', desc: 'Convert văn bản.', icon: FileType, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const allTools = useMemo(() => [
    ...strategyTools, ...creativeTools, ...growthTools, ...performanceTools, ...utilityTools
  ], []);

  const categories: Category[] = [
    { id: 'strategy', title: 'Chiến Lược & Kế Hoạch', description: 'Đặt nền móng vững chắc cho chiến dịch.', icon: Briefcase, colorClass: 'text-indigo-600', tools: strategyTools },
    { id: 'creative', title: 'Sáng Tạo & Content', description: 'Sản xuất nội dung thu hút khách hàng.', icon: PenTool, colorClass: 'text-pink-600', tools: creativeTools },
    { id: 'performance', title: 'Hiệu Suất & Dữ Liệu', description: 'Đo lường, tối ưu và báo cáo kết quả.', icon: LineChart, colorClass: 'text-blue-600', tools: performanceTools },
    { id: 'growth', title: 'SEO & Tăng Trưởng', description: 'Tối ưu hóa công cụ tìm kiếm.', icon: Rocket, colorClass: 'text-emerald-600', tools: growthTools },
    { id: 'utility', title: 'Công Cụ Tiện Ích', description: 'Xử lý tác vụ nhanh gọn.', icon: Wrench, colorClass: 'text-slate-600', tools: utilityTools },
  ];

  // --- Logic ---
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQ = searchQuery.toLowerCase();
    return allTools.filter(t => 
      t.title.toLowerCase().includes(lowerQ) || 
      t.desc.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery, allTools]);

  useEffect(() => {
    // Recent Tools
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

    // Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(clockInterval);
  }, [allTools]);

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 md:px-8">
      
      {/* HEADER SECTION */}
      <div className="py-8 flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
           <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${hasApiKey ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {hasApiKey ? 'AI Online' : 'Offline Mode'}
              </span>
              <span>{currentTime.toLocaleDateString('vi-VN', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
           </div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
             {greeting}, Marketer! 👋
           </h1>
           <p className="text-gray-600 mt-2">Bạn muốn bắt đầu công việc gì hôm nay?</p>
        </div>

        {/* SEARCH BAR */}
        <div className="w-full md:w-96 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
                type="text"
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Tìm công cụ (VD: viết bài, nén ảnh...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            )}
        </div>
      </div>

      {/* MISSING KEY BANNER */}
      {!hasApiKey && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between animate-in slide-in-from-top-4 shadow-sm gap-4">
              <div className="flex items-center gap-4">
                  <div className="bg-amber-100 p-2.5 rounded-lg text-amber-600 shrink-0">
                      <AlertTriangle size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-amber-800 text-sm md:text-base">Chưa cấu hình API Key</h3>
                      <p className="text-sm text-amber-700 mt-0.5">
                          Các tính năng AI (Viết bài, Tạo slide, SEO...) đang bị ẩn. 
                      </p>
                  </div>
              </div>
              <button 
                onClick={onOpenKeyModal}
                className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Key size={16} /> Nhập Key Ngay
              </button>
          </div>
      )}

      {/* SEARCH RESULTS MODE */}
      {searchQuery ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
             <h3 className="font-bold text-gray-800 mb-4 text-lg">Kết quả tìm kiếm cho "{searchQuery}"</h3>
             {filteredTools.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} onClick={() => onNavigate(tool.id)} />
                    ))}
                 </div>
             ) : (
                 <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Không tìm thấy công cụ nào phù hợp.</p>
                 </div>
             )}
          </div>
      ) : (
        <div className="space-y-10">
          
          {/* 1. RECENT TOOLS (If any) */}
          {recentTools.length > 0 && (
             <section className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
                        <History size={16} />
                    </div>
                    <h3 className="font-bold text-gray-800">Gần đây</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                   {recentTools.map(tool => (
                       <button
                         key={tool.id}
                         onClick={() => onNavigate(tool.id)}
                         className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group h-full"
                       >
                          <div className={`${tool.bg} w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                             <tool.icon className={`${tool.color} w-5 h-5`} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 line-clamp-1">{tool.title}</span>
                       </button>
                   ))}
                </div>
             </section>
          )}

          {/* 2. MAIN CATEGORIES */}
          <div className="grid grid-cols-1 gap-10">
             {categories.map((cat, idx) => (
                 <section key={cat.id} className="animate-in fade-in slide-in-from-bottom-4" style={{animationDelay: `${idx * 100}ms`}}>
                     <div className="flex items-start gap-4 mb-5">
                         <div className={`p-3 rounded-xl bg-white shadow-sm border border-gray-100 ${cat.colorClass}`}>
                             <cat.icon size={24} />
                         </div>
                         <div>
                             <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                             <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                         </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                         {cat.tools.map(tool => (
                             <ToolCard key={tool.id} tool={tool} onClick={() => onNavigate(tool.id)} />
                         ))}
                     </div>
                 </section>
             ))}
          </div>

        </div>
      )}
    </div>
  );
};

// Reusable Card Component
const ToolCard: React.FC<{ tool: ToolItem, onClick: () => void }> = ({ tool, onClick }) => {
    const Icon = tool.icon;
    return (
        <button
            onClick={onClick}
            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 text-left group relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <ArrowRight size={16} className="text-gray-300" />
            </div>
            <div className={`${tool.bg} w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className={`${tool.color} w-6 h-6`} />
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{tool.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{tool.desc}</p>
            </div>
        </button>
    );
}

export default Dashboard;
