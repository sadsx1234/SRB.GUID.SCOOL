<?php
// /api/activity.php - API для управления активностями (кружками)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$root_dir = '../'; 
$activity_file = 'activity.json';
$file_path = $root_dir . $activity_file;

// --- Вспомогательные функции ---

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
    
    if (!isset($data['id']) || !isset($data['activity_new_list'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Отсутствует ID школы или новый список активностей.']);
        exit;
    }
    
    $schoolId = (int)$data['id'];
    $newActiveIds = is_array($data['activity_new_list']) ? array_map('intval', $data['activity_new_list']) : [];
    
    $activity_data = readJsonFile($file_path);
    
    $categories = $activity_data['schoolActivitiesReport']['activityCategories'] ?? null;

    if (is_array($categories)) {
        $updated = false;
        
        foreach ($categories as $catKey => $category) {
            $activities = $category['activities'] ?? null;

            if (is_array($activities)) {
                foreach ($activities as $actKey => $activity) {
                    $activityId = (int)($activity['activityId'] ?? 0);
                    $participatingIds = $activity['participatingSchoolIds'] ?? [];
                    
                    // A. Удаляем ID текущей школы из старого массива
                    $participatingIds = array_filter($participatingIds, function($id) use ($schoolId) {
                        return (int)$id !== $schoolId;
                    });

                    // B. Проверяем, нужно ли добавить ID школы в новый массив
                    if (in_array($activityId, $newActiveIds)) {
                        $participatingIds[] = $schoolId;
                        $participatingIds = array_unique($participatingIds);
                    }
                    
                    // C. Обновляем данные
                    $activity_data['schoolActivitiesReport']['categories'][$catKey]['activities'][$actKey]['participatingSchoolIds'] = array_values($participatingIds);
                    $updated = true;
                }
            }
        }
        
        if ($updated && writeJsonFile($file_path, $activity_data)) {
            echo json_encode(['message' => 'Данные активностей успешно обновлены.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Ошибка при записи данных активностей. Проверьте права на запись.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Не удалось прочитать или структура activity.json неверна.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен. Используйте POST для сохранения.']);
}
?>