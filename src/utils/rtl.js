/**
 * RTL Detection and Utilities
 * Handles Right-to-Left language detection
 */

/**
 * RTL Unicode ranges
 */
const RTL_RANGES = [
  /[\u0600-\u06FF]/,  // Arabic
  /[\u0750-\u077F]/,  // Arabic Supplement
  /[\u08A0-\u08FF]/,  // Arabic Extended-A
  /[\uFB50-\uFDFF]/,  // Arabic Presentation Forms-A
  /[\uFE70-\uFEFF]/,  // Arabic Presentation Forms-B
  /[\u0590-\u05FF]/,  // Hebrew
  /[\uFB1D-\uFB4F]/   // Hebrew Presentation Forms
];

/**
 * Persian-specific range (for language detection)
 */
const PERSIAN_RANGE = /[\u06F0-\u06F9\u067E\u0686\u0698\u06AF\u06CC\u06A9]/;

/**
 * Detect text direction from content
 * @returns 'left' | 'right' | 'auto'
 */
export function detectDirection(text) {
  if (!text || typeof text !== 'string') {
    return 'left';
  }
  
  // Count RTL characters
  let rtlCount = 0;
  let totalLetters = 0;
  
  for (const char of text) {
    // Skip non-letter characters
    if (!/\p{L}/u.test(char)) continue;
    
    totalLetters++;
    
    // Check if RTL
    for (const range of RTL_RANGES) {
      if (range.test(char)) {
        rtlCount++;
        break;
      }
    }
  }
  
  if (totalLetters === 0) return 'left';
  
  const rtlRatio = rtlCount / totalLetters;
  
  // If more than 30% RTL, consider it RTL
  return rtlRatio > 0.3 ? 'right' : 'left';
}

/**
 * Detect specific language
 * @returns 'fa' | 'ar' | 'he' | 'en'
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  
  // Check for Persian-specific characters
  if (PERSIAN_RANGE.test(text)) {
    return 'fa';
  }
  
  // Check for Arabic
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ar';
  }
  
  // Check for Hebrew
  if (/[\u0590-\u05FF]/.test(text)) {
    return 'he';
  }
  
  return 'en';
}

/**
 * Get appropriate font for language
 */
export function getFontForLanguage(language, isDisplay = false) {
  const fonts = {
    fa: {
      display: 'B Nazanin',
      content: 'Tahoma'
    },
    ar: {
      display: 'Traditional Arabic',
      content: 'Tahoma'
    },
    he: {
      display: 'David',
      content: 'Arial'
    },
    en: {
      display: 'Arial',
      content: 'Arial'
    }
  };
  
  const langFonts = fonts[language] || fonts.en;
  return isDisplay ? langFonts.display : langFonts.content;
}

/**
 * Wrap text in RTL markers if needed
 */
export function wrapRTL(text, direction) {
  if (direction !== 'right') return text;
  
  // Unicode RTL embedding markers
  const RLE = '\u202B'; // Right-to-Left Embedding
  const PDF = '\u202C'; // Pop Directional Formatting
  
  return `${RLE}${text}${PDF}`;
}

/**
 * Reverse array for RTL layout (e.g., flex items)
 */
export function rtlArray(arr, direction) {
  if (direction !== 'right') return arr;
  return [...arr].reverse();
}
