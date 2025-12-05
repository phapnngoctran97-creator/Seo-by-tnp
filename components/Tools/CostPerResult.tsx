
import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface ChannelData {
  id: string;
  name: string;
  spend: number;
  results: number; // Conversions, Leads, Purchases
  cpr: number; // Cost Per Result
}

const CostPerResult: React.FC = () => {
  const [channels, setChannels] = useState<ChannelData[]>([
    { id: '1', name: 'Facebook Ads', spend: 5000000, results: 50, cpr: 100000 },
    { id: '2', name: 'Google Search', spend: 3000000, results: 40, cpr: 75000 },
    { id: '3', name: 'TikTok Ads', spend: 2000000, results: 25, cpr: 80000 },
  ]);

  const updateChannel = (id: string, field: keyof ChannelData, value: any) => {
    setChannels(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        // Recalculate CPR
        if (field === 'spend' || field === 'results') {
           updated.cpr = updated.results > 0 ? updated.spend / updated.results : 0;
        }
        return updated;
      }
      return c;
    }));
  };

  const addChannel = () => {
    setChannels([...channels, { id: Math.random().toString(), name: 'New Channel', spend: 0, results: 0, cpr: 0 }]);
  };

  const removeChannel = (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
  };

  // Stats
  const totalSpend = channels.reduce((sum, c) => sum + c.spend, 0);
  const totalResults = channels.reduce((sum, c) => sum + c.results, 0);
  const avgCpr = totalResults > 0 ? totalSpend / totalResults : 0;
  
  // Find Best/Worst
  const sortedByCpr = [...channels].filter(c => c.results > 0).sort((a, b) => a.cpr - b.cpr);
  const bestChannel = sortedByCpr[0];
  const worstChannel = sortedByCpr[sortedByCpr.length - 1];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-cyan-600" /> So Sánh Hiệu Quả Kênh (Cost Per Result)
        </h2>
        <p className="text-gray-600 mt-1">Tìm ra kênh quảng cáo giá rẻ nhất và hiệu quả nhất (CPA/CPL).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: INPUT TABLE */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-700">Dữ liệu kênh</h3>
               <button onClick={addChannel} className="flex items-center gap-1 text-xs bg-cyan-600 text-white px-3 py-1.5 rounded hover:bg-cyan-700 transition-colors">
                   <Plus size={14} /> Thêm Kênh
               </button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-2 py-3 text-left">Kênh</th>
                            <th className="px-2 py-3 text-left">Chi phí</th>
                            <th className="px-2 py-3 text-left">Kết quả</th>
                            <th className="px-2 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {channels.map((c) => (
                            <tr key={c.id}>
                                <td className="px-2 py-2">
                                    <input 
                                       value={c.name}
                                       onChange={(e) => updateChannel(c.id, 'name', e.target.value)}
                                       className="w-full bg-transparent outline-none font-medium text-gray-800"
                                       placeholder="Tên kênh..."
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input 
                                       type="number"
                                       value={c.spend}
                                       onChange={(e) => updateChannel(c.id, 'spend', parseFloat(e.target.value) || 0)}
                                       className="w-24 p-1 border rounded text-right focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input 
                                       type="number"
                                       value={c.results}
                                       onChange={(e) => updateChannel(c.id, 'results', parseFloat(e.target.value) || 0)}
                                       className="w-20 p-1 border rounded text-right focus:ring-1 focus:ring-cyan-500 outline-none"
                                    />
                                </td>
                                <td className="px-2 py-2 text-center">
                                    <button onClick={() => removeChannel(c.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <div className="text-right">
                    <div>{totalSpend.toLocaleString('vi-VN')} đ</div>
                    <div className="text-xs text-gray-500 font-normal">{totalResults} kết quả</div>
                </div>
            </div>
        </div>

        {/* RIGHT: CHART & ANALYSIS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 min-h-[400px]">
                <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                   <BarChart2 size={18} /> Biểu đồ chi phí trên mỗi kết quả (CPA/CPL)
                </h3>
                
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={channels} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickFormatter={(val) => val.toLocaleString()} />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                            <Tooltip 
                                formatter={(value: number) => [value.toLocaleString('vi-VN') + ' đ', 'Chi phí/Kết quả']}
                                cursor={{fill: '#f0f9ff'}}
                            />
                            <ReferenceLine x={avgCpr} stroke="red" strokeDasharray="3 3" label={{ position: 'top', value: 'TB', fill: 'red', fontSize: 10 }} />
                            <Bar dataKey="cpr" fill="#0891b2" barSize={30} radius={[0, 4, 4, 0]}>
                                {channels.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.cpr > avgCpr ? '#ef4444' : '#22c55e'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-4 justify-center text-xs mt-2">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Tốt hơn trung bình</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Kém hơn trung bình</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 border border-dashed border-red-500"></span> Trung bình thị trường: {avgCpr.toLocaleString('vi-VN')}đ</div>
                </div>
            </div>

            <div className="bg-cyan-50 p-5 rounded-xl border border-cyan-100 text-sm text-cyan-900">
                <h4 className="font-bold mb-2">Phân tích nhanh</h4>
                {bestChannel && (
                    <p className="mb-2">🏆 <strong>{bestChannel.name}</strong> đang là kênh hiệu quả nhất với chi phí <strong>{bestChannel.cpr.toLocaleString('vi-VN')}đ</strong> / kết quả.</p>
                )}
                {worstChannel && worstChannel.id !== bestChannel?.id && (
                    <p>⚠️ <strong>{worstChannel.name}</strong> đang có chi phí cao nhất (<strong>{worstChannel.cpr.toLocaleString('vi-VN')}đ</strong>). Cần tối ưu lại nội dung hoặc target.</p>
                )}
                {channels.length > 0 && (
                    <p className="mt-2 pt-2 border-t border-cyan-200">
                        Chi phí trung bình của bạn là <strong>{avgCpr.toLocaleString('vi-VN')}đ</strong>. Bạn nên dồn ngân sách vào các kênh có cột màu xanh lá cây.
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CostPerResult;
