---
name: agent-orchestration
description: Design and implement multi-agent systems with clear responsibilities, communication patterns, error handling, and state management. Use when building agentic workflows with multiple specialized agents.
---

# Agent Orchestration

Guide for designing and implementing effective multi-agent systems with clear responsibilities and robust communication patterns.

## Core Principles

### Single Responsibility Principle
Each agent should have one well-defined responsibility:

```python
# ✅ Good - Clear, focused responsibility
class QueryUnderstandingAgent:
    """Parses user queries and retrieves relevant context."""
    async def run(self, query: str) -> Context:
        entities = self.extract_entities(query)
        intent = self.classify_intent(query)
        context = await self.retrieve_context(entities)
        return Context(entities=entities, intent=intent, context=context)

# ❌ Bad - Too many responsibilities
class SuperAgent:
    """Does everything: parsing, querying, formatting, reporting."""
    pass
```

### Clear Agent Boundaries

Define explicit inputs and outputs:

```python
from pydantic import BaseModel

class AgentInput(BaseModel):
    """Typed input for agent."""
    query: str
    context: dict[str, Any]
    
class AgentOutput(BaseModel):
    """Typed output from agent."""
    result: Any
    confidence: float
    metadata: dict[str, Any]
```

## Agent Design Patterns

### Sequential Pipeline

Agents execute in order, each building on previous results:

```python
async def sequential_pipeline(user_query: str) -> FinalResult:
    """Execute agents in sequence."""
    
    # Agent 1: Understanding
    context = await agent1.run(user_query)
    
    # Agent 2: Processing (uses Agent 1 output)
    processed = await agent2.run(
        query=user_query,
        context=context
    )
    
    # Agent 3: Formatting (uses Agent 2 output)
    final = await agent3.run(
        data=processed,
        context=context
    )
    
    return final
```

### Parallel Execution

Independent agents run simultaneously:

```python
import asyncio

async def parallel_execution(query: str) -> CombinedResult:
    """Execute independent agents in parallel."""
    
    # Run agents concurrently
    results = await asyncio.gather(
        vector_search_agent.run(query),
        graph_query_agent.run(query),
        schema_retrieval_agent.run(query),
        return_exceptions=True  # Don't fail if one agent fails
    )
    
    # Combine results
    return combine_results(results)
```

### Conditional Routing

Route to different agents based on query type:

```python
async def conditional_routing(query: str) -> Result:
    """Route to appropriate agent based on query analysis."""
    
    query_type = classify_query(query)
    
    if query_type == "data_query":
        return await sql_agent.run(query)
    elif query_type == "document_search":
        return await rag_agent.run(query)
    elif query_type == "dashboard_creation":
        return await dashboard_agent.run(query)
    else:
        return await general_agent.run(query)
```

### Retry with Fallback

Primary agent with fallback on failure:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def agent_with_retry(query: str) -> Result:
    """Execute agent with automatic retry."""
    try:
        return await primary_agent.run(query)
    except AgentError as e:
        logger.warning(f"Primary agent failed: {e}")
        # Try fallback agent
        return await fallback_agent.run(query, error=str(e))
```

## Communication Patterns

### Context Passing

Pass rich context between agents:

```python
@dataclass
class AgentContext:
    """Shared context between agents."""
    query: str
    user_id: str
    session_id: str
    previous_results: list[Any]
    metadata: dict[str, Any]
    
async def agent_pipeline(query: str) -> Result:
    """Pipeline with shared context."""
    
    context = AgentContext(
        query=query,
        user_id=get_current_user(),
        session_id=get_session_id(),
        previous_results=[],
        metadata={}
    )
    
    # Agent 1
    result1 = await agent1.run(context)
    context.previous_results.append(result1)
    context.metadata.update(result1.metadata)
    
    # Agent 2 (has access to Agent 1's results)
    result2 = await agent2.run(context)
    
    return result2
```

### Event-Driven Communication

Agents communicate via events:

```python
from typing import Callable
from dataclasses import dataclass

@dataclass
class AgentEvent:
    """Event emitted by agent."""
    type: str
    data: Any
    source_agent: str
    timestamp: float

class EventBus:
    """Central event bus for agent communication."""
    
    def __init__(self):
        self.subscribers: dict[str, list[Callable]] = {}
    
    def subscribe(self, event_type: str, handler: Callable):
        """Subscribe to event type."""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
    
    async def publish(self, event: AgentEvent):
        """Publish event to subscribers."""
        if event.type in self.subscribers:
            await asyncio.gather(*[
                handler(event) for handler in self.subscribers[event.type]
            ])

# Usage
event_bus = EventBus()

# Agent subscribes to events
event_bus.subscribe("context_retrieved", agent2.on_context_ready)
event_bus.subscribe("query_generated", agent3.on_query_ready)

# Agent publishes event
await event_bus.publish(AgentEvent(
    type="context_retrieved",
    data=context,
    source_agent="agent1",
    timestamp=time.time()
))
```

## State Management

### Conversation State

Track multi-turn conversations:

```python
from enum import Enum

class ConversationPhase(str, Enum):
    """Phases in conversation flow."""
    DISCOVERY = "discovery"
    DATA_SOURCE = "data_source_identification"
    VISUALIZATION = "visualization_design"
    CONFIRMATION = "confirmation"
    GENERATION = "generation"

