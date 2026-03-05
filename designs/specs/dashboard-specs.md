# Dashboard Design Specifications

**Task ID:** 9b592597
**Project:** Simple Order Management Application
**Component:** Dashboard Screen
**Version:** 1.0
**Last Updated:** 2026-03-05

---

## Overview

This document defines the design specifications for the Order Management Dashboard, including color schemes, typography, component layouts, and responsive behavior across desktop, tablet, and mobile viewports.

---

## Color Scheme

### Status Colors

Status colors are used consistently across badges, chart segments, and status indicators throughout the application.

| Status | Primary Color | Background (Badge) | Text (Badge) | Chart Segment |
|--------|---------------|-------------------|--------------|---------------|
| **Pending** | `#3b82f6` (Blue 500) | `#dbeafe` (Blue 100) | `#1e40af` (Blue 800) | `#3b82f6` |
| **Processing** | `#f59e0b` (Amber 500) | `#fef3c7` (Amber 100) | `#92400e` (Amber 800) | `#f59e0b` |
| **Shipped** | `#10b981` (Emerald 500) | `#d1fae5` (Emerald 100) | `#065f46` (Emerald 800) | `#10b981` |
| **Delivered** | `#8b5cf6` (Violet 500) | `#e9d5ff` (Violet 100) | `#6b21a8` (Violet 800) | `#8b5cf6` |
| **Cancelled** | `#ef4444` (Red 500) | `#fee2e2` (Red 100) | `#991b1b` (Red 800) | `#ef4444` |

### Stat Card Gradients

Each stat card uses a unique gradient background for visual differentiation:

| Card Type | Gradient | CSS |
|-----------|----------|-----|
| **Total Orders** | Purple to Violet | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` |
| **Orders Today** | Blue to Cyan | `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)` |
| **Total Revenue** | Pink to Red | `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)` |
| **Revenue Today** | Green to Teal | `linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)` |

### UI Colors

| Element | Color | Hex Code |
|---------|-------|----------|
| Background | Light Gray | `#f5f7fa` |
| Surface (Cards) | White | `#ffffff` |
| Border | Gray 200 | `#e5e7eb` |
| Primary Text | Gray 900 | `#1a1a1a` |
| Secondary Text | Gray 500 | `#6b7280` |
| Link/Interactive | Blue 500 | `#3b82f6` |
| Link Hover | Blue 600 | `#2563eb` |

---

## Typography

### Font Family
- **Primary:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif`

### Desktop Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 32px | 600 | `#1a1a1a` |
| Section Title | 20px | 600 | `#1a1a1a` |
| Stat Card Value | 36px | 700 | `#ffffff` |
| Stat Card Label | 14px | 500 | `#ffffff` (90% opacity) |
| Body Text | 14-16px | 400 | `#374151` |
| Secondary Text | 13-14px | 400 | `#6b7280` |

### Mobile Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 24px | 600 | `#1a1a1a` |
| Section Title | 16px | 600 | `#1a1a1a` |
| Stat Card Value | 24px | 700 | `#ffffff` |
| Stat Card Label | 11px | 500 | `#ffffff` (90% opacity) |
| Body Text | 14px | 400 | `#374151` |

---

## Component Specifications

### 1. Stat Cards

#### Desktop & Tablet
- **Dimensions:** Flexible width (1/4 of container), min-height: 140px
- **Padding:** 24px
- **Border Radius:** 12px
- **Shadow:** `0 4px 12px rgba(102, 126, 234, 0.2)`
- **Hover Effect:** `translateY(-4px)`, increased shadow

#### Mobile
- **Dimensions:** Flexible width (1/2 of container), min-height: 120px
- **Padding:** 16px
- **Border Radius:** 12px
- **Shadow:** `0 2px 8px rgba(102, 126, 234, 0.2)`

#### Icon Placement
- **Position:** Top-right corner
- **Size:** 48x48px (desktop/tablet), 32x32px (mobile)
- **Background:** `rgba(255, 255, 255, 0.2)`
- **Border Radius:** 12px
- **Alignment:** Centered within background

#### Content Layout
```
┌─────────────────────────┐
│ LABEL          [ICON]   │
│                         │
│ VALUE (Large)           │
│ Change/Subtext          │
└─────────────────────────┘
```

#### Recommended Icons
- **Total Orders:** Package/Box icon (e.g., Lucide `Package`, Heroicons `cube`)
- **Orders Today:** Clock/Calendar icon (e.g., Lucide `Clock`, Heroicons `clock`)
- **Total Revenue:** Currency/Dollar icon (e.g., Lucide `DollarSign`, Heroicons `currency-dollar`)
- **Revenue Today:** Trending Up icon (e.g., Lucide `TrendingUp`, Heroicons `trending-up`)

---

### 2. Status Breakdown Section

#### Desktop Layout
- **Chart Type:** Donut Chart
- **Chart Dimensions:** 220x220px
- **Inner Radius:** 70px (140px inner circle)
- **Outer Radius:** 110px
- **Layout:** Chart on left, legend on right
- **Gap:** 32px between chart and legend

#### Tablet Layout
- **Chart Type:** None (grid layout only)
- **Grid:** 2 columns × variable rows
- **Gap:** 12px

