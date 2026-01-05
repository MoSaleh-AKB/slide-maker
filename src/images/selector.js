/**
 * Image Selector
 * Smart image selection with fallback chain
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

/**
 * Select and resolve image based on source priority
 * Priority: file path > gemini > unsplash > placeholder
 */
export async function selectImage(imageSpec, preferredSource = 'gemini') {
  // Handle string input (just a path or URL)
  if (typeof imageSpec === 'string') {
    imageSpec = { path: imageSpec };
  }
  
  const { source, path: filePath, prompt, query, url, alt } = imageSpec;
  
  // 1. Try local file first
  if (filePath && fs.existsSync(filePath)) {
    return filePath;
  }
  
  // 2. Try URL
  if (url) {
    return await downloadImage(url);
  }
  
  // 3. Handle based on source
  const effectiveSource = source || preferredSource;
  
  switch (effectiveSource) {
    case 'gemini':
      // Note: Gemini integration requires external API
      // For now, fall through to unsplash
      console.log(`[Images] Gemini prompt: "${prompt || query}"`);
      console.log('[Images] Gemini requires external integration, using placeholder');
      return createPlaceholder(alt || prompt || query);
    
    case 'unsplash':
      // Note: Unsplash integration requires API key
      console.log(`[Images] Unsplash query: "${query || prompt}"`);
      console.log('[Images] Unsplash requires API key, using placeholder');
      return createPlaceholder(alt || query || prompt);
    
    case 'file':
      if (filePath) {
        throw new Error(`File not found: ${filePath}`);
      }
      return createPlaceholder(alt);
    
    case 'none':
      return null;
    
    default:
      return createPlaceholder(alt || 'image');
  }
}

/**
 * Download image from URL
 */
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const tempPath = `/tmp/slide-image-${Date.now()}.jpg`;
    
    const file = fs.createWriteStream(tempPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadImage(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(tempPath);
      });
    }).on('error', (err) => {
      fs.unlink(tempPath, () => {});
      reject(err);
    });
  });
}

/**
 * Create a placeholder image path (for development)
 */
function createPlaceholder(label = 'Image') {
  // Return null to let builder handle placeholder
  // In production, this could generate a colored rectangle
  console.log(`[Images] Using placeholder for: ${label}`);
  return null;
}

/**
 * Generate Gemini image (stub - requires API integration)
 */
export async function generateGeminiImage(prompt, outputPath) {
  // This would integrate with Gemini API
  // For now, returns null
  console.log(`[Gemini] Would generate: ${prompt}`);
  console.log(`[Gemini] Output: ${outputPath}`);
  return null;
}

/**
 * Search Unsplash images (stub - requires API integration)
 */
export async function searchUnsplashImage(query, orientation = 'landscape') {
  // This would integrate with Unsplash API
  // For now, returns null
  console.log(`[Unsplash] Would search: ${query} (${orientation})`);
  return null;
}
