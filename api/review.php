<?php
// /api/review.php - API для управления данными отзывов (review.json)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$root_dir = '../'; 
$review_file = 'review.json';
$file_path = $root_dir . $review_file;

// --- Вспомогательные функции (копированы из school.php) ---

function readJsonFile($filePath) {
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
    
    if (!isset($data['id']) || !isset($data['updates']['review'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Отсутствует ID школы или данные для обновления.']);
        exit;
    }
    
    $schoolId = (int)$data['id'];
    $updates = $data['updates']['review']; // Обновляемые поля
    
    $review_data = readJsonFile($file_path);
    
    if (!is_array($review_data)) {
        http_response_code(500);
        echo json_encode(['error' => 'Не удалось прочитать или структура review.json неверна (ожидается корневой массив).']);
        exit;
    }

    // 2. Обновляем данные в корневом массиве
    $updated = false;
    foreach ($review_data as $key => $item) {
        // Ищем по корневому полю 'id'
        if (isset($item['id']) && (int)$item['id'] === $schoolId) {
            
            // Используем array_merge_recursive для обновления всех полей
            $review_data[$key] = array_merge_recursive($review_data[$key], $updates);
            $updated = true;
            break;
        }
    }
    
    if ($updated && writeJsonFile($file_path, $review_data)) {
        echo json_encode(['message' => 'Данные отзывов успешно обновлены.']);
    } else {
        http_response_code(500);
        $error_msg = 'Ошибка при записи данных отзывов. ID (' . $schoolId . ') не найден в review.json или ошибка файловой системы.';
        error_log("REVIEW_API_ERROR: " . $error_msg);
        echo json_encode(['error' => $error_msg]);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен. Используйте POST для сохранения.']);
}
?>