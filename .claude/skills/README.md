# Claude Skills for Afreef Project

This directory contains Claude skills that extend capabilities for building and maintaining the Afreef agentic RAG system.

## Available Skills

### For Subagent Developers

#### 1. **skill-creator** ⭐ NEW
- **Purpose**: Guide for creating effective Claude skills
- **Use When**: Building new skills or improving existing ones
- **Key Features**:
  - Skill anatomy and structure
  - Progressive disclosure design
  - Best practices for metadata, scripts, references, and assets
  - Step-by-step creation process

#### 2. **mcp-builder** ⭐ NEW
- **Purpose**: Build high-quality MCP (Model Context Protocol) servers
- **Use When**: Creating MCP integrations for tools, databases, or external services
- **Key Features**:
  - Agent-centric design principles
  - Workflow-focused tool design
  - Context optimization strategies
  - Python and TypeScript implementation guides
  - Evaluation-driven development

#### 3. **agent-orchestration** ⭐ NEW
- **Purpose**: Design and implement multi-agent systems
- **Use When**: Building agentic workflows with multiple specialized agents
- **Key Features**:
  - Agent design patterns (sequential, parallel, conditional)
  - Communication patterns (context passing, event-driven)
  - State management and conversation tracking
  - Error handling and circuit breakers
  - Monitoring and distributed tracing

#### 4. **prompt-engineering** ⭐ NEW
- **Purpose**: Design effective prompts for LLMs in agentic systems
- **Use When**: Building LLM-powered agents or improving agent responses
- **Key Features**:
  - System prompt templates
  - Few-shot learning examples
  - Chain-of-thought reasoning
  - Tool usage patterns
  - Prompt optimization and versioning

#### 5. **webapp-testing**
- **Purpose**: Test local web applications using Playwright
- **Use When**: Verifying frontend functionality, debugging UI behavior
- **Key Features**:
  - Reconnaissance-then-action pattern
  - Static vs dynamic webapp strategies
  - Playwright script templates
  - Common testing patterns
  - Screenshot and DOM inspection

#### 6. **artifacts-builder**
- **Purpose**: Build complex React artifacts for claude.ai
- **Use When**: Creating elaborate frontend applications with React, Tailwind, shadcn/ui
- **Key Features**:
  - React + TypeScript + Vite setup
  - Tailwind CSS and shadcn/ui components
  - Single HTML file bundling
  - Modern frontend best practices

### For Application Development

#### 7. **agentic-rag-development**
- **Purpose**: Build and maintain agentic RAG systems
- **Use When**: Developing multi-agent orchestration, vector search, knowledge graphs
- **Key Features**:
  - Multi-agent orchestration patterns
  - Vector search with pgvector
  - Knowledge graph integration
  - Document processing pipelines
  - Performance optimization

#### 8. **api-debugging**
- **Purpose**: Debug FastAPI applications
- **Use When**: Tracing async issues, inspecting database queries, resolving API errors
- **Key Features**:
  - Common error patterns and solutions
  - Database connection debugging
  - Async/await troubleshooting
  - Performance profiling
  - Request tracing

#### 9. **dashboard-creation**
- **Purpose**: Design and implement interactive analytics dashboards
- **Use When**: Building conversational dashboard builders, selecting visualizations
- **Key Features**:
  - Requirements gathering workflows
  - Visualization selection logic
  - Chart.js implementation
  - Data pipeline design
  - Conversational agent patterns

## Skill Organization

Each skill follows this structure:

```
skill-name/
├── SKILL.md              # Main skill instructions with YAML frontmatter
├── scripts/              # Executable helper scripts (optional)
├── references/           # Documentation loaded as needed (optional)
└── assets/               # Templates and output files (optional)
```

## How Skills Work

Skills use a three-level progressive disclosure system:

1. **Metadata** (~100 words) - Always loaded, helps Claude decide when to use the skill
2. **SKILL.md body** (<5k words) - Loaded when skill is triggered
3. **Bundled resources** - Loaded only when Claude needs them

## Adding New Skills

To create a new skill:

1. Use the **skill-creator** skill for guidance
2. Create a new directory under `.claude/skills/`
3. Add a `SKILL.md` file with proper YAML frontmatter
4. Optionally add `scripts/`, `references/`, or `assets/` directories
5. Update this README

## Skill Sources

These skills are inspired by and adapted from:
- [Anthropic's Official Skills Repository](https://github.com/anthropics/skills)
- [Awesome Claude Skills](https://github.com/Mohamed-Elkahef/awesome-claude-skills)
- Project-specific requirements and workflows

## Best Practices

- Keep SKILL.md under 5k words
- Use third-person in descriptions: "This skill should be used when..."
- Include concrete examples and code snippets
- Add "When to Use This Skill" section
- Organize bundled resources by type
- Avoid duplication between SKILL.md and references
