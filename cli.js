#!/usr/bin/env node

/**
 * Slide Maker CLI
 * Universal presentation builder with AI-powered images
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { build } from './src/index.js';
import { listThemes } from './src/themes/loader.js';
import { listTemplates } from './src/templates/registry.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.cyan('╔════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.white('🎯 SLIDE MAKER')} ${chalk.gray('v1.0.0')}                                   ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Create beautiful presentations from Markdown/JSON')}         ${chalk.cyan('║')}
${chalk.cyan('╚════════════════════════════════════════════════════════════╝')}
`;

program
  .name('slide-maker')
  .description('Universal Slide Maker - Create professional presentations')
  .version('1.0.0');

// Build command
program
  .command('build <input>')
  .description('Build a presentation from Markdown or JSON file')
  .option('-o, --output <path>', 'Output file path', 'output/presentation.pptx')
  .option('-t, --theme <name>', 'Theme name', 'corporate-modern')
  .option('-d, --direction <dir>', 'Text direction: left, right, auto', 'auto')
  .option('-f, --format <formats>', 'Output formats (comma-separated): pptx,pdf', 'pptx')
  .option('--no-images', 'Skip image generation')
  .option('--image-source <source>', 'Image source: gemini, unsplash, none', 'gemini')
  .option('-v, --validate', 'Validate output visually')
  .option('--verbose', 'Show detailed logs')
  .action(async (input, options) => {
    console.log(banner);
    
    const spinner = ora('Starting build...').start();
    
    try {
      // Check input file exists
      if (!fs.existsSync(input)) {
        spinner.fail(chalk.red(`Input file not found: ${input}`));
        process.exit(1);
      }
      
      // Create output directory if needed
      const outputDir = path.dirname(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      spinner.text = 'Parsing input file...';
      
      const result = await build({
        input,
        output: options.output,
        theme: options.theme,
        direction: options.direction,
        formats: options.format.split(','),
        images: options.images ? { source: options.imageSource } : { source: 'none' },
        validate: options.validate,
        verbose: options.verbose,
        onProgress: (progress) => {
          spinner.text = progress.status;
        }
      });
      
      spinner.succeed(chalk.green('Build complete!'));
      
      console.log('\n' + chalk.bold('📊 Summary:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('Slides:')}     ${result.slideCount}`);
      console.log(`  ${chalk.cyan('Theme:')}      ${result.theme}`);
      console.log(`  ${chalk.cyan('Direction:')} ${result.direction}`);
      console.log(`  ${chalk.cyan('Output:')}    ${result.outputPath}`);
      if (result.pdfPath) {
        console.log(`  ${chalk.cyan('PDF:')}       ${result.pdfPath}`);
      }
      console.log(chalk.gray('─'.repeat(40)));
      console.log(chalk.green('\n✨ Done!'));
      
    } catch (error) {
      spinner.fail(chalk.red('Build failed!'));
      console.error(chalk.red('\nError:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// List themes command
program
  .command('themes')
  .description('List available themes')
  .action(() => {
    console.log(banner);
    console.log(chalk.bold('\n🎨 Available Themes:\n'));
    
    const themes = listThemes();
    themes.forEach(theme => {
      console.log(`  ${chalk.cyan('•')} ${chalk.bold(theme.name)}`);
      console.log(`    ${chalk.gray(theme.description)}`);
      console.log(`    ${chalk.gray('Best for:')} ${theme.bestFor}`);
      console.log();
    });
  });

// List templates command
program
  .command('templates')
  .description('List available slide templates')
  .action(() => {
    console.log(banner);
    console.log(chalk.bold('\n📄 Available Templates:\n'));
    
    const templates = listTemplates();
    templates.forEach(template => {
      console.log(`  ${chalk.cyan('•')} ${chalk.bold(template.name)}`);
      console.log(`    ${chalk.gray(template.description)}`);
      console.log();
    });
  });

// Init command - create a sample presentation
program
  .command('init [name]')
  .description('Create a sample presentation file')
  .option('-f, --format <format>', 'Format: md or json', 'md')
  .action((name = 'presentation', options) => {
    console.log(banner);
    
    const filename = `${name}.${options.format}`;
    
    let content;
    if (options.format === 'md') {
      content = `---
title: My Presentation
theme: corporate-modern
author: Your Name
date: ${new Date().toISOString().split('T')[0]}
direction: auto
---

# Welcome
subtitle: An Amazing Presentation

---

## Section: Introduction

---

### About This Topic

- First key point goes here
- Second important insight
- Third compelling argument

![hero](gemini: professional business presentation, modern office)

---

### Key Statistics

[chart:bar]
labels: Q1, Q2, Q3, Q4
data: 25, 45, 65, 85
title: Quarterly Growth
[/chart]

---

## Thank You

cta: Let's Connect!
contact: your@email.com
`;
    } else {
      content = JSON.stringify({
        metadata: {
          title: 'My Presentation',
          theme: 'corporate-modern',
          author: 'Your Name',
          date: new Date().toISOString().split('T')[0],
          direction: 'auto'
        },
        slides: [
          {
            template: 'title',
            data: {
              title: 'Welcome',
              subtitle: 'An Amazing Presentation',
              author: 'Your Name',
              date: new Date().toISOString().split('T')[0]
            }
          },
          {
            template: 'section-divider',
            data: {
              section_number: '01',
              section_title: 'Introduction'
            }
          },
          {
            template: 'content-image-right',
            data: {
              title: 'About This Topic',
              points: [
                'First key point goes here',
                'Second important insight',
                'Third compelling argument'
              ],
              image: {
                source: 'gemini',
                prompt: 'professional business presentation, modern office'
              }
            }
          },
          {
            template: 'closing',
            data: {
              cta_text: "Let's Connect!",
              contact_info: 'your@email.com',
              website: 'www.example.com'
            }
          }
        ]
      }, null, 2);
    }
    
    fs.writeFileSync(filename, content);
    console.log(chalk.green(`✨ Created ${filename}`));
    console.log(chalk.gray(`\nRun: slide-maker build ${filename}`));
  });

program.parse();
