# genai-pr

AI-powered PR description generator using Claude Code, Cursor CLI, or Codex CLI.

[![npm version](https://badge.fury.io/js/genai-pr.svg)](https://www.npmjs.com/package/genai-pr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/Seungwoo321/genai-pr?style=social)](https://github.com/Seungwoo321/genai-pr)

> Read in other languages: [한국어](./README.ko.md)

## Features

- **AI-powered PR descriptions** - Generate PR title and body using Claude Code, Cursor CLI, or Codex CLI
- **Template-based** - Built-in templates (feature, bugfix) + custom project templates
- **Existing PR support** - Regenerate descriptions for existing PRs via `--url`
- **Multi-language support** - Generate titles and body in English or Korean
- **Interactive workflow** - Review, provide feedback, edit in editor, and refine before creating
- **Non-interactive mode** - `--yes` skips the [y] prompt for CI/hook-driven runs; combine with `--auto-merge` to fully automate
- **GitHub CLI integration** - Creates PRs directly via `gh pr create`
- **Auto-merge setup** - Optionally enable auto-merge after PR creation, with a choice of merge method (rebase / squash / merge)
- **Pre-flight checks** - Validate remote branch state (missing remote, unpushed commits, no diff) before calling the AI, so no tokens are wasted on PRs that can't be created

## How It Works

```mermaid
flowchart TD
    A[Start: genai-pr] --> B{PR URL provided?}
    B -->|Yes| C[Fetch PR info via gh CLI]
    B -->|No| PF[Pre-flight checks]
    PF -->|fail| PFX[Abort with guidance]
    PF -->|pass| D[Collect remote Git data]
    C --> E[Get commits, diff, changed files]
    D --> F[git diff origin/base..origin/head + git log]
    E --> G[Select Template]
    F --> G
    G --> H[Build AI Prompt]
    H --> I{Select Provider}
    I -->|Claude Code| J[Claude Code CLI]
    I -->|Cursor CLI| K[Cursor CLI]
    I -->|Codex CLI| K2[Codex CLI]
    J --> L[Parse JSON Response]
    K --> M[Parse Delimiter Response]
    K2 --> M
    L --> N[Display PR Preview]
    M --> N
    N --> O{User Action}
    O -->|y| P[Create/Update PR via gh]
    O -->|n| Q[Cancel]
    O -->|f| R[Get Feedback]
    O -->|e| S[Edit in $EDITOR]
    R --> H
    S --> N
    P --> U{Enable auto-merge?}
    U -->|Yes| V[Select merge method<br/>rebase / squash / merge]
    U -->|No| T[Done]
    V --> W[gh pr merge --auto]
    W --> T[Done]
```

## Prerequisites

You need at least one of these AI CLI tools installed:

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) - Anthropic's official CLI (command: `claude`)
- [Cursor Agent CLI](https://www.cursor.com/) - Cursor's agent CLI (command: `agent`)
- [OpenAI Codex CLI](https://github.com/openai/codex) - OpenAI's Codex CLI (command: `codex`)

Additionally, the [GitHub CLI](https://cli.github.com/) (`gh`) must be installed and authenticated.

## Providers

Each provider can be referenced by its canonical name or short alias:

| Canonical | Short Alias | Underlying CLI |
|-----------|-------------|----------------|
| `claude-code` | `claude` | `claude` |
| `cursor-cli` | `cursor` | `agent` |
| `codex-cli` | `codex` | `codex` |

## Installation

```bash
# Global installation
npm install -g genai-pr

# Or use directly with npx (no installation required)
npx genai-pr claude
```

## Usage

### Generate PR Description

```bash
# Canonical names
genai-pr claude-code
genai-pr cursor-cli
genai-pr codex-cli

# Short aliases (equivalent)
genai-pr claude
genai-pr cursor
genai-pr codex

# One-liner with options
genai-pr claude -t feature -b main

# Specify head and base branches
genai-pr claude --branch feature/AUTH-123 --base develop

# Create as draft PR
genai-pr claude --draft

# Preview without creating PR
genai-pr claude --dry-run

# With specific model
genai-pr claude --model sonnet
genai-pr cursor --model claude-4.5-sonnet
genai-pr codex --model gpt-5.4
```

### Regenerate Existing PR Description

```bash
# Update an existing PR's title and body
genai-pr claude --url https://github.com/owner/repo/pull/15
```

### Authentication

```bash
# Login
genai-pr login claude
genai-pr login cursor
genai-pr login codex

# Check status
genai-pr status claude
genai-pr status cursor
genai-pr status codex
```

### List Supported Models

```bash
genai-pr models claude
genai-pr models cursor
genai-pr models codex
```

### List Available Templates

```bash
# List built-in and project templates
genai-pr templates

# Include custom template directory
genai-pr templates --template-dir ./my-templates
```

### Pre-flight Checks

Before calling the AI, `genai-pr` validates the remote state of your branch so that it doesn't waste AI tokens on a PR that can't actually be created. These checks only run in the local-branch mode (not in `--url` mode) and apply even with `--dry-run`.

| # | Check | Failure message | Exit |
|---|-------|-----------------|------|
| 1 | `origin/<head>` exists | `Remote branch 'origin/<head>' does not exist. Push your branch first: git push -u origin <head>` | `1` |
| 2 | local `<head>` SHA == `origin/<head>` SHA | `Local branch '<head>' is out of sync with 'origin/<head>': N unpushed commit(s) on local / M commit(s) on remote not in local. Push or pull to sync before creating a PR.` | `1` |
| 3 | `origin/<base>..origin/<head>` has commits | `No commits between origin/<base> and origin/<head>` | `0` |

Because the diff and commit log are sourced from the **remote** refs (`origin/<base>..origin/<head>`), the AI always sees the exact content that will end up in the PR.

### Interactive Options

After generating the PR description, you'll see an interactive menu:

| Option | Description |
|--------|-------------|
| `[y]` | Create PR (or Update PR when using `--url`) |
| `[n]` | Cancel |
| `[f]` | Provide feedback to regenerate |
| `[e]` | Edit in external editor (`$EDITOR`) |

### Non-interactive mode (`--yes`)

For CI, pre-commit hooks, or any unattended workflow, `--yes` skips the
`[y]/[n]/[f]/[e]` prompt and submits the generated PR directly. It also skips
the auto-merge prompt (defaults to disabled — pair with `--auto-merge` to
enable it). If PR creation or update fails, the process exits with a non-zero
status so the caller can branch on it.

```bash
# Auto-create PR, no auto-merge
genai-pr claude --yes

# Auto-create + enable auto-merge (rebase, the default method)
genai-pr claude --yes --auto-merge

# Auto-create + squash auto-merge
genai-pr claude --yes --auto-merge squash

# Regenerate an existing PR description non-interactively
genai-pr claude --yes --url https://github.com/owner/repo/pull/15
```

`--yes` is non-interactive by contract: there is no retry, feedback, or editor
loop. If the AI output needs refinement, run without `--yes` interactively
first.

### Auto-merge

After the PR is created (or updated), you'll be asked:

```
? Enable auto-merge? (y/N)
```

If you answer `y`, you'll be prompted to pick a merge method:

| Method | Behavior | When to use |
|--------|----------|-------------|
| `rebase` (default) | Replay each commit onto the base branch. All individual commits are preserved as a linear history. | You want each commit from the feature branch to remain visible on the base branch (e.g. carefully split commits). |
| `squash` | Combine all commits in the PR into a single commit on the base branch. | You don't care about intermediate commits and prefer a single summary commit. |
| `merge` | Create a merge commit that joins the PR branch into the base branch, preserving all commits and the branch structure. | You want to keep both individual commits and the branch history. |

The selected method is executed via `gh pr merge --auto --<method>`. The PR will be merged automatically once all required checks pass.

> Note: This requires **"Allow auto-merge"** to be enabled in the repository settings (`Settings → General → Pull Requests`). If it's disabled, `gh` will report an error and auto-merge won't be configured.

You can also pre-answer both auto-merge prompts up front with
`--auto-merge [method]` (default method: `rebase`). When supplied, the prompts
are skipped in both interactive and `--yes` runs:

```bash
genai-pr claude --auto-merge             # interactive create, auto-merge (rebase) pre-set
genai-pr claude --auto-merge squash      # interactive create, squash auto-merge pre-set
genai-pr claude --yes --auto-merge merge # fully non-interactive create + merge-commit auto-merge
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <name>` | PR template to use | interactive selection |
| `-b, --base <branch>` | Base/target branch | `main` |
| `--branch <branch>` | Head/source branch | current branch |
| `-m, --model <model>` | Model to use | `haiku` (Claude) / `claude-4.5-sonnet` (Cursor) / `gpt-5.4` (Codex) |
| `--lang <lang>` | Set both title and body language (en\|ko) | - |
| `--title-lang <lang>` | Language for PR title | `en` |
| `--body-lang <lang>` | Language for PR body | `ko` |
| `--template-dir <path>` | Custom template directory | - |
| `--draft` | Create as draft PR | `false` |
| `--dry-run` | Preview without creating PR | `false` |
| `--url <url>` | Existing PR URL to regenerate | - |
| `--timeout <seconds>` | AI provider timeout in seconds | `120` |
| `-y, --yes` | Non-interactive: auto-create/update PR, skip prompts, exit non-zero on failure | `false` |
| `--auto-merge [method]` | Enable auto-merge after PR creation (`rebase`\|`squash`\|`merge`) | disabled / `rebase` when bare |

## Built-in Templates

### feature

```markdown
## Summary
## Changes
## Test Plan
```

### bugfix

```markdown
## Summary
## Root Cause
## Fix
## Test Plan
```

## Custom Templates

Templates are loaded with the following priority:

1. `--template-dir <path>` - Custom directory (highest priority)
2. `.github/PR_TEMPLATE/` - Project-level templates
3. Built-in templates (feature, bugfix)

Create a `.md` file in any of these locations. The filename (without extension) becomes the template name.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `maxInputSize` | 50000 | Maximum AI input size in bytes |
| `maxDiffSize` | 30000 | Maximum diff size in bytes |
| `timeout` | 120000 | AI request timeout in ms |

## Requirements

- Node.js >= 18.0.0
- Git repository
- GitHub CLI (`gh`) installed and authenticated
- Claude Code CLI, Cursor CLI, or Codex CLI installed and authenticated

## License

MIT
