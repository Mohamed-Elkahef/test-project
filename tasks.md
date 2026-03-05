# Task Breakdown

**Total tasks**: 6


---


## F001: User Authentication

*Registration and login system with JWT token-based authentication, allowing users to securely access the application.*


### F001-T01: Implement User Authentication

- **Role**: `fullstack_engineer`

- **Story Points**: 8

- **Priority**: critical

- **Description**: **Database:**
Create 'users' table with columns: id (PK, serial), email (unique, varchar), password_hash (varchar), full_name (varchar), is_active (boolean, default true), created_at (timestamp), updated_at (timestamp).

**Backend API:**
POST /api/auth/register - register new user with email, password, full_name. POST /api/auth/login - authenticate user and return JWT access token and refresh token. POST /api/auth/refresh - refresh expired access token. GET /api/auth/me - return current authenticated user profile. Implement JWT middleware to protect all other routes.

**Frontend UI:**
Login page with email/password form and link to register. Registration page with full_name, email, password, confirm password fields and validation. Auth context/provider to store JWT token and user state. Protected route wrapper that redirects unauthenticated users to login. Navbar showing logged-in user name with logout button.

**Details:**
Create the users table in PostgreSQL with id, email, password_hash, full_name, is_active, created_at, and updated_at columns. Implement four API endpoints: POST /api/auth/register for user registration with password hashing (bcrypt), POST /api/auth/login for authentication returning JWT access and refresh tokens, POST /api/auth/refresh for token renewal, and GET /api/auth/me for fetching the current user profile. Add JWT middleware to protect all non-auth routes. On the frontend, build a Login page and Registration page with form validation, an Auth context/provider that stores the JWT token and user info in localStorage, a ProtectedRoute wrapper component that redirects unauthenticated users to the login page, and a Navbar component displaying the logged-in user's name with a logout button.

- **Acceptance Criteria**:

  - DB: users table exists with email unique constraint and password_hash column

  - API: POST /api/auth/register creates a new user and returns user data without password

  - API: POST /api/auth/login returns a valid JWT token for correct credentials and 401 for invalid

  - API: All non-auth endpoints return 401 when no valid token is provided

  - UI: User can register, login, and is redirected to the main app on success

  - UI: Unauthenticated users are redirected to the login page


> **Dependency note**: F001 should complete before F002 starts if F002 depends on F001 output.


## F002: Order Listing

*View all orders in a filterable, sortable table showing order number, customer info, status, total amount, and date.*


### F002-T01: Implement Order Listing

- **Role**: `fullstack_engineer`

- **Story Points**: 8

- **Priority**: high

- **Description**: **Database:**
Create 'orders' table with columns: id (PK, serial), order_number (unique, varchar), customer_name (varchar), customer_email (varchar), status (varchar, default 'pending'), total_amount (decimal 10,2), notes (text, nullable), created_by (FK to users.id), created_at (timestamp), updated_at (timestamp). Create 'order_items' table with columns: id (PK, serial), order_id (FK to orders.id), product_name (varchar), quantity (integer), unit_price (decimal 10,2), subtotal (decimal 10,2).

**Backend API:**
GET /api/orders - list all orders with pagination (page, per_page query params), optional filters by status and date range, returns orders with item count. GET /api/orders/{id} - get single order with all order items included.

**Frontend UI:**
Orders list page with a table/card layout showing order_number, customer_name, status (color-coded badge), total_amount, created_at, and item count. Filter bar with status dropdown and date range picker. Pagination controls. Click on an order row navigates to or opens order detail view showing full order info and line items.

**Details:**
Create the orders table with id, order_number, customer_name, customer_email, status, total_amount, notes, created_by (FK to users), created_at, and updated_at columns, plus an order_items table with id, order_id (FK), product_name, quantity, unit_price, and subtotal. Implement GET /api/orders with pagination support (page, per_page), optional status and date range filters, returning a list of orders with item counts. Implement GET /api/orders/{id} returning the full order with its line items. On the frontend, build an Orders list page displaying orders in a table with columns for order number, customer name, color-coded status badge, total amount, date, and item count. Add a filter bar with a status dropdown and date range inputs, plus pagination controls. Clicking an order row opens a detail view showing full order information and all line items.

- **Acceptance Criteria**:

  - DB: orders and order_items tables are created with correct foreign keys and constraints

  - API: GET /api/orders returns paginated results with correct total count

  - API: GET /api/orders supports filtering by status and date range

  - API: GET /api/orders/{id} returns order with nested order_items array

  - UI: Orders page displays a table with order number, customer, status badge, amount, and date

  - UI: Pagination and filters work correctly to narrow down the order list


> **Dependency note**: F002 should complete before F003 starts if F003 depends on F002 output.


## F003: Order Creation

*Form to create new orders with customer details and dynamic line items including product name, quantity, and unit price.*


### F003-T01: Implement Order Creation

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: high

- **Description**: **Database:**
No new tables — uses existing orders and order_items tables. order_number should be auto-generated (e.g., ORD-YYYYMMDD-XXXX).

**Backend API:**
POST /api/orders - create a new order with customer_name, customer_email, notes, and an items array (each with product_name, quantity, unit_price). Server calculates subtotals and total_amount, auto-generates order_number, sets status to 'pending', and returns the created order with items.

**Frontend UI:**
Create Order page/modal with customer info fields (name, email, notes) and a dynamic line items section where users can add/remove rows with product_name, quantity, unit_price inputs. Auto-calculated subtotal per row and grand total displayed. Submit button with validation (at least one item required, quantities > 0). Success redirects to order detail or list.

