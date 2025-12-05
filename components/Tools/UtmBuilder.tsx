
import React, { useState, useEffect } from 'react';
import { Link, Copy, Check, RefreshCw, Layers, Scissors, FileSpreadsheet, Plus, Trash2, Download } from 'lucide-react';

interface UtmRecord {
  id: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  finalUrl: string;
  shortUrl?: string;
  createdAt: string;
}

const UtmBuilder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [forceLowercase, setForceLowercase] = useState(true);
  
  // Shorten State
  const [shortening, setShortening] = useState(false);
  const [shortResult, setShortResult] = useState('');

  // History State
  const [history, setHistory] = useState<UtmRecord[]>([]);

  // Presets
  const presets = [
    { label: 'Facebook Ads', s: 'facebook', m: 'cpc' },
    { label: 'Google Ads', s: 'google', m: 'cpc' },
    { label: 'Email Newsletter', s: 'newsletter', m: 'email' },
    { label: 'Tiktok', s: 'tiktok', m: 'social' },
    { label: 'Zalo', s: 'zalo', m: 'chat' }
  ];

  useEffect(() => {
    if (!url) {
      setResult('');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//)) {
      finalUrl = 'https://' + finalUrl;
    }

    const params = new URLSearchParams();
    
    const clean = (str: string) => {
        let s = str.trim();
        if (forceLowercase) s = s.toLowerCase();
        s = s.replace(/\s+/g, '_');
        return s;
    };

    if (source) params.set('utm_source', clean(source));
    if (medium) params.set('utm_medium', clean(medium));
    if (campaign) params.set('utm_campaign', clean(campaign));
    if (term) params.set('utm_term', clean(term));
    if (content) params.set('utm_content', clean(content));

    const paramString = params.toString();
    if (paramString) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        setResult(`${finalUrl}${separator}${paramString}`);
    } else {
        setResult(finalUrl);
    }
    // Reset short URL when inputs change
    setShortResult('');
  }, [url, source, medium, campaign, term, content, forceLowercase]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (p: {s: string, m: string}) => {
      setSource(p.s);
      setMedium(p.m);
  };

  const clearAll = () => {
      setUrl('');
      setSource('');
      setMedium('');
      setCampaign('');
      setTerm('');
      setContent('');
      setShortResult('');
  };

  const handleShorten = async () => {
    if (!result) return;
    setShortening(true);
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(result)}`);
      if (response.ok) {
        const text = await response.text();
        setShortResult(text);
      } else {
        alert("Không thể rút gọn link lúc này.");
      }
    } catch (e) {
      alert("Lỗi kết nối.");
    } finally {
      setShortening(false);
    }
  };

  const addToHistory = () => {
     if (!result) return;
     const newRecord: UtmRecord = {
         id: Math.random().toString(36).substr(2, 9),
         url: url,
         source: source,
         medium: medium,
         campaign: campaign,
         finalUrl: result,
         shortUrl: shortResult,
         createdAt: new Date().toLocaleDateString('vi-VN')
     };
     setHistory(prev => [newRecord, ...prev]);
  };

  const removeFromHistory = (id: string) => {
      setHistory(prev => prev.filter(item => item.id !== id));
  };

  const exportExcel = () => {
      if (history.length === 0) return;
      
      const csvContent = [
          ["Date", "Original URL", "Source", "Medium", "Campaign", "Long UTM Link", "Short Link"],
          ...history.map(item => [
              item.createdAt,
              item.url,
              item.source,
              item.medium,
              item.campaign,
              item.finalUrl,
              item.shortUrl || ''
          ])
      ]
      .map(e => e.join(","))
      .join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "utm_links_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Link className="text-blue-600" /> UTM Builder Pro & Shortener
        </h2>
        <p className="text-gray-600 mt-1">Tạo link tracking, rút gọn link và xuất Excel danh sách chiến dịch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* LEFT: BUILDER */}
         <div className="lg:col-span-8 space-y-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Website URL <span className="text-red-500">*</span></label>
                    <input 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://example.com/san-pham"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Source (Nguồn) <span className="text-red-500">*</span></label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="facebook, google"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Medium (Kênh) <span className="text-red-500">*</span></label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="cpc, banner, email"
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Campaign Name</label>
                    <input 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="spring_sale_2024"
                        value={campaign}
                        onChange={(e) => setCampaign(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Term (Từ khóa)</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="giay_chay_bo"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Content (Nội dung)</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="banner_a"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-gray-800">Kết quả (Tracking Link)</h3>
                     <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                         <input type="checkbox" checked={forceLowercase} onChange={e => setForceLowercase(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                         Chuyển chữ thường
                     </label>
                 </div>
                 
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm break-all text-blue-700 mb-3 min-h-[60px] flex items-center">
                     {result || <span className="text-gray-400 italic">Nhập URL và Source để tạo link...</span>}
                 </div>
                 
                 {shortResult && (
                     <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 font-mono text-sm flex justify-between items-center mb-3 animate-in fade-in">
                         <span className="text-indigo-700 font-bold">{shortResult}</span>
                         <button onClick={() => handleCopy(shortResult)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Copy Short Link</button>
                     </div>
                 )}

                 <div className="flex flex-wrap gap-3">
                     <button 
                        onClick={() => handleCopy(result)}
                        disabled={!result}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all ${!result ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                     >
                         {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Đã sao chép' : 'Copy'}
                     </button>
                     
                     <button 
                        onClick={handleShorten}
                        disabled={!result || shortening}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-md transition-colors disabled:bg-gray-300"
                     >
                        {shortening ? <RefreshCw className="animate-spin" size={18} /> : <Scissors size={18} />} Rút gọn
                     </button>

                     <button 
                        onClick={addToHistory}
                        disabled={!result}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-md transition-colors disabled:bg-gray-300"
                        title="Lưu vào danh sách"
                     >
                        <Plus size={18} /> Lưu
                     </button>

                     <button 
                        onClick={clearAll}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
                        title="Reset form"
                     >
                         <RefreshCw size={18} />
                     </button>
                 </div>
             </div>
         </div>

         {/* RIGHT: PRESETS & HISTORY */}
         <div className="lg:col-span-4 space-y-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Layers size={18} /> Mẫu có sẵn (Presets)
                 </h3>
                 <div className="grid grid-cols-1 gap-2">
                     {presets.map((p, idx) => (
                         <button
                            key={idx}
                            onClick={() => applyPreset(p)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 flex justify-between items-center transition-colors border border-transparent hover:border-blue-100"
                         >
                             <span>{p.label}</span>
                             <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{p.s}/{p.m}</span>
                         </button>
                     ))}
                 </div>
             </div>

             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col h-[400px]">
                 <div className="flex justify-between items-center mb-3 border-b pb-2">
                     <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <FileSpreadsheet size={18} className="text-green-600" /> Lịch sử ({history.length})
                     </h3>
                     <button 
                        onClick={exportExcel}
                        disabled={history.length === 0}
                        className="text-xs flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:bg-gray-300"
                     >
                        <Download size={12} /> Excel
                     </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                     {history.length === 0 ? (
                         <div className="text-center text-gray-400 text-xs py-8">
                             Chưa có link nào được lưu.
                         </div>
                     ) : (
                         history.map((item) => (
                             <div key={item.id} className="bg-gray-50 p-2 rounded border border-gray-200 text-xs relative group">
                                 <div className="font-bold text-gray-700 truncate pr-6">{item.campaign || 'No Campaign'}</div>
                                 <div className="text-gray-500 mb-1">{item.source} / {item.medium}</div>
                                 <div className="text-blue-600 truncate mb-1">{item.shortUrl || item.finalUrl}</div>
                                 <button 
                                    onClick={() => removeFromHistory(item.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                             </div>
                         ))
                     )}
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default UtmBuilder;
