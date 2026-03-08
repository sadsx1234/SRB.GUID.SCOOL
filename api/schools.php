<?php
// /api/schools.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Добавить для локальной разработки

// Путь к файлу из папки /api/ в корень:
$schools_file = '../schools.json'; 

if (!file_exists($schools_file)) {
    http_response_code(500);
    echo json_encode(['error' => 'Файл schools.json не найден. Проверьте путь: ' . $schools_file]);
    exit;
}

$schools_data = json_decode(file_get_contents($schools_file), true);

$list = [];
foreach ($schools_data as $school) {
    $list[] = [
        'id' => $school['id'],
        'name' => $school['name'],
        'city' => $school['city'] . ' - ' . $school['place']
    ];
}

echo json_encode($list, JSON_UNESCAPED_UNICODE);
?>