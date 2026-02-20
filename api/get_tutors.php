<?php

/**
 * Tutify Get Tutors API
 * Returns list of tutors with optional filtering
 */

require_once 'db.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

// Connect to database
$conn = getDbConnection();

// Build query with optional filters
$sql = "SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.phone,
    tp.subjects,
    tp.bio,
    tp.experience,
    tp.hourly_rate,
    tp.rating,
    tp.total_sessions
FROM users u
INNER JOIN tutor_profiles tp ON u.id = tp.user_id
WHERE u.role = 'tutor'";

$params = [];
$types = "";

// Filter by subject
if (!empty($_GET['subject'])) {
    $subject = sanitize($conn, $_GET['subject']);
    $sql .= " AND tp.subjects LIKE ?";
    $params[] = "%{$subject}%";
    $types .= "s";
}

// Filter by minimum rating
if (!empty($_GET['min_rating'])) {
    $minRating = floatval($_GET['min_rating']);
    $sql .= " AND tp.rating >= ?";
    $params[] = $minRating;
    $types .= "d";
}

// Filter by minimum experience
if (!empty($_GET['min_experience'])) {
    $minExperience = intval($_GET['min_experience']);
    $sql .= " AND tp.experience >= ?";
    $params[] = $minExperience;
    $types .= "i";
}

// Filter by maximum hourly rate
if (!empty($_GET['max_rate'])) {
    $maxRate = floatval($_GET['max_rate']);
    $sql .= " AND tp.hourly_rate <= ?";
    $params[] = $maxRate;
    $types .= "d";
}

// Sort by rating (default) or experience
$sortBy = !empty($_GET['sort']) ? $_GET['sort'] : 'rating';
if (in_array($sortBy, ['rating', 'experience', 'total_sessions'])) {
    $sql .= " ORDER BY tp.{$sortBy} DESC";
} else {
    $sql .= " ORDER BY tp.rating DESC";
}

// Limit results
$limit = !empty($_GET['limit']) ? intval($_GET['limit']) : 50;
$sql .= " LIMIT ?";
$params[] = $limit;
$types .= "i";

// Prepare and execute statement
$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$tutors = [];

while ($row = $result->fetch_assoc()) {
    // Convert subjects string to array
    $row['subjects'] = !empty($row['subjects']) ? explode(',', $row['subjects']) : [];

    // Convert numeric values
    $row['experience'] = intval($row['experience']);
    $row['hourly_rate'] = floatval($row['hourly_rate']);
    $row['rating'] = floatval($row['rating']);
    $row['total_sessions'] = intval($row['total_sessions']);

    $tutors[] = $row;
}

$stmt->close();
$conn->close();

// Send success response
sendSuccess([
    'tutors' => $tutors,
    'count' => count($tutors)
]);
