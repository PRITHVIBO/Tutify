<?php

/**
 * Tutify Add Feedback API
 * Allows students to rate and provide feedback for completed sessions
 */

require_once 'db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get JSON input
$data = getJsonInput();

// Validate required fields
if (empty($data->session_id) || empty($data->student_id) || empty($data->rating)) {
    sendError('Session ID, student ID, and rating are required');
}

// Connect to database
$conn = getDbConnection();

// Sanitize input
$sessionId = intval($data->session_id);
$studentId = intval($data->student_id);
$rating = intval($data->rating);
$comment = !empty($data->comment) ? sanitize($conn, $data->comment) : '';

// Validate rating (1-5)
if ($rating < 1 || $rating > 5) {
    $conn->close();
    sendError('Rating must be between 1 and 5');
}

// Verify session exists and belongs to student
$stmt = $conn->prepare("SELECT id, student_id, tutor_id, status FROM sessions WHERE id = ?");
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

// Verify student authorization
if ($session['student_id'] != $studentId) {
    $conn->close();
    sendError('Unauthorized. You can only rate your own sessions.');
}

// Check if session is completed
if ($session['status'] !== 'completed') {
    $conn->close();
    sendError('Can only provide feedback for completed sessions');
}

// Check if feedback already exists
$stmt = $conn->prepare("SELECT id FROM feedback WHERE session_id = ? AND student_id = ?");
$stmt->bind_param("ii", $sessionId, $studentId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    $conn->close();
    sendError('Feedback already submitted for this session');
}
$stmt->close();

// Insert feedback
$tutorId = $session['tutor_id'];
$stmt = $conn->prepare("INSERT INTO feedback (session_id, student_id, tutor_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iiiis", $sessionId, $studentId, $tutorId, $rating, $comment);

if (!$stmt->execute()) {
    $stmt->close();
    $conn->close();
    sendError('Failed to submit feedback. Please try again.');
}

$feedbackId = $stmt->insert_id;
$stmt->close();

// Update tutor's average rating
$stmt = $conn->prepare("SELECT AVG(rating) as avg_rating FROM feedback WHERE tutor_id = ?");
$stmt->bind_param("i", $tutorId);
$stmt->execute();
$result = $stmt->get_result();
$avgRating = $result->fetch_assoc()['avg_rating'];
$stmt->close();

$stmt = $conn->prepare("UPDATE tutor_profiles SET rating = ? WHERE user_id = ?");
$stmt->bind_param("di", $avgRating, $tutorId);
$stmt->execute();
$stmt->close();

$conn->close();

// Send success response
sendSuccess([
    'message' => 'Feedback submitted successfully',
    'feedback' => [
        'id' => $feedbackId,
        'session_id' => $sessionId,
        'rating' => $rating,
        'comment' => $comment
    ],
    'tutor_new_rating' => round($avgRating, 2)
], 201);
