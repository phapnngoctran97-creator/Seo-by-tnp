import React, { useState } from 'react';
import { NavGroup, ToolType } from '../types';
import { 
  LayoutDashboard, Sparkles, Search, Zap, Network, QrCode, 
  Settings, Key, ChevronDown, ChevronRight, FileText, 
  Image as ImageIcon, FileType, BookOpen 
} from 'lucide-react';

interface SidebarProps {
  activeTool: ToolType;
  onSelect: (tool: ToolType) => void;
  isOpen: boolean;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelect, isOpen, onOpenSettings }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('SEO Tools');

  const navGroups: NavGroup[] = [
    {
      title: 'SEO Tools',
      items: [
        { id: ToolType.META_GEN, label: 'Tạo Meta SEO', icon: Sparkles, description: 'Tối ưu Description' },
        { id: ToolType.KEYWORD_CHECK, label: 'Check Từ Khóa', icon: Search, description: 'Kiểm tra mật độ' },
        { id: ToolType.SPEED_ADVISOR, label: 'Tối Ưu Tốc Độ', icon: Zap, description: 'Tư vấn Core Vitals' },
        { id: ToolType.SITEMAP_GEN, label: 'Tạo Sitemap', icon: Network, description: 'XML Generator' },
        { id: ToolType.QR_GEN, label: 'Tạo QR Code', icon: QrCode, description: 'Link & Contact' },
      ]
    },
    {
      title: 'Xử Lý Văn Bản',
      items: [
        { id: ToolType.PDF_TOOLS, label: 'Công cụ PDF', icon: FileType, description: 'Convert & Merge' },
        { id: ToolType.IMG_COMPRESS, label: 'Nén Ảnh', icon: ImageIcon, description: 'Giảm dung lượng' },
        { id: ToolType.WORD_COUNTER, label: 'Đếm Từ & Ký Tự', icon: FileText, description: 'Thống kê văn bản' },
        { id: ToolType.PLAGIARISM_CHECK, label: 'Kiểm Tra Đạo Văn', icon: BookOpen, description: 'Check trùng lặp' },
      ]
    }
  ];

  const toggleGroup = (title: string) => {
    setExpandedGroup(expandedGroup === title ? null : title);
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          SEO Master By TNP
        </h1>
        <p className="text-xs text-slate-400 mt-1">Marketing & Editor Tools</p>
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        <button
          onClick={() => onSelect(ToolType.DASHBOARD)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-4 ${
            activeTool === ToolType.DASHBOARD
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium text-sm">Trang Chủ</span>
        </button>

        {navGroups.map((group) => (
          <div key={group.title} className="mb-2">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
            >
              {group.title}
              {expandedGroup === group.title ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            <div className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ease-in-out ${expandedGroup === group.title ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ml-2 border-l-2 ${
                      isActive 
                        ? 'border-indigo-500 bg-slate-800/50 text-white' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all border border-slate-700/50 hover:border-slate-600"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-yellow-500">
             <Key className="w-4 h-4" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium">Cài đặt API</p>
            <p className="text-[10px] text-slate-500">Nhập key của bạn</p>
          </div>
          <Settings className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;