<?php
// --- api.php ---

// === 1. Настройки CORS и заголовки ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$newsFilePath = 'news.json';

// === 2. Логика для GET-запроса (Отдать все новости) ===
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (file_exists($newsFilePath)) {
        $fileContent = file_get_contents($newsFilePath);
        http_response_code(200);
        echo $fileContent; // Просто отдаем содержимое файла как есть
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Файл новостей не найден.']);
    }
    exit();
}

// === 3. Логика для POST-запроса (Добавление или Обновление) ===
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Получаем JSON-данные из тела запроса
    $jsonPayload = file_get_contents('php://input');
    $requestData = json_decode($jsonPayload, true);
    
    // Определяем, какое действие от нас ждут
    $action = $requestData['action'] ?? null;

    // Читаем текущий файл новостей
    $newsData = ['news_items' => []];
    if (file_exists($newsFilePath)) {
        $fileContent = file_get_contents($newsFilePath);
        if (!empty($fileContent)) {
            $newsData = json_decode($fileContent, true);
        }
    }

    // Выполняем действие в зависимости от $action
    switch ($action) {
        
        // --- ДЕЙСТВИЕ: ДОБАВИТЬ НОВОСТЬ ---
        case 'add':
            $newPost = $requestData['data']; // Данные теперь лежат во вложенном объекте
            if (empty($newPost) || !isset($newPost['post_id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Ошибка: Отсутствуют post_id или content_text']);
                exit();
            }

            // Добавляем 'active: true' по умолчанию для новых постов
            $newPost['active'] = true;
            $newsData['news_items'][] = $newPost;
            
            // Сортируем
            usort($newsData['news_items'], function($a, $b) {
                return $a['priority'] <=> $b['priority'];
            });

            // Записываем
            file_put_contents($newsFilePath, json_encode($newsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            http_response_code(201);
            echo json_encode(['message' => 'Новость успешно добавлена', 'data' => $newPost]);
            break;

        // --- ДЕЙСТВИЕ: ИЗМЕНИТЬ СТАТУС ---
        case 'toggle_status':
            $postIdToToggle = $requestData['post_id'] ?? null;
            if (!$postIdToToggle) {
                http_response_code(400);
                echo json_encode(['message' => 'Ошибка: Не указан post_id для изменения статуса']);
                exit();
            }

            $found = false;
            foreach ($newsData['news_items'] as &$item) { // & - ссылка, чтобы менять массив
                if ($item['post_id'] == $postIdToToggle) {
                    // Если свойство 'active' не задано, считаем его true.
                    // Затем инвертируем его (true -> false, false -> true)
                    $item['active'] = !(isset($item['active']) ? $item['active'] : true);
                    $found = true;
                    break;
                }
            }

            if ($found) {
                file_put_contents($newsFilePath, json_encode($newsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                http_response_code(200);
                echo json_encode(['message' => 'Статус новости ' . $postIdToToggle . ' успешно изменен.']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Новость ' . $postIdToToggle . ' не найдена.']);
            }
            break;

        default:
            http_response_code(400); // Bad Request
            echo json_encode(['message' => 'Ошибка: Неизвестное действие (action).']);
            break;
    }
}
?>