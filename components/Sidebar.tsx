import React from 'react';
import { NavItem, ToolType } from '../types';
import { LayoutDashboard, Sparkles, Search, Zap, Network, QrCode, Settings, Key } from 'lucide-react';

interface SidebarProps {
  activeTool: ToolType;
  onSelect: (tool: ToolType) => void;
  isOpen: boolean;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelect, isOpen, onOpenSettings }) => {
  const navItems: NavItem[] = [
    { id: ToolType.DASHBOARD, label: 'Trang Chủ', icon: LayoutDashboard, description: 'Tổng quan' },
    { id: ToolType.META_GEN, label: 'Tạo Meta SEO', icon: Sparkles, description: 'Tối ưu Description' },
    { id: ToolType.KEYWORD_CHECK, label: 'Check Từ Khóa', icon: Search, description: 'Kiểm tra mật độ' },
    { id: ToolType.SPEED_ADVISOR, label: 'Tối Ưu Tốc Độ', icon: Zap, description: 'Tư vấn Core Vitals' },
    { id: ToolType.SITEMAP_GEN, label: 'Tạo Sitemap', icon: Network, description: 'XML Generator' },
    { id: ToolType.QR_GEN, label: 'Tạo QR Code', icon: QrCode, description: 'Link & Contact' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          SEO Master By TNP
        </h1>
        <p className="text-xs text-slate-400 mt-1">Marketing Tools for SMEs</p>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
              </div>
            </button>
          );
        })}
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