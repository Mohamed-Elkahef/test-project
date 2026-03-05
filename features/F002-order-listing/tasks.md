# F002 Task Breakdown: Order Listing

**Total tasks**: 1


---


## F002-T01: Implement Order Listing

- **Role**: `fullstack_engineer`

- **Story Points**: 8

- **Priority**: high


### Description
**Database:**
Create 'orders' table with columns: id (PK, serial), order_number (unique, varchar), customer_name (varchar), customer_email (varchar), status (varchar, default 'pending'), total_amount (decimal 10,2), notes (text, nullable), created_by (FK to users.id), created_at (timestamp), updated_at (timestamp). Create 'order_items' table with columns: id (PK, serial), order_id (FK to orders.id), product_name (varchar), quantity (integer), unit_price (decimal 10,2), subtotal (decimal 10,2).

**Backend API:**
GET /api/orders - list all orders with pagination (page, per_page query params), optional filters by status and date range, returns orders with item count. GET /api/orders/{id} - get single order with all order items included.

**Frontend UI:**
Orders list page with a table/card layout showing order_number, customer_name, status (color-coded badge), total_amount, created_at, and item count. Filter bar with status dropdown and date range picker. Pagination controls. Click on an order row navigates to or opens order detail view showing full order info and line items.

**Details:**
Create the orders table with id, order_number, customer_name, customer_email, status, total_amount, notes, created_by (FK to users), created_at, and updated_at columns, plus an order_items table with id, order_id (FK), product_name, quantity, unit_price, and subtotal. Implement GET /api/orders with pagination support (page, per_page), optional status and date range filters, returning a list of orders with item counts. Implement GET /api/orders/{id} returning the full order with its line items. On the frontend, build an Orders list page displaying orders in a table with columns for order number, customer name, color-coded status badge, total amount, date, and item count. Add a filter bar with a status dropdown and date range inputs, plus pagination controls. Clicking an order row opens a detail view showing full order information and all line items.


### Acceptance Criteria

- DB: orders and order_items tables are created with correct foreign keys and constraints

- API: GET /api/orders returns paginated results with correct total count

- API: GET /api/orders supports filtering by status and date range

- API: GET /api/orders/{id} returns order with nested order_items array

- UI: Orders page displays a table with order number, customer, status badge, amount, and date

- UI: Pagination and filters work correctly to narrow down the order list
