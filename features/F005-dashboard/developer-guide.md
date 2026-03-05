# Developer Guide: F005 — Dashboard


## Overview

Summary dashboard showing order counts by status, recent orders, and key metrics like total revenue and orders today.


## Role Responsibilities


### `fullstack_engineer`

**Task**: Implement Dashboard


**Database:**
No new tables — uses aggregation queries on existing orders and order_items tables.

**Backend API:**
GET /api/dashboard/summary - returns total_orders, orders_today, total_revenue, revenue_today, orders_by_status (object with count per status), and recent_orders (last 5 orders with basic info).

**Frontend UI:**
Dashboard page as the default landing page after login. Top row of stat cards showing total orders, orders today, total revenue, and revenue today. A status breakdown section with colored cards or a bar/donut chart showing order counts per status (pending, processing, shipped, delivered, cancelled). A recent orders section listing the 5 most recent orders with quick links to their detail pages.

**Details:**
Using aggregation queries on the existing orders and order_items tables, implement GET /api/dashboard/summary that returns total_orders, orders_today, total_revenue, revenue_today, an orders_by_status object with counts for each status, and a recent_orders array with the 5 most recent orders. On the frontend, build a Dashboard page set as the default route after login. Display a top row of stat cards for total orders, orders today, total revenue, and revenue today. Add a status breakdown section with colored cards or a simple chart showing counts per status (pending, processing, shipped, delivered, cancelled). Include a recent orders section listing the 5 latest orders with order number, customer, status badge, amount, and a link to the detail page.


**Acceptance Criteria:**

- DB: Dashboard queries correctly aggregate order counts and revenue from the orders table

- API: GET /api/dashboard/summary returns all required metrics with correct values

- API: orders_by_status includes counts for all five statuses even when count is zero

- UI: Dashboard displays stat cards with total orders, orders today, total revenue, revenue today

- UI: Status breakdown visually differentiates each status with colors

- UI: Recent orders section shows last 5 orders with links to detail view


### `uiux_designer`

**Task**: Design Dashboard screens


Create wireframes and design specs for the dashboard layout including stat card placement, status breakdown visualization (chart type selection and color coding), and recent orders section layout. Define responsive breakpoints for mobile, tablet, and desktop views.


**Acceptance Criteria:**

- Wireframe for dashboard desktop layout approved

- Wireframe for dashboard mobile/tablet layout approved

- Color scheme for status badges and chart segments defined

- Stat card design with icon and number placement specified


## General Guidelines

- Read existing codebase before writing any new code

- Follow the project rules in `.claude/rules/`

- Use the appropriate agent definition from `.claude/agents/`

- Database and backend work should complete before frontend integration

- Write tests alongside implementation
