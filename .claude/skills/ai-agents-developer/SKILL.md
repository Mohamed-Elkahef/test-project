---
name: ai-agents-developer
description: Comprehensive guide for building AI agents and multi-agent systems using modern frameworks like Pydantic AI, LangChain, CrewAI, AutoGen, and LangGraph. Covers agent design patterns, orchestration, tool integration, memory management, and production deployment. Use when building autonomous AI agents, chatbots, agentic workflows, or multi-agent systems.
---

# AI Agents Developer Skill

This skill provides comprehensive guidance for building production-ready AI agents, multi-agent systems, and agentic workflows using modern frameworks and best practices.

## Core Concepts

### What is an AI Agent?

An AI agent is an autonomous system that:
- **Perceives** its environment through inputs
- **Reasons** about goals and actions using LLMs
- **Acts** by calling tools/functions
- **Learns** from feedback and outcomes
- **Iterates** until goals are achieved

### Agent Architecture

```
User Input → Agent (LLM) → Tool Selection → Tool Execution → Result Processing → Response
                ↑                                                       ↓
                └───────────────────── Feedback Loop ──────────────────┘
```

## Agent Frameworks Comparison

### Pydantic AI
**Best for**: Type-safe, production-ready agents with structured outputs

```python
from pydantic_ai import Agent
from pydantic import BaseModel

class UserInfo(BaseModel):
    name: str
    age: int
    interests: list[str]

agent = Agent(
    model='openai:gpt-4',
    result_type=UserInfo,
    system_prompt='Extract user information from conversations.'
)

result = await agent.run('My name is John, I am 25, and I love coding and hiking.')
print(result.data)  # UserInfo(name='John', age=25, interests=['coding', 'hiking'])
```

**Key Features:**
- Type-safe with Pydantic models
- Built-in validation
- Structured outputs
- Simple API
- Production-ready

### LangChain
**Best for**: Complex chains, document processing, RAG systems

```python
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# Define tools
tools = [
    Tool(
        name="Calculator",
        func=lambda x: eval(x),
        description="Useful for mathematical calculations"
    )
]

# Create prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    ("user", "{input}"),
    ("assistant", "{agent_scratchpad}"),
])

# Create agent
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run agent
result = agent_executor.invoke({"input": "What is 15 * 7 + 23?"})
```

**Key Features:**
- Extensive tool library
- Document loaders
- Vector store integrations
- Memory management
- Chain composition

### CrewAI
**Best for**: Multi-agent collaboration, role-based teams

```python
from crewai import Agent, Task, Crew, Process

# Define agents
researcher = Agent(
    role='Senior Researcher',
    goal='Uncover groundbreaking research',
    backstory='Expert at finding relevant information',
    verbose=True,
    allow_delegation=True
)

writer = Agent(
    role='Content Writer',
    goal='Create engaging content',
    backstory='Skilled at writing clear articles',
    verbose=True
)

# Define tasks
research_task = Task(
    description='Research the topic: {topic}',
    agent=researcher,
    expected_output='Detailed research findings'
)

writing_task = Task(
    description='Write an article based on research',
    agent=writer,
    expected_output='Well-written article'
)

# Create crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential
)

# Execute
result = crew.kickoff(inputs={'topic': 'AI Agents'})
```

**Key Features:**
- Role-based agents
- Task delegation
- Sequential/hierarchical processes
- Agent collaboration
- Built-in memory

### LangGraph
**Best for**: Stateful workflows, complex agent routing

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# Define state
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next: str

# Define nodes
def call_agent(state):
    # Agent logic
    return {"messages": [response], "next": "tools"}

def call_tools(state):
    # Tool execution
    return {"messages": [tool_result], "next": END}

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_agent)
workflow.add_node("tools", call_tools)
workflow.set_entry_point("agent")
workflow.add_edge("tools", END)

# Compile and run
app = workflow.compile()
result = app.invoke({"messages": [user_input], "next": "agent"})
```

**Key Features:**
- State management
- Graph-based routing
- Conditional logic
- Cycle detection
- Debugging tools

## Building Agents with Pydantic AI

### Basic Agent
```python
from pydantic_ai import Agent
import asyncio

