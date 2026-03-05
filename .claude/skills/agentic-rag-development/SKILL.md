---
name: agentic-rag-development
description: Build and maintain agentic RAG systems with multi-agent orchestration, vector search, knowledge graphs, and intelligent query routing for context-aware document retrieval and analysis
---

# Agentic RAG Development Skill

This skill provides comprehensive guidance for developing, debugging, and optimizing agentic RAG (Retrieval-Augmented Generation) systems with multiple specialized agents.

## Core Capabilities

### 1. Multi-Agent Orchestration
- Design agent workflows with clear responsibilities
- Implement agent communication patterns
- Handle agent failures and fallbacks
- Coordinate parallel agent execution
- Manage agent state and context

### 2. Vector Search & Embeddings
- Generate embeddings with appropriate models
- Implement similarity search with pgvector
- Optimize vector indexes for performance
- Handle hybrid search (vector + keyword)
- Manage embedding dimensions and normalization

### 3. Knowledge Graph Integration
- Build entity-relationship graphs
- Query graph databases (Neo4j)
- Combine vector search with graph traversal
- Extract entities and relationships from documents
- Maintain graph consistency

### 4. Document Processing Pipeline
- Chunk documents intelligently
- Preserve context across chunks
- Extract metadata and structure
- Handle multiple document formats
- Implement incremental updates

## Agent Design Patterns

### Agent Specialization
Each agent should have a single, well-defined responsibility:

```python
# Agent 1: Query Understanding & Context Retrieval
- Parse user queries
- Extract entities and intent
- Search vector database
- Search knowledge graph
- Retrieve relevant context

# Agent 2: SQL Query Generation
- Analyze data schema
- Generate SQL queries
- Validate query syntax
- Execute queries safely
- Format results

# Agent 3: Report Generation & Formatting
- Structure report content
- Generate visualizations
- Format output (JSON, HTML, PDF)
- Apply styling and branding
- Calculate metrics and insights
```

### Agent Communication
```python
# Context passing between agents
agent1_result = await agent1.run(user_query)
agent2_result = await agent2.run(
    query=user_query,
    context=agent1_result.context,
    schema=agent1_result.schema_info
)
agent3_result = await agent3.run(
    data=agent2_result.data,
    context=agent1_result.context,
    query_metadata=agent2_result.metadata
)
```

### Error Handling & Fallbacks
```python
try:
    result = await primary_agent.run(query)
except AgentError as e:
    logger.warning(f"Primary agent failed: {e}")
    result = await fallback_agent.run(query, error=str(e))
```

## Vector Search Implementation

### Embedding Generation
```python
# Use appropriate embedding models
# - nomic-embed-text: General purpose
# - text-embedding-3-small: OpenAI's efficient model
# - all-MiniLM-L6-v2: Lightweight option

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding vector for text."""
    response = await embedding_client.embeddings.create(
        model="nomic-embed-text",
        input=text
    )
    return response.data[0].embedding
```

### Vector Search Query
```python
async def search_similar_chunks(
    query_embedding: List[float],
    limit: int = 10,
    similarity_threshold: float = 0.7
) -> List[Chunk]:
    """Search for similar document chunks."""

    # Convert to PostgreSQL vector format
    embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'

    results = await db.fetch("""
        SELECT
            id,
            content,
            metadata,
            1 - (embedding <=> $1::vector) as similarity
        FROM chunks
        WHERE 1 - (embedding <=> $1::vector) > $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
    """, embedding_str, similarity_threshold, limit)

    return [Chunk(**dict(row)) for row in results]
```

### Hybrid Search
```python
async def hybrid_search(
    query: str,
    query_embedding: List[float],
    limit: int = 10,
    vector_weight: float = 0.7
) -> List[Chunk]:
    """Combine vector and keyword search."""

    embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'

    results = await db.fetch("""
        WITH vector_search AS (
            SELECT
                id,
                content,
                metadata,
                1 - (embedding <=> $1::vector) as vector_score
            FROM chunks
        ),
        text_search AS (
            SELECT
                id,
                ts_rank(to_tsvector('english', content), plainto_tsquery('english', $2)) as text_score
            FROM chunks
        )
        SELECT
            v.id,
            v.content,
            v.metadata,
            ($3 * v.vector_score + (1 - $3) * t.text_score) as combined_score
        FROM vector_search v
        JOIN text_search t ON v.id = t.id
        ORDER BY combined_score DESC
        LIMIT $4
    """, embedding_str, query, vector_weight, limit)

    return [Chunk(**dict(row)) for row in results]
```

## Document Chunking Strategies

