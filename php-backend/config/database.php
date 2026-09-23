<?php
/**
 * MediCare Medical Store Management System
 * Database Configuration & Connection Class
 *
 * Uses PHP Data Objects (PDO) for secure, prepared SQL execution.
 */

// Global response helper functions
function sendJsonResponse(int $statusCode, array $data): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    exit;
}

class Database {
    private string $host = '127.0.0.1';
    private string $db_name = 'medicare_management';
    private string $username = 'root';
    private string $password = '';
    private ?PDO $conn = null;

    public function __construct(?string $host = null, ?string $db_name = null, ?string $username = null, ?string $password = null) {
        if ($host !== null) $this->host = $host;
        if ($db_name !== null) $this->db_name = $db_name;
        if ($username !== null) $this->username = $username;
        if ($password !== null) $this->password = $password;
    }

    /**
     * Get active PDO database connection
     */
    public function getConnection(): ?PDO {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            sendJsonResponse(500, [
                'success' => false,
                'message' => 'Database connection error. Please ensure MySQL is running in XAMPP/WAMP.',
                'error_code' => 'DB_CONNECTION_FAILED'
            ]);
        }

        return $this->conn;
    }
}
