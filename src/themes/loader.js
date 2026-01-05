/**
 * Theme Loader
 * Loads and parses CSS theme files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = path.join(__dirname, '../../themes');

/**
 * Theme definitions
 */
const THEME_DEFINITIONS = {
  'islamic-dark': {
    name: 'islamic-dark',
    description: 'Dark theme with gold accents, elegant Islamic aesthetic',
    bestFor: 'Religious content, Persian poetry, historical topics',
    colors: {
      surface: '#0D1B2A',
      surfaceForeground: '#F8F4E8',
      primary: '#D4AF37',
      primaryLight: '#E4C767',
      primaryDark: '#B4952F',
      primaryForeground: '#0D1B2A',
      secondary: '#1B3A4B',
      secondaryForeground: '#F8F4E8',
      accent: '#800020',
      accentForeground: '#F8F4E8',
      muted: '#2D4A5E',
      mutedForeground: '#A0AEC0',
      border: '#D4AF37'
    },
    fonts: {
      display: 'B Nazanin',
      content: 'Tahoma'
    },
    chartColors: ['#D4AF37', '#800020', '#1B3A4B', '#4A7C59', '#8B4513']
  },
  
  'corporate-modern': {
    name: 'corporate-modern',
    description: 'Clean professional look with navy blue accents',
    bestFor: 'Business presentations, quarterly reports, professional pitches',
    colors: {
      surface: '#FFFFFF',
      surfaceForeground: '#1A1A2E',
      primary: '#16213E',
      primaryLight: '#1F3460',
      primaryDark: '#0F1829',
      primaryForeground: '#FFFFFF',
      secondary: '#F5F5F5',
      secondaryForeground: '#1A1A2E',
      accent: '#0F4C75',
      accentForeground: '#FFFFFF',
      muted: '#E8E8E8',
      mutedForeground: '#6B7280',
      border: '#D1D5DB'
    },
    fonts: {
      display: 'Arial',
      content: 'Arial'
    },
    chartColors: ['#16213E', '#0F4C75', '#3282B8', '#BBE1FA', '#1B262C']
  },
  
  'minimal-light': {
    name: 'minimal-light',
    description: 'Clean minimalist design with subtle accents',
    bestFor: 'Clean presentations, design portfolios, modern topics',
    colors: {
      surface: '#FAFAFA',
      surfaceForeground: '#171717',
      primary: '#171717',
      primaryLight: '#404040',
      primaryDark: '#000000',
      primaryForeground: '#FAFAFA',
      secondary: '#F5F5F4',
      secondaryForeground: '#171717',
      accent: '#FF6B6B',
      accentForeground: '#FFFFFF',
      muted: '#E7E5E4',
      mutedForeground: '#78716C',
      border: '#D6D3D1'
    },
    fonts: {
      display: 'Georgia',
      content: 'Arial'
    },
    chartColors: ['#171717', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
  },
  
  'academic': {
    name: 'academic',
    description: 'Warm scholarly aesthetic with forest green accents',
    bestFor: 'Educational content, research presentations, lectures',
    colors: {
      surface: '#FFFEF9',
      surfaceForeground: '#2C3E50',
      primary: '#1E5631',
      primaryLight: '#2D7A47',
      primaryDark: '#143D22',
      primaryForeground: '#FFFFFF',
      secondary: '#F5F1E6',
      secondaryForeground: '#2C3E50',
      accent: '#C65D07',
      accentForeground: '#FFFFFF',
      muted: '#EBE6D9',
      mutedForeground: '#6B7B8C',
      border: '#C9C2B4'
    },
    fonts: {
      display: 'Georgia',
      content: 'Georgia'
    },
    chartColors: ['#1E5631', '#C65D07', '#2C3E50', '#8B4513', '#556B2F']
  },
  
  'bold-creative': {
    name: 'bold-creative',
    description: 'Vibrant dark theme with purple and pink accents',
    bestFor: 'Creative pitches, startups, innovative topics',
    colors: {
      surface: '#1A1A2E',
      surfaceForeground: '#EAEAEA',
      primary: '#6C63FF',
      primaryLight: '#8B85FF',
      primaryDark: '#5046E5',
      primaryForeground: '#FFFFFF',
      secondary: '#16213E',
      secondaryForeground: '#EAEAEA',
      accent: '#FF2E63',
      accentForeground: '#FFFFFF',
      muted: '#2D2D44',
      mutedForeground: '#9CA3AF',
      border: '#6C63FF'
    },
    fonts: {
      display: 'Arial Black',
      content: 'Arial'
    },
    chartColors: ['#6C63FF', '#FF2E63', '#08D9D6', '#F38181', '#AA96DA']
  }
};

/**
 * Load a theme by name
 */
export async function loadTheme(themeName) {
  const theme = THEME_DEFINITIONS[themeName];
  
  if (!theme) {
    console.warn(`Theme "${themeName}" not found, using corporate-modern`);
    return THEME_DEFINITIONS['corporate-modern'];
  }
  
  return theme;
}

/**
 * List all available themes
 */
export function listThemes() {
  return Object.values(THEME_DEFINITIONS).map(theme => ({
    name: theme.name,
    description: theme.description,
    bestFor: theme.bestFor
  }));
}

/**
 * Get theme colors for charts
 */
export function getChartColors(themeName) {
  const theme = THEME_DEFINITIONS[themeName] || THEME_DEFINITIONS['corporate-modern'];
  return theme.chartColors;
}
