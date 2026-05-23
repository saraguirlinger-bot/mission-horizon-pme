<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$file = __DIR__ . '/results-technibois.json';

if (!file_exists($file)) {
    echo json_encode(['success' => false, 'error' => 'Fichier introuvable']);
    exit;
}

// Tout effacer
if (isset($data['all']) && $data['all'] === true) {
    file_put_contents($file, '[]');
    echo json_encode(['success' => true]);
    exit;
}

// Supprimer une ligne par index
if (isset($data['index'])) {
    $results = json_decode(file_get_contents($file), true) ?? [];
    $results = array_reverse($results);
    $index = intval($data['index']);
    if (isset($results[$index])) {
        array_splice($results, $index, 1);
        $results = array_reverse($results);
        file_put_contents($file, json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Index invalide']);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'Paramètre manquant']);
?>
