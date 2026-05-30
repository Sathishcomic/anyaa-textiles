# Anyaa Textiles Billing Software — Master Copilot Prompt

**Project**: Anyaa Textiles Billing & Stock Management System  
**Current Phase**: React Frontend + Local JSON DB (db.json)  
**Future Phase**: Node.js/Express backend + SQLite migration  
**Deployment**: Single PC, no cloud, no hosting required  
**User**: Admin only (current); future: multi-role (Manager, Cashier, Staff)

---

## 1. Technology Stack

### Frontend
- **React** 18+ (CRA)
- **React Router** v6 (page-based routing)
- **Context API** (global state management)
- **Tailwind CSS** (styling)
- **Lucide React** (icons)
- **Modern JS** (ES6+, async/await, hooks)

### Backend (Future)
- **Node.js** + **Express.js** (RESTful API)
- **SQLite** (embedded database; no server required)
- **Prisma** or **better-sqlite3** (ORM/query layer)

### Why SQLite?
- Single-system, single-user deployment
- No external database server
- Zero hosting/cloud costs
- Fast local backups
- Easy portability (copy `.db` file)

---

## 2. Database Design (SQLite-Ready)

### Tables

```sql
-- Users (admin/login; roles added later)
users
  id (PK)
  username
  password_hash
  role (default 'admin')
  active

-- Products (master catalog)
products
  id (PK)
  sku (unique, indexed)
  name
  category
  base_price
  tax_rate (default 5%)
  created_at
  updated_at

-- Product Variants (color, size, design)
product_variants
  id (PK)
  product_id (FK)
  color
  size
  design_number (optional)
  sku_suffix (e.g., "C1S2")
  stock_quantity
  created_at

-- Customers
customers
  id (PK)
  name
  phone
  email
  gst_no (optional)
  address
  created_at

-- Bills (invoices)
bills
  id (PK)
  bill_number
  customer_id (FK)
  user_id (FK, future)
  subtotal
  tax_amount
  discount_flat (₹)
  discount_percent (%)
  total
  payment_status (draft/paid)
  bill_date
  created_at

-- Bill Items (line items)
bill_items
  id (PK)
  bill_id (FK)
  product_variant_id (FK)
  quantity
  unit_price
  line_total
  created_at

-- Settings (system config)
settings
  id (PK)
  business_name
  gst_no
  phone
  address
  currency (default INR)
  tax_default (default 5%)

-- Hidden Future Tables (code in place, UI hidden)
roles
  id (PK)
  name (admin, manager, cashier, staff)
  permissions (JSON array)

staff
  id (PK)
  user_id (FK)
  department
  salary
```

**Current State**: JSON (db.json) with this structure  
**Future**: Migrate to SQLite with Prisma migrations

---

## 3. Current Frontend Architecture

### Pages
- **Dashboard**: KPI summary, quick stats
- **Billing**: Invoice creation, variants, discounts, payment tracking
- **Stock Management**: Inventory, reorder alerts, manual/auto variants
- **Customers**: Contact list, history
- **Sales History**: Past bills, searchable
- **Reports**: Sales trends, stock aging (future)
- **Settings**: System config, tax rate, user prefs (future: user mgmt)

### Components
- **Layout**: Header, sidebar, auth check
- **Auth Context**: Login state, role detection (future)

### State Management
- **Context API** for global auth, settings, UI state
- **Local component state** for forms, filters, sorting, pagination

---

## 4. Current Active Module: Stock Management

### Key Features (Already Implemented in `StockManagement.js`)
- **Inventory Table**: SKU, product name, category, stock, price, status
- **Sorting & Filtering**: By name, SKU, category, status (In Stock/Low/Out)
- **CRUD Operations**: Add, edit, delete products
- **Stock Alerts**: Low Stock (⚠️), Out of Stock (🔴)
- **Search**: Real-time by name, SKU, category
- **Status Badges**: Color-coded (green/amber/red)
- **Modal Forms**: Add/Edit product with validation
- **Refresh Button**: Manual sync with backend

### Enhancement: Variant Management

**Current State**: Products have `stock` and `minStock`  
**Target State**: Variant-based inventory

#### Manual Variant Creation
- User creates variants explicitly
- Form: Product → Color → Size → Design Number (opt) → Stock Qty
- Generates `variant_sku` (e.g., `KU-101-RED-L`)

#### Auto Variant Creation
- Option: "Generate variants" from product attribute matrix
- User selects colors [Red, Blue, Green] × sizes [S, M, L]
- System creates 9 variants with unique SKUs
- Default stock = 0 (user updates)

#### Variant Display
- Master product shows **total stock** (sum of all variants)
- Expand row → see variant breakdown (color, size, stock, price)
- Edit variant individually or batch update

---

## 5. Billing Module Enhancements (Planned)

