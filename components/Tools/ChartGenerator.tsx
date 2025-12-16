
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChartBig, Plus, Trash2, PieChart as PieIcon, Activity, LineChart as LineIcon, 
  Layers, Sparkles, Loader2, ArrowUp, ArrowDown, Save, FolderOpen, X, Copy, Check,
  Settings, Download, Grid3X3, Type, RotateCw, AlignLeft, Image as ImageIcon,
  ChevronDown, ChevronRight, LayoutTemplate
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { analyzeChartData } from '../../services/geminiService';

interface DataSeries {
  id: string;
  name: string;
  color: string;
  type: 'bar' | 'line' | 'area';
  yAxisId: 'left' | 'right'; 
}

interface ChartRow {
  id: string;
  label: string;
  [key: string]: any; 
}

interface SavedChart {
  id: string;
  name: string;
  createdAt: number;
  config: {
    title: string;
    chartType: any;
    seriesList: DataSeries[];
    data: ChartRow[];
  }
}

const ChartGenerator: React.FC = () => {
  const [title, setTitle] = useState('Báo cáo Doanh thu & Chi phí');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'composed'>('composed');
  
  const [showGrid, setShowGrid] = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [rotateLabels, setRotateLabels] = useState(false);
  
  // Accordion State
  const [sections, setSections] = useState({
    library: false,
    config: true,
    series: true,
    data: true
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const [seriesList, setSeriesList] = useState<DataSeries[]>([
    { id: 's1', name: 'Doanh thu', color: '#1f2937', type: 'bar', yAxisId: 'left' }, // Changed to dark
    { id: 's2', name: 'Lợi nhuận (%)', color: '#4b5563', type: 'line', yAxisId: 'right' } // Changed to gray
  ]);

  const [data, setData] = useState<ChartRow[]>([
    { id: '1', label: 'Tháng 1', s1: 150000000, s2: 15 },
    { id: '2', label: 'Tháng 2', s1: 120000000, s2: 12 },
    { id: '3', label: 'Tháng 3', s1: 180000000, s2: 25 },
    { id: '4', label: 'Tháng 4', s1: 200000000, s2: 22 },
  ]);

  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);

  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

<<<<<<< HEAD
  const hasApiKey = !!process.env.API_KEY;

=======
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
  useEffect(() => {
    const saved = localStorage.getItem('saved_charts');
    if (saved) {
      try {
        setSavedCharts(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  const parseFriendlyNumber = (val: string): number | string => {
    if (!val) return '';
    const clean = val.toLowerCase().trim();
    if (clean.endsWith('k')) return parseFloat(clean) * 1000;
    if (clean.endsWith('m')) return parseFloat(clean) * 1000000;
    if (clean.endsWith('b')) return parseFloat(clean) * 1000000000;
    
    const standard = clean.replace(/,/g, '');
    return isNaN(Number(standard)) ? val : Number(standard);
  };

  const formatCompactNumber = (number: number) => {
    return Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(number);
  };

  const formatInputDisplay = (val: string | number) => {
    if (val === '' || val === undefined) return '';
    if (typeof val === 'number') return val.toLocaleString('en-US');
    return val;
  };

  const saveChart = () => {
    if (!saveName.trim()) {
      alert("Vui lòng đặt tên cho biểu đồ.");
      return;
    }
    const newChart: SavedChart = {
      id: Math.random().toString(36).substr(2, 9),
      name: saveName,
      createdAt: Date.now(),
      config: { title, chartType, seriesList, data }
    };
    const updated = [newChart, ...savedCharts];
    setSavedCharts(updated);
    localStorage.setItem('saved_charts', JSON.stringify(updated));
    setSaveName('');
    setShowSaveInput(false);
  };

  const loadChart = (chart: SavedChart) => {
    setTitle(chart.config.title);
    setChartType(chart.config.chartType);
    setSeriesList(chart.config.seriesList);
    setData(chart.config.data);
    setAnalysisResult('');
  };

  const deleteChart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Bạn có chắc muốn xóa biểu đồ này?")) {
      const updated = savedCharts.filter(c => c.id !== id);
      setSavedCharts(updated);
      localStorage.setItem('saved_charts', JSON.stringify(updated));
    }
  };

  const addSeries = () => {
    if (seriesList.length >= 6) {
        alert("Tối đa 6 chuỗi dữ liệu.");
        return;
    }
    const newId = `s${Math.random().toString(36).substr(2, 5)}`;
    // Darker color palette for high contrast
    const colors = ['#111827', '#4b5563', '#374151', '#000000', '#1f2937', '#6b7280'];
    const nextColor = colors[seriesList.length % colors.length];
    
    setSeriesList([...seriesList, { 
      id: newId, 
      name: `Dữ liệu ${seriesList.length + 1}`, 
      color: nextColor, 
      type: chartType === 'pie' ? 'bar' : 'bar',
      yAxisId: 'left'
    }]);
    
    setData(prev => prev.map(row => ({ ...row, [newId]: '' })));
  };

  const removeSeries = (id: string) => {
    if (seriesList.length <= 1) return;
    setSeriesList(prev => prev.filter(s => s.id !== id));
  };

  const updateSeries = (id: string, field: keyof DataSeries, val: any) => {
    setSeriesList(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const addRow = () => {
    const newRow: ChartRow = { id: Math.random().toString(), label: `Mục ${data.length + 1}` };
    seriesList.forEach(s => newRow[s.id] = '');
    setData([...data, newRow]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newData = [...data];
    if (direction === 'up') {
        if (index === 0) return;
        [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
    } else {
        if (index === newData.length - 1) return;
        [newData[index + 1], newData[index]] = [newData[index], newData[index + 1]];
    }
    setData(newData);
  };

  const updateRowData = (rowId: string, key: string, rawVal: string) => {
    let val: string | number = rawVal;
    
    if (key.startsWith('s')) {
       if (rawVal.match(/[kmbKMB]$/)) {
          val = rawVal; 
       } else {
          val = rawVal.replace(/,/g, ''); 
       }
    }
    setData(data.map(row => row.id === rowId ? { ...row, [key]: val } : row));
  };

  // --- EXPERT DOWNLOAD FUNCTION (ROBUST & HIGH RES) ---
  const handleDownloadImage = () => {
    if (!chartRef.current) {
        alert("Chưa có biểu đồ.");
        return;
    }

    const svgElement = chartRef.current.querySelector('.recharts-surface') as SVGSVGElement;
    if (!svgElement) {
        alert("Lỗi không tìm thấy biểu đồ.");
        return;
    }

    const { width, height } = svgElement.getBoundingClientRect();
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());
    clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bgRect.setAttribute("width", "100%");
    bgRect.setAttribute("height", "100%");
    bgRect.setAttribute("fill", "#ffffff");
    
    if (clonedSvg.firstChild) {
        clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
    } else {
        clonedSvg.appendChild(bgRect);
    }

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const canvas = document.createElement("canvas");
    const scale = 2;
    const padding = 40 * scale;
    const titleHeight = 60 * scale;
    
    canvas.width = (width * scale) + (padding * 2);
    canvas.height = (height * scale) + titleHeight + (padding * 2);
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#000000"; // Black Title
    ctx.font = `bold ${24 * scale}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, canvas.width/2, padding + (titleHeight/2));

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
        ctx.drawImage(img, padding, padding + titleHeight, width * scale, height * scale);
        
        const pngUrl = canvas.toDataURL("image/png", 1.0);
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${title.replace(/\s+/g, '_')}_chart.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    try {
      const aiData = data.map(row => {
          const item: any = { label: row.label };
          seriesList.forEach(s => {
             item[s.name] = parseFriendlyNumber(row[s.id] as string);
          });
          return item;
      });

      const descriptions = seriesList.map(s => `${s.name} (Trục: ${s.yAxisId === 'left' ? 'Trái' : 'Phải'})`).join(', ');

      const result = await analyzeChartData(
        title, 
        chartType, 
        aiData,
        `Trục X: Thời gian/Danh mục. Chuỗi số liệu: ${descriptions}`
      );
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("Có lỗi khi kết nối với AI. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyAnalysis = () => {
    navigator.clipboard.writeText(analysisResult);
    setCopiedAnalysis(true);
    setTimeout(() => setCopiedAnalysis(false), 2000);
  };

  const renderChart = () => {
    const processedData = data.map(row => {
        const cleanRow: any = { ...row };
        seriesList.forEach(s => {
            const raw = row[s.id];
            cleanRow[s.id] = typeof raw === 'string' ? parseFriendlyNumber(raw) : raw;
        });
        return cleanRow;
    });

    const hasLeft = seriesList.some(s => s.yAxisId === 'left');
    const hasRight = seriesList.some(s => s.yAxisId === 'right');

    const commonProps = {
      data: processedData,
      margin: { top: 20, right: hasRight ? 10 : 30, left: 10, bottom: rotateLabels ? 60 : 20 }
    };

    const AxisX = (
        <XAxis 
            dataKey="label" 
            padding={{ left: 20, right: 20 }} 
            angle={rotateLabels ? -45 : 0}
            textAnchor={rotateLabels ? "end" : "middle"}
            height={rotateLabels ? 80 : 30}
            tick={{fontSize: 12, fill: '#000'}} // Dark tick
            interval={0} 
        />
    );
    
    const YAxisLeft = <YAxis yAxisId="left" tickFormatter={formatCompactNumber} width={45} tick={{fontSize: 12, fill: '#000'}} />;
    const YAxisRight = <YAxis yAxisId="right" orientation="right" tickFormatter={formatCompactNumber} width={45} tick={{fontSize: 12, fill: '#000'}} />;
    
    const ChartTooltip = (
        <Tooltip 
            formatter={(value: any, name: string) => [Number(value).toLocaleString('en-US'), name]} 
            labelStyle={{fontWeight: 'bold', color: '#000'}}
            itemStyle={{ color: '#000' }}
            contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: '#000'}}
        />
    );

    const ChartGrid = showGrid ? <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" /> : null;

    if (chartType === 'pie') {
        const firstSeries = seriesList[0];
        const pieData = processedData.map(d => ({ name: d.label, value: Number(d[firstSeries.id]) || 0 }));
        const COLORS = ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'];
        return (
          <PieChart margin={commonProps.margin}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {ChartTooltip}
            <Legend wrapperStyle={{ color: '#000' }}/>
          </PieChart>
        );
    }

    return (
        <ComposedChart {...commonProps}>
            {ChartGrid}
            {AxisX}
            {hasLeft && YAxisLeft}
            {hasRight && YAxisRight}
            {ChartTooltip}
            <Legend wrapperStyle={{paddingTop: '10px', color: '#000'}}/>
            
            {seriesList.map((s) => {
                let ComponentType: any = Bar;
                if (chartType === 'line') ComponentType = Line;
                else if (chartType === 'area') ComponentType = Area;
                else if (chartType === 'composed') ComponentType = s.type === 'line' ? Line : (s.type === 'area' ? Area : Bar);

                const styleProps: any = {
                    key: s.id,
                    dataKey: s.id,
                    name: s.name,
                    yAxisId: s.yAxisId,
                    animationDuration: 1000
                };

                if (ComponentType === Bar) {
                    styleProps.fill = s.color;
                    styleProps.radius = [4, 4, 0, 0];
                    styleProps.maxBarSize = 60;
                } else if (ComponentType === Line) {
                    styleProps.type = "monotone";
                    styleProps.stroke = s.color;
                    styleProps.strokeWidth = 3;
                    styleProps.dot = { r: 4, strokeWidth: 2, fill: '#fff' };
                    styleProps.activeDot = { r: 7 };
                } else if (ComponentType === Area) {
                    styleProps.type = "monotone";
                    styleProps.stroke = s.color;
                    styleProps.fill = s.color;
                    styleProps.fillOpacity = 0.3;
                }

                return (
                    <ComponentType {...styleProps}>
                        {showValues && (
                            <LabelList 
                                dataKey={s.id} 
                                position="top" 
                                formatter={(val: number) => formatCompactNumber(val)}
                                style={{fontSize: 10, fill: '#000', fontWeight: 'bold'}}
                            />
                        )}
                    </ComponentType>
                );
            })}
        </ComposedChart>
    );
  };

  return (
    <div className="max-w-[95%] mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <BarChartBig className="text-black" /> Tạo Biểu Đồ Chuyên Nghiệp
            </h2>
            <p className="text-black mt-1 font-medium">Hỗ trợ nhập 1k, 1m, tùy chỉnh trục kép và xuất báo cáo ảnh PNG.</p>
        </div>
        
        <div className="flex items-center gap-2">
            {!showSaveInput ? (
                <button 
                    onClick={() => setShowSaveInput(true)} 
                    className="flex items-center gap-2 bg-white border border-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-100 shadow-sm transition-all font-semibold"
                >
                    <Save size={16} /> <span className="hidden sm:inline">Lưu</span>
                </button>
            ) : (
                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 animate-in fade-in shadow-sm">
                    <input 
                       type="text" 
                       value={saveName}
                       onChange={e => setSaveName(e.target.value)}
                       placeholder="Đặt tên..."
                       className="p-1.5 outline-none text-sm w-32 text-black font-medium"
                       autoFocus
                    />
                    <button onClick={saveChart} className="p-1.5 bg-black text-white rounded hover:bg-gray-800">
                        <Check size={14} />
                    </button>
                    <button onClick={() => setShowSaveInput(false)} className="p-1.5 text-gray-500 hover:text-red-500">
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: CONFIG (ACCORDION STYLE) */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
           
           {/* Section 1: Library */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
                <button 
                    onClick={() => toggleSection('library')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="text-sm font-bold text-black flex items-center gap-2">
                        <FolderOpen size={16} /> Thư viện đã lưu ({savedCharts.length})
                    </span>
                    {sections.library ? <ChevronDown size={16} className="text-black"/> : <ChevronRight size={16} className="text-black"/>}
                </button>
                
                {sections.library && (
                    <div className="p-3 border-t border-gray-200">
                        {savedCharts.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {savedCharts.map(c => (
                                    <div key={c.id} onClick={() => loadChart(c)} className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-black rounded-lg p-2 pr-1 cursor-pointer flex items-center gap-2 group min-w-[120px]">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-black truncate">{c.name}</div>
                                            <div className="text-[10px] text-gray-600 font-medium">{new Date(c.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <button onClick={(e) => deleteChart(c.id, e)} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic text-center py-2">Chưa có biểu đồ nào.</p>
                        )}
                    </div>
                )}
           </div>

           {/* Section 2: General Config */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
                <button 
                    onClick={() => toggleSection('config')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="text-sm font-bold text-black flex items-center gap-2">
                        <Settings size={16} /> Cấu hình chung
                    </span>
                    {sections.config ? <ChevronDown size={16} className="text-black"/> : <ChevronRight size={16} className="text-black"/>}
                </button>

                {sections.config && (
                    <div className="p-4 border-t border-gray-200 space-y-4">
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded font-bold text-black focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-500"
                            placeholder="Tiêu đề biểu đồ..."
                        />
                        
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            {['composed', 'bar', 'line', 'area', 'pie'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setChartType(t as any)}
                                    className={`flex-1 py-1.5 rounded text-xs font-bold uppercase transition-all ${chartType === t ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-500 hover:text-black'}`}
                                >
                                    {t === 'composed' ? 'Hỗn hợp' : t}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setShowGrid(!showGrid)} className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold border transition-colors ${showGrid ? 'bg-gray-100 text-black border-gray-300' : 'bg-white text-gray-500 border-gray-200'}`}>
                                <Grid3X3 size={14} /> Lưới
                            </button>
                            <button onClick={() => setShowValues(!showValues)} className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold border transition-colors ${showValues ? 'bg-gray-100 text-black border-gray-300' : 'bg-white text-gray-500 border-gray-200'}`}>
                                <Type size={14} /> Giá trị
                            </button>
                            <button onClick={() => setRotateLabels(!rotateLabels)} className={`flex items-center justify-center gap-1 py-1.5 rounded text-xs font-bold border transition-colors ${rotateLabels ? 'bg-gray-100 text-black border-gray-300' : 'bg-white text-gray-500 border-gray-200'}`}>
                                <RotateCw size={14} /> Xoay nhãn
                            </button>
                        </div>
                    </div>
                )}
           </div>

           {/* Section 3: Series */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
                <button 
                    onClick={() => toggleSection('series')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="text-sm font-bold text-black flex items-center gap-2">
                        <Layers size={16} /> Chuỗi dữ liệu
                    </span>
                    {sections.series ? <ChevronDown size={16} className="text-black"/> : <ChevronRight size={16} className="text-black"/>}
                </button>

                {sections.series && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-black font-bold uppercase">Danh sách</span>
                            <button onClick={addSeries} className="text-xs flex items-center gap-1 text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded font-bold">
                                <Plus size={12} /> Thêm
                            </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {seriesList.map((s) => (
                                <div key={s.id} className="flex flex-col gap-2 bg-gray-50 p-2 rounded border border-gray-200 group">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={s.color} 
                                            onChange={e => updateSeries(s.id, 'color', e.target.value)} 
                                            className="w-5 h-5 p-0 border rounded cursor-pointer flex-shrink-0"
                                            title="Màu sắc"
                                        />
                                        <input 
                                            value={s.name} 
                                            onChange={e => updateSeries(s.id, 'name', e.target.value)} 
                                            className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none font-bold text-black"
                                            placeholder="Tên..."
                                        />
                                        {seriesList.length > 1 && (
                                            <button onClick={() => removeSeries(s.id)} className="text-gray-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {chartType === 'composed' && (
                                        <div className="flex gap-2 text-xs">
                                            <select 
                                                value={s.type} 
                                                onChange={e => updateSeries(s.id, 'type', e.target.value)}
                                                className="bg-white border border-gray-300 rounded px-1 py-0.5 outline-none cursor-pointer text-black font-medium"
                                            >
                                                <option value="bar">Cột</option>
                                                <option value="line">Đường</option>
                                                <option value="area">Vùng</option>
                                            </select>
                                            <select 
                                                value={s.yAxisId} 
                                                onChange={e => updateSeries(s.id, 'yAxisId', e.target.value)}
                                                className={`border rounded px-1 py-0.5 outline-none cursor-pointer font-medium ${s.yAxisId === 'right' ? 'bg-gray-200 text-black border-gray-400' : 'bg-white border-gray-300 text-black'}`}
                                            >
                                                <option value="left">Trục Trái</option>
                                                <option value="right">Trục Phải</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
           </div>

           {/* Section 4: Data Table (EXPANDED TO FILL SPACE) */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
                <button 
                    onClick={() => toggleSection('data')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                    <span className="text-sm font-bold text-black flex items-center gap-2">
                        <LayoutTemplate size={16} /> Bảng dữ liệu chi tiết
                    </span>
                    {sections.data ? <ChevronDown size={16} className="text-black"/> : <ChevronRight size={16} className="text-black"/>}
                </button>

                {sections.data && (
                    <div className="flex-1 flex flex-col min-h-0 border-t border-gray-200">
                        <div className="p-2 border-b border-gray-100 flex justify-end bg-white">
                            <button onClick={addRow} className="text-xs flex items-center gap-1 bg-gray-100 text-black px-3 py-1.5 rounded hover:bg-gray-200 font-bold">
                                <Plus size={12} /> Thêm Dòng
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
                            <table className="w-full text-sm min-w-full border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-30 shadow-sm">
                                    <tr>
                                        <th className="p-3 text-left text-xs font-bold text-black sticky left-0 z-40 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-r border-gray-200 min-w-[140px]">
                                            Nhãn
                                        </th>
                                        {seriesList.map(s => (
                                            <th key={s.id} className="p-3 text-left text-xs font-bold text-black min-w-[120px] border-b border-gray-200" style={{color: s.color}}>
                                                {s.name}
                                            </th>
                                        ))}
                                        <th className="w-16 border-b border-gray-200"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.map((row, idx) => (
                                        <tr key={row.id} className="group hover:bg-gray-50">
                                            <td className="p-1 sticky left-0 bg-white group-hover:bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-gray-100">
                                                <div className="grid grid-cols-1">
                                                    <span className="invisible row-start-1 col-start-1 p-2 font-bold text-sm whitespace-pre px-3">
                                                        {row.label || 'Placeholder'}
                                                    </span>
                                                    <input 
                                                        value={row.label} 
                                                        onChange={e => updateRowData(row.id, 'label', e.target.value)}
                                                        className="row-start-1 col-start-1 w-full p-2 bg-transparent focus:bg-white rounded border border-transparent focus:border-black outline-none font-bold text-sm px-3 text-black"
                                                        placeholder="Nhập tên..."
                                                    />
                                                </div>
                                            </td>
                                            {seriesList.map(s => (
                                                <td key={s.id} className="p-1">
                                                    <input 
                                                        type="text"
                                                        value={formatInputDisplay(row[s.id])} 
                                                        onChange={e => updateRowData(row.id, s.id, e.target.value)}
                                                        className="w-full p-2 bg-transparent focus:bg-white rounded border border-transparent focus:border-black outline-none text-right font-mono text-sm text-black font-medium"
                                                        placeholder="0"
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-1 flex items-center justify-center gap-1">
                                                <div className="flex flex-col">
                                                    <button onClick={() => moveRow(idx, 'up')} disabled={idx === 0} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowUp size={10}/></button>
                                                    <button onClick={() => moveRow(idx, 'down')} disabled={idx === data.length - 1} className="text-gray-400 hover:text-black disabled:opacity-30"><ArrowDown size={10}/></button>
                                                </div>
                                                <button onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-600">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
           </div>

        </div>

        {/* RIGHT: PREVIEW & AI */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Chart Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-6 min-h-[600px]">
                {/* CLEAN HEADER: Only Title */}
                <div className="mb-6 text-center">
                    <h3 className="font-extrabold text-black text-2xl">
                        {title}
                    </h3>
                </div>
                
                <div className="flex-1 w-full min-h-[500px]" ref={chartRef}>
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>

                {/* Footer Buttons - Separated from Chart */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        onClick={handleDownloadImage}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-black rounded-lg font-bold shadow-sm hover:bg-gray-50 hover:text-black transition-all text-sm hover:-translate-y-0.5"
                    >
                        <ImageIcon className="w-4 h-4" /> Lưu ảnh (PNG)
                    </button>
<<<<<<< HEAD
                    {hasApiKey && (
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-bold shadow hover:shadow-lg transition-all disabled:opacity-70 text-sm hover:-translate-y-0.5 hover:bg-gray-800"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            {isAnalyzing ? 'Đang đọc số liệu...' : 'Phân tích AI'}
                        </button>
                    )}
=======
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-bold shadow hover:shadow-lg transition-all disabled:opacity-70 text-sm hover:-translate-y-0.5 hover:bg-gray-800"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {isAnalyzing ? 'Đang đọc số liệu...' : 'Phân tích AI'}
                    </button>
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
                </div>
            </div>

            {/* AI Analysis Result */}
<<<<<<< HEAD
            {analysisResult && hasApiKey && (
=======
            {analysisResult && (
>>>>>>> 21393189c92f5d631d3d4d9dd0a1a6525e75fb29
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in slide-in-from-bottom-4 mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-black flex items-center gap-2">
                            <Sparkles size={18} /> Nhận xét từ AI (Marketing Expert)
                        </h3>
                        <button 
                            onClick={handleCopyAnalysis} 
                            className="flex items-center gap-1 text-xs bg-gray-100 text-black px-3 py-1.5 rounded hover:bg-gray-200 border border-gray-300 font-bold"
                        >
                            {copiedAnalysis ? <Check size={14} /> : <Copy size={14} />} 
                            {copiedAnalysis ? 'Đã sao chép' : 'Sao chép'}
                        </button>
                    </div>
                    <div className="prose prose-gray max-w-none text-sm text-black leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200 font-medium">
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
