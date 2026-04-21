import { describe, it, expect } from 'vitest';
import {
  createProvider,
  isValidProviderType,
  normalizeProviderType,
  ClaudeCodeProvider,
  CursorCLIProvider,
  CodexCLIProvider,
} from '../../src/providers/index.js';
import { PROVIDER_ALIASES, PROVIDER_CHOICES } from '../../src/providers/types.js';

describe('normalizeProviderType', () => {
  it('maps canonical names to themselves', () => {
    expect(normalizeProviderType('claude-code')).toBe('claude-code');
    expect(normalizeProviderType('cursor-cli')).toBe('cursor-cli');
    expect(normalizeProviderType('codex-cli')).toBe('codex-cli');
  });

  it('maps short aliases to canonical names', () => {
    expect(normalizeProviderType('claude')).toBe('claude-code');
    expect(normalizeProviderType('cursor')).toBe('cursor-cli');
    expect(normalizeProviderType('codex')).toBe('codex-cli');
  });

  it('returns null for unknown providers', () => {
    expect(normalizeProviderType('gpt')).toBeNull();
    expect(normalizeProviderType('')).toBeNull();
    expect(normalizeProviderType('Claude')).toBeNull();
  });
});

describe('isValidProviderType', () => {
  it('accepts only canonical provider types', () => {
    expect(isValidProviderType('claude-code')).toBe(true);
    expect(isValidProviderType('cursor-cli')).toBe(true);
    expect(isValidProviderType('codex-cli')).toBe(true);
  });

  it('rejects short aliases', () => {
    expect(isValidProviderType('claude')).toBe(false);
    expect(isValidProviderType('cursor')).toBe(false);
    expect(isValidProviderType('codex')).toBe(false);
  });

  it('rejects unknown inputs', () => {
    expect(isValidProviderType('gpt')).toBe(false);
    expect(isValidProviderType('')).toBe(false);
  });
});

describe('PROVIDER_ALIASES', () => {
  it('covers all canonical and alias forms', () => {
    expect(Object.keys(PROVIDER_ALIASES).sort()).toEqual(
      ['claude', 'claude-code', 'codex', 'codex-cli', 'cursor', 'cursor-cli']
    );
  });
});

describe('PROVIDER_CHOICES', () => {
  it('lists all providers with their aliases', () => {
    expect(PROVIDER_CHOICES).toContain('claude-code');
    expect(PROVIDER_CHOICES).toContain('claude');
    expect(PROVIDER_CHOICES).toContain('cursor-cli');
    expect(PROVIDER_CHOICES).toContain('cursor');
    expect(PROVIDER_CHOICES).toContain('codex-cli');
    expect(PROVIDER_CHOICES).toContain('codex');
  });
});

describe('createProvider', () => {
  it('creates a ClaudeCodeProvider for claude-code', () => {
    const provider = createProvider('claude-code');
    expect(provider).toBeInstanceOf(ClaudeCodeProvider);
    expect(provider.name).toBe('claude-code');
  });

  it('creates a CursorCLIProvider for cursor-cli', () => {
    const provider = createProvider('cursor-cli');
    expect(provider).toBeInstanceOf(CursorCLIProvider);
    expect(provider.name).toBe('cursor-cli');
  });

  it('creates a CodexCLIProvider for codex-cli', () => {
    const provider = createProvider('codex-cli');
    expect(provider).toBeInstanceOf(CodexCLIProvider);
    expect(provider.name).toBe('codex-cli');
  });
});
