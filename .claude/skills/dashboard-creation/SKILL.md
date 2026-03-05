---
name: dashboard-creation
description: Design and implement interactive analytics dashboards with Chart.js, including data visualization selection, KPI design, user requirements gathering, and conversational dashboard builders
---

# Dashboard Creation Skill

This skill provides comprehensive guidance for building interactive analytics dashboards, from requirements gathering to implementation, with a focus on conversational dashboard builders and intelligent visualization selection.

## Core Capabilities

### 1. Requirements Gathering
- Conduct effective stakeholder interviews
- Extract dashboard requirements from conversations
- Identify key metrics and KPIs
- Determine data sources and refresh rates
- Define user personas and access levels

### 2. Visualization Selection
- Choose appropriate chart types for data
- Design KPI cards and metrics displays
- Create drill-down and filter strategies
- Balance information density
- Apply color theory and accessibility

### 3. Data Pipeline Design
- Design efficient SQL queries
- Implement data aggregation logic
- Handle real-time vs batch updates
- Optimize query performance
- Cache strategy for dashboard data

### 4. Interactive Features
- Implement filters and date selectors
- Create drill-down capabilities
- Add export functionality
- Enable cross-filtering between charts
- Support mobile responsiveness

## Dashboard Design Process

### Phase 1: Discovery

**Conversation Flow:**
```
Agent: "What business problem are we solving with this dashboard?"
User: "I need to track employee performance across departments"

Agent: "What specific metrics are most important to you?"
User: "Average salary by department, headcount trends, performance ratings"

Agent: "Who will be using this dashboard and how often?"
User: "Department managers will check it weekly"

Agent: "Do you need real-time data or daily updates?"
User: "Daily updates are sufficient"
```

**Capture Requirements:**
```python
requirements = {
    'objective': 'Track employee performance across departments',
    'primary_metrics': [
        'Average salary by department',
        'Headcount trends',
        'Performance ratings distribution'
    ],
    'users': ['Department managers'],
    'refresh_frequency': 'daily',
    'data_sources': ['HR database'],
    'filters_needed': ['Date range', 'Department', 'Job level']
}
```

### Phase 2: Data Source Identification

**Schema Discovery:**
```python
async def discover_relevant_tables(requirements: Dict[str, Any]) -> List[Table]:
    """Search metadata for relevant tables and columns."""

    # Extract keywords from requirements
    keywords = extract_keywords(requirements)
    # ['employee', 'salary', 'department', 'performance']

    # Search metadata
    relevant_tables = await search_metadata(keywords)

    return [
        {
            'table': 'employees',
            'columns': ['id', 'name', 'department_id', 'salary', 'hire_date'],
            'relevance_score': 0.95
        },
        {
            'table': 'departments',
            'columns': ['id', 'name', 'manager_id'],
            'relevance_score': 0.92
        },
        {
            'table': 'performance_reviews',
            'columns': ['employee_id', 'rating', 'review_date'],
            'relevance_score': 0.88
        }
    ]
```

**Present to User:**
```
Agent: "I found these relevant tables:
1. employees (name, department, salary, hire_date)
2. departments (name, manager)
3. performance_reviews (rating, review_date)

Does this cover what you need?"

User: "Yes, that looks good"
```

### Phase 3: Visualization Design

**Chart Type Selection Logic:**
```python
def select_visualization_type(
    metric: str,
    data_structure: Dict[str, Any]
) -> str:
    """
    Intelligently select chart type based on data characteristics.

    Rules:
    - Single value → KPI Card
    - Trends over time → Line Chart
    - Comparison across categories → Bar Chart
    - Part-to-whole → Pie/Doughnut Chart
    - Distribution → Histogram
    - Two variable relationship → Scatter Plot
    - Geographic data → Map
    """

    if data_structure['is_single_value']:
        return 'kpi_card'

    if data_structure['has_time_dimension']:
        if data_structure['category_count'] <= 5:
            return 'line_chart'
        else:
            return 'area_chart'

    if data_structure['is_comparison']:
        if data_structure['category_count'] <= 10:
            return 'bar_chart'
        else:
            return 'horizontal_bar_chart'

    if data_structure['is_part_of_whole']:
        if data_structure['category_count'] <= 6:
            return 'pie_chart'
        else:
            return 'treemap'

    if data_structure['is_distribution']:
        return 'histogram'

    if data_structure['has_two_measures']:
        return 'scatter_plot'

    return 'table'  # Default fallback
```

