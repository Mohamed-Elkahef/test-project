# F003 Task Breakdown: Order Creation

**Total tasks**: 1


---


## F003-T01: Implement Order Creation

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: high


### Description
**Database:**
No new tables — uses existing orders and order_items tables. order_number should be auto-generated (e.g., ORD-YYYYMMDD-XXXX).

**Backend API:**
POST /api/orders - create a new order with customer_name, customer_email, notes, and an items array (each with product_name, quantity, unit_price). Server calculates subtotals and total_amount, auto-generates order_number, sets status to 'pending', and returns the created order with items.

**Frontend UI:**
Create Order page/modal with customer info fields (name, email, notes) and a dynamic line items section where users can add/remove rows with product_name, quantity, unit_price inputs. Auto-calculated subtotal per row and grand total displayed. Submit button with validation (at least one item required, quantities > 0). Success redirects to order detail or list.

**Details:**
Using the existing orders and order_items tables, implement POST /api/orders that accepts customer_name, customer_email, optional notes, and an items array where each item has product_name, quantity, and unit_price. The server auto-generates a unique order_number (e.g., ORD-20260305-0001), calculates each item's subtotal and the order total_amount, sets status to 'pending', and returns the full created order with items. On the frontend, build a Create Order page with customer info fields and a dynamic line items section where users can add or remove item rows. Each row shows product name, quantity, and unit price inputs with an auto-calculated subtotal. A running grand total is displayed. Form validation ensures at least one item exists and all quantities are greater than zero. On successful submission, the user is redirected to the order detail or list page.


### Acceptance Criteria

- DB: New order and associated order_items are inserted in a single transaction

- API: POST /api/orders returns the created order with auto-generated order_number and calculated totals

- API: Validation rejects orders with no items or invalid quantities

- UI: User can add and remove line items dynamically with auto-calculated subtotals

- UI: Grand total updates in real-time as items are added or modified

- UI: Successful creation redirects to order detail with a success message
