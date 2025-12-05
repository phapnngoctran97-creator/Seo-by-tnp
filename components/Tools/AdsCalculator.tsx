
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';

const AdsCalculator: React.FC = () => {
  const [spend, setSpend] = useState<number | ''>('');
  const [impressions, setImpressions] = useState<number | ''>('');
  const [clicks, setClicks] = useState<number | ''>('');
  const [conversions, setConversions] = useState<number | ''>('');
  const [revenue, setRevenue] = useState<number | ''>('');

  // Results
  const [cpc, setCpc] = useState(0);
  const [ctr, setCtr] = useState(0);
  const [cpa, setCpa] = useState(0);
  const [roas, setRoas] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [cr, setCr] = useState(0);

  // Input Handler
  const handleNumChange = (val: string, setter: (v: number | '') => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '') setter('');
    else if (!isNaN(Number(raw))) setter(Number(raw));
  };

  const fmt = (num: number | '') => num === '' ? '' : num.toLocaleString('en-US');

  useEffect(() => {
    const s = Number(spend) || 0;
    const i = Number(impressions) || 0;
    const cl = Number(clicks) || 0;
    const cv = Number(conversions) || 0;
    const r = Number(revenue) || 0;

    setCpc(cl > 0 ? s / cl : 0);
    setCtr(i > 0 ? (cl / i) * 100 : 0);
    setCpa(cv > 0 ? s / cv : 0);
    setRoas(s > 0 ? r / s : 0);
    setCpm(i > 0 ? (s / i) * 1000 : 0);
    setCr(cl > 0 ? (cv / cl) * 100 : 0);
  }, [spend, impressions, clicks, conversions, revenue]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-teal-600" /> Tính Toán Chỉ Số Ads (ROAS, CPA, CAC)
        </h2>
        <p className="text-gray-600 mt-1">Nhập số liệu thực tế để tính toán hiệu quả quảng cáo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INPUTS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><DollarSign size={18}/> Nhập Số Liệu</h3>
           <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Chi tiêu (Cost/Spend)</label>
                <input 
                    type="text" 
                    value={fmt(spend)} 
                    onChange={e => handleNumChange(e.target.value, setSpend)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                    placeholder="VD: 5,000,000" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Số lần hiển thị (Impressions)</label>
                <input 
                    type="text" 
                    value={fmt(impressions)} 
                    onChange={e => handleNumChange(e.target.value, setImpressions)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                    placeholder="VD: 100,000" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Số lượt click (Clicks)</label>
                <input 
                    type="text" 
                    value={fmt(clicks)} 
                    onChange={e => handleNumChange(e.target.value, setClicks)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                    placeholder="VD: 2,000" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Số chuyển đổi/Đơn hàng (Conversions)</label>
                <input 
                    type="text" 
                    value={fmt(conversions)} 
                    onChange={e => handleNumChange(e.target.value, setConversions)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                    placeholder="VD: 50" 
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Doanh thu (Revenue)</label>
                <input 
                    type="text" 
                    value={fmt(revenue)} 
                    onChange={e => handleNumChange(e.target.value, setRevenue)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                    placeholder="VD: 20,000,000" 
                />
             </div>
           </div>
        </div>

        {/* OUTPUTS */}
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">ROAS (Lợi tức)</div>
                 <div className={`text-3xl font-bold ${roas >= 4 ? 'text-green-600' : roas >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {roas.toFixed(2)}x
                 </div>
                 <div className="text-xs text-gray-400 mt-1">Mục tiêu: {'>'} 3.0x</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">CPA (Chi phí/Đơn)</div>
                 <div className="text-3xl font-bold text-gray-800">
                    {cpa.toLocaleString('vi-VN')}đ
                 </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">CPC (Giá click)</div>
                 <div className="text-2xl font-bold text-gray-700">
                    {cpc.toLocaleString('vi-VN')}đ
                 </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">CPM (Giá/1000 hiển thị)</div>
                 <div className="text-2xl font-bold text-gray-700">
                    {cpm.toLocaleString('vi-VN')}đ
                 </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">CTR (Tỷ lệ click)</div>
                 <div className={`text-2xl font-bold ${ctr >= 1.5 ? 'text-green-600' : 'text-gray-700'}`}>
                    {ctr.toFixed(2)}%
                 </div>
                 <div className="text-xs text-gray-400 mt-1">Trung bình: 1% - 2%</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">CR (Tỷ lệ chuyển đổi)</div>
                 <div className="text-2xl font-bold text-gray-700">
                    {cr.toFixed(2)}%
                 </div>
              </div>
           </div>

           <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-sm text-teal-800">
              <h4 className="font-bold flex items-center gap-2 mb-2"><TrendingUp size={16}/> Đánh giá sơ bộ</h4>
              {roas > 0 ? (
                 <ul className="list-disc list-inside space-y-1">
                    {roas < 2 && <li>ROAS thấp ({roas.toFixed(2)}). Cần tối ưu lại nội dung hoặc targeting.</li>}
                    {roas >= 4 && <li>ROAS rất tốt ({roas.toFixed(2)}). Nên cân nhắc tăng ngân sách (Scale).</li>}
                    {ctr < 1 && <li>CTR thấp ({ctr.toFixed(2)}%). Hình ảnh hoặc tiêu đề chưa đủ hấp dẫn.</li>}
                    {cr < 1 && <li>Tỷ lệ chuyển đổi thấp. Cần xem lại Landing Page hoặc ưu đãi.</li>}
                    {roas >= 2 && roas < 4 && <li>Hiệu quả trung bình khá. Cần tối ưu thêm để tăng lợi nhuận.</li>}
                 </ul>
              ) : (
                 <p>Nhập dữ liệu để xem đánh giá.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdsCalculator;
