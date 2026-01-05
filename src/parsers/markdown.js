/**
 * Markdown Parser
 * Parses presentation content from Markdown files
 */

import matter from 'gray-matter';
import { detectDirection } from '../utils/rtl.js';

/**
 * Parse markdown content into slides structure
 */
export function parseMarkdown(content) {
  // Parse frontmatter
  const { data: metadata, content: body } = matter(content);
  
  // Split by slide separators (---)
  const slideChunks = body.split(/\n---\n/).filter(chunk => chunk.trim());
  
  // Parse each slide
  const slides = slideChunks.map((chunk, index) => parseSlideChunk(chunk, index, slideChunks.length));
  
  // Detect text direction
  const detectedDirection = detectDirection(body);
  
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
 * Parse a single slide chunk
 */
function parseSlideChunk(chunk, index, total) {
  const lines = chunk.trim().split('\n');
  const slide = {
    template: null,
    data: {}
  };
  
  let currentSection = 'body';
  let bodyLines = [];
  
  for (const line of lines) {
    // Title slide (# Title)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      slide.data.title = line.slice(2).trim();
      slide.template = index === 0 ? 'title' : null;
      continue;
    }
    
    // Section divider (## Section: Name)
    if (line.startsWith('## Section:') || line.startsWith('## section:')) {
      slide.template = 'section-divider';
      slide.data.section_title = line.replace(/^## [Ss]ection:\s*/, '').trim();
      slide.data.section_number = String(index).padStart(2, '0');
      continue;
    }
    
    // Regular section title (## Title)
    if (line.startsWith('## ')) {
      slide.data.title = line.slice(3).trim();
      continue;
    }
    
    // Subsection title (### Title)
    if (line.startsWith('### ')) {
      slide.data.title = line.slice(4).trim();
      continue;
    }
    
    // Metadata lines (key: value)
    if (line.match(/^(subtitle|author|date|cta|contact|website):\s*/i)) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      const normalizedKey = key.toLowerCase().trim();
      
      if (normalizedKey === 'cta') {
        slide.data.cta_text = value;
        slide.template = 'closing';
      } else if (normalizedKey === 'contact') {
        slide.data.contact_info = value;
      } else {
        slide.data[normalizedKey] = value;
      }
      continue;
    }
    
    // Image reference
    const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      if (src.startsWith('gemini:')) {
        slide.data.image = { source: 'gemini', prompt: src.slice(7).trim(), alt };
      } else if (src.startsWith('unsplash:')) {
        slide.data.image = { source: 'unsplash', query: src.slice(9).trim(), alt };
      } else if (src.startsWith('search:')) {
        slide.data.image = { source: 'unsplash', query: src.slice(7).trim(), alt };
      } else {
        slide.data.image = { source: 'file', path: src, alt };
      }
      continue;
    }
    
    // Chart block
    if (line.match(/^\[chart:(bar|line|pie|column|doughnut|area)\]/i)) {
      currentSection = 'chart';
      slide.template = 'chart';
      slide.data.chart = { type: line.match(/\[chart:(\w+)\]/i)[1].toLowerCase() };
      continue;
    }
    
    if (line === '[/chart]') {
      currentSection = 'body';
      continue;
    }
    
    // Cards block
    if (line === '[cards]') {
      currentSection = 'cards';
      slide.template = 'three-cards';
      slide.data.cards = [];
      continue;
    }
    
    if (line === '[/cards]') {
      currentSection = 'body';
      continue;
    }
    
    // Quote (> text)
    if (line.startsWith('> ')) {
      if (!slide.data.quote) {
        slide.data.quote = '';
        slide.template = 'quote';
      }
      const quoteLine = line.slice(2).trim();
      
      // Check for author attribution (> — Author)
      if (quoteLine.startsWith('—') || quoteLine.startsWith('-')) {
        slide.data.quote_author = quoteLine.replace(/^[—-]\s*/, '').trim();
      } else {
        slide.data.quote += (slide.data.quote ? ' ' : '') + quoteLine;
      }
      continue;
    }
    
    // Parse section-specific content
    if (currentSection === 'chart') {
      parseChartLine(line, slide.data.chart);
      continue;
    }
    
    if (currentSection === 'cards') {
      parseCardLine(line, slide.data);
      continue;
    }
    
    // Bullet points
    if (line.match(/^[-*]\s+/)) {
      if (!slide.data.points) slide.data.points = [];
      slide.data.points.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }
    
    // Regular body text
    if (line.trim()) {
      bodyLines.push(line.trim());
    }
  }
  
  // If we have body text but no points, use body as subtitle or points
  if (bodyLines.length > 0 && !slide.data.points) {
    if (slide.template === 'title' || index === 0) {
      slide.data.subtitle = bodyLines.join(' ');
    } else {
      slide.data.points = bodyLines;
    }
  }
  
  // Auto-detect template if not set
  if (!slide.template) {
    slide.template = autoDetectTemplate(slide.data, index, total);
  }
  
  return slide;
}

/**
 * Parse chart data line
 */
function parseChartLine(line, chart) {
  if (line.startsWith('labels:')) {
    chart.labels = line.slice(7).split(',').map(l => l.trim());
  } else if (line.startsWith('data:') || line.startsWith('values:')) {
    const values = line.replace(/^(data|values):/, '').split(',').map(v => parseFloat(v.trim()));
    if (!chart.datasets) chart.datasets = [];
    chart.datasets.push({ name: 'Data', values });
  } else if (line.startsWith('title:')) {
    chart.chartTitle = line.slice(6).trim();
  }
}

/**
 * Parse card line
 */
function parseCardLine(line, data) {
  if (line.startsWith('- title:')) {
    data.cards.push({ title: line.slice(8).trim() });
  } else if (line.startsWith('  icon:') && data.cards.length > 0) {
    data.cards[data.cards.length - 1].icon = line.slice(7).trim();
  } else if (line.startsWith('  body:') && data.cards.length > 0) {
    data.cards[data.cards.length - 1].body = line.slice(7).trim();
  }
}

/**
 * Auto-detect template based on content
 */
function autoDetectTemplate(data, index, total) {
  if (index === 0) return 'title';
  if (data.cta_text || data.contact_info) return 'closing';
  if (data.section_title) return 'section-divider';
  if (data.quote) return 'quote';
  if (data.chart) return 'chart';
  if (data.cards && data.cards.length >= 3) return 'three-cards';
  if (data.stats) return 'big-number';
  
  return 'content-image-right';
}