# Create agent
agent = Agent(
    model='openai:gpt-4',
    system_prompt='''You are a helpful customer service agent.
    You answer questions about products and services.
    Be friendly and professional.'''
)

# Run agent
async def main():
    result = await agent.run('What are your business hours?')
    print(result.data)

asyncio.run(main())
```

### Agent with Tools
```python
from pydantic_ai import Agent, RunContext
from dataclasses import dataclass

@dataclass
class WeatherDeps:
    api_key: str

agent = Agent(
    model='openai:gpt-4',
    deps_type=WeatherDeps,
    system_prompt='You provide weather information.'
)

@agent.tool
async def get_weather(ctx: RunContext[WeatherDeps], city: str) -> dict:
    """Get weather for a city.

    Args:
        city: City name

    Returns:
        Weather information including temperature and conditions
    """
    # Call weather API using ctx.deps.api_key
    return {
        'city': city,
        'temperature': 72,
        'conditions': 'Sunny'
    }

# Run with dependencies
result = await agent.run(
    'What is the weather in San Francisco?',
    deps=WeatherDeps(api_key='your-api-key')
)
```

### Structured Output Agent
```python
from pydantic_ai import Agent
from pydantic import BaseModel, Field
from typing import List

class Recipe(BaseModel):
    name: str = Field(description="Recipe name")
    ingredients: List[str] = Field(description="List of ingredients")
    instructions: List[str] = Field(description="Step-by-step instructions")
    prep_time: int = Field(description="Preparation time in minutes")
    cook_time: int = Field(description="Cooking time in minutes")

recipe_agent = Agent(
    model='openai:gpt-4',
    result_type=Recipe,
    system_prompt='You are a chef that creates detailed recipes.'
)

# Get structured recipe
result = await recipe_agent.run('Create a recipe for chocolate chip cookies')
recipe = result.data  # Type-safe Recipe object
print(f"Recipe: {recipe.name}")
print(f"Total time: {recipe.prep_time + recipe.cook_time} minutes")
```

### Agent with Memory
```python
from pydantic_ai import Agent
from typing import List

class ConversationAgent:
    def __init__(self):
        self.agent = Agent(
            model='openai:gpt-4',
            system_prompt='You are a helpful assistant with memory of the conversation.'
        )
        self.history: List[dict] = []

    async def chat(self, message: str) -> str:
        """Chat with memory of previous messages."""
        # Add user message to history
        self.history.append({'role': 'user', 'content': message})

        # Build context from history
        context = '\n'.join([
            f"{msg['role']}: {msg['content']}"
            for msg in self.history[-10:]  # Last 10 messages
        ])

        # Run agent with context
        result = await self.agent.run(
            message,
            message_history=self.history
        )

        # Add assistant response to history
        self.history.append({'role': 'assistant', 'content': result.data})

        return result.data

# Usage
chat_agent = ConversationAgent()
response1 = await chat_agent.chat("My name is Alice")
response2 = await chat_agent.chat("What's my name?")  # Should remember "Alice"
```

## Multi-Agent Systems

### Agent Orchestration Patterns

#### 1. Sequential (Pipeline)
Agents execute one after another, passing results forward.

```python
from pydantic_ai import Agent

class ResearchPipeline:
    def __init__(self):
        self.researcher = Agent(
            model='openai:gpt-4',
            system_prompt='Research topics and gather information.'
        )

        self.analyzer = Agent(
            model='openai:gpt-4',
            system_prompt='Analyze information and extract insights.'
        )

        self.writer = Agent(
            model='openai:gpt-4',
            system_prompt='Write clear, engaging reports.'
        )

    async def run(self, topic: str) -> str:
        # Step 1: Research
        research = await self.researcher.run(
            f"Research this topic: {topic}"
        )

        # Step 2: Analyze
        analysis = await self.analyzer.run(
            f"Analyze this research: {research.data}"
        )

        # Step 3: Write
        report = await self.writer.run(
            f"Write a report based on: {analysis.data}"
        )

        return report.data

