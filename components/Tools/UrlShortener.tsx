
import React, { useState } from 'react';
import { Link, Copy, Check, Loader2, Scissors, ExternalLink } from 'lucide-react';

const UrlShortener: React.FC = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = async () => {
    if (!longUrl) return;
    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      // Using TinyURL API (No API Key needed for simple creation)
      // Note: This is client-side, CORS might be an issue in some envs, but TinyURL usually allows it.
      // Alternatively, use is.gd or v.gd
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      
      if (!response.ok) throw new Error("Network error");
      
      const text = await response.text();
      if (text.startsWith('http')) {
          setShortUrl(text);
      } else {
          setError("Không thể rút gọn link này. Vui lòng kiểm tra lại URL.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Link className="text-indigo-600" /> Rút Gọn Link Miễn Phí
        </h2>
        <p className="text-gray-600 mt-1">Tạo đường dẫn ngắn gọn dễ chia sẻ (Powered by TinyURL).</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
         <div className="relative mb-6">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Link className="h-5 w-5 text-gray-400" />
             </div>
             <input 
                type="url"
                className="w-full pl-10 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                placeholder="Dán đường dẫn dài của bạn vào đây (https://...)"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
             />
         </div>

         <button 
            onClick={handleShorten}
            disabled={loading || !longUrl}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg flex justify-center items-center gap-2 transition-all shadow-lg ${
                loading || !longUrl ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'
            }`}
         >
             {loading ? <Loader2 className="animate-spin" /> : <Scissors />}
             {loading ? 'Đang xử lý...' : 'Rút Gọn Ngay'}
         </button>

         {error && (
             <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                 {error}
             </div>
         )}

         {shortUrl && (
             <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
                 <p className="text-sm text-gray-500 mb-2 font-medium uppercase text-center">Link rút gọn của bạn:</p>
                 
                 <div className="flex flex-col md:flex-row items-center gap-4">
                     <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 text-indigo-600 font-bold text-xl text-center break-all shadow-inner">
                         {shortUrl}
                     </div>
                     <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={handleCopy}
                            className={`flex-1 md:flex-none px-6 py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors ${copied ? 'bg-green-600' : 'bg-gray-800 hover:bg-black'}`}
                        >
                            {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Đã Copy' : 'Copy'}
                        </button>
                        <a 
                            href={shortUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-4 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                            title="Mở Link"
                        >
                            <ExternalLink size={20} />
                        </a>
                     </div>
                 </div>
                 
                 <div className="mt-4 flex justify-center">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortUrl)}`} 
                        alt="QR Code" 
                        className="w-32 h-32 border border-gray-200 rounded-lg shadow-sm"
                    />
                 </div>
                 <p className="text-center text-xs text-gray-400 mt-2">QR Code tự động cho link này</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default UrlShortener;