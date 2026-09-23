<?php
/**
 * MediCare Medical Store Management System
 * Customers REST API Endpoint
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
        handleGetCustomers($db);
        break;
    case 'POST':
        handleCreateCustomer($db, $inputData);
        break;
    case 'PUT':
        handleUpdateCustomer($db, $inputData);
        break;
    case 'DELETE':
        handleDeleteCustomer($db);
        break;
    default:
        sendJsonResponse(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

function handleGetCustomers(PDO $db): void {
    if (isset($_GET['id'])) {
        $stmt = $db->prepare("SELECT c.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
                              FROM customers c
                              LEFT JOIN orders o ON c.id = o.customer_id
                              WHERE c.id = :id GROUP BY c.id LIMIT 1");
        $stmt->execute([':id' => (int)$_GET['id']]);
        $customer = $stmt->fetch();
        if ($customer) {
            sendJsonResponse(200, ['success' => true, 'data' => $customer]);
        } else {
            sendJsonResponse(404, ['success' => false, 'message' => 'Customer not found']);
        }
    }

    $sql = "SELECT c.*, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM customers c
            LEFT JOIN orders o ON c.id = o.customer_id
            GROUP BY c.id ORDER BY c.customer_name ASC";
    $stmt = $db->query($sql);
    $customers = $stmt->fetchAll();

    sendJsonResponse(200, [
        'success' => true,
        'count' => count($customers),
        'data' => $customers
    ]);
}

function handleCreateCustomer(PDO $db, array $data): void {
    $errors = validateCustomerData($data);
    if (!empty($errors)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Validation error',
            'errors' => $errors
        ]);
    }

    $sql = "INSERT INTO customers (customer_name, email, phone, date_of_birth, address, city, state, pincode)
            VALUES (:name, :email, :phone, :dob, :addr, :city, :state, :pincode)";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':name'    => trim($data['customer_name']),
        ':email'   => trim($data['email']),
        ':phone'   => trim($data['phone']),
        ':dob'     => !empty($data['date_of_birth']) ? $data['date_of_birth'] : null,
        ':addr'    => trim($data['address']),
        ':city'    => trim($data['city']),
        ':state'   => trim($data['state']),
        ':pincode' => trim($data['pincode'])
    ]);

    sendJsonResponse(201, [
        'success' => true,
        'message' => 'Customer added successfully.',
        'customer_id' => (int)$db->lastInsertId()
    ]);
}

function handleUpdateCustomer(PDO $db, array $data): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($data['id']) ? (int)$data['id'] : 0);
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid customer ID required']);
    }

    $errors = validateCustomerData($data);
    if (!empty($errors)) {
        sendJsonResponse(422, [
            'success' => false,
            'message' => 'Validation error',
            'errors' => $errors
        ]);
    }

    $sql = "UPDATE customers SET
                customer_name = :name,
                email = :email,
                phone = :phone,
                date_of_birth = :dob,
                address = :addr,
                city = :city,
                state = :state,
                pincode = :pincode
            WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':id'      => $id,
        ':name'    => trim($data['customer_name']),
        ':email'   => trim($data['email']),
        ':phone'   => trim($data['phone']),
        ':dob'     => !empty($data['date_of_birth']) ? $data['date_of_birth'] : null,
        ':addr'    => trim($data['address']),
        ':city'    => trim($data['city']),
        ':state'   => trim($data['state']),
        ':pincode' => trim($data['pincode'])
    ]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Customer updated successfully.'
    ]);
}

function handleDeleteCustomer(PDO $db): void {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        sendJsonResponse(400, ['success' => false, 'message' => 'Valid customer ID required']);
    }

    // Check if customer has orders
    $chk = $db->prepare("SELECT COUNT(*) as order_count FROM orders WHERE customer_id = :id");
    $chk->execute([':id' => $id]);
    $count = (int)$chk->fetch()['order_count'];

    if ($count > 0) {
        sendJsonResponse(409, [
            'success' => false,
            'message' => "Cannot delete customer because they have {$count} order(s) on record."
        ]);
    }

    $stmt = $db->prepare("DELETE FROM customers WHERE id = :id");
    $stmt->execute([':id' => $id]);

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Customer deleted successfully.'
    ]);
}

function validateCustomerData(array $data): array {
    $errors = [];
    if (empty(trim($data['customer_name'] ?? ''))) {
        $errors['customer_name'] = 'Customer name is required';
    }
    if (empty(trim($data['email'] ?? '')) || !filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Valid email address is required';
    }
    if (empty(trim($data['phone'] ?? ''))) {
        $errors['phone'] = 'Customer phone number is required';
    }
    if (empty(trim($data['address'] ?? ''))) {
        $errors['address'] = 'Street address is required';
    }
    if (empty(trim($data['city'] ?? ''))) {
        $errors['city'] = 'City is required';
    }
    if (empty(trim($data['state'] ?? ''))) {
        $errors['state'] = 'State is required';
    }
    if (empty(trim($data['pincode'] ?? ''))) {
        $errors['pincode'] = 'Postal pincode is required';
    }
    return $errors;
}
