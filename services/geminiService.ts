import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  // Ưu tiên lấy key từ localStorage do người dùng nhập
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  // Nếu không có local key, dùng key từ biến môi trường (nếu có)
  const apiKey = localKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key chưa được cấu hình. Vui lòng nhấn vào nút 'Cài đặt API' ở thanh menu bên trái để nhập Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMetaDescriptions = async (
  topic: string,
  keywords: string,
  tone: string
): Promise<Array<{ title: string; description: string }>> => {
  const ai = getAiClient();
  
  const prompt = `
    Bạn là một chuyên gia SEO hàng đầu. Hãy tạo ra 3 cặp Thẻ Tiêu Đề (Title Tag) và Meta Description tối ưu SEO cho chủ đề sau:
    Chủ đề/Nội dung chính: "${topic}"
    Từ khóa cần SEO: "${keywords}"
    Giọng văn: "${tone}"

    Yêu cầu:
    - Tiêu đề dưới 60 ký tự.
    - Meta Description dưới 160 ký tự.
    - Hấp dẫn, kích thích tỷ lệ click (CTR).
    - Trả về kết quả dưới dạng JSON thuần túy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Meta Gen Error:", error);
    throw error;
  }
};

export const analyzeSpeedOptimization = async (
  urlOrStack: string
): Promise<string> => {
  const ai = getAiClient();

  const prompt = `
    Tôi là chủ sở hữu website và tôi cần cải thiện tốc độ trang web (Core Web Vitals).
    Thông tin website hoặc công nghệ đang dùng: "${urlOrStack}"
    
    Hãy đóng vai một kỹ sư hiệu năng web (Web Performance Engineer).
    Vui lòng cung cấp một danh sách kiểm tra (Checklist) chi tiết và các chiến lược cụ thể để tối ưu hóa tốc độ cho trường hợp này.
    Tập trung vào:
    1. LCP (Largest Contentful Paint)
    2. FID (First Input Delay) / INP
    3. CLS (Cumulative Layout Shift)
    
    Hãy trình bày dưới dạng Markdown dễ đọc, sử dụng các gạch đầu dòng và tiêu đề rõ ràng. Tiếng Việt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Không thể tạo nội dung tư vấn lúc này.";
  } catch (error) {
    console.error("Gemini Speed Analysis Error:", error);
    throw error;
  }
};