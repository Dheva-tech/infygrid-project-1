<?php
/**
 * MediCare Medical Store Management System
 * Products REST API Endpoint
 *
 * Handles: GET, POST, PUT, DELETE for Products
 */

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Support PUT / DELETE when passed via POST _method override or query string
if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

// Extract payload
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
        handleGetProducts($db);
        break;
    case 'POST':
        handleCreateProduct($db, $inputData);
        break;
    case 'PUT':
        handleUpdateProduct($db, $inputData);
        break;
    case 'DELETE':
        handleDeleteProduct($db);
        break;
    default:
        sendJsonResponse(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

/**
 * GET Handler - List or Single Product with Search, Filter, Sort
 */
function handleGetProducts(PDO $db): void {
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        $query = "SELECT p.*, c.category_name, s.supplier_name, s.company_name
                  FROM products p
                  LEFT JOIN categories c ON p.category_id = c.id
                  LEFT JOIN suppliers s ON p.supplier_id = s.id
                  WHERE p.id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch();

        if ($product) {
            $product['stock_status'] = getStockStatus($product['stock_quantity'], $product['reorder_level']);
            $product['expiry_status'] = getExpiryStatus($product['expiry_date']);
            sendJsonResponse(200, ['success' => true, 'data' => $product]);
        } else {
            sendJsonResponse(404, ['success' => false, 'message' => 'Product not found']);
        }
    }

    // List all with optional search & filter
    $sql = "SELECT p.*, c.category_name, s.supplier_name, s.company_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE 1=1";
    $params = [];

    // Search by product name, code, brand, batch
    if (!empty($_GET['search'])) {
        $search = '%' . trim($_GET['search']) . '%';
        $sql .= " AND (p.product_name LIKE :search OR p.product_code LIKE :search OR p.brand LIKE :search OR p.batch_number LIKE :search)";
        $params[':search'] = $search;
    }

    // Filter by Category
    if (!empty($_GET['category_id'])) {
        $sql .= " AND p.category_id = :category_id";
        $params[':category_id'] = (int)$_GET['category_id'];
    }

    // Filter by Supplier
    if (!empty($_GET['supplier_id'])) {
        $sql .= " AND p.supplier_id = :supplier_id";
        $params[':supplier_id'] = (int)$_GET['supplier_id'];
    }

    // Filter by Stock Status
    if (!empty($_GET['stock_status'])) {
        if ($_GET['stock_status'] === 'out_of_stock') {
            $sql .= " AND p.stock_quantity = 0";
        } elseif ($_GET['stock_status'] === 'low_stock') {
            $sql .= " AND p.stock_quantity > 0 AND p.stock_quantity <= p.reorder_level";
        } elseif ($_GET['stock_status'] === 'in_stock') {
            $sql .= " AND p.stock_quantity > p.reorder_level";
        }
    }

    // Filter by Expiry Status
    $today = date('Y-m-d');
    $thirtyDays = date('Y-m-d', strtotime('+30 days'));
    if (!empty($_GET['expiry_status'])) {
        if ($_GET['expiry_status'] === 'expired') {
            $sql .= " AND p.expiry_date < :today";
            $params[':today'] = $today;
        } elseif ($_GET['expiry_status'] === 'expiring_soon') {
            $sql .= " AND p.expiry_date >= :today AND p.expiry_date <= :thirtyDays";
            $params[':today'] = $today;
            $params[':thirtyDays'] = $thirtyDays;
        } elseif ($_GET['expiry_status'] === 'safe') {
            $sql .= " AND p.expiry_date > :thirtyDays";
            $params[':thirtyDays'] = $thirtyDays;
        }
    }

    // Sorting
    $sortBy = $_GET['sort_by'] ?? 'name_asc';
    switch ($sortBy) {
        case 'name_desc':
            $sql .= " ORDER BY p.product_name DESC";
            break;
        case 'price_low':
            $sql .= " ORDER BY p.selling_price ASC";
            break;
        case 'price_high':
            $sql .= " ORDER BY p.selling_price DESC";
            break;
        case 'stock_low':
            $sql .= " ORDER BY p.stock_quantity ASC";
            break;
        case 'stock_high':
            $sql .= " ORDER BY p.stock_quantity DESC";
            break;
        case 'expiry_asc':
            $sql .= " ORDER BY p.expiry_date ASC";
            break;
        case 'id_desc':
            $sql .= " ORDER BY p.id DESC";
            break;
        case 'name_asc':
        default:
            $sql .= " ORDER BY p.product_name ASC";
            break;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();

    foreach ($products as &$prod) {
        $prod['stock_status'] = getStockStatus($prod['stock_quantity'], $prod['reorder_level']);
        $prod['expiry_status'] = getExpiryStatus($prod['expiry_date']);
        $prod['days_to_expiry'] = (int)ceil((strtotime($prod['expiry_date']) - time()) / 86400);
    }

    sendJsonResponse(200, [
        'success' => true,
        'count' => count($products),
        'data' => $products
    ]);
}

/**
 * POST Handler - Create Product with Server-Side Validation
 */
function handleCreateProduct(PDO $db, array $data): void {
    $errors = validateProductData($db, $data);

    if (!empty($errors)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Validation failed. Please check form fields.',
            'errors' => $errors
        ]);
    }

    // Check duplicate product code
    $stmtCheck = $db->prepare("SELECT id FROM products WHERE product_code = :code LIMIT 1");
    $stmtCheck->execute([':code' => trim($data['product_code'])]);
    if ($stmtCheck->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'Product code already exists in inventory',
            'errors' => ['product_code' => 'Product code is already registered']
        ]);
    }

    $sql = "INSERT INTO products (
                product_code, product_name, category_id, supplier_id, brand,
                batch_number, manufacturing_date, expiry_date, purchase_price,
                selling_price, stock_quantity, reorder_level, unit, rack_number,
                description, status
            ) VALUES (
                :product_code, :product_name, :category_id, :supplier_id, :brand,
                :batch_number, :manufacturing_date, :expiry_date, :purchase_price,
                :selling_price, :stock_quantity, :reorder_level, :unit, :rack_number,
                :description, :status
            )";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':product_code'       => trim($data['product_code']),
        ':product_name'       => trim($data['product_name']),
        ':category_id'        => (int)$data['category_id'],
        ':supplier_id'        => (int)$data['supplier_id'],
        ':brand'              => trim($data['brand']),
        ':batch_number'       => trim($data['batch_number']),
        ':manufacturing_date' => $data['manufacturing_date'],
        ':expiry_date'        => $data['expiry_date'],
        ':purchase_price'     => (float)$data['purchase_price'],
        ':selling_price'      => (float)$data['selling_price'],
        ':stock_quantity'     => (int)$data['stock_quantity'],
        ':reorder_level'      => (int)($data['reorder_level'] ?? 10),
        ':unit'               => trim($data['unit'] ?? 'Unit'),
        ':rack_number'        => trim($data['rack_number'] ?? 'Rack A-1'),
        ':description'        => trim($data['description'] ?? ''),
        ':status'             => $data['status'] ?? 'active'
    ]);

    $newId = (int)$db->lastInsertId();

    sendJsonResponse(201, [
        'success' => true,
        'message' => 'Product added successfully.',
        'product_id' => $newId
    ]);
}

