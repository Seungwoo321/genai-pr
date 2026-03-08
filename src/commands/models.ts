/**
 * Models command - list supported models per provider
 */

import type { ProviderType } from '../providers/types.js';
import { isValidProviderType } from '../providers/index.js';
import { CURSOR_MODELS, CLAUDE_MODELS } from '../config/defaults.js';
import { logger } from '../utils/logger.js';

/**
 * Models command handler
 */
export function modelsCommand(provider: string): void {
  if (!isValidProviderType(provider)) {
    logger.error(`Unknown provider: ${provider}`);
    console.log('Available providers: claude-code, cursor-cli');
    process.exit(1);
  }

  const providerType = provider as ProviderType;
  const models = providerType === 'cursor-cli' ? CURSOR_MODELS : CLAUDE_MODELS;
  const defaultModel = providerType === 'cursor-cli' ? 'claude-4.5-sonnet' : 'haiku';

  console.log(`\nSupported models for ${provider}:\n`);

  for (const model of models) {
    const isDefault = model.name === defaultModel;
    const marker = isDefault ? ' *' : '  ';
    console.log(`${marker} ${model.name.padEnd(20)} ${model.description}`);
  }

  console.log('\n* = default model');
  console.log(`\nUsage: genai-pr ${provider} --model <model-name>`);

  if (providerType === 'cursor-cli') {
    console.log('\nFor the latest supported models, run: agent --help');
  } else {
    console.log('\nFor the latest supported models, run: claude --help');
  }
  console.log('');
}
