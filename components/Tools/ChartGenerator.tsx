import React, { useState } from 'react';
import { 
  BarChartBig, Plus, Trash2, PieChart as PieIcon, Activity, LineChart as LineIcon, Layers, Sparkles, Loader2, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { analyzeChartData } from '../../services/geminiService';

interface DataSeries {
  id: string;
  name: string;
  color: string;
  type: 'bar' | 'line' | 'area'; // For composed chart specificity
}

interface ChartRow {
  id: string;
  label: string;
  [key: string]: any; // Dynamic values: val_seriesId
}

const ChartGenerator: React.FC = () => {
  const [title, setTitle] = useState('Biểu đồ doanh số');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'composed'>('bar');
  
  // Dynamic Series Management
  const [seriesList, setSeriesList] = useState<DataSeries[]>([
    { id: 's1', name: 'Doanh thu', color: '#8b5cf6', type: 'bar' }
  ]);

  // Initial Data
  const [data, setData] = useState<ChartRow[]>([
    { id: '1', label: 'Tháng 1', s1: 4000 },
    { id: '2', label: 'Tháng 2', s1: 3000 },
    { id: '3', label: 'Tháng 3', s1: 5000 },
    { id: '4', label: 'Tháng 4', s1: 4500 },
  ]);

  // AI Analysis State
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- SERIES ACTIONS ---
  const addSeries = () => {
    if (seriesList.length >= 5) {
        alert("Tối đa 5 chuỗi dữ liệu để đảm bảo hiển thị tốt nhất.");
        return;
    }
    const newId = `s${Math.random().toString(36).substr(2, 5)}`;
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ec4899'];
    const nextColor = colors[seriesList.length % colors.length];
    
    setSeriesList([...seriesList, { id: newId, name: `Dữ liệu ${seriesList.length + 1}`, color: nextColor, type: 'line' }]);
    
    // Initialize empty values for new series
    setData(prev => prev.map(row => ({ ...row, [newId]: '' })));
  };

  const removeSeries = (id: string) => {
    if (seriesList.length <= 1) return;
    setSeriesList(prev => prev.filter(s => s.id !== id));
  };

  const updateSeries = (id: string, field: keyof DataSeries, val: any) => {
    setSeriesList(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  // --- DATA ACTIONS ---
  const addRow = () => {
    const newRow: ChartRow = { id: Math.random().toString(), label: `Mục ${data.length + 1}` };
    seriesList.forEach(s => newRow[s.id] = '');
    setData([...data, newRow]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  const updateRowData = (rowId: string, key: string, val: any) => {
    setData(data.map(row => row.id === rowId ? { ...row, [key]: val } : row));
  };

  // --- AI ANALYSIS ---
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    try {
      // Format data for AI
      const aiData = data.map(row => {
          const item: any = { label: row.label };
          seriesList.forEach(s => item[s.name] = row[s.id]);
          return item;
      });

      const descriptions = seriesList.map(s => `${s.name} (ID: ${s.id})`).join(', ');

      const result = await analyzeChartData(
        title, 
        chartType, 
        aiData,
        `Trục X: Nhãn (Thời gian/Mục). Các chuỗi dữ liệu: ${descriptions}`
      );
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("Có lỗi khi kết nối với AI. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- RENDER CHART ---
  const renderChart = () => {
    // CRITICAL FIX: Normalize data before rendering
    const processedData = data.map(row => {
        const cleanRow: any = { ...row };
        seriesList.forEach(s => {
            // Convert string to number, treat empty/invalid as 0
            cleanRow[s.id] = Number(row[s.id]) || 0;
        });
        return cleanRow;
    });

    // Fix Margins to prevent Axis clipping (Left: 40 for Y labels, Bottom: 20 for X labels)
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 40, bottom: 20 }
    };

    // Shared Axis Props to ensure consistency
    const axisProps = {
       // padding helps prevent first/last label cutoff
       xAxis: <XAxis dataKey="label" padding={{ left: 20, right: 20 }} minTickGap={30} />,
       // fixed width ensures Y axis labels don't get hidden
       yAxis: <YAxis width={60} allowDecimals={false} />
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            {seriesList.map(s => (
                <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={3} activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            {seriesList.map(s => (
                <Area key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.3} />
            ))}
          </AreaChart>
        );
      case 'pie':
        const firstSeries = seriesList[0];
        const pieData = processedData.map(d => ({ name: d.label, value: Number(d[firstSeries.id]) || 0 }));
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ec4899', '#6366f1'];
        
        return (
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val: number) => val.toLocaleString()} />
            <Legend />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold fill-gray-500">
                {firstSeries.name}
            </text>
          </PieChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            {seriesList.map((s, idx) => {
                const Component = s.type === 'bar' ? Bar : (s.type === 'area' ? Area : Line);
                return (
                    <Component 
                        key={s.id} 
                        type="monotone" 
                        dataKey={s.id} 
                        name={s.name} 
                        fill={s.color} 
                        stroke={s.color}
                        barSize={chartType === 'composed' ? undefined : 30}
                    />
                );
            })}
          </ComposedChart>
        );
      case 'bar':
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            {axisProps.xAxis}
            {axisProps.yAxis}
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
            {seriesList.map(s => (
                <Bar key={s.id} dataKey={s.id} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChartBig className="text-violet-600" /> Tạo Biểu Đồ Đa Năng (Multi-Series)
        </h2>
        <p className="text-gray-600 mt-1">So sánh nhiều dữ liệu, tùy chỉnh màu sắc và phân tích AI.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: CONFIG */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
           
           {/* Top Config */}
           <div className="space-y-4 mb-4 flex-shrink-0">
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full p-2 border rounded font-bold text-gray-700 focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="Tiêu đề biểu đồ..."
              />
              
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                 {['bar', 'line', 'area', 'pie', 'composed'].map((t) => (
                     <button
                        key={t}
                        onClick={() => setChartType(t as any)}
                        className={`flex-1 py-1.5 rounded text-xs font-medium uppercase transition-all ${chartType === t ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         {t}
                     </button>
                 ))}
              </div>
           </div>

           {/* Series Manager */}
           <div className="flex-shrink-0 border-b border-gray-200 pb-4 mb-4">
               <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-500 uppercase">Chuỗi dữ liệu (Series)</span>
                   <button onClick={addSeries} className="text-xs flex items-center gap-1 text-violet-600 hover:bg-violet-50 px-2 py-1 rounded">
                       <Plus size={12} /> Thêm
                   </button>
               </div>
               <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                   {seriesList.map((s) => (
                       <div key={s.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                           <input 
                              type="color" 
                              value={s.color} 
                              onChange={e => updateSeries(s.id, 'color', e.target.value)} 
                              className="w-6 h-6 p-0 border rounded cursor-pointer flex-shrink-0"
                           />
                           <input 
                              value={s.name} 
                              onChange={e => updateSeries(s.id, 'name', e.target.value)} 
                              className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                              placeholder="Tên..."
                           />
                           {chartType === 'composed' && (
                               <select 
                                  value={s.type} 
                                  onChange={e => updateSeries(s.id, 'type', e.target.value)}
                                  className="text-xs border rounded p-1 bg-white"
                               >
                                   <option value="bar">Cột</option>
                                   <option value="line">Đường</option>
                                   <option value="area">Vùng</option>
                               </select>
                           )}
                           {seriesList.length > 1 && (
                               <button onClick={() => removeSeries(s.id)} className="text-gray-400 hover:text-red-500">
                                   <Trash2 size={14} />
                               </button>
                           )}
                       </div>
                   ))}
               </div>
           </div>

           {/* Data Table */}
           <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-700 text-sm">Dữ liệu chi tiết</h3>
               <button onClick={addRow} className="text-xs flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">
                   <Plus size={12} /> Dòng
               </button>
           </div>

           <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
               <table className="w-full text-sm">
                   <thead className="bg-gray-50 sticky top-0 z-10">
                       <tr>
                           <th className="p-2 text-left text-xs font-semibold text-gray-500 w-24">Nhãn</th>
                           {seriesList.map(s => (
                               <th key={s.id} className="p-2 text-left text-xs font-semibold text-gray-500 min-w-[80px]" style={{color: s.color}}>
                                   {s.name}
                               </th>
                           ))}
                           <th className="w-8"></th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {data.map((row) => (
                           <tr key={row.id} className="group hover:bg-gray-50">
                               <td className="p-1">
                                   <input 
                                      value={row.label} 
                                      onChange={e => updateRowData(row.id, 'label', e.target.value)}
                                      className="w-full p-1 bg-transparent focus:bg-white rounded border border-transparent focus:border-violet-300 outline-none"
                                   />
                               </td>
                               {seriesList.map(s => (
                                   <td key={s.id} className="p-1">
                                       <input 
                                          type="number"
                                          value={row[s.id]} 
                                          onChange={e => updateRowData(row.id, s.id, e.target.value)}
                                          className="w-full p-1 bg-transparent focus:bg-white rounded border border-transparent focus:border-violet-300 outline-none"
                                          placeholder="0"
                                       />
                                   </td>
                               ))}
                               <td className="p-1 text-center">
                                   <button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Trash2 size={14} />
                                   </button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
        </div>

        {/* RIGHT: PREVIEW & AI */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Chart Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-6 min-h-[450px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all disabled:opacity-70 text-sm"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {isAnalyzing ? 'Đang đọc...' : 'Phân tích AI'}
                    </button>
                </div>
                
                <div className="flex-1 w-full min-h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Analysis Result */}
            {analysisResult && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-violet-100 animate-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-violet-800 mb-4 flex items-center gap-2">
                        <Sparkles size={18} /> Nhận xét từ AI
                    </h3>
                    <div className="prose prose-violet max-w-none text-sm text-gray-700 leading-relaxed">
                        <div className="whitespace-pre-wrap">{analysisResult}</div>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ChartGenerator;