/**
 * PUT Handler - Update Product
 */
function handleUpdateProduct(PDO $db, array $data): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);

    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Invalid or missing product ID']);
    }

    // Verify existence
    $checkStmt = $db->prepare("SELECT id FROM products WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    if (!$checkStmt->fetch()) {
        sendJsonResponse(404, ['success' => false, 'message' => 'Product record not found']);
    }

    $errors = validateProductData($db, $data, $id);
    if (!empty($errors)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Validation failed. Please correct form fields.',
            'errors' => $errors
        ]);
    }

    // Check duplicate code on another record
    $stmtCode = $db->prepare("SELECT id FROM products WHERE product_code = :code AND id != :id LIMIT 1");
    $stmtCode->execute([':code' => trim($data['product_code']), ':id' => $id]);
    if ($stmtCode->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'Product code already in use by another product',
            'errors' => ['product_code' => 'Duplicate product code is not permitted']
        ]);
    }

    $sql = "UPDATE products SET
                product_code = :product_code,
                product_name = :product_name,
                category_id = :category_id,
                supplier_id = :supplier_id,
                brand = :brand,
                batch_number = :batch_number,
                manufacturing_date = :manufacturing_date,
                expiry_date = :expiry_date,
                purchase_price = :purchase_price,
                selling_price = :selling_price,
                stock_quantity = :stock_quantity,
                reorder_level = :reorder_level,
                unit = :unit,
                rack_number = :rack_number,
                description = :description,
                status = :status
            WHERE id = :id";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id'                 => $id,
        ':product_code'       => trim($data['product_code']),
        ':product_name'       => trim($data['product_name']),
        ':category_id'        => (int)$data['category_id'],
        ':supplier_id'        => (int)$data['supplier_id'],
        ':brand'              => trim($data['brand']),
        ':batch_number'       => trim($data['batch_number']),
        ':manufacturing_date' => $data['manufacturing_date'],
        ':expiry_date'        => $data['expiry_date'],
        ':purchase_price'     => (float)$data['purchase_price'],
        ':selling_price'      => (float)$data['selling_price'],
        ':stock_quantity'     => (int)$data['stock_quantity'],
        ':reorder_level'      => (int)($data['reorder_level'] ?? 10),
        ':unit'               => trim($data['unit'] ?? 'Unit'),
        ':rack_number'        => trim($data['rack_number'] ?? 'Rack A-1'),
        ':description'        => trim($data['description'] ?? ''),
        ':status'             => $data['status'] ?? 'active'
    ]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Product updated successfully.'
    ]);
}

