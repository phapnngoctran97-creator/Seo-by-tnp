
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Target, Calculator, Eye, MousePointer2, 
  MessageCircle, Users, Video, Facebook, Search, Music, 
  RefreshCw, DollarSign, BarChart2 
} from 'lucide-react';

type Platform = 'facebook' | 'google' | 'tiktok';

const BudgetPlanner: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('facebook');

  // Unified State for all metrics
  // Volume Targets
  const [imp, setImp] = useState<number | ''>('');
  const [clicks, setClicks] = useState<number | ''>('');
  const [views, setViews] = useState<number | ''>('');
  const [conversions, setConversions] = useState<number | ''>(''); // Mess (FB) or Conv (Google/TikTok)

  // Unit Costs
  const [cpm, setCpm] = useState<number | ''>('');
  const [cpc, setCpc] = useState<number | ''>('');
  const [cpv, setCpv] = useState<number | ''>('');
  const [cpa, setCpa] = useState<number | ''>(''); // Cost per Result (Mess/Conv)

  // Revenue
  const [aov, setAov] = useState<number | ''>(''); // Average Order Value
  const [crSales, setCrSales] = useState<number | ''>(10); // Conversion Rate to Sales (from Lead/Click)

  // Input Handler with Comma Formatting
  const handleNumChange = (val: string, setter: (v: number | '') => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '') setter('');
    else if (!isNaN(Number(raw))) setter(Number(raw));
  };

  const fmt = (num: number | '') => num === '' ? '' : num.toLocaleString('en-US');

  // --- CALCULATIONS ---
  const budgetFromImp = ((Number(imp)||0) / 1000) * (Number(cpm)||0);
  const budgetFromClicks = (Number(clicks)||0) * (Number(cpc)||0);
  const budgetFromViews = (Number(views)||0) * (Number(cpv)||0);
  const budgetFromConv = (Number(conversions)||0) * (Number(cpa)||0);

  // Total Budget: Sum relevant metrics based on platform logic or user input
  const totalBudget = budgetFromImp + budgetFromClicks + budgetFromViews + budgetFromConv;

  // Derived Metrics for Dashboard Simulation (Fallback logic for empty fields)
  const derivedImp = Number(imp) || (Number(clicks) * 100) || 0; 
  const derivedClicks = Number(clicks) || (Number(conversions) * 10) || 0;
  
  const ctr = derivedImp > 0 ? (derivedClicks / derivedImp) * 100 : 0;
  const conversionRate = derivedClicks > 0 ? ((Number(conversions)||0) / derivedClicks) * 100 : 0;
  
  // Revenue
  const estOrders = Math.floor((Number(conversions)||0) * ((Number(crSales)||0) / 100));
  const estRevenue = estOrders * (Number(aov)||0);
  const roas = totalBudget > 0 ? estRevenue / totalBudget : 0;

  // Platform Configs
  const config = {
    facebook: {
      color: 'blue',
      icon: Facebook,
      label: 'Facebook Ads',
      metrics: [
        { label: 'Impressions', val: imp, set: setImp, unitCostLabel: 'CPM (Giá/1000 hiển thị)', unitCost: cpm, setUnit: setCpm },
        { label: 'Link Clicks', val: clicks, set: setClicks, unitCostLabel: 'CPC (Giá click)', unitCost: cpc, setUnit: setCpc },
        { label: 'Messaging / Leads', val: conversions, set: setConversions, unitCostLabel: 'Cost per Result', unitCost: cpa, setUnit: setCpa },
      ],
      resultLabel: 'Conversations'
    },
    google: {
      color: 'red',
      icon: Search,
      label: 'Google Ads',
      metrics: [
        { label: 'Impressions (Search)', val: imp, set: setImp, unitCostLabel: 'Avg. CPM (Display only)', unitCost: cpm, setUnit: setCpm },
        { label: 'Clicks', val: clicks, set: setClicks, unitCostLabel: 'Avg. CPC', unitCost: cpc, setUnit: setCpc },
        { label: 'Conversions', val: conversions, set: setConversions, unitCostLabel: 'CPA (Cost/Conv)', unitCost: cpa, setUnit: setCpa },
      ],
      resultLabel: 'Conversions'
    },
    tiktok: {
      color: 'stone', // Dark theme
      icon: Music,
      label: 'TikTok Ads',
      metrics: [
        { label: 'Impressions', val: imp, set: setImp, unitCostLabel: 'CPM', unitCost: cpm, setUnit: setCpm },
        { label: 'Video Views (6s)', val: views, set: setViews, unitCostLabel: 'CPV', unitCost: cpv, setUnit: setCpv },
        { label: 'Conversions', val: conversions, set: setConversions, unitCostLabel: 'CPA', unitCost: cpa, setUnit: setCpa },
      ],
      resultLabel: 'Conversions'
    }
  };

  const activeConfig = config[platform];
  const ThemeIcon = activeConfig.icon;

  const reset = () => {
    setImp(''); setClicks(''); setViews(''); setConversions('');
    setCpm(''); setCpc(''); setCpv(''); setCpa('');
    setAov('');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* HEADER & SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Calculator className="text-indigo-600" /> Lập Kế Hoạch Ngân Sách (Media Plan)
           </h2>
           <p className="text-gray-600 mt-1">Giả lập chiến dịch và dự tính ngân sách theo từng nền tảng.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm self-start md:self-auto">
           {(['facebook', 'google', 'tiktok'] as Platform[]).map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                   platform === p 
                   ? p === 'facebook' ? 'bg-blue-600 text-white' 
                     : p === 'google' ? 'bg-red-500 text-white' 
                     : 'bg-black text-white'
                   : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                  {p === 'facebook' && <Facebook size={16} />}
                  {p === 'google' && <Search size={16} />}
                  {p === 'tiktok' && <Music size={16} />}
                  <span className="capitalize">{p} Ads</span>
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* LEFT: INPUTS (Funnel) */}
         <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                   <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Target size={18} /> Mục tiêu & Chi phí
                   </h3>
                   <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                      <RefreshCw size={12} /> Reset
                   </button>
               </div>
               
               <div className="space-y-4">
                  {activeConfig.metrics.map((m, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${m.val || m.unitCost ? `bg-${activeConfig.color}-50 border-${activeConfig.color}-200` : 'bg-gray-50 border-gray-100'}`}>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{m.label}</label>
                                  <input 
                                     type="text" 
                                     value={fmt(m.val)} 
                                     onChange={e => handleNumChange(e.target.value, m.set)}
                                     className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                     placeholder="0"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{m.unitCostLabel}</label>
                                  <input 
                                     type="text" 
                                     value={fmt(m.unitCost)} 
                                     onChange={e => handleNumChange(e.target.value, m.setUnit)}
                                     className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                     placeholder="0"
                                  />
                              </div>
                          </div>
                      </div>
                  ))}
               </div>

               {/* REVENUE INPUTS */}
               <div className="mt-6 pt-4 border-t border-gray-100">
                   <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                      <DollarSign size={16}/> Ước tính doanh thu
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">Tỷ lệ chốt đơn (%)</label>
                          <input 
                             type="number" value={crSales} onChange={e => setCrSales(parseFloat(e.target.value))}
                             className="w-full p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="10"
                          />
                       </div>
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">Giá trị đơn (AOV)</label>
                          <input 
                             type="text" value={fmt(aov)} onChange={e => handleNumChange(e.target.value, setAov)}
                             className="w-full p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="500,000"
                          />
                       </div>
                   </div>
               </div>
            </div>
         </div>

         {/* RIGHT: SIMULATED DASHBOARD */}
         <div className="lg:col-span-7">
             
             {/* 1. TOP SUMMARY CARD */}
             <div className={`rounded-xl shadow-lg p-6 mb-6 text-white transition-colors duration-300 relative overflow-hidden ${
                 platform === 'facebook' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                 platform === 'google' ? 'bg-white border-t-4 border-red-500 text-gray-800 shadow-md' :
                 'bg-gradient-to-br from-gray-900 to-black'
             }`}>
                 <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${platform === 'google' ? 'bg-gray-100' : 'bg-white/20'}`}>
                            <ThemeIcon size={24} className={platform === 'google' ? 'text-red-500' : 'text-white'} />
                         </div>
                         <div>
                             <h3 className={`font-bold text-lg ${platform === 'google' ? 'text-gray-800' : 'text-white'}`}>
                                 {activeConfig.label} Campaign
                             </h3>
                             <p className={`text-xs ${platform === 'google' ? 'text-gray-500' : 'text-white/70'}`}>Plan ID: #2024-Q4</p>
                         </div>
                     </div>
                     <div className="text-right">
                         <div className={`text-xs uppercase font-bold mb-1 ${platform === 'google' ? 'text-gray-500' : 'text-white/70'}`}>Ngân sách dự kiến</div>
                         <div className={`text-3xl font-extrabold ${platform === 'google' ? 'text-gray-900' : 'text-white'}`}>
                             {totalBudget.toLocaleString('vi-VN')} đ
                         </div>
                     </div>
                 </div>

                 {/* METRICS GRID - STYLED LIKE PLATFORM */}
                 <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 ${platform === 'google' ? '' : 'text-white'}`}>
                     
                     <div className={`p-3 rounded-lg ${platform === 'google' ? 'bg-gray-50' : 'bg-white/10'}`}>
                         <div className={`text-xs mb-1 ${platform === 'google' ? 'text-gray-500' : 'text-white/60'}`}>Results ({activeConfig.resultLabel})</div>
                         <div className="text-xl font-bold">{(Number(conversions)||0).toLocaleString()}</div>
                     </div>

                     <div className={`p-3 rounded-lg ${platform === 'google' ? 'bg-gray-50' : 'bg-white/10'}`}>
                         <div className={`text-xs mb-1 ${platform === 'google' ? 'text-gray-500' : 'text-white/60'}`}>Cost per Result</div>
                         <div className="text-xl font-bold">
                             {((Number(conversions)||0) > 0 ? (totalBudget / (Number(conversions)||0)) : 0).toLocaleString('vi-VN', {maximumFractionDigits: 0})} đ
                         </div>
                     </div>

                     <div className={`p-3 rounded-lg ${platform === 'google' ? 'bg-gray-50' : 'bg-white/10'}`}>
                         <div className={`text-xs mb-1 ${platform === 'google' ? 'text-gray-500' : 'text-white/60'}`}>Impressions</div>
                         <div className="text-xl font-bold">{(Number(imp)||0).toLocaleString()}</div>
                     </div>

                     <div className={`p-3 rounded-lg ${platform === 'google' ? 'bg-gray-50' : 'bg-white/10'}`}>
                         <div className={`text-xs mb-1 ${platform === 'google' ? 'text-gray-500' : 'text-white/60'}`}>ROAS</div>
                         <div className={`text-xl font-bold ${roas >= 2 ? (platform === 'google' ? 'text-green-600' : 'text-green-300') : ''}`}>
                             {roas.toFixed(2)}x
                         </div>
                     </div>

                 </div>

                 {/* Decor */}
                 {platform === 'tiktok' && <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>}
                 {platform === 'tiktok' && <div className="absolute -left-10 -top-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"></div>}
             </div>

             {/* 2. FUNNEL ANALYSIS CARD */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <BarChart2 size={18} /> Phân tích phễu & Doanh thu
                 </h3>
                 
                 <div className="flex flex-col md:flex-row gap-8 items-center">
                     {/* Funnel Visual */}
                     <div className="w-full md:w-1/2 space-y-2">
                         <div className="bg-gray-100 rounded p-2 flex justify-between items-center text-xs relative overflow-hidden group">
                             <div className="absolute left-0 top-0 bottom-0 bg-blue-100 w-full z-0 origin-left"></div>
                             <span className="relative z-10 font-bold text-gray-700 ml-2">Impressions</span>
                             <span className="relative z-10 font-mono text-gray-600 mr-2">{(Number(imp)||0).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-center"><div className="w-0.5 h-3 bg-gray-300"></div></div>
                         
                         <div className="bg-gray-100 rounded p-2 flex justify-between items-center text-xs relative overflow-hidden mx-4">
                             <div className="absolute left-0 top-0 bottom-0 bg-blue-200 w-full z-0 origin-left" style={{width: '60%'}}></div>
                             <span className="relative z-10 font-bold text-gray-700 ml-2">Clicks</span>
                             <span className="relative z-10 font-mono text-gray-600 mr-2">{(Number(clicks)||0).toLocaleString()}</span>
                             <span className="absolute right-[-40px] group-hover:right-2 text-[10px] bg-white px-1 rounded shadow text-blue-600 font-bold transition-all">CTR: {ctr.toFixed(2)}%</span>
                         </div>
                         <div className="flex justify-center"><div className="w-0.5 h-3 bg-gray-300"></div></div>

                         <div className="bg-gray-100 rounded p-2 flex justify-between items-center text-xs relative overflow-hidden mx-8">
                             <div className="absolute left-0 top-0 bottom-0 bg-blue-300 w-full z-0 origin-left" style={{width: '30%'}}></div>
                             <span className="relative z-10 font-bold text-gray-700 ml-2">{activeConfig.resultLabel}</span>
                             <span className="relative z-10 font-mono text-gray-600 mr-2">{(Number(conversions)||0).toLocaleString()}</span>
                             <span className="absolute right-[-40px] group-hover:right-2 text-[10px] bg-white px-1 rounded shadow text-blue-600 font-bold transition-all">CR: {conversionRate.toFixed(2)}%</span>
                         </div>
                         <div className="flex justify-center"><div className="w-0.5 h-3 bg-gray-300"></div></div>

                         <div className="bg-green-50 rounded p-2 flex justify-between items-center text-xs relative overflow-hidden mx-12 border border-green-200">
                             <span className="relative z-10 font-bold text-green-800 ml-2">Đơn hàng (Sales)</span>
                             <span className="relative z-10 font-mono text-green-700 font-bold mr-2">{estOrders.toLocaleString()}</span>
                         </div>
                     </div>

                     {/* Revenue Box */}
                     <div className="w-full md:w-1/2 bg-gray-50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-gray-100">
                         <div className="text-gray-500 text-xs font-bold uppercase mb-2">Doanh thu ước tính</div>
                         <div className="text-3xl font-extrabold text-gray-800 mb-2">
                             {estRevenue.toLocaleString('vi-VN')} đ
                         </div>
                         <div className={`text-sm font-bold px-3 py-1 rounded-full ${roas >= 4 ? 'bg-green-100 text-green-700' : roas >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                             ROAS: {roas.toFixed(2)}x
                         </div>
                         
                         <div className="mt-6 w-full pt-4 border-t border-gray-200 flex justify-between text-sm">
                             <span className="text-gray-500">Lợi nhuận (Gross):</span>
                             <span className={`font-bold ${estRevenue - totalBudget > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                 {(estRevenue - totalBudget).toLocaleString('vi-VN')} đ
                             </span>
                         </div>
                     </div>
                 </div>
             </div>

         </div>

      </div>
    </div>
  );
};

export default BudgetPlanner;
