#!/usr/bin/env node
/**
 * genai-pr CLI - AI-powered PR description generator
 */

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { loginCommand } from './commands/login.js';
import { statusCommand } from './commands/status.js';
import { modelsCommand } from './commands/models.js';
import { templatesCommand } from './commands/templates.js';

const program = new Command();

program
  .name('genai-pr')
  .description('AI-powered PR description generator using Claude Code or Cursor CLI')
  .version('0.1.0');

// Main generation command: genai-pr <provider>
program
  .argument('<provider>', 'AI provider (claude-code or cursor-cli)')
  .option('-t, --template <name>', 'PR template to use (feature, bugfix, or custom)')
  .option('--auto', 'Auto-detect template from branch name and commits')
  .option('-b, --base <branch>', 'Base/target branch (default: main)')
  .option('--branch <branch>', 'Head/source branch (default: current branch)')
  .option('-m, --model <model>', 'Model to use')
  .option('--lang <lang>', 'Set both title and body language (en|ko)')
  .option('--title-lang <lang>', 'Language for PR title (en|ko)', 'en')
  .option('--body-lang <lang>', 'Language for PR body (en|ko)', 'ko')
  .option('--template-dir <path>', 'Custom template directory')
  .option('--draft', 'Create as draft PR')
  .option('--dry-run', 'Preview PR content without creating')
  .option('--url <url>', 'Existing PR URL to regenerate description')
  .action(generateCommand);

// Login command: genai-pr login <provider>
program
  .command('login <provider>')
  .description('Authenticate with the provider')
  .action(loginCommand);

// Status command: genai-pr status <provider>
program
  .command('status <provider>')
  .description('Check authentication status')
  .action(statusCommand);

// Models command: genai-pr models <provider>
program
  .command('models <provider>')
  .description('List supported models for a provider')
  .action(modelsCommand);

// Templates command: genai-pr templates
program
  .command('templates')
  .description('List available PR templates')
  .option('--template-dir <path>', 'Custom template directory')
  .action(templatesCommand);

// Help examples
program.addHelpText(
  'after',
  `
Examples:
  $ genai-pr claude-code                          # Interactive mode
  $ genai-pr cursor-cli                           # Use Cursor CLI
  $ genai-pr claude-code -t feature -b main       # One-liner with options
  $ genai-pr claude-code --branch feature/AUTH-123 --base develop
  $ genai-pr claude-code --draft                  # Create draft PR
  $ genai-pr claude-code --dry-run                # Preview without creating
  $ genai-pr claude-code --url https://github.com/owner/repo/pull/15

  $ genai-pr login claude-code                    # Login to Claude
  $ genai-pr status claude-code                   # Check status
  $ genai-pr models cursor-cli                    # List models
  $ genai-pr templates                            # List templates

Interactive options:
  [y] Create PR
  [n] Cancel
  [f] Provide feedback to regenerate
  [e] Edit in external editor
`
);

program.parse();