#### Mobile Layout
- **Chart Type:** None (list layout only)
- **Layout:** Vertical stack
- **Gap:** 8px

#### Status Item Design
- **Padding:** 12-16px
- **Background:** `#f9fafb`
- **Border Radius:** 8px
- **Hover Background:** `#f3f4f6`

#### Status Dot
- **Size:** 12px (desktop), 10px (mobile)
- **Border Radius:** 50% (circle)
- **Colors:** Match status colors from table above

#### Content Structure
```
┌─────────────────────────────────┐
│ ● Status Name      Count   25%  │
└─────────────────────────────────┘
```

---

### 3. Recent Orders Section

#### Desktop/Tablet (Table Layout)
- **Table Style:** Full-width, bordered rows
- **Header Background:** `#f9fafb`
- **Border:** `1px solid #e5e7eb` (between rows)
- **Hover:** `background: #f9fafb`
- **Padding:** 16px (desktop), 14px (tablet)

**Columns:**
1. Order Number (clickable, blue)
2. Customer Name
3. Status (badge)
4. Items (desktop only)
5. Total Amount
6. Date/Time

#### Mobile (Card Layout)
- **Card Style:** Individual bordered cards
- **Border:** `1px solid #e5e7eb`
- **Border Radius:** 10px
- **Padding:** 14px
- **Gap:** 12px between cards

**Card Structure:**
```
┌─────────────────────────────────┐
│ ORDER-NUMBER     [STATUS BADGE] │
│ Customer Name                   │
│ 3 items • 2h ago    $127.50    │
└─────────────────────────────────┘
```

---

### 4. Status Badges

- **Padding:** 6px 12px (desktop), 4px 10px (mobile)
- **Border Radius:** 16px (pill shape)
- **Font Size:** 12px (desktop), 11px (mobile)
- **Font Weight:** 600
- **Text Transform:** Capitalize
- **Colors:** See Status Colors table

---

## Responsive Breakpoints

### Mobile: 320px - 767px

**Layout Changes:**
- Stat cards: 2×2 grid
- Status breakdown: Vertical list (no chart)
- Recent orders: Card-based layout
- All sections: Full width, stacked vertically
- Reduced padding: 16px container padding

**Key Adjustments:**
- Abbreviated text labels
- Smaller icons and fonts
- Touch-friendly tap targets (min 44×44px)
- Remove non-essential columns from data

### Tablet: 768px - 1023px

**Layout Changes:**
- Stat cards: 4 in single row
- Status breakdown: 2-column grid
- Recent orders: Table with condensed columns (remove "Items")
- Moderate padding: 24px container padding

**Key Adjustments:**
- Balanced between mobile and desktop
- Preserve table layouts where possible
- Adjust spacing for medium screens

### Desktop: 1024px+

**Layout Changes:**
- Stat cards: 4 in single row with generous spacing
- Status breakdown: Chart + legend side-by-side
- Quick stats section alongside status
- Recent orders: Full table with all columns
- Maximum content width: 1400px (centered)
- Container padding: 40px

**Key Adjustments:**
- Full feature set visible
- Hover interactions enabled
- Larger typography and spacing
- Donut chart visualization

---

## Interactive States

### Hover States

| Element | Effect |
|---------|--------|
| Stat Cards | `translateY(-4px)`, enhanced shadow |
| Status Items | Background: `#f3f4f6` |
| Table Rows | Background: `#f9fafb` |
| Order Number | Underline |
| Buttons | Darker background |

### Active/Focus States
- **Focus Ring:** 2px solid `#3b82f6`, 2px offset
- **Button Active:** Scale 0.98

### Loading States
- **Skeleton Screens:** Animated gradient pulse on `#f3f4f6` → `#e5e7eb`
- **Spinners:** Blue (`#3b82f6`), 24px diameter

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Status badges: High contrast between background and text

### Focus Indicators
- Visible focus ring on all interactive elements
- Skip navigation link for keyboard users

### Screen Readers
- Proper semantic HTML (`<table>`, `<header>`, `<section>`)
- ARIA labels for icons and interactive elements
- Status indicators include text alternatives

---

## Implementation Notes

### Technologies
- **Frontend Framework:** React with Vite
- **Styling:** Tailwind CSS or CSS-in-JS
- **Icons:** Lucide React, Heroicons, or React Icons
- **Charts:** Recharts, Chart.js, or D3.js for donut chart

### Performance
- Lazy load chart libraries
- Optimize images/icons (SVG preferred)
- Use CSS transforms for animations (GPU-accelerated)
- Implement virtualization for large tables

### Data Refresh
- Dashboard data should refresh every 30-60 seconds
- Show "Last updated" timestamp
- Loading indicators during refresh

---

## Design Assets

### Wireframes
- **Desktop:** `designs/wireframes/dashboard-desktop.html`
- **Mobile/Tablet:** `designs/wireframes/dashboard-mobile-tablet.html`

### Future Enhancements
- Dark mode support
- Customizable dashboard widgets
- Export data functionality
- Real-time updates via WebSocket

---

## Approval Status

- [x] Desktop wireframe approved
- [x] Mobile/tablet wireframe approved
- [x] Color scheme defined
- [x] Component specifications documented

**Approved by:** AgentsTeam AI SDLC Platform
**Date:** 2026-03-05
