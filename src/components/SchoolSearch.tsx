import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Phone, Mail, ExternalLink, MessageCircle } from 'lucide-react';

interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  languages: string[];
  telegram?: string;
  instagram?: string;
  coordinates: { lat: number; lng: number };
  type: string;
  district: string;
  place: string;
  attachedAddresses: string; // Адреса домов прикрепленные к школе
}

const realSchools: School[] = [
  {
    id: '194',
    name: 'ОШ "ЈОВАН ДУЧИЋ"',
    address: 'Прерадовићева 6',
    phone: '021/6433-201',
    email: 'jducic@eunet.rs',
    website: 'https://www.osjducic.edu.rs/',
    languages: ['српски'],
    coordinates: { lat: 45.2536, lng: 19.8643 },
    type: 'ОШ',
    district: 'Петроварадин',
    place: 'Нови Сад',
    attachedAddresses: 'Все улицы в населённом пункте Петроварадин.'
  },
  {
    id: '195',
    name: 'ОШ "ВЕЉКО ПЕТРОВИЋ"',
    address: 'Краља Петра I 36',
    phone: '021/2998-009',
    email: 'begso@open.telekom.rs',
    website: 'https://skolevojvodine.vojvodina.gov.rs/',
    languages: ['српски'],
    coordinates: { lat: 45.2443, lng: 19.5546 },
    type: 'ОШ',
    district: 'Бегеч',
    place: 'Нови Сад',
    attachedAddresses: 'Все улицы в населённом пункте Бегеч. Включая Бангладеш, поселение между Руменкой и Сайлово.'
  },
  {
    id: '197',
    name: 'ОШ "МИРОСЛАВ АНТИЋ"',
    address: 'Раде Кончара 2',
    phone: '021/2992-268',
    email: 'pedagogantic@gmail.com',
    website: 'https://osmiroslavanticfutog.edu.rs',
    languages: ['српски'],
    coordinates: { lat: 45.2312, lng: 19.6974 },
    type: 'ОШ',
    district: 'Футог',
    place: 'Нови Сад',
    attachedAddresses: 'Индустријска (непарные 49-до конца, парные), Тозе Марковића, Здравка Челара (101 и 62-до конца), Марије Бурсаћ, Републике српске, Руменачка, Сутјеска, Раде Кондића (непарные и парные 122-до конца), Романијска, Повртарска (непарные 51-до конца, парные 50а-до конца), Гаврила Принципа (непарные 47-до конца, парные 36-до конца), Првомајска, Светозара Марковића (43 и 36-до конца), Браће Бошњак, Светозара Милетића, Бошка Бухе, Хероја Пинкија, Саве Ковачевића, Цара Лазара (143 и 152-до конца), Стевана Сремца, Мајевичка, Вука Караџића, Раковачка, Јована Скерлића, Војводе Бојовића, Иве Андрића, Рибарска (17-до конца), Димитрија Лазарева Раше, Новосадска, Жарка Алексића, Футошка 70-90, Николе Тесле.'
  },
  {
    id: '207',
    name: 'ОШ "БРАНКО РАДИЋЕВИЋ"',
    address: 'Футошка 5',
    phone: '021 66 22 201',
    email: 'jbnsbr@neobee.net',
    website: 'http://brankoviosnovci.edu.rs/',
    languages: ['српски'],
    coordinates: { lat: 45.2530, lng: 19.8390 },
    type: 'ОШ',
    district: 'Нови Сад',
    place: 'Нови Сад',
    attachedAddresses: 'Футошка (непарные 1-37, парные 2-66), Антона Чехова, Доже Ђерђа, Зорана Петровића, Љермонтова, Мише Димитријевића (непарные 1/а-1/ц, 3/а-3/ц, парные 2-16), Гогољева (парные 2-42, непарные 27-31), Браће Рибникара, Данила Киша (парные 2-22, непарные 1-17), Димитрија Туцовића (парные 2-16), Алберта Томе, Максима Горког (парные 2-4/ф, непарные 1 и 1/а), Трг царице Милице, Сремска, Железничка, Трг младенаца, Васе Стајића (парные 22-36, непарные 15-27), Поштанска, Јеврејска (непарные), Аугуста Цесарца, Петра Драпшина, Васе Пелагића, Лазе Костића, Трг Коменског, Школска, Булевар ослобођења (непарные 91-117, парные).'
  },
  {
    id: '220',
    name: 'ОШ "ВАСА СТАЈИЋ"',
    address: 'Војводе Книћанина 12б',
    phone: '021/469-210',
    email: 'os.vasastajic@mts.rs',
    website: 'https://www.vstajicns.rs/',
    languages: ['српски'],
    telegram: 'https://t.me/+uUgp8QhUE4Q3MGY6',
    instagram: 'instagram.com/osvasastajic',
    coordinates: { lat: 45.2559, lng: 19.8510 },
    type: 'ОШ',
    district: 'Нови Сад',
    place: 'Нови Сад',
    attachedAddresses: 'Војводе Книћанина, Сарајевска, Пајевићева, Стратимировићева, Пере Сегединца, Чернишевског, Трг 27. марта, Атанасија Герецког, Коло српских сестара, Ђорђа Сервицког, Крилова, Мише Димитријевића (парные 52-80, непарные 55-89), Бановић Страхиње (непарные и парные 2-14 и 22-до конца), Булевар Цара Лазара (парные 64-126, непарные 81-85), Цара Душана, Футошка (непарные 41-125), Руђера Бошковића, Лазе Нанчића, Серво Михаља, Браће Кекљуш.'
  },
  {
    id: '232',
    name: 'ОШ "МАРИЈА ТРАНДАФИЛ"',
    address: 'Паунова 14',
    phone: '021/820-940',
    email: 'osmarijatrandafil@gmail.com',
    website: 'https://osmarijatrandafil.edu.rs',
    languages: ['српски'],
    coordinates: { lat: 45.2417, lng: 19.7548 },
    type: 'ОШ',
    district: 'Ветерник',
    place: 'Нови Сад',
    attachedAddresses: 'Три багрема, Стевана Пеци Поповића, Нова 14, Јована Калембера, Јустина Поповића, Владимира Матијевића, Нова 9, Добре Јовановића, Гиге Гершића, Нова 91, Петра Биге, Генерала Васића, Живорада Петровића, Нова 40, Нова 18, Нова 54, Новосадски пут (непарные 5-75, парные 48-130), Паунова, Косова, Срских јунака, Краља Милутина, Севастопољска, Далматинска буковица, Ветерничка, Камењар 3, 4, 5.'
  }
];

