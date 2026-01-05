/**
 * Template Engine
 * Renders HTML templates with data
 */

import Mustache from 'mustache';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

// Disable HTML escaping
Mustache.escape = (text) => text;

/**
 * Render a template with data
 */
export function renderTemplate(templateName, data, theme) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }
  
  const template = fs.readFileSync(templatePath, 'utf-8');
  
  // Merge data with theme variables
  const context = {
    ...data,
    theme: theme,
    colors: theme.colors,
    fonts: theme.fonts
  };
  
  return Mustache.render(template, context);
}

/**
 * Get template content
 */
export function getTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
  
  if (!fs.existsSync(templatePath)) {
    return null;
  }
  
  return fs.readFileSync(templatePath, 'utf-8');
}
