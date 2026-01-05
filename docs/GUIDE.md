# 🎯 Universal Slide Maker System - Complete Guide

## Version 2.1

### Table of Contents

1. [System Overview](#system-overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Input Formats](#input-formats)
5. [Themes](#themes)
6. [Templates](#templates)
7. [RTL Support](#rtl-support)
8. [Charts & Data](#charts--data)
9. [Image Integration](#image-integration)
10. [CLI Reference](#cli-reference)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

---

## System Overview

The Universal Slide Maker is a Node.js-based presentation builder that transforms Markdown or JSON content into professional PowerPoint presentations.

### Key Features

- **Multi-format Input**: Markdown, JSON, or programmatic API
- **5 Professional Themes**: Corporate, Academic, Creative, Minimal, Islamic
- **13 Slide Templates**: Title, Content, Charts, Quote, Timeline, etc.
- **RTL Support**: Full Persian/Arabic support with auto-detection
- **AI Image Integration**: Ready for Gemini and Unsplash
- **Chart Support**: Bar, Line, Pie, Column, Area, Doughnut

### Architecture

```
Input (MD/JSON) → Parser → Builder → PptxGenJS → Output (PPTX)
                    ↓
              [Theme Loader]
                    ↓
              [Template Engine]
                    ↓
              [Image Selector]
                    ↓
              [Chart Builder]
```

---

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Steps

```bash
# Clone repository
git clone https://github.com/MoSaleh-AKB/slide-maker.git
cd slide-maker

# Install dependencies
npm install

# (Optional) Link CLI globally
npm link
```

---

## Quick Start

### 1. Create a Presentation File

```bash
slide-maker init my-deck
```

### 2. Edit the Content

Open `my-deck.md` and customize:

```markdown
---
title: My Presentation
theme: corporate-modern
---

# Welcome
subtitle: Getting Started

---

### Key Points

- Point one
- Point two

---

## Thank You
cta: Contact Us
```

### 3. Build

```bash
slide-maker build my-deck.md -o output/my-deck.pptx
```

---

## Input Formats

### Markdown Format

The Markdown format uses YAML frontmatter for metadata and `---` as slide separators.

#### Frontmatter Options

```yaml
---
title: Presentation Title
theme: corporate-modern    # Theme name
author: Your Name
date: 2025-01-05
direction: auto           # left | right | auto
---
```

#### Slide Syntax

| Syntax | Result |
|--------|--------|
| `# Title` | Title slide |
| `## Section: Name` | Section divider |
| `### Slide Title` | Content slide title |
| `- Point` | Bullet point |
| `> Quote text` | Quote |
| `> — Author` | Quote attribution |
| `![alt](source)` | Image |
| `[chart:type]...[/chart]` | Chart |
| `[cards]...[/cards]` | Card group |

### JSON Format

```json
{
  "metadata": {
    "title": "Title",
    "theme": "corporate-modern",
    "direction": "auto"
  },
  "slides": [
    {
      "template": "title",
      "data": { "title": "Welcome" }
    }
  ]
}
```

---

## Themes

### Available Themes

| Theme | Colors | Best For |
|-------|--------|----------|
| `corporate-modern` | Navy + White | Business, Reports |
| `minimal-light` | Black + White | Clean, Modern |
| `academic` | Green + Cream | Education, Research |
| `bold-creative` | Purple + Pink | Startups, Creative |
| `islamic-dark` | Gold + Navy | Persian, Religious |

### Using Themes

**CLI:**
```bash
slide-maker build input.md --theme bold-creative
```

**Markdown:**
```yaml
---
theme: bold-creative
---
```

**JSON:**
```json
{ "metadata": { "theme": "bold-creative" } }
```

---

## Templates

### Template List

| Template | Use Case |
|----------|----------|
| `title` | Opening slide |
| `section-divider` | Section breaks |
| `content-image-right` | Text left, image right |
| `content-image-left` | Image left, text right |
| `two-column` | Comparison |
| `quote` | Testimonials |
| `three-cards` | Features |
| `chart` | Data visualization |
| `timeline` | Process/history |
| `table` | Data tables |
| `big-number` | Statistics |
| `closing` | CTA/Thank you |
| `full-image` | Background image |

### Auto-Selection Rules

Templates are automatically selected based on:

1. **Position**: First → `title`, Last with CTA → `closing`
2. **Content**: Quote → `quote`, Chart → `chart`, etc.
3. **Default**: `content-image-right`

---

## RTL Support

### Direction Options

- `left` - Force LTR
- `right` - Force RTL
- `auto` - Detect from content

### Usage

```bash
slide-maker build persian.md --direction right
```

```yaml
---
direction: right
---
```

### Auto-Detection

The system detects RTL when content contains:
- Persian characters (ف، ک، گ، ی، etc.)
- Arabic characters
- Hebrew characters

---

## Charts & Data

### Chart Types

- `bar` - Horizontal bars
- `column` - Vertical columns
- `line` - Line graph
- `pie` - Pie chart
- `doughnut` - Doughnut
- `area` - Area chart

### Markdown Syntax

```markdown
[chart:bar]
labels: Q1, Q2, Q3, Q4
data: 25, 45, 65, 85
title: Revenue Growth
[/chart]
```

### JSON Syntax

```json
{
  "template": "chart",
  "data": {
    "title": "Revenue Growth",
    "chart": {
      "type": "bar",
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "datasets": [
        { "name": "Revenue", "values": [25, 45, 65, 85] }
      ]
    }
  }
}
```

---

## Image Integration

### Image Sources

| Source | Syntax | Description |
|--------|--------|-------------|
| Gemini AI | `gemini:` | Custom generated |
| Unsplash | `unsplash:` | Stock photos |
| Local | `./path` | Local files |

### Examples

```markdown
![hero](gemini: modern office, professional, blue tones)
![background](unsplash: business technology abstract)
![logo](./images/company-logo.png)
```

---

## CLI Reference

### Commands

```bash
slide-maker build <input>    # Build presentation
slide-maker themes           # List themes
slide-maker templates        # List templates
slide-maker init [name]      # Create sample file
```

### Build Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--output` | `-o` | `output/presentation.pptx` | Output path |
| `--theme` | `-t` | `corporate-modern` | Theme name |
| `--direction` | `-d` | `auto` | Text direction |
| `--format` | `-f` | `pptx` | Output format(s) |
| `--image-source` | | `gemini` | Image source |
| `--no-images` | | `false` | Skip images |
| `--validate` | `-v` | `false` | Validate output |
| `--verbose` | | `false` | Detailed logs |

---

## API Reference

### Basic Usage

```javascript
import { build } from './src/index.js';

const result = await build({
  input: './presentation.md',
  output: './output/deck.pptx',
  theme: 'corporate-modern',
  direction: 'auto'
});

console.log(`Created ${result.slideCount} slides`);
```

### Options

```javascript
{
  input: string,           // Input file path
  output: string,          // Output file path
  theme: string,           // Theme name
  direction: string,       // 'left' | 'right' | 'auto'
  formats: string[],       // ['pptx', 'pdf']
  images: {
    source: string         // 'gemini' | 'unsplash' | 'none'
  },
  validate: boolean,       // Run validation
  verbose: boolean,        // Detailed logging
  onProgress: function     // Progress callback
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `npm install` |
| Persian text wrong | Set `direction: right` |
| Images not showing | Check image paths or source |
| Chart not rendering | Verify data format |

### Debug Mode

```bash
slide-maker build input.md --verbose
```

---

## License

MIT License

---

*Documentation version 2.1 - January 2025*