# Usage
pipeline = ResearchPipeline()
result = await pipeline.run("Impact of AI on healthcare")
```

#### 2. Parallel (Fan-out/Fan-in)
Multiple agents work simultaneously, results are aggregated.

```python
import asyncio
from pydantic_ai import Agent
from typing import List

class ParallelAnalyzer:
    def __init__(self):
        self.sentiment_agent = Agent(
            model='openai:gpt-4',
            system_prompt='Analyze sentiment of text.'
        )

        self.topic_agent = Agent(
            model='openai:gpt-4',
            system_prompt='Extract main topics from text.'
        )

        self.summary_agent = Agent(
            model='openai:gpt-4',
            system_prompt='Summarize text concisely.'
        )

        self.aggregator = Agent(
            model='openai:gpt-4',
            system_prompt='Combine multiple analyses into one report.'
        )

    async def analyze(self, text: str) -> str:
        # Run agents in parallel
        sentiment_task = self.sentiment_agent.run(f"Analyze sentiment: {text}")
        topic_task = self.topic_agent.run(f"Extract topics: {text}")
        summary_task = self.summary_agent.run(f"Summarize: {text}")

        # Wait for all to complete
        sentiment, topics, summary = await asyncio.gather(
            sentiment_task,
            topic_task,
            summary_task
        )

        # Aggregate results
        combined = f"""
        Sentiment: {sentiment.data}
        Topics: {topics.data}
        Summary: {summary.data}
        """

        final = await self.aggregator.run(
            f"Create final report from these analyses: {combined}"
        )

        return final.data

# Usage
analyzer = ParallelAnalyzer()
result = await analyzer.analyze("Customer feedback text...")
```

#### 3. Hierarchical (Manager-Worker)
Manager agent delegates tasks to worker agents.

```python
from pydantic_ai import Agent
from typing import List, Dict
import asyncio

class HierarchicalSystem:
    def __init__(self):
        self.manager = Agent(
            model='openai:gpt-4',
            system_prompt='''You are a project manager.
            Break down tasks and assign them to workers.
            Available workers: researcher, coder, tester'''
        )

        self.workers = {
            'researcher': Agent(
                model='openai:gpt-4',
                system_prompt='Research and gather information.'
            ),
            'coder': Agent(
                model='openai:gpt-4',
                system_prompt='Write code based on requirements.'
            ),
            'tester': Agent(
                model='openai:gpt-4',
                system_prompt='Test code and find issues.'
            )
        }

    async def execute(self, project: str) -> str:
        # Manager creates task plan
        plan_result = await self.manager.run(
            f"Create a task plan for: {project}. Return JSON with tasks and assigned workers."
        )

        # Parse tasks (simplified)
        tasks = [
            {'worker': 'researcher', 'task': 'Research best practices'},
            {'worker': 'coder', 'task': 'Implement solution'},
            {'worker': 'tester', 'task': 'Test implementation'}
        ]

        # Execute tasks
        results = []
        for task in tasks:
            worker = self.workers[task['worker']]
            result = await worker.run(task['task'])
            results.append({
                'worker': task['worker'],
                'result': result.data
            })

        # Manager reviews results
        review = await self.manager.run(
            f"Review these results and create final report: {results}"
        )

        return review.data

# Usage
system = HierarchicalSystem()
result = await system.execute("Build a REST API for user management")
```

#### 4. Debate/Consensus
Multiple agents discuss and reach consensus.

```python
from pydantic_ai import Agent
from typing import List

