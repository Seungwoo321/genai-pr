import { describe, it, expect } from 'vitest';
import { loadTemplate, listTemplates } from '../../src/templates/loader.js';
import { BUILTIN_TEMPLATE_NAMES } from '../../src/templates/builtin.js';

describe('loadTemplate', () => {
  it('loads the built-in feature template', () => {
    const t = loadTemplate('feature');
    expect(t).not.toBeNull();
    expect(t!.name).toBe('feature');
    expect(t!.source).toBe('builtin');
    expect(t!.content).toContain('## Summary');
    expect(t!.content).toContain('## Changes');
    expect(t!.content).toContain('## Test Plan');
  });

  it('loads the built-in bugfix template', () => {
    const t = loadTemplate('bugfix');
    expect(t).not.toBeNull();
    expect(t!.content).toContain('## Root Cause');
    expect(t!.content).toContain('## Fix');
  });

  it('parses markdown sections from built-in templates', () => {
    const t = loadTemplate('feature');
    const headings = t!.sections.map((s) => s.heading);
    expect(headings).toContain('Summary');
    expect(headings).toContain('Changes');
    expect(headings).toContain('Test Plan');
  });

  it('returns null for an unknown template', () => {
    expect(loadTemplate('does-not-exist')).toBeNull();
  });
});

describe('listTemplates', () => {
  it('includes all built-in templates', () => {
    const names = listTemplates().map((t) => t.name);
    for (const builtin of BUILTIN_TEMPLATE_NAMES) {
      expect(names).toContain(builtin);
    }
  });
});
