
import React, { useState } from 'react';
import { Type, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

interface FontStyle {
  name: string;
  mapLower: string; // a-z
  mapUpper: string; // A-Z
  mapNumbers: string; // 0-9
}

const FancyTextGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('Marketing Tools');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const normalLower = "abcdefghijklmnopqrstuvwxyz";
  const normalUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const normalNumbers = "0123456789";

  // Full and correct mappings for YayText-like styles
  const styles: FontStyle[] = [
    {
      name: "Bold (Serif)",
      mapLower: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
      mapUpper: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙",
      mapNumbers: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
    },
    {
      name: "Bold (Sans)",
      mapLower: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇",
      mapUpper: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭",
      mapNumbers: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"
    },
    {
      name: "Italic (Serif)",
      mapLower: "𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧",
      mapUpper: "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍",
      mapNumbers: "0123456789"
    },
    {
      name: "Italic (Sans)",
      mapLower: "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",
      mapUpper: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡",
      mapNumbers: "0123456789"
    },
    {
      name: "Bold Italic (Serif)",
      mapLower: "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",
      mapUpper: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁",
      mapNumbers: "0123456789"
    },
    {
      name: "Bold Italic (Sans)",
      mapLower: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
      mapUpper: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕",
      mapNumbers: "0123456789"
    },
    {
      name: "Script (Cursive)",
      mapLower: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
      mapUpper: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩",
      mapNumbers: "0123456789"
    },
    {
      name: "Script Bold",
      mapLower: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃", 
      mapUpper: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩",
      mapNumbers: "0123456789"
    },
    {
      name: "Gothic (Fraktur)",
      mapLower: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
      mapUpper: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ",
      mapNumbers: "0123456789"
    },
    {
      name: "Gothic Bold",
      mapLower: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
      mapUpper: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅",
      mapNumbers: "0123456789"
    },
    {
      name: "Double Struck",
      mapLower: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
      mapUpper: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ",
      mapNumbers: "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"
    },
    {
      name: "Monospace",
      mapLower: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",
      mapUpper: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉",
      mapNumbers: "𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
    },
    {
      name: "Bubble (White)",
      mapLower: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
      mapUpper: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ",
      mapNumbers: "⓪①②③④⑤⑥⑦⑧⑨"
    },
    {
      name: "Bubble (Black)",
      mapLower: "🅐𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁", 
      mapUpper: "🅐𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁",
      mapNumbers: "⓿➊➋➌➍➎➏➐➑➒"
    },
    {
      name: "Square",
      mapLower: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
      mapUpper: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
      mapNumbers: "0123456789"
    },
    {
      name: "Small Caps",
      mapLower: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ",
      mapUpper: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ",
      mapNumbers: "0123456789"
    },
    {
        name: "Strikethrough",
        mapLower: "a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶",
        mapUpper: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶",
        mapNumbers: "0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶"
    }
  ];

  const transformText = (text: string, style: FontStyle) => {
    // Special handling for combining diacritics (Strikethrough)
    if (style.name === "Strikethrough") {
        return text.split('').map(char => char + '\u0336').join('');
    }

    return text.split('').map(char => {
      const lowerIndex = normalLower.indexOf(char);
      const upperIndex = normalUpper.indexOf(char);
      const numberIndex = normalNumbers.indexOf(char);

      if (lowerIndex !== -1) return Array.from(style.mapLower)[lowerIndex] || char;
      if (upperIndex !== -1) return Array.from(style.mapUpper)[upperIndex] || char;
      if (numberIndex !== -1) return Array.from(style.mapNumbers)[numberIndex] || char;
      return char;
    }).join('');
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <Type className="text-black" /> Tạo Chữ Kiểu (Fancy Text)
        </h2>
        <p className="text-black mt-2 font-medium">Biến đổi văn bản thành các font chữ độc đáo để đăng Facebook, Instagram, TikTok.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: INPUT */}
        <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                <label className="block text-sm font-bold text-black mb-2">Nhập văn bản của bạn</label>
                <textarea
                    className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black focus:outline-none resize-none text-lg text-black font-medium mb-4 placeholder-gray-500"
                    placeholder="Gõ gì đó đi..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex justify-end">
                    <button 
                        onClick={() => setInputText('')} 
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors font-semibold"
                    >
                        <RotateCcw size={14} /> Xóa
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-black flex items-center gap-2">
                        <Sparkles size={16} className="text-black"/> Kết quả ({styles.length})
                    </h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {styles.map((style, idx) => {
                        const result = transformText(inputText || 'Marketing Tools', style);
                        return (
                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors group flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">{style.name}</div>
                                    <div className="text-lg text-black break-words font-semibold">{result}</div>
                                </div>
                                <button 
                                    onClick={() => handleCopy(result, idx)}
                                    className={`flex-shrink-0 p-2 rounded-lg border transition-all ${
                                        copiedIndex === idx 
                                        ? 'bg-black border-black text-white' 
                                        : 'bg-white border-gray-300 text-gray-600 hover:text-black hover:border-black'
                                    }`}
                                    title="Copy"
                                >
                                    {copiedIndex === idx ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FancyTextGenerator;
