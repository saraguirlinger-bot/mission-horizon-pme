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

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Données invalides']);
    exit;
}

// Fichier de stockage
$file = __DIR__ . '/results-technibois.json';

// Charger les résultats existants
$results = [];
if (file_exists($file)) {
    $results = json_decode(file_get_contents($file), true) ?? [];
}

// Ajouter le nouveau résultat
$results[] = [
    'date'    => date('d/m/Y H:i'),
    'nom'     => htmlspecialchars($data['nom'] ?? ''),
    'prenom'  => htmlspecialchars($data['prenom'] ?? ''),
    'classe'  => htmlspecialchars($data['classe'] ?? ''),
    'score'   => $data['score'] ?? 0,
    'scoreMax'=> 80,
    'badge'   => htmlspecialchars($data['badge'] ?? ''),
    'detail'  => $data['detail'] ?? [],
];

// Sauvegarder
file_put_contents($file, json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true]);
?>