### Semantic Chunking
```python
def semantic_chunk_document(
    document: str,
    max_chunk_size: int = 800,
    overlap: int = 150
) -> List[str]:
    """
    Chunk document while preserving semantic boundaries.

    - Split on paragraph boundaries
    - Preserve code blocks
    - Keep headers with their content
    - Maintain context with overlap
    """
    chunks = []

    # Split on double newlines (paragraphs)
    paragraphs = document.split('\n\n')

    current_chunk = []
    current_size = 0

    for para in paragraphs:
        para_size = len(para.split())

        if current_size + para_size > max_chunk_size and current_chunk:
            # Save current chunk
            chunk_text = '\n\n'.join(current_chunk)
            chunks.append(chunk_text)

            # Keep last paragraph for overlap
            current_chunk = [current_chunk[-1]] if current_chunk else []
            current_size = len(current_chunk[0].split()) if current_chunk else 0

        current_chunk.append(para)
        current_size += para_size

    # Add remaining chunk
    if current_chunk:
        chunks.append('\n\n'.join(current_chunk))

    return chunks
```

### Metadata Extraction
```python
def extract_chunk_metadata(
    chunk: str,
    document_metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """Extract metadata from chunk for better retrieval."""

    metadata = {
        **document_metadata,
        'chunk_length': len(chunk),
        'has_code': '```' in chunk,
        'has_table': '|' in chunk and '---' in chunk,
        'entities': extract_entities(chunk),
        'keywords': extract_keywords(chunk),
    }

    # Extract headers
    headers = re.findall(r'^#{1,6}\s+(.+)$', chunk, re.MULTILINE)
    if headers:
        metadata['headers'] = headers

    return metadata
```

## Knowledge Graph Integration

### Building the Graph
```python
async def build_knowledge_graph(documents: List[Document]):
    """Build knowledge graph from documents."""

    for doc in documents:
        # Extract entities
        entities = extract_entities(doc.content)

        # Create entity nodes
        for entity in entities:
            await neo4j.run("""
                MERGE (e:Entity {name: $name, type: $type})
                SET e.document_id = $doc_id
            """, name=entity.name, type=entity.type, doc_id=doc.id)

        # Extract relationships
        relationships = extract_relationships(doc.content, entities)

        # Create relationship edges
        for rel in relationships:
            await neo4j.run("""
                MATCH (a:Entity {name: $source})
                MATCH (b:Entity {name: $target})
                MERGE (a)-[r:RELATED {type: $rel_type}]->(b)
                SET r.confidence = $confidence
            """, source=rel.source, target=rel.target,
                 rel_type=rel.type, confidence=rel.confidence)
```

### Querying the Graph
```python
async def query_related_entities(entity_name: str, max_depth: int = 2):
    """Query related entities from knowledge graph."""

    result = await neo4j.run("""
        MATCH (e:Entity {name: $name})-[r*1..$depth]-(related)
        RETURN DISTINCT related.name as entity,
               related.type as type,
               type(r[0]) as relationship
        LIMIT 20
    """, name=entity_name, depth=max_depth)

    return [dict(row) for row in result]
```

## RAG Query Pipeline

### Complete RAG Flow
```python
async def rag_query_pipeline(user_query: str) -> Dict[str, Any]:
    """
    Complete RAG pipeline with agents.

    Flow:
    1. Generate query embedding
    2. Search vector database
    3. Query knowledge graph
    4. Retrieve database schema (if needed)
    5. Generate response with LLM
    6. Format output
    """

    # Step 1: Generate embedding
    query_embedding = await generate_embedding(user_query)

    # Step 2: Parallel retrieval
    vector_results, graph_results, schema_info = await asyncio.gather(
        search_similar_chunks(query_embedding, limit=10),
        query_knowledge_graph(user_query),
        get_relevant_schema(user_query)
    )

    # Step 3: Agent 1 - Context assembly
    context = {
        'query': user_query,
        'relevant_chunks': vector_results,
        'graph_entities': graph_results,
        'schema': schema_info
    }

    # Step 4: Agent 2 - SQL generation (if needed)
    if requires_data_query(context):
        sql_query = await sql_agent.run(context)
        data = await execute_query(sql_query)
        context['data'] = data

    # Step 5: Agent 3 - Response generation
    response = await response_agent.run(context)

    return {
        'answer': response.answer,
        'sources': response.sources,
        'confidence': response.confidence,
        'data': context.get('data'),
        'metadata': {
            'chunks_used': len(vector_results),
            'entities_found': len(graph_results),
            'query_executed': 'data' in context
        }
    }
```

## Performance Optimization

### Vector Index Optimization
```sql
-- Create HNSW index for faster similarity search
CREATE INDEX chunks_embedding_idx ON chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Analyze table for query optimization
ANALYZE chunks;
```

### Caching Strategy
```python
from functools import lru_cache
import asyncio

# Cache embeddings for frequently used queries
@lru_cache(maxsize=1000)
def get_cached_embedding(text: str) -> List[float]:
    """Cache embeddings to avoid regeneration."""
    return asyncio.run(generate_embedding(text))