class DebateSystem:
    def __init__(self):
        self.agents = [
            Agent(
                model='openai:gpt-4',
                system_prompt='You are a cautious analyst. Always consider risks.'
            ),
            Agent(
                model='openai:gpt-4',
                system_prompt='You are an optimistic visionary. Focus on opportunities.'
            ),
            Agent(
                model='openai:gpt-4',
                system_prompt='You are a pragmatic realist. Balance pros and cons.'
            )
        ]

        self.moderator = Agent(
            model='openai:gpt-4',
            system_prompt='Synthesize different viewpoints into balanced conclusion.'
        )

    async def debate(self, topic: str, rounds: int = 2) -> str:
        """Run debate with multiple rounds."""
        discussion = []

        for round_num in range(rounds):
            # Each agent gives their view
            for i, agent in enumerate(self.agents):
                context = "\n".join(discussion[-6:])  # Last 6 messages

                prompt = f"""
                Topic: {topic}
                Previous discussion: {context}

                Give your perspective on this topic.
                """

                result = await agent.run(prompt)
                discussion.append(f"Agent {i+1}: {result.data}")

        # Moderator synthesizes
        final = await self.moderator.run(
            f"Synthesize this discussion into final recommendation:\n" +
            "\n".join(discussion)
        )

        return final.data

# Usage
debate = DebateSystem()
result = await debate.debate("Should we adopt microservices architecture?")
```

## Tool Integration

### Custom Tools
```python
from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
import httpx

@dataclass
class APIDeps:
    http_client: httpx.AsyncClient
    api_key: str

agent = Agent(
    model='openai:gpt-4',
    deps_type=APIDeps,
    system_prompt='You help users interact with external APIs.'
)

@agent.tool
async def search_database(
    ctx: RunContext[APIDeps],
    query: str,
    limit: int = 10
) -> List[dict]:
    """Search database for records.

    Args:
        query: Search query
        limit: Maximum results to return

    Returns:
        List of matching records
    """
    response = await ctx.deps.http_client.get(
        'https://api.example.com/search',
        params={'q': query, 'limit': limit},
        headers={'Authorization': f'Bearer {ctx.deps.api_key}'}
    )
    return response.json()

@agent.tool
async def create_record(
    ctx: RunContext[APIDeps],
    data: dict
) -> dict:
    """Create new record in database.

    Args:
        data: Record data to create

    Returns:
        Created record with ID
    """
    response = await ctx.deps.http_client.post(
        'https://api.example.com/records',
        json=data,
        headers={'Authorization': f'Bearer {ctx.deps.api_key}'}
    )
    return response.json()

# Run agent with dependencies
async with httpx.AsyncClient() as client:
    deps = APIDeps(http_client=client, api_key='your-key')
    result = await agent.run(
        'Find all users with email ending in @example.com',
        deps=deps
    )
```

### Tool Error Handling
```python
from pydantic_ai import Agent, RunContext, ModelRetry

@agent.tool
async def risky_operation(ctx: RunContext, param: str) -> str:
    """Tool that might fail."""
    try:
        # Attempt operation
        result = await perform_operation(param)
        return result
    except ValueError as e:
        # Retry with guidance
        raise ModelRetry(f"Invalid parameter: {e}. Try a different value.")
    except ConnectionError:
        # Don't retry, return error message
        return "Service unavailable. Please try again later."
    except Exception as e:
        # Log and return generic error
        logger.error(f"Tool error: {e}")
        return "An error occurred. Please contact support."
```

### Tool Validation
```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, Field, validator

class SearchParams(BaseModel):
    query: str = Field(min_length=1, max_length=100)
    limit: int = Field(ge=1, le=100, default=10)
    category: str = Field(pattern=r'^(books|articles|papers)$')

    @validator('query')
    def validate_query(cls, v):
        if any(char in v for char in ['<', '>', ';']):
            raise ValueError('Invalid characters in query')
        return v

@agent.tool
async def validated_search(
    ctx: RunContext,
    params: SearchParams
) -> List[dict]:
    """Search with validated parameters."""
    # Pydantic validates automatically
    results = await search_api(
        query=params.query,
        limit=params.limit,
        category=params.category
    )
    return results
```

## Memory Management

### Conversation Memory
```python
from typing import List, Dict
from datetime import datetime

