# genai-pr

AI-powered PR description generator using Claude Code or Cursor CLI.

[![npm version](https://badge.fury.io/js/genai-pr.svg)](https://www.npmjs.com/package/genai-pr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/Seungwoo321/genai-pr?style=social)](https://github.com/Seungwoo321/genai-pr)

## Features

- **AI-powered PR descriptions** - Generate PR title and body using Claude Code or Cursor CLI
- **Template-based** - Built-in templates (feature, bugfix) + custom project templates
- **Existing PR support** - Regenerate descriptions for existing PRs via `--url`
- **Multi-language support** - Generate titles and body in English or Korean
- **Interactive workflow** - Review, provide feedback, edit in editor, and refine before creating
- **GitHub CLI integration** - Creates PRs directly via `gh pr create`

## How It Works

```mermaid
flowchart TD
    A[Start: genai-pr] --> B{PR URL provided?}
    B -->|Yes| C[Fetch PR info via gh CLI]
    B -->|No| D[Collect local Git data]
    C --> E[Get commits, diff, changed files]
    D --> F[git diff base..head + git log]
    E --> G[Select Template]
    F --> G
    G --> H[Build AI Prompt]
    H --> I{Select Provider}
    I -->|Claude Code| J[Claude Code CLI]
    I -->|Cursor CLI| K[Cursor CLI]
    J --> L[Parse JSON Response]
    K --> M[Parse Delimiter Response]
    L --> N[Display PR Preview]
    M --> N
    N --> O{User Action}
    O -->|y| P[Create/Update PR via gh]
    O -->|n| Q[Cancel]
    O -->|f| R[Get Feedback]
    O -->|e| S[Edit in $EDITOR]
    R --> H
    S --> N
    P --> T[Done]
```

## Prerequisites

You need at least one of these AI CLI tools installed:

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) - Anthropic's official CLI
- [Cursor Agent CLI](https://www.cursor.com/) - Cursor's agent CLI (command: `agent`)

Additionally, the [GitHub CLI](https://cli.github.com/) (`gh`) must be installed and authenticated.

## Installation

```bash
# Global installation
npm install -g genai-pr

# Or use directly with npx (no installation required)
npx genai-pr claude-code
```

## Usage

### Generate PR Description

```bash
# Using Claude Code (interactive template selection)
genai-pr claude-code

# Using Cursor CLI
genai-pr cursor-cli

# One-liner with options
genai-pr claude-code -t feature -b main

# Specify head and base branches
genai-pr claude-code --branch feature/AUTH-123 --base develop

# Create as draft PR
genai-pr claude-code --draft

# Preview without creating PR
genai-pr claude-code --dry-run

# With specific model
genai-pr claude-code --model sonnet
genai-pr cursor-cli --model claude-4.5-sonnet
```

### Regenerate Existing PR Description

```bash
# Update an existing PR's title and body
genai-pr claude-code --url https://github.com/owner/repo/pull/15
```

### Authentication

```bash
# Login to Cursor Agent
genai-pr login cursor-cli

# Setup Claude token
genai-pr login claude-code

# Check status
genai-pr status claude-code
genai-pr status cursor-cli
```

### List Supported Models

```bash
genai-pr models claude-code
genai-pr models cursor-cli
```

### List Available Templates

```bash
# List built-in and project templates
genai-pr templates

# Include custom template directory
genai-pr templates --template-dir ./my-templates
```

### Interactive Options

After generating the PR description, you'll see an interactive menu:

| Option | Description |
|--------|-------------|
| `[y]` | Create PR (or Update PR when using `--url`) |
| `[n]` | Cancel |
| `[f]` | Provide feedback to regenerate |
| `[e]` | Edit in external editor (`$EDITOR`) |

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <name>` | PR template to use | interactive selection |
| `-b, --base <branch>` | Base/target branch | `main` |
| `--branch <branch>` | Head/source branch | current branch |
| `-m, --model <model>` | Model to use | provider default |
| `--lang <lang>` | Set both title and body language (en\|ko) | - |
| `--title-lang <lang>` | Language for PR title | `en` |
| `--body-lang <lang>` | Language for PR body | `ko` |
| `--template-dir <path>` | Custom template directory | - |
| `--draft` | Create as draft PR | `false` |
| `--dry-run` | Preview without creating PR | `false` |
| `--url <url>` | Existing PR URL to regenerate | - |

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
- Claude Code CLI or Cursor CLI installed and authenticated

## License

MIT
