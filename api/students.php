<?php
// /api/students.php - API для управления данными учеников

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$root_dir = '../'; 
$students_file = 'students.json';
$file_path = $root_dir . $students_file;

// --- Вспомогательные функции (копированы из school.php) ---

function readJsonFile($filePath) {
    // ... (вспомогательные функции остаются без изменений, но убедитесь, что они есть в файле)
    if (!file_exists($filePath)) {
        error_log("ERROR: File not found: " . $filePath);
        return null;
    }
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("ERROR: JSON decoding failed for " . $filePath . ". Error: " . json_last_error_msg());
        return null;
    }
    return $data;
}

function writeJsonFile($filePath, $data) {
    $result = file_put_contents($filePath, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    if ($result === false) {
        error_log("ERROR: Failed to write to file: " . $filePath);
        return false;
    }
    return true;
}


// --- Логика POST-запроса (Сохранение) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['updates']['students'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Отсутствует ID школы или данные для обновления.']);
        exit;
    }
    
    $schoolId = (int)$data['id'];
    $updates = $data['updates']['students']; 
    
    $students_data = readJsonFile($file_path);
    
    // КРИТИЧНОЕ ИЗМЕНЕНИЕ: Используем ID школы как crossId (строка)
    $searchCrossId = (string)$schoolId; 

    if (!is_array($students_data)) {
        http_response_code(500);
        echo json_encode(['error' => 'Не удалось прочитать students.json.']);
        exit;
    }

    // 2. Обновляем данные в students.json по searchCrossId
    $updated = false;
    foreach ($students_data as $key => $item) {
        // Устойчивое сравнение строки crossId с ID школы
        if (isset($item['crossId']) && (string)$item['crossId'] === $searchCrossId) { 
            // Используем array_merge для обновления полей
            $students_data[$key] = array_merge($students_data[$key], $updates); 
            $updated = true;
            break;
        }
    }
    
    if ($updated && writeJsonFile($file_path, $students_data)) {
        echo json_encode(['message' => 'Данные учеников успешно обновлены.']);
    } else {
        http_response_code(500);
        $error_msg = 'Ошибка при записи данных учеников. ID (' . $schoolId . ') не найден как crossId в students.json или ошибка файловой системы.';
        error_log("STUDENTS_API_ERROR: " . $error_msg);
        echo json_encode(['error' => $error_msg]);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен. Используйте POST для сохранения.']);
}
?>