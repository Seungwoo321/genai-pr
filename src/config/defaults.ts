/**
 * Default configuration values
 */

import type { GenprConfig } from './types.js';

export const DEFAULT_CONFIG: GenprConfig = {
  maxInputSize: 50000,
  maxDiffSize: 30000,
  timeout: 120000, // 120 seconds
  titleLang: 'en',
  bodyLang: 'ko',
};

export const CURSOR_DEFAULT_MODEL = 'claude-4.5-sonnet';
export const CLAUDE_DEFAULT_MODEL = 'haiku';

// Supported models per provider
export const CURSOR_MODELS = [
  { name: 'claude-4.5-sonnet', description: 'Claude 4.5 Sonnet (default)' },
  { name: 'claude-4-opus', description: 'Claude 4 Opus' },
  { name: 'gpt-4.1', description: 'GPT-4.1' },
  { name: 'gpt-4o', description: 'GPT-4o' },
  { name: 'o3', description: 'OpenAI o3' },
  { name: 'o4-mini', description: 'OpenAI o4-mini' },
  { name: 'gemini-2.5-pro', description: 'Gemini 2.5 Pro' },
  { name: 'gemini-2.5-flash', description: 'Gemini 2.5 Flash' },
];

export const CLAUDE_MODELS = [
  { name: 'haiku', description: 'Claude Haiku (default, fast)' },
  { name: 'sonnet', description: 'Claude Sonnet (balanced)' },
  { name: 'opus', description: 'Claude Opus (powerful)' },
];