**Example Visualizations:**
```javascript
// KPI Card
{
  type: 'kpi',
  title: 'Total Employees',
  value: 1234,
  change: '+5.2%',
  trend: 'up',
  icon: 'users'
}

// Bar Chart - Department comparison
{
  type: 'bar',
  title: 'Average Salary by Department',
  data: {
    labels: ['Engineering', 'Sales', 'Marketing', 'HR'],
    datasets: [{
      label: 'Average Salary',
      data: [95000, 75000, 70000, 65000],
      backgroundColor: '#3B82F6'
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString()
        }
      }
    }
  }
}

// Line Chart - Trend over time
{
  type: 'line',
  title: 'Headcount Trend',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Total Employees',
      data: [1180, 1195, 1210, 1225, 1234, 1250],
      borderColor: '#10B981',
      tension: 0.4
    }]
  }
}

// Doughnut Chart - Distribution
{
  type: 'doughnut',
  title: 'Performance Rating Distribution',
  data: {
    labels: ['Exceeds Expectations', 'Meets Expectations', 'Needs Improvement'],
    datasets: [{
      data: [25, 65, 10],
      backgroundColor: ['#10B981', '#3B82F6', '#EF4444']
    }]
  }
}
```

### Phase 4: SQL Query Generation

**Query Building Strategy:**
```python
def generate_dashboard_query(
    metric: str,
    tables: List[str],
    filters: Dict[str, Any],
    aggregation: str
) -> str:
    """Generate optimized SQL query for dashboard metric."""

    # Example: Average salary by department
    if metric == 'average_salary_by_department':
        query = """
        SELECT
            d.name as department,
            AVG(e.salary) as avg_salary,
            COUNT(e.id) as employee_count
        FROM employees e
        JOIN departments d ON e.department_id = d.id
        WHERE e.status = 'active'
            AND e.hire_date >= $1  -- Date filter parameter
        GROUP BY d.id, d.name
        ORDER BY avg_salary DESC
        """

    # Example: Headcount trend
    elif metric == 'headcount_trend':
        query = """
        SELECT
            DATE_TRUNC('month', hire_date) as month,
            COUNT(*) OVER (ORDER BY DATE_TRUNC('month', hire_date)) as cumulative_count
        FROM employees
        WHERE hire_date >= $1 AND hire_date <= $2
        GROUP BY month
        ORDER BY month
        """

    return query
```

**Query Optimization:**
```python
def optimize_dashboard_query(query: str) -> str:
    """Apply optimization techniques for dashboard queries."""

    optimizations = [
        # Add indexes hint
        "Use indexes on: foreign keys, date columns, status fields",

        # Limit result set
        "Add TOP N or LIMIT for large datasets",

        # Use materialized views for complex aggregations
        "Consider materialized view for: multi-table joins with aggregations",

        # Partition large tables
        "Partition by date if table > 10M rows",

        # Use query result caching
        "Cache results for: static lookups, slow aggregations"
    ]

    return optimized_query
```

### Phase 5: Layout Configuration

**Dashboard Layout Grid:**
```python
dashboard_layout = {
    'grid': {
        'columns': 12,  # Bootstrap-style 12-column grid
        'row_height': 100,
        'breakpoints': {
            'lg': 1200,
            'md': 996,
            'sm': 768,
            'xs': 480
        }
    },
    'widgets': [
        {
            'id': 'total_employees',
            'type': 'kpi',
            'position': {'x': 0, 'y': 0, 'w': 3, 'h': 2}
        },
        {
            'id': 'avg_salary',
            'type': 'kpi',
            'position': {'x': 3, 'y': 0, 'w': 3, 'h': 2}
        },
        {
            'id': 'dept_comparison',
            'type': 'bar',
            'position': {'x': 0, 'y': 2, 'w': 6, 'h': 4}
        },
        {
            'id': 'headcount_trend',
            'type': 'line',
            'position': {'x': 6, 'y': 2, 'w': 6, 'h': 4}
        }
    ]
}
```

