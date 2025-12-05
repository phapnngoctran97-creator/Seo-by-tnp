
import React, { useState } from 'react';
import { Activity, Target, TrendingUp, TrendingDown, Clipboard, Check, RefreshCw } from 'lucide-react';

const MiniAnalyticsDash: React.FC = () => {
  // Inputs
  const [spend, setSpend] = useState<number | ''>('');
  const [clicks, setClicks] = useState<number | ''>('');
  const [impressions, setImpressions] = useState<number | ''>('');
  const [conversions, setConversions] = useState<number | ''>('');
  const [revenue, setRevenue] = useState<number | ''>('');

  // Targets
  const [targetCpa, setTargetCpa] = useState<number | ''>(50000);
  const [targetRoas, setTargetRoas] = useState<number | ''>(3);

  // Computed
  const s = Number(spend) || 0;
  const c = Number(clicks) || 0;
  const i = Number(impressions) || 0;
  const cv = Number(conversions) || 0;
  const r = Number(revenue) || 0;

  const ctr = i > 0 ? (c / i) * 100 : 0;
  const cpc = c > 0 ? s / c : 0;
  const cpa = cv > 0 ? s / cv : 0;
  const roas = s > 0 ? r / s : 0;
  const cr = c > 0 ? (cv / c) * 100 : 0;

  // Report Generation
  const generateReport = () => {
      const today = new Date().toLocaleDateString('vi-VN');
      return `
BÁO CÁO NHANH NGÀY ${today}
---------------------------
1. Tổng quan:
- Chi tiêu: ${s.toLocaleString('vi-VN')} đ
- Doanh thu: ${r.toLocaleString('vi-VN')} đ
- Lợi nhuận gộp (Ads): ${(r - s).toLocaleString('vi-VN')} đ

2. Hiệu quả:
- ROAS: ${roas.toFixed(2)}x ${roas >= (Number(targetRoas)||0) ? '✅' : '⚠️'}
- CPA: ${cpa.toLocaleString('vi-VN')} đ ${cpa <= (Number(targetCpa)||0) ? '✅' : '⚠️'}
- CTR: ${ctr.toFixed(2)}% | CR: ${cr.toFixed(2)}%

3. Nhận xét:
${roas >= (Number(targetRoas)||0) ? '- Hiệu quả quảng cáo đạt mục tiêu.' : '- Hiệu quả chưa đạt mục tiêu đề ra.'}
${ctr < 1 ? '- CTR thấp dưới 1%, cần xem lại mẫu quảng cáo.' : '- CTR ổn định.'}
`.trim();
  };

  const [copied, setCopied] = useState(false);
  const handleCopyReport = () => {
      navigator.clipboard.writeText(generateReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
      setSpend(''); setClicks(''); setImpressions(''); setConversions(''); setRevenue('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-emerald-600" /> Báo Cáo Nhanh (Mini Dashboard)
            </h2>
            <p className="text-gray-600 mt-1">Nhập số liệu ngày hôm nay để xem sức khỏe chiến dịch ngay lập tức.</p>
        </div>
        <button onClick={reset} className="text-sm text-gray-500 flex items-center gap-1 hover:text-emerald-600">
            <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: INPUTS */}
          <div className="md:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Nhập số liệu thực tế</h3>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Chi tiêu (Spend)</label>
                          <input type="number" value={spend} onChange={e => setSpend(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-emerald-500 outline-none font-bold text-gray-800" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Hiển thị (Imp)</label>
                              <input type="number" value={impressions} onChange={e => setImpressions(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Click</label>
                              <input type="number" value={clicks} onChange={e => setClicks(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" />
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Đơn hàng (Conv)</label>
                              <input type="number" value={conversions} onChange={e => setConversions(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Doanh thu (Rev)</label>
                              <input type="number" value={revenue} onChange={e => setRevenue(parseFloat(e.target.value))} className="w-full p-2 border rounded focus:ring-emerald-500 outline-none font-bold text-emerald-700" />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Target size={16}/> Mục tiêu (Target)</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between items-center">
                          <label className="text-sm text-emerald-700">CPA Mục tiêu</label>
                          <input type="number" value={targetCpa} onChange={e => setTargetCpa(parseFloat(e.target.value))} className="w-24 p-1 text-right text-sm border rounded bg-white outline-none" />
                      </div>
                      <div className="flex justify-between items-center">
                          <label className="text-sm text-emerald-700">ROAS Mục tiêu</label>
                          <input type="number" value={targetRoas} onChange={e => setTargetRoas(parseFloat(e.target.value))} className="w-24 p-1 text-right text-sm border rounded bg-white outline-none" />
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: DASHBOARD */}
          <div className="md:col-span-8 space-y-6">
              
              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreCard 
                     label="ROAS" 
                     value={`${roas.toFixed(2)}x`} 
                     status={roas >= (Number(targetRoas)||0) ? 'good' : 'bad'} 
                     sub={`Mục tiêu: >${targetRoas}`}
                  />
                  <ScoreCard 
                     label="CPA (Giá đơn)" 
                     value={cpa.toLocaleString('vi-VN')} 
                     unit="đ"
                     status={cpa > 0 && cpa <= (Number(targetCpa)||0) ? 'good' : 'bad'}
                     sub={`Mục tiêu: <${(Number(targetCpa)||0)/1000}k`}
                  />
                  <ScoreCard 
                     label="CTR (Click)" 
                     value={ctr.toFixed(2)} 
                     unit="%"
                     status={ctr >= 1.5 ? 'good' : ctr >= 1 ? 'neutral' : 'bad'}
                     sub="Thị trường: ~1.5%"
                  />
                  <ScoreCard 
                     label="CR (Chuyển đổi)" 
                     value={cr.toFixed(2)} 
                     unit="%"
                     status={cr >= 20 ? 'good' : cr >= 5 ? 'neutral' : 'bad'}
                     sub="Thị trường: ~5-20%"
                  />
              </div>

              {/* Text Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700 text-sm">Bản tin nhanh (Text Report)</h3>
                      <button onClick={handleCopyReport} className="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
                          {copied ? <Check size={12} className="text-green-600"/> : <Clipboard size={12}/>} {copied ? 'Đã sao chép' : 'Sao chép báo cáo'}
                      </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-gray-700 whitespace-pre-wrap bg-white">
                      {generateReport()}
                  </pre>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">CPC Trung bình</div>
                    <div className="text-xl font-bold">{cpc.toLocaleString('vi-VN')} đ</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Lợi nhuận (Gross)</div>
                    <div className={`text-xl font-bold ${(r-s) > 0 ? 'text-green-600' : 'text-gray-600'}`}>{(r-s).toLocaleString('vi-VN')} đ</div>
                 </div>
              </div>

          </div>
      </div>
    </div>
  );
};

const ScoreCard = ({label, value, unit, status, sub}: {label: string, value: string, unit?: string, status: 'good' | 'bad' | 'neutral', sub?: string}) => {
    const colors = {
        good: 'bg-green-50 text-green-700 border-green-200',
        bad: 'bg-red-50 text-red-700 border-red-200',
        neutral: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[status]} flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase opacity-80">{label}</span>
                {status === 'good' ? <TrendingUp size={16} /> : status === 'bad' ? <TrendingDown size={16} /> : null}
            </div>
            <div>
                <span className="text-2xl font-bold">{value}</span>
                {unit && <span className="text-sm ml-1 font-medium opacity-80">{unit}</span>}
            </div>
            {sub && <div className="text-[10px] mt-2 opacity-70">{sub}</div>}
        </div>
    );
};

export default MiniAnalyticsDash;