### Product Search & Selection
- **Search by Product Name**: Auto-complete as user types
- **Search by SKU**: Direct lookup
- **Search by Color**: Variant filtering
- **Search by Design Number**: Attribute-based search

### Variant Selection UI
- Product → Color dropdown
- Color → Size dropdown  
- Auto-populate price from variant master

### Pricing & Discounts
- **Price Auto-Fill**: From product master
- **Editable Price**: Override for deals (locked to audit trail, future)
- **Flat Discount**: ₹500 off total bill
- **Percentage Discount**: 10%, 15%, 20% quick buttons
- **Custom %**: User enters any percentage

### Invoice Features
- **WhatsApp Integration**: Generate & send bill via WhatsApp (future)
- **Print Invoice**: Formatted receipt (A4/thermal)
- **Draft Save**: Save bill as draft, reopen later
- **Stock Deduction**: Auto-reduce stock on bill confirm

### Invoice Template
```
┌─ ANYAA TEXTILES ─┐
Invoice #: BL-2025-0001
Date: 30-May-2026
Customer: [Name / Guest]
───────────────────
Item         | Qty | Price | Discount | Total
───────────────────
[variants]   | 2   | ₹500  | -₹50     | ₹950
───────────────────
Subtotal:           ₹950
Tax (5%):           ₹47.50
Discount (Flat):    -₹0
TOTAL:              ₹997.50
───────────────────
Payment: Cash / UPI / Draft
```

---

## 6. Discount System (Implementation-Ready)

### Discount Types
1. **Flat Discount** (₹ amount)
   - Applied to bill total
   - Database: `bills.discount_flat`
   
2. **Percentage Discount** (%)
   - Applied to subtotal before tax
   - Database: `bills.discount_percent`
   - Common buttons: 5%, 10%, 15%, 20%
   - Custom input: user enters any %

### Calculation Order (Tax-Inclusive Variants)
```
1. Subtotal = Σ(item_qty × item_price)
2. After Discount = Subtotal - (discount_flat) - (Subtotal × discount_percent / 100)
3. Tax = After Discount × tax_rate / 100
4. Total = After Discount + Tax
```

### UI Flow
- Billing page → "Discount" section
- Buttons: "5%", "10%", "15%", "20%", "Custom"
- Custom → modal with input field
- Live preview: "You save ₹XYZ"

---

## 7. Hidden Future-Ready Architecture

### Roles & Permissions (Code in place, UI hidden)

**Current**: Admin only  
**Future (without redesign)**:

```javascript
// In AuthContext, future-proofed:
const ROLES = {
  ADMIN: 'admin',       // Full access
  MANAGER: 'manager',   // View reports, approve discounts
  CASHIER: 'cashier',   // Billing, no stock edit
  STAFF: 'staff',       // Billing view only
};

const PERMISSIONS = {
  ADMIN: ['view_all', 'edit_all', 'delete_all', 'user_mgmt'],
  MANAGER: ['view_all', 'edit_sales', 'approve_discount'],
  CASHIER: ['view_billing', 'create_bill', 'view_stock'],
  STAFF: ['view_billing', 'view_stock'],
};
```

### Tables (SQLite, created but unused)
- `users` table: store username, password_hash, **role** field
- `roles` table: name, permissions (JSON)
- `staff` table: user_id, department, salary (future HR module)

### Activation (Future)
1. Create Admin user interface in Settings
2. Uncomment role checks in Context
3. Conditionally render UI components per role
4. No schema changes needed

---

## 8. Modules Overview

### Current (Visible)
- ✅ **Dashboard**: KPI cards, quick links
- ✅ **Billing**: Invoice CRUD (enhance with variants + discounts)
- ✅ **Stock Management**: Inventory table with variants (extend)
- ✅ **Customers**: CRM list (basic)
- ✅ **Sales History**: Past bills (query/filter)
- ✅ **Reports**: Charts & metrics (basic)
- ✅ **Settings**: System config, user prefs

### Hidden (Code-Ready, No UI)
- 🔒 **Staff Management**: User/role admin
- 🔒 **Role Management**: Permissions editor
- 🔒 **GST Configuration**: Tax rules per product
- 🔒 **Barcode**: QR/barcode generation & scanning
- 🔒 **Purchase Management**: Inbound inventory
- 🔒 **Supplier Management**: Vendor tracking

**Activation**: Uncomment conditional renders in App.js when ready.

---

## 9. Backend API Blueprint (Future Node.js/Express)

### Endpoints

**Authentication**
```
POST /api/auth/login
POST /api/auth/logout
```

**Products**
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

**Product Variants**
```
GET    /api/products/:id/variants
POST   /api/products/:id/variants
PATCH  /api/variants/:id
DELETE /api/variants/:id
```