class ConversationMemory:
    def __init__(self, max_messages: int = 50):
        self.messages: List[Dict] = []
        self.max_messages = max_messages

    def add_message(self, role: str, content: str, metadata: dict = None):
        """Add message to memory."""
        self.messages.append({
            'role': role,
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'metadata': metadata or {}
        })

        # Trim if exceeds max
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]

    def get_recent(self, n: int = 10) -> List[Dict]:
        """Get recent messages."""
        return self.messages[-n:]

    def get_context(self, max_tokens: int = 4000) -> str:
        """Get context string within token limit."""
        context = []
        tokens = 0

        for msg in reversed(self.messages):
            msg_tokens = len(msg['content']) // 4  # Rough estimate
            if tokens + msg_tokens > max_tokens:
                break
            context.insert(0, f"{msg['role']}: {msg['content']}")
            tokens += msg_tokens

        return '\n'.join(context)

    def search(self, query: str, limit: int = 5) -> List[Dict]:
        """Search messages by content."""
        results = [
            msg for msg in self.messages
            if query.lower() in msg['content'].lower()
        ]
        return results[-limit:]
```

### Long-term Memory with Vector Store
```python
from pydantic_ai import Agent
import asyncpg
from typing import List

class VectorMemoryAgent:
    def __init__(self, db_pool: asyncpg.Pool):
        self.agent = Agent(model='openai:gpt-4')
        self.db = db_pool

    async def remember(self, key: str, content: str):
        """Store memory with embedding."""
        # Generate embedding
        embedding = await generate_embedding(content)

        # Store in vector database
        await self.db.execute("""
            INSERT INTO agent_memory (key, content, embedding)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) DO UPDATE SET
                content = $2,
                embedding = $3,
                updated_at = NOW()
        """, key, content, embedding)

    async def recall(self, query: str, limit: int = 5) -> List[str]:
        """Retrieve relevant memories."""
        # Generate query embedding
        query_embedding = await generate_embedding(query)

        # Search similar memories
        results = await self.db.fetch("""
            SELECT content, 1 - (embedding <=> $1::vector) as similarity
            FROM agent_memory
            WHERE 1 - (embedding <=> $1::vector) > 0.7
            ORDER BY embedding <=> $1::vector
            LIMIT $2
        """, query_embedding, limit)

        return [row['content'] for row in results]

    async def run_with_memory(self, user_query: str) -> str:
        """Run agent with memory context."""
        # Retrieve relevant memories
        memories = await self.recall(user_query)

        # Build context
        context = "Relevant memories:\n" + "\n".join(memories)

        # Run agent with context
        result = await self.agent.run(
            f"{context}\n\nUser query: {user_query}"
        )

        # Store this interaction
        await self.remember(
            key=f"query_{datetime.now().timestamp()}",
            content=f"Q: {user_query}\nA: {result.data}"
        )

        return result.data
```

## Error Handling and Retries

### Retry Logic
```python
from pydantic_ai import Agent, ModelRetry
from tenacity import retry, stop_after_attempt, wait_exponential
import asyncio

agent = Agent(model='openai:gpt-4')

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def agent_with_retry(prompt: str) -> str:
    """Run agent with automatic retries."""
    try:
        result = await agent.run(prompt)
        return result.data
    except Exception as e:
        logger.error(f"Agent error: {e}")
        raise

# Usage
try:
    result = await agent_with_retry("Complex query...")
except Exception as e:
    print(f"Failed after retries: {e}")
```

### Fallback Strategies
```python
from pydantic_ai import Agent
from typing import Optional

class ResilientAgent:
    def __init__(self):
        self.primary = Agent(model='openai:gpt-4')
        self.fallback = Agent(model='openai:gpt-3.5-turbo')
        self.cache = {}

    async def run(self, prompt: str) -> str:
        """Run with fallback and caching."""
        # Check cache
        if prompt in self.cache:
            return self.cache[prompt]

        # Try primary model
        try:
            result = await self.primary.run(prompt)
            self.cache[prompt] = result.data
            return result.data
        except Exception as e:
            logger.warning(f"Primary model failed: {e}")

            # Try fallback model
            try:
                result = await self.fallback.run(prompt)
                self.cache[prompt] = result.data
                return result.data
            except Exception as e2:
                logger.error(f"Fallback model failed: {e2}")

                # Return cached similar response if available
                similar = self._find_similar_cached(prompt)
                if similar:
                    return f"Using cached response: {similar}"

                raise Exception("All models failed")

    def _find_similar_cached(self, prompt: str) -> Optional[str]:
        """Find similar cached response."""
        # Simple implementation - could use embeddings
        for cached_prompt, response in self.cache.items():
            if len(set(prompt.split()) & set(cached_prompt.split())) > 3:
                return response
        return None
