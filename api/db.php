<?php

/**
 * Tutify Database Connection
 * This file handles MySQL database connection configuration
 */

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'tutify');

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Create database connection
 * @return mysqli Database connection object
 */
function getDbConnection()
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    // Check connection
    if ($conn->connect_error) {
        sendError('Database connection failed: ' . $conn->connect_error, 500);
    }

    // Set charset to utf8mb4 for full unicode support
    $conn->set_charset('utf8mb4');

    return $conn;
}

/**
 * Send JSON success response
 * @param mixed $data - Data to send
 * @param int $code - HTTP status code
 */
function sendSuccess($data, $code = 200)
{
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit();
}

/**
 * Send JSON error response
 * @param string $message - Error message
 * @param int $code - HTTP status code
 */
function sendError($message, $code = 400)
{
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit();
}

/**
 * Get JSON input from request body
 * @return object Decoded JSON object
 */
function getJsonInput()
{
    $input = file_get_contents('php://input');
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON input', 400);
    }

    return $data;
}

/**
 * Sanitize string input
 * @param mysqli $conn - Database connection
 * @param string $input - Input to sanitize
 * @return string Sanitized input
 */
function sanitize($conn, $input)
{
    return $conn->real_escape_string(trim($input));
}

/**
 * Validate email format
 * @param string $email - Email to validate
 * @return bool True if valid
 */
function isValidEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Hash password securely
 * @param string $password - Plain password
 * @return string Hashed password
 */
function hashPassword($password)
{
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password against hash
 * @param string $password - Plain password
 * @param string $hash - Hashed password
 * @return bool True if password matches
 */
function verifyPassword($password, $hash)
{
    return password_verify($password, $hash);
}

/**
 * Generate random token
 * @param int $length - Token length
 * @return string Random token
 */
function generateToken($length = 32)
{
    return bin2hex(random_bytes($length));
}

/**
 * Initialize database with tables if they don't exist
 */
function initializeDatabase()
{
    $conn = getDbConnection();

    // Users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'tutor') NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $conn->query($sql);

    // Tutor profiles table
    $sql = "CREATE TABLE IF NOT EXISTS tutor_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subjects TEXT,
        bio TEXT,
        experience INT DEFAULT 0,
        hourly_rate DECIMAL(10, 2),
        rating DECIMAL(3, 2) DEFAULT 0.00,
        total_sessions INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $conn->query($sql);

    // Sessions table
    $sql = "CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        tutor_id INT NOT NULL,
        subject VARCHAR(100),
        topic VARCHAR(200),
        session_date DATE,
        session_time TIME,
        duration VARCHAR(20),
        status ENUM('pending', 'confirmed', 'completed', 'rejected') DEFAULT 'pending',
        student_message TEXT,
        tutor_notes TEXT,
        progress INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_tutor (tutor_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $conn->query($sql);

    // Feedback table
    $sql = "CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        student_id INT NOT NULL,
        tutor_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_session (session_id),
        INDEX idx_tutor (tutor_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

    $conn->query($sql);

    $conn->close();
}

// Initialize database on first load
// Uncomment the line below to create tables automatically
// initializeDatabase();
