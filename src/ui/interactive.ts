/**
 * Interactive UI for PR creation
 */

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import type { PRContent } from '../types/pr.js';
import type { AIProvider } from '../providers/types.js';
import type { GenprConfig } from '../config/types.js';
import { displayPRPreview } from './display.js';
import { openInEditor } from '../utils/editor.js';
import { createPR, editPR, enableAutoMerge, type CreatePROptions, type MergeMethod } from '../github/pr.js';
import { logger } from '../utils/logger.js';

export type UserAction = 'create' | 'cancel' | 'feedback' | 'edit';

/**
 * Prompt user to select an action
 */
async function promptAction(isExistingPR: boolean): Promise<UserAction> {
  const submitLabel = isExistingPR ? 'Update PR' : 'Create PR';
  const { action } = await inquirer.prompt<{ action: UserAction }>([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { value: 'create', name: `${chalk.yellow('[y]')} ${submitLabel}` },
        { value: 'cancel', name: `${chalk.yellow('[n]')} Cancel` },
        { value: 'feedback', name: `${chalk.yellow('[f]')} Provide feedback` },
        { value: 'edit', name: `${chalk.yellow('[e]')} Edit in editor` },
      ],
    },
  ]);

  return action;
}

/**
 * Prompt user whether to enable auto-merge (default: no)
 */
async function promptAutoMerge(): Promise<boolean> {
  const { autoMerge } = await inquirer.prompt<{ autoMerge: boolean }>([
    {
      type: 'confirm',
      name: 'autoMerge',
      message: 'Enable auto-merge?',
      default: false,
    },
  ]);

  return autoMerge;
}

/**
 * Prompt user to select a merge method (default: rebase)
 */
async function promptMergeMethod(): Promise<MergeMethod> {
  const { method } = await inquirer.prompt<{ method: MergeMethod }>([
    {
      type: 'list',
      name: 'method',
      message: 'Merge method:',
      choices: [
        { value: 'rebase', name: 'rebase (preserve individual commits, linear history)' },
        { value: 'squash', name: 'squash (combine all commits into one)' },
        { value: 'merge',  name: 'merge  (create a merge commit)' },
      ],
      default: 'rebase',
    },
  ]);

  return method;
}

/**
 * Prompt user for feedback
 */
async function promptFeedback(): Promise<string> {
  const { feedback } = await inquirer.prompt<{ feedback: string }>([
    {
      type: 'input',
      name: 'feedback',
      message: 'feedback>',
    },
  ]);

  return feedback;
}

/**
 * Prompt user to select a template
 */
/**
 * Prompt user to select a base branch
 */
export async function promptBaseBranch(
  branches: string[],
  defaultBranch: string
): Promise<string> {
  const { base } = await inquirer.prompt<{ base: string }>([
    {
      type: 'list',
      name: 'base',
      message: 'Select base branch:',
      choices: branches.map((name) => ({ value: name, name })),
      default: defaultBranch,
    },
  ]);

  return base;
}

export async function promptTemplateSelection(
  templateNames: string[]
): Promise<string> {
  const choices = [
    { value: 'auto', name: 'auto (detect from branch name)' },
    ...templateNames.map((name) => ({ value: name, name })),
  ];

  const { template } = await inquirer.prompt<{ template: string }>([
    {
      type: 'list',
      name: 'template',
      message: 'Select a PR template:',
      choices,
    },
  ]);

  return template;
}

/**
 * Regenerate PR content with feedback
 */
async function regenerateWithFeedback(
  provider: AIProvider,
  previousResponse: string,
  feedback: string
): Promise<PRContent> {
  const feedbackInput = `Previous response:
${previousResponse}

User feedback: ${feedback}

Please regenerate the PR title and body based on the feedback.`;

  const response = await provider.generate(feedbackInput);

  // Parse based on provider type
  if (provider.name === 'claude-code') {
    const { parseJsonResponse } = await import('../parser/json.js');
    return parseJsonResponse(response.raw).content;
  } else {
    const { parseDelimiterResponse } = await import('../parser/delimiter.js');
    return parseDelimiterResponse(response.raw).content;
  }
}

