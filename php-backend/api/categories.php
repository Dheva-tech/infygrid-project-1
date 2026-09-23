<?php
/**
 * MediCare Medical Store Management System
 * Categories REST API Endpoint
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
        handleGetCategories($db);
        break;
    case 'POST':
        handleCreateCategory($db, $inputData);
        break;
    case 'PUT':
        handleUpdateCategory($db, $inputData);
        break;
    case 'DELETE':
        handleDeleteCategory($db);
        break;
    default:
        sendJsonResponse(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

function handleGetCategories(PDO $db): void {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT c.*, COUNT(p.id) as product_count
                              FROM categories c
                              LEFT JOIN products p ON c.id = p.category_id
                              WHERE c.id = :id GROUP BY c.id LIMIT 1");
        $stmt->execute([':id' => (int)$_GET['id']]);
        $cat = $stmt->fetch();
        if ($cat) {
            sendJsonResponse(200, ['success' => true, 'data' => $cat]);
        } else {
            sendJsonResponse(404, ['success' => false, 'message' => 'Category not found']);
        }
    }

    $sql = "SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id ORDER BY c.category_name ASC";
    $stmt = $db->query($sql);
    $categories = $stmt->fetchAll();

    sendJsonResponse(200, [
        'success' => true,
        'count' => count($categories),
        'data' => $categories
    ]);
}

function handleCreateCategory(PDO $db, array $data): void {
    $name = trim($data['category_name'] ?? '');
    $desc = trim($data['description'] ?? '');
    $status = $data['status'] ?? 'active';

    if (empty($name)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Category name is required',
            'errors' => ['category_name' => 'Category name cannot be blank']
        ]);
    }

    // Check duplicate
    $chk = $db->prepare("SELECT id FROM categories WHERE category_name = :name LIMIT 1");
    $chk->execute([':name' => $name]);
    if ($chk->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'A category with this name already exists',
            'errors' => ['category_name' => 'Duplicate category name']
        ]);
    }

    $stmt = $db->prepare("INSERT INTO categories (category_name, description, status) VALUES (:name, :desc, :status)");
    $stmt->execute([':name' => $name, ':desc' => $desc, ':status' => $status]);

    sendJsonResponse(201, [
        'success' => true,
        'message' => 'Category added successfully.',
        'category_id' => (int)$db->lastInsertId()
    ]);
}

function handleUpdateCategory(PDO $db, array $data): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid category ID required']);
    }

    $name = trim($data['category_name'] ?? '');
    $desc = trim($data['description'] ?? '');
    $status = $data['status'] ?? 'active';

    if (empty($name)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Category name is required',
            'errors' => ['category_name' => 'Category name cannot be blank']
        ]);
    }

    // Check duplicate excluding self
    $chk = $db->prepare("SELECT id FROM categories WHERE category_name = :name AND id != :id LIMIT 1");
    $chk->execute([':name' => $name, ':id' => $id]);
    if ($chk->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'Category name already in use',
            'errors' => ['category_name' => 'Duplicate category name']
        ]);
    }

    $stmt = $db->prepare("UPDATE categories SET category_name = :name, description = :desc, status = :status WHERE id = :id");
    $stmt->execute([':name' => $name, ':desc' => $desc, ':status' => $status, ':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Category updated successfully.'
    ]);
}

function handleDeleteCategory(PDO $db): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid category ID required']);
    }

    // Check if products exist in category
    $chk = $db->prepare("SELECT COUNT(*) as prod_count FROM products WHERE category_id = :id");
    $chk->execute([':id' => $id]);
    $count = (int)$chk->fetch()['prod_count'];

    if ($count > 0) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => "Cannot delete category because {$count} medical product(s) are assigned to it. Reassign or delete products first."
        ]);
    }

    $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Category deleted successfully.'
    ]);
}
