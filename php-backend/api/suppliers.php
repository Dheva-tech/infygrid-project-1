<?php
/**
 * MediCare Medical Store Management System
 * Suppliers REST API Endpoint
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
        handleGetSuppliers($db);
        break;
    case 'POST':
        handleCreateSupplier($db, $inputData);
        break;
    case 'PUT':
        handleUpdateSupplier($db, $inputData);
        break;
    case 'DELETE':
        handleDeleteSupplier($db);
        break;
    default:
        sendJsonResponse(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

function handleGetSuppliers(PDO $db): void {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT s.*, COUNT(p.id) as product_count
                              FROM suppliers s
                              LEFT JOIN products p ON s.id = p.supplier_id
                              WHERE s.id = :id GROUP BY s.id LIMIT 1");
        $stmt->execute([':id' => (int)$_GET['id']]);
        $supplier = $stmt->fetch();
        if ($supplier) {
            sendJsonResponse(200, ['success' => true, 'data' => $supplier]);
        } else {
            sendJsonResponse(404, ['success' => false, 'message' => 'Supplier not found']);
        }
    }

    $sql = "SELECT s.*, COUNT(p.id) as product_count
            FROM suppliers s
            LEFT JOIN products p ON s.id = p.supplier_id
            GROUP BY s.id ORDER BY s.company_name ASC";
    $stmt = $db->query($sql);
    $suppliers = $stmt->fetchAll();

    sendJsonResponse(200, [
        'success' => true,
        'count' => count($suppliers),
        'data' => $suppliers
    ]);
}

function handleCreateSupplier(PDO $db, array $data): void {
    $errors = validateSupplierData($data);
    if (!empty($errors)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Validation error',
            'errors' => $errors
        ]);
    }

    $email = trim($data['email']);
    $chk = $db->prepare("SELECT id FROM suppliers WHERE email = :email LIMIT 1");
    $chk->execute([':email' => $email]);
    if ($chk->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'A supplier with this email already exists',
            'errors' => ['email' => 'Duplicate supplier email']
        ]);
    }

    $sql = "INSERT INTO suppliers (supplier_name, company_name, email, phone, gst_number, address, status)
            VALUES (:name, :comp, :email, :phone, :gst, :addr, :status)";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':name'   => trim($data['supplier_name']),
        ':comp'   => trim($data['company_name']),
        ':email'  => $email,
        ':phone'  => trim($data['phone']),
        ':gst'    => trim($data['gst_number'] ?? ''),
        ':addr'   => trim($data['address']),
        ':status' => $data['status'] ?? 'active'
    ]);

    sendJsonResponse(201, [
        'success' => true,
        'message' => 'Supplier registered successfully.',
        'supplier_id' => (int)$db->lastInsertId()
    ]);
}

function handleUpdateSupplier(PDO $db, array $data): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid supplier ID required']);
    }

    $errors = validateSupplierData($data);
    if (!empty($errors)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Validation error',
            'errors' => $errors
        ]);
    }

    $email = trim($data['email']);
    $chk = $db->prepare("SELECT id FROM suppliers WHERE email = :email AND id != :id LIMIT 1");
    $chk->execute([':email' => $email, ':id' => $id]);
    if ($chk->fetch()) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => 'Email already used by another supplier',
            'errors' => ['email' => 'Duplicate supplier email']
        ]);
    }

    $sql = "UPDATE suppliers SET
                supplier_name = :name,
                company_name = :comp,
                email = :email,
                phone = :phone,
                gst_number = :gst,
                address = :addr,
                status = :status
            WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id'     => $id,
        ':name'   => trim($data['supplier_name']),
        ':comp'   => trim($data['company_name']),
        ':email'  => $email,
        ':phone'  => trim($data['phone']),
        ':gst'    => trim($data['gst_number'] ?? ''),
        ':addr'   => trim($data['address']),
        ':status' => $data['status'] ?? 'active'
    ]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Supplier updated successfully.'
    ]);
}

function handleDeleteSupplier(PDO $db): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid supplier ID required']);
    }

    // Check if products reference this supplier
    $chk = $db->prepare("SELECT COUNT(*) as prod_count FROM products WHERE supplier_id = :id");
    $chk->execute([':id' => $id]);
    $count = (int)$chk->fetch()['prod_count'];

    if ($count > 0) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => "Cannot delete supplier because {$count} product(s) are supplied by this distributor. Change supplier for products first."
        ]);
    }

    $stmt = $db->prepare("DELETE FROM suppliers WHERE id = :id");
    $stmt->execute([':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Supplier deleted successfully.'
    ]);
}

function validateSupplierData(array $data): array {
    $errors = [];
    if (empty(trim($data['supplier_name'] ?? ''))) {
        $errors['supplier_name'] = 'Contact supplier name is required';
    }
    if (empty(trim($data['company_name'] ?? ''))) {
        $errors['company_name'] = 'Company name is required';
    }
    if (empty(trim($data['email'] ?? '')) || !filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Valid corporate email address is required';
    }
    if (empty(trim($data['phone'] ?? ''))) {
        $errors['phone'] = 'Contact phone number is required';
    }
    if (empty(trim($data['address'] ?? ''))) {
        $errors['address'] = 'Registered address is required';
    }
    return $errors;
}
