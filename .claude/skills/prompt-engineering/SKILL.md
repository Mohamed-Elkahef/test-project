---
name: prompt-engineering
description: Design effective prompts for LLMs in agentic systems, including system prompts, few-shot examples, chain-of-thought reasoning, and tool usage patterns. Use when building LLM-powered agents or improving agent responses.
---

# Prompt Engineering for Agentic Systems

Guide for designing effective prompts that enable LLMs to perform complex tasks reliably in multi-agent systems.

## Core Principles

### Clarity and Specificity

```python
# ❌ Vague prompt
"Analyze this data"

# ✅ Clear and specific
"""Analyze the employee performance data and:
1. Calculate average performance rating by department
2. Identify top 10% performers
3. Flag any departments with average rating below 3.0
4. Format results as a JSON object with keys: department_stats, top_performers, underperforming_depts"""
```

### Structured Output

Request specific formats:

```python
system_prompt = """You are a data analysis agent. Always return results in this JSON format:
{
  "analysis": "Brief summary of findings",
  "metrics": {
    "key1": value1,
    "key2": value2
  },
  "recommendations": ["rec1", "rec2"],
  "confidence": 0.0-1.0
}"""
```

## Prompt Patterns for Agents

### System Prompt Template

```python
AGENT_SYSTEM_PROMPT = """You are {agent_name}, a specialized agent responsible for {responsibility}.

## Your Role
{detailed_role_description}

## Available Tools
{tool_descriptions}

## Input Format
You will receive: {input_description}

## Output Format
You must return: {output_description}

## Guidelines
1. {guideline_1}
2. {guideline_2}
3. {guideline_3}

## Error Handling
If you encounter {error_condition}, {error_action}.

## Examples
{few_shot_examples}
"""
```

### Few-Shot Examples

Provide concrete examples:

```python
FEW_SHOT_EXAMPLES = """
Example 1:
Input: "Show me sales by region"
Thought: User wants aggregated sales data grouped by geographic region
Action: search_metadata(keywords=["sales", "region", "geography"])
Result: Found tables: sales_transactions (region_id), regions (name)
SQL: SELECT r.name, SUM(s.amount) FROM sales_transactions s JOIN regions r ON s.region_id = r.id GROUP BY r.name

Example 2:
Input: "Top 5 customers"
Thought: Need customer revenue data, sorted descending, limited to 5
Action: search_metadata(keywords=["customer", "revenue", "sales"])
Result: Found tables: customers (name), orders (customer_id, total)
SQL: SELECT c.name, SUM(o.total) as revenue FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name ORDER BY revenue DESC LIMIT 5
"""
```

### Chain-of-Thought Prompting

Guide reasoning process:

```python
COT_PROMPT = """To solve this task, follow these steps:

Step 1: Understand the Query
- What is the user asking for?
- What entities are mentioned?
- What is the intent (retrieve, analyze, create)?

Step 2: Identify Required Data
- What tables/data sources are needed?
- What relationships exist between entities?
- What filters or conditions apply?

Step 3: Plan the Solution
- What operations are needed?
- In what order should they execute?
- What tools should be used?

Step 4: Execute and Validate
- Execute the plan
- Check results for completeness
- Verify accuracy

Now, apply these steps to: {user_query}
"""
```

### Tool Usage Prompting

Explicit tool instructions:

```python
TOOL_USAGE_PROMPT = """You have access to these tools:

1. search_metadata(keywords: list[str]) -> list[Table]
   - Use to find relevant database tables
   - Always call this FIRST before generating SQL
   - Example: search_metadata(keywords=["employee", "salary"])

2. execute_query(sql: str) -> list[dict]
   - Use to run SQL queries
   - Only call after finding tables with search_metadata
   - Always validate SQL syntax first

3. format_results(data: list[dict], format: str) -> str
   - Use to format query results
   - Supported formats: "table", "json", "markdown"
   - Call this last to present results

IMPORTANT: You MUST call search_metadata before execute_query.
NEVER generate SQL without first searching for table schemas.

Process:
1. search_metadata → find tables
2. execute_query → get data
3. format_results → present to user
"""
```

## Prompt Engineering Techniques

### Role-Based Prompting

Define clear agent persona:

