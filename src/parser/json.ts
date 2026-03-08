/**
 * JSON response parser for Claude Code CLI
 */

import type { PRResult } from '../types/pr.js';

/**
 * Parse JSON response from Claude CLI into PRResult
 */
export function parseJsonResponse(raw: string): PRResult {
  try {
    const parsed = JSON.parse(raw);

    const title = String(parsed.title || '').trim();
    const body = String(parsed.body || '').trim();

    if (!title) {
      throw new Error('Response does not contain a title');
    }

    return {
      content: { title, body },
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response: ${raw.substring(0, 200)}...`);
    }
    throw error;
  }
}
