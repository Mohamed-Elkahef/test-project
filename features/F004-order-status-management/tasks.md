# F004 Task Breakdown: Order Status Management

**Total tasks**: 1


---


## F004-T01: Implement Order Status Management

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: medium


### Description
**Database:**
Create 'order_status_history' table with columns: id (PK, serial), order_id (FK to orders.id), old_status (varchar), new_status (varchar), changed_by (FK to users.id), notes (text, nullable), created_at (timestamp). Add index on order_id for fast lookups.

**Backend API:**
PATCH /api/orders/{id}/status - update order status with new_status and optional notes. Server validates allowed transitions (pending→processing→shipped→delivered; any→cancelled), records history entry, updates orders.status and updated_at, returns updated order. GET /api/orders/{id}/history - return status change history for an order.

**Frontend UI:**
On the order detail view, add a status update section with a dropdown showing only valid next statuses and an optional notes field. Status change button triggers the update. Below it, display a timeline/log of all status changes showing old→new status, who changed it, when, and any notes.

**Details:**
Create an order_status_history table with id, order_id (FK), old_status, new_status, changed_by (FK to users), notes, and created_at to track all status transitions. Implement PATCH /api/orders/{id}/status that accepts new_status and optional notes, validates allowed transitions (pending→processing→shipped→delivered, and any status→cancelled), updates the order's status and updated_at, inserts a history record, and returns the updated order. Implement GET /api/orders/{id}/history to retrieve the full status change log. On the frontend order detail view, add a status management section with a dropdown restricted to valid next statuses, an optional notes input, and an update button. Below the controls, render a timeline showing each status change with old and new status, the user who made the change, timestamp, and any notes.


### Acceptance Criteria

- DB: order_status_history table tracks every status change with old/new status and user reference

- API: PATCH /api/orders/{id}/status rejects invalid transitions with a 400 error

- API: GET /api/orders/{id}/history returns chronological status change entries

- UI: Status dropdown only shows valid next statuses for the current order status

- UI: Status history timeline displays on the order detail page with all change details
