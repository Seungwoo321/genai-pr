/**
 * Validation utilities for PR content
 */

import { logger } from './logger.js';

const MAX_TITLE_LENGTH = 72;

/**
 * Validate PR title length
 */
export function validateTitleLength(title: string): void {
  if (title.length > MAX_TITLE_LENGTH) {
    logger.warning(
      `PR title exceeds ${MAX_TITLE_LENGTH} chars (${title.length} chars)`
    );
  }
}

/**
 * Validate PR content has required fields
 */
export function validatePRContent(title: string, body: string): boolean {
  if (!title.trim()) {
    logger.error('PR title is empty');
    return false;
  }
  if (!body.trim()) {
    logger.error('PR body is empty');
    return false;
  }
  return true;
}
