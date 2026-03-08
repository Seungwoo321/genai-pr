/**
 * Cursor CLI provider implementation
 */

import type { AIProvider, ProviderResponse, ProviderStatus, ProviderOptions } from './types.js';
import { execCommand } from '../utils/exec.js';
import { getSystemPrompt } from '../prompts/templates.js';
import { CURSOR_DEFAULT_MODEL } from '../config/defaults.js';

export class CursorCLIProvider implements AIProvider {
  readonly name = 'cursor-cli' as const;
  private timeout: number;
  private model: string;

  constructor(options?: ProviderOptions) {
    this.timeout = options?.timeout ?? 120000;
    this.model = options?.model ?? CURSOR_DEFAULT_MODEL;
  }

  async generate(input: string): Promise<ProviderResponse> {
    const prompt = getSystemPrompt('cursor');
    const fullInput = `${prompt}\n\n---\n\n${input}`;

    const result = await execCommand(
      'agent',
      ['-p', '--trust', '--model', this.model, '--output-format', 'text'],
      {
        input: fullInput,
        timeout: this.timeout,
      }
    );

    if (result.exitCode !== 0) {
      throw new Error(`Cursor CLI failed: ${result.stderr}`);
    }

    return { raw: result.stdout };
  }

  async login(): Promise<void> {
    console.log('Logging in to Cursor Agent...');
    await execCommand('agent', ['login'], { timeout: 120000, interactive: true });
  }

  async status(): Promise<ProviderStatus> {
    try {
      const result = await execCommand('agent', ['--version'], { timeout: 10000 });
      return {
        available: true,
        details: result.stdout.trim() || 'Cursor CLI is available',
      };
    } catch {
      return {
        available: false,
        details: 'Cursor CLI not available. Install it first.',
      };
    }
  }

  getSessionId(): string | undefined {
    return undefined;
  }

  clearSession(): void {
    // No-op for Cursor
  }
}
