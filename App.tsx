
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MetaGenerator from './components/Tools/MetaGenerator';
import KeywordChecker from './components/Tools/KeywordChecker';
import SpeedAdvisor from './components/Tools/SpeedAdvisor';
import SitemapGenerator from './components/Tools/SitemapGenerator';
import QrGenerator from './components/Tools/QrGenerator';
import OutlineGenerator from './components/Tools/OutlineGenerator';
import SeoGrader from './components/Tools/SeoGrader';
// Text Tools
import WordCounter from './components/Tools/WordCounter';
import ImageCompressor from './components/Tools/ImageCompressor';
import PlagiarismChecker from './components/Tools/PlagiarismChecker';
import PdfToWord from './components/Tools/PdfToWord';
import FancyTextGenerator from './components/Tools/FancyTextGenerator'; // Added
// Graphic Tools
import FacebookCreator from './components/Tools/FacebookCreator'; 
import BgRemover from './components/Tools/BgRemover';
import ImageResizer from './components/Tools/ImageResizer';
import BannerCreator from './components/Tools/BannerCreator';
import ImageFilter from './components/Tools/ImageFilter';
import ImageColorPicker from './components/Tools/ImageColorPicker';
// Ads Tools
import AdsStructureGen from './components/Tools/AdsStructureGen';
import AdsContentGen from './components/Tools/AdsContentGen';
import LandingLayoutGen from './components/Tools/LandingLayoutGen';
import AdsCalculator from './components/Tools/AdsCalculator';
import BudgetPlanner from './components/Tools/BudgetPlanner';
import MarketingPlanSlides from './components/Tools/MarketingPlanSlides';
// Analytics Tools
import UtmBuilder from './components/Tools/UtmBuilder';
import UrlShortener from './components/Tools/UrlShortener';
import RoiCalculator from './components/Tools/RoiCalculator';
import CostPerResult from './components/Tools/CostPerResult';
import MiniAnalyticsDash from './components/Tools/MiniAnalyticsDash';
import ChartGenerator from './components/Tools/ChartGenerator';

import Dashboard from './components/Dashboard';
import { ToolType } from './types';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
<<<<<<< HEAD

  // Trigger resize event when sidebar toggles to force charts to redraw
  useEffect(() => {
    const handleResize = () => {
      // Small delay to allow CSS transition to finish/start
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    };
    handleResize();
  }, [isCollapsed]);
=======
  const [showApiModal, setShowApiModal] = useState(false);
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29

  // Trigger resize event when sidebar toggles to force charts to redraw
  useEffect(() => {
    const handleResize = () => {
      // Small delay to allow CSS transition to finish/start
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
    };
    handleResize();
  }, [isCollapsed]);

  // Hàm điều hướng thông minh: Lưu lịch sử + Chuyển trang
  const navigateToTool = (tool: ToolType) => {
    setActiveTool(tool);
    setIsSidebarOpen(false);

    // Lưu vào lịch sử (trừ Dashboard)
    if (tool !== ToolType.DASHBOARD) {
      try {
        const recentJSON = localStorage.getItem('recent_tools');
        let recent: ToolType[] = recentJSON ? JSON.parse(recentJSON) : [];
        
        // Xóa trùng lặp và đưa tool mới nhất lên đầu
        recent = [tool, ...recent.filter(t => t !== tool)].slice(0, 4);
        
        localStorage.setItem('recent_tools', JSON.stringify(recent));
      } catch (e) {
        console.error("Failed to save history", e);
      }
    }
  };

  const renderContent = () => {
    switch (activeTool) {
      // SEO Tools
      case ToolType.SEO_GRADER: return <SeoGrader />;
      case ToolType.META_GEN: return <MetaGenerator />;
      case ToolType.KEYWORD_CHECK: return <KeywordChecker />;
      case ToolType.SPEED_ADVISOR: return <SpeedAdvisor />;
      case ToolType.SITEMAP_GEN: return <SitemapGenerator />;
      case ToolType.QR_GEN: return <QrGenerator />;
      case ToolType.OUTLINE_GEN: return <OutlineGenerator />;
      
      // Text Tools
      case ToolType.WORD_COUNTER: return <WordCounter />;
      case ToolType.IMG_COMPRESS: return <ImageCompressor />;
      case ToolType.PLAGIARISM_CHECK: return <PlagiarismChecker />;
      case ToolType.PDF_TO_WORD: return <PdfToWord />;
      case ToolType.FANCY_TEXT: return <FancyTextGenerator />; // Added

      // Graphic Tools
      case ToolType.FB_CREATOR: return <FacebookCreator />; 
      case ToolType.BG_REMOVER: return <BgRemover />;
      case ToolType.IMG_RESIZER: return <ImageResizer />;
      case ToolType.BANNER_GEN: return <BannerCreator />;
      case ToolType.IMG_FILTER: return <ImageFilter />;
      case ToolType.IMG_COLOR_PICKER: return <ImageColorPicker />;

      // Ads Tools
      case ToolType.ADS_STRUCTURE: return <AdsStructureGen />;
      case ToolType.ADS_CONTENT: return <AdsContentGen />;
      case ToolType.LANDING_LAYOUT: return <LandingLayoutGen />;
      case ToolType.ADS_CALCULATOR: return <AdsCalculator />;
      case ToolType.BUDGET_PLANNER: return <BudgetPlanner />;
      case ToolType.PLAN_SLIDES: return <MarketingPlanSlides />;
      
      // Analytics Tools
      case ToolType.UTM_BUILDER: return <UtmBuilder />;
      case ToolType.URL_SHORTENER: return <UrlShortener />;
      case ToolType.ROI_CALCULATOR: return <RoiCalculator />;
      case ToolType.COST_PER_RESULT: return <CostPerResult />;
      case ToolType.MINI_DASHBOARD: return <MiniAnalyticsDash />;
      case ToolType.CHART_GEN: return <ChartGenerator />;

      default: return <Dashboard onNavigate={navigateToTool} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeTool={activeTool} 
        onSelect={navigateToTool}
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
<<<<<<< HEAD
=======
        onOpenSettings={() => {
          setShowApiModal(true);
          setIsSidebarOpen(false);
        }}
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
      />

      {/* Main Content */}
      {/* min-w-0 is CRITICAL here: prevents flex children (charts) from overflowing */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 min-w-0">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden flex-shrink-0">
          <span className="font-bold text-gray-800">SEO Master</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