```python
QUERY_UNDERSTANDING_AGENT = """You are a Query Understanding Specialist.

Your expertise:
- Natural language processing
- Entity extraction
- Intent classification
- Context retrieval

Your task:
Parse user queries and extract:
1. Entities (people, places, metrics, dates)
2. Intent (retrieve, analyze, create, update)
3. Constraints (filters, limits, ordering)
4. Context requirements (what background info is needed)

Be thorough but concise. Focus on accuracy over speed.
"""
```

### Constraint-Based Prompting

Set clear boundaries:

```python
SQL_GENERATION_AGENT = """You are a SQL Query Generator with these constraints:

ALLOWED:
✅ SELECT statements
✅ JOIN operations (INNER, LEFT, RIGHT)
✅ WHERE clauses with AND/OR
✅ GROUP BY and aggregations (SUM, AVG, COUNT, MAX, MIN)
✅ ORDER BY and LIMIT

FORBIDDEN:
❌ INSERT, UPDATE, DELETE, DROP statements
❌ Subqueries (use JOINs instead)
❌ UNION operations
❌ Temporary tables or CTEs
❌ Database modifications

REQUIREMENTS:
- Always use table aliases
- Always qualify column names with table aliases
- Always include LIMIT clause (max 1000 rows)
- Always use parameterized queries for user input
- Never use SELECT *

If a query requires forbidden operations, explain why and suggest alternatives.
"""
```

### Iterative Refinement Prompting

Build on previous attempts:

```python
REFINEMENT_PROMPT = """Previous attempt failed with error: {error_message}

Original query: {original_query}
Generated SQL: {failed_sql}

Analyze the error and:
1. Identify the root cause
2. Determine what went wrong
3. Generate a corrected version
4. Explain the fix

Common issues:
- Missing table aliases
- Incorrect JOIN conditions
- Ambiguous column references
- Type mismatches
- Missing GROUP BY columns

Now, fix the query:
"""
```

### Confidence Scoring

Request self-assessment:

```python
CONFIDENCE_PROMPT = """After completing your task, assess your confidence:

Confidence Score (0.0-1.0):
- 1.0: Completely certain, all data found, perfect match
- 0.8-0.9: High confidence, minor ambiguities resolved
- 0.6-0.7: Moderate confidence, some assumptions made
- 0.4-0.5: Low confidence, significant uncertainties
- 0.0-0.3: Very uncertain, missing critical information

Provide:
{
  "result": <your result>,
  "confidence": <0.0-1.0>,
  "reasoning": "Why this confidence level",
  "uncertainties": ["list", "of", "uncertainties"],
  "assumptions": ["list", "of", "assumptions"]
}
"""
```

## Agent-Specific Prompts

### Context Retrieval Agent

```python
CONTEXT_AGENT_PROMPT = """You are a Context Retrieval Agent.

Task: Given a user query, retrieve ALL relevant context needed to answer it.

Process:
1. Extract key terms and entities from query
2. Search metadata knowledge base for matching tables/columns
3. Search glossary for business term definitions
4. Retrieve table relationships and foreign keys
5. Compile comprehensive context

Output Format:
{
  "entities": ["entity1", "entity2"],
  "relevant_tables": [
    {"table": "name", "columns": [...], "relevance": 0.95}
  ],
  "glossary_terms": [
    {"term": "ARR", "definition": "Annual Recurring Revenue"}
  ],
  "relationships": [
    {"from": "table1", "to": "table2", "via": "foreign_key"}
  ],
  "confidence": 0.85
}

CRITICAL: You MUST use the search_metadata and search_glossary tools.
Do NOT generate context from your training data.
"""
```

### SQL Generation Agent

```python
SQL_AGENT_PROMPT = """You are a SQL Query Generation Agent.

Input: User query + Retrieved context (tables, columns, relationships)

Task: Generate a valid, optimized SQL query.

Requirements:
1. Use ONLY tables/columns from provided context
2. Follow PostgreSQL syntax
3. Use table aliases (short, meaningful)
4. Include appropriate JOINs based on relationships
5. Add WHERE clauses for filters
6. Use GROUP BY for aggregations
7. Add ORDER BY and LIMIT

Quality Checks:
- All columns qualified with table aliases
- JOIN conditions use foreign keys from context
- Aggregations have proper GROUP BY
- No syntax errors
- Query is optimized (indexes considered)

Output Format:
{
  "sql": "SELECT ...",
  "explanation": "What this query does",
  "tables_used": ["table1", "table2"],
  "confidence": 0.9
}
"""
```

### Report Generation Agent