/**
 * DELETE Handler - Remove Product
 */
function handleDeleteProduct(PDO $db): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid product ID is required']);
    }

    // Check if product exists
    $stmtFind = $db->prepare("SELECT product_name, product_code FROM products WHERE id = :id");
    $stmtFind->execute([':id' => $id]);
    $product = $stmtFind->fetch();

    if (!$product) {
        sendJsonResponse(404, ['success' => false, 'message' => 'Product not found']);
    }

    // Check if referenced in order_items
    $stmtOrderCheck = $db->prepare("SELECT COUNT(*) as item_count FROM order_items WHERE product_id = :id");
    $stmtOrderCheck->execute([':id' => $id]);
    $orderCount = (int)$stmtOrderCheck->fetch()['item_count'];

    if ($orderCount > 0) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => "Cannot delete '{$product['product_name']}' because it is linked to {$orderCount} order transaction(s). Mark status as inactive instead."
        ]);
    }

    $stmtDelete = $db->prepare("DELETE FROM products WHERE id = :id");
    $stmtDelete->execute([':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Product deleted successfully.'
    ]);
}

/**
 * Server-Side Validation Helper
 */
function validateProductData(PDO $db, array $data, int $currentId = 0): array {
    $errors = [];

    if (empty(trim($data['product_name'] ?? ''))) {
        $errors['product_name'] = 'Product name is required';
    }

    if (empty(trim($data['product_code'] ?? ''))) {
        $errors['product_code'] = 'Product code is required';
    }

    if (empty($data['category_id']) || (int)$data['category_id'] <= 0) {
        $errors['category_id'] = 'Valid category selection is required';
    } else {
        $catCheck = $db->prepare("SELECT id FROM categories WHERE id = :cid");
        $catCheck->execute([':cid' => (int)$data['category_id']]);
        if (!$catCheck->fetch()) {
            $errors['category_id'] = 'Selected category does not exist in database';
        }
    }

    if (empty($data['supplier_id']) || (int)$data['supplier_id'] <= 0) {
        $errors['supplier_id'] = 'Valid supplier selection is required';
    }

    if (empty(trim($data['brand'] ?? ''))) {
        $errors['brand'] = 'Brand name is required';
    }

    if (empty(trim($data['batch_number'] ?? ''))) {
        $errors['batch_number'] = 'Batch number is required';
    }

    if (empty($data['manufacturing_date'])) {
        $errors['manufacturing_date'] = 'Manufacturing date is required';
    }

    if (empty($data['expiry_date'])) {
        $errors['expiry_date'] = 'Expiry date is required';
    }

    if (!empty($data['manufacturing_date']) && !empty($data['expiry_date'])) {
        if (strtotime($data['expiry_date']) <= strtotime($data['manufacturing_date'])) {
            $errors['expiry_date'] = 'Expiry date must be later than manufacturing date';
        }
    }

    if (!isset($data['purchase_price']) || !is_numeric($data['purchase_price']) || (float)$data['purchase_price'] < 0) {
        $errors['purchase_price'] = 'Purchase price must be a non-negative number';
    }

    if (!isset($data['selling_price']) || !is_numeric($data['selling_price']) || (float)$data['selling_price'] < 0) {
        $errors['selling_price'] = 'Selling price cannot be negative';
    }

    if (!isset($data['stock_quantity']) || !is_numeric($data['stock_quantity']) || (int)$data['stock_quantity'] < 0) {
        $errors['stock_quantity'] = 'Stock quantity cannot be negative';
    }

    if (isset($data['reorder_level']) && (!is_numeric($data['reorder_level']) || (int)$data['reorder_level'] < 0)) {
        $errors['reorder_level'] = 'Reorder level cannot be negative';
    }

    return $errors;
}

function getStockStatus(int $stock, int $reorderLevel): string {
    if ($stock == 0) return 'out_of_stock';
    if ($stock <= $reorderLevel) return 'low_stock';
    return 'in_stock';
}

function getExpiryStatus(string $expiryDate): string {
    $now = time();
    $exp = strtotime($expiryDate);
    $diffDays = ($exp - $now) / 86400;

    if ($diffDays < 0) return 'expired';
    if ($diffDays <= 30) return 'expiring_soon';
    return 'safe';
}
