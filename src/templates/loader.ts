/**
 * Template loader - loads templates from various sources
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename, extname } from 'path';
import type { Template, TemplateSection } from './types.js';
import { BUILTIN_TEMPLATES } from './builtin.js';

/**
 * Parse markdown template into sections
 */
function parseSections(content: string): TemplateSection[] {
  const sections: TemplateSection[] = [];
  const lines = content.split('\n');

  let currentHeading = '';
  let currentDescription = '';

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          description: currentDescription.trim(),
        });
      }
      currentHeading = headingMatch[1];
      currentDescription = '';
    } else if (currentHeading) {
      // Extract comment content as description
      const commentMatch = line.match(/<!--\s*(.+?)\s*-->/);
      if (commentMatch) {
        currentDescription += commentMatch[1] + '\n';
      }
    }
  }

  // Push last section
  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      description: currentDescription.trim(),
    });
  }

  return sections;
}

/**
 * Load a built-in template by name
 */
function loadBuiltinTemplate(name: string): Template | null {
  const content = BUILTIN_TEMPLATES[name];
  if (!content) return null;

  return {
    name,
    source: 'builtin',
    content,
    sections: parseSections(content),
  };
}

/**
 * Load a template from a file path
 */
function loadFileTemplate(filePath: string, source: 'project' | 'custom'): Template | null {
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const name = basename(filePath, extname(filePath));

    return {
      name,
      source,
      content,
      sections: parseSections(content),
    };
  } catch {
    return null;
  }
}

/**
 * Discover project templates from .github/PR_TEMPLATE/ directory
 */
function discoverProjectTemplates(cwd: string = process.cwd()): Template[] {
  const templateDir = join(cwd, '.github', 'PR_TEMPLATE');
  if (!existsSync(templateDir)) return [];

  try {
    const files = readdirSync(templateDir).filter((f) => f.endsWith('.md'));
    const templates: Template[] = [];

    for (const file of files) {
      const template = loadFileTemplate(join(templateDir, file), 'project');
      if (template) {
        templates.push(template);
      }
    }

    return templates;
  } catch {
    return [];
  }
}

/**
 * Discover custom templates from a specified directory
 */
function discoverCustomTemplates(templateDir: string): Template[] {
  if (!existsSync(templateDir)) return [];

  try {
    const files = readdirSync(templateDir).filter((f) => f.endsWith('.md'));
    const templates: Template[] = [];

    for (const file of files) {
      const template = loadFileTemplate(join(templateDir, file), 'custom');
      if (template) {
        templates.push(template);
      }
    }

    return templates;
  } catch {
    return [];
  }
}

/**
 * Load a template by name with priority:
 * 1. Custom template dir (if specified)
 * 2. Project .github/PR_TEMPLATE/
 * 3. Built-in templates
 */
export function loadTemplate(
  name: string,
  options?: { templateDir?: string }
): Template | null {
  // 1. Custom dir
  if (options?.templateDir) {
    const filePath = join(options.templateDir, `${name}.md`);
    const template = loadFileTemplate(filePath, 'custom');
    if (template) return template;
  }

  // 2. Project templates
  const projectPath = join(process.cwd(), '.github', 'PR_TEMPLATE', `${name}.md`);
  const projectTemplate = loadFileTemplate(projectPath, 'project');
  if (projectTemplate) return projectTemplate;

  // 3. Built-in
  return loadBuiltinTemplate(name);
}

/**
 * List all available templates
 */
export function listTemplates(options?: { templateDir?: string }): Template[] {
  const templates: Template[] = [];
  const seen = new Set<string>();

  // 1. Custom dir templates
  if (options?.templateDir) {
    for (const t of discoverCustomTemplates(options.templateDir)) {
      if (!seen.has(t.name)) {
        templates.push(t);
        seen.add(t.name);
      }
    }
  }

  // 2. Project templates
  for (const t of discoverProjectTemplates()) {
    if (!seen.has(t.name)) {
      templates.push(t);
      seen.add(t.name);
    }
  }

  // 3. Built-in templates
  for (const name of Object.keys(BUILTIN_TEMPLATES)) {
    if (!seen.has(name)) {
      const t = loadBuiltinTemplate(name);
      if (t) {
        templates.push(t);
        seen.add(t.name);
      }
    }
  }

  return templates;
}