```python
REPORT_AGENT_PROMPT = """You are a Report Generation Agent.

Input: Query results + User query + Context

Task: Generate a comprehensive, well-formatted report.

Report Structure:
1. **Executive Summary** - Key findings in 2-3 sentences
2. **Detailed Analysis** - Breakdown of results
3. **Visualizations** - Suggested charts/graphs
4. **Insights** - Patterns, trends, anomalies
5. **Recommendations** - Actionable next steps

Formatting:
- Use Markdown for structure
- Include tables for data
- Add bullet points for lists
- Highlight important numbers
- Use emojis sparingly for visual appeal

Tone: Professional, clear, actionable

Output Format:
{
  "report": "# Report Title\n\n## Executive Summary\n...",
  "visualizations": [
    {"type": "bar_chart", "data": {...}, "title": "..."}
  ],
  "confidence": 0.85
}
"""
```

## Prompt Optimization Strategies

### Token Efficiency

```python
# ❌ Verbose
"""You are an agent that is responsible for the task of analyzing data. 
When you receive data, you should carefully examine it and then provide 
a detailed analysis of what you find. Make sure to be thorough and 
consider all aspects of the data."""

# ✅ Concise
"""Analyze provided data thoroughly. Report findings, patterns, and anomalies."""
```

### Dynamic Prompts

Adapt prompts based on context:

```python
def build_agent_prompt(
    query_complexity: str,
    available_tools: list[str],
    user_expertise: str
) -> str:
    """Build dynamic prompt based on context."""
    
    base_prompt = "You are a data analysis agent."
    
    if query_complexity == "simple":
        base_prompt += " Provide concise, direct answers."
    elif query_complexity == "complex":
        base_prompt += " Provide detailed analysis with step-by-step reasoning."
    
    base_prompt += f"\n\nAvailable tools: {', '.join(available_tools)}"
    
    if user_expertise == "beginner":
        base_prompt += "\nExplain technical terms and provide context."
    elif user_expertise == "expert":
        base_prompt += "\nAssume technical knowledge. Be concise."
    
    return base_prompt
```

### Prompt Versioning

Track prompt changes:

```python
PROMPT_VERSIONS = {
    "v1.0": {
        "system": "You are a helpful agent.",
        "performance": {"accuracy": 0.75, "speed": "fast"},
        "issues": ["Too generic", "Low accuracy"]
    },
    "v1.1": {
        "system": "You are a SQL generation agent. Always use provided schema.",
        "performance": {"accuracy": 0.85, "speed": "fast"},
        "issues": ["Sometimes hallucinates tables"]
    },
    "v1.2": {
        "system": "You are a SQL agent. ONLY use tables from search_metadata results.",
        "performance": {"accuracy": 0.95, "speed": "medium"},
        "issues": []
    }
}

CURRENT_VERSION = "v1.2"
```

## Testing Prompts

### Evaluation Framework

```python
async def evaluate_prompt(
    prompt: str,
    test_cases: list[dict]
) -> dict:
    """Evaluate prompt performance."""
    
    results = []
    for test in test_cases:
        response = await llm.complete(
            system=prompt,
            user=test["input"]
        )
        
        correct = test["expected"] in response
        results.append({
            "input": test["input"],
            "expected": test["expected"],
            "actual": response,
            "correct": correct
        })
    
    accuracy = sum(r["correct"] for r in results) / len(results)
    
    return {
        "accuracy": accuracy,
        "results": results
    }
```

## Best Practices

1. **Be specific** - Clear instructions yield better results
2. **Provide examples** - Few-shot learning improves accuracy
3. **Set constraints** - Define what's allowed and forbidden
4. **Request structure** - Ask for specific output formats
5. **Include reasoning** - Chain-of-thought for complex tasks
6. **Version prompts** - Track changes and performance
7. **Test thoroughly** - Evaluate with diverse inputs
8. **Iterate** - Refine based on failures

## Common Pitfalls

- **Ambiguous instructions** - LLM interprets differently than intended
- **Missing constraints** - Agent does unexpected things
- **No examples** - Hard for LLM to understand desired behavior
- **Too verbose** - Wastes tokens, confuses model
- **Inconsistent format** - Makes parsing difficult
- **No error handling** - Doesn't guide recovery from failures

## When to Use This Skill

- Designing system prompts for new agents
- Improving agent response quality
- Debugging agent behavior issues
- Implementing few-shot learning
- Adding chain-of-thought reasoning
- Optimizing token usage in prompts
- Creating evaluation frameworks for agents
