/**
 * Configuration type definitions
 */

import type { Language } from '../types/pr.js';

export interface GenprConfig {
  maxInputSize: number;
  maxDiffSize: number;
  timeout: number;
  titleLang: Language;
  bodyLang: Language;
}
