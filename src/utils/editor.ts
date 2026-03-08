/**
 * External editor utilities for editing PR content
 */

import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execCommand } from './exec.js';

/**
 * Open content in $EDITOR and return edited result
 */
export async function openInEditor(content: string): Promise<string> {
  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';
  const tmpFile = join(tmpdir(), `genai-pr-${Date.now()}.md`);

  try {
    writeFileSync(tmpFile, content, 'utf-8');

    await execCommand(editor, [tmpFile], {
      interactive: true,
      timeout: 600000, // 10 minutes for manual editing
    });

    return readFileSync(tmpFile, 'utf-8');
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}
