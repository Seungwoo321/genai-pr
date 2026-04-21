/**
 * Delimiter-based response parser for Cursor CLI
 * Parses ===PR=== delimited format
 */

import type { PRResult } from '../types/pr.js';

const PR_DELIMITER = '===PR===';

/**
 * Parse delimiter-based response from Cursor CLI
 */
export function parseDelimiterResponse(raw: string): PRResult {
  const delimiterIndex = raw.indexOf(PR_DELIMITER);
  if (delimiterIndex === -1) {
    throw new Error(
      `No ===PR=== delimiter found in response. Raw response:\n${raw.substring(0, 500)}...`
    );
  }

  const content = raw.substring(delimiterIndex + PR_DELIMITER.length).trim();
  const lines = content.split('\n');

  let title = '';
  const bodyLines: string[] = [];
  let inBody = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!inBody && trimmedLine.startsWith('TITLE:')) {
      title = trimmedLine.substring(6).trim();
    } else if (trimmedLine.startsWith('BODY:')) {
      inBody = true;
      // Check if there's content on the same line
      const rest = trimmedLine.substring(5).trim();
      if (rest) {
        bodyLines.push(rest);
      }
    } else if (inBody) {
      bodyLines.push(line);
    }
  }

  if (!title) {
    throw new Error('No TITLE found in response');
  }

  const body = bodyLines.join('\n').trim();

  return {
    content: { title, body },
  };
}
