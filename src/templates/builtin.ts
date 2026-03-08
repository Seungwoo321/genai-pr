/**
 * Built-in PR templates
 */

export const BUILTIN_TEMPLATES: Record<string, string> = {
  feature: `## Summary
<!-- Brief description of the changes (1-3 lines) -->

## Changes
<!-- List of key changes -->

## Test Plan
<!-- Testing checklist -->
`,

  bugfix: `## Summary
<!-- Bug description and fix summary -->

## Root Cause
<!-- Root cause analysis -->

## Fix
<!-- Fix details -->

## Test Plan
<!-- Verification steps -->
`,
};

export const BUILTIN_TEMPLATE_NAMES = Object.keys(BUILTIN_TEMPLATES);