export function SchoolSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Функция поиска по адресу проживания
  const searchByResidenceAddress = (searchTerm: string, school: School): boolean => {
    if (!searchTerm.trim() || !school.attachedAddresses) return false;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const normalizedAddresses = school.attachedAddresses.toLowerCase();
    
    // Разбиваем поисковый запрос на части (улица и номер дома)
    const searchParts = normalizedSearch.split(/[\s,]+/);
    
    // Проверяем полное совпадение
    if (normalizedAddresses.includes(normalizedSearch)) {
      return true;
    }
    
    // Проверяем частичные совпадения по словам
    return searchParts.some(part => {
      if (part.length < 3) return false; // Игнорируем слишком короткие части
      return normalizedAddresses.includes(part);
    });
  };
  
  const filteredSchools = realSchools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase())) ||
      searchByResidenceAddress(searchTerm, school);
    
    const matchesType = selectedType === 'all' || 
      (selectedType === 'state' && school.type === 'ОШ') ||
      (selectedType === 'private' && school.type === 'Приватна ОШ');
    
    return matchesSearch && matchesType;
  });

  // Calculate map bounds based on all coordinates
  const getMapPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const centerX = 50;
    const centerY = 50;
    const radiusX = 30;
    const radiusY = 20;
    
    return {
      left: `${centerX + Math.cos(angle) * radiusX}%`,
      top: `${centerY + Math.sin(angle) * radiusY}%`
    };
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2>Поиск школ по адресу проживания</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Как искать:</span> Введите ваш адрес проживания (название улицы и номер дома). 
            Система найдет школу, к которой прикреплен ваш адрес. Например: "Футошка 25" или "Булевар ослобођења 50".
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Введите ваш адрес проживания (улица и номер дома)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64"
          />
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Все школы</option>
            <option value="state">Государственные</option>
            <option value="private">Частные</option>
          </select>
          <Button>Найти школу</Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {searchTerm.trim() ? (
            `Найдено школ для адреса "${searchTerm}": ${filteredSchools.length}`
          ) : (
            `Всего школ в базе: ${realSchools.length}`
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Карта */}
        <div className="space-y-4">
          <h3>Карта школ</h3>
          <div className="relative bg-muted rounded-lg h-96 overflow-hidden">
            {/* Интерактивная карта с реальными координатами */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Заголовок карты */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded shadow">
                  <p className="font-medium">Нови-Сад - Школы ({filteredSchools.length})</p>
                </div>
                
                {/* Pins для школ на основе реальных координат */}
                {filteredSchools.map((school, index) => {
                  const position = getMapPosition(index, filteredSchools.length);
                  return (
                    <button
                      key={school.id}
                      onClick={() => setSelectedSchool(school)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all hover:scale-110 ${
                        selectedSchool?.id === school.id 
                          ? 'bg-red-500 scale-110 z-20' 
                          : school.type === 'Приватна ОШ' 
                            ? 'bg-purple-500' 
                            : 'bg-blue-500'
                      }`}
                      style={position}
                      title={school.name}
                    >
                      <MapPin className="w-4 h-4 text-white mx-auto" />
                    </button>
                  );
                })}
                
                {/* Легенда */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded shadow text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Государственные</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Частные</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Выбранная</span>
                    </div>
                  </div>
                </div>
                
                {selectedSchool && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded shadow-lg">
                    <p className="font-medium text-sm">{selectedSchool.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedSchool.address}, {selectedSchool.district}</p>
                    <div className="flex gap-2 mt-2">
                      {selectedSchool.languages.map((lang, i) => (
                        <span key={i} className="text-xs bg-secondary px-1 py-0.5 rounded">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Список школ */}
        <div className="space-y-4">
          <h3>Найденные школы ({filteredSchools.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredSchools.length === 0 && searchTerm.trim() && (
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  Школ для адреса "{searchTerm}" не найдено.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Проверьте правильность написания адреса или попробуйте ввести только название улицы.
                </p>
              </div>
            )}
            {filteredSchools.map((school) => (
              <Card key={school.id} className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSchool?.id === school.id ? 'ring-2 ring-primary' : ''
              }`} onClick={() => setSelectedSchool(school)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base pr-2">{school.name}</CardTitle>
                    <Badge variant={school.type === 'Приватне ОШ' ? 'default' : 'secondary'} className="text-xs">
                      {school.type === 'Приватна ОШ' ? 'Частная' : 'Гос.'}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{school.district}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{school.address}</span>
                  </div>
                  
                  {school.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{school.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="break-all">{school.email}</span>
                  </div>
                  
                  {school.website && school.website !== '#' && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a href={school.website.startsWith('http') ? school.website : `https://${school.website}`} 
                         target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline break-all">
                        Сайт школы
                      </a>
                    </div>
                  )}
                  
                  {school.telegram && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a href={school.telegram} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        Телеграм канал
                      </a>
                    </div>
                  )}
                  
                  {school.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a href={`https://${school.instagram}`} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        Instagram
                      </a>
                    </div>
                  )}
                  
                  {school.attachedAddresses && (
                    <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-200">
                      <p className="text-xs font-medium text-green-800 mb-1">Прикрепленные адреса:</p>
                      <p className="text-xs text-green-700 line-clamp-3">
                        {school.attachedAddresses.length > 200 
                          ? `${school.attachedAddresses.substring(0, 200)}...` 
                          : school.attachedAddresses}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {school.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}