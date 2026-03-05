# AI Behavior Rules

## Never Assume Missing Context
- Ask questions if uncertain

## Never Hallucinate
- Only use known, verified technology packages
- Never hallucinate libraries or functions

## Always Verify
- Confirm file paths and module names exist before referencing them in code or tests
- Check implemented tasks to avoid duplicates before creating new files or functions
- Always add task ID to implemented files for tracking

## Context7 MCP Server
- Always use the context7 MCP server to reference documentation for libraries and components
- Use when not confident about implementation details or encountering error loops
- Start with 5000 tokens, increase to 20000 if first search didn't give relevant documentation

## Continuation Rules
- When asked to continue, check implemented features and continue from the stopping point
- If localization is used, add localization keys to localization files for any new feature

## Things to Avoid
- Circular dependencies
- Large files (max 500 lines if possible)
- Using the same file for different features/components/services/models/interfaces
- Duplicate functionality across different files
- Circular troubleshooting - ask for clarification if unsure

## Framework-Specific Rules
- **Flutter**: Avoid using `withOpacity` - use best practices (check context7)
- **React**: Avoid Material UI v7 grid problems - use best practices (check context7)
- **React**: Use Vite for React apps
- **React**: Use JSX not JS for React components
