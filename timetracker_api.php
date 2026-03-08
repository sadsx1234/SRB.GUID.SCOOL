<?php
// --- timetracker_api.php ---

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$tasksFile = 'tasks.json';
$projectsFile = 'projects.json';

// Вспомогательная функция чтения
function readJsonFile($filename) {
    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        if (!empty($content)) {
            return json_decode($content, true) ?? [];
        }
    }
    return []; // Если файла нет или пустой
}

// Вспомогательная функция записи
function writeJsonFile($filename, $data) {
    return file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// === GET: Получение данных ===
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $type = $_GET['type'] ?? 'tasks';

    if ($type === 'projects') {
        echo json_encode(['projects' => readJsonFile($projectsFile)]);
    } else {
        // По умолчанию отдаем задачи
        $data = readJsonFile($tasksFile);
        // Обеспечиваем структуру ['tasks' => [...]]
        if (!isset($data['tasks'])) $data = ['tasks' => []];
        echo json_encode($data);
    }
    exit();
}

// === POST: Сохранение данных ===
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $jsonPayload = file_get_contents('php://input');
    $req = json_decode($jsonPayload, true);

    $action = $req['action'] ?? null;
    $data = $req['data'] ?? null;

    // --- 1. Логика ЗАДАЧ (tasks) ---
    if ($action == 'save_task' || $action == 'update_task') {
        $fileData = readJsonFile($tasksFile);
        if (!isset($fileData['tasks'])) $fileData['tasks'] = [];

        if ($action == 'save_task') {
            $fileData['tasks'][] = $data;
        } elseif ($action == 'update_task') {
            $updated = false;
            foreach ($fileData['tasks'] as $i => $task) {
                if ($task['id'] === $data['id']) {
                    $fileData['tasks'][$i] = $data;
                    $updated = true;
                    break;
                }
            }
            if (!$updated) {
                http_response_code(404);
                echo json_encode(['message' => 'Задача не найдена']);
                exit();
            }
        }

        writeJsonFile($tasksFile, $fileData);
        echo json_encode(['message' => 'Задача сохранена']);
        exit();
    }

    // --- 2. Логика ПРОЕКТОВ (projects) ---
    if ($action == 'save_projects_list') {
        // Мы просто перезаписываем весь список проектов новым массивом
        if (is_array($data)) {
            writeJsonFile($projectsFile, $data);
            echo json_encode(['message' => 'Список проектов обновлен']);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Неверный формат данных проектов']);
        }
        exit();
    }
}
?>