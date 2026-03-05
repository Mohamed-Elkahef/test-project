# F001 Task Breakdown: Inventory Management and Dashboard

**Total tasks**: 1


---


## F001-T01: Implement Inventory Management and Dashboard

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: high


### Description
**Database:**
Table `inventory_items`: id (PK), name (string), sku (string, unique), quantity (integer, default 0).

**Backend API:**
GET /api/inventory: fetch all items; POST /api/inventory: create new item; PATCH /api/inventory/:id/stock: manually adjust stock levels.

**Frontend UI:**
Inventory Dashboard: A table listing items, SKUs, and quantities with a red 'Restock' badge for items <= 10; Adjustment Modal: A simple form to add/remove stock.

**Details:**
Develop the database schema to store inventory items with SKU and quantity tracking, and implement backend REST endpoints to handle CRUD operations and manual stock adjustments. Create a frontend dashboard that displays the inventory list with conditional logic to flag items below the fixed threshold of 10 units, ensuring users can manually update stock levels via an intuitive modal interface.


### Acceptance Criteria

- DB: `inventory_items` table exists with columns for name, sku, and quantity.

- API: Endpoints for listing, creating, and updating stock return correct status codes and data.

- UI: The dashboard visually flags any item with a quantity of 10 or less as 'Restock'.

- UI: Users can manually increase or decrease stock levels through the UI.

- API: Prevents duplicate SKUs from being created in the database.
