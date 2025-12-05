
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  // Logic: 
  // 1. Hệ thống hỗ trợ nhiều loại Key (Gemini, OpenAI, DeepSeek) lưu trong localStorage.
  // 2. Service này (geminiService) CHỈ chịu trách nhiệm làm việc với Google Gemini.
  // 3. Vì vậy, nó chỉ lấy 'gemini_api_key'.
  
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  const apiKey = localKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Vui lòng nhập Gemini API Key trong phần 'Cài đặt API' để sử dụng tính năng AI này.");
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

export const checkPlagiarismAndStyle = async (
  text: string
): Promise<string> => {
  const ai = getAiClient();

  const prompt = `
    Hãy phân tích đoạn văn bản sau đây về mặt "Tính nguyên bản" và "Văn phong".
    Văn bản: "${text}"
    
    Nhiệm vụ:
    1. Đánh giá xem văn bản này có dấu hiệu giống văn bản do AI tạo ra hay văn bản sao chép thông thường không (dựa trên cấu trúc câu, từ ngữ lặp lại).
    2. Đề xuất các thay đổi để làm cho văn bản tự nhiên hơn, giống người viết hơn.
    3. Tìm ra 3 câu có thể viết lại để hay hơn.
    
    Trình bày dưới dạng Markdown ngắn gọn. Lưu ý: Bạn không thể tìm kiếm Google thời gian thực, nên hãy phân tích dựa trên kiến thức ngôn ngữ học và mô hình của bạn.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Không thể phân tích lúc này.";
  } catch (error) {
    console.error("Gemini Plagiarism Check Error:", error);
    throw error;
  }
};

export const generateSeoOutline = async (
  topic: string,
  mainKeyword: string,
  secondaryKeywords: string
): Promise<string> => {
  const ai = getAiClient();

  const prompt = `
    Bạn là một chuyên gia Content SEO với 10 năm kinh nghiệm. Hãy lập một Dàn ý bài viết (Article Outline) chi tiết và tối ưu cho chủ đề sau:
    
    - Chủ đề: "${topic}"
    - Từ khóa chính (Main Keyword): "${mainKeyword}"
    - Từ khóa phụ/liên quan (Secondary Keywords): "${secondaryKeywords}"

    Hãy trình bày kết quả dưới dạng Markdown chuyên nghiệp theo cấu trúc sau:

    ### 1. Phân Tích & Chiến Lược Từ Khóa
    - **Intent (Ý định tìm kiếm):** Người dùng muốn gì khi tìm từ khóa này?
    - **Danh sách từ khóa LSI/Semantic:** Gợi ý thêm 5-10 từ khóa liên quan nên chèn vào bài để tăng độ phủ.
    - **Độ dài bài viết đề xuất:** ... từ.

    ### 2. Dàn Ý Chi Tiết (Outline)
    (Sử dụng cấu trúc H1, H2, H3 rõ ràng. Với mỗi thẻ H2/H3, hãy gạch đầu dòng ngắn gọn nội dung cần viết là gì)

    **H1: [Gợi ý 1 tiêu đề hấp dẫn chứa từ khóa chính]**
    
    **H2: Giới thiệu (Introduction)**
    - ...

    **H2: [Luận điểm chính 1]**
    - ...
    
    (Tiếp tục các luận điểm...)

    **H2: Kết luận (Conclusion)**
    - ...
    
    ### 3. Checklist SEO On-page
    - Gợi ý vị trí đặt từ khóa chính.
    - Gợi ý về Internal Link nên có.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Không thể tạo dàn ý lúc này.";
  } catch (error) {
    console.error("Gemini Outline Gen Error:", error);
    throw error;
  }
};

export interface SeoScoreResult {
  score: number;
  goodPoints: string[];
  warnings: string[];
  criticalErrors: string[];
  suggestions: string[];
}