**Responsive Design Rules:**
```python
def apply_responsive_layout(
    widgets: List[Widget],
    screen_size: str
) -> List[Widget]:
    """Adjust layout for different screen sizes."""

    if screen_size == 'mobile':
        # Stack all widgets vertically
        for i, widget in enumerate(widgets):
            widget.position = {'x': 0, 'y': i * 4, 'w': 12, 'h': 4}

    elif screen_size == 'tablet':
        # 2 columns
        for i, widget in enumerate(widgets):
            row = i // 2
            col = i % 2
            widget.position = {'x': col * 6, 'y': row * 4, 'w': 6, 'h': 4}

    return widgets
```

## Chart.js Implementation

### KPI Card Component
```javascript
// components/KPICard.jsx
export function KPICard({ title, value, change, trend, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-title">{title}</span>
      </div>
      <div className="kpi-value">{value.toLocaleString()}</div>
      <div className={`kpi-change ${trend}`}>
        {trend === 'up' ? '↑' : '↓'} {change}
      </div>
    </div>
  )
}
```

### Bar Chart Component
```javascript
// components/BarChart.jsx
import { Bar } from 'react-chartjs-2'

export function BarChart({ title, data, options }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: title
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) label += ': '
            label += context.parsed.y.toLocaleString()
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="chart-container">
      <Bar data={data} options={{...defaultOptions, ...options}} />
    </div>
  )
}
```

### Line Chart with Time Series
```javascript
// components/LineChart.jsx
import { Line } from 'react-chartjs-2'

export function LineChart({ title, data, options }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  }

  return (
    <div className="chart-container">
      <Line data={data} options={{...defaultOptions, ...options}} />
    </div>
  )
}
```

### Dashboard with Filters
```javascript
// components/Dashboard.jsx
import { useState, useEffect } from 'react'

export function Dashboard({ dashboardId }) {
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    department: 'all'
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      const response = await fetch(`/api/dashboards/${dashboardId}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      })
      const result = await response.json()
      setData(result)
      setLoading(false)
    }

    fetchDashboardData()
  }, [dashboardId, filters])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div className="dashboard">
      <DashboardFilters filters={filters} onChange={setFilters} />

      <div className="dashboard-grid">
        {data.kpis.map(kpi => (
          <KPICard key={kpi.id} {...kpi} />
        ))}

        {data.charts.map(chart => (
          <ChartWidget key={chart.id} {...chart} />
        ))}
      </div>
    </div>
  )
}
```

## Conversational Dashboard Builder

### Agent-User Interaction Pattern
```python
class DashboardCreatorAgent:
    """Conversational agent for dashboard creation."""

    async def process_message(
        self,
        user_message: str,
        conversation_state: ConversationState
    ) -> AgentResponse:
        """Process user message and guide dashboard creation."""

        phase = conversation_state.phase

        if phase == 'discovery':
            return await self._discovery_phase(user_message, conversation_state)

        elif phase == 'data_source_identification':
            return await self._data_source_phase(user_message, conversation_state)

        elif phase == 'visualization_design':
            return await self._visualization_design_phase(user_message, conversation_state)

        elif phase == 'confirmation':
            return await self._confirmation_phase(user_message, conversation_state)

    async def _discovery_phase(
        self,
        message: str,
        state: ConversationState
    ) -> AgentResponse:
        """Gather requirements from user."""

        # Extract intent and entities
        intent = self.extract_intent(message)
        entities = self.extract_entities(message)

        # Update requirements
        state.requirements.update(entities)

        # Determine next question
        if not state.requirements.get('objective'):
            question = "What is the main goal of this dashboard?"
        elif not state.requirements.get('metrics'):
            question = "What specific metrics would you like to track?"
        elif not state.requirements.get('users'):
            question = "Who will be using this dashboard?"
        else:
            # Move to next phase
            state.phase = 'data_source_identification'
            question = "Let me search for relevant data sources..."

        return AgentResponse(
            message=question,
            phase=state.phase,
            confidence=0.85
        )
