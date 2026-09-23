# MediCare Medical Store Management System
## Viva & Technical Interview Defense Guide

This comprehensive guide is prepared specifically to help you ace the **Web Developer Internship Screening Viva**, project presentation, and technical code defense.

---

### Q1: Why did you choose PHP PDO over MySQLi or raw SQL?

**Answer:**
1. **Database Portability:** PDO provides a unified data-access interface that can connect to 12 different database drivers (MySQL, PostgreSQL, SQLite, Oracle) without rewriting application logic. MySQLi only works with MySQL.
2. **Named Parameters:** PDO supports intuitive named parameters like `:product_code` and `:category_id`, making complex SQL statements significantly cleaner, self-documenting, and less error-prone compared to positional `?` placeholders in MySQLi.
3. **Structured Object Fetching:** PDO supports flexible fetch modes (e.g. `PDO::FETCH_ASSOC`, `PDO::FETCH_OBJ`, `PDO::FETCH_CLASS`) directly into objects.
4. **Exception-Based Error Handling:** By setting `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`, all database anomalies throw catchable `PDOException` instances, enabling clean try-catch blocks and rollbacks.

---

### Q2: How did you protect this system against SQL Injection?

**Answer:**
We implemented parameterized prepared statements for 100% of queries that accept external user inputs.
- When using prepared statements, the SQL command structure is parsed and pre-compiled by the MySQL database engine **before** user values are injected.
- The input parameter values are treated strictly as literal data strings, never as executable SQL commands. Even if a malicious actor inputs `' OR '1'='1` or `; DROP TABLE products;`, the database will treat the input literally as a search string, making SQL Injection impossible.
- In addition, all string inputs are trimmed, sanitized, and typecast (e.g. `(int)$_GET['id']`).

---

### Q3: How is inventory concurrency handled when an order is submitted?

**Answer:**
In `php-backend/api/orders.php`, the entire order placement routine is executed inside a **Database Transaction**:
```php
$db->beginTransaction();
try {
    foreach ($items as $item) {
        // SELECT FOR UPDATE locks the product row against concurrent updates
        $stmt = $db->prepare("SELECT stock_quantity, expiry_date FROM products WHERE id = :id FOR UPDATE");
        ...
        // Decrement stock
        $updateStmt = $db->prepare("UPDATE products SET stock_quantity = stock_quantity - :qty WHERE id = :id");
    }
    $db->commit();
} catch (Exception $e) {
    $db->rollBack();
}
```
**Key benefits:**
1. **Row-Level Locking:** `FOR UPDATE` prevents another concurrent request from reading stale inventory counts.
2. **Atomicity (All-or-Nothing):** If any item in the order has insufficient stock or is expired, `rollBack()` is triggered, ensuring no orphaned order headers or partial stock deductions occur.

---

### Q4: How does the system prevent dispensing expired medical products?

**Answer:**
We enforce expiry safety at multiple application layers:
1. **Creation & Update Validation:** In both `validation.js` and `products.php`, the form requires that `expiry_date` must be strictly later than `manufacturing_date`.
2. **Order Placement Safeguard:** When submitting an order in `orders.php`, the backend checks:
   ```php
   if ($product['expiry_date'] < date('Y-m-d')) {
       $db->rollBack();
       sendJsonResponse(422, ['message' => 'Product has expired and cannot be dispensed.']);
   }
   ```
3. **Frontend Locking:** In the order creation modal, expired products are filtered out and cannot be selected. In the Expiry Tracker view, expired items are prominently badged with a **"Locked for Orders"** status.

---

### Q5: Why is both client-side and server-side validation necessary?

**Answer:**
- **Client-Side Validation (`js/validation.js`):** Provides instant, user-friendly feedback without network round-trips. It highlights invalid inputs, checks non-negative prices, verifies email regex, and informs the user before submission. However, client-side validation can easily be bypassed by disabling JavaScript or making direct cURL/Postman requests.
- **Server-Side Validation (`php-backend/api/`):** Acts as the authoritative source of truth. It verifies data types, re-checks database constraints (e.g., duplicate product codes, foreign key existence), validates expiry date relationships, and returns HTTP 422 with structured field error messages.

---

### Q6: How is 3rd Normal Form (3NF) achieved in your database schema?

**Answer:**
1. **1st Normal Form (1NF):** All tables have a Primary Key (`id`), each column contains atomic (indivisible) values, and there are no repeating groups. For example, order line items are normalized into `order_items` rather than comma-separated lists in `orders`.
2. **2nd Normal Form (2NF):** All tables are in 1NF and every non-key attribute is fully functionally dependent on the entire primary key (no partial dependencies).
3. **3rd Normal Form (3NF):** No transitive dependencies exist. For example, the `products` table does not store supplier phone numbers or category descriptions—it only stores `supplier_id` and `category_id` foreign keys. Changing a supplier's contact details in `suppliers` automatically updates all product views without data redundancy.

---

### Q7: What HTTP status codes does the API utilize and why?

**Answer:**
The system complies with RESTful conventions:
- **`200 OK`**: Successful GET request or successful PUT update.
- **`201 Created`**: Successful POST resource creation (returns new `product_id` or `order_id`).
- **`400 Bad Request`**: Malformed payload or missing required query parameter (e.g., missing product ID).
- **`404 Not Found`**: The requested ID does not exist in the database.
- **`405 Method Not Allowed`**: Request method is not supported on the endpoint (e.g., PATCH).
- **`409 Conflict`**: Duplicate unique constraint (e.g., duplicate product code or supplier email), or attempting to delete a category/supplier that has dependent products.
- **`422 Unprocessable Entity`**: Payload failed business validation rules (e.g., negative price, expiry earlier than manufacturing).
- **`500 Internal Server Error`**: Database connection failure or unhandled exception.

---

### Q8: How would this architecture scale for a multi-branch hospital or pharmacy chain?

**Answer:**
To scale this architecture from a single retail store to a multi-branch enterprise:
1. **Tenant/Branch Isolation:** Add a `branches` table and include `branch_id` in `products`, `orders`, and `inventory_batches`.
2. **Centralized Authentication & RBAC:** Implement JWT (JSON Web Tokens) with Role-Based Access Control (Admin, Pharmacist, Cashier, Inventory Manager).
3. **Batch-Specific Stock:** Convert the stock model to a dedicated `product_batches` table where each physical medicine batch has its own independent expiry date, purchase cost, and quantity.
4. **Caching & Redis:** Implement Redis for frequently queried category trees and high-speed product search autocompletion.
5. **Database Replication:** Utilize MySQL Master-Slave replication, directing write operations (orders, stock updates) to the Master node and read queries (catalog, reporting) to Read Replicas.
