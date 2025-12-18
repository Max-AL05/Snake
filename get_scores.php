<?php
// get_scores.php
header('Content-Type: application/json');

try {
    $db = new SQLite3('snake_database.db');
} catch (Exception $e) {
    echo json_encode([]);
    exit();
}

// Obtener los 10 mejores puntajes ordenados de mayor a menor
$results = $db->query('SELECT name, score FROM scores ORDER BY score DESC LIMIT 10');

$scores = [];
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $scores[] = $row;
}

echo json_encode($scores);
?>