```

## Production Best Practices

### Rate Limiting
```python
import asyncio
from collections import deque
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = timedelta(seconds=time_window)
        self.requests = deque()

    async def acquire(self):
        """Wait if rate limit exceeded."""
        now = datetime.now()

        # Remove old requests
        while self.requests and now - self.requests[0] > self.time_window:
            self.requests.popleft()

        # Wait if at limit
        if len(self.requests) >= self.max_requests:
            sleep_time = (self.requests[0] + self.time_window - now).total_seconds()
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
            self.requests.popleft()

        self.requests.append(now)

# Usage
rate_limiter = RateLimiter(max_requests=10, time_window=60)  # 10 per minute

async def rate_limited_agent_call(agent, prompt):
    await rate_limiter.acquire()
    return await agent.run(prompt)
```

### Logging and Monitoring
```python
import logging
from datetime import datetime
from typing import Any, Dict
import json

class AgentLogger:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.logger = logging.getLogger(agent_name)

    def log_request(self, prompt: str, metadata: Dict = None):
        """Log agent request."""
        self.logger.info({
            'event': 'agent_request',
            'agent': self.agent_name,
            'prompt': prompt[:100],  # Truncate
            'metadata': metadata,
            'timestamp': datetime.now().isoformat()
        })

    def log_response(self, result: Any, duration: float, token_usage: Dict = None):
        """Log agent response."""
        self.logger.info({
            'event': 'agent_response',
            'agent': self.agent_name,
            'duration_ms': duration * 1000,
            'token_usage': token_usage,
            'timestamp': datetime.now().isoformat()
        })

    def log_error(self, error: Exception, context: Dict = None):
        """Log agent error."""
        self.logger.error({
            'event': 'agent_error',
            'agent': self.agent_name,
            'error': str(error),
            'error_type': type(error).__name__,
            'context': context,
            'timestamp': datetime.now().isoformat()
        })

# Usage with agent
class MonitoredAgent:
    def __init__(self, name: str):
        self.agent = Agent(model='openai:gpt-4')
        self.logger = AgentLogger(name)

    async def run(self, prompt: str) -> str:
        start_time = datetime.now()

        try:
            self.logger.log_request(prompt)

            result = await self.agent.run(prompt)

            duration = (datetime.now() - start_time).total_seconds()
            self.logger.log_response(result.data, duration)

            return result.data

        except Exception as e:
            self.logger.log_error(e, {'prompt': prompt})
            raise
```

### Cost Tracking
```python
from typing import Dict
from dataclasses import dataclass, field

@dataclass
class CostTracker:
    model_costs: Dict[str, Dict[str, float]] = field(default_factory=lambda: {
        'gpt-4': {'input': 0.03, 'output': 0.06},  # per 1K tokens
        'gpt-3.5-turbo': {'input': 0.0015, 'output': 0.002},
    })
    total_cost: float = 0.0
    request_count: int = 0

    def track_request(self, model: str, input_tokens: int, output_tokens: int):
        """Track cost of a request."""
        if model not in self.model_costs:
            return

        costs = self.model_costs[model]
        request_cost = (
            (input_tokens / 1000) * costs['input'] +
            (output_tokens / 1000) * costs['output']
        )

        self.total_cost += request_cost
        self.request_count += 1

    def get_stats(self) -> Dict:
        """Get cost statistics."""
        return {
            'total_cost': round(self.total_cost, 4),
            'request_count': self.request_count,
            'avg_cost_per_request': round(
                self.total_cost / self.request_count if self.request_count > 0 else 0,
                4
            )
        }

