<?php
// /api/school.php - Чтение и запись основных данных школы

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$root_dir = '../'; 
$json_files = [
    'schools' => 'schools.json',
    'averageGrade' => 'AverageGrade.json',
    'review' => 'review.json',
    'students' => 'students.json',
    'addresses' => 'addresses.json',
];

// --- Вспомогательные функции ---

function readJsonFile($filePath) {
    if (!file_exists($filePath)) {
        error_log("ERROR: File not found: " . $filePath);
        return null;
    }
    $content = file_get_contents($filePath);
    if ($content === false) {
        error_log("ERROR: Failed to read file content: " . $filePath);
        return null;
    }
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

// --- Функция для сбора данных по всем файлам ---
function getAllSchoolData($schoolId) {
    global $root_dir, $json_files;
    $data = [];
    $id = (int) $schoolId;

    // 1. schools.json (Определение crossId)
    $schools_data = readJsonFile($root_dir . $json_files['schools']);
    $crossId = null;
    if ($schools_data) {
        foreach ($schools_data as $school) {
            if ((int)($school['id'] ?? 0) === $id) {
                $data['schools'] = $school;
                $crossId = (string)($school['crossId'] ?? ''); 
                break;
            }
        }
    }
    if (!isset($data['schools'])) { return false; } 

    // 2. AverageGrade.json (Чтение и ГАРАНТИЯ КЛЮЧА)
    $data['averageGrade'] = ['_info' => 'Данные не найдены в AverageGrade.json']; 
    $avg_grade_json = readJsonFile($root_dir . $json_files['averageGrade']);
    
    if (is_array($avg_grade_json) && isset($avg_grade_json[0]['data:']) && is_array($avg_grade_json[0]['data:'])) {
        $found = false;
        foreach ($avg_grade_json[0]['data:'] as $item) {
            if (isset($item['crossId']) && (int)$item['crossId'] === $id) { 
                $data['averageGrade'] = $item;
                $found = true;
                break;
            }
        }
        if ($found) {
            unset($data['averageGrade']['_info']); 
        }
    }


   // 3. review.json (Чтение и ГАРАНТИЯ КЛЮЧА)
    $data['review'] = ['_info' => 'Данные не найдены в review.json']; 
    $review_json = readJsonFile($root_dir . $json_files['review']);
    
    // КОРРЕКТНЫЙ МЭППИНГ: review.json теперь обрабатывается как корневой массив
    if (is_array($review_json)) {
        $found = false;
        foreach ($review_json as $item) {
            // Ищем ID в корневом ключе 'id'
            if (isset($item['id']) && (int)$item['id'] === $id) {
                $data['review'] = $item;
                $found = true;
                break;
            }
        }
        if ($found) {
            unset($data['review']['_info']); 
        }
    }

    // 4. students.json (Чтение данных, сохранение происходит в students.php)
    $data['students'] = ['_info' => 'Данные учеников не найдены в students.json. Используем ID школы: ' . $id]; 
    
    $students_json = readJsonFile($root_dir . $json_files['students']);
    if (is_array($students_json)) {
        $found = false;
        foreach ($students_json as $item) {
            if (isset($item['crossId']) && (int)$item['crossId'] === $id) { 
                $data['students'] = $item; 
                $found = true;
                break;
            }
        }
        if ($found) {
            unset($data['students']['_info']);
        }
    }


    // 5. addresses.json (Чтение и ГАРАНТИЯ КЛЮЧА)
    $data['addresses'] = ['_info' => 'Данные не найдены в addresses.json']; 
    $addresses_json = readJsonFile($root_dir . $json_files['addresses']);
    
    if (is_array($addresses_json)) {
        $found = false;
        foreach ($addresses_json as $item) {
            if (isset($item['id']) && (int)$item['id'] === $id) {
                $data['addresses'] = $item; 
                $found = true;
                break;
            }
        }
        if ($found) {
            unset($data['addresses']['_info']);
        }
    }


    // 6. activity.json (Чтение списка активностей для чекбоксов)
    $activity_json = readJsonFile($root_dir . 'activity.json');
    $schoolActivities = [];
    $allActivities = [];
    
    $categories = $activity_json['schoolActivitiesReport']['activityCategories'] ?? null;
    
    if (is_array($categories)) {
        foreach ($categories as $category) {
            $activities = $category['activities'] ?? null;

            if (is_array($activities)) {
                foreach ($activities as $activity) {
                    
                    if (!isset($activity['activityId']) || !isset($activity['activityName']) || !isset($activity['participatingSchoolIds'])) {
                        continue; 
                    }

                    $activityId = (int)$activity['activityId'];
                    $allActivities[$activityId] = [
                        'id' => $activityId,
                        'name' => $activity['activityName'],
                        'category' => $category['categoryName'] ?? 'Неизвестная категория'
                    ];
                    
                    if (is_array($activity['participatingSchoolIds']) && in_array($id, $activity['participatingSchoolIds'])) {
                        $schoolActivities[$activityId] = true;
                    }
                }
            }
        }
    }
    
    $data['activity_full_list'] = $allActivities; 
    $data['activity_active_ids'] = $schoolActivities; 
    $data['activity_custom'] = ['_instruction' => 'Данные активностей загружаются и сохраняются в activity.php']; 

    return $data;
}

// --- Функция для сохранения данных (без external files) ---
function saveAllSchoolData($id, $updates) {
    global $root_dir, $json_files;
    $id = (int) $id;
    $success = true;

    // 1. Обновление schools.json
    if (isset($updates['schools'])) {
        $file_path = $root_dir . $json_files['schools'];
        $schools_data = readJsonFile($file_path);
        if ($schools_data) {
            $updated = false;
            foreach ($schools_data as $key => $school) {
                if ((int)($school['id'] ?? 0) === $id) {
                    $schools_data[$key] = array_merge($schools_data[$key], $updates['schools']);
                    $updated = true;
                    break;
                }
            }
            if ($updated) $success &= writeJsonFile($file_path, $schools_data);
            else $success = false;
        } else {$success = false;}
    }

    // 2. AverageGrade.json - ЛОГИКА СОХРАНЕНИЯ УДАЛЕНА
    
    // 3. review.json - ЛОГИКА СОХРАНЕНИЯ УДАЛЕНА
    
    // 4. Обновление addresses.json
    if (isset($updates['addresses'])) {
        $file_path = $root_dir . $json_files['addresses'];
        $addresses_data = readJsonFile($file_path);
        
        if ($addresses_data) {
            $updated = false;
            foreach ($addresses_data as $key => $item) {
                if (isset($item['id']) && (int)$item['id'] === $id) {
                    $addresses_data[$key] = array_merge($addresses_data[$key], $updates['addresses']);
                    $updated = true;
                    break;
                }
            }
            if ($updated) $success &= writeJsonFile($file_path, $addresses_data);
            else $success = false;
        } else {$success = false;}
    }
    
    return $success;
}

// --- Обработка запросов ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Отсутствует ID школы.']);
        exit;
    }
    $schoolId = $_GET['id'];
    $data = getAllSchoolData($schoolId);
    
    if ($data === false) {
        http_response_code(404);
        echo json_encode(['error' => 'Школа с ID ' . $schoolId . ' не найдена в schools.json.']);
    } else {
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['updates'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Некорректный формат данных.']);
        exit;
    }
    
    $schoolId = $data['id'];
    $updates = $data['updates'];
    
    if (saveAllSchoolData($schoolId, $updates)) {
        echo json_encode(['message' => 'Стандартные данные успешно обновлены.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка при сохранении данных в один или несколько файлов. Проверьте права на запись в JSON-файлы и консоль сервера (error_log).']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен.']);
}
?>