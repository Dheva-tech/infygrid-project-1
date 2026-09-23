# MediCare Medical Store Management System

> **A Full-Stack Web-Based Medical Inventory, Product and Order Management System**

---

## 📌 Project Overview

**MediCare Medical Store Management System** is a production-ready, full-stack web application architected for retail pharmacies, healthcare clinics, and pharmaceutical distributors. Developed using a robust **LAMP (Linux/Apache/MySQL/PHP)** architecture with modern HTML5, CSS3, JavaScript (ES6+), and Bootstrap 5, the system streamlines medical inventory tracking, categorized drug indexing, supplier management, patient/customer records, and order billing workflows.

The system replaces manual pharmacy registers and vulnerable spreadsheets with a centralized relational database, enforcing strict validation, pharmaceutical expiry monitoring, automatic stock deduction, and transaction locking.

---

## 💻 Tech Stack & Architecture

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3 | Responsive clinical UI, data tables, modals, tab routing |
| **Icons & Typography** | Bootstrap Icons, System Segoe/Inter | Tabular numerals (`tabular-nums`) for currency and quantities |
| **Backend** | PHP 8.0+ | REST-style JSON API endpoints, routing, server validation |
| **Database Access** | PHP Data Objects (PDO) | Secure prepared statements with named parameters |
| **Database** | MySQL / MariaDB (InnoDB) | 3rd Normal Form (3NF), foreign keys, indexes, transactions |
| **Local Web Server** | XAMPP / WAMP / Laragon | Local Apache and MySQL execution environment |

---

## 🗄️ Database Design & Schema

The relational database `medicare_management` is designed in **3rd Normal Form (3NF)** on the InnoDB storage engine with UTF8mb4 character set. Foreign key constraints ensure referential integrity, and cascading behaviors prevent orphaned records.

```
       [CATEGORIES]                [SUPPLIERS]
            ▲                           ▲
            │ 1:N                       │ 1:N
            └───────────┬───────────────┘
                        │
                  [ PRODUCTS ]
                        ▲
                        │ 1:N
                        │
                 [ ORDER_ITEMS ]
                        │
                        │ N:1
                        ▼
                   [ ORDERS ]
                        │
                        │ N:1
                        ▼
                  [ CUSTOMERS ]
```

### Table Breakdown

1. **`categories`**: Stores medical categories (Pain Relief, Vitamins, First Aid, Health Devices, Personal Care, Baby Care, Elder Care).
2. **`suppliers`**: Stores wholesale distributors, company details, GSTIN, and direct representatives.
3. **`products`**: Master pharmaceutical inventory table containing unique product codes, brand, batch numbers, manufacturing date, expiry date, purchase price, selling price, real-time stock, reorder levels, unit types, and rack location coordinates.
4. **`customers`**: Registered patients and counter clients with full contact records and address.
5. **`orders`**: Master billing header with customer linkage, timestamp, total amount, payment method (Cash, UPI, Card, Net Banking), and status (Pending, Confirmed, Processing, Completed, Cancelled).
6. **`order_items`**: Line items per order capturing historical selling prices and quantities.
7. **`users`**: System administration and pharmacy staff authentication records with bcrypt password hashes.

---

## 🚀 Step-by-Step Local Setup Instructions (XAMPP / WAMP / Laragon)

Follow these steps to run the complete PHP & MySQL application on your local machine:

### Prerequisites
- **XAMPP** (or WAMP/Laragon) with **PHP 8.0+** and **MySQL/MariaDB**.

### Step 1: Start Apache and MySQL
1. Launch the **XAMPP Control Panel**.
2. Click **Start** for **Apache**.
3. Click **Start** for **MySQL**. Verify both show green status indicators.

### Step 2: Create Database in phpMyAdmin
1. Open your web browser and navigate to:
   ```
   http://localhost/phpmyadmin/
   ```
2. Click on **New** in the left sidebar.
3. Enter the Database name:
   ```
   medicare_management
   ```
4. Select Collation: `utf8mb4_unicode_ci` and click **Create**.

### Step 3: Import the SQL File
1. In phpMyAdmin, click on the newly created `medicare_management` database.
2. Click on the **Import** tab in the top navigation bar.
3. Click **Choose File** and select:
   ```
   database/medicare_management.sql
   ```
4. Click the **Import** (or **Go**) button at the bottom of the page.
5. You will see a success message: *"Import has been successfully finished. 7 tables created with seed records."*

