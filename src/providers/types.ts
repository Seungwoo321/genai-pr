/**
 * Provider type definitions
 */

export type ProviderType = 'claude-code' | 'cursor-cli' | 'codex-cli';
export type ProviderAlias = 'claude' | 'cursor' | 'codex';

/**
 * Canonical provider names and their short aliases.
 * Each alias maps to exactly one canonical ProviderType.
 */
export const PROVIDER_ALIASES: Record<string, ProviderType> = {
  'claude-code': 'claude-code',
  'claude': 'claude-code',
  'cursor-cli': 'cursor-cli',
  'cursor': 'cursor-cli',
  'codex-cli': 'codex-cli',
  'codex': 'codex-cli',
};

export const PROVIDER_CHOICES = 'claude-code (alias: claude), cursor-cli (alias: cursor), codex-cli (alias: codex)';

export interface ProviderResponse {
  raw: string;
  sessionId?: string;
}

export interface ProviderStatus {
  available: boolean;
  version?: string;
  details: string;
}

export interface ProviderOptions {
  model?: string;
  timeout?: number;
}

/**
 * AI Provider interface for PR generation
 */
export interface AIProvider {
  readonly name: ProviderType;

  /**
   * Generate PR content from input
   */
  generate(input: string): Promise<ProviderResponse>;

  /**
   * Authenticate with the provider
   */
  login(): Promise<void>;

  /**
   * Check provider status and authentication
   */
  status(): Promise<ProviderStatus>;

  /**
   * Get current session ID (for resume capability)
   */
  getSessionId(): string | undefined;

  /**
   * Clear session state
   */
  clearSession(): void;
}
