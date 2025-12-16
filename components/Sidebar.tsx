
import React, { useState } from 'react';
import { NavGroup, ToolType } from '../types';
import { 
  LayoutDashboard, Sparkles, Search, Zap, Network, QrCode, 
  ChevronDown, ChevronRight, FileText, 
  Image as ImageIcon, BookOpen, Facebook, Eraser, Move, Palette, Aperture, List,
<<<<<<< HEAD
  ClipboardCheck, Megaphone, Calculator, Layout, PieChart, Presentation,
  Pipette, Link, TrendingUp, DollarSign, Activity, FileType, BarChartBig,
  Briefcase, PenTool, Rocket, LineChart, Wrench, Type, PanelLeftClose, PanelLeftOpen,
  Wifi, WifiOff
=======
  ClipboardCheck, Megaphone, Target, Calculator, Layout, PieChart, Presentation,
  Pipette, Link, BarChart3, TrendingUp, DollarSign, Activity, FileType, BarChartBig,
  Briefcase, PenTool, Rocket, LineChart, Wrench, Type, PanelLeftClose, PanelLeftOpen
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
} from 'lucide-react';

interface SidebarProps {
  activeTool: ToolType;
  onSelect: (tool: ToolType) => void;
  isOpen: boolean; // Mobile open state
  isCollapsed?: boolean; // Desktop collapsed state
  toggleCollapse?: () => void;
<<<<<<< HEAD
=======
  onOpenSettings: () => void;
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onSelect, 
  isOpen, 
  isCollapsed = false,
<<<<<<< HEAD
  toggleCollapse
=======
  toggleCollapse,
  onOpenSettings 
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
}) => {
  // Mặc định mở nhóm Chiến lược & Sáng tạo để user dễ tiếp cận
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Chiến Lược & Kế Hoạch', 'Sáng Tạo & Content']);

<<<<<<< HEAD
  // Kiểm tra API Key từ biến môi trường
  const hasApiKey = !!process.env.API_KEY;

  // Danh sách các công cụ bắt buộc phải có API Key mới chạy được
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

=======
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
  // Cấu trúc lại theo Workflow của Marketer
  const navGroups: NavGroup[] = [
    {
      title: 'Chiến Lược & Kế Hoạch',
      items: [
        { id: ToolType.PLAN_SLIDES, label: 'Slide Kế Hoạch', icon: Presentation, description: 'Tạo slide MKT tự động' },
        { id: ToolType.BUDGET_PLANNER, label: 'Dự Tính Ngân Sách', icon: PieChart, description: 'Phân bổ ngân sách Ads' },
        { id: ToolType.ADS_STRUCTURE, label: 'Cấu Trúc Campaign', icon: Network, description: 'Sơ đồ chiến dịch' },
        { id: ToolType.ADS_CALCULATOR, label: 'Máy Tính KPI Ads', icon: Calculator, description: 'Tính ROAS/CPA mục tiêu' },
      ]
    },
    {
      title: 'Sáng Tạo & Content',
      items: [
        { id: ToolType.ADS_CONTENT, label: 'Viết Content Ads', icon: Megaphone, description: 'Viết lời quảng cáo' },
        { id: ToolType.META_GEN, label: 'Tạo Meta SEO', icon: Sparkles, description: 'Viết Title & Desc' },
        { id: ToolType.OUTLINE_GEN, label: 'Dàn Ý Bài Viết', icon: List, description: 'Outline chuẩn SEO' },
        { id: ToolType.FB_CREATOR, label: 'Thiết Kế Ảnh FB', icon: Facebook, description: 'Post, Ads, Story' },
        { id: ToolType.BANNER_GEN, label: 'Tạo Banner Nhanh', icon: Palette, description: 'Cover & Thumbnail' },
        { id: ToolType.LANDING_LAYOUT, label: 'Layout Landing Page', icon: Layout, description: 'Gợi ý giao diện' },
      ]
    },
    {
      title: 'SEO & Tăng Trưởng',
      items: [
        { id: ToolType.SEO_GRADER, label: 'Chấm Điểm SEO', icon: ClipboardCheck, description: 'Audit bài viết' },
        { id: ToolType.KEYWORD_CHECK, label: 'Mật Độ Từ Khóa', icon: Search, description: 'Check Keyword Stuffing' },
        { id: ToolType.SPEED_ADVISOR, label: 'Tư Vấn Tốc Độ', icon: Zap, description: 'Core Web Vitals' },
        { id: ToolType.SITEMAP_GEN, label: 'Tạo Sitemap XML', icon: Network, description: 'Sitemap cho Google' },
      ]
    },
    {
      title: 'Hiệu Suất & Dữ Liệu',
      items: [
        { id: ToolType.CHART_GEN, label: 'Tạo Biểu Đồ', icon: BarChartBig, description: 'Vẽ chart báo cáo' },
        { id: ToolType.ROI_CALCULATOR, label: 'Tính Lãi Lỗ (P&L)', icon: TrendingUp, description: 'ROI thực tế' },
        { id: ToolType.COST_PER_RESULT, label: 'So Sánh Hiệu Quả', icon: DollarSign, description: 'So sánh kênh' },
        { id: ToolType.MINI_DASHBOARD, label: 'Báo Cáo Nhanh', icon: Activity, description: 'Daily Report' },
        { id: ToolType.UTM_BUILDER, label: 'UTM Builder', icon: Link, description: 'Tạo link tracking' },
      ]
    },
    {
      title: 'Công Cụ Tiện Ích',
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

  // Lọc các group để ẩn công cụ AI nếu không có Key
  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasApiKey || !aiOnlyTools.includes(item.id))
  })).filter(group => group.items.length > 0);

  const toggleGroup = (title: string) => {
    // If sidebar is collapsed, expanding a group should also expand the sidebar for better UX
    if (isCollapsed && toggleCollapse) {
        toggleCollapse();
        // Ensure the group we clicked is added to expanded list if not already
        if (!expandedGroups.includes(title)) {
            setExpandedGroups(prev => [...prev, title]);
        }
        return;
    }

    setExpandedGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // Helper to map icons to group titles for the header
  const getGroupIcon = (title: string) => {
    if (title.includes('Chiến Lược')) return Briefcase;
    if (title.includes('Sáng Tạo')) return PenTool;
    if (title.includes('Tăng Trưởng')) return Rocket;
    if (title.includes('Hiệu Suất')) return LineChart;
    return Wrench;
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-slate-300 transform transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 
        ${isCollapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800 bg-[#0f172a] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Sparkles size={18} fill="currentColor" />
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap transition-opacity duration-200">
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                MarketingOS
                </h1>
                <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wider">All-in-one Toolkit</p>
            </div>
          )}
        </div>
        
        {/* Desktop Toggle Button */}
        <button 
            onClick={toggleCollapse}
            className={`hidden md:flex p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-colors ${isCollapsed ? 'absolute -right-3 top-12 bg-slate-700 border border-slate-600 shadow-md' : ''}`}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar overflow-x-hidden">
        <button
          onClick={() => onSelect(ToolType.DASHBOARD)}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 mb-6 group whitespace-nowrap
            ${activeTool === ToolType.DASHBOARD
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
              : 'hover:bg-slate-800 hover:text-white'
            }
            ${isCollapsed ? 'justify-center' : 'gap-3'}
          `}
          title={isCollapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard className={`flex-shrink-0 ${activeTool === ToolType.DASHBOARD ? 'text-white' : 'text-slate-400 group-hover:text-white'} ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
          {!isCollapsed && <span className="font-semibold text-sm">Dashboard</span>}
        </button>

<<<<<<< HEAD
        {filteredGroups.map((group) => {
=======
        {navGroups.map((group) => {
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
          const GroupIcon = getGroupIcon(group.title);
          const isExpanded = expandedGroups.includes(group.title);
          
          return (
            <div key={group.title} className="mb-4">
              <button
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors mb-1 whitespace-nowrap
                    ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'}
                `}
                title={isCollapsed ? group.title : ""}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
                   <GroupIcon size={isCollapsed ? 18 : 14} className={isCollapsed ? "text-slate-400" : ""} />
                   {!isCollapsed && <span>{group.title}</span>}
                </div>
                {!isCollapsed && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </button>
              
              <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-200 relative group whitespace-nowrap
                        ${isActive 
                          ? 'bg-slate-800 text-white font-medium' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }
                        ${isCollapsed ? 'justify-center' : 'gap-3'}
                      `}
                      title={isCollapsed ? item.label : ""}
                    >
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full"></div>}
                      <Icon className={`transition-colors flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                      {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

<<<<<<< HEAD
      {/* Footer Status */}
      <div className={`p-4 border-t border-slate-800 bg-[#0f172a] transition-all ${isCollapsed ? 'items-center justify-center' : ''}`}>
          <div className={`flex items-center gap-2 text-xs font-medium ${isCollapsed ? 'justify-center' : ''} ${hasApiKey ? 'text-emerald-400' : 'text-amber-500'}`}>
              {hasApiKey ? <Wifi size={14} /> : <WifiOff size={14} />}
              {!isCollapsed && (
                  <span>{hasApiKey ? 'AI Connected' : 'Offline Mode'}</span>
              )}
          </div>
          {!isCollapsed && !hasApiKey && (
              <p className="text-[10px] text-slate-500 mt-1 pl-6">
                  Nhập API Key vào file .env để mở khóa tính năng AI.
              </p>
          )}
=======
      {/* Footer Settings */}
      <div className={`p-4 border-t border-slate-800 bg-[#0f172a] ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={onOpenSettings}
          className={`flex items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all border border-slate-700/50 hover:border-slate-600 group whitespace-nowrap
            ${isCollapsed ? 'justify-center p-2 w-10 h-10' : 'w-full px-3 py-2.5 gap-3'}
          `}
          title="API Settings"
        >
          <div className={`rounded-md bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-yellow-500 transition-colors flex-shrink-0 ${isCollapsed ? 'w-full h-full bg-transparent' : 'w-8 h-8'}`}>
             <Key className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          </div>
          {!isCollapsed && (
            <>
                <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">API Settings</p>
                    <p className="text-[10px] text-slate-500 truncate">Gemini, OpenAI</p>
                </div>
                <Settings className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            </>
          )}
        </button>
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
      </div>
    </div>
  );
};

export default Sidebar;