# Cache schema information
@lru_cache(maxsize=100)
def get_cached_schema(connection_name: str) -> Dict[str, Any]:
    """Cache database schema information."""
    return asyncio.run(fetch_schema(connection_name))
```

### Batch Processing
```python
async def batch_generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings in batches for efficiency."""

    batch_size = 100
    embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        batch_embeddings = await embedding_client.embeddings.create(
            model="nomic-embed-text",
            input=batch
        )
        embeddings.extend([e.embedding for e in batch_embeddings.data])

    return embeddings
```

## Testing RAG Systems

### Unit Tests
```python
@pytest.mark.asyncio
async def test_vector_search():
    """Test vector search returns relevant results."""
    query = "employee salary analysis"
    embedding = await generate_embedding(query)
    results = await search_similar_chunks(embedding, limit=5)

    assert len(results) > 0
    assert all(r.similarity > 0.5 for r in results)
    assert 'salary' in results[0].content.lower()

@pytest.mark.asyncio
async def test_agent_orchestration():
    """Test agent pipeline executes correctly."""
    result = await rag_query_pipeline("Show me top performers")

    assert 'answer' in result
    assert 'sources' in result
    assert result['confidence'] > 0.7
```

### Integration Tests
```python
@pytest.mark.integration
async def test_full_rag_pipeline():
    """Test complete RAG pipeline end-to-end."""

    # Ingest test document
    doc = Document(
        title="Test Document",
        content="Employee performance data shows...",
        metadata={"type": "test"}
    )
    await ingest_document(doc)

    # Query the system
    result = await rag_query_pipeline("Show employee performance")

    # Verify results
    assert result['answer'] is not None
    assert len(result['sources']) > 0
    assert any('performance' in s.content.lower() for s in result['sources'])
```

## Debugging & Monitoring

### Logging Best Practices
```python
import logging

logger = logging.getLogger(__name__)

# Log query flow
logger.info(f"🔍 RAG Query: {user_query}")
logger.info(f"📊 Found {len(vector_results)} relevant chunks")
logger.info(f"🔗 Found {len(graph_results)} related entities")
logger.info(f"✅ Response confidence: {response.confidence}")

# Log performance metrics
logger.info(f"⏱️ Vector search: {vector_time:.2f}s")
logger.info(f"⏱️ Graph query: {graph_time:.2f}s")
logger.info(f"⏱️ LLM generation: {llm_time:.2f}s")
```

### Monitoring Metrics
```python
# Track key metrics
metrics = {
    'query_count': 0,
    'avg_response_time': 0,
    'avg_confidence': 0,
    'cache_hit_rate': 0,
    'error_rate': 0
}

# Update metrics after each query
def update_metrics(query_result: Dict[str, Any], elapsed_time: float):
    metrics['query_count'] += 1
    metrics['avg_response_time'] = (
        (metrics['avg_response_time'] * (metrics['query_count'] - 1) + elapsed_time)
        / metrics['query_count']
    )
    metrics['avg_confidence'] = (
        (metrics['avg_confidence'] * (metrics['query_count'] - 1) + query_result['confidence'])
        / metrics['query_count']
    )
```

## Common Patterns

### When to Use Each Component

**Vector Search**: For semantic similarity and content retrieval
**Knowledge Graph**: For entity relationships and graph traversal
**Hybrid Search**: For combining semantic and keyword relevance
**Multi-Agent**: For complex workflows requiring specialized processing

### Agent Selection Logic
```python
def select_agent_pipeline(query: str) -> str:
    """Select appropriate agent pipeline based on query type."""

    if requires_sql_query(query):
        return "rag_with_sql_pipeline"
    elif requires_graph_analysis(query):
        return "rag_with_graph_pipeline"
    elif requires_document_analysis(query):
        return "rag_document_pipeline"
    else:
        return "basic_rag_pipeline"
```

## Best Practices

1. **Always normalize embeddings** to unit length for cosine similarity
2. **Cache frequently accessed embeddings** and schema information
3. **Use connection pooling** for database and vector store connections
4. **Implement retry logic** with exponential backoff for API calls
5. **Log query performance** to identify bottlenecks
6. **Monitor agent failures** and implement fallback strategies
7. **Version your embeddings** when changing embedding models
8. **Test with diverse queries** to ensure robustness
9. **Implement rate limiting** to prevent abuse
10. **Keep chunks small enough** for LLM context windows

## When to Use This Skill

- Building multi-agent RAG systems
- Implementing vector search with PostgreSQL/pgvector
- Integrating knowledge graphs with RAG
- Optimizing document retrieval pipelines
- Debugging agent orchestration issues
- Improving RAG system performance
- Testing RAG components
- Monitoring RAG system health
