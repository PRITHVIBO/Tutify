<?php

/**
 * Tutify Book Session API
 * Creates a new tutoring session booking
 */

require_once 'db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get JSON input
$data = getJsonInput();

// Validate required fields
if (
    empty($data->student_id) || empty($data->tutor_id) || empty($data->subject) ||
    empty($data->date) || empty($data->time) || empty($data->duration)
) {
    sendError('Student ID, tutor ID, subject, date, time, and duration are required');
}

// Connect to database
$conn = getDbConnection();

// Sanitize input
$studentId = intval($data->student_id);
$tutorId = intval($data->tutor_id);
$subject = sanitize($conn, $data->subject);
$topic = !empty($data->topic) ? sanitize($conn, $data->topic) : '';
$sessionDate = sanitize($conn, $data->date);
$sessionTime = sanitize($conn, $data->time);
$duration = sanitize($conn, $data->duration);
$message = !empty($data->message) ? sanitize($conn, $data->message) : '';

// Validate date format (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $sessionDate)) {
    $conn->close();
    sendError('Invalid date format. Use YYYY-MM-DD');
}

// Validate time format (HH:MM)
if (!preg_match('/^\d{2}:\d{2}$/', $sessionTime)) {
    $conn->close();
    sendError('Invalid time format. Use HH:MM');
}

// Verify student exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'student'");
$stmt->bind_param("i", $studentId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendError('Student not found');
}
$stmt->close();

// Verify tutor exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'tutor'");
$stmt->bind_param("i", $tutorId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendError('Tutor not found');
}
$stmt->close();

// Check for conflicting sessions (same tutor, same date/time)
$stmt = $conn->prepare("SELECT id FROM sessions WHERE tutor_id = ? AND session_date = ? AND session_time = ? AND status IN ('pending', 'confirmed')");
$stmt->bind_param("iss", $tutorId, $sessionDate, $sessionTime);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    $conn->close();
    sendError('Tutor already has a session at this time. Please choose a different time.');
}
$stmt->close();

// Insert new session
$stmt = $conn->prepare("INSERT INTO sessions (student_id, tutor_id, subject, topic, session_date, session_time, duration, student_message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
$stmt->bind_param("iissssss", $studentId, $tutorId, $subject, $topic, $sessionDate, $sessionTime, $duration, $message);

if (!$stmt->execute()) {
    $stmt->close();
    $conn->close();
    sendError('Failed to create booking. Please try again.');
}

$sessionId = $stmt->insert_id;
$stmt->close();
$conn->close();

// Send success response
sendSuccess([
    'message' => 'Session booking created successfully',
    'session' => [
        'id' => $sessionId,
        'student_id' => $studentId,
        'tutor_id' => $tutorId,
        'subject' => $subject,
        'topic' => $topic,
        'date' => $sessionDate,
        'time' => $sessionTime,
        'duration' => $duration,
        'status' => 'pending'
    ]
], 201);