export const gradeSeoContent = async (
  htmlContent: string,
  keyword: string,
  url?: string
): Promise<SeoScoreResult> => {
  const ai = getAiClient();

  // Strip large base64 images to save tokens, but keep img tags for analysis
  const cleanedContent = htmlContent.replace(/<img[^>]*src="data:image\/[^;]+;base64,[^"]+"[^>]*>/g, '[IMAGE_PLACEHOLDER]');
  
  const prompt = `
    Bạn là một công cụ chấm điểm SEO Content nghiêm ngặt giống như Rank Math hoặc Yoast SEO.
    
    Nhiệm vụ: Chấm điểm bài viết dưới đây dựa trên Từ Khóa Tập Trung (Focus Keyword).
    
    Thông tin đầu vào:
    - Từ khóa tập trung: "${keyword}"
    - URL (nếu có): "${url || 'Không có'}"
    - Nội dung bài viết (HTML thô): 
    """
    ${cleanedContent.substring(0, 15000)} 
    """
    (Lưu ý: Nội dung đã được cắt ngắn nếu quá dài, hãy phân tích dựa trên những gì nhận được).

    Hãy phân tích các tiêu chí sau:
    1. Từ khóa trong thẻ H1, H2, H3?
    2. Mật độ từ khóa (Keyword Density) có tự nhiên không (0.5% - 2.5%)?
    3. Độ dài bài viết?
    4. Có hình ảnh không? (Placeholder [IMAGE_PLACEHOLDER] tính là có ảnh).
    5. Khả năng đọc (câu ngắn, chia đoạn).
    6. Từ khóa ở đầu bài viết?

    Trả về kết quả dưới dạng JSON theo schema sau:
    {
      "score": number (0-100),
      "goodPoints": ["string"],
      "warnings": ["string"],
      "criticalErrors": ["string"],
      "suggestions": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            goodPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "goodPoints", "warnings", "criticalErrors", "suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini SEO Grader Error:", error);
    throw error;
  }
};

// --- ADS TOOLS ---

export const generateAdsStructure = async (
  product: string,
  platform: 'Facebook' | 'Google',
  goal: string
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    Bạn là chuyên gia quảng cáo ${platform} Ads (Media Buyer). Hãy thiết lập một cấu trúc chiến dịch (Campaign Structure) tối ưu cho:
    - Sản phẩm: "${product}"
    - Mục tiêu: "${goal}"

    Hãy trình bày dưới dạng cây thư mục Markdown chi tiết như sau:
    
    **Campaign:** [Tên chiến dịch - Mục tiêu]
    
    **Ad Set 1: [Nhóm đối tượng A - Ví dụ: Cold Traffic/Interests]**
    - Target: Độ tuổi, Vị trí, Sở thích cụ thể...
    - Ngân sách đề xuất (tỷ lệ %).
      - **Ad 1 (Format: Video/Image):** Angle (Góc độ tiếp cận)...
      - **Ad 2:** ...
    
    **Ad Set 2: [Nhóm đối tượng B - Ví dụ: Lookalike/Retargeting]**
    ...

    Lưu ý: Giải thích ngắn gọn tại sao lại chia như vậy ở cuối.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  return response.text || "Lỗi tạo cấu trúc.";
};

export const generateAdsContent = async (
  product: string,
  audience: string,
  angle: string
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    Viết nội dung quảng cáo Facebook/Google Ads cho:
    - Sản phẩm: "${product}"
    - Đối tượng khách hàng: "${audience}"
    - Góc độ (Angle/Pain point): "${angle}"

    Hãy tạo ra 3 phiên bản nội dung quảng cáo khác nhau. 
    Với mỗi phiên bản, hãy cung cấp đầy đủ:
    1. Primary Text (Nội dung chính - Có icon hấp dẫn).
    2. Headline (Tiêu đề - Ngắn gọn, giật tít).
    3. Description (Mô tả phụ cho link).
    4. Call to Action (Nút kêu gọi).
    
    Trình bày dạng Markdown.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  return response.text || "Lỗi tạo nội dung.";
};

export const generateLandingLayout = async (
  product: string,
  industry: string
): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    Bạn là một Senior Frontend Developer và UI/UX Designer.
    Hãy viết một trang Landing Page (Sales Page) hoàn chỉnh bằng HTML5 và Tailwind CSS cho:
    - Sản phẩm: "${product}"
    - Ngành hàng: "${industry}"

    Yêu cầu kỹ thuật:
    1. Chỉ trả về mã HTML (không có Markdown backticks, không giải thích).
    2. Bao gồm link CDN Tailwind CSS trong thẻ <head>: <script src="https://cdn.tailwindcss.com"></script>
    3. Font chữ: Sử dụng font 'Inter' từ Google Fonts.
    4. Cấu trúc AIDA:
       - Header (Logo, Nav, CTA).
       - Hero Section (Headline mạnh mẽ, Subheadline, CTA Button, Ảnh minh họa placeholder).
       - Problem Section (Nêu vấn đề khách hàng gặp phải).
       - Solution/Benefits Section (Lợi ích sản phẩm, Grid 3 cột).
       - Social Proof (Testimonials/Reviews).
       - Pricing/Offer Section.
       - FAQ.
       - Footer.
    5. Hình ảnh: Sử dụng ảnh placeholder từ source.unsplash.com hoặc placehold.co với keyword liên quan đến "${industry}".
    6. Thiết kế: Hiện đại, bo tròn (rounded-xl), đổ bóng (shadow-lg), gradient background cho Hero section.

    Output format: Raw HTML code string starting with <!DOCTYPE html>.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  
  // Clean up if AI returns markdown wrapper
  let code = response.text || "";
  code = code.replace(/```html/g, "").replace(/```/g, "").trim();
  
  return code || "Lỗi tạo layout.";
};
