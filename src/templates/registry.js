/**
 * Template Registry
 * Lists and describes available slide templates
 */

/**
 * Template definitions
 */
const TEMPLATES = {
  'title': {
    name: 'title',
    description: 'Opening slide with presentation title, subtitle, and author',
    requiredFields: ['title'],
    optionalFields: ['subtitle', 'author', 'date']
  },
  
  'section-divider': {
    name: 'section-divider',
    description: 'Section break slide with large section title',
    requiredFields: ['section_title'],
    optionalFields: ['section_number']
  },
  
  'content-image-right': {
    name: 'content-image-right',
    description: 'Content with bullet points on left, image on right',
    requiredFields: ['title'],
    optionalFields: ['points', 'image', 'footnote']
  },
  
  'content-image-left': {
    name: 'content-image-left',
    description: 'Content with image on left, bullet points on right',
    requiredFields: ['title'],
    optionalFields: ['points', 'image', 'footnote']
  },
  
  'two-column': {
    name: 'two-column',
    description: 'Side-by-side comparison of two options',
    requiredFields: ['title'],
    optionalFields: ['col_a_title', 'col_a_points', 'col_b_title', 'col_b_points']
  },
  
  'quote': {
    name: 'quote',
    description: 'Large quote with attribution',
    requiredFields: ['quote'],
    optionalFields: ['quote_author', 'quote_source']
  },
  
  'three-cards': {
    name: 'three-cards',
    description: 'Three feature cards with icons',
    requiredFields: ['title', 'cards'],
    optionalFields: []
  },
  
  'chart': {
    name: 'chart',
    description: 'Data visualization with various chart types',
    requiredFields: ['title', 'chart'],
    optionalFields: ['subtitle', 'data_source']
  },
  
  'timeline': {
    name: 'timeline',
    description: 'Horizontal timeline with events',
    requiredFields: ['title', 'items'],
    optionalFields: []
  },
  
  'table': {
    name: 'table',
    description: 'Data table with headers and rows',
    requiredFields: ['title', 'table'],
    optionalFields: ['footnote']
  },
  
  'big-number': {
    name: 'big-number',
    description: 'Large statistics display',
    requiredFields: ['stats'],
    optionalFields: ['context', 'footnote']
  },
  
  'closing': {
    name: 'closing',
    description: 'Final slide with call-to-action',
    requiredFields: ['cta_text'],
    optionalFields: ['contact_info', 'website']
  },
  
  'full-image': {
    name: 'full-image',
    description: 'Full-bleed background image with caption',
    requiredFields: ['image'],
    optionalFields: ['caption', 'subcaption']
  }
};

/**
 * List all available templates
 */
export function listTemplates() {
  return Object.values(TEMPLATES);
}

/**
 * Get template definition by name
 */
export function getTemplate(name) {
  return TEMPLATES[name] || TEMPLATES['content-image-right'];
}

/**
 * Check if template exists
 */
export function hasTemplate(name) {
  return name in TEMPLATES;
}
