# 🎯 Slide Maker

**Universal Slide Maker** - Create professional presentations from Markdown or JSON with AI-powered images, RTL support, and beautiful themes.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## ✨ Features

- 📝 **Multiple Input Formats** - Write in Markdown, JSON, or natural language
- 🎨 **5 Professional Themes** - Corporate, Academic, Creative, Minimal, Islamic/Persian
- 📐 **13 Slide Templates** - Title, Content, Charts, Timeline, Quote, and more
- 🔄 **RTL Support** - Full Persian/Arabic support with auto-detection
- 🖼️ **AI Images** - Integration-ready for Gemini and Unsplash
- 📊 **Charts & Tables** - Bar, Line, Pie, Column, Area charts
- ✅ **Validation** - Visual inspection before delivery

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/MoSaleh-AKB/slide-maker.git
cd slide-maker

# Install dependencies
npm install

# Link CLI globally (optional)
npm link
```

### Create Your First Presentation

```bash
# Initialize a sample presentation
slide-maker init my-presentation

# Build it
slide-maker build my-presentation.md -o output/presentation.pptx

# Or use npm script
npm run example:simple
```

## 📖 Usage

### CLI Commands

```bash
# Build from Markdown
slide-maker build presentation.md -o output/deck.pptx

# Build from JSON
slide-maker build config.json --theme bold-creative

# With RTL support
slide-maker build persian.md --direction right

# List available themes
slide-maker themes

# List available templates
slide-maker templates

# Create sample file
slide-maker init my-deck --format md
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output` | Output file path | `output/presentation.pptx` |
| `-t, --theme` | Theme name | `corporate-modern` |
| `-d, --direction` | Text direction: left, right, auto | `auto` |
| `-f, --format` | Output formats (pptx,pdf) | `pptx` |
| `--image-source` | Image source: gemini, unsplash, none | `gemini` |
| `--no-images` | Skip image generation | `false` |
| `-v, --validate` | Validate output | `false` |
| `--verbose` | Show detailed logs | `false` |

## 📝 Input Formats

### Markdown Format

```markdown
---
title: My Presentation
theme: corporate-modern
author: Your Name
direction: auto
---

# Welcome Slide
subtitle: Introduction

---

### Key Points

- First important point
- Second key insight
- Third compelling argument

![hero](gemini: professional business scene)

---

[chart:bar]
labels: Q1, Q2, Q3, Q4
data: 25, 45, 65, 85
title: Quarterly Growth
[/chart]

---

## Thank You

cta: Let's Connect!
contact: email@example.com
```

### JSON Format

```json
{
  "metadata": {
    "title": "Presentation Title",
    "theme": "bold-creative",
    "direction": "auto"
  },
  "slides": [
    {
      "template": "title",
      "data": {
        "title": "Welcome",
        "subtitle": "Introduction"
      }
    },
    {
      "template": "content-image-right",
      "data": {
        "title": "Key Benefits",
        "points": ["Point 1", "Point 2"],
        "image": { "source": "gemini", "prompt": "business success" }
      }
    }
  ]
}
```

## 🎨 Themes

| Theme | Best For |
|-------|----------|
| `corporate-modern` | Business presentations, reports |
| `minimal-light` | Clean designs, portfolios |
| `academic` | Research, educational content |
| `bold-creative` | Startups, creative pitches |
| `islamic-dark` | Persian content, religious topics |

## 📐 Templates

| Template | Description |
|----------|-------------|
| `title` | Opening slide |
| `section-divider` | Section breaks |
| `content-image-right` | Text + image layout |
| `content-image-left` | Image + text layout |
| `two-column` | Side-by-side comparison |
| `quote` | Large quote display |
| `three-cards` | Feature cards |
| `chart` | Data visualization |
| `timeline` | Process/history |
| `table` | Data tables |
| `big-number` | Statistics |
| `closing` | Call-to-action |
| `full-image` | Full-bleed image |

## 🔄 RTL Support

Slide Maker automatically detects Persian/Arabic text and applies RTL layout:

```markdown
---
direction: right  # or 'auto' for detection
---

# عنوان فارسی

- نکته اول
- نکته دوم
```

Direction options:
- `left` - Force left-to-right
- `right` - Force right-to-left  
- `auto` - Auto-detect from content

## 📊 Charts

Supported chart types:
- `bar` - Horizontal bars
- `column` - Vertical columns
- `line` - Line graph
- `pie` - Pie chart
- `doughnut` - Doughnut chart
- `area` - Area chart

```markdown
[chart:line]
labels: Jan, Feb, Mar, Apr
data: 10, 25, 40, 55
title: Monthly Growth
[/chart]
```

## 🖼️ Images

### Gemini AI (Custom Images)
```markdown
![alt](gemini: professional team meeting in modern office)
```

### Unsplash (Stock Photos)
```markdown
![alt](unsplash: business technology abstract)
```

### Local Files
```markdown
![alt](./images/logo.png)
```

## 🛠️ Development

### Project Structure

```
slide-maker/
├── cli.js              # CLI entry point
├── src/
│   ├── index.js        # Main API
│   ├── builder.js      # Core builder
│   ├── parsers/        # Input parsers
│   ├── themes/         # Theme system
│   ├── templates/      # Template engine
│   ├── images/         # Image handling
│   ├── charts/         # Chart builder
│   └── utils/          # Utilities
├── themes/             # CSS theme files
├── templates/          # HTML templates
├── examples/           # Sample files
└── docs/               # Documentation
```

### Run Examples

```bash
# English example
npm run example:simple

# Persian RTL example
npm run example:persian
```

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📞 Support

- 📧 Email: [your-email]
- 🐛 Issues: [GitHub Issues](https://github.com/MoSaleh-AKB/slide-maker/issues)

---

Made with ❤️ by [MoSaleh-AKB](https://github.com/MoSaleh-AKB)
