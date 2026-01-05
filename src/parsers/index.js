/**
 * Input Parser - Auto-detect and parse input files
 */

import fs from 'fs';
import path from 'path';
import { parseMarkdown } from './markdown.js';
import { parseJSON } from './json.js';

/**
 * Parse input file based on extension
 */
export async function parseInput(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
  
  const ext = path.extname(inputPath).toLowerCase();
  const content = fs.readFileSync(inputPath, 'utf-8');
  
  switch (ext) {
    case '.md':
    case '.markdown':
      return parseMarkdown(content);
    
    case '.json':
      return parseJSON(content);
    
    default:
      // Try to auto-detect
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        return parseJSON(content);
      }
      return parseMarkdown(content);
  }
}

export { parseMarkdown } from './markdown.js';
export { parseJSON } from './json.js';