/**
 * Main interactive loop
 */
export async function runInteractiveLoop(
  provider: AIProvider,
  initialContent: PRContent,
  initialResponse: string,
  prOptions: {
    baseBranch: string;
    headBranch: string;
    draft: boolean;
    dryRun: boolean;
    existingPrUrl: string | null;
  },
  _config: GenprConfig
): Promise<void> {
  let content = initialContent;
  const lastResponse = initialResponse;
  const isExistingPR = !!prOptions.existingPrUrl;

  while (true) {
    displayPRPreview(content, prOptions.baseBranch, prOptions.headBranch);

    const submitLabel = isExistingPR ? 'Update PR' : 'Create PR';
    console.log(
      `${chalk.yellow('[y]')} ${submitLabel}  ` +
      `${chalk.yellow('[n]')} Cancel  ` +
      `${chalk.yellow('[f]')} Feedback  ` +
      `${chalk.yellow('[e]')} Edit`
    );

    const action = await promptAction(isExistingPR);

    switch (action) {
      case 'create': {
        if (prOptions.dryRun) {
          logger.success('Dry run - PR not created');
          console.log(`\nTitle: ${content.title}`);
          console.log(`\n${content.body}`);
          return;
        }

        let prUrl: string | null = null;

        if (isExistingPR) {
          // Update existing PR
          const spinner = ora('Updating PR...').start();
          try {
            await editPR(prOptions.existingPrUrl!, content.title, content.body);
            spinner.succeed('PR updated successfully');
            logger.success(prOptions.existingPrUrl!);
            prUrl = prOptions.existingPrUrl!;
          } catch (error) {
            spinner.fail('Failed to update PR');
            logger.error(String(error));
          }
        } else {
          // Create new PR
          const spinner = ora('Creating PR...').start();
          try {
            const createOptions: CreatePROptions = {
              title: content.title,
              body: content.body,
              baseBranch: prOptions.baseBranch,
              headBranch: prOptions.headBranch,
              draft: prOptions.draft,
            };

            prUrl = await createPR(createOptions);
            spinner.succeed('PR created successfully');
            logger.success(prUrl);
          } catch (error) {
            spinner.fail('Failed to create PR');
            logger.error(String(error));
          }
        }

        if (prUrl) {
          const shouldAutoMerge = await promptAutoMerge();
          if (shouldAutoMerge) {
            const method = await promptMergeMethod();
            const spinner = ora(`Enabling auto-merge (${method})...`).start();
            try {
              await enableAutoMerge(prUrl, method);
              spinner.succeed(`Auto-merge enabled (${method})`);
            } catch (error) {
              spinner.fail('Failed to enable auto-merge');
              logger.error(String(error));
            }
          }
        }
        return;
      }

      case 'cancel':
        logger.warning('Cancelled');
        return;

      case 'feedback': {
        const feedback = await promptFeedback();

        if (!feedback.trim()) {
          logger.warning('Empty feedback, skipping...');
          continue;
        }

        const spinner = ora('Sending feedback to agent...').start();

        try {
          content = await regenerateWithFeedback(provider, lastResponse, feedback);
          spinner.succeed('Regenerated');
        } catch (error) {
          spinner.fail('Failed to regenerate');
          logger.error(String(error));
        }
        break;
      }

      case 'edit': {
        try {
          const editContent = `${content.title}\n\n${content.body}`;
          const edited = await openInEditor(editContent);

          // Parse edited content: first line is title, rest is body
          const editedLines = edited.split('\n');
          const newTitle = editedLines[0].trim();
          const newBody = editedLines.slice(1).join('\n').trim();

          if (newTitle) {
            content = { title: newTitle, body: newBody };
            logger.success('Content updated from editor');
          } else {
            logger.warning('Empty title, keeping previous content');
          }
        } catch (error) {
          logger.error(`Editor failed: ${error}`);
        }
        break;
      }
    }
  }
}
