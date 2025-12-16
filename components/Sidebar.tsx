
import React, { useState, useEffect } from 'react';
import { NavGroup, ToolType } from '../types';
import { 
  LayoutDashboard, Sparkles, Search, Zap, Network, QrCode, 
  ChevronDown, ChevronRight, FileText, 
  Image as ImageIcon, BookOpen, Facebook, Eraser, Move, Palette, Aperture, List,
  ClipboardCheck, Megaphone, Calculator, Layout, PieChart, Presentation,
  Pipette, Link, TrendingUp, DollarSign, Activity, FileType, BarChartBig,
  Briefcase, PenTool, Rocket, LineChart, Wrench, Type, PanelLeftClose, PanelLeftOpen,
  Wifi, WifiOff, Settings, LogOut, Key
} from 'lucide-react';

interface SidebarProps {
  activeTool: ToolType;
  onSelect: (tool: ToolType) => void;
  isOpen: boolean; // Mobile open state
  isCollapsed?: boolean; // Desktop collapsed state
  toggleCollapse?: () => void;
  onOpenKeyModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onSelect, 
  isOpen, 
  isCollapsed = false,
  toggleCollapse,
  onOpenKeyModal
}) => {
  // Mặc định mở nhóm Chiến lược & Sáng tạo
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Chiến Lược & Kế Hoạch', 'Sáng Tạo & Content']);
  
  // Check API Key
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = () => {
       const key = process.env.API_KEY || localStorage.getItem('gemini_api_key');
       setHasApiKey(!!key);
    };
    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  const aiOnlyTools = [
    ToolType.PLAN_SLIDES,
    ToolType.ADS_STRUCTURE,
    ToolType.ADS_CONTENT,
    ToolType.META_GEN,
    ToolType.OUTLINE_GEN,
    ToolType.LANDING_LAYOUT,
    ToolType.SEO_GRADER,
    ToolType.SPEED_ADVISOR,
    ToolType.PLAGIARISM_CHECK
  ];

  const navGroups: NavGroup[] = [
    {
      title: 'Chiến Lược',
      items: [
        { id: ToolType.PLAN_SLIDES, label: 'Slide Kế Hoạch', icon: Presentation, description: 'Tạo slide MKT tự động' },
        { id: ToolType.BUDGET_PLANNER, label: 'Dự Tính Ngân Sách', icon: PieChart, description: 'Phân bổ ngân sách Ads' },
        { id: ToolType.ADS_STRUCTURE, label: 'Cấu Trúc Campaign', icon: Network, description: 'Sơ đồ chiến dịch' },
        { id: ToolType.ADS_CALCULATOR, label: 'Máy Tính KPI Ads', icon: Calculator, description: 'Tính ROAS/CPA mục tiêu' },
      ]
    },
    {
      title: 'Content & Ads',
      items: [
        { id: ToolType.ADS_CONTENT, label: 'Viết Content Ads', icon: Megaphone, description: 'Viết lời quảng cáo' },
        { id: ToolType.META_GEN, label: 'Tạo Meta SEO', icon: Sparkles, description: 'Viết Title & Desc' },
        { id: ToolType.OUTLINE_GEN, label: 'Dàn Ý Bài Viết', icon: List, description: 'Outline chuẩn SEO' },
        { id: ToolType.FB_CREATOR, label: 'Thiết Kế Ảnh FB', icon: Facebook, description: 'Post, Ads, Story' },
        { id: ToolType.BANNER_GEN, label: 'Tạo Banner Nhanh', icon: Palette, description: 'Cover & Thumbnail' },
        { id: ToolType.LANDING_LAYOUT, label: 'Layout Landing', icon: Layout, description: 'Gợi ý giao diện' },
      ]
    },
    {
      title: 'SEO & Web',
      items: [
        { id: ToolType.SEO_GRADER, label: 'Chấm Điểm SEO', icon: ClipboardCheck, description: 'Audit bài viết' },
        { id: ToolType.KEYWORD_CHECK, label: 'Mật Độ Từ Khóa', icon: Search, description: 'Check Keyword Stuffing' },
        { id: ToolType.SPEED_ADVISOR, label: 'Tư Vấn Tốc Độ', icon: Zap, description: 'Core Web Vitals' },
        { id: ToolType.SITEMAP_GEN, label: 'Tạo Sitemap XML', icon: Network, description: 'Sitemap cho Google' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { id: ToolType.CHART_GEN, label: 'Tạo Biểu Đồ', icon: BarChartBig, description: 'Vẽ chart báo cáo' },
        { id: ToolType.ROI_CALCULATOR, label: 'Tính Lãi Lỗ (P&L)', icon: TrendingUp, description: 'ROI thực tế' },
        { id: ToolType.COST_PER_RESULT, label: 'So Sánh Hiệu Quả', icon: DollarSign, description: 'So sánh kênh' },
        { id: ToolType.MINI_DASHBOARD, label: 'Báo Cáo Nhanh', icon: Activity, description: 'Daily Report' },
        { id: ToolType.UTM_BUILDER, label: 'UTM Builder', icon: Link, description: 'Tạo link tracking' },
      ]
    },
    {
      title: 'Tiện Ích',
      items: [
        { id: ToolType.FANCY_TEXT, label: 'Tạo Chữ Kiểu', icon: Type, description: 'YayText Generator' },
        { id: ToolType.QR_GEN, label: 'Tạo QR Code', icon: QrCode, description: 'Tạo mã QR' },
        { id: ToolType.URL_SHORTENER, label: 'Rút Gọn Link', icon: Link, description: 'Short link' },
        { id: ToolType.IMG_COMPRESS, label: 'Nén Ảnh', icon: ImageIcon, description: 'Giảm dung lượng' },
        { id: ToolType.BG_REMOVER, label: 'Xóa Nền Ảnh', icon: Eraser, description: 'Tách nền' },
        { id: ToolType.IMG_RESIZER, label: 'Resize & Watermark', icon: Move, description: 'Đổi kích thước' },
        { id: ToolType.IMG_FILTER, label: 'Bộ Lọc Màu', icon: Aperture, description: 'Chỉnh màu ảnh' },
        { id: ToolType.IMG_COLOR_PICKER, label: 'Lấy Mã Màu', icon: Pipette, description: 'Picker' },
        { id: ToolType.PDF_TO_WORD, label: 'PDF sang Word', icon: FileType, description: 'Convert PDF' },
        { id: ToolType.WORD_COUNTER, label: 'Đếm Từ', icon: FileText, description: 'Word Count' },
        { id: ToolType.PLAGIARISM_CHECK, label: 'Check Đạo Văn', icon: BookOpen, description: 'Kiểm tra văn phong' },
      ]
    }
  ];

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasApiKey || !aiOnlyTools.includes(item.id))
  })).filter(group => group.items.length > 0);

  const toggleGroup = (title: string) => {
    if (isCollapsed && toggleCollapse) {
        toggleCollapse();
        // Delay slighty to wait for expansion animation
        setTimeout(() => {
            if (!expandedGroups.includes(title)) {
                setExpandedGroups(prev => [...prev, title]);
            }
        }, 150);
        return;
    }

    setExpandedGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside 
        className={`
            fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-slate-400 
            transition-all duration-300 ease-in-out 
            border-r border-slate-800 shadow-2xl flex flex-col
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:relative md:translate-x-0 
            ${isCollapsed ? 'w-[4.5rem]' : 'w-72'}
        `}
    >
      {/* 1. Header Section */}
      <div className={`
          h-16 flex items-center border-b border-slate-800/80 bg-[#0f172a]
          ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}
      `}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
                <span className="text-sm font-bold text-white tracking-wide leading-none">MarketingOS</span>
                <span className="text-[10px] text-slate-500 font-medium mt-1">All-in-one Toolkit</span>
            </div>
          )}
        </div>
        
        {/* Toggle Button (Desktop Only) */}
        {!isCollapsed && (
            <button 
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
                <PanelLeftClose size={18} />
            </button>
        )}
      </div>

      {/* 2. Navigation Area */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar scroll-smooth">
        
        {/* Dashboard Link (Always Top) */}
        <div>
            <button
              onClick={() => onSelect(ToolType.DASHBOARD)}
              className={`
                group w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 mb-1 relative
                ${activeTool === ToolType.DASHBOARD 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                  : 'hover:bg-slate-800/50 hover:text-slate-200 text-slate-400'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Dashboard"
            >
              <LayoutDashboard size={20} className={`flex-shrink-0 ${activeTool === ToolType.DASHBOARD ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {!isCollapsed && <span className="ml-3 font-semibold text-sm">Tổng quan</span>}
              
              {/* Tooltip for collapsed */}
              {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                      Tổng quan
                  </div>
              )}
            </button>
        </div>

        {/* Dynamic Groups */}
        {filteredGroups.map((group, groupIdx) => {
          const isExpanded = expandedGroups.includes(group.title);
          
          return (
            <div key={group.title} className="relative">
              {/* Group Header (Only visible if not collapsed or just a separator) */}
              {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors group mb-1"
                  >
                    <span>{group.title}</span>
                    <span className="text-slate-600 group-hover:text-slate-400 transition-colors">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>
              ) : (
                  // Separator for collapsed mode
                  <div className="w-8 h-px bg-slate-800 mx-auto mb-3 mt-1"></div>
              )}
              
              {/* Group Items */}
              <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed && isExpanded ? 'max-h-[1000px] opacity-100' : (!isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100')}`}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTool === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={`
                        group w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative
                        ${isActive 
                          ? 'bg-slate-800 text-white font-medium shadow-sm' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      {/* Active Indicator Strip */}
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
                      
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      
                      {!isCollapsed && <span className="ml-3 text-sm truncate">{item.label}</span>}

                      {/* Tooltip for Collapsed Mode */}
                      {isCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700 min-w-max">
                              <div className="font-bold mb-0.5">{item.label}</div>
                              <div className="text-slate-400 text-[10px]">{item.description}</div>
                          </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* 3. Footer Section (Collapsed Toggle + API Status) */}
      <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          {/* Status Indicator */}
          {!isCollapsed ? (
              <div className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg mb-2 border transition-colors
                  ${hasApiKey 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }
              `}>
                  <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      <span className="text-xs font-bold">{hasApiKey ? 'AI Connected' : 'Offline Mode'}</span>
                  </div>
              </div>
          ) : (
              // Collapsed Status Dot
              <div className="flex justify-center mb-4">
                  <div className={`w-3 h-3 rounded-full border-2 border-[#0f172a] ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} title={hasApiKey ? 'AI Connected' : 'Offline Mode'}></div>
              </div>
          )}

          {/* Config Button */}
          <button 
            onClick={onOpenKeyModal}
            className={`
                w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${hasApiKey ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'}
                ${isCollapsed ? 'justify-center' : 'gap-3'}
            `}
            title="Cấu hình API Key"
          >
             <Settings size={20} className={!hasApiKey && !isCollapsed ? 'animate-spin-slow' : ''} />
             {!isCollapsed && <span className="font-semibold text-sm">Cài đặt API</span>}
          </button>

          {/* Expand Button (Mobile Only or Collapsed State Helper) */}
          {isCollapsed && (
              <button 
                  onClick={toggleCollapse}
                  className="mt-4 w-full flex items-center justify-center p-2 text-slate-500 hover:text-white transition-colors"
              >
                  <PanelLeftOpen size={20} />
              </button>
          )}
      </div>
    </aside>
  );
};

export default Sidebar;
