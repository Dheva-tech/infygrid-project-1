<?php
/**
 * MediCare Medical Store Management System
 * Orders REST API Endpoint
 *
 * Handles order creation with stock deduction, expiry prevention, and transaction integrity.
 */

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$inputData = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $inputData = $decoded;
    }
}
if (empty($inputData) && !empty($_POST)) {
    $inputData = $_POST;
}

switch ($method) {
    case 'GET':
        handleGetOrders($db);
        break;
    case 'POST':
        handleCreateOrder($db, $inputData);
        break;
    case 'PUT':
        handleUpdateOrder($db, $inputData);
        break;
    case 'DELETE':
        handleDeleteOrder($db);
        break;
    default:
        sendJsonResponse(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

function handleGetOrders(PDO $db): void {
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $stmt = $db->prepare("SELECT o.*, c.customer_name, c.email as customer_email, c.phone as customer_phone, c.city as customer_city
                              FROM orders o
                              JOIN customers c ON o.customer_id = c.id
                              WHERE o.id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $order = $stmt->fetch();

        if (!$order) {
            sendJsonResponse(404, ['success' => false, 'message' => 'Order not found']);
        }

        // Fetch line items
        $itemsStmt = $db->prepare("SELECT oi.*, p.product_code, p.product_name, p.brand, p.batch_number, p.unit
                                   FROM order_items oi
                                   JOIN products p ON oi.product_id = p.id
                                   WHERE oi.order_id = :order_id");
        $itemsStmt->execute([':order_id' => $id]);
        $order['items'] = $itemsStmt->fetchAll();

        sendJsonResponse(200, ['success' => true, 'data' => $order]);
    }

    $sql = "SELECT o.*, c.customer_name, c.phone as customer_phone, COUNT(oi.id) as item_count
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.order_date DESC";
    $stmt = $db->query($sql);
    $orders = $stmt->fetchAll();

    sendJsonResponse(200, [
        'success' => true,
        'count' => count($orders),
        'data' => $orders
    ]);
}

function handleCreateOrder(PDO $db, array $data): void {
    $customerId = (int)($data['customer_id'] ?? 0);
    $items = $data['items'] ?? [];
    $paymentMethod = $data['payment_method'] ?? 'Cash';
    $deliveryAddress = trim($data['delivery_address'] ?? '');

    if ($customerId <= 0) {
        sendJsonResponse(422, ['success' => false, 'message' => 'Customer selection is required']);
    }

    if (empty($items) || !is_array($items)) {
        sendJsonResponse(422, ['success' => false, 'message' => 'At least one order product item is required']);
    }

    if (empty($deliveryAddress)) {
        sendJsonResponse(422, ['success' => false, 'message' => 'Delivery address is required']);
    }

    // Verify Customer exists
    $custStmt = $db->prepare("SELECT id FROM customers WHERE id = :cid");
    $custStmt->execute([':cid' => $customerId]);
    if (!$custStmt->fetch()) {
        sendJsonResponse(404, ['success' => false, 'message' => 'Customer record not found']);
    }

    try {
        $db->beginTransaction();

        $totalAmount = 0.0;
        $processedItems = [];
        $today = date('Y-m-d');

        foreach ($items as $item) {
            $productId = (int)($item['product_id'] ?? 0);
            $qty = (int)($item['quantity'] ?? 0);

            if ($productId <= 0 || $qty <= 0) {
                $db->rollBack();
                sendJsonResponse(422, ['success' => false, 'message' => 'Invalid product or quantity specified']);
            }

            // Lock product row for update & verify stock and expiry
            $prodStmt = $db->prepare("SELECT id, product_name, product_code, selling_price, stock_quantity, expiry_date
                                      FROM products WHERE id = :pid FOR UPDATE");
            $prodStmt->execute([':pid' => $productId]);
            $product = $prodStmt->fetch();

            if (!$product) {
                $db->rollBack();
                sendJsonResponse(404, ['success' => false, 'message' => "Product ID #{$productId} not found"]);
            }

            // Reject expired products
            if ($product['expiry_date'] < $today) {
                $db->rollBack();
                sendJsonResponse(422, [
                    'success' => false,
                    'message' => "Product '{$product['product_name']}' ({$product['product_code']}) has EXPIRED on {$product['expiry_date']} and cannot be dispensed."
                ]);
            }

            // Check stock availability
            if ($product['stock_quantity'] < $qty) {
                $db->rollBack();
                sendJsonResponse(422, [
                    'success' => false,
                    'message' => "Insufficient stock for '{$product['product_name']}'. Requested: {$qty}, Available: {$product['stock_quantity']}."
                ]);
            }

            $unitPrice = (float)$product['selling_price'];
            $subtotal = $unitPrice * $qty;
            $totalAmount += $subtotal;

            $processedItems[] = [
                'product_id' => $productId,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
                'new_stock' => $product['stock_quantity'] - $qty
            ];
        }

        // Insert Master Order
        $orderSql = "INSERT INTO orders (customer_id, order_date, total_amount, payment_method, order_status, delivery_address)
                     VALUES (:cid, NOW(), :total, :pm, 'Confirmed', :addr)";
        $orderStmt = $db->prepare($orderSql);
        $orderStmt->execute([
            ':cid' => $customerId,
            ':total' => $totalAmount,
            ':pm' => $paymentMethod,
            ':addr' => $deliveryAddress
        ]);
        $orderId = (int)$db->lastInsertId();

        // Insert Items & Deduct Stock
        $itemSql = "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
                    VALUES (:oid, :pid, :qty, :price, :sub)";
        $itemStmt = $db->prepare($itemSql);

        $stockSql = "UPDATE products SET stock_quantity = :new_stock WHERE id = :pid";
        $stockStmt = $db->prepare($stockSql);

        foreach ($processedItems as $pItem) {
            $itemStmt->execute([
                ':oid' => $orderId,
                ':pid' => $pItem['product_id'],
                ':qty' => $pItem['quantity'],
                ':price' => $pItem['unit_price'],
                ':sub' => $pItem['subtotal']
            ]);

            $stockStmt->execute([
                ':new_stock' => $pItem['new_stock'],
                ':pid' => $pItem['product_id']
            ]);
        }

        $db->commit();

        sendJsonResponse(201, [
            'success' => true,
            'message' => "Order #{$orderId} created successfully.",
            'order_id' => $orderId,
            'total_amount' => $totalAmount
        ]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendJsonResponse(500, [
            'success' => false,
            'message' => 'An error occurred while creating order: ' . $e->getMessage()
        ]);
    }
}

function handleUpdateOrder(PDO $db, array $data): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    $status = $data['order_status'] ?? '';

    $validStatuses = ['Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'];
    if (!in_array($status, $validStatuses, true)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Invalid order status. Allowed: ' . implode(', ', $validStatuses)
        ]);
    }

    $stmt = $db->prepare("UPDATE orders SET order_status = :status WHERE id = :id");
    $stmt->execute([':status' => $status, ':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => "Order #{$id} status updated to '{$status}'."
    ]);
}

function handleDeleteOrder(PDO $db): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid order ID required']);
    }

    $stmt = $db->prepare("DELETE FROM orders WHERE id = :id");
    $stmt->execute([':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => "Order #{$id} deleted successfully."
    ]);
}
