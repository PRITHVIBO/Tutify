<?php

/**
 * Tutify Update Progress API
 * Allows tutors to update student progress after sessions
 */

require_once 'db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get JSON input
$data = getJsonInput();

// Validate required fields
if (empty($data->session_id) || !isset($data->progress)) {
    sendError('Session ID and progress value are required');
}

// Connect to database
$conn = getDbConnection();

// Sanitize input
$sessionId = intval($data->session_id);
$progress = intval($data->progress);
$notes = !empty($data->notes) ? sanitize($conn, $data->notes) : null;
$tutorId = !empty($data->tutor_id) ? intval($data->tutor_id) : null;

// Validate progress range (0-100)
if ($progress < 0 || $progress > 100) {
    $conn->close();
    sendError('Progress must be between 0 and 100');
}

// Verify session exists
$stmt = $conn->prepare("SELECT id, tutor_id, status FROM sessions WHERE id = ?");
$stmt->bind_param("i", $sessionId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendError('Session not found');
}

$session = $result->fetch_assoc();
$stmt->close();

// Verify tutor authorization (if tutor_id provided)
if ($tutorId !== null && $session['tutor_id'] != $tutorId) {
    $conn->close();
    sendError('Unauthorized. You can only update your own sessions.');
}

// Update session progress
$sql = "UPDATE sessions SET progress = ?";
$params = [$progress];
$types = "i";

if ($notes !== null) {
    $sql .= ", tutor_notes = ?";
    $params[] = $notes;
    $types .= "s";
}

// If progress is 100 and status is confirmed, mark as completed
if ($progress === 100 && $session['status'] === 'confirmed') {
    $sql .= ", status = 'completed'";
}

$sql .= " WHERE id = ?";
$params[] = $sessionId;
$types .= "i";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if (!$stmt->execute()) {
    $stmt->close();
    $conn->close();
    sendError('Failed to update progress. Please try again.');
}

$stmt->close();

// Get updated session data
$stmt = $conn->prepare("SELECT id, student_id, tutor_id, subject, progress, tutor_notes, status FROM sessions WHERE id = ?");
$stmt->bind_param("i", $sessionId);
$stmt->execute();
$result = $stmt->get_result();
$updatedSession = $result->fetch_assoc();
$stmt->close();

// If session completed, increment tutor's total sessions
if ($updatedSession['status'] === 'completed') {
    $stmt = $conn->prepare("UPDATE tutor_profiles SET total_sessions = total_sessions + 1 WHERE user_id = ?");
    $stmt->bind_param("i", $session['tutor_id']);
    $stmt->execute();
    $stmt->close();
}

$conn->close();

// Send success response
sendSuccess([
    'message' => 'Progress updated successfully',
    'session' => $updatedSession
]);
