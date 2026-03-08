/**
 * Templates command - list available templates
 */

import chalk from 'chalk';
import { listTemplates } from '../templates/loader.js';

export interface TemplatesOptions {
  templateDir?: string;
}

/**
 * Templates command handler
 */
export function templatesCommand(options: TemplatesOptions): void {
  const templates = listTemplates({ templateDir: options.templateDir });

  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  console.log('\nAvailable PR templates:\n');

  for (const template of templates) {
    const sourceLabel = {
      builtin: chalk.dim('(built-in)'),
      project: chalk.cyan('(project)'),
      custom: chalk.magenta('(custom)'),
    }[template.source];

    console.log(`  ${chalk.green(template.name.padEnd(20))} ${sourceLabel}`);

    if (template.sections.length > 0) {
      const sectionNames = template.sections.map((s) => s.heading).join(', ');
      console.log(`    Sections: ${chalk.dim(sectionNames)}`);
    }
  }

  console.log('');
}
