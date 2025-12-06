
import React, { useState, useRef, useEffect } from 'react';
import { FileType, Upload, Download, FileText, Loader2, Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const PdfToWord: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load PDF.js from CDN dynamically to ensure it works without complex build setup
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf') {
        alert("Vui lòng chọn file PDF.");
        return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);
    setContent('');

    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result as ArrayBuffer);
            const pdfjsLib = (window as any).pdfjsLib;
            
            if(!pdfjsLib) {
                alert("Đang tải thư viện PDF. Vui lòng thử lại sau 2 giây.");
                setIsProcessing(false);
                return;
            }

            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let extractedText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Simple heuristic to reconstruct paragraphs
                let lastY, text = '';
                for (let item of textContent.items) {
                    if (lastY == item.transform[5] || !lastY){
                        text += item.str;
                    }  
                    else {
                        text += '<br>' + item.str;
                    }                                                    
                    lastY = item.transform[5];
                }
                
                // Better approach: Join strings with spaces, but try to respect lines loosely
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                
                // Add simple formatting for pages
                extractedText += `<div class="pdf-page mb-4">
                    <h4 class="text-gray-400 text-xs uppercase mb-2 select-none">Page ${i}</h4>
                    <p>${pageText}</p>
                </div><hr class="my-4"/>`;
            }

            setContent(extractedText);
            if(editorRef.current) {
                editorRef.current.innerHTML = extractedText;
            }
            setIsProcessing(false);
        };
        fileReader.readAsArrayBuffer(uploadedFile);
    } catch (error) {
        console.error(error);
        alert("Lỗi khi đọc file PDF. File có thể được mã hóa hoặc bị hỏng.");
        setIsProcessing(false);
    }
  };

  const handleDownload = () => {
      if (!editorRef.current) return;
      
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + editorRef.current.innerHTML + footer;
      
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `${file?.name.replace('.pdf', '') || 'document'}.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
  };

  // Simple formatting commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileType className="text-red-600" /> Chuyển PDF Sang Word
        </h2>
        <p className="text-gray-600 mt-1">Trích xuất văn bản từ PDF, cho phép chỉnh sửa trước khi tải về (Giữ lại văn bản, không giữ layout phức tạp).</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Upload */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-red-50 transition-colors cursor-pointer relative mb-6">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf" onChange={handleFileUpload} />
                <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                        <Upload className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-gray-700 text-lg">Chọn File PDF</span>
                    <span className="text-sm text-gray-500 mt-1">Hỗ trợ tiếng Việt</span>
                </div>
            </div>

            {file && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 flex items-center gap-3">
                    <FileText className="text-red-500" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
            )}

            <button 
                onClick={handleDownload}
                disabled={!content}
                className={`mt-auto w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                    !content ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'
                }`}
            >
                <Download size={20} /> Tải File Word (.doc)
            </button>
        </div>

        {/* RIGHT: Editor */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
            {/* Toolbar */}
            <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2 overflow-x-auto">
                <button onClick={() => execCmd('bold')} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="In đậm"><Bold size={18}/></button>
                <button onClick={() => execCmd('italic')} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="In nghiêng"><Italic size={18}/></button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button onClick={() => execCmd('formatBlock', 'H1')} className="p-2 hover:bg-gray-200 rounded text-gray-700 font-bold text-xs" title="Tiêu đề 1">H1</button>
                <button onClick={() => execCmd('formatBlock', 'H2')} className="p-2 hover:bg-gray-200 rounded text-gray-700 font-bold text-xs" title="Tiêu đề 2">H2</button>
                <button onClick={() => execCmd('formatBlock', 'P')} className="p-2 hover:bg-gray-200 rounded text-gray-700 text-xs" title="Đoạn văn">P</button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Căn trái"><AlignLeft size={18}/></button>
                <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Căn giữa"><AlignCenter size={18}/></button>
                <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Căn phải"><AlignRight size={18}/></button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 relative bg-gray-100 overflow-y-auto p-4 md:p-8">
                {isProcessing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Đang trích xuất văn bản từ PDF...</p>
                    </div>
                ) : null}

                <div 
                    ref={editorRef}
                    contentEditable
                    className="min-h-full bg-white shadow-lg max-w-[800px] mx-auto p-8 md:p-12 outline-none prose max-w-none text-gray-800"
                    style={{minHeight: '800px'}}
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                >
                    {!content && !isProcessing && (
                        <div className="text-gray-400 text-center mt-20 select-none pointer-events-none">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Nội dung văn bản sẽ hiển thị ở đây.<br/>Bạn có thể chỉnh sửa trực tiếp trước khi tải về.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PdfToWord;
