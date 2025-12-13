import { defineConfig } from 'vite'

export default defineConfig({
  // Базовый путь для деплоя (если проект будет размещаться в поддиректории)
  base: './',
  
  // Настройки сервера разработки
  server: {
    // Автоматическое открытие браузера
    open: true,
    // Порт для dev-сервера (по умолчанию 5173)
    port: 5173,
    // Разрешить доступ с других устройств в локальной сети
    host: true
  },
  
  // Настройки сборки
  build: {
    // Имя выходной директории
    outDir: 'dist',
    // Имя файла manifest
    manifest: true,
    // Минификация кода в production
    minify: true,
    // Отчет о размере бандлов
    reportCompressedSize: true
  }
})