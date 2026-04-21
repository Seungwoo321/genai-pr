import { describe, it, expect } from 'vitest';
import { parseDelimiterResponse } from '../../src/parser/delimiter.js';
import { parseJsonResponse } from '../../src/parser/json.js';

describe('parseDelimiterResponse', () => {
  it('parses a single-line title and body', () => {
    const input = `===PR===
TITLE: feat(api): add new endpoint
BODY: ## Summary
Added a new endpoint for users.

## Changes
- New route
- Controller update`;

    const result = parseDelimiterResponse(input);

    expect(result.content.title).toBe('feat(api): add new endpoint');
    expect(result.content.body).toContain('## Summary');
    expect(result.content.body).toContain('Added a new endpoint for users.');
    expect(result.content.body).toContain('## Changes');
  });

  it('ignores preamble text before the delimiter', () => {
    const input = `Some thinking output from the agent...
Lots of reasoning here.
===PR===
TITLE: fix(auth): correct token refresh
BODY: Fixed the token refresh logic.`;

    const result = parseDelimiterResponse(input);

    expect(result.content.title).toBe('fix(auth): correct token refresh');
    expect(result.content.body).toBe('Fixed the token refresh logic.');
  });

  it('throws when the delimiter is missing', () => {
    expect(() => parseDelimiterResponse('no delimiter here')).toThrow(/===PR===/);
  });

  it('throws when TITLE is missing', () => {
    const input = `===PR===
BODY: only body, no title`;
    expect(() => parseDelimiterResponse(input)).toThrow(/TITLE/);
  });
});

describe('parseJsonResponse', () => {
  it('parses a valid JSON response', () => {
    const input = JSON.stringify({
      title: 'feat: new feature',
      body: '## Summary\nDid a thing.',
    });

    const result = parseJsonResponse(input);

    expect(result.content.title).toBe('feat: new feature');
    expect(result.content.body).toContain('## Summary');
  });

  it('trims title and body whitespace', () => {
    const input = JSON.stringify({
      title: '  padded title  ',
      body: '\n\nbody with padding\n\n',
    });
    const result = parseJsonResponse(input);
    expect(result.content.title).toBe('padded title');
    expect(result.content.body).toBe('body with padding');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJsonResponse('not json')).toThrow(/Invalid JSON/);
  });

  it('throws when title is missing', () => {
    expect(() => parseJsonResponse('{"body":"hi"}')).toThrow(/title/);
  });
});
