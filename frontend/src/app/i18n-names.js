// ---------------------------------------------------------------------------
// Name localisation.
//
// The phrase catalogue translates interface strings; a person's name arrives as
// its own text node ("Sarah Chen") or sits inside a sentence ("Messages with
// Priya Sharma"), so it never matches the catalogue. This module spells the
// platform's member names in the non-Latin scripts, and the runtime substitutes
// them wherever they appear.
//
// Spanish / French / German / Portuguese / Italian keep the Latin spelling —
// that is how those locales write foreign names.
// ---------------------------------------------------------------------------

// Columns: ta, hi, bn, pa, ru, zh, ja
const NAMES = {
  "Sarah Chen": ["சாரா சென்", "सारा चेन", "সারা চেন", "ਸਾਰਾ ਚੇਨ", "Сара Чен", "莎拉·陈", "サラ・チェン"],
  "Michael Okafor": ["மைக்கேல் ஓகபோர்", "माइकल ओकाफोर", "মাইকেল ওকাফোর", "ਮਾਈਕਲ ਓਕਾਫੋਰ", "Майкл Окафор", "迈克尔·奥卡福", "マイケル・オカフォー"],
  "Alex Rivera": ["ஆலெக் ரிவேரா", "एलेक्स रिवेरा", "অ্যালেক্স রিভেরা", "ਐਲੈਕਸ ਰਿਵੇਰਾ", "Алекс Ривера", "亚历克斯·里维拉", "アレックス・リベラ"],
  "Priya Sharma": ["பிரியா ஷர்மா", "प्रिया शर्मा", "প্রিয়া শর্মা", "ਪ੍ਰੀਆ ਸ਼ਰਮਾ", "Прия Шарма", "普里娅·夏尔马", "プリヤ・シャルマ"],
  "Rachel Thompson": ["ரேச்சல் தாம்பசன்", "रेचल थॉम्पसन", "রেচেল থম্পসন", "ਰੇਚਲ ਥਾਮਪਸਨ", "Рэйчел Томпсон", "蕾切尔·汤姆森", "レイチェル・トンプソン"],
  "Arjun Verma": ["அர்ஜுன் வெர்மா", "अर्जुन वर्मा", "অর্জুন বর্মা", "ਅਰਜੁਨ ਵਰਮਾ", "Арджун Верма", "阿尔俊·维尔马", "アルジュン・ヴェルマ"],
  "James Wu": ["ஜேம்ஸ் வு", "जेम्स वू", "জেমস ওউ", "ਜੇਮਸ ਵੂ", "Джеймс У", "詹姆斯·吴", "ジェームズ・ウー"],
  "Maria Santos": ["மரியா சாண்டோஸ்", "मारिया सांतोस", "মারিয়া সান্তোস", "ਮਾਰੀਆ ਸਾਨਤੋਸ", "Мария Сантуш", "玛丽亚·桑托斯", "マリア・サントス"],
  "David Kim": ["டேவிட் கிம்", "डेविड किम", "ডেভিড কিম", "ਡੇਵਿਡ ਕਿਮ", "Дэвид Ким", "戴维·金", "デイビッド・キム"],
  "Ahmed Hassan": ["அஹமட் ஹசன்", "अहमेद हसन", "আহমেদ হাসান", "ਅਹਿਮਦ ਹਸਨ", "Ахмед Хассан", "艾哈迈德·哈桑", "アハマド・ハサン"],
  "Lisa Park": ["லிசா பார்க்", "लिसा पार्क", "লিসা পার্ক", "ਲਿਸਾ ਪਾਰਕ", "Лиза Парк", "丽莎·帕克", "リサ・パーク"]
};

const SCRIPTS = ["ta", "hi", "bn", "pa", "ru", "zh", "ja"];
const COLUMN = {};
SCRIPTS.forEach((code, i) => {
  COLUMN[code] = i;
});

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest name first so "Michael Okafor" wins over any shorter overlap.
const PATTERN = new RegExp(`(?<![\\p{L}'])(${Object.keys(NAMES).sort((a, b) => b.length - a.length).map(escapeRe).join("|")})(?![\\p{L}'])`, "gu");

/** Does this language get a different script for names? */
export function localisesNames(lang) {
  return !!COLUMN[lang];
}

/** Spell every known member name in `lang`'s script; unknown names pass through. */
export function applyNames(text, lang) {
  const col = COLUMN[lang];
  if (!text || col === undefined) return text;
  return text.replace(PATTERN, full => NAMES[full][col] || full);
}

/** The display name for one member, in the current interface language. */
export function displayName(name, lang) {
  return applyNames(String(name || ""), lang);
}
