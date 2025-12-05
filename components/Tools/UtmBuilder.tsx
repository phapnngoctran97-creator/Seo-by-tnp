
import React, { useState, useEffect } from 'react';
import { Link, Copy, Check, RefreshCw, Layers } from 'lucide-react';

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
        // Replace spaces with underscores is a common convention
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
        // Check if URL already has query params
        const separator = finalUrl.includes('?') ? '&' : '?';
        setResult(`${finalUrl}${separator}${paramString}`);
    } else {
        setResult(finalUrl);
    }
  }, [url, source, medium, campaign, term, content, forceLowercase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
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
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Link className="text-blue-600" /> UTM Builder Pro
        </h2>
        <p className="text-gray-600 mt-1">Tạo link tracking chuẩn cho các chiến dịch Marketing đa kênh.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         
         <div className="md:col-span-8 space-y-4">
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
                        <label className="block text-sm font-medium text-gray-600 mb-1">Campaign Source (Nguồn) <span className="text-red-500">*</span></label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="facebook, google, newsletter"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Campaign Medium (Kênh) <span className="text-red-500">*</span></label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="cpc, banner, email"
                            value={medium}
                            onChange={(e) => setMedium(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Campaign Name (Tên chiến dịch)</label>
                    <input 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="spring_sale_2024"
                        value={campaign}
                        onChange={(e) => setCampaign(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Campaign Term (Từ khóa)</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="giay_chay_bo"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Campaign Content (Nội dung)</label>
                        <input 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="banner_a, link_header"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-gray-800">Tracking Link Generated</h3>
                     <div className="flex items-center gap-2">
                         <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                             <input type="checkbox" checked={forceLowercase} onChange={e => setForceLowercase(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                             Chuyển chữ thường
                         </label>
                     </div>
                 </div>
                 
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm break-all text-blue-700 mb-3 min-h-[60px] flex items-center">
                     {result || <span className="text-gray-400 italic">Nhập URL và Source để tạo link...</span>}
                 </div>

                 <div className="flex gap-3">
                     <button 
                        onClick={handleCopy}
                        disabled={!result}
                        className={`flex-1 py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all ${!result ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'}`}
                     >
                         {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Đã sao chép' : 'Sao Chép Link'}
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

         <div className="md:col-span-4 space-y-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Layers size={18} /> Mẫu có sẵn (Presets)
                 </h3>
                 <div className="space-y-2">
                     {presets.map((p, idx) => (
                         <button
                            key={idx}
                            onClick={() => applyPreset(p)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 flex justify-between items-center transition-colors border border-transparent hover:border-blue-100"
                         >
                             <span>{p.label}</span>
                             <span className="text-xs text-gray-400 font-mono">{p.s}/{p.m}</span>
                         </button>
                     ))}
                 </div>
             </div>

             <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-800">
                 <h4 className="font-bold mb-2">Lời khuyên UTM</h4>
                 <ul className="list-disc list-inside space-y-1 text-xs">
                     <li>Sử dụng chữ thường để tránh trùng lặp dữ liệu trong Analytics.</li>
                     <li>Dùng dấu gạch dưới (_) thay vì khoảng trắng.</li>
                     <li>Campaign Name nên thống nhất (VD: promo_tet_2024).</li>
                     <li>Source/Medium là bắt buộc để tracking hoạt động.</li>
                 </ul>
             </div>
         </div>

      </div>
    </div>
  );
};

export default UtmBuilder;