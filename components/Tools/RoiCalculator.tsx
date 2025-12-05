import React, { useState } from 'react';
import { TrendingUp, Plus, Trash2, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface Channel {
  id: string;
  name: string;
  cost: number;
  revenue: number;
}

const RoiCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pnl' | 'channels'>('pnl');

  const [revenue, setRevenue] = useState<number | ''>('');
  const [cogs, setCogs] = useState<number | ''>('');
  const [adsCost, setAdsCost] = useState<number | ''>('');
  const [shipping, setShipping] = useState<number | ''>('');
  const [opsCost, setOpsCost] = useState<number | ''>('');

  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'Facebook Ads', cost: 5000000, revenue: 15000000 },
    { id: '2', name: 'Google Ads', cost: 3000000, revenue: 8000000 },
  ]);

  const handleNumChange = (val: string, setter: (v: number | '') => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '') setter('');
    else if (!isNaN(Number(raw))) setter(Number(raw));
  };

  const fmt = (num: number | '') => num === '' ? '' : num.toLocaleString('en-US');

  const totalRev = Number(revenue) || 0;
  const totalCost =
    (Number(cogs) || 0) +
    (Number(adsCost) || 0) +
    (Number(shipping) || 0) +
    (Number(opsCost) || 0);

  const netProfit = totalRev - totalCost;
  const margin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;
  const roi =
    (Number(adsCost) || 0) > 0
      ? ((totalRev - totalCost) / (Number(adsCost) || 0)) * 100
      : 0;

  const roas =
    (Number(adsCost) || 0) > 0 ? totalRev / (Number(adsCost) || 0) : 0;

  const breakEvenRoas =
    totalRev > 0
      ? 1 /
        (1 -
          ((Number(cogs) || 0) +
            (Number(shipping) || 0) +
            (Number(opsCost) || 0)) /
            totalRev)
      : 0;

  const costData = [
    { name: 'Giá vốn (COGS)', value: Number(cogs) || 0, color: '#64748b' },
    { name: 'Quảng cáo (Ads)', value: Number(adsCost) || 0, color: '#f59e0b' },
    { name: 'Vận chuyển', value: Number(shipping) || 0, color: '#3b82f6' },
    { name: 'Vận hành', value: Number(opsCost) || 0, color: '#a855f7' },
  ].filter((i) => i.value > 0);

  const addChannel = () => {
    setChannels([
      ...channels,
      { id: Math.random().toString(), name: 'New Channel', cost: 0, revenue: 0 },
    ]);
  };

  const updateChannel = (id: string, field: keyof Channel, value: any) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeChannel = (id: string) => {
    setChannels((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-green-600" /> Tính ROI & Lãi Lỗ (P&L)
          </h2>
          <p className="text-gray-600 mt-1">
            Phân tích hiệu quả kinh doanh và so sánh kênh quảng cáo.
          </p>
        </div>

        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'pnl'
                ? 'bg-green-100 text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tổng Quan (P&L)
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'channels'
                ? 'bg-green-100 text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            So Sánh Kênh
          </button>
        </div>
      </div>

      {activeTab === 'pnl' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
                1. Doanh Thu
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tổng doanh thu (Revenue)
                </label>
                <input
                  type="text"
                  value={fmt(revenue)}
                  onChange={(e) => handleNumChange(e.target.value, setRevenue)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold text-green-700"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
                2. Chi Phí
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Giá vốn hàng bán (COGS)
                  </label>
                  <input
                    type="text"
                    value={fmt(cogs)}
                    onChange={(e) => handleNumChange(e.target.value, setCogs)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Chi phí Marketing / Ads
                  </label>
                  <input
                    type="text"
                    value={fmt(adsCost)}
                    onChange={(e) => handleNumChange(e.target.value, setAdsCost)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Chi phí Vận chuyển / Hoàn hàng
                  </label>
                  <input
                    type="text"
                    value={fmt(shipping)}
                    onChange={(e) => handleNumChange(e.target.value, setShipping)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Chi phí Vận hành / Nhân sự / Khác
                  </label>
                  <input
                    type="text"
                    value={fmt(opsCost)}
                    onChange={(e) => handleNumChange(e.target.value, setOpsCost)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between font-bold text-red-600">
                <span>Tổng chi phí:</span>
                <span>{totalCost.toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">
                Lợi nhuận ròng (Net Profit)
              </h3>

              <div
                className={`text-5xl font-bold mb-4 ${
                  netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {netProfit.toLocaleString('vi-VN')}{' '}
                <span className="text-xl text-gray-400 font-normal">VNĐ</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <div className="text-xs text-gray-400">Net Margin</div>
                  <div
                    className={`text-xl font-bold ${
                      margin >= 20
                        ? 'text-green-400'
                        : margin > 0
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {margin.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">ROAS Thực</div>
                  <div className="text-xl font-bold text-blue-400">
                    {roas.toFixed(2)}x
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">ROAS Hòa Vốn</div>
                  <div className="text-xl font-bold text-orange-400">
                    {isFinite(breakEvenRoas) ? breakEvenRoas.toFixed(2) : 0}x
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400">ROI (trên Ads)</div>
                  <div className="text-xl font-bold text-purple-400">
                    {roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h4 className="font-bold text-gray-700 mb-4">
                  Cơ cấu chi phí
                </h4>

                {costData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {costData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) =>
                            value.toLocaleString('vi-VN')
                          }
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg">
                    Chưa có dữ liệu chi phí
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 text-sm">
                <h4 className="font-bold text-gray-700 mb-2">
                  Phân tích nhanh
                </h4>

                <ul className="space-y-2">
                  {margin < 15 && (
                    <li className="text-red-600 flex gap-2">
                      <ArrowRight size={16} /> Biên lợi nhuận mỏng (
                      {margin.toFixed(1)}%). Cần giảm COGS hoặc tăng giá bán.
                    </li>
                  )}

                  {roas < breakEvenRoas && (
                    <li className="text-red-600 flex gap-2">
                      <ArrowRight size={16} /> Đang lỗ quảng cáo. ROAS hiện tại
                      ({roas.toFixed(2)}) thấp hơn điểm hòa vốn (
                      {breakEvenRoas.toFixed(2)}).
                    </li>
                  )}

                  {adsCost && Number(adsCost) / totalRev > 0.4 && (
                    <li className="text-orange-600 flex gap-2">
                      <ArrowRight size={16} /> Chi phí Marketing chiếm &gt; 40%
                      doanh thu. Khá rủi ro.
                    </li>
                  )}

                  {margin >= 20 && roas > breakEvenRoas && (
                    <li className="text-green-600 flex gap-2">
                      <ArrowRight size={16} /> Mô hình kinh doanh đang khỏe
                      mạnh. Có thể scale ngân sách.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">
              So Sánh Hiệu Quả Các Kênh (Channel Mixer)
            </h3>
            <button
              onClick={addChannel}
              className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100"
            >
              <Plus size={16} /> Thêm Kênh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Tên Kênh</th>
                  <th className="px-4 py-3">Chi Phí (Cost)</th>
                  <th className="px-4 py-3">Doanh Thu (Rev)</th>
                  <th className="px-4 py-3">ROAS</th>
                  <th className="px-4 py-3">CIR</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>

              <tbody>
                {channels.map((channel) => {
                  const chRoas =
                    channel.cost > 0 ? channel.revenue / channel.cost : 0;
                  const cir =
                    channel.revenue > 0
                      ? (channel.cost / channel.revenue) * 100
                      : 0;

                  return (
                    <tr
                      key={channel.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <input
                          value={channel.name}
                          onChange={(e) =>
                            updateChannel(channel.id, 'name', e.target.value)
                          }
                          className="bg-transparent border-none focus:ring-0 w-full font-medium text-gray-800"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={channel.cost.toLocaleString('en-US')}
                          onChange={(e) =>
                            updateChannel(
                              channel.id,
                              'cost',
                              parseFloat(e.target.value.replace(/,/g, '')) || 0
                            )
                          }
                          className="bg-white border border-gray-200 rounded p-1 w-32 focus:ring-1 focus:ring-green-500 outline-none"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={channel.revenue.toLocaleString('en-US')}
                          onChange={(e) =>
                            updateChannel(
                              channel.id,
                              'revenue',
                              parseFloat(e.target.value.replace(/,/g, '')) || 0
                            )
                          }
                          className="bg-white border border-gray-200 rounded p-1 w-32 focus:ring-1 focus:ring-green-500 outline-none"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            chRoas >= 4
                              ? 'text-green-600'
                              : chRoas >= 2
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {chRoas.toFixed(2)}x
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {cir.toFixed(1)}%
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeChannel(channel.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="bg-gray-100 font-bold text-gray-800">
                <tr>
                  <td className="px-4 py-3">Tổng cộng</td>
                  <td className="px-4 py-3">
                    {channels
                      .reduce((sum, c) => sum + c.cost, 0)
                      .toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    {channels
                      .reduce((sum, c) => sum + c.revenue, 0)
                      .toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-blue-600">
                    {(
                      channels.reduce((sum, c) => sum + c.revenue, 0) /
                      (channels.reduce((sum, c) => sum + c.cost, 0) || 1)
                    ).toFixed(2)}
                    x
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoiCalculator;