**Details:**
Using the existing orders and order_items tables, implement POST /api/orders that accepts customer_name, customer_email, optional notes, and an items array where each item has product_name, quantity, and unit_price. The server auto-generates a unique order_number (e.g., ORD-20260305-0001), calculates each item's subtotal and the order total_amount, sets status to 'pending', and returns the full created order with items. On the frontend, build a Create Order page with customer info fields and a dynamic line items section where users can add or remove item rows. Each row shows product name, quantity, and unit price inputs with an auto-calculated subtotal. A running grand total is displayed. Form validation ensures at least one item exists and all quantities are greater than zero. On successful submission, the user is redirected to the order detail or list page.

- **Acceptance Criteria**:

  - DB: New order and associated order_items are inserted in a single transaction

  - API: POST /api/orders returns the created order with auto-generated order_number and calculated totals

  - API: Validation rejects orders with no items or invalid quantities

  - UI: User can add and remove line items dynamically with auto-calculated subtotals

  - UI: Grand total updates in real-time as items are added or modified

  - UI: Successful creation redirects to order detail with a success message


> **Dependency note**: F003 should complete before F004 starts if F004 depends on F003 output.


## F004: Order Status Management

*Allow users to update order status through defined transitions (pending → processing → shipped → delivered, or cancelled at any stage) with a status history log.*


### F004-T01: Implement Order Status Management

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: medium

- **Description**: **Database:**
Create 'order_status_history' table with columns: id (PK, serial), order_id (FK to orders.id), old_status (varchar), new_status (varchar), changed_by (FK to users.id), notes (text, nullable), created_at (timestamp). Add index on order_id for fast lookups.

**Backend API:**
PATCH /api/orders/{id}/status - update order status with new_status and optional notes. Server validates allowed transitions (pending→processing→shipped→delivered; any→cancelled), records history entry, updates orders.status and updated_at, returns updated order. GET /api/orders/{id}/history - return status change history for an order.

**Frontend UI:**
On the order detail view, add a status update section with a dropdown showing only valid next statuses and an optional notes field. Status change button triggers the update. Below it, display a timeline/log of all status changes showing old→new status, who changed it, when, and any notes.

**Details:**
Create an order_status_history table with id, order_id (FK), old_status, new_status, changed_by (FK to users), notes, and created_at to track all status transitions. Implement PATCH /api/orders/{id}/status that accepts new_status and optional notes, validates allowed transitions (pending→processing→shipped→delivered, and any status→cancelled), updates the order's status and updated_at, inserts a history record, and returns the updated order. Implement GET /api/orders/{id}/history to retrieve the full status change log. On the frontend order detail view, add a status management section with a dropdown restricted to valid next statuses, an optional notes input, and an update button. Below the controls, render a timeline showing each status change with old and new status, the user who made the change, timestamp, and any notes.

- **Acceptance Criteria**:

  - DB: order_status_history table tracks every status change with old/new status and user reference

  - API: PATCH /api/orders/{id}/status rejects invalid transitions with a 400 error

  - API: GET /api/orders/{id}/history returns chronological status change entries

  - UI: Status dropdown only shows valid next statuses for the current order status

  - UI: Status history timeline displays on the order detail page with all change details


> **Dependency note**: F004 should complete before F005 starts if F005 depends on F004 output.


## F005: Dashboard

*Summary dashboard showing order counts by status, recent orders, and key metrics like total revenue and orders today.*


### F005-T01: Implement Dashboard

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: medium

- **Description**: **Database:**
No new tables — uses aggregation queries on existing orders and order_items tables.

**Backend API:**
GET /api/dashboard/summary - returns total_orders, orders_today, total_revenue, revenue_today, orders_by_status (object with count per status), and recent_orders (last 5 orders with basic info).

**Frontend UI:**
Dashboard page as the default landing page after login. Top row of stat cards showing total orders, orders today, total revenue, and revenue today. A status breakdown section with colored cards or a bar/donut chart showing order counts per status (pending, processing, shipped, delivered, cancelled). A recent orders section listing the 5 most recent orders with quick links to their detail pages.

**Details:**
Using aggregation queries on the existing orders and order_items tables, implement GET /api/dashboard/summary that returns total_orders, orders_today, total_revenue, revenue_today, an orders_by_status object with counts for each status, and a recent_orders array with the 5 most recent orders. On the frontend, build a Dashboard page set as the default route after login. Display a top row of stat cards for total orders, orders today, total revenue, and revenue today. Add a status breakdown section with colored cards or a simple chart showing counts per status (pending, processing, shipped, delivered, cancelled). Include a recent orders section listing the 5 latest orders with order number, customer, status badge, amount, and a link to the detail page.

- **Acceptance Criteria**:

  - DB: Dashboard queries correctly aggregate order counts and revenue from the orders table

  - API: GET /api/dashboard/summary returns all required metrics with correct values

  - API: orders_by_status includes counts for all five statuses even when count is zero

  - UI: Dashboard displays stat cards with total orders, orders today, total revenue, revenue today

  - UI: Status breakdown visually differentiates each status with colors

  - UI: Recent orders section shows last 5 orders with links to detail view


### F005-T02: Design Dashboard screens

- **Role**: `uiux_designer`

- **Story Points**: 2

- **Priority**: medium

- **Description**: Create wireframes and design specs for the dashboard layout including stat card placement, status breakdown visualization (chart type selection and color coding), and recent orders section layout. Define responsive breakpoints for mobile, tablet, and desktop views.

- **Acceptance Criteria**:

  - Wireframe for dashboard desktop layout approved

  - Wireframe for dashboard mobile/tablet layout approved

  - Color scheme for status badges and chart segments defined

  - Stat card design with icon and number placement specified


---

## Task Dependency Graph

```

F001 (User Authentication) ──► F002

F002 (Order Listing) ──► F003

F003 (Order Creation) ──► F004

F004 (Order Status Management) ──► F005

F005 (Dashboard)

```
