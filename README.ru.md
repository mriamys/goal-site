<p align="center">
  <a href="README.md">🇬🇧 English</a> • <b>🇷🇺 Русский</b> • <a href="README.uk.md">🇺🇦 Українська</a>
</p>

# GOAL — Трекер финансовых целей и накоплений

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#стек-технологий)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](#стек-технологий)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](#стек-технологий)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](#стек-технологий)
[![SQLite](https://img.shields.io/badge/SQLite-Knex-003B57?logo=sqlite&logoColor=white)](#стек-технологий)

Фуллстек веб-приложение для учёта финансовых целей, визуализации прогресса накоплений и истории пополнений с фронтендом на React и бэкендом на Express + SQLite.

---

## Обзор

**GOAL** позволяет создавать карточки целей (с названием, целевой суммой, валютой и обложкой по URL), фиксировать пополнения с выбором даты, редактировать и удалять транзакции с автоматическим пересчётом баланса, а также скачивать резервную копию базы данных SQLite прямо из шапки интерфейса.

---

## Возможности

- **Управление целями** — создание, редактирование и удаление финансовых целей (`title`, `target_amount`, `current_amount`, `currency` по умолчанию `UAH`, опциональный `image_url`).
- **Анимированный прогресс** — расчёт процента выполнения (`0%–100%`) с плавным прогресс-баром на Framer Motion.
- **История пополнений и транзакций** — внесение депозитов с датой, редактирование и удаление отдельных операций с атомарным пересчётом `current_amount` через `db.transaction`.
- **Экспорт базы данных** — скачивание файла `data.sqlite` в один клик через `GET /api/download-db`.
- **Автоинициализация БД** — автоматическое создание таблиц `goals` и `transactions` (с `ON DELETE CASCADE`) при запуске сервера.

---

## Стек технологий

- **Фронтенд (`client/`):** React 19, TypeScript, Vite 8, Framer Motion, Lucide React
- **Бэкенд (`server/`):** Node.js, Express 5, TypeScript (`ts-node`), Knex, `sqlite3`, CORS, `dotenv`
- **CI/CD:** GitHub Actions (SSH-деплой)

---

## API-эндпоинты

| Метод | Эндпоинт | Описание |
| :--- | :--- | :--- |
| `GET` | `/api/goals` | Получить список всех целей |
| `POST` | `/api/goals` | Создать новую цель |
| `PUT` | `/api/goals/:id` | Обновить параметры цели или `current_amount` |
| `DELETE` | `/api/goals/:id` | Удалить цель вместе с её транзакциями |
| `POST` | `/api/goals/:id/deposit` | Добавить пополнение с датой и увеличить `current_amount` |
| `GET` | `/api/goals/:id/transactions` | Получить историю транзакций цели |
| `PUT` | `/api/transactions/:id` | Изменить транзакцию и пересчитать баланс цели |
| `DELETE` | `/api/transactions/:id` | Удалить транзакцию и уменьшить `current_amount` |
| `GET` | `/api/download-db` | Скачать файл базы данных (`data.sqlite`) |

---

## Установка и запуск

### Переменные окружения (`server/.env`)
При необходимости переопределить порт создайте файл `server/.env`:

```env
PORT=3001
```

### Локальная разработка

1. **Запуск бэкенда (`server/`):**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   По умолчанию сервер слушает порт `3001` (для запуска без watch-режима используйте `npm start`).

2. **Запуск фронтенда (`client/`):**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Примечание: клиент обращается к API по префиксу `/api`, поэтому на сервере (или через прокси) маршрутизируйте `/api/*` на бэкенд (`:3001`).

### Сборка и автодеплой
- Сборка фронтенда в `client/dist/`:
  ```bash
  cd client
  npm run build
  ```
- В [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) настроен автодеплой при пуше в `main` по SSH (`SSH_HOST`, `SSH_PASSWORD`): сборка `client/` в `/var/www/goal-site-client/`, обновление `server/` и перезапуск systemd-сервиса `goal-site`.

---

## Структура проекта

```text
.
├── .github/workflows/deploy.yml   # GitHub Actions workflow автодеплоя
├── client/
│   ├── public/                    # Статические иконки
│   ├── src/
│   │   ├── App.tsx                # Основной UI на React, модалки и API-запросы
│   │   ├── App.css                # Стили приложения
│   │   ├── index.css              # Базовые стили
│   │   └── main.tsx               # Точка входа React
│   ├── index.html                 # HTML-шаблон
│   ├── package.json               # Зависимости и скрипты клиента
│   └── vite.config.ts             # Конфигурация Vite
├── server/
│   ├── src/
│   │   ├── db.ts                  # Подключение Knex + SQLite и схема БД
│   │   └── index.ts               # Express REST API сервер
│   ├── package.json               # Зависимости и скрипты сервера
│   └── tsconfig.json              # Конфигурация TypeScript
├── LICENSE                        # Лицензия Apache-2.0
└── NOTICE                         # Уведомление об авторстве
```

---

## Лицензия и авторство

Проект распространяется под лицензией **Apache License, Version 2.0** — см. [LICENSE](LICENSE) и [NOTICE](NOTICE).

Если проект вам пригодился, сделайте **Fork** на GitHub и оставьте ссылку на [https://github.com/mriamys/goal-site](https://github.com/mriamys/goal-site).
