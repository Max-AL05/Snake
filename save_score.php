<?php
// save_score.php

// Permitir acceso desde el mismo origen
header('Content-Type: application/json');

// 1. Conectar a la base de datos (se crea el archivo si no existe)
try {
    $db = new SQLite3('snake_database.db');
} catch (Exception $e) {
    echo json_encode(["error" => "No se pudo conectar a la BD"]);
    exit();
}

// 2. Crear la tabla si no existe (id, nombre, puntaje, fecha)
$query = "CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            date_created DATETIME DEFAULT CURRENT_TIMESTAMP
          )";
$db->exec($query);

// 3. Recibir los datos enviados por Javascript (JSON)
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (isset($data['name']) && isset($data['score'])) {
    $name = $data['name'];
    $score = (int)$data['score']; // Asegurar que sea número

    // 4. Preparar la inserción (Seguridad contra inyección SQL)
    $stmt = $db->prepare('INSERT INTO scores (name, score) VALUES (:name, :score)');
    $stmt->bindValue(':name', $name, SQLITE3_TEXT);
    $stmt->bindValue(':score', $score, SQLITE3_INTEGER);

    $result = $stmt->execute();

    if ($result) {
        echo json_encode(["success" => true, "message" => "Puntuación guardada"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al guardar"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
}
?>