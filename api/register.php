<?php

/**
 * Tutify Registration API
 * Handles new user registration
 */

require_once 'db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get input (JSON or form-encoded)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
    $data = getJsonInput();
} else {
    $data = (object)$_POST;
}

if (empty((array)$data)) {
    sendError('Invalid or empty input');
}

// Validate required fields
if (empty($data->name) || empty($data->email) || empty($data->password) || empty($data->role)) {
    sendError('Name, email, password, and role are required');
}

// Validate email format
if (!isValidEmail($data->email)) {
    sendError('Invalid email format');
}

// Validate role
if (!in_array($data->role, ['student', 'tutor'])) {
    sendError('Role must be either student or tutor');
}

// Validate password length
if (strlen($data->password) < 6) {
    sendError('Password must be at least 6 characters long');
}

// Connect to database
$conn = getDbConnection();

// Sanitize input
$name = sanitize($conn, $data->name);
$email = sanitize($conn, $data->email);
$role = sanitize($conn, $data->role);
$phone = !empty($data->phone) ? sanitize($conn, $data->phone) : null;

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    $conn->close();
    sendError('Email already registered');
}
$stmt->close();

// Hash password
$passwordHash = hashPassword($data->password);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $name, $email, $passwordHash, $role, $phone);

if (!$stmt->execute()) {
    $stmt->close();
    $conn->close();
    sendError('Registration failed. Please try again.');
}

$userId = $stmt->insert_id;
$stmt->close();

// If user is a tutor, create tutor profile
if ($role === 'tutor') {
    if (!empty($data->subjects) && is_string($data->subjects)) {
        $subjectsList = array_filter(array_map('trim', explode(',', $data->subjects)));
    } else {
        $subjectsList = !empty($data->subjects) && is_array($data->subjects) ? $data->subjects : [];
    }
    $subjects = !empty($subjectsList) ? implode(',', $subjectsList) : '';
    $bio = !empty($data->bio) ? sanitize($conn, $data->bio) : '';
    $experience = !empty($data->experience) ? intval($data->experience) : 0;
    $hourlyRate = !empty($data->hourlyRate) ? floatval($data->hourlyRate) : 0.00;

    $stmt = $conn->prepare("INSERT INTO tutor_profiles (user_id, subjects, bio, experience, hourly_rate) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issid", $userId, $subjects, $bio, $experience, $hourlyRate);
    $stmt->execute();
    $stmt->close();
}

$conn->close();

// Send success response
sendSuccess([
    'message' => 'Registration successful',
    'user' => [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'phone' => $phone
    ]
], 201);