class ConversationState:
    """State for multi-turn conversation."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.phase = ConversationPhase.DISCOVERY
        self.requirements = {}
        self.context = {}
        self.history = []
        self.confidence = 0.0
    
    def update(self, phase: ConversationPhase, data: dict):
        """Update conversation state."""
        self.phase = phase
        self.requirements.update(data)
        self.history.append({
            "phase": phase,
            "data": data,
            "timestamp": time.time()
        })
    
    def is_complete(self) -> bool:
        """Check if conversation is complete."""
        required_fields = ["objective", "metrics", "data_sources"]
        return all(field in self.requirements for field in required_fields)
```

### Agent Memory

Persist agent state across invocations:

```python
class AgentMemory:
    """Persistent memory for agent."""
    
    def __init__(self, agent_id: str, db):
        self.agent_id = agent_id
        self.db = db
    
    async def remember(self, key: str, value: Any):
        """Store value in memory."""
        await self.db.execute(
            "INSERT INTO agent_memory (agent_id, key, value) VALUES ($1, $2, $3)",
            self.agent_id, key, json.dumps(value)
        )
    
    async def recall(self, key: str) -> Any:
        """Retrieve value from memory."""
        row = await self.db.fetchrow(
            "SELECT value FROM agent_memory WHERE agent_id = $1 AND key = $2",
            self.agent_id, key
        )
        return json.loads(row['value']) if row else None
    
    async def forget(self, key: str):
        """Remove value from memory."""
        await self.db.execute(
            "DELETE FROM agent_memory WHERE agent_id = $1 AND key = $2",
            self.agent_id, key
        )
```

## Error Handling

### Graceful Degradation

Handle agent failures without breaking the system:

```python
async def robust_agent_pipeline(query: str) -> Result:
    """Pipeline with graceful degradation."""
    
    results = {}
    errors = {}
    
    # Try each agent, continue on failure
    try:
        results['vector_search'] = await vector_agent.run(query)
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        errors['vector_search'] = str(e)
        results['vector_search'] = []  # Empty fallback
    
    try:
        results['graph_query'] = await graph_agent.run(query)
    except Exception as e:
        logger.error(f"Graph query failed: {e}")
        errors['graph_query'] = str(e)
        results['graph_query'] = []  # Empty fallback
    
    # Continue with partial results
    return generate_response(results, errors)
```

### Circuit Breaker

Prevent cascading failures:

```python
from datetime import datetime, timedelta

class CircuitBreaker:
    """Circuit breaker for agent calls."""
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timedelta(seconds=timeout)
        self.failures = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half_open
    
    async def call(self, agent_func, *args, **kwargs):
        """Execute agent function with circuit breaker."""
        
        if self.state == "open":
            if datetime.now() - self.last_failure_time > self.timeout:
                self.state = "half_open"
            else:
                raise CircuitBreakerOpen("Circuit breaker is open")
        
        try:
            result = await agent_func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise
    
    def on_success(self):
        """Reset on successful call."""
        self.failures = 0
        self.state = "closed"
    
    def on_failure(self):
        """Increment failures."""
        self.failures += 1
        self.last_failure_time = datetime.now()
        if self.failures >= self.failure_threshold:
            self.state = "open"
```

## Monitoring & Observability

### Agent Metrics

Track agent performance:

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class AgentMetrics:
    """Metrics for agent execution."""
    agent_name: str
    execution_time: float
    success: bool
    error: Optional[str]
    input_tokens: int
    output_tokens: int
    confidence: float

async def monitored_agent_call(agent, *args, **kwargs) -> tuple[Any, AgentMetrics]:
    """Execute agent with monitoring."""
    
    start_time = time.time()
    error = None
    success = True
    
    try:
        result = await agent.run(*args, **kwargs)
    except Exception as e:
        error = str(e)
        success = False
        raise
    finally:
        execution_time = time.time() - start_time
        
        metrics = AgentMetrics(
            agent_name=agent.__class__.__name__,
            execution_time=execution_time,
            success=success,
            error=error,
            input_tokens=count_tokens(args, kwargs),
            output_tokens=count_tokens(result) if success else 0,
            confidence=result.confidence if success else 0.0
        )
        
        # Log metrics
        await log_metrics(metrics)
        
    return result, metrics
```

### Distributed Tracing

Track requests across agents:

```python
import uuid
from contextvars import ContextVar

# Request ID context variable
request_id_var: ContextVar[str] = ContextVar('request_id', default='')
trace_id_var: ContextVar[str] = ContextVar('trace_id', default='')

class AgentTracer:
    """Distributed tracing for agents."""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
    
    async def trace(self, func, *args, **kwargs):
        """Trace agent execution."""
        
        trace_id = trace_id_var.get() or str(uuid.uuid4())
        span_id = str(uuid.uuid4())
        
        trace_id_var.set(trace_id)
        
        logger.info(f"[{trace_id}:{span_id}] {self.agent_name} started")
        
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"[{trace_id}:{span_id}] {self.agent_name} completed in {duration:.2f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"[{trace_id}:{span_id}] {self.agent_name} failed after {duration:.2f}s: {e}")
            raise
```

## Best Practices

1. **Keep agents focused** - One responsibility per agent
2. **Use typed interfaces** - Pydantic models for inputs/outputs
3. **Handle failures gracefully** - Don't let one agent break the system
4. **Log extensively** - Track agent execution and decisions
5. **Monitor performance** - Measure execution time and success rates
6. **Test independently** - Each agent should be testable in isolation
7. **Version agent logic** - Track changes to agent behavior
8. **Document agent purpose** - Clear docstrings explaining what each agent does

## Common Pitfalls

- **Tight coupling** - Agents depending on internal details of other agents
- **Circular dependencies** - Agent A calls Agent B which calls Agent A
- **Missing error handling** - Not handling agent failures
- **Poor observability** - Can't debug multi-agent flows
- **Stateless when state needed** - Losing context between turns
- **Over-orchestration** - Too many agents for simple tasks

## When to Use This Skill

- Designing multi-agent RAG systems
- Building conversational agents with multiple phases
- Implementing agent pipelines with error handling
- Debugging agent communication issues
- Optimizing agent orchestration performance
- Adding monitoring to agent systems
