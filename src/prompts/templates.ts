/**
 * AI prompt templates for PR generation
 */

export type ProviderPromptType = 'claude' | 'cursor' | 'codex';

const CLAUDE_PR_PROMPT = `You are a PR description generator.

Analyze the git diff and commit history between two branches, then generate a PR title and body based on the provided template structure.

Rules:
- PR title should be concise and descriptive (under 72 characters)
- Fill each template section with relevant content from the diff/commits
- Use bullet points for listing changes
- Be specific about what changed and why
- Do NOT include raw diff content in the body

Language settings (check the input for TITLE_LANG and BODY_LANG):
- TITLE_LANG: Language for PR title
- BODY_LANG: Language for PR body content
- Default: title in English, body in Korean

Output ONLY valid JSON matching the required schema. No other text.`;

const CURSOR_PR_PROMPT = `You are a PR description generator. Analyze git changes and generate a PR title and body.

IMPORTANT: You MUST reply ONLY in the EXACT format below. No markdown fences, no explanation, no other text.

===PR===
TITLE: concise PR title here
BODY:
## Summary
bullet points here

## Changes
- change 1
- change 2

## Test Plan
- [ ] test item

RULES:
1. The response MUST start with ===PR=== on its own line
2. TITLE: concise description under 72 characters
3. BODY: fill each section from the template with relevant content
4. Use bullet points for listing changes
5. Be specific about what changed and why
6. Do NOT include raw diff content

Language Settings (check input for TITLE_LANG and BODY_LANG):
- TITLE_LANG: en = English title, ko = Korean title
- BODY_LANG: en = English body, ko = Korean body`;

// JSON Schema for Claude structured output
const PR_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    body: { type: 'string' },
  },
  required: ['title', 'body'],
};

/**
 * Get system prompt for a provider.
 * Cursor and Codex share the delimiter-format prompt; Claude uses the JSON-structured prompt.
 */
export function getSystemPrompt(provider: ProviderPromptType): string {
  return provider === 'claude' ? CLAUDE_PR_PROMPT : CURSOR_PR_PROMPT;
}

/**
 * Get JSON schema for Claude structured output
 */
export function getJsonSchema(): object {
  return PR_SCHEMA;
}

/**
 * Build the user input prompt with context
 */
export function buildInputPrompt(options: {
  titleLang: string;
  bodyLang: string;
  templateContent: string;
  commitLog: string;
  diffStat: string;
  diff: string;
  baseBranch: string;
  headBranch: string;
  changedFiles: string[];
}): string {
  const parts: string[] = [];

  parts.push(`TITLE_LANG: ${options.titleLang}`);
  parts.push(`BODY_LANG: ${options.bodyLang}`);
  parts.push('');
  parts.push(`BASE_BRANCH: ${options.baseBranch}`);
  parts.push(`HEAD_BRANCH: ${options.headBranch}`);
  parts.push('');

  parts.push('=== PR TEMPLATE ===');
  parts.push(options.templateContent);
  parts.push('');

  parts.push('=== CHANGED FILES ===');
  parts.push(options.changedFiles.join('\n'));
  parts.push('');

  parts.push('=== COMMIT LOG ===');
  parts.push(options.commitLog);
  parts.push('');

  parts.push('=== DIFF STAT ===');
  parts.push(options.diffStat);
  parts.push('');

  if (options.diff) {
    parts.push('=== DETAILED DIFF ===');
    parts.push(options.diff);
  }

  return parts.join('\n');
}