```

### Example Conversation Flow
```
User: "I need a dashboard to track sales performance"

Agent: "Great! To create an effective sales dashboard, I need to understand your requirements better. What specific metrics are most important to you?"

User: "Revenue by region, top products, and sales trend over time"

Agent: "Perfect! And who will be the primary users of this dashboard?"

User: "Sales managers and the executive team"

Agent: "Got it. How often do you need the data to be updated?"

User: "Real-time would be ideal"

Agent: "Understood. Let me search for relevant data sources in your database...

I found these tables:
- sales_transactions (transaction_date, amount, region, product_id)
- products (product_id, name, category)
- regions (region_id, name, country)

Does this look correct?"

User: "Yes, that's perfect"

Agent: "Excellent! Based on your requirements, I recommend:

1. **KPI Cards** at the top showing:
   - Total Revenue (this month)
   - Month-over-Month Growth
   - Top Selling Product

2. **Bar Chart**: Revenue by Region
3. **Line Chart**: Sales Trend (last 12 months)
4. **Table**: Top 10 Products by Revenue

Would you like me to proceed with this layout?"

User: "Yes, create it"

Agent: "Perfect! I'm creating your sales performance dashboard now..."
```

## Data Refresh Strategies

### Real-time Updates
```javascript
// Use WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:8000/dashboard/updates')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)

  // Update specific widget
  updateWidget(update.widget_id, update.data)
}
```

### Scheduled Refresh
```python
# Backend refresh job
async def refresh_dashboard_data(dashboard_id: str):
    """Refresh all dashboard data on schedule."""

    dashboard = await get_dashboard(dashboard_id)

    for widget in dashboard.widgets:
        # Execute widget query
        data = await execute_widget_query(widget.query, widget.filters)

        # Cache results
        await cache_widget_data(widget.id, data, ttl=3600)

        # Notify connected clients
        await notify_clients(dashboard_id, widget.id, data)
```

### Incremental Updates
```python
async def incremental_update(widget_id: str, last_update: datetime):
    """Update only changed data since last refresh."""

    query = f"""
    SELECT *
    FROM {widget.table}
    WHERE updated_at > $1
    """

    new_data = await db.fetch(query, last_update)

    return new_data
```

## Best Practices

### Dashboard Design
1. **Follow the 5-second rule**: Key insights should be visible within 5 seconds
2. **Use consistent color scheme**: 3-5 colors maximum
3. **Prioritize information**: Most important metrics at top-left
4. **Provide context**: Include comparisons (vs previous period, vs target)
5. **Enable drill-down**: Allow users to explore details
6. **Responsive design**: Ensure mobile compatibility

### Performance
1. **Cache aggressively**: Cache query results with appropriate TTL
2. **Limit data points**: Show last N records, provide pagination
3. **Use aggregation**: Pre-aggregate data at database level
4. **Lazy load**: Load charts on scroll or tab activation
5. **Debounce filters**: Wait for user to finish input before querying

### User Experience
1. **Loading states**: Show skeleton loaders or spinners
2. **Error handling**: Display user-friendly error messages
3. **Empty states**: Provide guidance when no data available
4. **Export functionality**: Allow CSV/PDF export
5. **Accessibility**: Ensure WCAG 2.1 AA compliance

## When to Use This Skill

- Building conversational dashboard creators
- Designing analytics dashboards
- Implementing Chart.js visualizations
- Gathering dashboard requirements from users
- Selecting appropriate chart types
- Optimizing dashboard query performance
- Creating responsive dashboard layouts
- Implementing real-time dashboard updates
