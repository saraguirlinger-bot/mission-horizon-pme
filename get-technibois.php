<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$file = __DIR__ . '/results-technibois.json';

if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

$results = json_decode(file_get_contents($file), true) ?? [];

// Trier du plus récent au plus ancien
$results = array_reverse($results);

echo json_encode($results);
?>
