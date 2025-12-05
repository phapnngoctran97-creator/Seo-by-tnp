import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MetaGenerator from './components/Tools/MetaGenerator';
import KeywordChecker from './components/Tools/KeywordChecker';
import SpeedAdvisor from './components/Tools/SpeedAdvisor';
import SitemapGenerator from './components/Tools/SitemapGenerator';
import QrGenerator from './components/Tools/QrGenerator';
// New Tools
import WordCounter from './components/Tools/WordCounter';
import ImageCompressor from './components/Tools/ImageCompressor';
import PlagiarismChecker from './components/Tools/PlagiarismChecker';
import PdfTools from './components/Tools/PdfTools';

import Dashboard from './components/Dashboard';
import ApiKeyModal from './components/ApiKeyModal';
import { ToolType } from './types';
import { Menu, X, Key } from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  const renderContent = () => {
    switch (activeTool) {
      // SEO Tools
      case ToolType.META_GEN: return <MetaGenerator />;
      case ToolType.KEYWORD_CHECK: return <KeywordChecker />;
      case ToolType.SPEED_ADVISOR: return <SpeedAdvisor />;
      case ToolType.SITEMAP_GEN: return <SitemapGenerator />;
      case ToolType.QR_GEN: return <QrGenerator />;
      
      // Text Tools
      case ToolType.WORD_COUNTER: return <WordCounter />;
      case ToolType.IMG_COMPRESS: return <ImageCompressor />;
      case ToolType.PLAGIARISM_CHECK: return <PlagiarismChecker />;
      case ToolType.PDF_TOOLS: return <PdfTools />;
      
      default: return <Dashboard onNavigate={setActiveTool} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* API Key Modal */}
      <ApiKeyModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />

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
        onSelect={(tool) => {
          setActiveTool(tool);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onOpenSettings={() => {
          setShowApiModal(true);
          setIsSidebarOpen(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden">
          <span className="font-bold text-gray-800">SEO Master</span>
          <div className="flex items-center gap-2">
            <button
               onClick={() => setShowApiModal(true)}
               className="p-2 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100"
               title="Cài đặt API"
            >
              <Key size={20} />
            </button>
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