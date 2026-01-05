/**
 * Slide Maker - Main Entry Point
 * Universal presentation builder with AI-powered images
 */

import { Builder } from './builder.js';
import { parseInput } from './parsers/index.js';
import { loadTheme, listThemes } from './themes/loader.js';
import { listTemplates } from './templates/registry.js';

/**
 * Build a presentation from input file
 * @param {Object} options - Build options
 * @returns {Promise<Object>} Build result
 */
export async function build(options) {
  const {
    input,
    output = 'output/presentation.pptx',
    theme = 'corporate-modern',
    direction = 'auto',
    formats = ['pptx'],
    images = { source: 'gemini' },
    validate = false,
    verbose = false,
    onProgress = () => {}
  } = options;

  // Parse input file
  onProgress({ status: 'Parsing input file...', percent: 5 });
  const parsed = await parseInput(input);
  
  // Load theme
  onProgress({ status: `Loading theme: ${theme}...`, percent: 10 });
  const themeConfig = await loadTheme(theme);
  
  // Create builder
  const builder = new Builder({
    theme: themeConfig,
    direction: direction === 'auto' ? parsed.detectedDirection : direction,
    imageSource: images.source,
    verbose,
    onProgress
  });
  
  // Build presentation
  onProgress({ status: 'Building slides...', percent: 15 });
  const result = await builder.build(parsed.slides, parsed.metadata);
  
  // Save output
  onProgress({ status: 'Saving presentation...', percent: 90 });
  const outputPath = await builder.save(output, formats);
  
  // Validate if requested
  if (validate) {
    onProgress({ status: 'Validating output...', percent: 95 });
    await builder.validate(outputPath);
  }
  
  onProgress({ status: 'Complete!', percent: 100 });
  
  return {
    slideCount: parsed.slides.length,
    theme,
    direction: builder.direction,
    outputPath,
    pdfPath: formats.includes('pdf') ? outputPath.replace('.pptx', '.pdf') : null
  };
}

// Export utilities
export { loadTheme, listThemes } from './themes/loader.js';
export { listTemplates } from './templates/registry.js';
export { Builder } from './builder.js';
