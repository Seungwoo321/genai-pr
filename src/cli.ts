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
  .description('AI-powered PR description generator using Claude Code, Cursor CLI, or Codex CLI')
  .version('0.1.0');

// Main generation command: genai-pr <provider>
program
  .argument('<provider>', 'AI provider: claude-code|claude, cursor-cli|cursor, codex-cli|codex')
  .option('-t, --template <name>', 'PR template to use (feature, bugfix, or custom)')
  .option('--auto', 'Auto-detect template from branch name and commits')
  .option('-b, --base <branch>', 'Base/target branch (default: main)')
  .option('--branch <branch>', 'Head/source branch (default: current branch)')
  .option('-m, --model <model>', 'Model to use (varies by provider; see: genai-pr models <provider>)')
  .option('--lang <lang>', 'Set both title and body language (en|ko)')
  .option('--title-lang <lang>', 'Language for PR title (en|ko)', 'en')
  .option('--body-lang <lang>', 'Language for PR body (en|ko)', 'ko')
  .option('--template-dir <path>', 'Custom template directory')
  .option('--draft', 'Create as draft PR')
  .option('--dry-run', 'Preview PR content without creating')
  .option('--url <url>', 'Existing PR URL to regenerate description')
  .option('--timeout <seconds>', 'AI provider timeout in seconds (default: 120)')
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
Providers (canonical | short alias):
  claude-code | claude     Anthropic Claude Code CLI
  cursor-cli  | cursor     Cursor Agent CLI
  codex-cli   | codex      OpenAI Codex CLI

Examples:
  $ genai-pr claude                               # Interactive mode (short alias)
  $ genai-pr cursor                               # Use Cursor CLI
  $ genai-pr codex                                # Use Codex CLI
  $ genai-pr claude -t feature -b main            # One-liner with options
  $ genai-pr claude --branch feature/AUTH-123 --base develop
  $ genai-pr claude --draft                       # Create draft PR
  $ genai-pr claude --dry-run                     # Preview without creating
  $ genai-pr claude --url https://github.com/owner/repo/pull/15

  $ genai-pr login codex                          # Login to Codex
  $ genai-pr status claude                        # Check status
  $ genai-pr models cursor                        # List models
  $ genai-pr templates                            # List templates

Interactive options:
  [y] Create PR
  [n] Cancel
  [f] Provide feedback to regenerate
  [e] Edit in external editor
`
);

program.parse();
