
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileType, Upload, Download, FileText, Loader2, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, Undo, Redo, Highlighter, Type, Eraser, Copy, Check
} from 'lucide-react';

const PdfToWord: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load PDF.js from CDN dynamically
  useEffect(() => {
    const loadPdfJs = async () => {
      if ((window as any).pdfjsLib) return;
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.body.appendChild(script);
    };
    loadPdfJs();
  }, []);

  const processPdf = async (fileToProcess: File) => {
    const pdfjsLib = (window as any).pdfjsLib;
    if(!pdfjsLib) {
        alert("Đang tải thư viện xử lý. Vui lòng thử lại sau 2 giây.");
        return;
    }

    setIsProcessing(true);
    setProgress(10);
    setContent('');

    try {
        const arrayBuffer = await fileToProcess.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullHtml = '';
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
            setProgress(10 + Math.round((i / totalPages) * 80));
            
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const items = textContent.items;

            // --- SMART PARSING LOGIC ---
            
            let pageHtml = `<div class="page-break" style="page-break-after: always; margin-bottom: 2rem;">`;
            let lastY = -1;
            let lastFontSize = -1;
            let buffer = '';

            const fontSizes = items.map((item: any) => item.height).filter((h: number) => h > 0);
            const avgFontSize = fontSizes.length > 0 
                ? fontSizes.reduce((a: number, b: number) => a + b, 0) / fontSizes.length 
                : 12;

            for (let j = 0; j < items.length; j++) {
                const item = items[j] as any;
                const text = item.str;
                
                if (!text.trim()) continue;

                const currentY = item.transform[5];
                const currentFontSize = item.height;

                // Detect New Line / Paragraph
                if (lastY !== -1 && Math.abs(currentY - lastY) > currentFontSize * 1.5) {
                    pageHtml += wrapText(buffer, lastFontSize, avgFontSize);
                    buffer = '';
                }

                if (buffer !== '' && !buffer.endsWith(' ') && !text.startsWith(' ')) {
                    buffer += ' ';
                }
                buffer += text;

                lastY = currentY;
                lastFontSize = currentFontSize;
            }

            if (buffer) {
                pageHtml += wrapText(buffer, lastFontSize, avgFontSize);
            }

            pageHtml += `</div>`;
            fullHtml += pageHtml;
        }

        setContent(fullHtml);
        if(editorRef.current) {
            editorRef.current.innerHTML = fullHtml;
        }
        setProgress(100);
        setTimeout(() => setIsProcessing(false), 500);

    } catch (error) {
        console.error(error);
        alert("Không thể đọc file PDF này (Có thể do file được scan dạng ảnh hoặc bị mã hóa).");
        setIsProcessing(false);
        setProgress(0);
    }
  };

  const wrapText = (text: string, size: number, avgSize: number) => {
      if (size > avgSize * 1.5) {
          return `<h2 style="font-size: 18pt; font-weight: bold; margin-bottom: 12px; margin-top: 24px;">${text}</h2>`;
      } else if (size > avgSize * 1.2) {
          return `<h3 style="font-size: 14pt; font-weight: bold; margin-bottom: 10px; margin-top: 18px;">${text}</h3>`;
      } else {
          return `<p style="font-size: 12pt; line-height: 1.5; margin-bottom: 12px; text-align: justify;">${text}</p>`;
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf') {
        alert("Vui lòng chọn file PDF.");
        return;
    }
    setFile(uploadedFile);
    processPdf(uploadedFile);
  };

  const handleDownload = () => {
      if (!editorRef.current) return;
      
      const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Document</title>
        <style>
            @page { mso-page-orientation: portrait; size: 21cm 29.7cm; margin: 2.54cm; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; }
        </style>
      </head><body>`;
      
      const postHtml = "</body></html>";
      const html = preHtml + editorRef.current.innerHTML + postHtml;

      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file ? file.name.replace('.pdf', '.doc') : 'document.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
  };

  const handleCopyContent = () => {
      if (editorRef.current) {
          // Copy text content
          navigator.clipboard.writeText(editorRef.current.innerText).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
          });
      }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col pb-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileType className="text-blue-600" /> Chuyển PDF Sang Word (AI Layout)
        </h2>
        <p className="text-gray-600 mt-1">Chỉnh sửa, highlight và tải về file Word chuẩn A4.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: SETTINGS & UPLOAD */}
        <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer relative group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf" onChange={handleFileUpload} />
                    <div className="flex flex-col items-center pointer-events-none">
                        <div className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="w-7 h-7" />
                        </div>
                        <span className="font-bold text-gray-700">Tải file PDF</span>
                        <span className="text-xs text-gray-500 mt-1">Kéo thả hoặc Click</span>
                    </div>
                </div>

                {isProcessing && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Đang xử lý...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                        </div>
                    </div>
                )}

                {file && !isProcessing && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-bold text-gray-800 truncate mb-1">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size/1024/1024).toFixed(1)} MB</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex-1 space-y-3">
                <h3 className="font-bold text-gray-700 text-sm uppercase">Công cụ</h3>
                <button 
                    onClick={handleCopyContent}
                    disabled={!content}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-sm font-medium text-gray-700"
                >
                    <span className="flex items-center gap-2"><Copy size={16}/> Copy Văn Bản</span>
                    {copied && <Check size={16} className="text-green-600"/>}
                </button>
                <div className="text-xs text-gray-500 italic mt-2">
                    * Mẹo: Dùng chuột bôi đen văn bản trong khung bên phải và dùng thanh công cụ phía trên để chỉnh sửa.
                </div>
            </div>

            <button 
                onClick={handleDownload}
                disabled={!content || isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-auto ${
                    !content || isProcessing 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'
                }`}
            >
                <Download size={20} /> Tải File Word
            </button>
        </div>

        {/* RIGHT: EDITOR */}
        <div className="lg:col-span-9 flex flex-col h-full bg-gray-200/50 rounded-xl border border-gray-200 overflow-hidden relative">
            
            {/* FLOATING TOOLBAR */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button onClick={() => execCmd('undo')} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600" title="Hoàn tác"><Undo size={16}/></button>
                    <button onClick={() => execCmd('redo')} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600" title="Làm lại"><Redo size={16}/></button>
                </div>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                {/* Basic Format */}
                <button onClick={() => execCmd('bold')} className="p-2 hover:bg-gray-100 rounded text-gray-700 font-bold" title="In đậm"><Bold size={18}/></button>
                <button onClick={() => execCmd('italic')} className="p-2 hover:bg-gray-100 rounded text-gray-700 italic" title="In nghiêng"><Italic size={18}/></button>
                <button onClick={() => execCmd('underline')} className="p-2 hover:bg-gray-100 rounded text-gray-700 underline" title="Gạch chân"><Underline size={18}/></button>
                
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                {/* Highlight & Colors */}
                <button onClick={() => execCmd('hiliteColor', '#ffff00')} className="p-2 hover:bg-yellow-100 rounded text-gray-700" title="Highlight Vàng"><Highlighter size={18} className="text-yellow-600"/></button>
                <button onClick={() => execCmd('foreColor', '#ef4444')} className="p-2 hover:bg-red-50 rounded text-red-600 font-bold" title="Chữ Đỏ"><Type size={18}/></button>
                <button onClick={() => execCmd('foreColor', '#3b82f6')} className="p-2 hover:bg-blue-50 rounded text-blue-600 font-bold" title="Chữ Xanh"><Type size={18}/></button>
                <button onClick={() => execCmd('removeFormat')} className="p-2 hover:bg-gray-100 rounded text-gray-500" title="Xóa định dạng"><Eraser size={18}/></button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                {/* Alignment */}
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button onClick={() => execCmd('justifyLeft')} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600"><AlignLeft size={16}/></button>
                    <button onClick={() => execCmd('justifyCenter')} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600"><AlignCenter size={16}/></button>
                    <button onClick={() => execCmd('justifyRight')} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-600"><AlignRight size={16}/></button>
                </div>
                <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded text-gray-700"><List size={18}/></button>
            </div>

            {/* EDITOR CANVAS (A4 SIMULATION) */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center mt-20">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Đang chuyển đổi PDF...</p>
                    </div>
                ) : !content ? (
                    <div className="w-[21cm] h-[29.7cm] bg-white shadow-xl flex flex-col items-center justify-center text-gray-300 select-none">
                        <FileText className="w-24 h-24 mb-4 opacity-20" />
                        <p className="text-lg">Văn bản xem trước sẽ hiện ở đây</p>
                    </div>
                ) : (
                    <div 
                        ref={editorRef}
                        contentEditable
                        className="bg-white shadow-2xl outline-none text-gray-900 selection:bg-blue-200"
                        style={{
                            width: '21cm', // A4 Width
                            minHeight: '29.7cm', // A4 Height
                            padding: '2.54cm', // 1 inch margins
                            boxSizing: 'border-box',
                            fontSize: '12pt',
                            fontFamily: 'Times New Roman, serif',
                            lineHeight: '1.5'
                        }}
                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    />
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default PdfToWord;
