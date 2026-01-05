/**
 * Presentation Builder
 * Core engine that assembles slides into a PPTX file
 */

import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderTemplate, getTemplate } from './templates/engine.js';
import { selectImage } from './images/selector.js';
import { detectDirection } from './utils/rtl.js';
import { buildChart } from './charts/builder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Builder {
  constructor(options = {}) {
    this.theme = options.theme || {};
    this.direction = options.direction || 'left';
    this.imageSource = options.imageSource || 'gemini';
    this.verbose = options.verbose || false;
    this.onProgress = options.onProgress || (() => {});
    
    // Initialize PptxGenJS
    this.pptx = new PptxGenJS();
    this.pptx.layout = 'LAYOUT_16x9';
    this.pptx.author = 'Slide Maker';
    this.pptx.subject = 'Generated Presentation';
  }

  /**
   * Build presentation from slides array
   */
  async build(slides, metadata = {}) {
    // Set presentation metadata
    if (metadata.title) this.pptx.title = metadata.title;
    if (metadata.author) this.pptx.author = metadata.author;
    if (metadata.subject) this.pptx.subject = metadata.subject;
    
    const total = slides.length;
    
    for (let i = 0; i < total; i++) {
      const slideConfig = slides[i];
      const percent = 15 + Math.round((i / total) * 70);
      
      this.onProgress({
        current: i + 1,
        total,
        percent,
        status: `Building slide ${i + 1}/${total}: ${slideConfig.template || 'content'}`
      });
      
      await this.buildSlide(slideConfig, i, total);
    }
    
    return this.pptx;
  }

  /**
   * Build a single slide
   */
  async buildSlide(config, index, total) {
    const slide = this.pptx.addSlide();
    const template = config.template || this.autoSelectTemplate(config, index, total);
    const data = config.data || config;
    
    // Apply slide background from theme
    if (this.theme.colors?.surface) {
      slide.background = { color: this.theme.colors.surface.replace('#', '') };
    }
    
    // Build based on template type
    switch (template) {
      case 'title':
        await this.buildTitleSlide(slide, data);
        break;
      case 'section-divider':
        await this.buildSectionSlide(slide, data);
        break;
      case 'content-image-right':
      case 'content-image-left':
        await this.buildContentImageSlide(slide, data, template.includes('left'));
        break;
      case 'two-column':
        await this.buildTwoColumnSlide(slide, data);
        break;
      case 'quote':
        await this.buildQuoteSlide(slide, data);
        break;
      case 'three-cards':
        await this.buildThreeCardsSlide(slide, data);
        break;
      case 'chart':
        await this.buildChartSlide(slide, data);
        break;
      case 'timeline':
        await this.buildTimelineSlide(slide, data);
        break;
      case 'table':
        await this.buildTableSlide(slide, data);
        break;
      case 'big-number':
        await this.buildBigNumberSlide(slide, data);
        break;
      case 'closing':
        await this.buildClosingSlide(slide, data);
        break;
      case 'full-image':
        await this.buildFullImageSlide(slide, data);
        break;
      default:
        await this.buildContentImageSlide(slide, data, false);
    }
    
    // Add speaker notes if present
    if (data.speakerNotes) {
      slide.addNotes(data.speakerNotes);
    }
    
    return slide;
  }

  /**
   * Auto-select template based on content
   */
  autoSelectTemplate(config, index, total) {
    const data = config.data || config;
    
    // Position-based
    if (index === 0) return 'title';
    if (index === total - 1 && (data.cta || data.cta_text)) return 'closing';
    
    // Content-based
    if (data.section_title || data.sectionTitle) return 'section-divider';
    if (data.quote || data.quote_text) return 'quote';
    if (data.chart) return 'chart';
    if (data.table) return 'table';
    if (data.cards && data.cards.length === 3) return 'three-cards';
    if (data.stats || data.statistics) return 'big-number';
    if (data.timeline || data.items) return 'timeline';
    if (data.col_a || data.comparison) return 'two-column';
    if (data.fullImage || data.backgroundImage) return 'full-image';
    
    // Default
    return 'content-image-right';
  }

  // ============================================
  // SLIDE BUILDERS
  // ============================================

  async buildTitleSlide(slide, data) {
    const isRTL = this.direction === 'right';
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const textColor = this.theme.colors?.surfaceForeground || '#1a1a2e';
    
    // Background with primary color
    slide.background = { color: this.theme.colors?.surface?.replace('#', '') || 'FFFFFF' };
    
    // Decorative corners
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: isRTL ? 9.2 : 0.3, y: 0.3, w: 0.8, h: 0.05,
      fill: { color: primary.replace('#', '') }
    });
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: isRTL ? 9.95 : 0.3, y: 0.3, w: 0.05, h: 0.8,
      fill: { color: primary.replace('#', '') }
    });
    
    // Title
    slide.addText(data.title || 'Untitled', {
      x: 0.5, y: 2, w: 9, h: 1.5,
      fontSize: 44,
      bold: true,
      color: primary.replace('#', ''),
      align: 'center',
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Subtitle
    if (data.subtitle) {
      slide.addText(data.subtitle, {
        x: 0.5, y: 3.4, w: 9, h: 0.8,
        fontSize: 24,
        color: textColor.replace('#', ''),
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
    
    // Author & Date
    const meta = [data.author, data.date].filter(Boolean).join(' • ');
    if (meta) {
      slide.addText(meta, {
        x: 0.5, y: 4.5, w: 9, h: 0.5,
        fontSize: 14,
        color: '888888',
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildSectionSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    
    // Full primary background
    slide.background = { color: primary.replace('#', '') };
    
    // Section number (large, transparent)
    if (data.section_number || data.sectionNumber) {
      slide.addText(data.section_number || data.sectionNumber, {
        x: 0.5, y: 0.5, w: 3, h: 2,
        fontSize: 120,
        color: 'FFFFFF',
        transparency: 80,
        fontFace: this.theme.fonts?.display || 'Arial',
        bold: true
      });
    }
    
    // Section title
    slide.addText(data.section_title || data.sectionTitle || 'Section', {
      x: 0.5, y: 2.2, w: 9, h: 1.2,
      fontSize: 48,
      color: 'FFFFFF',
      align: 'center',
      bold: true,
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Decorative line
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: 4, y: 3.6, w: 2, h: 0.05,
      fill: { color: 'FFFFFF' },
      transparency: 50
    });
  }

  async buildContentImageSlide(slide, data, imageOnLeft = false) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const textColor = this.theme.colors?.surfaceForeground || '#333333';
    const isRTL = this.direction === 'right';
    
    // Effective image position (consider RTL)
    const effectiveImageLeft = isRTL ? !imageOnLeft : imageOnLeft;
    
    // Title
    slide.addText(data.title || '', {
      x: 0.5, y: 0.3, w: 9, h: 0.7,
      fontSize: 28,
      bold: true,
      color: primary.replace('#', ''),
      align: isRTL ? 'right' : 'left',
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Content area positions
    const textX = effectiveImageLeft ? 5.2 : 0.5;
    const imageX = effectiveImageLeft ? 0.5 : 5.7;
    
    // Bullet points
    const points = data.points || data.bullets || [];
    if (points.length > 0) {
      const bulletText = points.map(p => ({
        text: `• ${p}`,
        options: { bullet: false, paraSpaceAfter: 10 }
      }));
      
      slide.addText(bulletText, {
        x: textX, y: 1.2, w: 4.3, h: 3.5,
        fontSize: 16,
        color: textColor.replace('#', ''),
        align: isRTL ? 'right' : 'left',
        valign: 'top',
        fontFace: this.theme.fonts?.content || 'Arial',
        rtlMode: isRTL
      });
    }
    
    // Image
    if (data.image && this.imageSource !== 'none') {
      try {
        const imagePath = await selectImage(data.image, this.imageSource);
        if (imagePath) {
          slide.addImage({
            path: imagePath,
            x: imageX, y: 1.2, w: 4, h: 3
          });
        }
      } catch (err) {
        this.log(`Image failed: ${err.message}`);
        // Add placeholder
        slide.addShape(this.pptx.shapes.RECTANGLE, {
          x: imageX, y: 1.2, w: 4, h: 3,
          fill: { color: 'EEEEEE' }
        });
      }
    }
    
    // Footnote
    if (data.footnote) {
      slide.addText(data.footnote, {
        x: 0.5, y: 5, w: 9, h: 0.3,
        fontSize: 10,
        color: '999999',
        align: isRTL ? 'right' : 'left',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildTwoColumnSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const secondary = this.theme.colors?.secondary || '#f5f5f5';
    const textColor = this.theme.colors?.surfaceForeground || '#333333';
    
    // Title
    slide.addText(data.title || '', {
      x: 0.5, y: 0.3, w: 9, h: 0.7,
      fontSize: 28,
      bold: true,
      color: primary.replace('#', ''),
      align: 'center',
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Column A
    slide.addShape(this.pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: 1.2, w: 4.3, h: 3.8,
      fill: { color: secondary.replace('#', '') },
      rectRadius: 0.1
    });
    
    slide.addText(data.col_a_title || data.colATitle || 'Option A', {
      x: 0.7, y: 1.4, w: 3.9, h: 0.5,
      fontSize: 20,
      bold: true,
      color: primary.replace('#', ''),
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    const colAPoints = data.col_a_points || data.colAPoints || [];
    if (colAPoints.length > 0) {
      slide.addText(colAPoints.map(p => `• ${p}`).join('\n'), {
        x: 0.7, y: 2, w: 3.9, h: 2.8,
        fontSize: 14,
        color: textColor.replace('#', ''),
        valign: 'top',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
    
    // Column B
    slide.addShape(this.pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.2, y: 1.2, w: 4.3, h: 3.8,
      fill: { color: secondary.replace('#', '') },
      rectRadius: 0.1
    });
    
    slide.addText(data.col_b_title || data.colBTitle || 'Option B', {
      x: 5.4, y: 1.4, w: 3.9, h: 0.5,
      fontSize: 20,
      bold: true,
      color: primary.replace('#', ''),
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    const colBPoints = data.col_b_points || data.colBPoints || [];
    if (colBPoints.length > 0) {
      slide.addText(colBPoints.map(p => `• ${p}`).join('\n'), {
        x: 5.4, y: 2, w: 3.9, h: 2.8,
        fontSize: 14,
        color: textColor.replace('#', ''),
        valign: 'top',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildQuoteSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const secondary = this.theme.colors?.secondary || '#f5f5f5';
    
    // Background
    slide.background = { color: secondary.replace('#', '') };
    
    // Large quote mark
    slide.addText('"', {
      x: 0.5, y: 0.5, w: 2, h: 2,
      fontSize: 150,
      color: primary.replace('#', ''),
      transparency: 70,
      fontFace: 'Georgia'
    });
    
    // Quote text
    slide.addText(data.quote || data.quote_text || '', {
      x: 1, y: 1.8, w: 8, h: 2,
      fontSize: 24,
      color: this.theme.colors?.secondaryForeground?.replace('#', '') || '333333',
      align: 'center',
      fontFace: this.theme.fonts?.content || 'Arial',
      italic: true
    });
    
    // Decorative line
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: 4, y: 4, w: 2, h: 0.04,
      fill: { color: primary.replace('#', '') }
    });
    
    // Author
    if (data.quote_author || data.author) {
      slide.addText(`— ${data.quote_author || data.author}`, {
        x: 1, y: 4.2, w: 8, h: 0.5,
        fontSize: 18,
        color: primary.replace('#', ''),
        align: 'center',
        fontFace: this.theme.fonts?.display || 'Arial'
      });
    }
    
    // Source
    if (data.quote_source || data.source) {
      slide.addText(data.quote_source || data.source, {
        x: 1, y: 4.7, w: 8, h: 0.4,
        fontSize: 12,
        color: '888888',
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildThreeCardsSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const secondary = this.theme.colors?.secondary || '#f5f5f5';
    const textColor = this.theme.colors?.surfaceForeground || '#333333';
    
    // Title
    slide.addText(data.title || '', {
      x: 0.5, y: 0.3, w: 9, h: 0.7,
      fontSize: 28,
      bold: true,
      color: primary.replace('#', ''),
      align: 'center',
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    const cards = data.cards || [];
    const cardWidth = 2.9;
    const startX = 0.5;
    
    cards.slice(0, 3).forEach((card, i) => {
      const x = startX + (i * (cardWidth + 0.3));
      
      // Card background
      slide.addShape(this.pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.2, w: cardWidth, h: 3.8,
        fill: { color: secondary.replace('#', '') },
        rectRadius: 0.1
      });
      
      // Top accent line
      slide.addShape(this.pptx.shapes.RECTANGLE, {
        x, y: 1.2, w: cardWidth, h: 0.06,
        fill: { color: primary.replace('#', '') }
      });
      
      // Icon
      slide.addText(card.icon || '📌', {
        x, y: 1.4, w: cardWidth, h: 0.8,
        fontSize: 36,
        align: 'center'
      });
      
      // Card title
      slide.addText(card.title || card.card_title || '', {
        x: x + 0.15, y: 2.3, w: cardWidth - 0.3, h: 0.5,
        fontSize: 16,
        bold: true,
        color: primary.replace('#', ''),
        align: 'center',
        fontFace: this.theme.fonts?.display || 'Arial'
      });
      
      // Card body
      slide.addText(card.body || card.card_body || '', {
        x: x + 0.15, y: 2.9, w: cardWidth - 0.3, h: 2,
        fontSize: 12,
        color: textColor.replace('#', ''),
        align: 'center',
        valign: 'top',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    });
  }

  async buildChartSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const chartColors = this.getChartColors();
    
    // Title
    slide.addText(data.title || 'Chart', {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 28,
      bold: true,
      color: primary.replace('#', ''),
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Subtitle
    if (data.subtitle) {
      slide.addText(data.subtitle, {
        x: 0.5, y: 0.85, w: 9, h: 0.4,
        fontSize: 14,
        color: '888888',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
    
    // Build chart
    const chartConfig = data.chart || data;
    await buildChart(slide, this.pptx, chartConfig, chartColors);
    
    // Data source
    if (data.data_source || data.dataSource) {
      slide.addText(data.data_source || data.dataSource, {
        x: 0.5, y: 5, w: 9, h: 0.3,
        fontSize: 10,
        color: '999999',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildTimelineSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const textColor = this.theme.colors?.surfaceForeground || '#333333';
    
    // Title
    slide.addText(data.title || 'Timeline', {
      x: 0.5, y: 0.3, w: 9, h: 0.7,
      fontSize: 28,
      bold: true,
      color: primary.replace('#', ''),
      align: 'center',
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Timeline line
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: 0.5, y: 2.8, w: 9, h: 0.05,
      fill: { color: 'CCCCCC' }
    });
    
    const items = data.items || data.timeline || [];
    const itemCount = Math.min(items.length, 5);
    const spacing = 9 / (itemCount + 1);
    
    items.slice(0, 5).forEach((item, i) => {
      const x = 0.5 + spacing * (i + 1) - 0.6;
      
      // Date above
      slide.addText(item.date || '', {
        x, y: 1.8, w: 1.2, h: 0.4,
        fontSize: 11,
        color: '888888',
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
      
      // Circle marker
      slide.addShape(this.pptx.shapes.OVAL, {
        x: x + 0.4, y: 2.65, w: 0.3, h: 0.3,
        fill: { color: primary.replace('#', '') }
      });
      
      // Event below
      slide.addText(item.event || item.title || '', {
        x, y: 3.1, w: 1.2, h: 1.5,
        fontSize: 11,
        color: textColor.replace('#', ''),
        align: 'center',
        valign: 'top',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    });
  }

  async buildTableSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    
    // Title
    slide.addText(data.title || 'Table', {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 28,
      bold: true,
      color: primary.replace('#', ''),
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    const tableConfig = data.table || data;
    const headers = tableConfig.headers || [];
    const rows = tableConfig.rows || [];
    
    if (headers.length > 0) {
      const tableData = [
        headers.map(h => ({
          text: h,
          options: { fill: { color: primary.replace('#', '') }, color: 'FFFFFF', bold: true }
        })),
        ...rows
      ];
      
      const colCount = headers.length;
      const colWidth = 8 / colCount;
      
      slide.addTable(tableData, {
        x: 0.5, y: 1.2, w: 9, h: 3.5,
        colW: Array(colCount).fill(colWidth),
        border: { pt: 1, color: 'CCCCCC' },
        align: 'center',
        valign: 'middle',
        fontSize: 12,
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
    
    // Footnote
    if (data.footnote) {
      slide.addText(data.footnote, {
        x: 0.5, y: 5, w: 9, h: 0.3,
        fontSize: 10,
        color: '999999',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildBigNumberSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const textColor = this.theme.colors?.surfaceForeground || '#333333';
    
    // Context above
    if (data.context) {
      slide.addText(data.context, {
        x: 0.5, y: 1, w: 9, h: 0.5,
        fontSize: 20,
        color: '888888',
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
    
    const stats = data.stats || data.statistics || [];
    const statCount = Math.min(stats.length, 3);
    const spacing = 9 / (statCount + 1);
    
    stats.slice(0, 3).forEach((stat, i) => {
      const x = spacing * (i + 1) - 1.5;
      
      // Big number
      slide.addText(stat.number || stat.value || '0', {
        x, y: 1.8, w: 3, h: 1.5,
        fontSize: 72,
        bold: true,
        color: primary.replace('#', ''),
        align: 'center',
        fontFace: this.theme.fonts?.display || 'Arial'
      });
      
      // Label
      slide.addText(stat.label || '', {
        x, y: 3.3, w: 3, h: 0.6,
        fontSize: 18,
        color: textColor.replace('#', ''),
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    });
    
    // Footnote
    if (data.footnote) {
      slide.addText(data.footnote, {
        x: 0.5, y: 4.5, w: 9, h: 0.4,
        fontSize: 12,
        color: '888888',
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildClosingSlide(slide, data) {
    const primary = this.theme.colors?.primary || '#1a1a2e';
    const isRTL = this.direction === 'right';
    
    // Primary background
    slide.background = { color: primary.replace('#', '') };
    
    // Decorative corners
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: isRTL ? 0.3 : 8.9, y: 0.3, w: 0.8, h: 0.05,
      fill: { color: 'FFFFFF' },
      transparency: 50
    });
    
    // CTA text
    slide.addText(data.cta_text || data.cta || 'Thank You!', {
      x: 0.5, y: 2, w: 9, h: 1,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      fontFace: this.theme.fonts?.display || 'Arial'
    });
    
    // Decorative line
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: 4, y: 3.2, w: 2, h: 0.05,
      fill: { color: 'FFFFFF' },
      transparency: 50
    });
    
    // Contact info
    if (data.contact_info || data.contact) {
      slide.addText(data.contact_info || data.contact, {
        x: 0.5, y: 3.5, w: 9, h: 0.5,
        fontSize: 20,
        color: 'FFFFFF',
        transparency: 20,
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
    
    // Website
    if (data.website) {
      slide.addText(data.website, {
        x: 0.5, y: 4.1, w: 9, h: 0.4,
        fontSize: 16,
        color: 'FFFFFF',
        transparency: 40,
        align: 'center',
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  async buildFullImageSlide(slide, data) {
    // Try to add full background image
    if (data.image && this.imageSource !== 'none') {
      try {
        const imagePath = await selectImage(data.image, this.imageSource);
        if (imagePath) {
          slide.background = { path: imagePath };
        }
      } catch (err) {
        this.log(`Background image failed: ${err.message}`);
        slide.background = { color: '333333' };
      }
    } else {
      slide.background = { color: '333333' };
    }
    
    // Gradient overlay at bottom
    slide.addShape(this.pptx.shapes.RECTANGLE, {
      x: 0, y: 3.5, w: 10, h: 2,
      fill: { color: '000000' },
      transparency: 50
    });
    
    // Caption
    if (data.caption) {
      slide.addText(data.caption, {
        x: 0.5, y: 4, w: 9, h: 0.8,
        fontSize: 28,
        color: 'FFFFFF',
        fontFace: this.theme.fonts?.display || 'Arial'
      });
    }
    
    // Subcaption
    if (data.subcaption) {
      slide.addText(data.subcaption, {
        x: 0.5, y: 4.8, w: 9, h: 0.5,
        fontSize: 14,
        color: 'FFFFFF',
        transparency: 30,
        fontFace: this.theme.fonts?.content || 'Arial'
      });
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  getChartColors() {
    const theme = this.theme;
    return [
      theme.colors?.primary?.replace('#', '') || '1a1a2e',
      theme.colors?.accent?.replace('#', '') || 'ff6b6b',
      theme.colors?.secondary?.replace('#', '') || 'f5f5f5',
      theme.chartColors?.[0]?.replace('#', '') || '4472c4',
      theme.chartColors?.[1]?.replace('#', '') || 'ed7d31'
    ];
  }

  log(message) {
    if (this.verbose) {
      console.log(`[Builder] ${message}`);
    }
  }

  /**
   * Save presentation to file
   */
  async save(outputPath, formats = ['pptx']) {
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save PPTX
    await this.pptx.writeFile(outputPath);
    this.log(`Saved: ${outputPath}`);
    
    // TODO: PDF conversion would require LibreOffice
    // For now, just save PPTX
    
    return outputPath;
  }

  /**
   * Validate output (placeholder)
   */
  async validate(outputPath) {
    // TODO: Implement PDF conversion and visual validation
    this.log(`Validation requested for: ${outputPath}`);
    return true;
  }
}