**Bills**
```
GET    /api/bills
POST   /api/bills
PATCH  /api/bills/:id
DELETE /api/bills/:id
GET    /api/bills/:id/print
```

**Customers**
```
GET    /api/customers
POST   /api/customers
PATCH  /api/customers/:id
DELETE /api/customers/:id
```

**Reports**
```
GET    /api/reports/sales?from=&to=
GET    /api/reports/stock-aging
GET    /api/reports/top-products
```

**Settings**
```
GET    /api/settings
PATCH  /api/settings
```

### Response Format (JSON)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "errors": null
}
```

---

## 10. Code Standards & Practices

### React Components
- **Functional components** + hooks only
- **useCallback** for event handlers in tables (perf)
- **useMemo** for derived data (filtering, sorting)
- **useEffect** for side effects; include dependency array
- **Prop drilling minimized**: Use Context for global state

### Naming Conventions
- Components: PascalCase (e.g., `StockManagement.js`)
- Utilities: camelCase (e.g., `exportData.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `CATS`, `UNITS`)
- Exports: default for pages, named for utilities

### Styling
- Tailwind first; minimal custom CSS
- CSS variables for brand colors (root in `App.css`)
- Responsive: mobile-first (`sm:`, `lg:`, `xl:` breakpoints)
- Semantic class names: `.input-field`, `.btn-primary`, `.table-container`

### API Calls
- Centralized in `services/api.js`
- Mock/stub future endpoints (e.g., `addProduct` returns local state update)
- Error handling: try-catch, fallback UI messages
- Loading states: boolean flags per operation

### Validation
- Form level: required fields, type checks
- Database level: future (Prisma schema)
- Frontend feedback: inline error messages, toast notifications

---

## 11. Deployment (Single-PC, No Cloud)

### Current (Development)
```bash
npm install
npm start  # runs on localhost:3000 with db.json
```

### Future (SQLite Backend)
```bash
# Backend
npm install -g nodemon
npm install express sqlite3 prisma
npx prisma init
npx prisma migrate dev
node server.js

# Frontend
npm start  # connects to http://localhost:5000
```

### Production (Windows Single-PC)
1. Build React: `npm run build` → `build/` folder
2. Serve with Express static middleware
3. SQLite `.db` file on local machine (backup to USB)
4. **No need for internet**, no hosting costs
5. Can run on USB-connected PC or network share

---

## 12. Key Copilot Guidance

### When Coding Features
1. **Check data structure first**: Current db.json vs. future SQLite schema
2. **Minimize re-renders**: Use useMemo/useCallback for tables
3. **Modal & form UX**: Validation before submit, clear error messages
4. **Discount logic**: Ensure tax applied after discount (accountant-approved)
5. **Variant handling**: Product total = sum of variant stocks
6. **Future-proof**: Keep role checks in code; just hidden in UI

### When Reviewing/Refactoring
- Avoid prop drilling; suggest Context for global state
- Check Tailwind responsive classes; ensure mobile-friendly
- Verify API calls are in `services/api.js`, not inline
- Ensure loading states shown for async operations
- Look for missing error boundaries, null checks

### When Planning New Features
- Estimate db.json schema changes first
- Mock API responses before backend exists
- Keep UI modular; separate concerns
- Think about future multi-role impact
- Batch inventory updates; avoid N+1 queries (future backend)

---

## 13. Current Code Snapshot

### Files to Know
- `src/pages/StockManagement.js`: Full-featured inventory module ✅
- `src/pages/Billing.js`: Invoice creation (needs variant & discount enhancements)
- `src/pages/Dashboard.js`: KPI summary
- `src/pages/Customers.js`: Contact list
- `src/context/AuthContext.js`: Login & future role storage
- `src/services/api.js`: Mock API layer
- `src/utils/exportData.js`: Data export utilities
- `public/db.json`: Local database (will migrate to SQLite)

### Next Steps (Recommended Order)
1. **Enhance Billing**: Variant selection, discount UI, stock deduction
2. **Refine Stock Management**: Variant creation (manual & auto)
3. **Add Reports**: Sales trends, stock aging
4. **Backend Prep**: Node.js server scaffold, Prisma schema
5. **Migration**: db.json → SQLite
6. **Multi-role**: Uncomment role checks; add staff management UI

---

## Summary

This is a **single-PC billing & inventory system** for a textiles shop. Built in **React + Tailwind**, currently using **db.json**, future migration to **Node.js + SQLite**. Architecture is **future-proof** for multi-role and advanced features (barcode, GST, purchase mgmt) without redesign. **Zero cloud costs**, **full data control**, **easy backups**. Copilot should always keep this scope and structure in mind when suggesting features or refactorings.

---

**Last Updated**: May 30, 2026  
**Version**: 1.0 (Production-Ready Frontend + Backend Blueprint)