# Global tracker
cost_tracker = CostTracker()

# Track in agent calls
async def tracked_agent_run(agent, prompt):
    result = await agent.run(prompt)

    # Track costs (assume we can get token usage from result)
    cost_tracker.track_request(
        model='gpt-4',
        input_tokens=result.input_tokens,
        output_tokens=result.output_tokens
    )

    return result.data
```

## Testing Agents

### Unit Testing
```python
import pytest
from unittest.mock import AsyncMock, Mock
from pydantic_ai import Agent

@pytest.mark.asyncio
async def test_agent_basic_response():
    """Test agent returns expected response."""
    agent = Agent(model='openai:gpt-4', system_prompt='You are helpful.')

    # Mock the model
    agent._model = AsyncMock()
    agent._model.run = AsyncMock(return_value="Hello! How can I help?")

    result = await agent.run("Hi there")

    assert "help" in result.data.lower()

@pytest.mark.asyncio
async def test_agent_tool_execution():
    """Test agent correctly uses tools."""
    agent = Agent(model='openai:gpt-4')

    @agent.tool
    async def calculator(operation: str) -> float:
        """Simple calculator."""
        return eval(operation)

    result = await agent.run("What is 5 + 3?")

    assert "8" in result.data

@pytest.mark.asyncio
async def test_agent_error_handling():
    """Test agent handles errors gracefully."""
    agent = Agent(model='openai:gpt-4')

    @agent.tool
    async def failing_tool() -> str:
        """Tool that fails."""
        raise ValueError("Tool error")

    # Should handle error without crashing
    result = await agent.run("Use the failing tool")

    assert result is not None
```

### Integration Testing
```python
@pytest.mark.integration
async def test_multi_agent_workflow():
    """Test complete multi-agent workflow."""
    # Create agents
    researcher = Agent(model='openai:gpt-4', system_prompt='Research topics.')
    writer = Agent(model='openai:gpt-4', system_prompt='Write articles.')

    # Execute workflow
    research = await researcher.run("Research Python testing")
    article = await writer.run(f"Write article based on: {research.data}")

    # Verify
    assert len(article.data) > 100
    assert "test" in article.data.lower()

@pytest.mark.integration
async def test_agent_with_real_tools():
    """Test agent with actual API calls."""
    agent = Agent(model='openai:gpt-4')

    @agent.tool
    async def get_current_time() -> str:
        """Get current time."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    result = await agent.run("What time is it?")

    # Should include timestamp
    assert any(char.isdigit() for char in result.data)
```

## Best Practices

### DO:
✅ Use type hints and Pydantic models for structured data
✅ Implement proper error handling and retries
✅ Add logging and monitoring for production
✅ Use async/await for better performance
✅ Implement rate limiting to avoid API limits
✅ Cache responses when appropriate
✅ Write clear, detailed system prompts
✅ Test agents thoroughly before deployment
✅ Track costs and usage
✅ Use tools for deterministic operations

### DON'T:
❌ Hardcode API keys in code
❌ Skip validation of tool inputs
❌ Ignore error cases
❌ Make tools too complex or do too much
❌ Use blocking operations in async code
❌ Expose sensitive data in logs
❌ Let agents run indefinitely without timeout
❌ Skip testing with edge cases
❌ Forget to handle rate limits
❌ Ignore token usage and costs

## When to Use This Skill

- Building autonomous AI agents with LLMs
- Creating multi-agent systems and workflows
- Implementing agentic RAG systems
- Developing chatbots and conversational AI
- Building tool-using agents
- Orchestrating complex agent interactions
- Adding memory and context to agents
- Deploying production-ready agent systems
- Debugging agent behavior and failures
- Optimizing agent performance and costs

## Related Skills

- **[agentic-rag-development](./../agentic-rag-development/)**: For RAG-specific agent patterns
- **[backend-testing](./../backend-testing/)**: For testing agent systems
- **[mcp-builder](./../mcp-builder/)**: For building agent tools and integrations
- **[api-debugging](./../api-debugging/)**: For debugging agent API calls
