
import React, { useState } from 'react';
import { PieChart, Target, Calculator, Eye, MousePointer2, MessageCircle, Users, Video } from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  // Inputs for Volume (Mục tiêu số lượng)
  const [targetImp, setTargetImp] = useState<number | ''>('');
  const [targetReach, setTargetReach] = useState<number | ''>('');
  const [targetClicks, setTargetClicks] = useState<number | ''>('');
  const [targetViews, setTargetViews] = useState<number | ''>('');
  const [targetMess, setTargetMess] = useState<number | ''>('');

  // Inputs for Cost (Chi phí đơn vị)
  const [cpm, setCpm] = useState<number | ''>(''); // Cost per 1000 Impressions
  const [costPerReach, setCostPerReach] = useState<number | ''>(''); // Cost per 1 Reach
  const [cpc, setCpc] = useState<number | ''>(''); // Cost per Click
  const [cpv, setCpv] = useState<number | ''>(''); // Cost per View
  const [costPerMess, setCostPerMess] = useState<number | ''>(''); // Cost per Mess

  // Revenue Projection Inputs
  const [avgOrderValue, setAvgOrderValue] = useState<number | ''>('');
  const [estConversionRate, setEstConversionRate] = useState<number | ''>(5); // Default 5%

  // Input Handler
  const handleNumChange = (val: string, setter: (v: number | '') => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '') setter('');
    else if (!isNaN(Number(raw))) setter(Number(raw));
  };

  const fmt = (num: number | '') => num === '' ? '' : num.toLocaleString('en-US');

  // Calculations
  const budgetImp = ((Number(targetImp) || 0) / 1000) * (Number(cpm) || 0);
  const budgetReach = (Number(targetReach) || 0) * (Number(costPerReach) || 0);
  const budgetClick = (Number(targetClicks) || 0) * (Number(cpc) || 0);
  const budgetView = (Number(targetViews) || 0) * (Number(cpv) || 0);
  const budgetMess = (Number(targetMess) || 0) * (Number(costPerMess) || 0);

  const totalBudget = budgetImp + budgetReach + budgetClick + budgetView + budgetMess;

  // Projection Logic
  // We prioritize metrics closer to purchase: Mess > Click > View > Reach > Imp
  let projectionBase = 0;
  let projectionSource = '';

  if (Number(targetMess) > 0) {
      projectionBase = Number(targetMess);
      projectionSource = 'Tin nhắn (Mess)';
  } else if (Number(targetClicks) > 0) {
      projectionBase = Number(targetClicks);
      projectionSource = 'Lượt Click';
  } else if (Number(targetViews) > 0) {
      projectionBase = Number(targetViews);
      projectionSource = 'Lượt Xem';
  }

  const estOrders = Math.floor(projectionBase * ((Number(estConversionRate) || 0) / 100));
  const estRevenue = estOrders * (Number(avgOrderValue) || 0);
  const estProfit = estRevenue - totalBudget;
  const estRoas = totalBudget > 0 ? estRevenue / totalBudget : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <PieChart className="text-indigo-600" /> Lập Kế Hoạch Ngân Sách (Media Plan)
        </h2>
        <p className="text-gray-600 mt-1">Tính toán chi phí dựa trên Impression, Reach, Click, View hoặc Messaging.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* LEFT: INPUT GRID */}
         <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                   <Target size={18}/> Mục tiêu & Đơn giá
               </h3>
               
               <div className="space-y-6">
                   {/* 1. Awareness */}
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                               <Eye size={14} /> Impression (Lượt hiển thị)
                           </label>
                           <input 
                                type="text" value={fmt(targetImp)} onChange={e => handleNumChange(e.target.value, setTargetImp)} 
                                className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="VD: 1,000,000" 
                           />
                       </div>
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                               CPM (Giá / 1000 lần)
                           </label>
                           <input 
                                type="text" value={fmt(cpm)} onChange={e => handleNumChange(e.target.value, setCpm)} 
                                className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="VD: 20,000" 
                           />
                       </div>
                       <div className="md:col-span-4 text-right">
                           <div className="text-xs text-gray-400 mb-1">Thành tiền</div>
                           <div className="font-bold text-indigo-600">{budgetImp.toLocaleString('vi-VN')} đ</div>
                       </div>
                   </div>

                   {/* 2. Reach */}
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                               <Users size={14} /> Reach (Tiếp cận)
                           </label>
                           <input 
                                type="text" value={fmt(targetReach)} onChange={e => handleNumChange(e.target.value, setTargetReach)} 
                                className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="VD: 500,000" 
                           />
                       </div>
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                               Cost per Reach (Giá / người)
                           </label>
                           <input 
                                type="text" value={fmt(costPerReach)} onChange={e => handleNumChange(e.target.value, setCostPerReach)} 
                                className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="VD: 50" 
                           />
                       </div>
                       <div className="md:col-span-4 text-right">
                           <div className="text-xs text-gray-400 mb-1">Thành tiền</div>
                           <div className="font-bold text-indigo-600">{budgetReach.toLocaleString('vi-VN')} đ</div>
                       </div>
                   </div>

                   {/* 3. Traffic */}
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-blue-50 p-3 rounded-lg border border-blue-100">
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-blue-800 uppercase mb-1">
                               <MousePointer2 size={14} /> Click (Lượt nhấn)
                           </label>
                           <input 
                                type="text" value={fmt(targetClicks)} onChange={e => handleNumChange(e.target.value, setTargetClicks)} 
                                className="w-full p-2 border rounded focus:ring-blue-500 outline-none text-sm" placeholder="VD: 5,000" 
                           />
                       </div>
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-blue-800 uppercase mb-1">
                               CPC (Giá / Click)
                           </label>
                           <input 
                                type="text" value={fmt(cpc)} onChange={e => handleNumChange(e.target.value, setCpc)} 
                                className="w-full p-2 border rounded focus:ring-blue-500 outline-none text-sm" placeholder="VD: 3,000" 
                           />
                       </div>
                       <div className="md:col-span-4 text-right">
                           <div className="text-xs text-gray-400 mb-1">Thành tiền</div>
                           <div className="font-bold text-blue-600">{budgetClick.toLocaleString('vi-VN')} đ</div>
                       </div>
                   </div>

                   {/* 4. Video */}
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                               <Video size={14} /> View (Lượt xem)
                           </label>
                           <input 
                                type="text" value={fmt(targetViews)} onChange={e => handleNumChange(e.target.value, setTargetViews)} 
                                className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="VD: 10,000" 
                           />
                       </div>
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                               CPV (Giá / View)
                           </label>
                           <input 
                                type="text" value={fmt(cpv)} onChange={e => handleNumChange(e.target.value, setCpv)} 
                                className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="VD: 200" 
                           />
                       </div>
                       <div className="md:col-span-4 text-right">
                           <div className="text-xs text-gray-400 mb-1">Thành tiền</div>
                           <div className="font-bold text-indigo-600">{budgetView.toLocaleString('vi-VN')} đ</div>
                       </div>
                   </div>

                   {/* 5. Messaging */}
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-green-50 p-3 rounded-lg border border-green-100">
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-green-800 uppercase mb-1">
                               <MessageCircle size={14} /> Messaging (Tin nhắn)
                           </label>
                           <input 
                                type="text" value={fmt(targetMess)} onChange={e => handleNumChange(e.target.value, setTargetMess)} 
                                className="w-full p-2 border rounded focus:ring-green-500 outline-none text-sm font-bold" placeholder="VD: 200" 
                           />
                       </div>
                       <div className="md:col-span-4">
                           <label className="flex items-center gap-1 text-xs font-bold text-green-800 uppercase mb-1">
                               Cost per Mess (Giá / Tin)
                           </label>
                           <input 
                                type="text" value={fmt(costPerMess)} onChange={e => handleNumChange(e.target.value, setCostPerMess)} 
                                className="w-full p-2 border rounded focus:ring-green-500 outline-none text-sm" placeholder="VD: 50,000" 
                           />
                       </div>
                       <div className="md:col-span-4 text-right">
                           <div className="text-xs text-gray-400 mb-1">Thành tiền</div>
                           <div className="font-bold text-green-600">{budgetMess.toLocaleString('vi-VN')} đ</div>
                       </div>
                   </div>

               </div>
            </div>

            {/* REVENUE PROJECTION SECTION */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-90">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                   <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Calculator size={18}/> Dự báo Doanh thu (Ước tính)
                   </h3>
                   <div className="text-xs text-gray-500 italic">Dựa trên {projectionSource || 'số liệu nhập'}</div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Tỷ lệ chuyển đổi ra đơn (%)</label>
                          <input 
                            type="number" value={estConversionRate} onChange={e => setEstConversionRate(parseFloat(e.target.value))} 
                            className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="5" 
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Giá trị đơn hàng trung bình (AOV)</label>
                          <input 
                            type="text" value={fmt(avgOrderValue)} onChange={e => handleNumChange(e.target.value, setAvgOrderValue)} 
                            className="w-full p-2 border rounded focus:ring-indigo-500 outline-none text-sm" placeholder="500,000" 
                          />
                       </div>
                   </div>
                   
                   <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center space-y-2">
                       <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Số đơn dự kiến:</span>
                           <span className="font-bold text-gray-800">{estOrders}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Doanh thu dự kiến:</span>
                           <span className="font-bold text-gray-800">{estRevenue.toLocaleString('vi-VN')} đ</span>
                       </div>
                       <div className="flex justify-between pt-2 border-t border-gray-200">
                           <span className="text-sm font-bold text-gray-600">Lợi nhuận (tạm tính):</span>
                           <span className={`font-bold ${estProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {estProfit.toLocaleString('vi-VN')} đ
                           </span>
                       </div>
                       <div className="text-right text-xs text-indigo-600 font-bold mt-1">
                           ROAS: {estRoas.toFixed(2)}x
                       </div>
                   </div>
               </div>
            </div>
         </div>

         {/* RIGHT: SUMMARY CARD */}
         <div className="lg:col-span-4">
            <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg sticky top-6">
               <h3 className="text-sm font-medium text-indigo-100 uppercase mb-4">Tổng Ngân Sách Cần Có</h3>
               <div className="text-4xl font-bold flex flex-col gap-1 mb-6">
                  {totalBudget.toLocaleString('vi-VN')} 
                  <span className="text-sm font-normal opacity-80">VNĐ / Chiến dịch</span>
               </div>
               
               <div className="space-y-3 text-sm border-t border-indigo-500 pt-4">
                   {budgetImp > 0 && <div className="flex justify-between"><span>Hiển thị:</span> <span>{budgetImp.toLocaleString('vi-VN')} đ</span></div>}
                   {budgetReach > 0 && <div className="flex justify-between"><span>Tiếp cận:</span> <span>{budgetReach.toLocaleString('vi-VN')} đ</span></div>}
                   {budgetClick > 0 && <div className="flex justify-between"><span>Click:</span> <span>{budgetClick.toLocaleString('vi-VN')} đ</span></div>}
                   {budgetView > 0 && <div className="flex justify-between"><span>Video:</span> <span>{budgetView.toLocaleString('vi-VN')} đ</span></div>}
                   {budgetMess > 0 && <div className="flex justify-between"><span>Tin nhắn:</span> <span>{budgetMess.toLocaleString('vi-VN')} đ</span></div>}
               </div>

               <button 
                  onClick={() => {
                      setTargetImp(''); setTargetReach(''); setTargetClicks(''); setTargetViews(''); setTargetMess('');
                      setCpm(''); setCostPerReach(''); setCpc(''); setCpv(''); setCostPerMess('');
                      setAvgOrderValue('');
                  }}
                  className="w-full mt-8 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
               >
                  Làm mới
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
