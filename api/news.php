<?php
// /api/news.php - API для управления данными новостей (news.json)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$root_dir = '../'; 
$news_file = 'news.json';
$file_path = $root_dir . $news_file;

// --- Вспомогательные функции ---

function readJsonFile($filePath) {
    if (!file_exists($filePath)) {
        // Создаем пустой массив, если файл не существует
        return []; 
    }
    $content = file_get_contents($filePath);
    $data = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Логируем ошибку, возвращаем пустой массив
        error_log("ERROR: JSON decoding failed for " . $filePath . ". Error: " . json_last_error_msg());
        return [];
    }
    // Если данные не являются массивом (файл пуст или неверный формат), возвращаем массив
    return is_array($data) ? $data : [];
}

function writeJsonFile($filePath, $data) {
    $result = file_put_contents($filePath, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    if ($result === false) {
        error_log("ERROR: Failed to write to file: " . $filePath);
        return false;
    }
    return true;
}

// --- Обработка GET-запроса (Чтение списка новостей) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'list') {
        $news_data = readJsonFile($file_path);
        echo json_encode($news_data, JSON_UNESCAPED_UNICODE);
        exit;
    }
    http_response_code(400);
    echo json_encode(['error' => 'Неверный GET-запрос.']);
}

// --- Обработка POST-запроса (Добавление/Изменение статуса) ---
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    $action = $data['action'] ?? null;
    
    if (!$action) {
        http_response_code(400);
        echo json_encode(['error' => 'Не указано действие.']);
        exit;
    }
    
    $news_data = readJsonFile($file_path);

    // 1. Действие: Добавить новость
    if ($action === 'add_post') {
        if (empty($data['post_id']) || empty($data['title']) || empty($data['url'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Не все обязательные поля заполнены.']);
            exit;
        }

        // Проверка на уникальность ID (опционально, но рекомендуется)
        $is_duplicate = false;
        foreach ($news_data as $post) {
            if ($post['post_id'] === $data['post_id']) {
                $is_duplicate = true;
                break;
            }
        }

        if ($is_duplicate) {
            http_response_code(409);
            echo json_encode(['message' => 'Новость с таким ID уже существует.']);
            exit;
        }

        $new_post = [
            'post_id' => $data['post_id'],
            'title' => $data['title'],
            'url' => $data['url'],
            'post_datetime' => $data['post_datetime'],
            'keywords' => $data['keywords'] ?? '',
            'active' => true, // Новая запись активна по умолчанию
            'created_at' => date('Y-m-d H:i:s')
        ];

        $news_data[] = $new_post;

        if (writeJsonFile($file_path, $news_data)) {
            echo json_encode(['message' => 'Новость успешно добавлена.', 'post_id' => $data['post_id']]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Ошибка сохранения файла на сервере. Проверьте права на запись.']);
        }
    }
    
    // 2. Действие: Изменить статус
    elseif ($action === 'toggle_status') {
        $post_id_to_toggle = $data['post_id'] ?? null;
        if (!$post_id_to_toggle) {
            http_response_code(400);
            echo json_encode(['message' => 'Не указан ID новости для изменения статуса.']);
            exit;
        }

        $found = false;
        foreach ($news_data as $key => $post) {
            if ($post['post_id'] === $post_id_to_toggle) {
                // Инвертируем статус
                $news_data[$key]['active'] = !($news_data[$key]['active'] ?? false);
                $found = true;
                break;
            }
        }

        if ($found && writeJsonFile($file_path, $news_data)) {
            echo json_encode(['message' => 'Статус успешно изменен.']);
        } elseif (!$found) {
            http_response_code(404);
            echo json_encode(['message' => 'Новость с указанным ID не найдена.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Ошибка сохранения файла при изменении статуса.']);
        }
    }
    
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Неизвестное действие.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен.']);
}
?>