### Step 4: Deploy Project Files
1. Copy the entire repository into your XAMPP web root directory:
   - **Windows:** `C:\xampp\htdocs\medicare_management\`
   - **Mac (XAMPP-VM):** `/Applications/XAMPP/xamppfiles/htdocs/medicare_management/`
   - **Linux:** `/opt/lampp/htdocs/medicare_management/`

### Step 5: Verify Database Connection Configuration
Open `php-backend/config/database.php` in a code editor and verify the MySQL credentials:
```php
private string $host = '127.0.0.1';
private string $db_name = 'medicare_management';
private string $username = 'root';
private string $password = ''; // Default in XAMPP is empty
```

### Step 6: Launch MediCare
Open your web browser and navigate to:
```
http://localhost/medicare_management/
```
The application will launch, detect the active PHP PDO backend, display a green connection badge, and load live inventory, suppliers, categories, and orders.

---

## 📡 RESTful API Documentation

All API endpoints reside under `php-backend/api/` and communicate exclusively via JSON payloads with standardized HTTP response status codes.

### 1. Products API (`/api/products.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products.php` | List all products with optional filters: `search`, `category_id`, `supplier_id`, `stock_status`, `expiry_status`, `sort_by` |
| `GET` | `/api/products.php?id={id}` | Retrieve single product record |
| `POST` | `/api/products.php` | Add new product (validates batch, dates, non-negative prices, uniqueness) |
| `PUT` | `/api/products.php?id={id}` | Update existing product |
| `DELETE`| `/api/products.php?id={id}` | Delete product (rejected if linked to historical order transactions) |

#### Example POST Payload:
```json
{
  "product_code": "MED-PR-010",
  "product_name": "Paracetamol 650mg Tablets",
  "category_id": 1,
  "supplier_id": 1,
  "brand": "Cipla",
  "batch_number": "BCH-2025-45",
  "manufacturing_date": "2025-01-10",
  "expiry_date": "2027-01-10",
  "purchase_price": 22.50,
  "selling_price": 35.00,
  "stock_quantity": 100,
  "reorder_level": 20,
  "unit": "Strip (10 Tablets)",
  "rack_number": "Rack A-1",
  "description": "Antipyretic and analgesic oral medication.",
  "status": "active"
}
```

---

### 2. Categories API (`/api/categories.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories.php` | List categories with product count |
| `POST` | `/api/categories.php` | Create category (unique name validation) |
| `PUT` | `/api/categories.php?id={id}` | Update category |
| `DELETE`| `/api/categories.php?id={id}` | Delete category (rejected if active products exist) |

---

### 3. Suppliers API (`/api/suppliers.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suppliers.php` | List suppliers with active product count |
| `POST` | `/api/suppliers.php` | Register supplier (validates email & phone uniqueness) |
| `PUT` | `/api/suppliers.php?id={id}` | Update supplier |
| `DELETE`| `/api/suppliers.php?id={id}` | Delete supplier (rejected if products assigned) |

---

### 4. Customers API (`/api/customers.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers.php` | List customers with order count & total expenditure |
| `POST` | `/api/customers.php` | Register customer |
| `PUT` | `/api/customers.php?id={id}` | Update customer profile |
| `DELETE`| `/api/customers.php?id={id}` | Delete customer (rejected if customer has orders) |

---

### 5. Orders API (`/api/orders.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders.php` | List all order bills with customer name & status |
| `GET` | `/api/orders.php?id={id}` | Retrieve complete order invoice with itemized line items |
| `POST` | `/api/orders.php` | **Atomic Order Placement:** Deducts stock, rejects expired drugs, calculates subtotals in a PDO transaction |
| `PUT` | `/api/orders.php?id={id}` | Update status (`Pending`, `Confirmed`, `Processing`, `Completed`, `Cancelled`) |

#### Example Order Placement Payload:
```json
{
  "customer_id": 1,
  "payment_method": "UPI",
  "delivery_address": "Flat 402, Sunshine Heights, Juhu, Mumbai",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 6, "quantity": 1 }
  ]
}
```

---

### 6. Dashboard Metrics API (`/api/dashboard.php`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard.php` | Aggregates 10 core metrics (Total Products, Categories, Suppliers, Customers, Orders, Pending, Completed, Low Stock, Today's Sales, Inventory Valuation) plus recent orders and low stock restock list |

---

## 🔒 Security & Medical Safety Features

1. **SQL Injection Prevention:** 100% of database interactions utilize PDO prepared statements with bound parameters (`:code`, `:id`).
2. **Atomic Financial Transactions:** Order placement uses `PDO::beginTransaction()`, `PDO::commit()`, and `PDO::rollBack()` to prevent race conditions or partial inventory deductions.
3. **Clinical Expiry Safeguard:** Expired products are automatically blocked from being dispensed in new orders.
4. **Referential Integrity Protection:** Products linked to past customer invoices cannot be hard-deleted, maintaining financial audit logs.
5. **Two-Tier Validation:** Client-side feedback in `js/validation.js` paired with server-side validation in PHP returning structured HTTP 422 errors.

---

## ⚖️ Academic Disclaimer

*This application is developed for academic and demonstration purposes. Product information shown in the demo is not medical advice. Consult a qualified healthcare professional for medical decisions.*
