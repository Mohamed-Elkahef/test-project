# Task Breakdown

**Total tasks**: 2


---


## F001: Inventory Management and Dashboard

*Establish a central system to track item quantities and SKUs, featuring a dashboard that flags items requiring restocking.*


### F001-T01: Implement Inventory Management and Dashboard

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: high

- **Description**: **Database:**
Table `inventory_items`: id (PK), name (string), sku (string, unique), quantity (integer, default 0).

**Backend API:**
GET /api/inventory: fetch all items; POST /api/inventory: create new item; PATCH /api/inventory/:id/stock: manually adjust stock levels.

**Frontend UI:**
Inventory Dashboard: A table listing items, SKUs, and quantities with a red 'Restock' badge for items <= 10; Adjustment Modal: A simple form to add/remove stock.

**Details:**
Develop the database schema to store inventory items with SKU and quantity tracking, and implement backend REST endpoints to handle CRUD operations and manual stock adjustments. Create a frontend dashboard that displays the inventory list with conditional logic to flag items below the fixed threshold of 10 units, ensuring users can manually update stock levels via an intuitive modal interface.

- **Acceptance Criteria**:

  - DB: `inventory_items` table exists with columns for name, sku, and quantity.

  - API: Endpoints for listing, creating, and updating stock return correct status codes and data.

  - UI: The dashboard visually flags any item with a quantity of 10 or less as 'Restock'.

  - UI: Users can manually increase or decrease stock levels through the UI.

  - API: Prevents duplicate SKUs from being created in the database.


> **Dependency note**: F001 should complete before F002 starts if F002 depends on F001 output.


## F002: Order-Inventory Integration

*Connects the order management flow to the inventory system to automate stock deduction and prevent overselling.*


### F002-T01: Implement Order-Inventory Sync and Validation

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: critical

- **Description**: **Database:**
Modify existing order processing logic to interact with the `inventory_items` table.

**Backend API:**
POST /api/orders: Update logic to check `inventory_items.quantity` before processing and decrement on success.

**Frontend UI:**
Order Form: Add error notification display for insufficient stock scenarios.

**Details:**
Integrate the inventory system into the order creation pipeline by adding a backend validation step that checks if requested items have sufficient stock in the `inventory_items` table. If stock is insufficient, the API must return an error message to be displayed on the frontend; otherwise, the system should decrement the item quantity upon order completion to reflect the sale accurately in the inventory list.

- **Acceptance Criteria**:

  - API: Order creation is blocked if requested quantity exceeds available stock.

  - API: Returns a specific 'stock not enough' error message when validation fails.

  - DB: Inventory item quantity is correctly decremented by the exact amount ordered.

  - UI: The order form displays a clear warning or toast notification if the stock check fails.

  - API: The deduction occurs automatically upon successful order placement (paid/shipped).


---

## Task Dependency Graph

```

F001 (Inventory Management and Dashboard) ──► F002

F002 (Order-Inventory Integration)

```
