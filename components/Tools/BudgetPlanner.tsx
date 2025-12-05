
import React, { useState } from 'react';
import { PieChart, Target } from 'lucide-react';

const BudgetPlanner: React.FC = () => {
  const [targetLeads, setTargetLeads] = useState<number | ''>('');
  const [cpl, setCpl] = useState<number | ''>(''); // Cost per Lead expected
  const [closeRate, setCloseRate] = useState<number | ''>(20); // % chốt sale
  const [productPrice, setProductPrice] = useState<number | ''>('');

  // Input Handler
  const handleNumChange = (val: string, setter: (v: number | '') => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '') setter('');
    else if (!isNaN(Number(raw))) setter(Number(raw));
  };

  const fmt = (num: number | '') => num === '' ? '' : num.toLocaleString('en-US');

  // Derived stats
  const budget = (Number(targetLeads) || 0) * (Number(cpl) || 0);
  const sales = (Number(targetLeads) || 0) * ((Number(closeRate) || 0) / 100);
  const revenue = sales * (Number(productPrice) || 0);
  const profit = revenue - budget;
  const roas = budget > 0 ? revenue / budget : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <PieChart className="text-indigo-600" /> Dự Tính Ngân Sách Marketing
        </h2>
        <p className="text-gray-600 mt-1">Lập kế hoạch ngân sách cần thiết để đạt mục tiêu doanh số.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Target size={18}/> Mục tiêu của bạn</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Số khách hàng tiềm năng (Leads) muốn có</label>
                  <input 
                    type="text" 
                    value={fmt(targetLeads)} 
                    onChange={e => handleNumChange(e.target.value, setTargetLeads)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="VD: 100" 
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Chi phí chấp nhận trên mỗi Lead (CPL dự kiến)</label>
                  <input 
                    type="text" 
                    value={fmt(cpl)} 
                    onChange={e => handleNumChange(e.target.value, setCpl)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="VD: 50,000" 
                  />
               </div>
               <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tỷ lệ chốt sale (%)</label>
                  <input 
                    type="number" 
                    value={closeRate} 
                    onChange={e => setCloseRate(parseFloat(e.target.value))} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="VD: 20" 
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Giá trị đơn hàng trung bình</label>
                  <input 
                    type="text" 
                    value={fmt(productPrice)} 
                    onChange={e => handleNumChange(e.target.value, setProductPrice)} 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="VD: 500,000" 
                  />
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg">
               <h3 className="text-sm font-medium text-indigo-100 uppercase mb-2">Ngân sách dự kiến cần chi</h3>
               <div className="text-4xl font-bold flex items-center gap-1">
                  {budget.toLocaleString('vi-VN')} <span className="text-lg font-normal">VNĐ</span>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
               <h3 className="font-bold text-gray-700 mb-4">Kết quả dự báo</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                     <span className="text-gray-600">Số đơn hàng dự kiến (Sales)</span>
                     <span className="font-bold text-gray-800 text-lg">{Math.round(sales)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                     <span className="text-gray-600">Doanh thu dự kiến</span>
                     <span className="font-bold text-gray-800 text-lg">{revenue.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                     <span className="text-gray-600">Lợi nhuận (Chưa trừ giá vốn)</span>
                     <span className={`font-bold text-lg ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>{profit.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">ROAS Dự kiến</span>
                     <span className="font-bold text-indigo-600 text-lg">{roas.toFixed(2)}x</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
