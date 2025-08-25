import React, { useState } from 'react';
import { SchoolSearch } from './components/SchoolSearch';
import { OfficialDocuments } from './components/OfficialDocuments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { MapPin, FileText, School } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <School className="w-8 h-8 text-primary" />
            <div>
              <h1>Поиск школ Нови-Сада</h1>
              <p className="text-muted-foreground">
                Найдите подходящую школу для вашего ребенка в Нови-Саде
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Поиск школ
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Документы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardContent className="p-6">
                <SchoolSearch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                <OfficialDocuments />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4>Контакты</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Министерство образования АП Воеводина</p>
                <p>📞 +381 21 487-4362</p>
                <p>📧 info@obrazovanje.vojvodina.rs</p>
              </div>
            </div>
            <div>
              <h4>Полезные ссылки</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground">
                  Официальный сайт города Нови-Сад
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">
                  Министерство образования Сербии
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">
                  Электронная запись в школы
                </a>
              </div>
            </div>
            <div>
              <h4>О сервисе</h4>
              <p className="text-sm text-muted-foreground">
                Этот сервис поможет вам найти подходящую школу в Нови-Саде 
                и получить всю необходимую информацию для поступления.
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Поиск школ Нови-Сада. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}