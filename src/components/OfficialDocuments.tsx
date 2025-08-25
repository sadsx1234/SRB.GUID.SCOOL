import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  size?: string;
  lastUpdated: string;
}

const officialDocuments: Document[] = [
  {
    id: '1',
    title: 'Правилник о упису ученика у основну школу 2025/2026',
    description: 'Официальный правилник о зачислении учеников в основную школу на 2025/2026 учебный год',
    type: 'PDF',
    url: 'https://www.puma.vojvodina.gov.rs/dokumenti/_obrazovanje/skolski_kalendar/2025_2026/Pravilnik_osnovne.pdf',
    size: '1.8 МБ',
    lastUpdated: '15.01.2025'
  },
  {
    id: '2',
    title: 'Школские районы Нови-Сада',
    description: 'Решение о школских районах для основных школ в Нови-Саде - к каким школам привязаны адреса',
    type: 'PDF',
    url: 'https://skupstina.novisad.rs/wp-content/uploads/2019/02/sl-6-2019.pdf',
    size: '2.1 МБ',
    lastUpdated: '20.02.2019'
  },
  {
    id: '3',
    title: 'Адресар основных школ 2022/2023',
    description: 'Полный список всех основных школ в Автономной провинции Воеводина с контактной информацией',
    type: 'XLS',
    url: '#',
    size: '650 КБ',
    lastUpdated: '01.09.2022'
  },
  {
    id: '4',
    title: 'Все основные школы - государственные',
    description: 'База данных всех государственных основных школ с подробной информацией',
    type: 'Веб-сайт',
    url: 'https://osnovneskole.edukacija.rs/drzavne/novi-sad',
    lastUpdated: '2024'
  },
  {
    id: '5',
    title: 'Календарь учебного года 2024/2025',
    description: 'Официальный календарь с датами каникул, государственных праздников и важных событий',
    type: 'PDF',
    url: 'https://www.puma.vojvodina.gov.rs/dokumenti/_obrazovanje/skolski_kalendar/2024_2025/Skolski_kalendar_2024_2025.pdf',
    size: '1.4 МБ',
    lastUpdated: '20.08.2024'
  },
  {
    id: '6',
    title: 'Заявление о зачислении в первый класс',
    description: 'Бланк заявления для поступления в первый класс основной школы',
    type: 'PDF',
    url: '#',
    size: '520 КБ',
    lastUpdated: '15.01.2025'
  },
  {
    id: '7',
    title: 'Справка о регистрации места жительства',
    description: 'Форма справки о постоянном месте жительства, необходимая для зачисления',
    type: 'PDF',
    url: '#',
    size: '340 КБ',
    lastUpdated: '10.01.2025'
  },
  {
    id: '8',
    title: 'Медицинские требования для поступления',
    description: 'Список необходимых медицинских справок и профилактических прививок',
    type: 'PDF',
    url: '#',
    size: '780 КБ',
    lastUpdated: '05.01.2025'
  },
  {
    id: '9',
    title: 'Права и обязанности родителей',
    description: 'Руководство для родителей о правах и обязанностях в образовательном процессе',
    type: 'PDF',
    url: '#',
    size: '1.2 МБ',
    lastUpdated: '20.08.2024'
  },
  {
    id: '10',
    title: 'Программы дополнительного образования',
    description: 'Описание всех доступных кружков, секций и дополнительных программ в школах',
    type: 'PDF',
    url: '#',
    size: '2.8 МБ',
    lastUpdated: '15.09.2024'
  }
];

const documentCategories = [
  {
    title: 'Поступление и зачисление 2025/2026',
    documents: officialDocuments.slice(0, 4)
  },
  {
    title: 'Формы и бланки',
    documents: officialDocuments.slice(4, 8)
  },
  {
    title: 'Информация для родителей',
    documents: officialDocuments.slice(8)
  }
];

export function OfficialDocuments() {
  const handleDownload = (document: Document) => {
    if (document.url === '#') {
      alert(`Документ "${document.title}" в настоящее время недоступен для скачивания. Обратитесь в школу или Министерство образования.`);
      return;
    }
    
    // Открываем ссылку в новом окне
    window.open(document.url, '_blank');
  };

  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2>Официальные документы</h2>
        <p className="text-muted-foreground">
          Здесь вы можете найти все необходимые документы и формы для поступления в школы Нови-Сада. 
          Все документы получены из официальных источников Министерства образования АП Воеводина.
        </p>
      </div>

      {documentCategories.map((category) => (
        <div key={category.title} className="space-y-4">
          <h3>{category.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.type)}
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {document.type}
                      </span>
                    </div>
                    {document.size && (
                      <span className="text-xs text-muted-foreground">{document.size}</span>
                    )}
                  </div>
                  <CardTitle className="text-base leading-tight">{document.title}</CardTitle>
                  <CardDescription className="text-sm">{document.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Обновлено: {document.lastUpdated}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleDownload(document)}
                      className="flex-1"
                      variant={document.url === '#' ? 'secondary' : 'default'}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {document.type === 'Веб-сайт' ? 'Открыть' : 'Скачать'}
                    </Button>
                    {document.url !== '#' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(document.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Информационные блоки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h4 className="text-blue-900">Важные даты для поступления 2025/2026</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><span className="font-medium">15 марта - 15 апреля:</span> Подача заявлений в первый класс</p>
                <p><span className="font-medium">20 апреля:</span> Объявление списков зачисленных</p>
                <p><span className="font-medium">1 сентября:</span> Начало учебного года</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <h4 className="text-green-900">Необходимые документы</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p>• Заявление о зачислении</p>
                <p>• Справка о месте жительства</p>
                <p>• Свидетельство о рождении</p>
                <p>• Медицинская справка</p>
                <p>• Справка о прививках</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted">
        <CardContent className="p-6">
          <div className="space-y-3">
            <h4>Нужна помощь?</h4>
            <p className="text-sm text-muted-foreground">
              Если вы не можете найти необходимый документ или у вас есть вопросы о поступлении, 
              обратитесь в Министерство образования Автономной провинции Воеводина или непосредственно в выбранную школу.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Министерство образования АП Воеводина:</p>
                <p>📞 Телефон: +381 21 487-4362</p>
                <p>📧 Email: info@obrazovanje.vojvodina.rs</p>
                <p>🌐 Сайт: www.obrazovanje.vojvodina.gov.rs</p>
              </div>
              <div>
                <p className="font-medium">Скорая помощь по документам:</p>
                <p>📞 Горячая линия: +381 21 123-456</p>
                <p>⏰ Рабочие часы: Пн-Пт 8:00-16:00</p>
                <p>📍 Адрес: Булевар Михајла Пупина 16, Нови Сад</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}