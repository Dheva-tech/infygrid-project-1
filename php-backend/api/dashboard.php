<?php
/**
 * MediCare Medical Store Management System
 * Dashboard Statistics & Metrics REST API Endpoint
 */

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

try {
    // 1. Total Products
    $totalProducts = (int)$db->query("SELECT COUNT(*) FROM products")->fetchColumn();

    // 2. Total Categories
    $totalCategories = (int)$db->query("SELECT COUNT(*) FROM categories")->fetchColumn();

    // 3. Total Suppliers
    $totalSuppliers = (int)$db->query("SELECT COUNT(*) FROM suppliers")->fetchColumn();

    // 4. Total Customers
    $totalCustomers = (int)$db->query("SELECT COUNT(*) FROM customers")->fetchColumn();

    // 5. Total Orders
    $totalOrders = (int)$db->query("SELECT COUNT(*) FROM orders")->fetchColumn();

    // 6. Pending Orders
    $pendingOrders = (int)$db->query("SELECT COUNT(*) FROM orders WHERE order_status = 'Pending'")->fetchColumn();

    // 7. Completed Orders
    $completedOrders = (int)$db->query("SELECT COUNT(*) FROM orders WHERE order_status = 'Completed'")->fetchColumn();

    // 8. Low Stock Count (stock <= reorder_level)
    $lowStockCount = (int)$db->query("SELECT COUNT(*) FROM products WHERE stock_quantity <= reorder_level")->fetchColumn();

    // 9. Out of Stock Count
    $outOfStockCount = (int)$db->query("SELECT COUNT(*) FROM products WHERE stock_quantity = 0")->fetchColumn();

    // 10. Today's Sales
    $today = date('Y-m-d');
    $todaySalesStmt = $db->prepare("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(order_date) = :today AND order_status != 'Cancelled'");
    $todaySalesStmt->execute([':today' => $today]);
    $todaySales = (float)$todaySalesStmt->fetchColumn();

    // 11. Total Sales All-Time
    $totalSales = (float)$db->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status != 'Cancelled'")->fetchColumn();

    // 12. Total Inventory Value (SUM of stock_quantity * purchase_price)
    $totalInventoryValue = (float)$db->query("SELECT COALESCE(SUM(stock_quantity * purchase_price), 0) FROM products")->fetchColumn();

    // 13. Expiry Stats
    $thirtyDays = date('Y-m-d', strtotime('+30 days'));
    $expiredCount = (int)$db->query("SELECT COUNT(*) FROM products WHERE expiry_date < '{$today}'")->fetchColumn();
    $expiringSoonCount = (int)$db->query("SELECT COUNT(*) FROM products WHERE expiry_date >= '{$today}' AND expiry_date <= '{$thirtyDays}'")->fetchColumn();

    // 14. Recent Orders (5 latest)
    $recentOrdersSql = "SELECT o.id, o.order_date, o.total_amount, o.order_status, o.payment_method, c.customer_name
                        FROM orders o
                        JOIN customers c ON o.customer_id = c.id
                        ORDER BY o.order_date DESC LIMIT 6";
    $recentOrders = $db->query($recentOrdersSql)->fetchAll();

    // 15. Low Stock Products list
    $lowStockSql = "SELECT p.id, p.product_code, p.product_name, p.brand, p.stock_quantity, p.reorder_level, p.unit, c.category_name
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    WHERE p.stock_quantity <= p.reorder_level
                    ORDER BY p.stock_quantity ASC LIMIT 8";
    $lowStockProducts = $db->query($lowStockSql)->fetchAll();

    foreach ($lowStockProducts as &$item) {
        $item['status'] = ($item['stock_quantity'] == 0) ? 'Out of Stock' : 'Low Stock';
    }

    sendJsonResponse(200, [
        'success' => true,
        'data' => [
            'metrics' => [
                'total_products'        => $totalProducts,
                'total_categories'      => $totalCategories,
                'total_suppliers'       => $totalSuppliers,
                'total_customers'       => $totalCustomers,
                'total_orders'          => $totalOrders,
                'pending_orders'        => $pendingOrders,
                'completed_orders'      => $completedOrders,
                'low_stock_products'    => $lowStockCount,
                'out_of_stock_products' => $outOfStockCount,
                'today_sales'           => $todaySales,
                'total_sales'           => $totalSales,
                'total_inventory_value' => $totalInventoryValue,
                'expired_count'         => $expiredCount,
                'expiring_soon_count'   => $expiringSoonCount
            ],
            'recent_orders'      => $recentOrders,
            'low_stock_products' => $lowStockProducts
        ]
    ]);
} catch (Exception $e) {
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Failed to load dashboard metrics: ' . $e->getMessage()
    ]);
}
