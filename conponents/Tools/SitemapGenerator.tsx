import React, { useState } from 'react';
import { Network, Download, Copy, Check } from 'lucide-react';

const SitemapGenerator: React.FC = () => {
  const [urls, setUrls] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [priority, setPriority] = useState('0.8');
  const [xmlOutput, setXmlOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSitemap = () => {
    const urlList = urls.split('\n').filter(line => line.trim() !== '');
    
    if (urlList.length === 0) {
      setXmlOutput('');
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    urlList.forEach(url => {
      const cleanUrl = url.trim();
      xml += `  <url>\n`;
      xml += `    <loc>${cleanUrl}</loc>\n`;
      xml += `    <lastmod>${date}</lastmod>\n`;
      xml += `    <changefreq>${frequency}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    setXmlOutput(xml);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlOutput], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Network className="text-cyan-600" /> Tạo Sitemap XML
        </h2>
        <p className="text-gray-600 mt-2">Công cụ tạo sitemap.xml nhanh chóng để gửi lên Google Search Console.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách URL (mỗi dòng 1 URL)</label>
           <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none mb-4 h-64 font-mono text-sm"
              placeholder="https://example.com/&#10;https://example.com/about&#10;https://example.com/contact"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
           />

           <div className="grid grid-cols-2 gap-4 mb-6">
             <div>
               <label className="block text-xs font-medium text-gray-600 mb-1">Tần suất (Changefreq)</label>
               <select 
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
               >
                 <option value="daily">Daily (Hàng ngày)</option>
                 <option value="weekly">Weekly (Hàng tuần)</option>
                 <option value="monthly">Monthly (Hàng tháng)</option>
                 <option value="yearly">Yearly (Hàng năm)</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-600 mb-1">Độ ưu tiên (Priority)</label>
               <select 
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
               >
                 <option value="1.0">1.0 (Cao nhất)</option>
                 <option value="0.8">0.8 (Cao)</option>
                 <option value="0.5">0.5 (Trung bình)</option>
                 <option value="0.3">0.3 (Thấp)</option>
               </select>
             </div>
           </div>

           <button
             onClick={generateSitemap}
             disabled={!urls.trim()}
             className={`w-full py-3 rounded-lg font-medium text-white transition-all ${!urls.trim() ? 'bg-cyan-300' : 'bg-cyan-600 hover:bg-cyan-700 shadow-md'}`}
           >
             Tạo Sitemap
           </button>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-inner flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
            <span className="text-slate-300 font-mono text-sm">sitemap.xml</span>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                disabled={!xmlOutput}
                className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleDownload}
                disabled={!xmlOutput}
                className="p-1.5 bg-cyan-700 text-white rounded hover:bg-cyan-600 transition-colors disabled:opacity-50"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
             {xmlOutput ? (
               <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                 {xmlOutput}
               </pre>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                 Kết quả XML sẽ hiển thị ở đây...
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapGenerator;