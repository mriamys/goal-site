<p align="center">
  <a href="README.md">🇬🇧 English</a> • <a href="README.ru.md">Русский</a> • <b>🇺🇦 Українська</b>
</p>

# GOAL — Трекер фінансових цілей і накопичень

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#стек-технологій)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](#стек-технологій)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](#стек-технологій)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](#стек-технологій)
[![SQLite](https://img.shields.io/badge/SQLite-Knex-003B57?logo=sqlite&logoColor=white)](#стек-технологій)

Фулстек вебзастосунок для обліку фінансових цілей, візуалізації прогресу накопичень та історії поповнень із фронтендом на React і бекендом на Express + SQLite.

---

## Огляд

**GOAL** дозволяє створювати картки цілей (із назвою, цільовою сумою, валютою та обкладинкою за URL), фіксувати поповнення з вибором дати, редагувати й видаляти транзакції з автоматичним перерахунком балансу, а також завантажувати резервну копію бази даних SQLite безпосередньо з шапки інтерфейсу.

---

## Можливості

- **Керування цілями** — створення, редагування та видалення фінансових цілей (`title`, `target_amount`, `current_amount`, `currency` за замовчуванням `UAH`, опційний `image_url`).
- **Анімований прогрес** — підрахунок відсотка виконання (`0%–100%`) із плавним прогрес-баром на Framer Motion.
- **Історія поповнень і транзакцій** — внесення депозитів із датою, редагування та видалення окремих операцій з атомарним перерахунком `current_amount` через `db.transaction`.
- **Експорт бази даних** — завантаження файлу `data.sqlite` в один клік через `GET /api/download-db`.
- **Автоініціалізація БД** — автоматичне створення таблиць `goals` і `transactions` (з `ON DELETE CASCADE`) під час запуску сервера.

---

## Стек технологій

- **Фронтенд (`client/`):** React 19, TypeScript, Vite 8, Framer Motion, Lucide React
- **Бекенд (`server/`):** Node.js, Express 5, TypeScript (`ts-node`), Knex, `sqlite3`, CORS, `dotenv`
- **CI/CD:** GitHub Actions (SSH-деплой)

---

## API-ендпоїнти

| Метод | Ендпоїнт | Опис |
| :--- | :--- | :--- |
| `GET` | `/api/goals` | Отримати список усіх цілей |
| `POST` | `/api/goals` | Створити нову ціль |
| `PUT` | `/api/goals/:id` | Оновити параметри цілі або `current_amount` |
| `DELETE` | `/api/goals/:id` | Видалити ціль разом із її транзакціями |
| `POST` | `/api/goals/:id/deposit` | Додати поповнення з датою та збільшити `current_amount` |
| `GET` | `/api/goals/:id/transactions` | Отримати історію транзакцій цілі |
| `PUT` | `/api/transactions/:id` | Змінити транзакцію та перерахувати баланс цілі |
| `DELETE` | `/api/transactions/:id` | Видалити транзакцію та зменшити `current_amount` |
| `GET` | `/api/download-db` | Завантажити файл бази даних (`data.sqlite`) |

---

## Встановлення та запуск

### Змінні середовища (`server/.env`)
За потреби перевизначити порт створіть файл `server/.env`:

```env
PORT=3001
```

### Локальна розробка

1. **Запуск бекенду (`server/`):**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   За замовчуванням сервер слухає порт `3001` (для запуску без watch-режиму використовуйте `npm start`).

2. **Запуск фронтенду (`client/`):**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Примітка: клієнт звертається до API за префіксом `/api`, тому на сервері (або через проксі) маршрутизуйте `/api/*` на бекенд (`:3001`).

### Збірка та автодеплой
- Збірка фронтенду в `client/dist/`:
  ```bash
  cd client
  npm run build
  ```
- У [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) налаштовано автодеплой під час пушу в `main` по SSH (`SSH_HOST`, `SSH_PASSWORD`): збірка `client/` у `/var/www/goal-site-client/`, оновлення `server/` та перезапуск systemd-сервісу `goal-site`.

---

## Структура проєкту

```text
.
├── .github/workflows/deploy.yml   # GitHub Actions workflow автодеплою
├── client/
│   ├── public/                    # Статичні іконки
│   ├── src/
│   │   ├── App.tsx                # Основний UI на React, модалки та API-запити
│   │   ├── App.css                # Стилі застосунку
│   │   ├── index.css              # Базові стилі
│   │   └── main.tsx               # Точка входу React
│   ├── index.html                 # HTML-шаблон
│   ├── package.json               # Залежності та скрипти клієнта
│   └── vite.config.ts             # Конфігурація Vite
├── server/
│   ├── src/
│   │   ├── db.ts                  # Підключення Knex + SQLite і схема БД
│   │   └── index.ts               # Express REST API сервер
│   ├── package.json               # Залежності та скрипти сервера
│   └── tsconfig.json              # Конфігурація TypeScript
├── LICENSE                        # Ліцензія Apache-2.0
└── NOTICE                         # Повідомлення про авторство
```

---

## Ліцензія та авторство

Проєкт поширюється за ліцензією **Apache License, Version 2.0** — див. [LICENSE](LICENSE) і [NOTICE](NOTICE).

Якщо проєкт став у пригоді, зробіть **Fork** на GitHub і залиште посилання на [https://github.com/mriamys/goal-site](https://github.com/mriamys/goal-site).
