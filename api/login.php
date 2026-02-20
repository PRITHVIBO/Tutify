<?php

/**
 * Tutify Login API
 * Handles user authentication
 */

require_once 'db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get JSON input
$data = getJsonInput();

// Validate required fields
if (empty($data->email) || empty($data->password)) {
    sendError('Email and password are required');
}

// Validate email format
if (!isValidEmail($data->email)) {
    sendError('Invalid email format');
}

// Connect to database
$conn = getDbConnection();

// Sanitize input
$email = sanitize($conn, $data->email);

// Prepare SQL statement to prevent SQL injection
$stmt = $conn->prepare("SELECT id, name, email, password, role, phone FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendError('Invalid email or password');
}

$user = $result->fetch_assoc();

// Verify password
if (!verifyPassword($data->password, $user['password'])) {
    $stmt->close();
    $conn->close();
    sendError('Invalid email or password');
}

// Remove password from response
unset($user['password']);

// If user is a tutor, get tutor profile
if ($user['role'] === 'tutor') {
    $stmt = $conn->prepare("SELECT subjects, bio, experience, hourly_rate, rating, total_sessions FROM tutor_profiles WHERE user_id = ?");
    $stmt->bind_param("i", $user['id']);
    $stmt->execute();
    $tutorResult = $stmt->get_result();

    if ($tutorResult->num_rows > 0) {
        $tutorProfile = $tutorResult->fetch_assoc();
        $user['subjects'] = explode(',', $tutorProfile['subjects']);
        $user['bio'] = $tutorProfile['bio'];
        $user['experience'] = intval($tutorProfile['experience']);
        $user['hourly_rate'] = floatval($tutorProfile['hourly_rate']);
        $user['rating'] = floatval($tutorProfile['rating']);
        $user['total_sessions'] = intval($tutorProfile['total_sessions']);
    }
}

$stmt->close();
$conn->close();

// Send success response with user data
sendSuccess([
    'message' => 'Login successful',
    'user' => $user
]);
