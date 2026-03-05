# F002 Task Breakdown: Order-Inventory Integration

**Total tasks**: 1


---


## F002-T01: Implement Order-Inventory Sync and Validation

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: critical


### Description
**Database:**
Modify existing order processing logic to interact with the `inventory_items` table.

**Backend API:**
POST /api/orders: Update logic to check `inventory_items.quantity` before processing and decrement on success.

**Frontend UI:**
Order Form: Add error notification display for insufficient stock scenarios.

**Details:**
Integrate the inventory system into the order creation pipeline by adding a backend validation step that checks if requested items have sufficient stock in the `inventory_items` table. If stock is insufficient, the API must return an error message to be displayed on the frontend; otherwise, the system should decrement the item quantity upon order completion to reflect the sale accurately in the inventory list.


### Acceptance Criteria

- API: Order creation is blocked if requested quantity exceeds available stock.

- API: Returns a specific 'stock not enough' error message when validation fails.

- DB: Inventory item quantity is correctly decremented by the exact amount ordered.

- UI: The order form displays a clear warning or toast notification if the stock check fails.

- API: The deduction occurs automatically upon successful order placement (paid/shipped).
