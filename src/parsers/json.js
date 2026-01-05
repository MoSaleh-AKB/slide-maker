/**
 * JSON Parser
 * Parses presentation content from JSON files
 */

import { detectDirection } from '../utils/rtl.js';

/**
 * Parse JSON content into slides structure
 */
export function parseJSON(content) {
  let data;
  
  try {
    data = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }
  
  // Handle both array of slides and object with metadata
  let metadata = {};
  let slides = [];
  
  if (Array.isArray(data)) {
    slides = data;
  } else if (data.slides) {
    metadata = data.metadata || {};
    slides = data.slides;
  } else {
    throw new Error('JSON must be an array of slides or an object with "slides" property');
  }
  
  // Normalize slides
  slides = slides.map((slide, index) => normalizeSlide(slide, index, slides.length));
  
  // Detect text direction from content
  const allText = slides.map(s => JSON.stringify(s.data)).join(' ');
  const detectedDirection = detectDirection(allText);
  
  return {
    metadata: {
      title: metadata.title || 'Presentation',
      author: metadata.author || '',
      date: metadata.date || new Date().toISOString().split('T')[0],
      theme: metadata.theme || 'corporate-modern',
      direction: metadata.direction || 'auto',
      ...metadata
    },
    slides,
    detectedDirection
  };
}

/**
 * Normalize slide structure
 */
function normalizeSlide(slide, index, total) {
  // If slide is just data without template wrapper
  if (!slide.template && !slide.data) {
    return {
      template: autoDetectTemplate(slide, index, total),
      data: slide
    };
  }
  
  return {
    template: slide.template || autoDetectTemplate(slide.data || slide, index, total),
    data: slide.data || slide
  };
}

/**
 * Auto-detect template based on content
 */
function autoDetectTemplate(data, index, total) {
  if (index === 0) return 'title';
  if (index === total - 1 && (data.cta || data.cta_text)) return 'closing';
  if (data.section_title || data.sectionTitle) return 'section-divider';
  if (data.quote || data.quote_text) return 'quote';
  if (data.chart) return 'chart';
  if (data.table) return 'table';
  if (data.cards && data.cards.length >= 3) return 'three-cards';
  if (data.stats || data.statistics) return 'big-number';
  if (data.timeline || data.items) return 'timeline';
  if (data.col_a || data.colA || data.comparison) return 'two-column';
  if (data.fullImage || data.backgroundImage) return 'full-image';
  
  return 'content-image-right';
}
