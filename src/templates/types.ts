/**
 * Template type definitions
 */

export interface Template {
  name: string;
  source: 'builtin' | 'project' | 'custom';
  content: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  heading: string;
  description: string;
}
