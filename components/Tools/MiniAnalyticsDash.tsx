
import React, { useState } from 'react';
import { Activity, Target, TrendingUp, TrendingDown, Clipboard, Check, RefreshCw, MessageCircle, Users, MousePointer2, Eye } from 'lucide-react';

const MiniAnalyticsDash: React.FC = () => {
  // Inputs
  const [spend, setSpend] = useState<number | ''>('');
  const [impressions, setImpressions] = useState<number | ''>('');
  const [reach, setReach] = useState<number | ''>('');
  const [clicks, setClicks] = useState<number | ''>('');
  const [mess, setMess] = useState<number | ''>(''); // Messaging Conversations Started
  const [newMess, setNewMess] = useState<number | ''>(''); // New Messaging Connections

  // Targets
  const [targetCpr, setTargetCpr] = useState<number | ''>(50000); // Cost per Result target

  // Computed Values
  const s = Number(spend) || 0;
  const i = Number(impressions) || 0;
  const r = Number(reach) || 0;
  const c = Number(clicks) || 0;
  const m = Number(mess) || 0;
  const nm = Number(newMess) || 0;

  // Derived Metrics
  const frequency = r > 0 ? i / r : 0;
  const ctr = i > 0 ? (c / i) * 100 : 0;
  const cpc = c > 0 ? s / c : 0;
  const costPerMess = m > 0 ? s / m : 0;
  const costPerNewMess = nm > 0 ? s / nm : 0; // CPA (Cost per Result)
  const messRate = c > 0 ? (m / c) * 100 : 0; // Click to Mess rate

  // Helper for input formatting
  const handleNumChange = (val: string, setter: (v: number | '') => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '') setter('');
    else if (!isNaN(Number(raw))) setter(Number(raw));
  };

  const fmt = (num: number | '') => num === '' ? '' : num.toLocaleString('en-US');

  // Report Generation
  const generateReport = () => {
      const today = new Date().toLocaleDateString('vi-VN');
      return `
BÁO CÁO ADS NGÀY ${today}
---------------------------
1. Tổng quan:
- Chi tiêu: ${s.toLocaleString('vi-VN')} đ
- Hiển thị: ${i.toLocaleString('vi-VN')} | Tiếp cận: ${r.toLocaleString('vi-VN')}
- Tần suất (Freq): ${frequency.toFixed(2)}

2. Tương tác:
- Click: ${c.toLocaleString('vi-VN')} (CTR: ${ctr.toFixed(2)}%)
- CPC: ${cpc.toLocaleString('vi-VN')} đ

3. Kết quả (Messaging):
- Tin nhắn mới (New Mess): ${nm.toLocaleString('vi-VN')}
- Tổng cuộc trò chuyện: ${m.toLocaleString('vi-VN')}
- Giá/Tin nhắn mới (CPR): ${costPerNewMess.toLocaleString('vi-VN')} đ ${costPerNewMess <= (Number(targetCpr)||0) ? '✅' : '⚠️'}

4. Đánh giá:
${costPerNewMess <= (Number(targetCpr)||0) ? '- Chi phí trên mỗi kết quả tốt.' : '- Chi phí đang cao hơn mục tiêu.'}
${frequency > 2.5 ? '- Tần suất lặp lại cao, cần đổi nội dung/target.' : '- Tần suất ổn định.'}
`.trim();
  };

  const [copied, setCopied] = useState(false);
  const handleCopyReport = () => {
      navigator.clipboard.writeText(generateReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
      setSpend(''); setImpressions(''); setReach(''); setClicks(''); setMess(''); setNewMess('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-emerald-600" /> Báo Cáo Nhanh (Social/Messaging)
            </h2>
            <p className="text-gray-600 mt-1">Nhập số liệu Imp, Reach, Click, Mess để xem báo cáo hiệu quả.</p>
        </div>
        <button onClick={reset} className="text-sm text-gray-500 flex items-center gap-1 hover:text-emerald-600">
            <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: INPUTS */}
          <div className="md:col-span-4 space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Nhập số liệu</h3>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Chi tiêu (Spend)</label>
                          <input 
                            type="text" 
                            value={fmt(spend)} 
                            onChange={e => handleNumChange(e.target.value, setSpend)} 
                            className="w-full p-2 border rounded focus:ring-emerald-500 outline-none font-bold text-gray-800"
                            placeholder="0"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Hiển thị (Imp)</label>
                              <input 
                                type="text" 
                                value={fmt(impressions)} 
                                onChange={e => handleNumChange(e.target.value, setImpressions)} 
                                className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" 
                              />
                          </div>
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Reach</label>
                              <input 
                                type="text" 
                                value={fmt(reach)} 
                                onChange={e => handleNumChange(e.target.value, setReach)} 
                                className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" 
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Lượt Click</label>
                          <input 
                            type="text" 
                            value={fmt(clicks)} 
                            onChange={e => handleNumChange(e.target.value, setClicks)} 
                            className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" 
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase" title="Messaging Conversations Started">Messenger</label>
                              <input 
                                type="text" 
                                value={fmt(mess)} 
                                onChange={e => handleNumChange(e.target.value, setMess)} 
                                className="w-full p-2 border rounded focus:ring-emerald-500 outline-none" 
                              />
                          </div>
                          <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase text-emerald-600" title="New Messaging Connections">New Mess</label>
                              <input 
                                type="text" 
                                value={fmt(newMess)} 
                                onChange={e => handleNumChange(e.target.value, setNewMess)} 
                                className="w-full p-2 border rounded focus:ring-emerald-500 outline-none font-bold" 
                              />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                  <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><Target size={16}/> Mục tiêu (KPIs)</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between items-center">
                          <label className="text-sm text-emerald-700">Giá/New Mess</label>
                          <input 
                             type="text" 
                             value={fmt(targetCpr)} 
                             onChange={e => handleNumChange(e.target.value, setTargetCpr)} 
                             className="w-28 p-1 text-right text-sm border rounded bg-white outline-none" 
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT: DASHBOARD */}
          <div className="md:col-span-8 space-y-6">
              
              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <ScoreCard 
                     label="Chi phí / New Mess" 
                     value={costPerNewMess.toLocaleString('vi-VN')} 
                     unit="đ"
                     status={costPerNewMess > 0 && costPerNewMess <= (Number(targetCpr)||0) ? 'good' : 'bad'}
                     icon={<MessageCircle size={16} />}
                     sub={`Mục tiêu: < ${fmt(targetCpr)}`}
                  />
                  <ScoreCard 
                     label="Tần suất (Freq)" 
                     value={frequency.toFixed(2)} 
                     status={frequency < 1.1 ? 'neutral' : frequency > 3 ? 'bad' : 'good'} 
                     icon={<Users size={16} />}
                     sub="Ổn định: 1.2 - 2.5"
                  />
                  <ScoreCard 
                     label="CTR (Click)" 
                     value={ctr.toFixed(2)} 
                     unit="%"
                     status={ctr >= 1.5 ? 'good' : ctr >= 1 ? 'neutral' : 'bad'}
                     icon={<MousePointer2 size={16} />}
                  />
                  <ScoreCard 
                     label="CPC (Giá Click)" 
                     value={cpc.toLocaleString('vi-VN')} 
                     unit="đ"
                     status={cpc > 0 ? 'neutral' : 'neutral'}
                     icon={<Eye size={16} />}
                  />
              </div>

              {/* Text Report */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-700 text-sm">Bản tin nhanh (Copy để báo cáo)</h3>
                      <button onClick={handleCopyReport} className="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1">
                          {copied ? <Check size={12} className="text-green-600"/> : <Clipboard size={12}/>} {copied ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-gray-700 whitespace-pre-wrap bg-white">
                      {generateReport()}
                  </pre>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Giá / Conversation</div>
                    <div className="text-xl font-bold">{costPerMess.toLocaleString('vi-VN')} đ</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Tỷ lệ Click ra Mess</div>
                    <div className={`text-xl font-bold`}>{messRate.toFixed(1)}%</div>
                 </div>
              </div>

          </div>
      </div>
    </div>
  );
};

const ScoreCard = ({label, value, unit, status, icon, sub}: {label: string, value: string, unit?: string, status: 'good' | 'bad' | 'neutral', icon?: any, sub?: string}) => {
    const colors = {
        good: 'bg-green-50 text-green-700 border-green-200',
        bad: 'bg-red-50 text-red-700 border-red-200',
        neutral: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[status]} flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase opacity-80">{label}</span>
                {icon}
            </div>
            <div>
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                {unit && <span className="text-xs ml-1 font-medium opacity-80">{unit}</span>}
            </div>
            {sub && <div className="text-[10px] mt-1 opacity-70 truncate">{sub}</div>}
        </div>
    );
};

export default MiniAnalyticsDash;
