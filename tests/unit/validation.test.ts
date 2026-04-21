import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateTitleLength, validatePRContent } from '../../src/utils/validation.js';
import { logger } from '../../src/utils/logger.js';

describe('validateTitleLength', () => {
  let warningSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warningSpy = vi.spyOn(logger, 'warning').mockImplementation(() => {});
  });

  afterEach(() => {
    warningSpy.mockRestore();
  });

  it('does not warn for titles of 72 chars or fewer', () => {
    validateTitleLength('a'.repeat(72));
    expect(warningSpy).not.toHaveBeenCalled();
  });

  it('warns for titles longer than 72 chars', () => {
    validateTitleLength('a'.repeat(73));
    expect(warningSpy).toHaveBeenCalledOnce();
  });
});

describe('validatePRContent', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('returns true for non-empty title and body', () => {
    expect(validatePRContent('title', 'body')).toBe(true);
  });

  it('returns false when title is empty', () => {
    expect(validatePRContent('', 'body')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns false when body is empty', () => {
    expect(validatePRContent('title', '   ')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });
});
