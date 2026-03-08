/**
 * Provider type definitions
 */

export type ProviderType = 'claude-code' | 'cursor-cli';

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
